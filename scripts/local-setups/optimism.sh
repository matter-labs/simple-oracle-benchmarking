#!/bin/bash

# Script to start a local optimism node on macOS

# Ensure required components are installed
echo "Checking and installing required components..."

# Install Homebrew if not already installed
if ! command -v brew &>/dev/null; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install jq if not already installed
if ! command -v jq &>/dev/null; then
    echo "Installing jq..."
    brew install jq
fi

# Install Go programming language if not already installed
if ! command -v go &>/dev/null; then
    echo "Installing Go..."
    brew install go
fi

# Install Docker if not already installed
# Note: This will install Docker Desktop, which includes both Docker Engine and Docker Compose
if ! command -v docker &>/dev/null; then
    echo "Installing Docker..."
    brew install --cask docker
fi

# Start Docker Desktop if it's not running
if ! docker info >/dev/null 2>&1; then
    open /Applications/Docker.app
    # Wait for Docker to start
    while ! docker info >/dev/null 2>&1; do
        echo "Waiting for Docker to start..."
        sleep 5
    done
fi

# Clone the Optimism monorepo if not already cloned
if [ ! -d "optimism" ]; then
    git clone https://github.com/ethereum-optimism/optimism.git
fi
cd optimism

# Start the local development node
echo "Starting the local development node..."
make devnet-up

# Note: 
# To stop the node, you can use: make devnet-down
# To clean everything, you can use: make devnet-clean

