#!/bin/bash

# Steps to run/develop on the environment locally

# Check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Clone the zkevm-node repository if it doesn't exist
if [ ! -d "zkevm-node" ]; then
    echo "Cloning the zkevm-node repository..."
    git clone https://github.com/0xPolygonHermez/zkevm-node.git
    cd zkevm-node
else
    echo "zkevm-node directory already exists. Navigating to it..."
    cd zkevm-node
fi

# Check for requirements
if ! command_exists go; then
    echo "Go is not installed. Please install it from https://go.dev/doc/install"
    exit 1
fi

if ! command_exists docker; then
    echo "Docker is not installed. Please install it from https://www.docker.com/get-started"
    exit 1
fi

if ! command_exists docker-compose; then
    echo "Docker Compose is not installed. Please install it from https://docs.docker.com/compose/install/"
    exit 1
fi

# Build the zkevm-node docker image if not built
docker images | grep zkevm-node &> /dev/null
if [ $? -ne 0 ]; then
    echo "Building the zkevm-node docker image..."
    make build-docker
fi

# Navigate to the test directory
cd test/

# Run the environment
echo "Running the environment..."
make run

# Instructions for stopping, restarting, and deploying sample data
echo "To stop the environment, run: make stop"
echo "To restart the environment, run: make restart"
echo "To deploy sample smart contracts, run: make deploy-sc"
echo "To deploy a full uniswap environment, run: make deploy-uniswap"
echo "To grant the Matic smart contract a set amount of tokens, run: make run-approve-matic"

# Accessing the environment details are provided in the documentation.
# Users can refer to them as needed.

# Metamask configuration details are also provided in the documentation.
# Users can follow the steps to configure Metamask for the local environment.

echo "Setup complete. Please refer to the provided documentation for further details and instructions."
