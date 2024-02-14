import dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";

import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";
import "hardhat-gas-reporter";
import "hardhat-deploy";
import "hardhat-deploy-ethers";

import './tasks';

const config: HardhatUserConfig = {
  zksolc: {
    version: "latest",
    settings: {},
  },
  solidity: {
    compilers: [
        {
            version: "0.8.20",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                },
            },
        },
    ],
},
  defaultNetwork: "zksync-local",
  networks: {
    hardhat: {
      zksync: false,
    },
    "zksync-local": {
      url: "http://localhost:3050",
      chainId: 270,
      ethNetwork: "goerli",
      zksync: true,
      accounts: [process.env.LOCAL_ZKSYNC_KEY || ""],
    },
    "zksync-goerli": {
      url: "https://zksync2-testnet.zksync.dev",
      ethNetwork: "goerli",
      zksync: true,
      chainId: 280,
      accounts: [process.env.TESTNET_KEY || ""],
    },
    "zksync-sepolia": {
      url: "https://sepolia.era.zksync.dev",
      ethNetwork: "sepolia",
      zksync: true,
      chainId: 300,
      accounts: [process.env.TESTNET_KEY || ""],
    },
    zksync: {
      url: "https://mainnet.era.zksync.io",
      ethNetwork: "mainnet",
      zksync: true,
      chainId: 324,
      accounts: [process.env.MAINNET_KEY || ""],
    },
    "optimism-local": {
      url: "http://localhost:9545",
      chainId: 901,
      accounts: [process.env.LOCAL_OPTIMISM_KEY || ""], 
    },
    "optimism-goerli": {
      url: "https://optimism-goerli.publicnode.com",
      chainId: 420,
      accounts: [process.env.TESTNET_KEY || ""],
    },
    "optimism-sepolia": {
      url: `https://optimism-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 11155420,
      accounts: [process.env.TESTNET_KEY || ""],
    },
    optimism: {
      url: "https://optimism.publicnode.com",
      chainId: 10,
      accounts: [process.env.MAINNET_KEY || ""],
    },
    "polygonzk-local": {
      url: "http://localhost:9091",
      chainId: 1001,
      accounts: [process.env.LOCAL_POLYGONZK_KEY || ""],
    },
    "polygonzkevm-testnet": {
      url: "https://rpc.ankr.com/polygon_zkevm_testnet",
      chainId: 1442,
      accounts: [process.env.TESTNET_KEY || ""],
    },
    polygonzk: {
      url: "https://polygon-zkevm-mainnet.public.blastapi.io	",
      chainId: 1101,
      accounts: [process.env.MAINNET_KEY || ""],
    },
    "arbitrum-local": {
      url: 'http://localhost:8547',
      chainId: 412346,
      accounts: [process.env.LOCAL_ARBITRUM_KEY || ""],
    },
    "arbitrum-goerli": {
      url: "https://arbitrum-goerli.publicnode.com",
      chainId: 421613,
      accounts: [process.env.TESTNET_KEY || ""],
    },
    "arbitrum-sepolia": {
      url: `https://arbitrum-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 421614,
      accounts: [process.env.TESTNET_KEY || ""],
    },
    arbitrum: {
      url: "https://arbitrum-one.public.blastapi.io",
      chainId: 42161, 
      accounts: [process.env.MAINNET_KEY || ""],
    },
    "linea-goerli": {
      url: `https://linea-goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 59140,
      accounts: [process.env.TESTNET_KEY || ""],
    },
    linea: {
      url: `https://linea-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 59144,
      accounts: [process.env.MAINNET_KEY || ""],
    },
    "scroll-sepolia": {
      url: "https://rpc.ankr.com/scroll_sepolia_testnet",
      chainId: 534351,
      accounts: [process.env.TESTNET_KEY || ""],
    },
    scroll: {
      url: "https://rpc.ankr.com/scroll",
      chainId: 534352,
      accounts: [process.env.TESTNET_KEY || ""],
    },
  },
};

export default config;
