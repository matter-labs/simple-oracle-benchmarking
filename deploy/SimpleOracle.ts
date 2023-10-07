import { Wallet } from "zksync-web3";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// To run:
// npx hardhat --network zksync-local deploy --tags SimpleOracle

async function deployOnZkSync(
  deployer: Deployer,
): Promise<string> {
  const artifact = await deployer.loadArtifact("SimpleOracle");
  const simpleOracleContract = await deployer.deploy(artifact, []);
  console.log(
    `🚀 ${artifact.contractName} was successfully deployed to ${simpleOracleContract.address}`,
  );
  return simpleOracleContract.address; 
}

async function deployOnOtherNetworks(
  deployments: any,
  getNamedAccounts: any,
): Promise<string>  {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const deployedContract = await deploy("SimpleOracle", {
    from: deployer,
    log: true,
    waitConfirmations: 1,
    tags: ["SimpleOracle"],
  });
  return deployedContract.address;
}

module.exports = async function (hre: HardhatRuntimeEnvironment,  deployments: any, getNamedAccounts: any) {
  const networkName = hre.network.name;
  const accounts = hre.network.config.accounts || [];
  const deployerAccount = accounts[0];
  console.log(`🌐 Deploying to network: ${networkName} at ${hre.network.config.url}`);

  const networkConfig = hre.network.config;
  
  if (networkConfig && networkConfig.zksync) {
    const wallet = new Wallet(deployerAccount);
    const deployer = new Deployer(hre, wallet);
    console.log(`👤 Deployer address: ${deployer.zkWallet.address}`);
    await deployOnZkSync(deployer);
    
  } else {
    console.log(`👤 Deployer address: ${await getNamedAccounts().deployer}`);
    await deployOnOtherNetworks(deployments, getNamedAccounts);
  }
  //   await hre.run("register-data-providers", {
  //     contract: contractAddress,
  //     dataProviderCount: dataProviderCount || 3,
  //     fundAmount: fundAmount || ".004",
  //     duration: duration || 1,
  // });
}

module.exports.tags = ["SimpleOracle"];