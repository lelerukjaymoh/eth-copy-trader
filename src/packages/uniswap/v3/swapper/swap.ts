import { sendNotification } from "../../../telegram";
import { failedTxMessage } from "../../../telegram/message";
import { TxnParams, overLoads, Path } from "../interfaces";
import { v3swapperContract } from "../utils/common";


export const
    v3buy = async (params: TxnParams, overLoads: overLoads) => {
        try {
            console.log("\n\n [BUYING] : Buying through V3 router using multicall function")

            // Simulate the transaction
            await v3swapperContract.callStatic.buy(
                params.tokenIn, params.tokenOut, params.amountOut, params.fee, params.sqrtPriceLimitX96, overLoads
            )

            console.log(
                params.tokenIn, params.tokenOut, params.amountOut, params.fee, params.sqrtPriceLimitX96, overLoads
            )

            // If simulation was successful, execute transaction
            const txn = await v3swapperContract.buy(params.tokenIn, params.tokenOut, params.amountOut, params.fee, params.sqrtPriceLimitX96, overLoads)

            console.log("\n\n Successfully submitted BUY transaction on V3 ", txn.hash)

            const data = {
                success: true,
                data: txn.hash
            }

            return data

        } catch (error) {
            await sendNotification(failedTxMessage("SELL", params.tokenOut, JSON.stringify(error)))

            console.log("Error swapping Exact In: ", error);
        }
    }


export const v3sell = async (params: TxnParams, overLoads: overLoads) => {
    try {

        console.log("\n\n [SELLING] : Selling through V3 router using multicall function")

        console.log(
            params.amountOut, params.tokenIn, params.tokenOut, params.fee, params.sqrtPriceLimitX96, overLoads
        )

        // Simulate the sell transaction.
        await v3swapperContract.callStatic.sell(
            params.amountOut, params.tokenIn, params.tokenOut, params.fee, params.sqrtPriceLimitX96, overLoads
        )

        // If simulation was successful, execute the trade
        const txn = await v3swapperContract.sell(params.amountOut, params.tokenIn, params.tokenOut, params.fee, params.sqrtPriceLimitX96, overLoads)

        console.log("\n\n Successfully submitted SELL transaction on V3 ", txn.hash)

        const data = {
            success: true,
            data: txn.hash
        }

        return data


    } catch (error) {
        await sendNotification(failedTxMessage("SELL", params.tokenIn, JSON.stringify(error)))

        console.log("Error swapping Exact In: ", error);
    }
}
