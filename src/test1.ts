import WebSocket from "ws";
import { ethers } from "ethers";
// import Web3 from "web3";
// import { ChainId, Fetcher } from "@uniswap/sdk";

// const ws = new WebSocket("ws://162.55.241.162:8546");

const iprovider = new ethers.providers.JsonRpcProvider(
  "http://162.55.241.162:8545"
);

// console.log(iprovider);

const main = async () => {
  try {
    iprovider.on("pending", (tx: any) => {
      console.log(tx);
    });

    // ws.on("open", (tx: any) => {
    //   console.log(tx);
    // });
  } catch (error) {
    console.log(error);
  }
};

main();

// /**
//  *

// [Eth]
// LightPeers = 0
// UltraLightFraction = 0

// [Node.P2P]
// MaxPeers = 200

// [Node]
// DataDir = "/mnt/3dx/.ethereum"
// IPCPath = "geth.ipc"
// HTTPHost = "162.55.241.162"
// HTTPPort = 8545
// HTTPCors = ["*"]
// HTTPVirtualHosts = [""]
// HTTPModules = ["eth", "net", "web3", "admin", "debug", "txpool"]
// WSHost = "162.55.241.162"
// WSPort = 8545
// WSOrigins = ["*"]
// WSModules = ["eth", "net", "web3", "admin", "debug", "txpool"]
// GraphQLCors = ["*"]
// GraphQLVirtualHosts = ["*"]

//  */
