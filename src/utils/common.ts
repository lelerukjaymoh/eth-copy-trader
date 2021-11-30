import { ethers, providers } from "ethers";
import { readFileSync } from "fs";
import Web3 from "web3";
import { botParams, GET_NONCE_TIMEOUT } from "../config/setup";
import UNISWAP_ABI from "../uniswap/erc20ABI.json";

if (
  !process.env.JSON_RPC ||
  !process.env.WALLET_ADDRESS ||
  !process.env.PRIVATE_KEY
) {
  throw new Error(
    "JSON_RPC or WALLET_ADDRESS || PRIVATE_KEY was not provided in .env"
  );
}

const web3 = new Web3(process.env.JSON_RPC);
const provider = new providers.JsonRpcProvider(process.env.JSON_RPC);

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

const smartContractABI = JSON.parse(
  readFileSync("src/uniswap/swapperABI.json", "utf8")
);

const signer = new ethers.Wallet(process.env.PRIVATE_KEY!);
const account = signer.connect(provider);

const smartContractInterface = new ethers.utils.Interface(smartContractABI);

const smartContract = new ethers.Contract(
  botParams.swapperAddress,
  smartContractInterface,
  account
);

// Initilise an interface of the ABI
const uniswapInterface = new ethers.utils.Interface(UNISWAP_ABI);

const tokenAllowance = async (tokenAddress: string, walletAddress: string) => {
  try {
    console.log("Token ", tokenAddress);
    const tokenContract = new web3.eth.Contract(
      JSON.parse(JSON.stringify(UNISWAP_ABI)),
      tokenAddress
    );
    return await tokenContract.methods
      .allowance(botParams.swapperAddress, botParams.uniswapv2Router)
      .call();
  } catch (error) {
    console.log("Error fetching the allownce amount ", error);
  }
};

const getTokenBalance = async (tokenAddress: string, walletAddress: string) => {
  try {
    const tokenContract = new web3.eth.Contract(
      JSON.parse(JSON.stringify(UNISWAP_ABI)),
      tokenAddress
    );
    return await tokenContract.methods.balanceOf(walletAddress).call();
  } catch (error) {
    console.log("Error getting token balance", error);
  }
};

const currentNonce = async () => {
  try {
    return provider.getTransactionCount(process.env.WALLET_ADDRESS!);
  } catch (error) {
    console.log("Error getting wallet nonce : ", error);
  }
};

const wait = async (ms: number) => {
  console.log(`\n\n Waiting for ${ms / 1000} secs ... \n\n`);
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const buyMessage = (token: string, buyTxHash: string) => {
  let message = "*** Successfully Broadcast a BUY ***";
  message += "\n\n Token";
  message += `\nhttps://etherscan.io/token/${token}`;
  message += "\n\n Tx";
  message += `\nhttps://etherscan.io/tx/${buyTxHash}`;

  return message;
};

const sellMessage = (token: string, sellTxHash: string) => {
  let message = "*** Successfully Broadcast a SELL ***";
  message += "\n\n Token";
  message += `\nhttps://etherscan.io/token/${token}`;
  message += "\n\n Tx";
  message += `\nhttps://etherscan.io/tx/${sellTxHash}`;

  return message;
};

const scamTxMessage = (token: string, buyTxHash: string) => {
  let message = "*** Successfully SOLD tokens before a scam function ***";
  message += "\n\n Token";
  message += `\nhttps://etherscan.io/token/${token}`;
  message += "\n\n Tx";
  message += `\nhttps://etherscan.io/tx/${buyTxHash}`;

  return message;
};

/**
 * Returns a checksummed address or send a notification if the address is invalid
 * @param address Address to checksum
 * @returns A cheksummed address
 */
const checkAddress = (ctx: any, address: string) => {
  try {
    const tokenAddress = ethers.utils.getAddress(address);
    return tokenAddress;
  } catch (error) {
    let message = "Error  ";
    message += "\n\n Invalid token address provided ";
    message += `\n\n ${error}`;
    ctx.reply(message);
  }
};

const getNonce = async (walletAddress: string) => {
  let walletNonce;

  const startTime = Date.now();
  while (true) {
    let nonce = await provider.getTransactionCount(walletAddress);
    console.log(nonce);

    if (nonce) {
      walletNonce = nonce;
      break;
    } else if (Date.now() - startTime > GET_NONCE_TIMEOUT * 1000) {
      break;
    }
    await wait(3000);
  }

  return walletNonce;
};

export {
  scamTxMessage,
  buyMessage,
  sellMessage,
  getTokenBalance,
  wait,
  toHex,
  currentNonce,
  UNISWAP_ABI,
  tokenAllowance,
  uniswapInterface,
  smartContract,
  checkAddress,
  getNonce,
};
