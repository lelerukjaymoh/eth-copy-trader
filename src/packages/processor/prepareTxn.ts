import { botParameters, DEFAULT_GAS_LIMIT, EXCLUDED_TOKENS, WALLETS_TO_MONITOR } from "../../config/setup";
import { DecodedData, overLoads, TransactionData, txContents } from "../../types";
import { methodsExclusion, multiCallMethods, prepareOverLoads, provider, walletNonce } from "../../utils/common";
import { decodeMulticallTransaction, decodeNormalTxn } from "../decoder";
import { executeTxn } from "./executeTxn";

/**
 * Process the transaction data, makes logical checks and call relevant buy functions 
 * @param txnContents Transaction input string 
 */
export const processData = async (txContents: txContents) => {

    if (txContents.to) {

        // Exclude transfer txns
        if (!methodsExclusion.includes(txContents.input)) {

            const routerAddress = txContents.to.toLowerCase()
            const targetWallet = txContents.from

            // console.log(targetWallet, routerAddress)

            if (routerAddress == botParameters.uniswapv2Router.toLowerCase() || routerAddress == botParameters.uniswapv3Router.toLowerCase()) {

                console.log(`\n\n [STREAMING] : Captured a transaction to a Uniswap V2 or V3 Router ${txContents.hash}`)

                if (WALLETS_TO_MONITOR.get(
                    targetWallet.toLowerCase()
                )) {

                    // console.log("Target is being tracked ");
                    console.log(`\n\n [STREAMING] : Transaction is by one of the targets ${targetWallet}`)

                    const methodId = txContents.input.substring(0, 10)
                    let decodedData: DecodedData

                    // console.log("Method id : ", methodId, multiCallMethods, multiCallMethods.includes(methodId), txContents.hash)

                    if (multiCallMethods.includes(methodId)) {
                        decodedData = decodeMulticallTransaction(txContents.input)!
                    } else {
                        decodedData = decodeNormalTxn(txContents.input)!
                    }

                    // console.log(txContents.hash, decodedData);

                    if (decodedData) {
                        let txnData = {} as TransactionData

                        const path = decodedData.path

                        txnData.txnMethodName = decodedData.methodName
                        txnData.from = targetWallet
                        txnData.hash = txContents.hash
                        txnData.value = parseInt(txContents.value._hex, 16)
                        txnData.txnType = decodedData?.txnType
                        txnData.path = path
                        txnData.botAmountOut = 0

                        // Get the maximum investment amount for the target
                        // For every target the bot follows, it has a maximum amount it can invest in the copy transaction

                        const maxInvestment = WALLETS_TO_MONITOR.get(
                            targetWallet.toLowerCase()
                        )!;

                        // const maxInvestment = 0.000001 * Math.pow(10, 18)

                        txnData.maxInvestment = maxInvestment

                        // Check that the target is not buying or selling a token in the exclusion list
                        if (
                            !EXCLUDED_TOKENS.includes(path.tokenIn.toLowerCase()) ||
                            !EXCLUDED_TOKENS.includes(path.tokenOut.toLowerCase())
                        ) {

                            // Prepare transaction overloads
                            let overLoads = await prepareOverLoads(txContents);

                            console.log("\n\n\n ===> Txn Data", txnData);
                            console.log("OverLoads", overLoads);

                            if (overLoads && txnData) {
                                await executeTxn(txnData, overLoads)
                            }
                        }
                    }
                }
            }
        }


    }
}
