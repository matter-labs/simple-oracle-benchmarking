import * as ethers from "ethers";
import { DURATION_MINUTES, TX_CAP } from "../oracleOps";
import { DATA_PROVIDER_COUNT } from "../benchmark";
import * as colors from "colors.ts";

/**
 * Displays a matrix of gas costs for each network.
 * @param gasCosts - An object containing gas costs for each network.
 * @param networks - An array of network objects.
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
    const deployDeltaBalanceCost = ethers.utils.formatEther(
      gasCosts[network.name].deploy.deltaBalance.toString(),
    );

    const registerCost = ethers.utils.formatEther(
      gasCosts[network.name].register.totalGasCost.toString(),
    );
    const registerGasUsed =
      gasCosts[network.name].register.totalGasUsed.toString();
    const registerDeltaBalanceCost = ethers.utils.formatEther(
      gasCosts[network.name].register.deltaBalance.toString(),
    );

    const updateTotalCost = ethers.utils.formatEther(
      gasCosts[network.name].update.totalGasCost.toString(),
    );
    const updateGasUsed = gasCosts[network.name].update.totalGasUsed.toString();
    const updateDeltaBalanceCost = ethers.utils.formatEther(
      gasCosts[network.name].update.deltaBalance.toString(),
    );
    const totalTxs = gasCosts[network.name].update.totalTxCount;

    const finalizeCost = ethers.utils.formatEther(
      gasCosts[network.name].finalize.totalGasCost.toString(),
    );
    const finalizeGasUsed = gasCosts[network.name].finalize.gasUsed.toString();
    const finalizeDeltaBalanceCost = ethers.utils.formatEther(
      gasCosts[network.name].finalize.deltaBalance.toString(),
    );

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
      deployDeltaBalance: deployDeltaBalanceCost,
      registerCost: registerCost,
      registerGasUsed: registerGasUsed,
      registerDeltaBalance: registerDeltaBalanceCost,
      updateTotalCost: updateTotalCost,
      updateGasUsed: updateGasUsed,
      updateDeltaBalance: updateDeltaBalanceCost,
      totalTxs: totalTxs,
      finalizeCost: finalizeCost,
      finalizeGasUsed: finalizeGasUsed,
      finalizeDeltaBalance: finalizeDeltaBalanceCost,
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
    displayDataRow("Deploy Delta Balance Cost", networkData.deployDeltaBalance);
    displayDataRow("Register DataProvider Cost ($)", networkData.registerCost);
    displayDataRow("Register Gas Used", networkData.registerGasUsed);
    displayDataRow(
      "Register Delta Balance Cost (1 dataProvider)",
      networkData.registerDeltaBalance,
    );
    displayDataRow("Update Price Cost ($)", networkData.updateTotalCost);
    displayDataRow("Update Gas Used", networkData.updateGasUsed);
    displayDataRow(
      "Update Delta Balance Cost (1 dataProvider)",
      networkData.updateDeltaBalance,
    );
    displayDataRow("# of updatePrice txs", networkData.totalTxs);
    displayDataRow("Finalize Price Cost ($)", networkData.finalizeCost);
    displayDataRow("Finalize Gas Used", networkData.finalizeGasUsed);
    displayDataRow(
      "Finalize Delta Balance Cost",
      networkData.finalizeDeltaBalance,
    );
    displayDataRow("Total Cost ($)", networkData.totalCost);
    displayDataRow("Total Gas Used", networkData.totalGasUsed.toString());

    console.log("\n");
  });
}
