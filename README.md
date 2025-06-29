<div align="center">

# 🦀 RustForms

**A lightning-fast, secure, and beautiful form builder built with Rust and Next.js**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Built with Rust](https://img.shields.io/badge/Built%20with-Rust-orange.svg)](https://www.rust-lang.org/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black.svg)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Deploy-Docker-blue.svg)](https://www.docker.com/)

*Born from passion, powered by innovation*

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🐳 Docker Deployment](#-docker-deployment) • [🤝 Contributing](#-contributing)

</div>

---

## 🌟 About RustForms

RustForms is a modern, open-source form builder that combines the performance of Rust with the elegance of React. What started as a fun side project by a passionate developer has evolved into a production-ready solution, thanks to RantAI's unique approach to innovation.

### 🎯 **The RantAI Story**

At [RantAI](https://rantai.dev), we believe in empowering our team members to pursue their creative passions. Our unique approach allows employees to develop side projects that, when they show promise, can become official RantAI products with shared ownership between the creator and the company. RustForms is a perfect example of this philosophy in action - what began as an individual's creative exploration has blossomed into a comprehensive solution that we're proud to share with the open-source community.

### ✨ **Why RustForms?**

- **🚀 Blazing Fast**: Rust-powered backend delivers sub-millisecond response times
- **🔒 Security First**: Memory-safe Rust eliminates entire classes of vulnerabilities
- **🎨 Beautiful UI**: Modern, responsive interface built with Next.js and Tailwind CSS
- **🐳 Easy Deploy**: One-command Docker deployment for effortless self-hosting
- **📱 Mobile Ready**: Responsive design that works perfectly on all devices
- **🔧 Developer Friendly**: Comprehensive API, excellent documentation, and great DX

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **Rust** 1.76+ 
- **PostgreSQL** 14+
- **Docker** (optional, for containerized deployment)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/rantai/rustforms.git
cd rustforms

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and configuration

# Run database migrations
cargo run --bin migrate

# Start the development servers
pnpm nx dev web-ui    # Frontend (http://localhost:3000)
pnpm nx run api       # Backend (http://localhost:3001)
```

### 🐳 Docker Deployment (Recommended)

For the fastest setup experience:

```bash
# Clone and configure
git clone https://github.com/rantai/rustforms.git
cd rustforms
cp .env.example .env
# Edit .env with your configuration

# One-command deployment
./deploy.sh
```

**That's it!** 🎉 RustForms will be running at http://localhost:3000

> 📖 **Detailed deployment guide**: [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

## 🏗️ Architecture

RustForms is built as a modern, full-stack application:

### **Backend (Rust)**
- **Framework**: [Axum](https://github.com/tokio-rs/axum) - Fast, ergonomic web framework
- **Database**: PostgreSQL with [SQLx](https://github.com/launchbadge/sqlx) for compile-time SQL checking
- **Authentication**: JWT-based with secure password hashing (Argon2)
- **API Documentation**: OpenAPI/Swagger with [utoipa](https://github.com/juhaku/utoipa)
- **Email**: SMTP integration for form notifications

### **Frontend (Next.js)**
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with [shadcn/ui](https://ui.shadcn.com/) components
- **State Management**: React Query for server state
- **Type Safety**: Full TypeScript coverage
- **Authentication**: Secure JWT handling with context providers

### **Infrastructure**
- **Monorepo**: Nx workspace for unified development experience
- **Containerization**: Optimized Docker setup for production deployment
- **Database**: PostgreSQL with performance tuning
- **Reverse Proxy**: Nginx configuration for production (optional)

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [🐳 Docker Deployment Guide](./DOCKER_DEPLOYMENT.md) | Complete self-hosting instructions |
| [🔧 API Analysis](./API_ANALYSIS.md) | Comprehensive API endpoint documentation |
| [🎨 UI Feature Guide](./BLUR_OVERLAY_GUIDE.md) | Feature management and UI components |
| [📋 Swagger Implementation](./SWAGGER_IMPLEMENTATION.md) | API documentation setup |

## ⚡ Features

### **Current Features**
- ✅ **User Authentication** - Secure registration, login, and session management
- ✅ **Form Creation** - Intuitive drag-and-drop form builder
- ✅ **Form Management** - Edit, duplicate, delete, and organize forms
- ✅ **Responsive Design** - Beautiful UI that works on all devices
- ✅ **Docker Deployment** - One-command setup for self-hosting
- ✅ **API Documentation** - Auto-generated Swagger/OpenAPI docs

### **Coming Soon** 🚧
- 📊 **Form Analytics** - Detailed submission statistics and insights
- 🔗 **Form Sharing** - Public/private sharing with access controls
- 📧 **Email Notifications** - Automated responses and notifications
- 🎨 **Theme Customization** - Custom branding and styling options
- 📱 **Mobile App** - Native mobile applications
- 🔌 **Webhooks** - Integration with external services
- 🌍 **Multi-language** - Internationalization support

## 🛠️ Development

### **Project Structure**

```
rustforms/
├── apps/
│   ├── api/          # Rust backend (Axum + SQLx)
│   └── web-ui/       # Next.js frontend
├── docker/           # Docker configuration files
├── docs/            # Documentation
└── deploy.sh        # One-command deployment script
```

### **Development Commands**

```bash
# Development
pnpm nx dev web-ui              # Start frontend dev server
pnpm nx run api                 # Start backend dev server
pnpm nx graph                   # Visualize project dependencies

# Building
pnpm nx build web-ui            # Build frontend for production
pnpm nx build api               # Build backend for production

# Testing
pnpm nx test api                # Run backend tests
pnpm nx lint web-ui             # Lint frontend code

# Database
cargo run --bin migrate         # Run database migrations
cargo run --bin seed            # Seed database with sample data
```

### **API Development**

The Rust backend provides a comprehensive REST API:

```bash
# Start the API server
pnpm nx run api

# View API documentation
open http://localhost:3001/swagger-ui
```

**Key API Features:**
- 🔐 JWT Authentication
- 📝 CRUD operations for forms and submissions
- 📊 Analytics endpoints
- 📧 Email notification system
- 🔍 Advanced filtering and search

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### **Getting Started**

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run the test suite**: `pnpm nx test api`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to your branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### **Development Guidelines**

- Follow Rust best practices and run `cargo clippy`
- Use TypeScript for all frontend code
- Add tests for new features
- Update documentation for API changes
- Follow the existing code style and conventions

### **Community**

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/rantai/rustforms/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/rantai/rustforms/discussions)
- 💬 **General Chat**: [RantAI Discord](https://discord.gg/rantai)

## 📄 License

RustForms is open source software licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](./LICENSE).

This means:
- ✅ **Freedom to use**: Use RustForms for any purpose
- ✅ **Freedom to study**: Access and modify the source code
- ✅ **Freedom to share**: Distribute copies to help others
- ✅ **Freedom to improve**: Distribute modified versions
- ⚠️ **Network use requirement**: If you run RustForms as a service, you must provide the source code to users

> **Note**: The AGPL-3.0 license ensures that improvements to RustForms benefit the entire community, even when the software is used to provide network services.

## 🙏 Acknowledgments

- **Creator**: Built with passion by a RantAI team member
- **RantAI**: For fostering innovation and supporting open source
- **Community**: Thanks to all contributors and users
- **Open Source**: Built on amazing open source technologies

---

<div align="center">

**Made with ❤️ by [RantAI](https://rantai.dev)**

*Empowering developers to build amazing things*

[🌟 Star us on GitHub](https://github.com/rantai/rustforms) • [🐦 Follow RantAI](https://twitter.com/rantai_dev) • [🌐 Visit RantAI](https://rantai.dev)

</div>
