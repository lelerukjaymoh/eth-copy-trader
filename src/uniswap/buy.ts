const { ethers } = require("ethers");
import { botParams } from "../config/setup";
import { overLoads } from "../types";
import { toHex } from "../utils/common";

// Perepare enviroment and setup variables
const RINKEBY_WALLET_ADDRESS = process.env.RINKEBY_WALLET_ADDRESS;
const walletAddress = ethers.utils.getAddress(RINKEBY_WALLET_ADDRESS);
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;

const signer = new ethers.Wallet(RINKEBY_PRIVATE_KEY);
const provider = ethers.getDefaultProvider(process.env.RINKEBY_JSON_RPC);
const account = signer.connect(provider);

const swapExactETHForTokens = async (
  amountOutMin: number,
  ethAmount: number,
  path: Array<string>,
  overLoads: overLoads
) => {
  try {
    const uniswap = new ethers.Contract(
      botParams.uniswapv2Router,
      [
        "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
      ],
      account
    );

    console.log(
      "\n\n==================== swapExactETHForTokens ====================="
    );

    // Convert amount to toHex
    let value = toHex(ethAmount);
    overLoads.value = value;

    const deadline = Math.floor(Date.now() / 1000) + 60 * 2;

    console.log(
      `\n\n amountOutMin: ${amountOutMin}, \n\nValue : ${value} \nto: ${RINKEBY_WALLET_ADDRESS}, \npath: ${path}, \n OverLoads: ${overLoads}, \n deadline: ${deadline},`
    );

    const tx = await uniswap.swapExactETHForTokens(
      toHex(amountOutMin),
      path,
      walletAddress,
      deadline,
      overLoads
    );

    console.log("\n\n\n ************** BUY ***************");
    console.log("Transaction hash: ", tx.hash);
    console.log("*****************************");

    return { success: true, data: `${tx.hash}` };
  } catch (error) {
    console.log("swapExactETHForTokens:  ====> ", error);

    return { success: false, data: `${error}` };
  }
};

const swapExactETHForTokensSupportingFeeOnTransferTokens = async (
  amountOutMin: number,
  ethAmount: number,
  path: Array<string>,
  overLoads: overLoads
) => {
  try {
    console.log(
      "\n\n==================== swapExactETHForTokensSupportingFeeOnTransferTokens ==============="
    );

    const uniswap = new ethers.Contract(
      botParams.uniswapv2Router,
      [
        "function swapExactETHForTokensSupportingFeeOnTransferTokens( uint amountOutMin, address[] calldata path, address to, uint deadline ) external returns (uint[] memory amounts)",
      ],
      account
    );

    let value = toHex(ethAmount);

    const deadline = Math.floor(Date.now() / 1000) + 60 * 2;

    console.log(
      `\n \n amountOutMin: ${amountOutMin}, \nValue: ${value} \nto: ${RINKEBY_WALLET_ADDRESS}, \npath: ${path}, \n OverLoads: ${overLoads}, \n deadline: ${deadline},`
    );

    const tx = await uniswap.swapExactETHForTokensSupportingFeeOnTransferTokens(
      toHex(amountOutMin),
      path,
      walletAddress,
      deadline,
      overLoads
    );

    console.log("\n\n\n ************** BUY ***************");
    console.log("Transaction hash: ", tx.hash);
    console.log("*****************************************");

    return { success: true, data: `${tx.hash}` };
  } catch (error) {
    console.log(
      "swapExactETHForTokensSupportingFeeOnTransferTokens:  ====> ",
      error
    );

    return { success: false, data: `${error}` };
  }
};

const swapETHForExactTokens = async (
  amountOut: number,
  ethAmount: number,
  path: Array<string>,
  overLoads: overLoads
) => {
  try {
    console.log(
      "\n\n==================== swapETHForExactTokens ==============="
    );

    const uniswap = new ethers.Contract(
      botParams.uniswapv2Router,
      [
        "function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
      ],
      account
    );

    // Convert amount to toHex
    let value = toHex(ethAmount);

    const deadline = Math.floor(Date.now() / 1000) + 60 * 2;

    console.log(
      `\n\n amountOut: ${amountOut}, \n Value: ${value} \nto: ${RINKEBY_WALLET_ADDRESS}, \npath: ${path}, \n OverLoads: ${overLoads}, \n deadline: ${deadline},`
    );

    const tx = await uniswap.swapETHForExactTokens(
      toHex(amountOut),
      path,
      walletAddress,
      deadline,
      overLoads
    );

    console.log("\n\n\n ************** BUY ***************");
    console.log("Transaction hash: ", tx.hash);
    console.log("*****************************************");

    return { success: true, data: `${tx.hash}` };
  } catch (error) {
    console.log("swapETHForExactTokens:  ====> ", error);

    return { success: false, data: `${error}` };
  }
};

export {
  swapExactETHForTokens,
  swapETHForExactTokens,
  swapExactETHForTokensSupportingFeeOnTransferTokens,
};
