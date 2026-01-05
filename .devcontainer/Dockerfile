FROM mcr.microsoft.com/devcontainers/typescript-node:22-bookworm

# Install additional OS packages if needed
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    curl \
    git \
    openssh-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory for dependency installation
WORKDIR /tmp/deps

# Copy package files for dependency installation (reduces postCreateCommand memory usage)
COPY package.json pnpm-lock.yaml ./

# Install dependencies at build time with reduced memory footprint
# Using --ignore-scripts to avoid running postinstall scripts that may fail without full context
RUN pnpm install --frozen-lockfile --ignore-scripts 2>/dev/null || pnpm install --ignore-scripts

# Reset workdir (will be set by devcontainer)
WORKDIR /workspaces
