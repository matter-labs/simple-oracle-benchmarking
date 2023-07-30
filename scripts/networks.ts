import { deployZkSyncLocalTestnet, deployOptimismTestnet } from "./utils/deploymentUtils";
import dotenv from "dotenv";
dotenv.config();

// Network Configuration
export const networks = [
    {
        name: "zkSyncLocalTestnet",
        // rpcEndpoint: "https://testnet.era.zksync.dev",
        rpcEndpoint: "http://localhost:3050",
        richWalletPK: process.env.ZK_WALLET_PRIVATE_KEY || "",
        deployFunc: deployZkSyncLocalTestnet
    },
    // {
    //     name: "OptimismTestnet",
    //     rpcEndpoint: "https://goerli.optimism.io",
    //     richWalletPK: process.env.ZK_WALLET_PRIVATE_KEY || "",
    //     deployFunc: deployOptimismTestnet
    // }
    // ... add more networks as required
];