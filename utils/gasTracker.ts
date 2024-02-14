import { ethers, BigNumber } from "ethers";
import { formatUnits } from "./utils";

// Type for operation keys
type OperationKey =
  | "deployment"
  | "registering"
  | "updatingPrices"
  | "finalize";

// Operation Info class (operation = deployment, registering, updatingPrices)
class OperationInfo {
  totalGasCost = ethers.BigNumber.from(0);
  totalGasUsed = ethers.BigNumber.from(0);
  totalBalanceDifference = ethers.BigNumber.from(0);
  perDataProvider: Array<DataProviderInfo> = [];
  gasPrice: ethers.BigNumber = ethers.BigNumber.from(0);
}

// DataProvider Info class
class DataProviderInfo {
  constructor(
    public address: string,
    public gasCost: ethers.BigNumber,
    public gasUsed: ethers.BigNumber,
    public balanceDifference: ethers.BigNumber,
  ) {}
}

// GasTracker class
// Used to track gas costs and balance differences for each operation
class GasTracker {
  private static instance: GasTracker;

  private constructor(
    public deployment = new OperationInfo(),
    public registering = new OperationInfo(),
    public updatingPrices = new OperationInfo(),
    public finalize = new OperationInfo(),
  ) {}

  public static getInstance(): GasTracker {
    if (!GasTracker.instance) {
      GasTracker.instance = new GasTracker();
    }
    return GasTracker.instance;
  }
  getTotalGasUsedFormatted(operation: OperationKey): string {
    return formatUnits(this[operation].totalGasUsed, "wei");
  }

  getTotalGasCostFormatted(operation: OperationKey): string {
    return formatUnits(this[operation].totalGasCost, "ether");
  }

  getTotalBalanceDifferenceFormatted(operation: OperationKey): string {
    return formatUnits(this[operation].totalBalanceDifference, "ether");
  }

  getTransactionCount(operation: OperationKey): number {
    return this[operation].perDataProvider.length;
  }
  // Displays data in a table format, called at the end of the script
  displayDataAsTable(network: string): string {
    let output =
      "| Operation       | Network        | Gas Cost (eth)       | Gas Used (wei)    | Balance Difference (eth) | Gas Price (gwei) |\n";
    output +=
      "|------------------|------------------|----------------------|-------------------|---------------------------|------------------|\n";

    const operationTotals: Record<
      OperationKey,
      {
        gasCost: BigNumber;
        gasUsed: BigNumber;
        balanceDiff: BigNumber;
        gasPrice: BigNumber;
      }
    > = {
      deployment: {
        gasCost: ethers.BigNumber.from(0),
        gasUsed: ethers.BigNumber.from(0),
        balanceDiff: ethers.BigNumber.from(0),
        gasPrice: ethers.BigNumber.from(0),
      },
      registering: {
        gasCost: ethers.BigNumber.from(0),
        gasUsed: ethers.BigNumber.from(0),
        balanceDiff: ethers.BigNumber.from(0),
        gasPrice: ethers.BigNumber.from(0),
      },
      updatingPrices: {
        gasCost: ethers.BigNumber.from(0),
        gasUsed: ethers.BigNumber.from(0),
        balanceDiff: ethers.BigNumber.from(0),
        gasPrice: ethers.BigNumber.from(0),
      },
      finalize: {
        gasCost: ethers.BigNumber.from(0),
        gasUsed: ethers.BigNumber.from(0),
        balanceDiff: ethers.BigNumber.from(0),
        gasPrice: ethers.BigNumber.from(0),
      },
    };

    let grandTotalGasCost = ethers.BigNumber.from(0);
    let grandTotalGasUsed = ethers.BigNumber.from(0);
    let grandTotalBalanceDiff = ethers.BigNumber.from(0);

    for (const operationKey of [
      "deployment",
      "registering",
      "updatingPrices",
      "finalize",
    ] as OperationKey[]) {
      const operation = this[operationKey];

      if (operation.perDataProvider.length === 0) {
        operationTotals[operationKey].gasCost = operation.totalGasCost;
        operationTotals[operationKey].gasUsed = operation.totalGasUsed;
        operationTotals[operationKey].balanceDiff =
          operation.totalBalanceDifference;
      } else {
        for (const entry of operation.perDataProvider) {
          operationTotals[operationKey].gasCost = operationTotals[
            operationKey
          ].gasCost.add(entry.gasCost);
          operationTotals[operationKey].gasUsed = operationTotals[
            operationKey
          ].gasUsed.add(entry.gasUsed);
          operationTotals[operationKey].balanceDiff = operationTotals[
            operationKey
          ].balanceDiff.add(entry.balanceDifference);
        }
      }

      grandTotalGasCost = grandTotalGasCost.add(
        operationTotals[operationKey].gasCost,
      );
      grandTotalGasUsed = grandTotalGasUsed.add(
        operationTotals[operationKey].gasUsed,
      );
      grandTotalBalanceDiff = grandTotalBalanceDiff.add(
        operationTotals[operationKey].balanceDiff,
      );

      output += `| ${operationKey.padEnd(16)} | ${network.padEnd(
        14,
      )} | ${formatUnits(operationTotals[operationKey].gasCost, "ether").padEnd(
        20,
      )} | ${formatUnits(operationTotals[operationKey].gasUsed, "wei").padEnd(
        17,
      )} | ${formatUnits(
        operationTotals[operationKey].balanceDiff,
        "ether",
      ).padEnd(25)} | ${formatUnits(operation.gasPrice, "gwei").padEnd(
        16,
      )} |\n`;
    }

    output += `| **Total**        | ${network.padEnd(14)} | ${formatUnits(
      grandTotalGasCost,
      "ether",
    ).padEnd(20)} | ${formatUnits(grandTotalGasUsed, "wei").padEnd(
      17,
    )} | ${formatUnits(grandTotalBalanceDiff, "ether").padEnd(25)} |\n`;

    return output;
  }
}
// Get the GasTracker instance
export function getGasTracker(): GasTracker {
  return GasTracker.getInstance();
}

export default GasTracker;
