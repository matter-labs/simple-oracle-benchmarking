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
        zksync: true,
      }
    : {
        // TODO: change to testnet
        url: "http://localhost:3050",
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
  defaultNetwork: "zkSyncTestnet",
  networks: {
    hardhat: {
      zksync: false,
    },
    zkSyncTestnet,
    optimismTestnet: {
      url: "https://goerli.optimism.io",
      chainId: 5, 
    },
    polygonMumbaiTestnet: {
      url: "https://polygon-mumbai-bor.publicnode.com",
      chainId: 80001, 
    },
    polygonzkEVMTestnet: {
      url: "https://rpc.public.zkevm-test.net",
      chainId: 1442, 
    },
    arbitrumTestnet: {
      url: "https://endpoints.omniatech.io/v1/arbitrum/goerli/public",
      chainId: 421613, 
    },
  },
  solidity: {
    version: "0.8.17",
  },
};

export default config;
