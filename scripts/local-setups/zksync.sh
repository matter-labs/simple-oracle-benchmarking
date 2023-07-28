#!/bin/bash

# Script to start a local zkSync node on macOS

# Ensure required components are installed
echo "Checking and installing required components..."

# Install Homebrew if not already installed
if ! command -v brew &>/dev/null; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install Docker and docker-compose if not already installed
if ! command -v docker &>/dev/null; then
    brew install --cask docker
fi

if ! command -v docker-compose &>/dev/null; then
    brew install docker-compose
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

# Clone the zkSync local setup repository if not already cloned
if [ ! -d "local-setup" ]; then
    git clone https://github.com/matter-labs/local-setup.git
fi
cd local-setup

# Update the geth ports and ETH_CLIENT_WEB3_URL in docker-compose.yml
# sed -i '' 's/8545:8545/9656:9656/' docker-compose.yml
# sed -i '' 's/8546:8546/9636:9636/' docker-compose.yml
# sed -i '' 's/ETH_CLIENT_WEB3_URL=http:\/\/geth:8545/ETH_CLIENT_WEB3_URL=http:\/\/geth:9656/' docker-compose.yml

# Start the local zkSync node
echo "Resetting state..."
./clear.sh
echo "Starting the local zkSync node..."
./start.sh

# Note: 
# To reset the zkSync state, you can use: ./clear.sh
