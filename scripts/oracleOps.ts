import * as ethers from "ethers";
import * as ContractArtifact from "../artifacts-zk/contracts/SimpleOracle.sol/SimpleOracle.json";

// DURATION_MINUTES is the number of minutes that the data providers will be updating prices AND
// the number of minutes that the owner will be finalizing the price.
export const DURATION_MINUTES = 1;
export const TX_CAP = 25;

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
 */
export async function registerDataProviders(
  contractAddress: string,
  networkName: string,
  wallets: ethers.Wallet[],
): Promise<{ totalGasCost: number; totalGasUsed: ethers.BigNumber }> {
  const provider = new ethers.providers.JsonRpcProvider(networkName);
  wallets = wallets.map((wallet) => wallet.connect(provider));
  const contract = new ethers.Contract(
    contractAddress,
    ContractArtifact.abi,
    wallets[0],
  );

  let totalGas = ethers.BigNumber.from(0);
  let totalGasUsed = ethers.BigNumber.from(0);

  for (let wallet of wallets) {
    let tx = await contract.connect(wallet).registerDataProvider();
    let receipt = await tx.wait();
    console.log(
      `Registered data provider on ${networkName}: ${wallet.address}`,
    );

    let gasUsed = receipt.gasUsed;
    let gasPrice =
      receipt.effectiveGasPrice || (await wallet.provider.getGasPrice());

    if (!gasUsed || !gasPrice) {
      throw new Error(
        "Failed to retrieve gas information from the registration transaction.",
      );
    }

    totalGas = totalGas.add(gasUsed.mul(gasPrice));
    totalGasUsed = totalGasUsed.add(receipt.gasUsed);
  }

  return {
    totalGasCost: totalGas.toNumber(),
    totalGasUsed: totalGasUsed,
  };
}
/**
 * Continuously updates prices on a given contract using multiple data providers until a specified duration is reached or a maximum of 20 transactions are executed. The function also calculates the total gas costs.
 *
 * * Note: The function runs a loop that continually updates prices on the given contract until the DURATION_MINUTES is reached or 20 transactions are executed.
 * * Note: The prices are randomly generated.
 * * Note: The function also tracks the balance of each data provider before and after the updates.
 *
 * @param {string} contractAddress - Address of the contract to update prices on.
 * @param {string} networkName - Name of the network to connect to using the JsonRpcProvider.
 * @param {ethers.Wallet[]} wallets - An array of Wallet instances to be used as data providers.
 *
 * @returns {Promise<{
 *   individualCosts: Record<string, any>;
 *   totalGasCost: ethers.BigNumber;
 *   gasPrice: ethers.BigNumber;
 *   totalTxCount: number;
 *   totalGasUsed: ethers.BigNumber;
 *   balancesBefore: ethers.BigNumber[];
 *   balancesAfter: ethers.BigNumber[];
 * }>} An object containing:
 *   - individualCosts: An object mapping each data provider to its associated gas costs details.
 *   - totalGasCost: The grand total gas cost for all data provider updates.
 *   - gasPrice: The gas price used for the transactions.
 *   - totalTxCount: The total number of transactions executed.
 *   - totalGasUsed: The total gas used across all transactions.
 *   - balancesBefore: An array of balances of each data provider before the updates.
 *   - balancesAfter: An array of balances of each data provider after the updates.
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
  totalGasUsed: ethers.BigNumber;
  balancesBefore: ethers.BigNumber[];
  balancesAfter: ethers.BigNumber[];
}> {
  const provider = new ethers.providers.JsonRpcProvider(networkName);
  let txCount = 0;
  wallets = wallets.map((wallet) => wallet.connect(provider));
  const contract = new ethers.Contract(
    contractAddress,
    ContractArtifact.abi,
    wallets[0],
  );

  const endTime = Date.now() + DURATION_MINUTES * 60 * 1000;

  const balancesBefore = await Promise.all(
    wallets.map(async (wallet) => await wallet.getBalance()),
  );

  let results: Record<string, any> = {};
  let grandTotalGasCost = ethers.BigNumber.from(0);
  let gasPrice = ethers.BigNumber.from(0);
  let totalGasUsed = ethers.BigNumber.from(0);
  let totalTxCount = 0;
  const walletTxCap = Math.floor(TX_CAP / wallets.length);

  await Promise.all(
    wallets.map(async (wallet) => {
      const walletKey = `dataProvider${wallets.indexOf(wallet) + 1}`;
      results[walletKey] = {
        txCount: 0,
        costs: [],
        totalGas: ethers.BigNumber.from(0),
      };

      const withSigner = contract.connect(wallet);

      while (Date.now() < endTime && results[walletKey].txCount < walletTxCap) {
        const randomPrice = Math.floor(Math.random() * 1000);
        const tx = await withSigner.updatePrice(randomPrice);
        const receipt = await tx.wait();
        txCount++;
        const gasUsed = receipt.gasUsed;
        totalGasUsed = totalGasUsed.add(gasUsed);
        gasPrice =
          receipt.effectiveGasPrice || (await wallet.provider.getGasPrice());
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
      }
      results[walletKey].costs.push(results[walletKey].totalGas);
    }),
  );

  const balancesAfter = await Promise.all(
    wallets.map(async (wallet) => await wallet.getBalance()),
  );

  return {
    individualCosts: results,
    totalGasCost: grandTotalGasCost,
    gasPrice: gasPrice,
    totalTxCount: totalTxCount,
    totalGasUsed: totalGasUsed,
    balancesBefore: balancesBefore,
    balancesAfter: balancesAfter,
  };
}

/**
 * Calls the `finalizePrice` function on the provided contract and calculates the total gas costs.
 *
 * @param {string} contractAddress - Address of the contract on which the `finalizePrice` function should be called.
 * @param {string} networkName - Name of the network to connect to using the JsonRpcProvider.
 * @param {ethers.Wallet} wallet - Wallet instance that will be used to call the `finalizePrice` function.
 *
 * @returns {Promise<{
 *   totalGasCost: ethers.BigNumber;
 * }>} An object containing:
 *   - totalGasCost: The grand total gas cost for all the `finalizePrice` calls.
 */
export async function finalizePrices(
  contractAddress: string,
  networkName: string,
  wallet: ethers.Wallet,
): Promise<{
  totalGasCost: ethers.BigNumber;
  gasUsed: ethers.BigNumber;
}> {
  const provider = new ethers.providers.JsonRpcProvider(networkName);
  const connectedWallet = wallet.connect(provider);
  const contract = new ethers.Contract(
    contractAddress,
    ContractArtifact.abi,
    connectedWallet,
  );

  let totalGasCost = ethers.BigNumber.from(0);
  let gasPrice = ethers.BigNumber.from(0);

  const tx = await contract.finalizePrice();
  const receipt = await tx.wait();
  const gasUsed = receipt.gasUsed;
  gasPrice = receipt.effectiveGasPrice || (await wallet.provider.getGasPrice());
  const cost = gasUsed.mul(gasPrice);

  totalGasCost = totalGasCost.add(cost);

  console.log(
    `Called finalizePrice on ${networkName} from ${
      wallet.address
    }. Gas used: ${gasUsed.toString()}. Cost for this transaction: ${ethers.utils.formatEther(
      cost.toString(),
    )} ETH`,
  );

  console.log(
    `\nGrand Total Gas Cost for all finalizePrice calls: ${ethers.utils.formatEther(
      totalGasCost.toString(),
    )} ETH`,
  );

  return {
    totalGasCost,
    gasUsed: gasUsed,
  };
}
