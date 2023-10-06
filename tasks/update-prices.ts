import { ethers } from 'ethers';
import { WalletManager } from '../utils/fundingUtils';

const fetchContractABI = () => {
  const ContractArtifact = require('../artifacts-zk/contracts/SimpleOracle.sol/SimpleOracle.json');
  return ContractArtifact.abi;
};

const updatePriceForWallet = async (wallet: ethers.Wallet, contractInstance: ethers.Contract, results: Record<string, any>, endTime: number) => {
  results[wallet.address] = {
    txCount: 0,
    costs: [],
    totalGas: ethers.BigNumber.from(0),
  };

  const withSigner = contractInstance.connect(wallet);
  
  console.log(`🔄 Price updates beginning for wallet ${wallet.address}`);
  console.log('');
  
  while (Date.now() < endTime) {
    const randomPrice = Math.floor(Math.random() * 1000);
    const tx = await withSigner.updatePrice(randomPrice);
    const receipt = await tx.wait();
    const { gasUsed } = receipt;

    const cost = gasUsed.mul(await wallet.provider.getGasPrice());

    results[wallet.address].costs.push(cost);
    results[wallet.address].txCount++;
    results[wallet.address].totalGas = results[wallet.address].totalGas.add(cost);

    console.log(`🔹 ${wallet.address} price update ${randomPrice}. 📍 Tx Hash: ${tx.hash} ⛽ Gas used: ${gasUsed}`);
  }
};

module.exports = async function(taskArgs: any, hre: any) {
  const { contract, duration } = taskArgs;
  const wallets = WalletManager.getConnectedWallets();
  const endTime = Date.now() + duration * 60 * 1000;
  const results: Record<string, any> = {};
  
  console.log("\n------------------------------------------------------------");
  console.log(`\n🚀 Price updates starting for ${wallets.length} data providers for ${duration} minutes\n`);

  await Promise.all(wallets.map((wallet) => {
    return updatePriceForWallet(wallet, new ethers.Contract(contract, fetchContractABI(), wallet), results, endTime);
  }));
  
  const totalUpdates = Object.values(results).reduce((acc, walletData: any) => acc + walletData.txCount, 0);
  const totalGas = Object.values(results).reduce((acc, walletData: any) => acc.add(walletData.totalGas), ethers.BigNumber.from(0));
  
  console.log(`\n✅ Price updates completed. ${totalUpdates} updates made from ${wallets.length} data providers. Total gas used: ${totalGas} or ${ethers.utils.formatEther(totalGas)} ETH`);
};