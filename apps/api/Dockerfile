# Optimized Dockerfile for RustForms API (Cargo-based build)
# This replaces the Nx-based build with direct Cargo for better performance

# ---- Stage 1: Rust Build Environment ----
FROM rust:1.76-slim as builder

# Install required dependencies for compilation
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /usr/src/rustforms

# Copy dependency files first for better layer caching
COPY Cargo.toml Cargo.lock ./
COPY apps/api/Cargo.toml ./apps/api/

# Create a dummy main.rs to cache dependencies
RUN mkdir -p apps/api/src && \
    echo "fn main() {}" > apps/api/src/main.rs

# Build dependencies (this layer will be cached unless Cargo.toml changes)
RUN cargo build --manifest-path apps/api/Cargo.toml --release

# Remove dummy source
RUN rm -rf apps/api/src

# Copy actual source code
COPY apps/api/src ./apps/api/src

# Build the actual application
RUN cargo build --manifest-path apps/api/Cargo.toml --release

# ---- Stage 2: Runtime Environment ----
FROM debian:12-slim

# Install only essential runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create a non-root user for security
RUN groupadd -r rustforms && useradd -r -g rustforms rustforms

# Create app directory
WORKDIR /app

# Copy the compiled binary from builder stage
COPY --from=builder /usr/src/rustforms/target/release/api ./api

# Change ownership to non-root user
RUN chown rustforms:rustforms /app/api

# Switch to non-root user
USER rustforms

# Expose the port
EXPOSE 3001

# Set the startup command
CMD ["./api"]