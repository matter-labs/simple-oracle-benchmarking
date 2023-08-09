import { ethers } from "ethers";

const NETWORKS = {
  Optimism: {
    rpcUrl: "https://optimism.publicnode.com",
    gasUsed: 694564,
  },
  Arbitrum: {
    rpcUrl: "https://endpoints.omniatech.io/v1/arbitrum/one/public",
    gasUsed: 694528,
  },
  PolygonZkEVM: {
    rpcUrl: "https://1rpc.io/polygon/zkevm",
    gasUsed: 694504,
  },
  zkSyncEra: {
    rpcUrl: "https://mainnet.era.zksync.io",
    gasUsed: 3653943,
  },
};

async function fetchGasPriceAndCalculateCost(
  provider: ethers.providers.JsonRpcProvider,
  networkName: string,
  gasUsed: number,
) {
  try {
    const gasPrice = await provider.getGasPrice();
    const cost = gasPrice.mul(gasUsed);
    console.log(
      `${networkName} Cost to deploy and run benchmark: ${ethers.utils.formatEther(
        cost,
      )} ETH at ${ethers.utils.formatEther(gasPrice)} gwei`,
    );
    return cost;
  } catch (error) {
    console.error(
      `Error fetching gas price for ${networkName}:`,
      error.message,
    );
    return ethers.BigNumber.from(0);
  }
}

async function main() {
  let totalCost = ethers.BigNumber.from(0);

  for (const [networkName, networkData] of Object.entries(NETWORKS)) {
    const provider = new ethers.providers.JsonRpcProvider(networkData.rpcUrl);
    const cost = await fetchGasPriceAndCalculateCost(
      provider,
      networkName,
      networkData.gasUsed,
    );
    totalCost = totalCost.add(cost);
  }

  console.log(
    `Total Cost across all networks: ${ethers.utils.formatEther(
      totalCost,
    )} ETH`,
  );
}

main().catch((error) => {
  console.error("Error in main function:", error.message);
});
