
import { ethers } from "ethers";
import { botParameters } from "../../config/setup";
import { DecodedData } from "../../types";
import multicall from "../../utils/abi/multicall.json";

const multicallInterface = new ethers.utils.Interface(multicall);

export const decodeMulticallTransaction = (inputData: string): DecodedData | undefined => {

    try {
        const decodedData = multicallInterface.parseTransaction({ data: inputData })
        const txnData = multicallInterface.parseTransaction({ data: decodedData.args.data[0] })
        const txn = txnData.args.params

        if (txn && txnData) {

            const methodName = txnData.name
            const tokenIn = txn.tokenIn
            const tokenOut = txn.tokenOut
            const amountIn = txn.amountIn
            const amountOutMinimum = txn.amountOutMinimum
            const path = { tokenIn, tokenOut }
            let txnType: string;

            // Check if the transaction was a buy or sell

            if (tokenIn.toLowerCase() == botParameters.wethAddress.toLowerCase()) {
                txnType = "buy"
            } else {
                txnType = "sell"
            }

            const data = {
                methodName,
                txnType,
                path,
                amountIn,
                amountOutMinimum,
                txnMethodName: decodedData.name,
            }

            return data
        } else {
            console.log("\n\n\n [ERROR] : Error decoding the multicall transaction ", decodedData, txnData, txn);

        }
    } catch (error) {
        console.log("Error decoding multicall ", error);
    }
}
