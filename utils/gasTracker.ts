import { ethers, BigNumber } from "ethers";
import { toCSV, formatUnits } from "./utils";

// Type for operation keys
type OperationKey = "deployment" | "registering" | "updatingPrices";

// Operation Info class (operation = deployment, registering, updatingPrices)
class OperationInfo {
  totalGasCost = ethers.BigNumber.from(0);
  totalGasUsed = ethers.BigNumber.from(0);
  totalBalanceDifference = ethers.BigNumber.from(0);
  perDataProvider: Array<DataProviderInfo> = [];
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
class GasTracker {
  private static instance: GasTracker;

  private constructor(
    public deployment = new OperationInfo(),
    public registering = new OperationInfo(),
    public updatingPrices = new OperationInfo(),
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

  displayDataAsTable(network: string): string {
    let output =
      "| Operation       | Network        | Gas Cost (eth)       | Gas Used (wei)    | Balance Difference (eth) |\n";
    output +=
      "|-----------------|----------------|----------------------|-------------------|---------------------------|\n";

    const operationTotals: Record<
      OperationKey,
      { gasCost: BigNumber; gasUsed: BigNumber; balanceDiff: BigNumber }
    > = {
      deployment: {
        gasCost: ethers.BigNumber.from(0),
        gasUsed: ethers.BigNumber.from(0),
        balanceDiff: ethers.BigNumber.from(0),
      },
      registering: {
        gasCost: ethers.BigNumber.from(0),
        gasUsed: ethers.BigNumber.from(0),
        balanceDiff: ethers.BigNumber.from(0),
      },
      updatingPrices: {
        gasCost: ethers.BigNumber.from(0),
        gasUsed: ethers.BigNumber.from(0),
        balanceDiff: ethers.BigNumber.from(0),
      },
    };

    let grandTotalGasCost = ethers.BigNumber.from(0);
    let grandTotalGasUsed = ethers.BigNumber.from(0);
    let grandTotalBalanceDiff = ethers.BigNumber.from(0);

    for (const operationKey of [
      "deployment",
      "registering",
      "updatingPrices",
    ] as OperationKey[]) {
      const operation = this[operationKey];

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

        grandTotalGasCost = grandTotalGasCost.add(entry.gasCost);
        grandTotalGasUsed = grandTotalGasUsed.add(entry.gasUsed);
        grandTotalBalanceDiff = grandTotalBalanceDiff.add(
          entry.balanceDifference,
        );
      }

      output += `| ${operationKey.padEnd(16)} | ${network.padEnd(
        14,
      )} | ${formatUnits(operationTotals[operationKey].gasCost, "ether").padEnd(
        20,
      )} | ${formatUnits(operationTotals[operationKey].gasUsed, "wei").padEnd(
        17,
      )} | ${formatUnits(
        operationTotals[operationKey].balanceDiff,
        "ether",
      ).padEnd(25)} |\n`;
    }

    output += `| **Total**        | ${network.padEnd(14)} | ${formatUnits(
      grandTotalGasCost,
      "ether",
    ).padEnd(20)} | ${formatUnits(grandTotalGasUsed, "wei").padEnd(
      17,
    )} | ${formatUnits(grandTotalBalanceDiff, "ether").padEnd(25)} |\n`;

    return output;
  }

  exportData(): string {
    const flatData = [];
    ["deployment", "registering", "updatingPrices"].forEach((operationKey) => {
      const operation = this[operationKey as OperationKey];
      operation.perDataProvider.forEach((provider: DataProviderInfo) => {
        flatData.push({
          operation: operationKey,
          address: provider.address,
          gasCost: provider.gasCost,
          balanceDifference: provider.balanceDifference,
          totalGasCost: operation.totalGasCost,
          totalGasUsed: operation.totalGasUsed,
          totalBalanceDifference: operation.totalBalanceDifference,
        });
      });
    });
    return toCSV(flatData);
  }
}

export function getGasTracker(): GasTracker {
  return GasTracker.getInstance();
}

export default GasTracker;
