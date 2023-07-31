# Simple Oracle Benchmarking 📊🔍

Benchmark the gas costs for a simple oracle contract across different networks! 💡

## How It Works 🛠

1. **Deploy**: The script deploys a simple oracle contract to a specified network.
2. **Register Data Providers**: Three dataProviders are created, funded, and then registered.
3. **Update Prices**: Each dataProvider updates the price with a random value every second for 60 seconds. (To adjust the duration, modify the value in `/scripts/oracleOps.ts`).
4. **Finalize Prices**: The `finalizePrice` function is called from the owner's account every second for 60 seconds.
5. **Review Results**: At the end, you get a detailed table showcasing the gas costs for each operation. 📈

## Prerequisites 📋

- Node.js
- Yarn

## Setup and Execution 🚀

### 1. Install Dependencies

```bash
yarn install
```

### 2. Compile the Oracle Contract

```bash
yarn compile:contracts
```

### 3. Local zkSync Environment

If you're planning to run this against a local zkSync network, start the zkSync local environment first. Ensure it runs against the Dockerized setup. 

📖 [zkSync Docs - Testing](https://era.zksync.io/docs/tools/testing/)

### 4. Environment Variables Setup 🌳

For security reasons (especially to avoid the leakage of private keys), we use the `dotenv` package. 

Rename `.env.example` to `.env` and fill in your details:

```
WALLET_PRIVATE_KEY=your_private_key_here
```

### 5. Running the Benchmark

```bash
yarn run:benchmark
```

## Useful Commands 🛠

`yarn test`: Runs unit test
`yarn run:benchmark`: Starts benchmarking script from `benchmark.ts`
`yarn deploy`: Deploy SimpleOracle.sol
`yarn fix:fmt`: Fixes formatting

## Testnets 🌍

To run against testnets like zkSync, Polygon Mumbai, Polygon zkEVM, Optimism, and Arbitrium, ensure you have funds in a wallet for each network to cover the deployment and oracle operation costs.

- Uncomment the desired networks in `/scripts/networks`.
- Run script `yarn run:benchmark`
