import { APPROVE_GAS_LIMIT, botParams, ETH_AMOUNT_TO_BUY, MINIMUM_POOLED_WBNB, TOKENS_TO_MONITOR, TOKEN_AMOUNT_TO_BUY } from "./config/setup";
import { readFileSync } from "fs"
import { ethers } from "ethers"
import { txContents } from "./types";
import { currentNonce } from "./utils/common";
import { sendNotification } from "./telegram";
import { buy } from "./uniswap/swap";

const methodsExclusion = ["0x", "0x0"]
var PANCAKESWAP_ABI = JSON.parse(
    readFileSync(`src/utils/abi/pancakeSwapABI.json`, "utf8")
);

// Initilise an interface of the ABI
const inter = new ethers.utils.Interface(PANCAKESWAP_ABI);

const mempoolData = async (mempoolData: string) => {

    try {

        const tokensToMonitor = TOKENS_TO_MONITOR.map((token) => token.toLowerCase())

        console.log(tokensToMonitor)

        const JsonData = await JSON.parse(mempoolData);
        const tx = JsonData.params.result;
        const txContents: txContents = tx.txContents

        if (!methodsExclusion.includes(txContents.input)) {

            // Conecentrate on txn to the pancakeswap router
            let routerAddress = tx.txContents.to.toLowerCase()

            if (routerAddress.toLowerCase() == botParams.uniswapv2Router.toLowerCase()) {

                const decodedInput = inter.parseTransaction({
                    data: tx.txContents.input,
                });

                console.log("Decoded Data", decodedInput);

                let gasLimit = parseInt(tx.txContents.gas, 16);
                let gasPrice = parseInt(tx.txContents.gasPrice!, 16)
                let maxFee = parseInt(tx.txContents.maxFeePerGas, 16)
                let priorityFee = parseInt(tx.txContents.maxPriorityFeePerGas, 16)

                if (isNaN(maxFee)) {
                    priorityFee = 2 * 10 ** 9
                    maxFee = gasPrice - priorityFee
                }

                if (isNaN(gasLimit)) {
                    gasLimit = APPROVE_GAS_LIMIT
                }

                let methodName = decodedInput.name

                console.log("\n Method Name : ", methodName)
                console.log("Gas price : ", gasPrice! / 1000000000)
                console.log("Gas Limit ", gasLimit)

                let nonce = await currentNonce()

                if (methodName == "addLiquidity") {
                    let tokenA = decodedInput.args.tokenA
                    let tokenB = decodedInput.args.tokenB
                    let token;

                    console.log("TokenA ", tokenA.toLowerCase());
                    console.log("TokenB ", tokenB.toLowerCase());

                    if (tokensToMonitor.includes(tokenA.toLowerCase())) {
                        token = tokenA
                    } else if (tokensToMonitor.includes(tokenB.toLowerCase())) {
                        token = tokenB
                    }

                    if (token) {

                        console.log("\n\n\n\n **********************************************")
                        console.log("Captured an add liquidity transaction for a token we are tracking : ", token)
                        console.log("Method Used : ", methodName)
                        console.log("**********************************************")

                        let path = [botParams.wethAddrress, token]

                        if (nonce && path && priorityFee && maxFee && gasLimit) {
                            await buy(ETH_AMOUNT_TO_BUY, 0, path, priorityFee, maxFee, gasLimit, nonce)
                        }

                        // approve 
                        // await approve(routerAddress, priorityFee, maxFee, gasLimit, currentNonce + 1)

                        let message = "Token Listing Notification"
                        message += "\n\n Token:"
                        message += `https://etherscan.io/token/${routerAddress}`

                        await sendNotification(message)

                    } else {
                        console.log("\n\n =====>  Token was not on our tracking list");
                    }

                } else if (methodName == "addLiquidityETH") {
                    let token = decodedInput.args.token

                    console.log("Token : ", token)

                    if (tokensToMonitor.includes(token.toLowerCase())) {

                        console.log("\n\n\n\n\n\n\n **********************************************")
                        console.log("\nCaptured an add liquidity transaction for a token we are tracking : ", token)
                        console.log("Method used : ", methodName)
                        console.log("\n**********************************************")

                        let path = [botParams.wethAddrress, token]

                        if (nonce && path && priorityFee && maxFee && gasLimit) {
                            await buy(ETH_AMOUNT_TO_BUY, 0, path, priorityFee, maxFee, gasLimit, nonce)
                        }

                        let message = "Token Listing Notification"
                        message += "\n\n Token:"
                        message += `https://etherscan.io/token/${routerAddress}`

                        await sendNotification(message)

                    } else {
                        console.log("\n\n =====>  Token was not on our tracking list");
                    }

                }
            } else if (tokensToMonitor.includes(routerAddress)) {
                console.log("\n\n\n\n **********************************************")
                console.log("Captured an add liquidity transaction for a token we are tracking (exotic function) : ", tx.txContents.to)
                console.log("**********************************************")

                let gasLimit = parseInt(tx.txContents.gas, 16);
                let gasPrice = parseInt(tx.txContents.gasPrice!, 16)
                let maxFee = parseInt(tx.txContents.maxFeePerGas, 16)
                let priorityFee = parseInt(tx.txContents.maxPriorityFeePerGas, 16)

                if (isNaN(maxFee)) {
                    priorityFee = 2 * 10 ** 9
                    maxFee = gasPrice - priorityFee
                }

                if (isNaN(gasLimit)) {
                    gasLimit = APPROVE_GAS_LIMIT
                }

                let nonce = await currentNonce()

                let path = [botParams.wethAddrress, routerAddress!]

                if (nonce && path && priorityFee && maxFee && gasLimit) {
                    await buy(ETH_AMOUNT_TO_BUY, 0, path, priorityFee, maxFee, gasLimit, nonce)
                }

                let message = "Token Listing Notification"
                message += "\n\n Token:"
                message += `https://etherscan.io/token/${routerAddress}`

                await sendNotification(message)

            }
        }

    } catch (error) {
        console.log("Eror in mempool ", error)
    }

}

export { mempoolData }