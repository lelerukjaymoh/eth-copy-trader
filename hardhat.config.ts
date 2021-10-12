import "@nomiclabs/hardhat-waffle";
import { config as dotEnvConfig } from "dotenv";

dotEnvConfig({ path: `${__dirname}/.env` });

if (!process.env.PRIVATE_KEY) {
  throw new Error(
    `Please provide your BSC PRIVATE_KEY in .env in the project root`
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
      chainId: 56,
      gasPrice: 20000000000,
      accounts: [
        process.env.PRIVATE_KEY.startsWith("0x")
          ? process.env.PRIVATE_KEY
          : `0x${process.env.PRIVATE_KEY}`,
      ],
    },
    rinkeby: {
      url: process.env.RINKBEY_JSON_RPC,
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
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        }
      }
    ],
    // version: "0.8.0",
  },
};
