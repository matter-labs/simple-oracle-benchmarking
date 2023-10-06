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
  const txResponse = await wallet.sendTransaction({
    to: address,
    value: ethers.utils.parseEther(amount),
  });
  
  await txResponse.wait();
  console.log(`💵 Funded ${address} with ${amount} ETH. 📍 Tx Hash: ${txResponse.hash}`);
}

export const WalletManager = {
  connectedWallets: [] as ethers.Wallet[],
  updateConnectedWallets(wallets: ethers.Wallet[]) {
    this.connectedWallets = wallets;
  },
  getConnectedWallets() {
    return this.connectedWallets;
  },
};
