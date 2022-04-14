import { TxnParams, overLoads, Path } from "../interfaces";
import { v3swapperContract } from "../utils/common";


export const
    v3buy = async (params: TxnParams, overLoads: overLoads) => {
        try {
            console.log("\n\n [BUYING] : Buying through V3 router using multicall function")

            const txn = await v3swapperContract.buy(params.tokenIn, params.tokenOut, params.amountOut, params.fee, params.sqrtPriceLimitX96, overLoads)

            const data = {
                success: true,
                data: txn.hash
            }

            return data

        } catch (error) {
            console.log("Error swapping Exact In: ", error);
        }
    }


export const v3sell = async (params: TxnParams, overLoads: overLoads) => {
    try {

        console.log("\n\n [SELLING] : Selling through V3 router using multicall function")

        const txn = await v3swapperContract.sell(params.amountOut, params.tokenIn, params.tokenOut, params.fee, params.sqrtPriceLimitX96, overLoads)

        const data = {
            success: true,
            data: txn.hash
        }

        return data


    } catch (error) {
        console.log("Error swapping Exact In: ", error);
    }
}
