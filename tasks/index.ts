import { task } from "hardhat/config";

task("benchmark-simple-oracle", "Benchmarks the SimpleOracle contract")
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

// This gets called automatically when running benchmark-simple-oracle
task("update-prices", "Updates prices")
  .addParam("contract", "The address of the SimpleOracle contract")
  .addParam("duration", "The amount of time to execute updatePrice method", "1")
  .setAction(require("./update-prices"));

// This gets called automatically when running benchmark-simple-oracle
task("finalize-price", "Finalize prices")
  .addParam("contract", "The address of the SimpleOracle contract")
  .setAction(require("./finalize-price"));