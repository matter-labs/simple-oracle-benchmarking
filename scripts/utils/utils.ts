import * as ethers from "ethers";
import { DURATION_MINUTES, TX_CAP } from "../oracleOps";
import { DATA_PROVIDER_COUNT } from "../benchmark";
import * as colors from "colors.ts";

/** Gas costs summary matrix
 * Displays a summary of the gas costs for each network.
 *
 * HEADERS:
 * networks = Name of the network
 * gasPrice Gwei = Gas price used for the transactions
 * deploy $ = Cost of deploying the contract
 * deploy gasUsed = Gas used for deploying the contract
 * registerDataProvider $ = Cost of registering the data providers
 * register gasUsed = Gas used for registering the data providers
 * updatePrice $ = Cost of updating the price for all data providers (e.g. x3)
 * balanceBeforeUpdatePrice = Balance of data providers before updatePrice
 * balanceAfterUpdatePrice = Balance of data providers after updatePrice
 * deltaBalance = Change in balance of data providers after updatePrice
 * update gasUsed = Gas used for updating the price for all data providers (e.g. x3)
 * finalizePrice $ = Cost of finalizing the price from the owner
 * finalize gasUsed = Gas used for finalizing the price from the owner
 * # of updatePrice txs = Total number of transactions for a given data provider
 * total cost = Total cost of all transactions for entire script
 * total gasUsed = Total gas used for all transactions for entire script
 */
export function displayGasCostsMatrix(gasCosts, networks) {
  const headerColor = (text: string) => colors.colors("blue", text);
  const dataColor = (text: string) => colors.colors("green", text);
  const separator = colors.colors(
    "red",
    "------------------------------------------------------------",
  );

  const displayHeader = (text: string) => {
    console.log(headerColor(text));
    console.log(separator);
  };

  const displayDataRow = (label: string, data: any) => {
    console.log(`${label}: ${dataColor(data)}`);
  };

  const displayMultiDataRow = (label: string, data: string[]) => {
    console.log(`${label}:`);
    data.forEach((item) => {
      console.log(dataColor(`  - ${item}`));
    });
  };

  networks.map((network) => {
    const gasPrice = ethers.utils.formatUnits(
      gasCosts[network.name].update.gasPrice,
      "gwei",
    );

    const deployCost = ethers.utils.formatEther(
      gasCosts[network.name].deploy.gas.toString(),
    );
    const deployGasUsed = gasCosts[network.name].deploy.gasUsed.toString();

    const registerCost = ethers.utils.formatEther(
      gasCosts[network.name].register.totalGasCost.toString(),
    );
    const registerGasUsed =
      gasCosts[network.name].register.totalGasUsed.toString();

    const updateTotalCost = ethers.utils.formatEther(
      gasCosts[network.name].update.totalGasCost.toString(),
    );
    const updateGasUsed = gasCosts[network.name].update.totalGasUsed.toString();
    const totalTxs = gasCosts[network.name].update.totalTxCount;
    const beforeBalances = gasCosts[network.name].update.balancesBefore.map(
      (balance) => ethers.utils.formatEther(balance.toString()),
    );
    const afterBalances = gasCosts[network.name].update.balancesAfter.map(
      (balance) => ethers.utils.formatEther(balance.toString()),
    );
    const beforeBalancesWei = beforeBalances.map((balance) =>
      ethers.utils.parseEther(balance),
    );
    const afterBalancesWei = afterBalances.map((balance) =>
      ethers.utils.parseEther(balance),
    );

    const deltaBalances = beforeBalancesWei.map((beforeWei, index) => {
      const deltaWei = beforeWei.sub(afterBalancesWei[index]);
      return ethers.utils.formatEther(deltaWei);
    });
    const finalizeCost = ethers.utils.formatEther(
      gasCosts[network.name].finalize.totalGasCost.toString(),
    );
    const finalizeGasUsed = gasCosts[network.name].finalize.gasUsed.toString();

    const totalGasUsed = [
      gasCosts[network.name].deploy.gasUsed,
      gasCosts[network.name].register.totalGasUsed,
      gasCosts[network.name].update.totalGasUsed,
      gasCosts[network.name].finalize.gasUsed,
    ].reduce((acc, val) => acc.add(val), ethers.BigNumber.from(0));

    const totalCost = ethers.utils.formatEther(
      [
        gasCosts[network.name].deploy.gas,
        gasCosts[network.name].register.totalGasCost,
        gasCosts[network.name].update.totalGasCost,
        gasCosts[network.name].finalize.totalGasCost,
      ].reduce((acc, val) => acc.add(val), ethers.BigNumber.from(0)),
    );

    const networkData = {
      name: network.name,
      gasPrice: gasPrice,
      deployCost: deployCost,
      deployGasUsed: deployGasUsed,
      registerCost: registerCost,
      registerGasUsed: registerGasUsed,
      updateTotalCost: updateTotalCost,
      updateGasUsed: updateGasUsed,
      beforeBalances: beforeBalances,
      afterBalances: afterBalances,
      deltaBalances: deltaBalances,
      totalTxs: totalTxs,
      finalizeCost: finalizeCost,
      finalizeGasUsed: finalizeGasUsed,
      totalCost: totalCost,
      totalGasUsed: totalGasUsed,
    };

    displayHeader(`\n\n🌐 Network: ${network.name}`);
    displayHeader(`\n🌐 Parameters Used:`);
    displayDataRow("Duration (minutes)", DURATION_MINUTES);
    displayDataRow("TX cap (updatePrice)", TX_CAP);
    displayDataRow("Data Providers", DATA_PROVIDER_COUNT);

    console.log("\n");

    displayDataRow("Gas Price (Gwei)", networkData.gasPrice);
    displayDataRow("Deploy Cost ($)", networkData.deployCost);
    displayDataRow("Deploy Gas Used", networkData.deployGasUsed);
    displayDataRow("Register DataProvider Cost ($)", networkData.registerCost);
    displayDataRow("Register Gas Used", networkData.registerGasUsed);
    displayDataRow("Update Price Cost ($)", networkData.updateTotalCost);
    displayDataRow("Update Gas Used", networkData.updateGasUsed);
    displayMultiDataRow(
      "Balance Before Update Price",
      networkData.beforeBalances,
    );
    displayMultiDataRow(
      "Balance After Update Price",
      networkData.afterBalances,
    );
    displayMultiDataRow("Delta Balance", networkData.deltaBalances);
    displayDataRow("# of updatePrice txs", networkData.totalTxs);
    displayDataRow("Finalize Price Cost ($)", networkData.finalizeCost);
    displayDataRow("Finalize Gas Used", networkData.finalizeGasUsed);
    displayDataRow("Total Cost ($)", networkData.totalCost);
    displayDataRow("Total Gas Used", networkData.totalGasUsed.toString());

    console.log("\n");
  });
}
