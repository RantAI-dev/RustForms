# ---- Stage 1: The Builder ----
# Use the official Rust image as a build environment.
FROM rust:1.79-slim as builder

# Set the working directory
WORKDIR /usr/src/rustforms

# Copy the entire monorepo context to leverage Nx caching
COPY . .

# Build the API in release mode using Nx's runner
# This creates an optimized binary.
RUN npx nx run api:build --skip-nx-cache

# ---- Stage 2: The Final Image ----
# Use a minimal, secure base image for the final container.
FROM debian:12-slim

# Set the working directory
WORKDIR /usr/src/rustforms

# Copy the compiled binary from the 'builder' stage.
COPY --from=builder /usr/src/rustforms/dist/apps/api/api .

# Expose the port the app runs on.
EXPOSE 3001

# The command to run when the container starts.
CMD ["./api"]