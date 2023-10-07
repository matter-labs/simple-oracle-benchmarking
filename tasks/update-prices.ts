import { ethers } from 'ethers';
import { WalletManager } from '../utils/utils';
import GasTracker, { getGasTracker } from '../utils/gasTracker';

const fetchContractABI = () => {
  const ContractArtifact = require('../artifacts-zk/contracts/SimpleOracle.sol/SimpleOracle.json');
  return ContractArtifact.abi;
};

const updatePriceForWallet = async (wallet: ethers.Wallet, contractInstance: ethers.Contract, gasTracker: GasTracker, endTime: number, totalUpdates: { count: number }) => {
  const withSigner = contractInstance.connect(wallet);
  const startBalance = await wallet.provider.getBalance(wallet.address);

  console.log(`🔄 Price updates beginning for wallet ${wallet.address}`);
  console.log('');
  
  while (Date.now() < endTime) {
    const randomPrice = Math.floor(Math.random() * 1000);
    const tx = await withSigner.updatePrice(randomPrice);
    const receipt = await tx.wait();
    totalUpdates.count++;
    const { gasUsed } = receipt;
    console.log(`🔹 ${wallet.address} price update ${randomPrice}. 📍 Tx Hash: ${tx.hash} ⛽ Gas used: ${gasUsed}`);
    gasTracker.updatingPrices.totalGasUsed = gasTracker.updatingPrices.totalGasUsed.add(gasUsed);
    // Track gas cost and balance difference
    let gasPrice =
    receipt.effectiveGasPrice || (await wallet.provider.getGasPrice());
    // NOTE: gasPrice may cause inaccurate gas cost calculations
    const gasCost = gasUsed.mul(gasPrice);
    const endBalance = await wallet.provider.getBalance(wallet.address);
    const balanceDifference = startBalance.sub(endBalance);

    gasTracker.updatingPrices.totalGasCost = gasTracker.updatingPrices.totalGasCost.add(gasCost);
    gasTracker.updatingPrices.totalBalanceDifference = gasTracker.updatingPrices.totalBalanceDifference.add(balanceDifference);
    gasTracker.updatingPrices.perDataProvider.push({
      address: wallet.address,
      gasUsed,
      gasCost,
      balanceDifference
    });
  }    
}

module.exports = async function(taskArgs: any, hre: any) {
  const { contract, duration } = taskArgs;
  // Fetch wallets
  const wallets = WalletManager.getConnectedWallets();
  // Fetch GasTracker
  const gasTracker = getGasTracker();
  const endTime = Date.now() + duration * 60 * 1000;
  const totalUpdates = { count: 0 };
  
  console.log("\n------------------------------------------------------------");
  console.log(`\n🚀 Price updates starting for ${wallets.length} data providers for ${duration} minutes\n`);

  await Promise.all(wallets.map((wallet) => {
    return updatePriceForWallet(wallet, new ethers.Contract(contract, fetchContractABI(), wallet), gasTracker, endTime, totalUpdates);
  }));

  console.log(`\n✅ Price Update Summary:`);
  console.log(`- Total Updates: ${totalUpdates.count}`);
  console.log(`- Data Providers Involved: ${wallets.length}`);
  console.log(`- Total Gas Used: ${gasTracker.getTotalGasUsedFormatted('updatingPrices')} (in wei)`);
  console.log(`- Total Gas Cost: ${gasTracker.getTotalGasCostFormatted('updatingPrices')} ETH`);
  console.log(`- Total Balance Difference: ${gasTracker.getTotalBalanceDifferenceFormatted('updatingPrices')} ETH`);
};