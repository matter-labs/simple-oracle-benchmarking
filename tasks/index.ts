import { task } from "hardhat/config";

// This task triggers the following:
// - deploys SimpleOracle
// - registers data providers
// - updates prices
// - finalizes price
// - Prints out gas usage
task("benchmark-simple-oracle", "Benchmarks the SimpleOracle contract")
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
  .setAction(async (args, hre) => {
    await require("../deploy/SimpleOracle")(hre, args);
  });

// This gets called automatically when running benchmark-simple-oracle
task("register-providers", "Registers data providers")
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
