import { ethers } from "ethers";
import { botParams } from "../config/setup";
import { overLoads } from "../types";
import { toHex } from "../utils/common";

// Perepare enviroment and setup variables
const RINKEBY_WALLET_ADDRESS = process.env.RINKEBY_WALLET_ADDRESS;
let walletAddress = ethers.utils.getAddress(RINKEBY_WALLET_ADDRESS!);
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;

const signer = new ethers.Wallet(RINKEBY_PRIVATE_KEY!);
const provider = ethers.getDefaultProvider(process.env.JSON_RPC, {
  name: "binance",
  chainId: 56,
});
const account = signer.connect(provider);

const swapTokensForExactETH = async (
  amountInMax: number,
  amountOut: number,
  path: Array<string>,
  overLoads: overLoads
) => {
  try {
    const uniswap = new ethers.Contract(
      botParams.uniswapv2Router,
      [
        "function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)",
      ],
      account
    );

    console.log(
      "\n\n==================== swapTokensForExactETH ==============="
    );

    const deadline = Math.floor(Date.now() / 1000) + 60 * 2;

    console.log(
      `\n\n amountIn: ${amountInMax}, \n amountOutMin: ${amountOut}, \nto: ${RINKEBY_WALLET_ADDRESS}, \npath: ${path}, \n OverLoads: ${overLoads}, \n deadline: ${deadline}`
    );

    const tx = await uniswap.swapTokensForExactETH(
      toHex(amountInMax),
      toHex(amountOut),
      path,
      walletAddress,
      deadline,
      overLoads
    );

    console.log("\n\n\n ************** SELL ***************");
    console.log("Transaction hash: ", tx.hash);
    console.log("******************************************");

    return { success: true, data: `${tx.hash}` };
  } catch (error) {
    console.log("swapTokensForExactETH ====>  ", error);

    return { success: false, data: `${error}` };
  }
};

const swapExactTokensForETHSupportingFeeOnTransferTokens = async (
  amountIn: number,
  amountOutMin: number,
  path: Array<string>,
  overLoads: overLoads
) => {
  try {
    const uniswap = new ethers.Contract(
      botParams.uniswapv2Router,
      [
        "function swapExactTokensForETHSupportingFeeOnTransferTokens( uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline ) external returns (uint[] memory amounts)",
      ],
      account
    );

    console.log(
      "\n\n==================== swapExactTokensForETHSupportingFeeOnTransferTokens ==============="
    );

    const deadline = Math.floor(Date.now() / 1000) + 60 * 2;

    console.log(
      `\n\n amountIn: ${amountIn}, \n amountOutMin: ${amountOutMin}, \nto: ${RINKEBY_WALLET_ADDRESS}, \npath: ${path}, \n OverLoads: ${overLoads}, \n deadline: ${deadline}`
    );

    const tx = await uniswap.swapExactTokensForETHSupportingFeeOnTransferTokens(
      toHex(amountIn),
      toHex(amountOutMin),
      path,
      walletAddress,
      deadline,
      overLoads
    );

    console.log("\n\n\n ************** SELL ***************");
    console.log("Transaction hash: ", tx.hash);
    console.log("******************************************");

    return { success: true, data: `${tx.hash}` };
  } catch (error) {
    console.log(
      "swapExactTokensForETHSupportingFeeOnTransferTokens ====>  ",
      error
    );

    return { success: false, data: `${error}` };
  }
};

const swapExactTokensForETH = async (
  amountIn: number,
  amountOutMin: number,
  path: Array<string>,
  overLoads: overLoads
) => {
  try {
    const uniswap = new ethers.Contract(
      botParams.uniswapv2Router,
      [
        "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)  returns (uint[] memory amounts)",
      ],
      account
    );

    console.log(
      "\n\n==================== swapExactTokensForETH ==============="
    );

    const deadline = Math.floor(Date.now() / 1000) + 60 * 2;

    console.log(
      `\n\n amountIn: ${amountIn}, \n amountOutMin: ${amountOutMin}, \nto: ${RINKEBY_WALLET_ADDRESS}, \npath: ${path}, \n OverLoads: ${overLoads}, \n deadline: ${deadline}`
    );

    const tx = await uniswap.swapExactTokensForETH(
      toHex(amountIn),
      toHex(amountOutMin),
      path,
      walletAddress,
      deadline,
      overLoads
    );

    console.log("\n\n\n ************** SELL ***************");
    console.log("Transaction hash: ", tx.hash);
    console.log("******************************************");

    return { success: true, data: `${tx.hash}` };
  } catch (error) {
    console.log("swapExactTokensForETH ====>  ", error);

    return { success: false, data: `${error}` };
  }
};

export {
  swapExactTokensForETHSupportingFeeOnTransferTokens,
  swapTokensForExactETH,
  swapExactTokensForETH,
};
