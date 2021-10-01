import "@nomiclabs/hardhat-waffle";
import { config as dotEnvConfig } from "dotenv";

dotEnvConfig({ path: `${__dirname}/.env` });

if (!process.env.PRIVATE_KEY || !process.env.RINKBEY_JSON_RPC) {
  throw new Error(
    `Please provide your BSC PRIVATE_KEY or JSON_RPC in .env file`
  );
}

module.exports = {
  networks: {
    hardhat: {},
    mainnet: {
      url: process.env.RINKBEY_JSON_RPC,
      chainId: 4,
      gasPrice: 5 * 10 ** 9,
      accounts: [
        process.env.PRIVATE_KEY.startsWith("0x")
          ? process.env.PRIVATE_KEY
          : `0x${process.env.PRIVATE_KEY}`,
      ],
    },
    rinkeby: {
      url: process.env.RINKEBY_RPC,
      chainId: 4,
      gasPrice: 5 * 10 ** 9,
      accounts: [
        process.env.PRIVATE_KEY.startsWith("0x")
          ? process.env.PRIVATE_KEY
          : `0x${process.env.PRIVATE_KEY}`,
      ],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.7.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        }
      }
    ],
  },
};
