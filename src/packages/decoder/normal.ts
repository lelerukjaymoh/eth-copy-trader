import { botParameters } from "../../config/setup";
import { DecodedData } from "../types";
import { ERC20Interface } from "../utils/common"

export const decodeNormalTxn = (inputData: string): DecodedData | undefined => {
    try {
        const decodedData = ERC20Interface.parseTransaction({ data: inputData })

        const path = {
            tokenIn: decodedData.args.path[0],
            tokenOut: decodedData.args.path[1]
        }

        const data = {
            methodName: decodedData.name,
            path,
            amountIn: decodedData.args.amountIn,
            amountOutMin: decodedData.args.amountOutMin,
            amountOut: decodedData.args.amountOut,
            amountInMax: decodedData.args.amountInMax,
        }

        return data

    } catch (error) {
        console.log("Error decoding a normal transaction : ");
    }
}



export const getRemovedToken = (inputData: string) => {
    try {
        const decodedData = ERC20Interface.parseTransaction({ data: inputData })

        const methodName = decodedData.name
        let token;

        if (methodName.startsWith("removeLiquidityETH")) {
            token = decodedData.args.token
        } else {
            if (decodedData.args.tokenA.toLowerCase() == botParameters.wethAddress.toLowerCase()) {
                token = decodedData.args.tokenB
            } else {
                token = decodedData.args.tokenA
            }
        }

        return token

    } catch (error) {
        console.log("Could not decode remove liquidity txn ", error)
    }
}