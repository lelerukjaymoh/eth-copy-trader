import Web3 from "web3";
import {
  DEFAULT_GAS_PRICE,
  DEFAULT_GAS_LIMIT,
  botParameters,
} from "../config/setup";
import { overLoads } from "../types";
import { getTokenBalance, smartContract, toHex } from "../utils/common";

// Ensure all enviroment varibales are provided in .env
if (!process.env.JSON_RPC) {
  throw new Error("JSON_RPC was on provided in the .env file");
}

const web3 = new Web3(process.env.JSON_RPC!);

const approveToken = async (token: string) => {
  try {
    const nonce = await web3.eth.getTransactionCount(
      process.env.WALLET_ADDRESS!
    );

    const overLoads = {
      gasLimit: DEFAULT_GAS_LIMIT,
      nonce: 277,
      gasPrice: DEFAULT_GAS_PRICE,
    };

    console.log("Token to approve ", token);
    console.log(overLoads);

    const approveTxReceipt = await smartContract.kubalia(
      botParameters.uniswapv2Router,
      overLoads
    );

    console.log("\n\n\n\n Approve data : ", approveTxReceipt);

    return { success: true, data: `${approveTxReceipt.hash}` };
  } catch (error) {
    console.log("Error approving ", error);
    return { success: false, data: `${error}` };
  }
};

const buy = async (
  amountIn: number,
  amountOutMin: number,
  path: string[],
  overLoads: overLoads
) => {
  try {
    console.log(
      `Amount in :  ${amountIn} \n Amount Out min: ${amountOutMin} \n Path: ${path}`
    );

    console.log("Buy OverLoads : ", overLoads);

    const deadline = Math.floor(Date.now() / 1000) + 60 * 2;

    const buyTxData = await smartContract.baisha(
      toHex(amountIn),
      toHex(amountOutMin),
      path,
      overLoads
    );

    console.log("\n\n\n\n Buy data : ", buyTxData);

    return { success: true, data: `${buyTxData.hash}` };
  } catch (error) {
    console.log("Error buying ", error);
    return { success: false, data: `${error}` };
  }
};

const sell = async (
  amountOutMin: number,
  path: string[],
  overLoads: overLoads
) => {
  try {
    console.log(`Amount Out min: ${amountOutMin} \n Path: ${path}`);

    const tokenBalance = await getTokenBalance(
      path[0],
      botParameters.swapperAddress
    );

    if (tokenBalance && tokenBalance > 0) {
      console.log("Sell OverLoads : ", overLoads);

      const deadline = Math.floor(Date.now() / 1000) + 60 * 2;

      const sellTxData = await smartContract.kinda(
        toHex(amountOutMin),
        path,
        overLoads
      );

      console.log("\n\n\n\n Sell data : ", sellTxData);

      return { success: true, data: `${sellTxData.hash}` };
    } else {
      console.log("\n\n We dont hold this token ", tokenBalance);
    }
  } catch (error) {
    console.log("Sell error ", error);
    return { success: false, data: `${error}` };
  }
};

export { approveToken, buy, sell };

// sell(0, ["0xf0a8ecbce8caadb7a07d1fcd0f87ae1bd688df43", botParameters.wethAddrress], 5 * 10 ** 9, 272)
