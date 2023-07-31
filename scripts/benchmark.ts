import { ethers } from "ethers";
import { displayGasCostsMatrix } from "./utils/utils";
import { fundAccount } from "./utils/fundingUtils";
import {
  finalizePrices,
  registerDataProviders,
  updatePrices,
} from "./oracleOps";
import { networks } from "./networks";

// fund amount in ETH for each data provider
const FUND_AMOUNT = ".01";

// Create new data providers
const dataProviders = Array(3)
  .fill(null)
  .map(() => new ethers.Wallet(ethers.Wallet.createRandom().privateKey));

let gasCosts: any = {};

async function main() {
  for (let networkConfig of networks) {
    gasCosts[networkConfig.name] = {};

    // Initialize Network
    console.log(`\nDeploying on: ${networkConfig.name}`);
    const provider = new ethers.providers.JsonRpcProvider(
      networkConfig.rpcEndpoint,
    );
    const deployer = new ethers.Wallet(networkConfig.richWalletPK).connect(
      provider,
    );
    const connectedWallets = dataProviders.map((wallet) =>
      wallet.connect(provider),
    );

    // Deploy the contract
    const contract = await networkConfig.deployFunc(networkConfig, deployer);
    gasCosts[networkConfig.name].deploy = contract.gas;

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

  displayGasCostsMatrix(gasCosts, networks);
}

main().catch(console.error);
