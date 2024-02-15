import { ethers } from "ethers";
import { WalletManager, fetchContractABI, L1_RPC_URL } from "../utils/utils";
import GasTracker, { getGasTracker } from "../utils/gasTracker";

const updatePrice = async (
  wallet: ethers.Wallet,
  contractInstance: ethers.Contract,
  gasTracker: GasTracker,
  maxUpdates: number,
  totalUpdates: { count: number },
) => {
  const l1Provider = new ethers.providers.JsonRpcProvider(L1_RPC_URL);
  const l1gasPrice = await l1Provider.getGasPrice();
  const withSigner = contractInstance.connect(wallet);
  const startBalance = await wallet.provider.getBalance(wallet.address);
  console.log(
    `🔄 Price updates beginning for data provider: ${wallet.address}`,
  );
  console.log("");

  // Call updatePrice until endTime
  // Represents frequent price updates from data providers
  let updates = 0;
  while (updates < maxUpdates) {
    const randomPrice = Math.floor(Math.random() * 1000);
    const tx = await withSigner.updatePrice(randomPrice);
    const receipt = await tx.wait();
    updates++;
    totalUpdates.count++;
    const { gasUsed } = receipt;
    console.log(
      `🔹 ${wallet.address} price update ${randomPrice}. 📍 Tx Hash: ${tx.hash} ⛽ Gas used: ${gasUsed}`,
    );
    gasTracker.updatingPrices.totalGasUsed =
      gasTracker.updatingPrices.totalGasUsed.add(gasUsed);
    // Track gas cost and balance difference
    let gasPrice =
      receipt.effectiveGasPrice || (await wallet.provider.getGasPrice());
    // NOTE: gasPrice may cause inaccurate gas cost calculations
    const gasCost = gasUsed.mul(gasPrice);

    gasTracker.updatingPrices.totalGasCost =
      gasTracker.updatingPrices.totalGasCost.add(gasCost);
    gasTracker.updatingPrices.perDataProvider.push({
      address: wallet.address,
      gasUsed,
      gasCost,
      // Intentional
      balanceDifference: gasCost,
    });
    gasTracker.updatingPrices.l2gasPrice = gasPrice;
  }

  const finalEndBalance = await wallet.provider.getBalance(wallet.address);
  const balanceDifference = startBalance.sub(finalEndBalance);
  gasTracker.updatingPrices.totalBalanceDifference =
    gasTracker.updatingPrices.totalBalanceDifference.add(balanceDifference);
  gasTracker.updatingPrices.l1gasPrice = l1gasPrice;
};

module.exports = async function (taskArgs: any, hre: any) {
  const { contract, maxUpdates } = taskArgs;

  // Fetch wallets
  const wallets = WalletManager.getConnectedWallets();
  // Fetch GasTracker
  const gasTracker = getGasTracker();
  const totalUpdates = { count: 0 };

  console.log("\n------------------------------------------------------------");
  console.log(
    `\n🚀 Price updates starting for ${wallets.length} data providers for ${maxUpdates} updates each\n`,
  );

  await Promise.all(
    wallets.map((wallet) => {
      return updatePrice(
        wallet,
        new ethers.Contract(
          contract,
          fetchContractABI(hre.network.name),
          wallet,
        ),
        gasTracker,
        maxUpdates,
        totalUpdates,
      );
    }),
  );

  console.log(`\n✅ Price Update Summary:`);
  console.log(`- Total Updates: ${totalUpdates.count}`);
  console.log(`- Data Providers Involved: ${wallets.length}`);
  console.log(
    `- Total Gas Used: ${gasTracker.getTotalGasUsedFormatted(
      "updatingPrices",
    )} (in wei)`,
  );
  console.log(
    `- Total Gas Cost: ${gasTracker.getTotalGasCostFormatted(
      "updatingPrices",
    )} ETH`,
  );
  console.log(
    `- Total Balance Difference: ${gasTracker.getTotalBalanceDifferenceFormatted(
      "updatingPrices",
    )} ETH`,
  );
  console.log(
    "- L2 Gas Price:",
    gasTracker.getL2GasPriceFormatted("updatingPrices"),
  );
  console.log(
    "- L1 Gas Price:",
    gasTracker.getL1GasPriceFormatted("updatingPrices"),
  );

  await hre.run("finalize-price", { contract });
};
