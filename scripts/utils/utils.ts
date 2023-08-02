import * as ethers from "ethers";
import { DURATION_MINUTES } from "../oracleOps";

/** Gas costs summary matrix
 * Displays a summary of the gas costs for each network.
 *
 * HEADERS:
 * networks = Name of the network
 * gasPrice Gwei = Gas price used for the transactions
 * deploy $ = Cost of deploying the contract
 * registerDataProvider $ = Cost of registering the data providers
 * updatePrice $ = Cost of updating the price for all data providers (e.g. x3)
 * avg. $ per updatePrice = Average cost of updating the price for a single data provider
 * finalizePrice $ = Cost of finalizing the price from the owner
 * # of updatePrice txs = Total number of transactions for a given data provider
 * total cost = Total cost of all transactions for entire script
 */
export function displayGasCostsMatrix(gasCosts, networks) {
  const header = [
    "networks  ",
    "gasPrice Gwei",
    "deploy $  ",
    "deploy gasUsed",
    "registerDataProvider $  ",
    "register gasUsed",
    "updatePrice $  ",
    "update gasUsed",
    "avg. $ per updatePrice  ",
    "finalizePrice $  ",
    "finalize gasUsed",
    "# of txs",
    "total cost",
  ];
  const networkData = [];

  for (let network of networks) {
    const gasPrice = ethers.utils.formatUnits(
      gasCosts[network.name].update.gasPrice,
      "gwei",
    );

    const deploy = ethers.BigNumber.from(
      gasCosts[network.name].deploy.gas.toString(),
    );

    const deployGasUsed = gasCosts[network.name].deploy.gasUsed.toString();
    const deployCost = ethers.utils.formatEther(deploy.toString());
    const registerCost = ethers.utils.formatEther(
      gasCosts[network.name].register.totalGasCost.toString(),
    );
    const registerGasUsed =
      gasCosts[network.name].register.totalGasUsed.toString();

    const updateIndividualProviders =
      gasCosts[network.name].update.individualCosts;
    const updateTotalCost = ethers.utils.formatEther(
      gasCosts[network.name].update.totalGasCost.toString(),
    );
    const totalTxs = gasCosts[network.name].update.totalTxCount;
    const updateGasUsed = gasCosts[network.name].update.totalGasUsed.toString();

    const finalizeCost = ethers.utils.formatEther(
      gasCosts[network.name].finalize.totalGasCost.toString(),
    );
    const finalizeGasUsed = gasCosts[network.name].finalize.gasUsed.toString();

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
        .add(
          ethers.BigNumber.from(
            gasCosts[network.name].register.totalGasCost.toString(),
          ),
        )
        .add(
          ethers.BigNumber.from(
            gasCosts[network.name].update.totalGasCost.toString(),
          ),
        )
        .add(
          ethers.BigNumber.from(
            gasCosts[network.name].finalize.totalGasCost.toString(),
          ),
        ),
    );

    const deployGasUsed2 = ethers.BigNumber.from(
      gasCosts[network.name].deploy.gasUsed.toString(),
    );
    const registerGasUsed2 = ethers.BigNumber.from(
      gasCosts[network.name].register.totalGasUsed.toString(),
    );
    const updateGasUsed2 = ethers.BigNumber.from(
      gasCosts[network.name].update.totalGasUsed.toString(),
    );
    const finalizeGasUsed2 = ethers.BigNumber.from(
      gasCosts[network.name].finalize.gasUsed.toString(),
    );

    const totalGasUsed = deployGasUsed2
      .add(registerGasUsed2)
      .add(updateGasUsed2)
      .add(finalizeGasUsed2);

    networkData.push([
      network.name,
      gasPrice,
      deployCost,
      deployGasUsed,
      registerCost,
      registerGasUsed,
      updateTotalCost,
      updateGasUsed,
      ethers.utils.formatEther(avgCostPerUpdate.toString()),
      avgCostPerUpdate.toString(),
      finalizeCost,
      finalizeGasUsed,
      totalTxs,
      totalCost,
      totalGasUsed,
    ]);
  }

  const centerPad = (text, length) => {
    const totalPadding = length - text.length;
    const leftPadding = Math.floor(totalPadding / 2);
    const rightPadding = totalPadding - leftPadding;
    return " ".repeat(leftPadding) + text + " ".repeat(rightPadding);
  };

  const drawRow = (row, widths) => {
    return row
      .map((cell, index) => {
        return centerPad(cell.toString(), widths[index]);
      })
      .join("|");
  };

  const drawTable = (headers, data) => {
    const widths = headers.map((_, index) => {
      return (
        Math.max(
          ...data.map((row) => row[index].toString().length),
          headers[index].length,
        ) + 1
      );
    });

    console.log(
      "-".repeat(
        widths.reduce((acc, width) => acc + width, 0) + (widths.length - 1),
      ),
    );
    console.log(drawRow(headers, widths));
    console.log(
      "-".repeat(
        widths.reduce((acc, width) => acc + width, 0) + (widths.length - 1),
      ),
    );

    for (const row of data) {
      console.log(drawRow(row, widths));
    }

    console.log(
      "=".repeat(
        widths.reduce((acc, width) => acc + width, 0) + (widths.length - 1),
      ),
    );
    console.log("\n");
  };

  console.log("\n\n\n========= Gas Costs Matrix =========");
  console.log("\nPARAMETERS USED");
  console.log("\n- DURATION_MINUTES:", DURATION_MINUTES);
  console.log("\n- # OF DATA PROVIDERS:", 3);
  console.log("\n");

  // Deployment Data
  console.log("Deployment Data:");
  drawTable(
    ["networks", "gasPrice Gwei", "deploy $", "deploy gasUsed"],
    networkData.map((row) => [row[0], row[1], row[2], row[3]]),
  );

  // Registration Data
  console.log("Registration Data:");
  drawTable(
    ["networks", "registerDataProvider $", "register gasUsed"],
    networkData.map((row) => [row[0], row[4], row[5]]),
  );

  // Update Price Data
  console.log("Update Price Data:");
  drawTable(
    [
      "networks",
      "updatePrice $",
      "update gasUsed",
      "avg. $ per updatePrice",
      "# of updatePrice txs",
    ],
    networkData.map((row) => [row[0], row[6], row[7], row[8], row[12]]),
  );

  // Finalize Price Data
  console.log("Finalize Price Data:");
  drawTable(
    ["networks", "finalizePrice $", "finalize gasUsed"],
    networkData.map((row) => [row[0], row[10], row[11]]),
  );

  // Summary Data
  console.log("Summary Data:");
  drawTable(
    ["networks", "total cost", "total gasUsed"],
    networkData.map((row) => [row[0], row[13], row[14]]),
  );
}
