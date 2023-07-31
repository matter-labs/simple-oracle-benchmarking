import * as ethers from "ethers";
import { DURATION_MINUTES } from "../oracleOps";

// Gas costs summary matrix
export function displayGasCostsMatrix(gasCosts, networks) {
  const header = [
    "networks  ",
    "gasPrice Gwei",
    "deploy $  ",
    "registerDataProvider $  ",
    "updatePrice $  ",
    "avg. $ per updatePrice  ",
    "finalizePrice $  ",
    "total # of txs  ",
    "total cost  ",
  ];
  const networkData = [];

  for (let network of networks) {
    const gasPrice = ethers.utils.formatUnits(
      gasCosts[network.name].update.gasPrice,
      "gwei",
    );
    const deploy = ethers.BigNumber.from(
      gasCosts[network.name].deploy.toString(),
    );

    const deployCost = ethers.utils.formatEther(deploy.toString());
    const registerCost = ethers.utils.formatEther(
      gasCosts[network.name].register.toString(),
    );

    const updateIndividualProviders =
      gasCosts[network.name].update.individualCosts;
    const updateTotalCost = ethers.utils.formatEther(
      gasCosts[network.name].update.totalGasCost.toString(),
    );
    const finalizeCost = ethers.utils.formatEther(
      gasCosts[network.name].finalize.toString(),
    );

    // Divide by 3 as there are 3 data providers and this is total number of transactions for all data providers
    const totalTxs = gasCosts[network.name].update.totalTxCount / 3;

    let avgCostPerUpdate = ethers.BigNumber.from(0);

    for (const dataProvider in updateIndividualProviders) {
      avgCostPerUpdate = avgCostPerUpdate.add(
        ethers.BigNumber.from(
          updateIndividualProviders[dataProvider].totalGas.toString(),
        ),
      );
    }
    avgCostPerUpdate = avgCostPerUpdate.div(totalTxs);

    const totalCost = ethers.utils.formatEther(
      deploy
        .add(ethers.BigNumber.from(gasCosts[network.name].register.toString()))
        .add(
          ethers.BigNumber.from(
            gasCosts[network.name].update.totalGasCost.toString(),
          ),
        )
        .add(ethers.BigNumber.from(gasCosts[network.name].finalize.toString())),
    );

    networkData.push([
      network.name,
      gasPrice,
      deployCost,
      registerCost,
      updateTotalCost,
      ethers.utils.formatEther(avgCostPerUpdate.toString()),
      finalizeCost,
      totalTxs,
      totalCost,
    ]);
  }

  const columnWidths = header.map((_, index) => {
    return (
      Math.max(
        ...networkData.map((row) => row[index].toString().length),
        header[index].length,
      ) + 1
    );
  });

  const centerPad = (text, length) => {
    const totalPadding = length - text.length;
    const leftPadding = Math.floor(totalPadding / 2);
    const rightPadding = totalPadding - leftPadding;
    return " ".repeat(leftPadding) + text + " ".repeat(rightPadding);
  };

  const drawRow = (row) => {
    return row
      .map((cell, index) => {
        return centerPad(cell.toString(), columnWidths[index]);
      })
      .join("|");
  };

  console.log("\n\n\n========= Gas Costs Matrix =========");
  console.log("\nPARAMETERS USED");
  console.log("\n- DURATION_MINUTES:", DURATION_MINUTES);
  console.log("\n- # OF DATA PROVIDERS:", 3);
  console.log("\n");
  console.log(
    "-".repeat(
      columnWidths.reduce((acc, width) => acc + width, 0) +
        (columnWidths.length - 1),
    ),
  );
  console.log(drawRow(header));
  console.log(
    "-".repeat(
      columnWidths.reduce((acc, width) => acc + width, 0) +
        (columnWidths.length - 1),
    ),
  );

  for (const row of networkData) {
    console.log(drawRow(row));
  }

  if (networkData.length === 2) {
    const deltas = ["Delta"];
    for (let i = 1; i < networkData[0].length; i++) {
      deltas.push(
        (parseFloat(networkData[0][i]) - parseFloat(networkData[1][i])).toFixed(
          5,
        ),
      );
    }
    console.log(
      "-".repeat(
        columnWidths.reduce((acc, width) => acc + width, 0) +
          (columnWidths.length - 1),
      ),
    );
    console.log(drawRow(deltas));
  }

  console.log(
    "=".repeat(
      columnWidths.reduce((acc, width) => acc + width, 0) +
        (columnWidths.length - 1),
    ),
  );
  console.log("\n");
}
