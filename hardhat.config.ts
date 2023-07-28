import { HardhatUserConfig } from "hardhat/config";

import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";
import "hardhat-gas-reporter";

// dynamically changes endpoints for local tests
const zkSyncLocalTestnet =
  process.env.NODE_ENV == "test"
    ? {
        url: "http://localhost:9545",
        ethNetwork: "http://localhost:8545",
        zksync: false,
      }
    : {
        url: "https://testnet.era.zksync.dev",
        ethNetwork: "Goerli",
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
  defaultNetwork: "zkSyncTestnet",
  networks: {
    hardhat: {
      zksync: false,
    },
    zkSyncTestnet: {
      url: "https://testnet.era.zksync.dev",
      ethNetwork: "goerli",
      zksync: true,
    },
    optimismTestnet: {
      url: "https://goerli.optimism.io",
      chainId: 5, 
      gasPrice: 15000000,
      accounts: {
        mnemonic: "", // Replace with your mnemonic or private key
      },
    },
  },
  solidity: {
    version: "0.8.17",
  },
};

export default config;
