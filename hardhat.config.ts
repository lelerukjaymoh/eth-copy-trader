import "@nomiclabs/hardhat-waffle";
import { config as dotEnvConfig } from "dotenv";

dotEnvConfig({ path: `${__dirname}/.env` });

if (!process.env.PRIVATE_KEY || !process.env.RINKEBY_PRIVATE_KEY) {
  throw new Error(
    `Please provide your PRIVATE_KEY or RINKEBY_PRIVATE_KEY in .env in the project root`
  );
}
if (!process.env.JSON_RPC) {
  throw new Error(
    `Please provide your  INFURA_HTTP in .env in the project root`
  );
}

module.exports = {
  networks: {
    hardhat: {},
    mainnet: {
      url: process.env.JSON_RPC,
      chainId: 1,
      gasPrice: 130 * 10 ** 9,
      accounts: [
        process.env.PRIVATE_KEY.startsWith("0x")
          ? process.env.PRIVATE_KEY
          : `0x${process.env.PRIVATE_KEY}`,
      ],
    },
    rinkeby: {
      url: process.env.RINKEBY_JSON_RPC,
      chainId: 4,
      gasPrice: 5 * 10 ** 9,
      accounts: [
        process.env.RINKEBY_PRIVATE_KEY!.startsWith("0x")
          ? process.env.RINKEBY_PRIVATE_KEY
          : `0x${process.env.RINKEBY_PRIVATE_KEY}`,
      ],
    },
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
