import { HardhatUserConfig } from "hardhat/config";

import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";
import "hardhat-gas-reporter";

// dynamically changes endpoints for local tests
const zkSyncTestnet =
  process.env.NODE_ENV == "test"
    ? {
        url: "http://localhost:3050",
        ethNetwork: "http://localhost:8545",
        zksync: false,
      }
    : {
        url: "https://testnet.era.zksync.dev",
        ethNetwork: "goerli",
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
    zkSyncLocalTestnet: {
      url: "http://localhost:3050",
      ethNetwork: "http://localhost:8545",
      zksync: true,
    }
    // zkSyncTestnet: {
    //   url: "https://testnet.era.zksync.dev",
    //   ethNetwork: "goerli",
    //   zksync: true,
    //   // contract verification endpoint
    //   verifyURL:
    //     "https://zksync2-testnet-explorer.zksync.dev/contract_verification",
    // },
    // optimismTestnet: {
    //   url: "https://goerli.optimism.io",
    //   chainId: 5, 
    //   gasPrice: 15000000,
    //   accounts: {
    //     mnemonic: "e567ef46a79037a72fc1e564294ab8d4dedc2794878c9a0b72e67c74163e4174", // Replace with your mnemonic or private key
    //   },
    // },
  },
  solidity: {
    version: "0.8.17",
  },
};

export default config;
