import "@nomiclabs/hardhat-waffle";
import { config as dotEnvConfig } from "dotenv";
import { DEFAULT_GAS_PRICE } from "./src/config/setup";

dotEnvConfig({ path: `./.env` });

if (!process.env.PRIVATE_KEY || !process.env.JSON_RPC) {
  throw new Error(
    `Please provide your PRIVATE_KEY or JSON_RPC in .env in the project root`
  );
}

module.exports = {
  networks: {
    hardhat: {},
    mainnet: {
      url: process.env.JSON_RPC,
      chainId: 1,
      gasPrice: DEFAULT_GAS_PRICE,
      accounts: [
        process.env.PRIVATE_KEY.startsWith("0x")
          ? process.env.PRIVATE_KEY
          : process.env.PRIVATE_KEY,
      ],
    },
    rinkeby: {
      url: process.env.RINKEBY_JSON_RPC,
      chainId: 4,
      gasPrice: 5 * 10 ** 9,
      accounts: [
        process.env.PRIVATE_KEY!.startsWith("0x")
          ? process.env.PRIVATE_KEY
          : `0x${process.env.PRIVATE_KEY}`,
      ],
    },
  },
  etherscan: {
    apiKey: process.env.BSC_SCAN_API,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
};
