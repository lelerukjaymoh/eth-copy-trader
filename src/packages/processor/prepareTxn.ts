import { botParameters, DEFAULT_GAS_LIMIT, EXCLUDED_TOKENS, WALLETS_TO_MONITOR } from "../../config/setup";
import { DecodedData, overLoads, TransactionData, txContents, _BoughtTokens } from "../types";
import { getSlippagedAmoutOut, getTokenOwner, methodsExclusion, multiCallMethods, prepareOverLoads, v2walletNonce, v3walletNonce, wait } from "../utils/common";
import { decodeMulticallTransaction, decodeNormalTxn } from "../decoder";
import { executeTxn } from "./executeTxn";
import { BoughtTokens } from "../../db/models";

let tokensBought: _BoughtTokens = {};

/**
 * Process the transaction data, makes logical checks and call relevant buy functions 
 * @param txnContents Transaction input string 
 */
export const processData = async (txContents: any) => {

    // Fetch bought tokens from db
    await fetchBoughtTokens()

    // Listen for newly bought tokens
    listenBoughtTokens()

    console.log("\n\n Tokens Bought  ", tokensBought)

    if (txContents.to) {

        // Exclude transfer txns
        if (!methodsExclusion.includes(txContents.input)) {

            const calledContract = txContents.to.toLowerCase()    // The contract being called by the target
            const targetWallet = txContents.from

            // console.log(targetWallet, calledContract)

            if (calledContract == botParameters.uniswapv2Router.toLowerCase() || calledContract == botParameters.uniswapv3Router.toLowerCase()) {

                // console.log(`\n\n [STREAMING] : Captured a transaction to a Uniswap V2 or V3 Router ${txContents.hash}`)

                if (WALLETS_TO_MONITOR.get(
                    targetWallet.toLowerCase()
                )) {

                    // console.log("Target is being tracked ");
                    console.log(`\n\n [STREAMING] : Transaction is by one of the targets ${targetWallet}`)

                    const methodId = txContents.input.substring(0, 10)
                    let decodedData: DecodedData
                    let nonce;
                    // console.log("Method id : ", methodId, multiCallMethods, multiCallMethods.includes(methodId), txContents.hash)

                    if (multiCallMethods.includes(methodId)) {
                        console.log(`\n\n [DECODING] : Transaction is a multicall transaction.`)

                        decodedData = decodeMulticallTransaction(txContents.input)!
                        nonce = await v3walletNonce()
                    } else {
                        console.log(`\n\n [DECODING] : Transaction is a normal transaction.`)

                        decodedData = decodeNormalTxn(txContents.input)!
                        nonce = await v2walletNonce()
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
                            let overLoads = await prepareOverLoads(txContents, nonce!);

                            console.log("\n\n Txn Data");
                            for (let key in txnData) {
                                console.log(key + ": " + txnData[key as keyof TransactionData]);
                            }

                            console.log("\n\n Txn Overloads ")
                            console.log(overLoads);

                            if (overLoads && txnData) {
                                await executeTxn(txnData, overLoads)
                            }
                        }
                    }
                }
            } else {

                // If the transaction is not to a Uniswap V2 or V3 router, 
                // We should check if its to the token contract

                console.log("Transaction data ", calledContract, tokensBought)

                if (Object.values(tokensBought).includes(calledContract)) {
                    console.log(`\n\n [STREAMING]: Captured a transaction to a token that we had bought before ${txContents.hash}`)
                }
            }

        }

    }
}



const fetchBoughtTokens = async () => {
    try {

        // // Wait for 10 secs before fetching the bought tokens
        // // This is to allow for the bot to establish the connection to the db first
        // await wait(10000)

        const tokens = await BoughtTokens.find({ bought: true, sold: false })

        for (let each of tokens) {
            const tokenAddress = each.tokenAddress.toLowerCase()
            const collectionId = each._id.toString()

            if (!Object.keys(tokensBought).includes(collectionId)) {
                // Get the owner of the token contract

                const tokenOwner = await getTokenOwner(tokenAddress)
                console.log("Token owner ", tokenOwner)

                // TODO: Research on a way of getting the token owner if the owner() does not exist on the token contract
                if (tokenOwner) {
                    // If the token owner can be queried from the bot,
                }
                tokensBought[collectionId] = tokenAddress
            }
        }

    } catch (error) {
        console.log("Error fetching bought tokens", error);
    }

};

const listenBoughtTokens = () => {
    const changeStream = BoughtTokens.watch();


    changeStream.on("change", async (change: any) => {
        try {

            // console.log("Change ", change);

            if (change.operationType == "update") {
                const tokenData = await BoughtTokens.findById(change.documentKey._id);
                const tokenAddress = tokenData!.tokenAddress.toLowerCase();
                const collectionId = tokenData!._id.toString();

                if (tokenData && tokenData!.bought && !tokenData.sold) {
                    if (!Object.keys(tokensBought).includes(collectionId)) {
                        tokensBought[collectionId] = tokenAddress
                    }
                } else if (tokenData && tokenData.sold) {
                    if (Object.keys(tokensBought).includes(collectionId)) {
                        // Delete the token from tokens bought list
                        delete tokensBought[collectionId];
                    }
                }

            }

            console.log("[TRACK-TOKENS-BOUGHT]: Tokens have been updated", tokensBought);
        } catch (error) {
            console.log("Error saving or deleting bought or sold token", error);
        }

    });
};