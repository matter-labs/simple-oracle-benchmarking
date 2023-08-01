import * as ethers from "ethers";
import { deployToZkSync } from "./utils/deploymentUtils"; // Update this import path
import { fundAccount } from "./utils/fundingUtils";
import * as ContractArtifact from "../artifacts-zk/contracts/SimpleOracle.sol/SimpleOracle.json";
import dotenv from "dotenv";
dotenv.config();

interface DeployedContract {
  address: string;
  gas: number;
}

async function main() {
  // Get the deployer's wallet
  // Initialize Network
  const provider = new ethers.providers.JsonRpcProvider(
    "http://localhost:8011",
  );
  const deployer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY).connect(
    provider,
  );

  // Deploy the SimpleOracle contract
  const deployed: DeployedContract = await deployToZkSync(
    "http://localhost:8011",
    deployer,
  );
  console.log(`SimpleOracle deployed at address: ${deployed.address}`);

  const simpleOracle = new ethers.Contract(
    deployed.address,
    ContractArtifact.abi,
    deployer,
  );

  let wallet = new ethers.Wallet(ethers.Wallet.createRandom().privateKey);
  wallet = wallet.connect(provider);
  await fundAccount(deployer, wallet.address, "10");

  const signer = simpleOracle.connect(wallet);
  for (let i = 1; i <= 10; i++) {
    const newPrice = i * 1000; // Example price, you can adjust this
    const tx = await signer.updatePrice(newPrice);
    const receipt = await tx.wait();
    console.log(`Transaction Hash: ${tx.hash}`);
    console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
  }

  console.log("Script completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
