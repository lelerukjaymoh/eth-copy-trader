import { botParameters, DEFAULT_GAS_LIMIT, EXCLUDED_TOKENS, WALLETS_TO_MONITOR } from "../../config/setup";
import { DecodedData, overLoads, TransactionData, txContents } from "../../types";
import { methodsExclusion, multiCallMethods, prepareOverLoads, provider, walletNonce } from "../../utils/common";
import { decodeMulticallTransaction, decodeNormalTxn } from "../decoder";
import { executeTxns } from "./executeTxn";

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

            if (routerAddress == botParameters.uniswapv2Router.toLowerCase() || routerAddress == botParameters.uniswapv3Router.toLowerCase()) {

                const methodId = txContents.input.substring(0, 10)
                let txnData: TransactionData | undefined
                let decodedData: DecodedData | undefined

                if (multiCallMethods.includes(methodId)) {
                    decodedData = decodeMulticallTransaction(txContents.input)
                } else {
                    decodedData = decodeNormalTxn(txContents.input)
                }

                if (txnData) {
                    const path = txnData.path

                    txnData.from = targetWallet
                    txnData.hash = txContents.hash
                    txnData.value = parseInt(txContents.value._hex, 16)

                    // Get the maximum investment amount for the target
                    // For every target the bot follows, it has a maximum amount it can invest in the copy transaction
                    const maxInvestment = WALLETS_TO_MONITOR.get(
                        targetWallet.toLowerCase()
                    )!;

                    txnData.maxInvestment = maxInvestment

                    // Check that the target is not buying or selling a token in the exclusion list
                    if (
                        !EXCLUDED_TOKENS.includes(path[0].toLowerCase()) ||
                        !EXCLUDED_TOKENS.includes(path[path.length - 1])
                    ) {

                        // Prepare transaction overloads
                        let overLoads = await prepareOverLoads(txContents);

                        if (overLoads) {
                            await executeTxns(txnData, overLoads)
                        }

                    }
                }
            }
        }


    }
}
