import * as ethers from "ethers";

/**
 * Sends Ether from a wallet to a specified address.
 * @param {ethers.Wallet} wallet - The wallet to send Ether from.
 * @param {string} address - The address to send Ether to.
 * @param {string} amount - The amount of Ether to send, in Ether.
 * @returns {Promise<void>} - A Promise that resolves when the transaction has been mined.
 */
export async function fundAccount(
  wallet: ethers.Wallet,
  address: string,
  amount: string,
) {
  try {
    const txResponse = await wallet.sendTransaction({
      to: address,
      value: ethers.utils.parseEther(amount),
    });
    await txResponse.wait();
    console.log(`💵 Funded ${address} with ${amount} ETH. 📍 Tx Hash: ${txResponse.hash}`);
  } catch (e) {
    console.log(`❌ Error funding ${address} with ${amount} ETH: ${e.message}`);
  }
}

// Utility function for formatting units
export function formatUnits(value: ethers.BigNumber, unit: string): string {
  return ethers.utils.formatUnits(value, unit);
}
// Utility function for managing connected wallets
export const WalletManager = {
  connectedWallets: [] as ethers.Wallet[],
  updateConnectedWallets(wallets: ethers.Wallet[]) {
    this.connectedWallets = wallets;
  },
  getConnectedWallets() {
    return this.connectedWallets;
  },
};
// Utility function for fetching contract ABI for a given network
export const fetchContractABI = (networkName: string) => {
  if (networkName.startsWith("zksync")) {
    const ContractArtifact = require("../artifacts-zk/contracts/SimpleOracle.sol/SimpleOracle.json");
    return ContractArtifact.abi;
  } else {
    const ContractArtifact = require("../artifacts/contracts/SimpleOracle.sol/SimpleOracle.json");
    return ContractArtifact.abi;
  }
};
