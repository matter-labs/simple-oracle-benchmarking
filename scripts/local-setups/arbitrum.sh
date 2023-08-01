#!/bin/bash

# This script helps in setting up and running a local Arbitrum Nitro dev node.

# 1. Install prerequisites
# Ensure you have docker and docker-compose installed on your system.
# If not, please follow the instructions on their official sites to install them.

# 2. Clone the nitro-testnode repo
if [ ! -d "nitro-testnode" ]; then
    git clone -b release --recurse-submodules https://github.com/OffchainLabs/nitro-testnode.git
    cd nitro-testnode
else
    echo "nitro-testnode directory already exists. Skipping clone step."
    cd nitro-testnode
fi

# 3. Run your node
./test-node.bash --init

# 4. Successive runs
# To relaunch the node after the first installation, run the following command.
# Note: Running with the --init flag will clear all chain data and redeploy!
# ./test-node.bash 

# Helper scripts
# The repository includes a set of helper scripts for basic actions like funding accounts or bridging funds.
# You can see a list of the available scripts by running:
# ./test-node.bash script --help

# To see information of a particular script, you can add the name of the script to the help command.
# Example: ./test-node.bash script send-l1 --help

# To run the script that funds an address on L2, replace the address placeholder with the address you want to fund.
# ./test-node.bash script send-l2 --to address_0x11223344556677889900 --ethamount 5

# Blockscout
# Nitro comes with a local Blockscout block explorer. To access it, add the param --blockscout when running your node.
# ./test-node.bash --blockscout
# The block explorer will be available at http://localhost:4000

# Default endpoints and addresses are provided in the documentation.
# You can refer to them as needed.

# To get the core contracts, use the provided docker and curl commands.

echo "Setup complete. Please refer to the comments in the script for further instructions."
