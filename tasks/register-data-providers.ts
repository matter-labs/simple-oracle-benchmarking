import { ethers } from "ethers";
import { fundAccount, WalletManager } from "../utils/fundingUtils";

// To run:
// npx hardhat register-data-providers --contract <SimpleOracleContractAddress> --target-network <networkName> --data-provider-count 4 --fund-amount ".005"

const fetchContractABI = () => {
    const ContractArtifact = require("../artifacts-zk/contracts/SimpleOracle.sol/SimpleOracle.json");
    return ContractArtifact.abi;
};

module.exports = async function(taskArgs, hre) {
  const { contract, dataProviderCount = 3, fundAmount = ".004", duration = 1 } = taskArgs;
  const provider = new ethers.providers.JsonRpcProvider(hre.network.config.url);
  const accounts = hre.network.config.accounts || [];
  const deployerAccount = accounts[0];
  const deployerWallet = new ethers.Wallet(deployerAccount).connect(provider);
  
  // Create new data providers
  const dataProviders = Array(Number(dataProviderCount))
    .fill(null)
    .map(() => new ethers.Wallet(ethers.Wallet.createRandom().privateKey));

  const connectedWallets = dataProviders.map((wallet) => wallet.connect(provider));
  WalletManager.updateConnectedWallets(connectedWallets);

  // Fund data providers
  console.log("💰 Funding data providers...");
  for (const dataProvider of dataProviders) {
    await fundAccount(deployerWallet, dataProvider.address, fundAmount);
  }

  const contractInstance = new ethers.Contract(
    contract,
    fetchContractABI(),
    connectedWallets[0]
  );

  // Register data providers
  console.log("\n🗳️  Registering data providers...");
  for (const wallet of connectedWallets) {
    const tx = await contractInstance.connect(wallet).registerDataProvider();
    await tx.wait();
    console.log(`📝 Registered data provider ${wallet.address} 📍 Tx Hash: ${tx.hash}`);
  }
  console.log(`\n✅ ${connectedWallets.length} Data providers registered!`);
  await hre.run("update-prices", { contract, duration });
};