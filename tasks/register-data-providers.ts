import { ethers } from "ethers";
import {
  fundAccount,
  WalletManager,
  fetchContractABI,
  L1_RPC_URL,
} from "../utils/utils";
import { getGasTracker } from "../utils/gasTracker";
import { HardhatRuntimeEnvironment } from "hardhat/types";

module.exports = async function (
  taskArgs: any,
  hre: HardhatRuntimeEnvironment,
) {
  const { contract, dataProviderCount, fundAmount, maxUpdates } = taskArgs;
  // Fetch GasTracker
  const gasTracker = getGasTracker();
  // Wallet setup
  const provider = new ethers.providers.JsonRpcProvider(hre.network.config.url);
  const l1Provider = new ethers.providers.JsonRpcProvider(L1_RPC_URL);
  const l1gasPrice = await l1Provider.getGasPrice();
  const accounts = hre.network.config.accounts || [];
  const deployerAccount = accounts[0];
  const deployerWallet = new ethers.Wallet(deployerAccount).connect(provider);
  // Create new data providers
  const dataProviders = Array(Number(dataProviderCount))
    .fill(null)
    .map(() => new ethers.Wallet(ethers.Wallet.createRandom().privateKey));
  const connectedWallets = dataProviders.map((wallet) =>
    wallet.connect(provider),
  );
  WalletManager.updateConnectedWallets(connectedWallets);

  // Fund data providers
  console.log("\n------------------------------------------------------------");
  console.log("\n💰 Funding data providers...");
  for (const dataProvider of dataProviders) {
    await fundAccount(deployerWallet, dataProvider.address, fundAmount);
  }

  const contractInstance = new ethers.Contract(
    contract,
    fetchContractABI(hre.network.name),
    connectedWallets[0],
  );

  // Register data providers
  console.log("\n🗳️  Registering data providers...");
  let totalGasCost = ethers.BigNumber.from(0);
  let totalBalanceDifference = ethers.BigNumber.from(0);

  for (const wallet of connectedWallets) {
    const startBalance = await provider.getBalance(wallet.address);
    const tx = await contractInstance.connect(wallet).registerDataProvider();
    const receipt = await tx.wait();
    console.log(
      `📝 Registered data provider ${wallet.address} 📍 Tx Hash: ${tx.hash}`,
    );

    // Track gas cost and balance difference
    const endBalance = await provider.getBalance(wallet.address);
    let gasPrice =
      receipt.effectiveGasPrice || (await wallet.provider.getGasPrice());
    gasTracker.registering.totalGasUsed =
      gasTracker.registering.totalGasUsed.add(receipt.gasUsed);
    gasTracker.registering.l2gasPrice = gasPrice;
    // NOTE: gasPrice may cause inaccurate gas cost calculations
    const gasCost = gasPrice.mul(receipt.gasUsed);
    const balanceDifference = startBalance.sub(endBalance);

    totalBalanceDifference = totalBalanceDifference.add(balanceDifference);
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
  gasTracker.registering.l1gasPrice = l1gasPrice;

  console.log(`\n✅ Data Provider Registration Summary:`);
  console.log(`- Data Providers Registered: ${connectedWallets.length}`);
  console.log(
    `- Total Gas Used: ${gasTracker.getTotalGasUsedFormatted(
      "registering",
    )} (in wei)`,
  );
  console.log(
    `- Total Gas Cost: ${gasTracker.getTotalGasCostFormatted(
      "registering",
    )} ETH`,
  );
  console.log(
    `- Total Balance Difference: ${gasTracker.getTotalBalanceDifferenceFormatted(
      "registering",
    )} ETH`,
  );
  console.log(
    "- L2 Gas Price:",
    gasTracker.getL2GasPriceFormatted("registering"),
  );
  console.log(
    "- L1 Gas Price:",
    gasTracker.getL1GasPriceFormatted("registering"),
  );

  await hre.run("update-prices", { contract, maxUpdates });
};
