FROM mcr.microsoft.com/devcontainers/typescript-node:22-bookworm

# Install additional OS packages if needed
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    curl \
    git \
    openssh-client

# Install pnpm
RUN npm install -g pnpm
