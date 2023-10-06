import { task, types } from "hardhat/config";

task("deploy", "Deploys the contracts")
  .addOptionalParam("duration", "The duration parameter", "1")
  .addOptionalParam("dataProviderCount", "Number of data providers", "3")
  .addOptionalParam("fundAmount", "Fund amount for each data provider", ".004")
  .setAction(require("../deploy/SimpleOracle"));
  
task(
    "register-data-providers",
    "Registers data providers on the SimpleOracle contract",
  )
    .addParam("contract", "The address of the SimpleOracle contract")
    .addOptionalParam(
      "dataProviderCount",
      "The number of data providers to register",
      "3",
    )
    .addOptionalParam(
      "fundAmount",
      "The amount of ETH to fund each data provider with",
      ".004",
    )
    .addOptionalParam(
      "duration",
      "The amount of time to execute updatePrice method",
      "1",
    )
    .setAction(require("./register-data-providers"));

task("update-prices", "Updates prices")
  .addParam("contract", "The address of the SimpleOracle contract")
  .addParam("duration", "The amount of time to execute updatePrice method", "1")
  .setAction(require("./update-prices"));
