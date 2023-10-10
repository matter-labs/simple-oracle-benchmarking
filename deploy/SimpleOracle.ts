import { Wallet } from "zksync-web3";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "ethers";
import GasTracker, { getGasTracker } from "../utils/gasTracker";

// To run:
// npx hardhat benchmark-simple-oracle --network <network>

async function deployOnZkSync(
  deployer: Deployer,
  gasTracker: GasTracker,
): Promise<string> {
  const startBalance = await deployer.zkWallet.getBalance();
  const artifact = await deployer.loadArtifact("SimpleOracle");
  const simpleOracleContract = await deployer.deploy(artifact, []);
  const receipt = await simpleOracleContract.deployTransaction.wait();
  console.log(
    `🚀 ${artifact.contractName} was successfully deployed to ${simpleOracleContract.address}`,
  );
  const endBalance = await deployer.zkWallet.getBalance();
  let gasPrice =
    receipt.effectiveGasPrice ||
    (await deployer.zkWallet.provider.getGasPrice());
  const gasCost = gasPrice.mul(receipt.gasUsed);
  const balanceDifference = startBalance.sub(endBalance);

  gasTracker.deployment.totalGasUsed = gasTracker.deployment.totalGasUsed.add(
    receipt.gasUsed,
  );
  gasTracker.deployment.totalGasCost =
    gasTracker.deployment.totalGasCost.add(gasCost);
  gasTracker.deployment.totalBalanceDifference =
    gasTracker.deployment.totalBalanceDifference.add(balanceDifference);

  return simpleOracleContract.address;
}

async function deployOnOtherNetworks(
  deployments: any,
  deployer: ethers.Wallet,
  gasTracker: GasTracker,
): Promise<string> {
  const { deploy } = deployments;
  const startBalance = await deployer.getBalance();
  let deployedContract: any;
  try {
    deployedContract = await deploy("SimpleOracle", {
      from: deployer.address,
      log: true,
      waitConfirmations: 1,
      tags: ["SimpleOracle"],
    });
    console.log(
      `🚀 SimpleOracle was successfully deployed to ${deployedContract.address}`,
    );
    const { receipt } = deployedContract;
    const endBalance = await deployer.getBalance();
    let gasPrice =
      receipt.effectiveGasPrice || (await deployer.provider.getGasPrice());
    const gasCost = gasPrice.mul(receipt.gasUsed);
    const balanceDifference = startBalance.sub(endBalance);

    gasTracker.deployment.totalGasUsed = gasTracker.deployment.totalGasUsed.add(
      receipt.gasUsed,
    );
    gasTracker.deployment.totalGasCost =
      gasTracker.deployment.totalGasCost.add(gasCost);
    gasTracker.deployment.totalBalanceDifference =
      gasTracker.deployment.totalBalanceDifference.add(balanceDifference);
  } catch (e) {
    console.log("error: ", e);
  }

  return deployedContract.address;
}

module.exports = async function (
  hre: HardhatRuntimeEnvironment,
  taskArgs: any,
) {
  const networkName = hre.network.name;
  const provider = new ethers.providers.JsonRpcProvider(hre.network.config.url);
  const accounts = hre.network.config.accounts || [];
  const deployerAccount = accounts[0];
  console.log(
    `🌐 Deploying to network: ${networkName} at ${
      (hre.network.config as any).url
    }`,
  );
  // Initialize the GasTracker instance
  const gasTracker = getGasTracker();
  const networkConfig = hre.network.config;
  let contract: string;
  if (networkConfig && networkConfig.zksync) {
    const wallet = new Wallet(deployerAccount);
    const deployer = new Deployer(hre, wallet);
    console.log(`👤 Deployer address: ${deployer.zkWallet.address}`);
    contract = await deployOnZkSync(deployer, gasTracker);
  } else {
    const wallet = new ethers.Wallet(deployerAccount).connect(provider);
    console.log(`👤 Deployer address: ${wallet.address}`);
    contract = await deployOnOtherNetworks(hre.deployments, wallet, gasTracker);
  }
  console.log(`\n✅ SimpleOracle Deployment Summary:`);
  console.log(
    "- Total Gas Used:",
    gasTracker.getTotalGasUsedFormatted("deployment"),
  );
  console.log(
    "- Total Gas Cost:",
    gasTracker.getTotalGasCostFormatted("deployment"),
  );
  console.log(
    "- Total Balance Difference:",
    gasTracker.getTotalBalanceDifferenceFormatted("deployment"),
  );

  await hre.run("register-providers", { contract, ...taskArgs });
};

module.exports.tags = ["SimpleOracle"];
