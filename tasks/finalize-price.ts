import { ethers } from "ethers";
import {
  WalletManager,
  fetchContractABI,
  transferRemainingFunds,
  L1_RPC_URL,
} from "../utils/utils";
import GasTracker, { getGasTracker } from "../utils/gasTracker";

const finalizePrice = async (
  wallet: ethers.Wallet,
  contractAddress: string,
  gasTracker: GasTracker,
  networkName: string,
) => {
  const l1Provider = new ethers.providers.JsonRpcProvider(L1_RPC_URL);
  const l1gasPrice = await l1Provider.getGasPrice();
  const contract = new ethers.Contract(
    contractAddress,
    fetchContractABI(networkName),
    wallet,
  );
  const startingBalance = await wallet.getBalance();
  const tx = await contract.finalizePrice();
  const receipt = await tx.wait();
  const { gasUsed } = receipt;

  let gasPrice =
    receipt.effectiveGasPrice || (await wallet.provider.getGasPrice());
  const cost = gasUsed.mul(gasPrice);
  const afterBalance = await wallet.getBalance();
  const deltaBalance = startingBalance.sub(afterBalance);

  gasTracker.finalize.totalGasCost = gasTracker.finalize.totalGasCost.add(cost);
  gasTracker.finalize.totalGasUsed =
    gasTracker.finalize.totalGasUsed.add(gasUsed);
  gasTracker.finalize.totalBalanceDifference =
    gasTracker.finalize.totalBalanceDifference.add(deltaBalance);

  gasTracker.finalize.perDataProvider.push({
    address: wallet.address,
    gasUsed,
    gasCost: cost,
    balanceDifference: deltaBalance,
  });
  gasTracker.finalize.l2gasPrice = gasPrice;
  gasTracker.finalize.l1gasPrice = l1gasPrice;

  console.log("🏷️  Price Successfully Finalized:", await contract.getPrice());
};

module.exports = async function (taskArgs: any, hre: any) {
  const { contract } = taskArgs;
  // withdraw remaining funds from these wallets (dataProviders) to the deployer wallet
  const wallets = WalletManager.getConnectedWallets();
  const provider = new ethers.providers.JsonRpcProvider(hre.network.config.url);
  const accounts = hre.network.config.accounts || [];
  const deployerAccount = accounts[0];
  const selectedWallet = new ethers.Wallet(deployerAccount).connect(provider);

  const gasTracker = getGasTracker();

  if (!selectedWallet) {
    console.log("No wallet found to finalize the price.");
    return;
  }
  console.log("\n------------------------------------------------------------");
  console.log("🪄 Finalizing price with wallet:", selectedWallet.address);
  await finalizePrice(selectedWallet, contract, gasTracker, hre.network.name);

  console.log(`\n✅ Finalize Price Summary:`);
  console.log("- Data Providers Involved: 1");
  console.log(
    `- Total Gas Used: ${gasTracker.finalize.totalGasUsed.toString()} (in wei)`,
  );
  console.log(
    `- Total Gas Used: ${gasTracker.getTotalGasUsedFormatted(
      "finalize",
    )} (in wei)`,
  );
  console.log(
    `- Total Balance Difference: ${gasTracker.getTotalBalanceDifferenceFormatted(
      "finalize",
    )} ETH`,
  );
  console.log("- L2 Gas Price:", gasTracker.getL2GasPriceFormatted("finalize"));
  console.log("- L1 Gas Price:", gasTracker.getL1GasPriceFormatted("finalize"));

  console.log("\n------------------------------------------------------------");
  // Display gas tracker data as table
  const tableStr = gasTracker.displayDataAsTable(hre.network.name);
  console.log("\n", tableStr);

  // Transfer remaining funds from data provider wallets to deployer wallet
  await transferRemainingFunds(selectedWallet, wallets, provider);
};
