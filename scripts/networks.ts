import {
  deployZkSyncLocalTestnet,
  deployOptimismTestnet,
} from "./utils/deploymentUtils";
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
 *
 * Uncomment/add more network objects as required to expand support.
 */
export const networks = [
  // TODO: make this easy to switch between local and testnet and mainnet
  {
    name: "zkSyncTestnet",
    rpcEndpoint: "http://localhost:3050",
    // rpcEndpoint: "https://testnet.era.zksync.dev",
    richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
    deployFunc: deployZkSyncLocalTestnet,
  },
  //   {
  //     name: "OptimismTestnet",
  //     rpcEndpoint: "https://goerli.optimism.io",
  //     richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
  //     deployFunc: deployOptimismTestnet,
  //   },
  //   {
  //     name: "polygonzkEVMTestnet",
  //     rpcEndpoint: "https://rpc.public.zkevm-test.net",
  //     richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
  //     deployFunc: deployOptimismTestnet,
  //   },
  //   {
  //     name: "polygonMumbaiTestnet",
  //     rpcEndpoint: "https://polygon-mumbai-bor.publicnode.com",
  //     richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
  //     deployFunc: deployOptimismTestnet,
  //   },
  //   {
  //     name: "arbitrumTestnet",
  //     rpcEndpoint: "https://endpoints.omniatech.io/v1/arbitrum/goerli/public",
  //     richWalletPK: process.env.WALLET_PRIVATE_KEY || "",
  //     deployFunc: deployOptimismTestnet,
  //   },
];
