import { ethers } from "ethers";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { displayGasCostsMatrix } from "../utils/utils";
import { fundAccount } from "../utils/fundingUtils";
import {
  finalizePrices,
  registerDataProviders,
  updatePrices,
} from "./oracleOps";
import { networks } from "./networks";
import dotenv from "dotenv";
dotenv.config();

// fund amount in ETH for each data provider
const FUND_AMOUNT = ".004";
export const DATA_PROVIDER_COUNT = 3;

const argv = yargs(hideBin(process.argv)).option("network", {
  type: "string",
  description: "Specify the network to test with",
}).argv;

// Filter networks based on the provided argument
// TODO: fix this to work well with hardhat run
const filteredNetworks = networks.filter((network) => {
  switch (argv.network) {
    case "testnet":
      return network.name.includes("Testnet");
    case "mainnet":
      return network.name.includes("Mainnet");
    default:
      return network.name === argv.network;
  }
});

// Create new data providers
const dataProviders = Array(DATA_PROVIDER_COUNT)
  .fill(null)
  .map(() => new ethers.Wallet(ethers.Wallet.createRandom().privateKey));

let gasCosts: any = {};

async function main() {
  for (let networkConfig of filteredNetworks) {
    gasCosts[networkConfig.name] = {};

    // Initialize Network
    console.log(`\nDeploying on: ${networkConfig.name}`);
    console.log("Initializing network: ", networkConfig.rpcEndpoint);
    const provider = new ethers.providers.JsonRpcProvider(
      networkConfig.rpcEndpoint,
    );
    const deployer = new ethers.Wallet(networkConfig.richWalletPK).connect(
      provider,
    );
    const connectedWallets = dataProviders.map((wallet) =>
      wallet.connect(provider),
    );
    // TODO: save gas used sooner
    // Deploy the contract
    const contract = await networkConfig.deployFunc(networkConfig, deployer);
    gasCosts[networkConfig.name].deploy = {
      gas: contract.gas,
      gasUsed: contract.gasUsed,
      deltaBalance: contract.deltaBalance,
    };

    // Fund data providers
    console.log("\nFunding data providers: ");
    await fundAccount(deployer, dataProviders[0].address, FUND_AMOUNT);
    await fundAccount(deployer, dataProviders[1].address, FUND_AMOUNT);
    await fundAccount(deployer, dataProviders[2].address, FUND_AMOUNT);

    // Register data providers
    console.log("\nRegistering data providers: ");
    gasCosts[networkConfig.name].register = await registerDataProviders(
      contract.address,
      networkConfig.rpcEndpoint,
      connectedWallets,
    );

    // Update prices
    const balances = await Promise.all(
      connectedWallets.map((wallet) => wallet.getBalance()),
    );
    console.log(
      "\nBalance of dataProviders before updatePrice: ",
      balances.map(ethers.utils.formatEther),
    );
    console.log("Updating prices: ");
    gasCosts[networkConfig.name].update = await updatePrices(
      contract.address,
      networkConfig.rpcEndpoint,
      connectedWallets,
    );
    console.log("\nFinalizing price: ");
    gasCosts[networkConfig.name].finalize = await finalizePrices(
      contract.address,
      networkConfig.rpcEndpoint,
      deployer,
    );
  }

  displayGasCostsMatrix(gasCosts, filteredNetworks);
}

main().catch(console.error);
