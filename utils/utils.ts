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

// Utility function for formatting units
export function formatUnits(value: ethers.BigNumber, unit: string): string {
  return ethers.utils.formatUnits(value, unit);
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
// TODO: fix and test
export function toCSV(data: any[]): string {
  const header = Object.keys(data[0]).join(",");
  const rows = data
    .map((row) => {
      return Object.values(row)
        .map((field) => {
          if (field && typeof field === "object" && "hex" in field) {
            return field.hex;
          }
          return field;
        })
        .join(",");
    })
    .join("\n");
  return `${header}\n${rows}`;
}
