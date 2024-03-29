import "@nomiclabs/hardhat-waffle";
import { config as dotEnvConfig } from "dotenv";
import { DEFAULT_GAS_PRICE } from "./src/config/setup";
import { init } from "./src/initialize";

dotEnvConfig({ path: `./.env` });

// initializing the bot
init()


module.exports = {
  networks: {
    hardhat: {},
    mainnet: {
      url: process.env.JSON_RPC,
      chainId: 1,
      gasPrice: DEFAULT_GAS_PRICE,
      accounts: [
        process.env.V2_PRIVATE_KEY!.startsWith("0x")
          ? process.env.V2_PRIVATE_KEY
          : process.env.V2_PRIVATE_KEY,
      ],
    },
    rinkeby: {
      url: process.env.JSON_RPC,
      chainId: 4,
      gasPrice: 5 * 10 ** 9,
      accounts: [
        process.env.V2_PRIVATE_KEY!.startsWith("0x")
          ? process.env.V2_PRIVATE_KEY
          : `0x${process.env.V2_PRIVATE_KEY}`,
      ],
    },
  },
  etherscan: {
    apiKey: process.env.ETHER_SCAN_API,
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
