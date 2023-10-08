import { ethers } from "ethers";
import { fundAccount, WalletManager } from "../utils/utils";
import { getGasTracker } from "../utils/gasTracker";

// To run:
// npx hardhat benchmark-simple-oracle --contract <SimpleOracleContractAddress> --target-network <networkName> --data-provider-count 4 --fund-amount ".005"

const fetchContractABI = () => {
    const ContractArtifact = require("../artifacts-zk/contracts/SimpleOracle.sol/SimpleOracle.json");
    return ContractArtifact.abi;
};

module.exports = async function(taskArgs, hre) {
  const { contract, dataProviderCount = 3, fundAmount = ".004", duration = 1 } = taskArgs;
  // Initialize the GasTracker instance
  const gasTracker = getGasTracker();
  
  const provider = new ethers.providers.JsonRpcProvider(hre.network.config.url);
  const accounts = hre.network.config.accounts || [];
  const deployerAccount = accounts[0];
  const deployerWallet = new ethers.Wallet(deployerAccount).connect(provider);
  
  // Create new data providers
  const dataProviders = Array(Number(dataProviderCount))
    .fill(null)
    .map(() => new ethers.Wallet(ethers.Wallet.createRandom().privateKey));

  const connectedWallets = dataProviders.map((wallet) => wallet.connect(provider));
  WalletManager.updateConnectedWallets(connectedWallets);

  // Fund data providers
  console.log("💰 Funding data providers...");
  for (const dataProvider of dataProviders) {
    await fundAccount(deployerWallet, dataProvider.address, fundAmount);
  }

  const contractInstance = new ethers.Contract(
    contract,
    fetchContractABI(),
    connectedWallets[0]
  );

  // Register data providers
  console.log("\n🗳️  Registering data providers...");
  let totalGasCost = ethers.BigNumber.from(0);
  let totalBalanceDifference = ethers.BigNumber.from(0); 
  for (const wallet of connectedWallets) {
    const startBalance = await provider.getBalance(wallet.address);
    const tx = await contractInstance.connect(wallet).registerDataProvider();
    const receipt = await tx.wait();
    console.log(`📝 Registered data provider ${wallet.address} 📍 Tx Hash: ${tx.hash}`);

    // Track gas cost and balance difference
    const endBalance = await provider.getBalance(wallet.address);
    let gasPrice =
    receipt.effectiveGasPrice || (await wallet.provider.getGasPrice());
    gasTracker.registering.totalGasUsed = gasTracker.registering.totalGasUsed.add(receipt.gasUsed);
    // NOTE: gasPrice may cause inaccurate gas cost calculations
    const gasCost = gasPrice.mul(receipt.gasUsed);
    const balanceDifference = startBalance.sub(endBalance);

    totalGasCost = totalGasCost.add(gasCost);
    totalBalanceDifference = totalBalanceDifference.add(balanceDifference);
    gasTracker.registering.perDataProvider.push({
      address: wallet.address,
      gasUsed: receipt.gasUsed,
      gasCost,
      balanceDifference,
    });
    totalGasCost = totalGasCost.add(gasCost);
  }
  gasTracker.registering.totalBalanceDifference = totalBalanceDifference;
  gasTracker.registering.totalGasCost = totalGasCost;

  console.log(`\n✅ Data Provider Registration Summary:`);
  console.log(`- Data Providers Registered: ${connectedWallets.length}`);
  console.log(`- Total Gas Used: ${gasTracker.getTotalGasUsedFormatted('registering')} (in wei)`);
  console.log(`- Total Gas Cost: ${gasTracker.getTotalGasCostFormatted('registering')} ETH`);
  console.log(`- Total Balance Difference: ${gasTracker.getTotalBalanceDifferenceFormatted('registering')} ETH`);

  await hre.run("update-prices", { contract, duration });
};