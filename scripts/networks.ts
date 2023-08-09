import { deployToZkSync, deployToTestnet } from "./utils/deploymentUtils";
import dotenv from "dotenv";
dotenv.config();

/**
 * An array representing supported networks and their associated configurations.
 *
 * Each network object contains:
 * - `name`: The unique identifier of the network.
 * - `rpcEndpoint`: The RPC endpoint URL to connect to the network.
 * - `richWalletPK`: The private key of a rich wallet. The key is fetched from environment variables (see .env.example).
 * - `deployFunc`: The function responsible for deploying contracts to the respective network.
 */
export const networks = [
  {
    name: "zkSyncLocalnet",
    rpcEndpoint: "http://localhost:3050",
    richWalletPK: process.env.ZK_WALLET_PRIVATE_KEY || "",
    deployFunc: deployToZkSync,
  },
  {
    name: "zkSyncEraTestnet",
    rpcEndpoint: "https://zksync2-testnet.zksync.dev",
    richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
    deployFunc: deployToZkSync,
  },
  {
    name: "zkSyncEraMainnet",
    rpcEndpoint: "https://mainnet.era.zksync.io",
    richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
    deployFunc: deployToZkSync,
  },
  {
    name: "PolygonzkEVMLocalnet",
    rpcEndpoint: "http://localhost:9091",
    richWalletPK: process.env.POLY_WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
  {
    name: "PolygonzkEVMTestnet",
    rpcEndpoint: "https://rpc.public.zkevm-test.net",
    richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
  {
    name: "PolygonzkEVMMainnet",
    rpcEndpoint: "https://polygon-zkevm-mainnet.public.blastapi.io",
    richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
  {
    name: "OptimismLocalnet",
    rpcEndpoint: "http://localhost:9545",
    richWalletPK: process.env.OP_WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
  {
    name: "OptimismTestnet",
    rpcEndpoint: "https://goerli.optimism.io",
    richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
  {
    name: "OptimismMainnet",
    rpcEndpoint: "https://optimism.publicnode.com",
    richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
  {
    name: "ArbitrumLocalnet",
    rpcEndpoint: "http://localhost:8547",
    richWalletPK: process.env.ARB_WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
  {
    name: "ArbitrumTestnet",
    rpcEndpoint: "https://endpoints.omniatech.io/v1/arbitrum/goerli/public",
    richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
  {
    name: "ArbitrumMainnet",
    rpcEndpoint: "https://arbitrum-one.public.blastapi.io",
    richWalletPK: process.env.WALLET_ARB_PRIVATE || "",
    deployFunc: deployToTestnet,
  },
  {
    name: "LineaTestnet",
    rpcEndpoint: "https://rpc.goerli.linea.build/",
    richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
  {
    name: "LineaMainnet",
    rpcEndpoint: "https://linea-mainnet.infura.io/v3",
    richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
  {
    name: "ScrollTestnet",
    rpcEndpoint: "https://alpha-rpc.scroll.io/l2",
    richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
];
