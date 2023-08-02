import { HardhatUserConfig } from "hardhat/config";

import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";
import "hardhat-gas-reporter";

// dynamically changes endpoints for local tests
const zkSyncTestnet =
  process.env.NODE_ENV == "test"
    ? {
        url: "http://localhost:8011",
        ethNetwork: "http://localhost:8545",
        zksync: true,
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
  defaultNetwork: "zkSyncLocalnet",
  networks: {
    hardhat: {
      zksync: false,
    },
    zkSyncLocalnet: {
      url: "http://localhost:3050",
      chainId: 270, 
      ethNetwork: "goerli",
      zksync: true,
    },
    zkSyncTestnet: {
      url: "https://zksync2-testnet.zksync.dev",
      ethNetwork: "goerli",
      zksync: true,
      chainId: 280, 
    },
    zkSyncEraMainnet: {
      url: "https://mainnet.era.zksync.io",
      ethNetwork: "mainnet",
      zksync: true,
      chainId: 324, 
    },
    optimismLocalNet: {
      url: "http://localhost:9545",
      chainId: 901, 
    },
    optimismTestnet: {
      url: "https://goerli.optimism.io",
      chainId: 5, 
    },
    OptimismMainnet: {
      url: "https://optimism.publicnode.com",
      chainId: 10, 
    },
    polygonzkEVMTestnet: {
      url: "https://rpc.public.zkevm-test.net",
      chainId: 1442, 
    },
    polygonzkEVMLocalNet: {
      url: "http://localhost:9091",
      chainId: 1001,
    },
    PolygonzkEVMMainnet: {
      url: "https://1rpc.io/polygon/zkevm",
      chainId: 1101,
    },
    arbitrumLocalDev : {
      url: 'http://localhost:8547',
      chainId: 412346,
    },
    arbitrumTestnet: {
      url: "https://endpoints.omniatech.io/v1/arbitrum/goerli/public",
      chainId: 421613, 
    },
    ArbitrumMainnet: {
      url: "https://endpoints.omniatech.io/v1/arbitrum/one/public",
      chainId: 42161, 
    },
  },
  solidity: {
    version: "0.8.17",
  },
};

export default config;
