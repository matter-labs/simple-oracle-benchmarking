import { ethers } from "ethers";

let singletonGasTracker: GasTracker | null = null;

interface DataProviderInfo {
  address: string;
  gasCost: ethers.BigNumber;
  gasUsed: ethers.BigNumber;
  balanceDifference: ethers.BigNumber;
}

interface OperationInfo {
  totalGasCost: ethers.BigNumber;
  totalGasUsed: ethers.BigNumber;
  totalBalanceDifference: ethers.BigNumber;
  perDataProvider: Array<DataProviderInfo>;
}

interface GasTracker {
  deployment: OperationInfo;
  registering: OperationInfo;
  updatingPrices: OperationInfo;
  getTotalGasUsedFormatted(operation: keyof GasTracker): string;
  getProviderInfo(operation: keyof GasTracker, address: string): DataProviderInfo | null;
  getAverageGasCost(operation: keyof GasTracker): string;
  getMedianGasCost(operation: keyof GasTracker): string;
  getTotalGasCostFormatted(operation: keyof GasTracker): string;
  getTotalBalanceDifferenceFormatted(operation: keyof GasTracker): string;
  exportData(): string;
  resetData(operation?: keyof GasTracker): void;
  getProviderCount(operation: keyof GasTracker): number;
  getTransactionCount(operation: keyof GasTracker): number;
}

function initOperationInfo(): OperationInfo {
  return {
    totalGasUsed: ethers.BigNumber.from(0),
    totalGasCost: ethers.BigNumber.from(0),
    totalBalanceDifference: ethers.BigNumber.from(0),
    perDataProvider: [],
  };
}

export function initGasTracker(): GasTracker {
  if (singletonGasTracker === null) {
    singletonGasTracker = {
      deployment: initOperationInfo(),
      registering: initOperationInfo(),
      updatingPrices: initOperationInfo(),
      getTotalGasUsedFormatted(operation) {
        return ethers.utils.formatUnits(this[operation].totalGasUsed, 'wei');
      },
      getProviderInfo(operation, address) {
        return this[operation].perDataProvider.find(d => d.address === address) || null;
      },
      getAverageGasCost(operation) {
        const totalProviders = this[operation].perDataProvider.length;
        if (totalProviders === 0) return '0';
        const avgGas = this[operation].totalGasCost.div(totalProviders);
        return ethers.utils.formatUnits(avgGas, 'wei');
      },
      getMedianGasCost(operation) {
        const sortedGasCosts = this[operation].perDataProvider.map(d => d.gasCost).sort((a, b) => a.sub(b).toNumber());
        const mid = Math.floor(sortedGasCosts.length / 2);
        let median = ethers.BigNumber.from(0);
        if (sortedGasCosts.length % 2 === 0) {
          median = sortedGasCosts[mid].add(sortedGasCosts[mid - 1]).div(2);
        } else {
          median = sortedGasCosts[mid];
        }
        return ethers.utils.formatUnits(median, 'wei');
      },
      getTotalGasCostFormatted(operation) {
        return ethers.utils.formatEther(this[operation].totalGasCost);
      },
      getTotalBalanceDifferenceFormatted(operation) {
        return ethers.utils.formatEther(this[operation].totalBalanceDifference);
      },
      exportData() {
        return JSON.stringify(this);
      },
      resetData(operation) {
        if (operation) {
          this[operation] = initOperationInfo();
        } else {
          this.deployment = initOperationInfo();
          this.registering = initOperationInfo();
          this.updatingPrices = initOperationInfo();
        }
      },
      getProviderCount(operation) {
        return new Set(this[operation].perDataProvider.map(d => d.address)).size;
      },
      getTransactionCount(operation) {
        return this[operation].perDataProvider.length;
      }
    };
  }
  
  return singletonGasTracker;
}

export function getGasTracker(): GasTracker {
  if (singletonGasTracker === null) {
    return initGasTracker();
  }
  return singletonGasTracker;
}

export default GasTracker;
