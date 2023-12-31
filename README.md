# Simple Oracle Benchmarking 📊

Benchmark the gas costs for a simple oracle contract across different networks!

## How It Works 🛠

1. **Deploy**: The script deploys a simple oracle contract to a specified network.
2. **Register Data Providers**: Three dataProviders are created, funded, and then registered.
3. **Update Prices**: Each dataProvider updates the price with a random value X number of times. Default is 5 per data provider. (To adjust the max-updates, pass in `--max-updates x`).
4. **Finalize Prices**: The `finalizePrice` function is called from the owner's account.
5. **Review Results**: At the end, you get a detailed table showcasing the gas costs for each operation. 📈

## Prerequisites 📋

- Node.js
- Yarn

## Setup and Execution 🚀

## 1. Install Dependencies

```bash
yarn install
```

## 2. Compile the Oracle Contract

```bash
yarn hardhat compile
```

## 3. Local Environments

Provided in this repo are scripts that will clone and execute local dev environments for zkSync Era, Arbitrum, Optimism, and PolygonzkEVM. To run:

```bash
cd scripts/local-setups
```

Then execute the script you want to run:
```bash
./zksync.sh | ./optimism.sh | ./arbitrum.sh | ./polygonzkEVM.sh
```

**Note:** If you want to learn more about a local zkSync network, start the zkSync local environment first. 

📖 [zkSync Docs - Testing](https://era.zksync.io/docs/tools/testing/)

## 4. Environment Variables Setup 🌳

Rename `.env.example` to `.env` and fill in your details:

```
# Local private keys for testing these are RICH accounts created by the local node (under /scripts)
LOCAL_ZKSYNC_KEY=
LOCAL_OPTIMISM_KEY=
LOCAL_POLYGONZK_KEY=
LOCAL_ARBITRUM_KEY=
LOCAL_LINEAR_KEY=
LOCAL_SCROLL_KEY=

# Private keys for the testnet, can be used for all networks
TESTNET_KEY=

# Private keys for the mainnet, can be used for all networks
MAINNET_KEY=
```

## 5. Benchmark Execution

### Benchmarking

Run the benchmark task using:

```bash
npx hardhat benchmark-simple-oracle --network <network> --data-provider-count <int> --fund-amount <int> --max-updates <int>
```

#### Default Parameters:
- **Data Provider Count**: 3
- **Fund Amount**: 0.004 ETH
- **Max Updates**: 5 updatePrice call for each data provider

#### Example:

```bash
npx hardhat benchmark-simple-oracle --network zksync-local --max-updates 10
```

This will deploy the `SimpleOracle.sol` contract to the specified network, proceed to register the data providers, then call update price with random numbers for the specified amount of times (e.g. 10 times per data provider), finalize the price, and provide a gas breakdown for each operation. 

### Additional Tasks

- **Unit Testing**: `yarn test`
- **Code Formatting**: `yarn fix:fmt`
