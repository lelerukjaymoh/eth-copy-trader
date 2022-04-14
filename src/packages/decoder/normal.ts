import { DecodedData } from "../../types";
import { ERC20Interface } from "../../utils/common"

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
