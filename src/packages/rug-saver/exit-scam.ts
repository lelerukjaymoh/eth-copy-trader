import { ADDITIONAL_EXIT_SCAM_GAS, botParameters, DEFAULT_GAS_LIMIT } from "../../config/setup";
import { txContents } from "../types";
import { sell } from "../uniswap/v2/swap";
import { v2walletNonce } from "../utils/common";
import { failedToExitScamNotification, sendTgNotification } from "../utils/notifications";

export const exitOnScamTx = async (txContents: txContents, tokenAddress: string) => {
    try {
        const nonce = await v2walletNonce()

        let gasLimit = parseInt(txContents.gas._hex, 16);
        const path = {
            tokenIn: tokenAddress,
            tokenOut: botParameters.wethAddress,
        }

        if (gasLimit < DEFAULT_GAS_LIMIT) {
            gasLimit = DEFAULT_GAS_LIMIT
        }

        let overLoads: any = {
            nonce,
            gasLimit
        };

        if (txContents.gasPrice) {
            overLoads["gasPrice"] = txContents.gasPrice.add(ADDITIONAL_EXIT_SCAM_GAS)
        } else {
            overLoads["maxPriorityFeePerGas"] = txContents.maxPriorityFeePerGas!.add(ADDITIONAL_EXIT_SCAM_GAS)
            overLoads["maxFeePerGas"] = txContents.maxFeePerGas!.add(ADDITIONAL_EXIT_SCAM_GAS)
        }

        const exitScamTx = await sell(0, path, overLoads)

        if (exitScamTx) {
            console.log("\n\n Exit scam txn ", exitScamTx)

            await sendTgNotification(
                txContents.from,
                txContents.hash,
                exitScamTx!.data,
                "SELL",
                tokenAddress
            );
        } else {
            //  Send a notification if the bot was unable to sell the token
            await failedToExitScamNotification(tokenAddress)
        }
    } catch (error) {
        console.log("Error executing a sell transaction on scam capture ", error)
    }
}