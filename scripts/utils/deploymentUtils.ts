import * as ethers from "ethers";
import * as ContractArtifact from "../../artifacts-zk/contracts/SimpleOracle.sol/SimpleOracle.json";
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet, Provider } from "zksync-web3";

const LOCALHOST_URL = "http://localhost:3050";
const ZKSYNC_TESTNET = "https://testnet.era.zksync.dev";

interface DeployedContract {
  address: string;
  gas: number;
}

/**
 * Deploys a contract to zkSync Era network.
 * @param {any} networkConfig - The network configuration object.
 * @param {ethers.Wallet} deployer - The deployer's wallet.
 * @returns {Promise<DeployedContract>} - A promise that resolves to the deployed contract.
 */
export async function deployZkSyncLocalTestnet(
  networkConfig: any,
  deployer: ethers.Wallet,
): Promise<DeployedContract> {
  let zkProvider = new Provider(networkConfig.rpcEndpoint);
  let zkWallet = new Wallet(networkConfig.richWalletPK, zkProvider);
  let zkDeployer = zkWallet.connect(zkProvider);
  let contract = await deployContract(networkConfig.rpcEndpoint, zkDeployer);
  console.log("Contract deployed to", contract.address);
  return contract;
}

export async function deployOptimismTestnet(
  networkConfig: any,
  deployer: ethers.Wallet,
): Promise<DeployedContract> {
  let contract = await deployContract(networkConfig.rpcEndpoint, deployer);
  console.log("Contract deployed to", contract.address);
  return contract;
}

/**
 * Deploys a contract to the specified network using the provided deployer wallet.
 * @param {string} networkName - The name of the network to deploy the contract to.
 * @param {any} deployerWallet - The wallet to use for deploying the contract.
 * @returns {Promise<{ address: string, gas: number }>} An object containing the deployed contract's address and gas used.
 * @throws {Error} If the contract bytecode or ABI is missing, or if the contract deployment fails.
 */
export async function deployContract(
  networkName: string,
  deployerWallet: any,
): Promise<{ address: string; gas: number }> {
  if (!ContractArtifact.bytecode || !ContractArtifact.abi) {
    throw new Error("Missing contract bytecode or ABI.");
  }

  const bytecode = ContractArtifact.bytecode;
  const abi = ContractArtifact.abi;
  // NOTE: This is specifically for zkSync
  // having issues not using Deployer class from hardhat-zksync-deploy
  let deployer =
    networkName === LOCALHOST_URL || networkName === ZKSYNC_TESTNET
      ? new Deployer(hre, deployerWallet).ethWallet
      : deployerWallet;

  const contractFactory = new ethers.ContractFactory(abi, bytecode, deployer);
  const contractInstance = await contractFactory.deploy();

  if (!contractInstance) {
    throw new Error("Failed to deploy the contract.");
  }

  const receipt = await contractInstance.deployed();
  console.log(
    `\nSimpleOracle deployed to ${networkName} at ${contractInstance.address}`,
  );

  const gasLimit = receipt.deployTransaction.gasLimit;
  const gasPrice =
    receipt.deployTransaction.gasPrice || ethers.BigNumber.from(250_000_000);

  if (!gasLimit || !gasPrice) {
    throw new Error(
      "Failed to retrieve gas information from the deploy transaction.",
    );
  }

  return {
    address: contractInstance.address,
    gas: gasLimit.mul(gasPrice).toNumber(),
  };
}
