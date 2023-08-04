import * as ethers from "ethers";
import * as ContractArtifact from "../../artifacts-zk/contracts/SimpleOracle.sol/SimpleOracle.json";
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet } from "zksync-web3";

interface DeployedContract {
  address: string;
  gas: number;
  gasUsed: ethers.BigNumber;
}

/**
 * Deploys the SimpleOracle contract to the zkSync Era network.
 * @param networkConfig The network configuration object.
 * @param deployerWallet The deployer's wallet.
 * @returns The deployed contract details.
 */
export async function deployToZkSync(
  networkConfig: any,
  deployerWallet: ethers.Wallet,
): Promise<DeployedContract> {
  const wallet = new Wallet(networkConfig.richWalletPK);
  const deployer = new Deployer(hre, wallet);

  const artifact = await deployer.loadArtifact("SimpleOracle");
  const deploymentFee = await deployer.estimateDeployFee(artifact, []);
  console.log(
    `Estimated deployment cost: ${ethers.utils.formatEther(
      deploymentFee.toString(),
    )} ETH`,
  );
  const contract = await deployer.deploy(artifact, []);
  return await recordDeployGasCosts(
    networkConfig.rpcEndpoint,
    deployer.ethWallet,
    contract,
  );
}

/**
 * Deploys the SimpleOracle contract to a testnet.
 * @param networkConfig The network configuration object.
 * @param deployer The deployer's wallet.
 * @returns The deployed contract details.
 */
export async function deployToTestnet(
  networkConfig: any,
  deployer: ethers.Wallet,
): Promise<DeployedContract> {
  
  const { bytecode, abi } = ContractArtifact;
  
  const contractFactory = new ethers.ContractFactory(abi, bytecode, deployer);
  const contractInstance = await contractFactory.deploy();
  console.log("contract", contractInstance);
  return await recordDeployGasCosts(
    networkConfig.rpcEndpoint,
    deployer,
    contractInstance,
  );
}

/**
 * Records the gas costs of deploying a contract.
 * @param networkName The name of the network.
 * @param deployerWallet The deployer's wallet.
 * @param contractInstance The instance of the deployed contract.
 * @returns The deployed contract's address and gas used.
 */
export async function recordDeployGasCosts(
  networkName: string,
  deployerWallet: ethers.Wallet,
  contractInstance: ethers.Contract,
): Promise<DeployedContract> {
  if (!ContractArtifact.bytecode || !ContractArtifact.abi) {
    throw new Error("Contract bytecode or ABI is missing.");
  }
  console.log("Deploying contract...");
  const receipt = await contractInstance.deployed();
  console.log("Contract deployed!");
  const gasUsed = await receipt.deployTransaction
    .wait()
    .then((tx) => tx.gasUsed);

  const gasPrice =
    receipt.deployTransaction.gasPrice || (await deployerWallet.getGasPrice());

  if (!gasUsed || !gasPrice) {
    throw new Error(
      "Failed to retrieve gas information from the deploy transaction.",
    );
  }

  console.log(
    `SimpleOracle deployed to ${networkName} at ${contractInstance.address}`,
  );
  return {
    address: contractInstance.address,
    gas: gasUsed.mul(gasPrice).toNumber(),
    gasUsed: gasUsed,
  };
}
