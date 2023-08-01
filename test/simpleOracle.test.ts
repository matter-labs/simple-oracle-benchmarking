import { expect } from "chai";
import { Wallet, Provider, Contract } from "zksync-web3";
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { fundAccount } from "./utils";

import dotenv from "dotenv";
dotenv.config();

const RICH_WALLET_PK = process.env.WALLET_PRIVATE_KEY || "";
const FUND_AMOUNT = "10";

async function deploySimpleOracle(deployer: Deployer): Promise<Contract> {
  const artifact = await deployer.loadArtifact("SimpleOracle");
  return await deployer.deploy(artifact);
}

describe("SimpleOracle", function () {
  let simpleOracle;
  let owner;
  let dataProvider1;
  let dataProvider2;

  beforeEach(async function () {
    const provider = new Provider(
      hre.userConfig.networks?.zkSyncLocalTestnet?.url,
    );
    const wallet = new Wallet(RICH_WALLET_PK, provider);
    const deployer = new Deployer(hre, wallet);

    simpleOracle = await deploySimpleOracle(deployer);
    owner = wallet; // Using the deployer's wallet as the owner

    dataProvider1 = new Wallet(Wallet.createRandom().privateKey, provider);
    dataProvider2 = new Wallet(Wallet.createRandom().privateKey, provider);

    await fundAccount(wallet, dataProvider1.address, FUND_AMOUNT);
    await fundAccount(wallet, dataProvider2.address, FUND_AMOUNT);
  });

  describe("DataProvider Operations", function () {
    it("Should register a data provider and update price", async function () {
      const tx = await simpleOracle
        .connect(dataProvider1)
        .registerDataProvider();
      await tx.wait();
      const registeredProvider = await simpleOracle.dataProviders(
        dataProvider1.address,
      );
      expect(registeredProvider.id, "DataProvider ID mismatch").to.equal(1);

      const tx2 = await simpleOracle.connect(dataProvider1).updatePrice(100);
      await tx2.wait();
      const updatedProvider = await simpleOracle.dataProviders(
        dataProvider1.address,
      );
      expect(updatedProvider.tempPrice, "Price update mismatch").to.equal(100);
    });
  });

  describe("Price Aggregation", function () {
    it("Should finalize the aggregated price", async function () {
      await simpleOracle
        .connect(dataProvider1)
        .registerDataProvider()
        .then((tx) => tx.wait());
      await simpleOracle
        .connect(dataProvider2)
        .registerDataProvider()
        .then((tx) => tx.wait());

      await simpleOracle
        .connect(dataProvider1)
        .updatePrice(100)
        .then((tx) => tx.wait());
      await simpleOracle
        .connect(dataProvider2)
        .updatePrice(200)
        .then((tx) => tx.wait());

      await simpleOracle.finalizePrice().then((tx) => tx.wait());

      const price = await simpleOracle.getPrice();
      expect(price, "Aggregated price mismatch").to.equal(150);
    });
  });
});
