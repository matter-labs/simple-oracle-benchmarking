import { HardhatUserConfig } from "hardhat/config";

import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";

import "@matterlabs/hardhat-zksync-verify";
import "hardhat-gas-reporter"

// dynamically changes endpoints for local tests
const zkSyncLocalTestnet =
  process.env.NODE_ENV == "test"
    ? {
        url: "http://localhost:3050",
        ethNetwork: "http://localhost:8545",
        zksync: true,
      }
    : {
        url: "http://localhost:3050",
        ethNetwork: "http://localhost:8545",
        zksync: true,
        // contract verification endpoint
        verifyURL:
          "https://zksync2-testnet-explorer.zksync.dev/contract_verification",
      };

const config: HardhatUserConfig = {
  zksolc: {
    version: "latest",
    settings: {},
  },
  defaultNetwork: "zkSyncLocalTestnet",
  networks: {
    hardhat: {
      zksync: false,
    },
    zkSyncLocalTestnet,
  },
  solidity: {
    version: "0.8.17",
  },
};

export default config;
