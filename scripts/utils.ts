import * as ethers from 'ethers';
import * as ContractArtifact from "../artifacts-zk/contracts/SimpleOracle.sol/SimpleOracle.json";
import * as hre from 'hardhat';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';

export async function deployContract(networkName: string, deployerWallet: any): Promise<{ address: string, gas: number }> {
    
    const bytecode = ContractArtifact.bytecode;
    const abi = ContractArtifact.abi;
    let deployer;
    // TODO: make better
    if (networkName === 'https://testnet.era.zksync.dev') {
        console.log("Deploying to local zkSync network");
        deployer = new Deployer(hre, deployerWallet);
        deployer = deployer.ethWallet;
    } else {
        console.log("Deploying to Optimism Testnet")
        deployer = deployerWallet;
    }
    const contractFactory = new ethers.ContractFactory(abi, bytecode, deployer);
    console.log("Deploying contract");
    const contractInstance = await contractFactory.deploy();
    console.log("Waiting for contract to be deployed");
    const receipt = await contractInstance.deployed();
    console.log("Contract deployed");
    console.log(`SimpleOracle deployed to ${networkName} at ${contractInstance.address}`);

    const gasLimit = receipt.deployTransaction.gasLimit;
    let gasPrice;
    if (receipt.deployTransaction.gasPrice === null) {gasPrice = ethers.BigNumber.from(250_000_000)} else {gasPrice = receipt.deployTransaction.gasPrice};

    if (!gasLimit || !gasPrice) {
        throw new Error("Failed to retrieve gas information from the deploy transaction.");
    }

    return {
        address: contractInstance.address,
        gas: gasLimit.mul(gasPrice).toNumber()
    };
}

export async function registerDataProviders(contractAddress: string, networkName: string, wallets: ethers.Wallet[]): Promise<number> {
    const provider = new ethers.providers.JsonRpcProvider(networkName);
    wallets = wallets.map(wallet => wallet.connect(provider));
    const contract = new ethers.Contract(contractAddress, ContractArtifact.abi, wallets[0]);

    let totalGas = ethers.BigNumber.from(0);

    for (let wallet of wallets) {
        let tx = await contract.connect(wallet).registerDataProvider();
        let receipt = await tx.wait();
        //let registeredProvider = await contract.dataProviders(wallet.address);
        console.log(`Registered data provider on ${networkName}: ${wallet.address}`);

        let gasLimit = receipt.gasUsed;
        let gasPrice;
        if (receipt.effectiveGasPrice === null || undefined) {
            gasPrice = ethers.BigNumber.from(250_000_000);
        } else {
            gasPrice = receipt.effectiveGasPrice;
        }

        if (!gasLimit || !gasPrice) {
            throw new Error("Failed to retrieve gas information from the registration transaction.");
        }

        totalGas = totalGas.add(gasLimit.mul(gasPrice));
    }

    return totalGas.toNumber();
}

export async function updatePrices(contractAddress: string, networkName: string, wallets: ethers.Wallet[]): Promise<{ individualCosts: Record<string, any>, totalGasCost: ethers.BigNumber }> {
    const provider = new ethers.providers.JsonRpcProvider(networkName);
    wallets = wallets.map(wallet => wallet.connect(provider));
    const contract = new ethers.Contract(contractAddress, ContractArtifact.abi, wallets[0]);

    const DURATION_MINUTES = 1;
    const UPDATE_INTERVAL_MILLISECONDS = 1000; 
    const endTime = Date.now() + DURATION_MINUTES * 60 * 1000;

    let results: Record<string, any> = {};
    let grandTotalGasCost = ethers.BigNumber.from(0);

    await Promise.all(wallets.map(async (wallet) => {
        const walletKey = `dataProvider${wallets.indexOf(wallet) + 1}`;
        results[walletKey] = {
            txCount: 0,
            costs: [],
            totalGas: ethers.BigNumber.from(0)
        };

        const withSigner = contract.connect(wallet);

        while (Date.now() < endTime) {
            const randomPrice = Math.floor(Math.random() * 1000);
            const tx = await withSigner.updatePrice(randomPrice);
            const receipt = await tx.wait();

            const gasUsed = receipt.gasUsed;
            const gasPrice = tx.gasPrice || ethers.BigNumber.from(250_000_000);
            const cost = gasUsed.mul(gasPrice);

            results[walletKey].costs.push(cost);
            results[walletKey].txCount++;
            results[walletKey].totalGas = results[walletKey].totalGas.add(cost);
            grandTotalGasCost = grandTotalGasCost.add(cost);

            console.log(`Updated price on ${networkName} for ${wallet.address}: ${randomPrice}. Gas used: ${gasUsed.toString()}. Cost for this transaction: ${ethers.utils.formatEther(cost.toString())} ETH`);

            const sleepDuration = Math.max(UPDATE_INTERVAL_MILLISECONDS - (Date.now() - tx.timestamp), 0);
            await new Promise(resolve => setTimeout(resolve, sleepDuration));
        }
        results[walletKey].costs.push(results[walletKey].totalGas);
    }));

    console.log(`Grand Total Gas Cost for all Data Providers: ${ethers.utils.formatEther(grandTotalGasCost.toString())} ETH`);
    console.log("after updates balances: ", await Promise.all(wallets.map(async wallet => ethers.utils.formatEther(await wallet.getBalance()))) );
    return { individualCosts: results, totalGasCost: grandTotalGasCost };
}

// export async function finalizePrices(contractAddress: string, networkName: string): Promise<void> {
//     const provider = new Provider(networkName);
//     const signer = provider.getSigner(0); // assuming the deployer will finalize the price
//     const contract = new Contract(contractAddress, ContractArtifact.abi, signer);

//     const tx = await contract.finalizePrice();
//     await tx.wait();

//     console.log(`Finalized prices on ${networkName}`);
// }







