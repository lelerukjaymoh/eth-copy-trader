import { providers } from "ethers";
import { readFileSync } from "fs";
import Web3 from "web3";
import { botParams } from "../config/setup";

if (!process.env.RINKEBY_JSON_RPC || !process.env.RINKEBY_WALLET_ADDRESS) {
  throw new Error("RINKEBY_JSON_RPC was not provided in .env");
}

const web3 = new Web3(process.env.RINKEBY_JSON_RPC);
const provider = new providers.JsonRpcProvider(process.env.RINKEBY_JSON_RPC);

function toHex(currencyAmount: any) {
  if (currencyAmount.toString().includes("e")) {
    let hexedAmount = currencyAmount.toString(16);
    return `0x${hexedAmount}`;
  } else {
    let parsedAmount = parseInt(currencyAmount);
    let hexedAmount = parsedAmount.toString(16);
    return `0x${hexedAmount}`;
  }
}

const uniswapABI = JSON.parse(
  readFileSync(`src/uniswap/pancakeSwapABI.json`, "utf8")
);

const smartContractABI = JSON.parse(
  readFileSync("src/uniswap/swapperABI.json", "utf8")
);

const smartContract = new web3.eth.Contract(
  smartContractABI,
  botParams.swapperAddress
);

const tokenAllowance = async (tokenAddress: string, walletAddress: string) => {
  try {
    console.log("Token ", tokenAddress);
    const tokenContract = new web3.eth.Contract(uniswapABI, tokenAddress);
    return await tokenContract.methods
      .allowance(botParams.swapperAddress, botParams.uniswapv2Router)
      .call();
  } catch (error) {
    console.log("Error fetching the allownce amount ", error);
  }
};

const tokenBalance = async (tokenAddress: string, walletAddress: string) => {
  try {
    const tokenContract = new web3.eth.Contract(uniswapABI, tokenAddress);
    return await tokenContract.methods.balanceOf(walletAddress).call();
  } catch (error) {
    console.log("Error getting token balance");
  }
};

const currentNonce = async () => {
  try {
    return provider.getTransactionCount(process.env.RINKEBY_WALLET_ADDRESS!);
  } catch (error) {
    console.log("Error getting wallet nonce : ", error);
  }
};

const wait = async (ms: number) => {
  console.log(`\n\n Waiting for ${ms / 1000} secs ... \n\n`);
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export {
  tokenBalance,
  wait,
  toHex,
  currentNonce,
  uniswapABI,
  smartContract,
  tokenAllowance,
};
