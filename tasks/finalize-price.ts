import { ethers } from "ethers";
import { WalletManager, fetchContractABI } from "../utils/utils";
import GasTracker, { getGasTracker } from "../utils/gasTracker";

const finalizePrice = async (
  wallet: ethers.Wallet,
  contractAddress: string,
  gasTracker: GasTracker,
  networkName: string,
) => {
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

  console.log("🏷️  Price Successfully Finalized:", await contract.getPrice());
};

module.exports = async function (taskArgs: any, hre: any) {
  const { contract } = taskArgs;
  const wallets = WalletManager.getConnectedWallets();
  const gasTracker = getGasTracker();

  const selectedWallet = wallets[0];
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
    `- Total Gas Cost: ${ethers.utils.formatEther(
      gasTracker.finalize.totalGasCost.toString(),
    )} ETH`,
  );
  console.log(
    `- Total Delta Balance: ${ethers.utils.formatEther(
      gasTracker.finalize.totalBalanceDifference.toString(),
    )} ETH`,
  );

  console.log("\n------------------------------------------------------------");
  // Display gas tracker data as table
  const tableStr = gasTracker.displayDataAsTable(hre.network.name);
  console.log('\n', tableStr);
};
