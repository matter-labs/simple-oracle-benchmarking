import * as ethers from "ethers";
import * as ContractArtifact from "../artifacts-zk/contracts/SimpleOracle.sol/SimpleOracle.json";

export const DURATION_MINUTES = 1;

/**
 * Registers multiple wallets as data providers on a given contract and calculates the total gas costs.
 *
 * @param {string} contractAddress - Address of the contract where data providers should be registered (e.g. SimpleOracle).
 * @param {string} networkName - Name of the network to connect to using the JsonRpcProvider.
 * @param {ethers.Wallet[]} wallets - An array of Wallet instances to be registered as data providers.
 *
 * @returns {Promise<number>} Total gas cost of all registration transactions.
 *
 * @throws {Error} Throws an error if the gas information cannot be retrieved from the registration transaction.
 *
 * Note:
 * - The function attempts to use the `effectiveGasPrice` from the transaction receipt for gas cost calculation. If it's absent,
 *   a fallback gas price of 250_000_000 is used (typically for zkSync local-setup).
 */
export async function registerDataProviders(
  contractAddress: string,
  networkName: string,
  wallets: ethers.Wallet[],
): Promise<number> {
  const provider = new ethers.providers.JsonRpcProvider(networkName);
  wallets = wallets.map((wallet) => wallet.connect(provider));
  const contract = new ethers.Contract(
    contractAddress,
    ContractArtifact.abi,
    wallets[0],
  );

  let totalGas = ethers.BigNumber.from(0);

  for (let wallet of wallets) {
    let tx = await contract.connect(wallet).registerDataProvider();
    let receipt = await tx.wait();
    console.log(
      `Registered data provider on ${networkName}: ${wallet.address}`,
    );

    let gasLimit = receipt.gasUsed;
    let gasPrice;
    // NOTE: This is specifically for zkSync local-setup where gasPrice is null
    if (receipt.effectiveGasPrice === null || undefined) {
      gasPrice = ethers.BigNumber.from(250_000_000);
    } else {
      gasPrice = receipt.effectiveGasPrice;
    }

    if (!gasLimit || !gasPrice) {
      throw new Error(
        "Failed to retrieve gas information from the registration transaction.",
      );
    }

    totalGas = totalGas.add(gasLimit.mul(gasPrice));
  }

  return totalGas.toNumber();
}
/**
 * Updates prices on a given contract using multiple data providers (wallets) for a specific duration and calculates the total gas costs.
 * * Note: The function runs a loop that continually updates prices on the given contract until the DURATION_MINUTES is reached.
 *
 * @param {string} contractAddress - Address of the contract to update prices on.
 * @param {string} networkName - Name of the network to connect to using the JsonRpcProvider.
 * @param {ethers.Wallet[]} wallets - An array of Wallet instances to be used as data providers.
 *
 * @returns {Promise<{
 *   individualCosts: Record<string, any>;
 *   totalGasCost: ethers.BigNumber;
 *   gasPrice: ethers.BigNumber;
 * }>} An object containing:
 *   - individualCosts: An object mapping each data provider to its associated gas costs details.
 *   - totalGasCost: The grand total gas cost for all data provider updates.
 *   - gasPrice: The gas price used for the transactions. (Note: fallback to 250_000_000 if gasPrice is null, for zkSync local-setup)
 */
export async function updatePrices(
  contractAddress: string,
  networkName: string,
  wallets: ethers.Wallet[],
): Promise<{
  individualCosts: Record<string, any>;
  totalGasCost: ethers.BigNumber;
  gasPrice: ethers.BigNumber;
  totalTxCount: number;
}> {
  const provider = new ethers.providers.JsonRpcProvider(networkName);
  wallets = wallets.map((wallet) => wallet.connect(provider));
  const contract = new ethers.Contract(
    contractAddress,
    ContractArtifact.abi,
    wallets[0],
  );

  const UPDATE_INTERVAL_MILLISECONDS = 1000;
  const endTime = Date.now() + DURATION_MINUTES * 60 * 1000;

  let results: Record<string, any> = {};
  let grandTotalGasCost = ethers.BigNumber.from(0);
  let gasPrice = ethers.BigNumber.from(0);
  let totalTxCount = 0;

  await Promise.all(
    wallets.map(async (wallet) => {
      const walletKey = `dataProvider${wallets.indexOf(wallet) + 1}`;
      results[walletKey] = {
        txCount: 0,
        costs: [],
        totalGas: ethers.BigNumber.from(0),
      };

      const withSigner = contract.connect(wallet);

      while (Date.now() < endTime) {
        const randomPrice = Math.floor(Math.random() * 1000);
        const tx = await withSigner.updatePrice(randomPrice);
        const receipt = await tx.wait();

        const gasUsed = receipt.gasUsed;
        console.log(
          "\n\ngasPrice effective:::: ",
          ethers.utils.formatEther(receipt.effectiveGasPrice),
        );
        const gp = await withSigner.provider.getGasPrice();
        console.log(
          "\n\n\nprovider gasPrice:::: ",
          ethers.utils.formatEther(gp),
        );
        // NOTE: This is specifically for zkSync local-setup where gasPrice is null
        gasPrice =
          receipt.effectiveGasPrice || ethers.BigNumber.from(250_000_000);
        const cost = gasUsed.mul(gasPrice);

        results[walletKey].costs.push(cost);
        results[walletKey].txCount++;
        totalTxCount++;
        results[walletKey].totalGas = results[walletKey].totalGas.add(cost);
        grandTotalGasCost = grandTotalGasCost.add(cost);

        console.log(
          `Updated price on ${networkName} for ${
            wallet.address
          }: ${randomPrice}. Gas used: ${gasUsed.toString()}. Cost for this transaction: ${ethers.utils.formatEther(
            cost.toString(),
          )} ETH`,
        );

        const sleepDuration = Math.max(
          UPDATE_INTERVAL_MILLISECONDS - (Date.now() - tx.timestamp),
          0,
        );
        await new Promise((resolve) => setTimeout(resolve, sleepDuration));
      }
      results[walletKey].costs.push(results[walletKey].totalGas);
    }),
  );

  console.log(
    `\nGrand Total Gas Cost for all Data Providers: ${ethers.utils.formatEther(
      grandTotalGasCost.toString(),
    )} ETH`,
  );
  console.log(
    "\nBalances of dataProviders after updatePrice: ",
    await Promise.all(
      wallets.map(async (wallet) =>
        ethers.utils.formatEther(await wallet.getBalance()),
      ),
    ),
  );
  return {
    individualCosts: results,
    totalGasCost: grandTotalGasCost,
    gasPrice: gasPrice,
    totalTxCount: totalTxCount,
  };
}

/**
 * Calls the `finalizePrice` function on the provided contract every second for the configured duration.
 *
 * @param {string} contractAddress - Address of the contract on which the `finalizePrice` function should be called.
 * @param {string} networkName - Name of the network to connect to using the JsonRpcProvider.
 * @param {ethers.Wallet} wallet - Wallet instance that will be used to call the `finalizePrice` function.
 *
 * @returns {Promise<{
 *   totalGasCost: ethers.BigNumber;
 *   gasPrice: ethers.BigNumber;
 * }>} An object containing:
 *   - totalGasCost: The grand total gas cost for all the `finalizePrice` calls.
 *   - gasPrice: The gas price used for the transactions. (Note: fallback to 250_000_000 if gasPrice is null, for zkSync local-setup)
 *
 * Note: The function runs a loop that continually calls the `finalizePrice` function on the given contract until the DURATION_MINUTES is reached.
 */
export async function finalizePrices(
  contractAddress: string,
  networkName: string,
  wallet: ethers.Wallet,
): Promise<{
  totalGasCost: ethers.BigNumber;
  gasPrice: ethers.BigNumber;
}> {
  const provider = new ethers.providers.JsonRpcProvider(networkName);
  const connectedWallet = wallet.connect(provider);
  const contract = new ethers.Contract(
    contractAddress,
    ContractArtifact.abi,
    connectedWallet,
  );

  const FINALIZE_INTERVAL_MILLISECONDS = 1000;
  const endTime = Date.now() + DURATION_MINUTES * 60 * 1000;

  let totalGasCost = ethers.BigNumber.from(0);
  let gasPrice = ethers.BigNumber.from(0);

  while (Date.now() < endTime) {
    const tx = await contract.finalizePrice();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed;
    // NOTE: This is specifically for zkSync local-setup where gasPrice is null
    gasPrice = tx.gasPrice || ethers.BigNumber.from(250_000_000);
    const cost = gasUsed.mul(gasPrice);

    totalGasCost = totalGasCost.add(cost);

    console.log(
      `Called finalizePrice on ${networkName} from ${
        wallet.address
      }. Gas used: ${gasUsed.toString()}. Cost for this transaction: ${ethers.utils.formatEther(
        cost.toString(),
      )} ETH`,
    );

    await new Promise((resolve) =>
      setTimeout(resolve, FINALIZE_INTERVAL_MILLISECONDS),
    );
  }

  console.log(
    `\nGrand Total Gas Cost for all finalizePrice calls: ${ethers.utils.formatEther(
      totalGasCost.toString(),
    )} ETH`,
  );

  return {
    totalGasCost: totalGasCost,
    gasPrice: gasPrice,
  };
}
