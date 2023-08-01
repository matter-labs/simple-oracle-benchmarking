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
<<<<<<< Updated upstream
    name: "zkSyncTestnet",
    // rpcEndpoint: "http://localhost:8011",
=======
    name: "zkSyncLocalnet",
    rpcEndpoint: "http://localhost:3050",
    richWalletPK: process.env.ZK_WALLET_PRIVATE_KEY || "",
    deployFunc: deployToZkSync,
  },
  {
    name: "zkSyncEraTestnet",
>>>>>>> Stashed changes
    rpcEndpoint: "https://testnet.era.zksync.dev",
    richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
    deployFunc: deployToZkSync,
  },
  {
<<<<<<< Updated upstream
=======
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
    rpcEndpoint: "https://1rpc.io/polygon/zkevm",
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
>>>>>>> Stashed changes
    name: "OptimismTestnet",
    rpcEndpoint: "https://goerli.optimism.io",
    richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
  {
<<<<<<< Updated upstream
    name: "polygonzkEVMTestnet",
    rpcEndpoint: "https://rpc.public.zkevm-test.net",
=======
    name: "OptimismMainnet",
    rpcEndpoint: "https://optimism.publicnode.com",
>>>>>>> Stashed changes
    richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
  {
<<<<<<< Updated upstream
    name: "polygonMumbaiTestnet",
    rpcEndpoint: "https://polygon-mumbai-bor.publicnode.com",
    richWalletPK: process.env.PERSONAL_WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
  {
    name: "arbitrumTestnet",
=======
    name: "ArbitrumLocalnet",
    rpcEndpoint: "http://localhost:8547",
    richWalletPK: process.env.ARB_WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
  {
    name: "ArbitrumTestnet",
>>>>>>> Stashed changes
    rpcEndpoint: "https://endpoints.omniatech.io/v1/arbitrum/goerli/public",
    richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
<<<<<<< Updated upstream
=======
  {
    name: "ArbitrumMainnet",
    rpcEndpoint: "https://endpoints.omniatech.io/v1/arbitrum/one/public",
    richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
    deployFunc: deployToTestnet,
  },
>>>>>>> Stashed changes
];
