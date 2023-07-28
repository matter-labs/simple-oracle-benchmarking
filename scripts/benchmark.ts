import { Wallet, Provider, Contract } from "zksync-web3";
import { ethers } from "ethers";
import { deployContract, registerDataProviders, updatePrices } from "./utils";
import dotenv from "dotenv";
dotenv.config();

const FUND_AMOUNT = ".01";
// Network Configuration
const networks = [
    {
        name: "zkSyncLocalTestnet",
        rpcEndpoint: "https://testnet.era.zksync.dev",
        richWalletPK: process.env.ZK_WALLET_PRIVATE_KEY || "",
        deployFunc: deployZkSyncLocalTestnet
    },
    {
        name: "OptimismTestnet",
        rpcEndpoint: "https://goerli.optimism.io",
        richWalletPK: process.env.ZK_WALLET_PRIVATE_KEY || "",
        deployFunc: deployOptimismTestnet
    }
    // ... add more networks as required
];

// Create new data providers
// TODO: works fine for dev setup where we can fund the data providers with the rich wallet
// for testnet and mainnet deployments we need to have pre-funded data provider wallets available
const dataProvider1 = new ethers.Wallet(ethers.Wallet.createRandom().privateKey);
const dataProvider2 = new ethers.Wallet(ethers.Wallet.createRandom().privateKey);
const dataProvider3 = new ethers.Wallet(ethers.Wallet.createRandom().privateKey);
let wallets = [dataProvider1, dataProvider2, dataProvider3];

let gasCosts: any = {};
interface DeployedContract {
    address: string;
    gas: number;
}

async function deployZkSyncLocalTestnet(networkConfig: any, deployer: ethers.Wallet): Promise<DeployedContract> {
    let zkProvider = new Provider(networkConfig.rpcEndpoint);
    let zkWallet = new Wallet(networkConfig.richWalletPK, zkProvider);
    let zkDeployer = zkWallet.connect(zkProvider);
    let contract = await deployContract(networkConfig.rpcEndpoint, zkDeployer);
    console.log("Contract deployed to", contract.address);
    return contract;
}

async function deployOptimismTestnet(networkConfig: any, deployer: ethers.Wallet): Promise<DeployedContract> {
    console.log("Deploying to Optimism Testnet")
    let contract = await deployContract(networkConfig.rpcEndpoint, deployer);
    console.log("Contract deployed to", contract.address);
    return contract;
}

async function fundAccount(wallet: ethers.Wallet, address: string, amount: string) {
    await (
      await wallet.sendTransaction({
        to: address,
        value: ethers.utils.parseEther(amount),
      })
    ).wait();
}

async function main() {
    for (let networkConfig of networks) {
        gasCosts[networkConfig.name] = {};

        // Initialize Network
        console.log(`Deploying on: ${networkConfig.name}`);
        const provider = new ethers.providers.JsonRpcProvider(networkConfig.rpcEndpoint);
        const deploymentWallet = new ethers.Wallet(networkConfig.richWalletPK);
        const deployer = deploymentWallet.connect(provider);
        
        // Connect wallets to the current provider
        wallets.forEach(wallet => wallet.connect(provider));

        wallets = wallets.map(wallet => wallet.connect(provider));
        // Deploy the contract
        const contract = await networkConfig.deployFunc(networkConfig, deployer);
        
        gasCosts[networkConfig.name].deploy = contract.gas;

        // Fund data providers
        console.log("Funding data providers");
        await fundAccount(deployer, dataProvider1.address, FUND_AMOUNT);
        await fundAccount(deployer, dataProvider2.address, FUND_AMOUNT);
        await fundAccount(deployer, dataProvider3.address, FUND_AMOUNT);
        
        // Register data providers
        console.log("Registering data providers");
        gasCosts[networkConfig.name].register = await registerDataProviders(contract.address, networkConfig.rpcEndpoint, wallets);

        console.log("before updatePrice balances: ", await Promise.all(wallets.map(async wallet => ethers.utils.formatEther(await wallet.getBalance()))));
        // Update prices
        console.log("Updating prices");
        gasCosts[networkConfig.name].update = await updatePrices(contract.address, networkConfig.rpcEndpoint, wallets);
        
        // ... finalize prices or any other operations
    }

    displayGasCostsMatrix(gasCosts, networks);

    // // Display the gas costs
    // console.log("Gas Costs:");
    // for (let network of networks) {
    //     console.log(`Network: ${network}`);
    //     console.log(`Deploy: ${ethers.utils.formatEther(gasCosts[network.name].deploy.toString())} ETH`);
    //     console.log(`Register: ${ethers.utils.formatEther(gasCosts[network.name].register)} ETH`);

    //     const updateIndividualProviders = gasCosts[network.name].update.individualCosts;
    //     const updateTotalCost = gasCosts[network.name].update.totalGasCost;

    //     console.log("Update costs:");
    //     for (const dataProvider in updateIndividualProviders) {
    //         console.log(`  ${dataProvider} (Tx Count: ${updateIndividualProviders[dataProvider].txCount}):`);
    //         const costsArray = updateIndividualProviders[dataProvider].costs;
    //         let providerTotal = ethers.BigNumber.from(0);
    //         for (let i = 0; i < costsArray.length - 1; i++) {
    //             console.log(`Operation ${i + 1}: ${ethers.utils.formatEther(costsArray[i].toString())} ETH`);
    //             providerTotal = providerTotal.add(ethers.BigNumber.from(costsArray[i]));
    //         }
    //         console.log(`Total for ${dataProvider}: ${ethers.utils.formatEther(providerTotal.toString())} ETH`);
    //     }
    //     console.log(`Update Total for all providers: ${ethers.utils.formatEther(updateTotalCost.toString())} ETH`);

    //     // Uncomment the line below if you also have a 'finalize' key in gasCosts
    //     // console.log(`  Finalize: ${ethers.utils.formatEther(gasCosts[network].finalize)} ETH`);
    // }
}

// Gas costs summary matrix
export function displayGasCostsMatrix(gasCosts, networks) {
    console.log("\n========= Gas Costs Matrix =========");
    const header = ['Network', 'Deploy Cost', 'Register Cost', 'updatePrice Cost', 'cost per updatePrice call', '# of txs', 'Total Cost'];
    console.log(header.join('\t'));

    const networkData = [];

    for (let network of networks) {
        const deployCost = ethers.utils.formatEther(gasCosts[network.name].deploy.toString());
        const registerCost = ethers.utils.formatEther(gasCosts[network.name].register);

        const updateIndividualProviders = gasCosts[network.name].update.individualCosts;
        const updateTotalCost = ethers.utils.formatEther(gasCosts[network.name].update.totalGasCost.toString());

        let totalTxs = 0;
        let avgCostPerUpdate = ethers.BigNumber.from(0);

        for (const dataProvider in updateIndividualProviders) {
            totalTxs += updateIndividualProviders[dataProvider].txCount;
            avgCostPerUpdate = avgCostPerUpdate.add(updateIndividualProviders[dataProvider].totalGas);
        }
        avgCostPerUpdate = avgCostPerUpdate.div(totalTxs);
        const totalCost = ethers.utils.formatEther(gasCosts[network.name].deploy.add(gasCosts[network.name].register).add(gasCosts[network.name].update.totalGasCost).toString());

        networkData.push([network.name, deployCost, registerCost, updateTotalCost, ethers.utils.formatEther(avgCostPerUpdate.toString()), totalTxs, totalCost]);
    }

    for (const row of networkData) {
        console.log(row.join('\t'));
    }
    
    // Calculate Delta (difference between the two networks)
    if (networkData.length === 2) {
        const deltas = ['Delta'];
        for (let i = 1; i < networkData[0].length; i++) {
            deltas.push((parseFloat(networkData[0][i]) - parseFloat(networkData[1][i])).toFixed(5));
        }
        console.log(deltas.join('\t'));
    }

    console.log("===================================\n");
}

main().catch(console.error);
