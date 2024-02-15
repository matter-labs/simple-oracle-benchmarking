import * as ethers from "ethers";
import dotenv from "dotenv";
dotenv.config();

export const L1_RPC_URL = `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
// export const L1_RPC_URL = `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;

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

// Utility function for transferring remaining funds from data provider wallets to the deployer wallet
export const transferRemainingFunds = async (selectedWallet: ethers.Wallet, wallets: any, provider: any) => {
  console.log("\n------------------------------------------------------------");
  console.log("🔄 Transferring remaining funds to deployer wallet...");

  const safetyMargin = ethers.utils.parseUnits("0.002", "ether"); // Increased safety margin
  const minimumTransferable = ethers.utils.parseUnits("0.01", "ether"); // Minimum amount worth transferring

  for (const wallet of wallets) {
    const balance = await wallet.getBalance();
    if (balance.gt(safetyMargin)) { // Ensure there's at least the safety margin
      const gasPrice = await provider.getGasPrice();
      const estimatedGasLimit = ethers.BigNumber.from("21000"); // Standard gas limit for an ETH transfer
      const totalGasCost = estimatedGasLimit.mul(gasPrice).add(safetyMargin); // Include safety margin in gas cost

      const valueToSend = balance.sub(totalGasCost);
      if (valueToSend.gte(minimumTransferable)) { // Proceed only if the remaining value is above the minimum transferable amount
        const txObject = {
          to: selectedWallet.address,
          value: valueToSend,
          gasPrice: gasPrice,
          gasLimit: estimatedGasLimit,
        };

        try {
          const tx = await wallet.sendTransaction(txObject);
          const receipt = await tx.wait();
          console.log(`💸 Transferred ${ethers.utils.formatEther(valueToSend)} ETH from ${wallet.address} to ${selectedWallet.address} | Transaction: ${receipt.transactionHash}`);
        } catch (error) {
          console.error(`Failed to transfer from ${wallet.address} to ${selectedWallet.address}:`, error.message);
        }
      } else {
        console.log(`🚫 Wallet ${wallet.address} balance after gas costs is below the minimum transferable amount. Skipping transfer.`);
      }
    } else {
      console.log(`🚫 Wallet ${wallet.address} has insufficient funds to cover the safety margin. Skipping transfer.`);
    }
  }

  console.log("\n------------------------------------------------------------");
};
