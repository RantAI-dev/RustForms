#!/bin/bash

# RustForms Docker Deployment Script
# This script sets up and deploys RustForms using Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check for docker compose (newer) or docker-compose (legacy)
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Using: $COMPOSE_CMD"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_warning "Please edit .env file with your configuration before running again."
            exit 1
        else
            print_error ".env.example file not found. Cannot create .env file."
            exit 1
        fi
    fi
}

# Build and start services
deploy() {
    print_status "Starting RustForms deployment..."
    
    # Pull latest images for base services
    print_status "Pulling base Docker images..."
    $COMPOSE_CMD -f docker-compose.optimized.yml pull postgres
    
    # Build the application images
    print_status "Building RustForms application images..."
    $COMPOSE_CMD -f docker-compose.optimized.yml build --parallel
    
    # Start the services
    print_status "Starting services..."
    $COMPOSE_CMD -f docker-compose.optimized.yml up -d
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    
    # Check database health
    for i in {1..30}; do
        if $COMPOSE_CMD -f docker-compose.optimized.yml exec -T postgres pg_isready -U rustforms -d rustforms_db > /dev/null 2>&1; then
            print_success "Database is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Database failed to start within 5 minutes"
            exit 1
        fi
        sleep 10
    done
    
    # Check API health
    for i in {1..20}; do
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            print_success "API is ready!"
            break
        fi
        if [ $i -eq 20 ]; then
            print_error "API failed to start within 3 minutes"
            exit 1
        fi
        sleep 9
    done
    
    # Check Web UI health
    for i in {1..15}; do
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            print_success "Web UI is ready!"
            break
        fi
        if [ $i -eq 15 ]; then
            print_error "Web UI failed to start within 2 minutes"
            exit 1
        fi
        sleep 8
    done
    
    print_success "🎉 RustForms is now running!"
    echo ""
    echo "Services available at:"
    echo "  📱 Web UI: http://localhost:3000"
    echo "  🔧 API: http://localhost:3001"
    echo "  🗄️  Database: localhost:5432"
    echo ""
    echo "To view logs: $COMPOSE_CMD -f docker-compose.optimized.yml logs -f"
    echo "To stop: $COMPOSE_CMD -f docker-compose.optimized.yml down"
    echo "To update: ./deploy.sh --rebuild"
}

# Handle command line arguments
case "${1:-}" in
    --rebuild)
        print_status "Rebuilding and redeploying..."
        $COMPOSE_CMD -f docker-compose.optimized.yml down
        $COMPOSE_CMD -f docker-compose.optimized.yml build --no-cache --parallel
        deploy
        ;;
    --stop)
        print_status "Stopping RustForms..."
        $COMPOSE_CMD -f docker-compose.optimized.yml down
        print_success "RustForms stopped"
        ;;
    --logs)
        $COMPOSE_CMD -f docker-compose.optimized.yml logs -f
        ;;
    --status)
        $COMPOSE_CMD -f docker-compose.optimized.yml ps
        ;;
    --help)
        echo "RustForms Deployment Script"
        echo ""
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Options:"
        echo "  (no option)   Deploy RustForms"
        echo "  --rebuild     Rebuild and redeploy"
        echo "  --stop        Stop all services"
        echo "  --logs        Show logs"
        echo "  --status      Show service status"
        echo "  --help        Show this help message"
        ;;
    "")
        check_docker
        check_env
        deploy
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac
