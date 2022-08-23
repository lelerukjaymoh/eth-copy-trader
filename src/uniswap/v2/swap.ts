import { toHex } from "@uniswap/v3-sdk";
import { DEFAULT_GAS_LIMIT, DEFAULT_GAS_PRICE, botParameters } from "../../config/setup";
import { init } from "../../initialize";
import { sendNotification } from "../../telegram";
import { failedTxMessage } from "../../telegram/message";
import { overLoads } from "../../types";
import { v2smartContract, getTokenBalance } from "../../utils/common";
import { Path } from "../v3/interfaces";

// Ensure all environment variables are provided in .env
init()

const buy = async (
  amountIn: number,
  amountOutMin: number,
  path: Path,
  overLoads: overLoads
) => {
  try {

    console.log("\n\n [BUYING] : Buying with these parameters ")

    console.log(
      `Amount in :  ${amountIn} \n Amount Out min: ${amountOutMin} \n Path: ${path}`
    );

    console.log("Buy OverLoads : ", overLoads);

    // Simulate the buy transaction before buying. If the transaction was to fail it wil be handled in the
    // catch block and no transaction will be broadcast, saving on gas 
    const buySimulation = await v2smartContract.callStatic.baisha(
      toHex(amountIn),
      toHex(amountOutMin),
      [path.tokenIn, path.tokenOut],
      overLoads
    )

    // If the transaction was successfully executed, broadcast it to the network
    const buyTxData = await v2smartContract.baisha(
      toHex(amountIn),
      toHex(amountOutMin),
      [path.tokenIn, path.tokenOut],
      overLoads
    );

    return { success: true, data: `${buyTxData.hash}` };
  } catch (error) {
    console.log("Error buying ", error);

    await sendNotification(failedTxMessage("BUY", path.tokenOut, JSON.stringify(error)))

    return { success: false, data: `${error}` };
  }
};

const sell = async (
  amountOutMin: number,
  path: Path,
  overLoads: overLoads
) => {
  try {
    console.log("\n\n [SELLING] : Selling with these parameters ")

    console.log(`Amount Out min: ${amountOutMin} \n Path: ${JSON.stringify(path)} \n OverLoads: ${JSON.stringify(overLoads)} `);

    const tokenBalance = await getTokenBalance(
      path.tokenIn,
      botParameters.swapperAddress
    );

    if (tokenBalance && tokenBalance > 0) {

      // Simulate the sell transaction 

      await v2smartContract.callStatic.kinda(
        toHex(0),
        [path.tokenIn, path.tokenOut],
        overLoads
      )

      // If the simulation was a success, execute the sell txn
      const sellTxData = await v2smartContract.kinda(
        toHex(0),
        [path.tokenIn, path.tokenOut],
        overLoads
      );

      return { success: true, data: `${sellTxData.hash}` };
    } else {
      console.log("\n\n We dont hold this token ", tokenBalance);
    }
  } catch (error) {
    console.log("Sell error ", error);

    await sendNotification(failedTxMessage("SELL", path.tokenIn, JSON.stringify(error)))

    return { success: false, data: `${error}` };
  }
};

export { buy, sell };

