// // todo

// /**
//  * Calls the `finalizePrice` function on the provided contract and calculates the total gas costs.
//  *
//  * @param {string} contractAddress - Address of the contract on which the `finalizePrice` function should be called.
//  * @param {string} networkName - Name of the network to connect to using the JsonRpcProvider.
//  * @param {ethers.Wallet} wallet - Wallet instance that will be used to call the `finalizePrice` function.
//  *
//  * @returns {Promise<{
// *   totalGasCost: ethers.BigNumber;
// * }>} An object containing:
// *   - totalGasCost: The grand total gas cost for all the `finalizePrice` calls.
// */
// export async function finalizePrices(
//  contractAddress: string,
//  networkName: string,
//  wallet: ethers.Wallet,
// ): Promise<{
//  totalGasCost: ethers.BigNumber;
//  gasUsed: ethers.BigNumber;
//  deltaBalance: ethers.BigNumber;
// }> {
//  const provider = new ethers.providers.JsonRpcProvider(networkName);
//  const connectedWallet = wallet.connect(provider);
//  const contract = new ethers.Contract(
//    contractAddress,
//    ContractArtifact.abi,
//    connectedWallet,
//  );

//  let totalGasCost = ethers.BigNumber.from(0);
//  let gasPrice = ethers.BigNumber.from(0);
//  const startingBalance = await wallet.getBalance();

//  const tx = await contract.finalizePrice();
//  const receipt = await tx.wait();
//  const gasUsed = receipt.gasUsed;
//  gasPrice = receipt.effectiveGasPrice || (await wallet.provider.getGasPrice());
//  const cost = gasUsed.mul(gasPrice);
//  const afterBalance = await wallet.getBalance();
//  const deltaBalance = startingBalance.sub(afterBalance);

//  totalGasCost = totalGasCost.add(cost);

//  console.log(
//    `Called finalizePrice on ${networkName} from ${
//      wallet.address
//    }. Gas used: ${gasUsed.toString()}. Cost for this transaction: ${ethers.utils.formatEther(
//      cost.toString(),
//    )} ETH`,
//  );

//  console.log(
//    `\nGrand Total Gas Cost for all finalizePrice calls: ${ethers.utils.formatEther(
//      totalGasCost.toString(),
//    )} ETH`,
//  );

//  return {
//    totalGasCost,
//    gasUsed: gasUsed,
//    deltaBalance: deltaBalance,
//  };
// }