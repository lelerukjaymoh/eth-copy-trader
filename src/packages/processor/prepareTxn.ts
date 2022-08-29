import { ADDITIONAL_EXIT_SCAM_GAS, botParameters, DEFAULT_GAS_LIMIT, EXCLUDED_TOKENS, REMOVE_LIQUIDITY_FUNCTIONS, SCAM_FUNCTIONS, WALLETS_TO_MONITOR } from "../../config/setup";
import { DecodedData, overLoads, TokenData, TransactionData, txContents, _BoughtTokens } from "../types";
import { getSlippagedAmoutOut, getTokenOwner, methodsExclusion, multiCallMethods, prepareOverLoads, v2walletNonce, v3walletNonce, wait } from "../utils/common";
import { decodeMulticallTransaction, decodeNormalTxn, getRemovedToken } from "../decoder";
import { executeTxn } from "./executeTxn";
import { BoughtTokens } from "../../db/models";
import { getContractDeployer } from "../scraper/scrape";
import { sell } from "../uniswap/v2/swap";
import { failedToExitScamNotification, sendTgNotification } from "../utils/notifications";
import { exitOnScamTx } from "../rug-saver/exit-scam";

let tokensBought: _BoughtTokens = {};

/**
 * Process the transaction data, makes logical checks and call relevant buy functions 
 * @param txnContents Transaction input string 
 */
export const processData = async (txContents: any) => {

    if (txContents.to) {

        // Exclude transfer txns
        if (!methodsExclusion.includes(txContents.input)) {

            const calledContract = txContents.to.toLowerCase()    // The contract being called by the target
            const targetWallet = txContents.from
            const txnMethodId = txContents.input.substring(2, 10);

            // console.log(targetWallet, calledContract)
            if (calledContract == botParameters.uniswapv2Router.toLowerCase() || calledContract == botParameters.uniswapv3Router.toLowerCase()) {

                // console.log(`\n\n [STREAMING] : Captured a transaction to a Uniswap V2 or V3 Router ${txContents.hash}`)

                // First check if the transaction is a remove liquidity transaction involving on of the tokens we have already bought
                // We are giving priority to transactions that might be scams to ensure we get out of the trade as fast as possible
                if (REMOVE_LIQUIDITY_FUNCTIONS.includes(txnMethodId)) {
                    console.log(`\n\n [STREAMING] : Captured a Remove liquidity transaction `)
                    const tokenRemoved = getRemovedToken(txContents.input)!

                    if (tokenRemoved) {
                        Object.values(tokensBought).map(async (token: TokenData) => {
                            if (tokenRemoved.toLowerCase() == token.tokenAddress) {
                                console.log(`\n\n [STREAMING] : A token we had bought is being removed liquidity`)

                                // Sell to exit scam
                                await exitOnScamTx(txContents, calledContract)
                            }
                        })
                    }


                    // if the transaction did not involve a remove liquidity transaction through the router 
                    // check if it was a transaction by one of the targets we follow
                } else if (WALLETS_TO_MONITOR.get(
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
                // Check if the transaction was a scam function through tht router
                // This ensures we capture custom scam functions

                Object.values(tokensBought).map(async (token: TokenData) => {
                    if (token.tokenAddress == calledContract) {
                        if (SCAM_FUNCTIONS.includes(txnMethodId)) {
                            console.log(`\n\n [STREAMING] : A token we had bought is invoking a known scam function`)

                            // The transaction calls a scam function on the token
                            await exitOnScamTx(txContents, calledContract)

                            // Token creator is calling a token contract function
                        } else if (targetWallet.toLowerCase() == token.tokenOwner) {
                            console.log(`\n\n [STREAMING]: Token owner is invoking a function on the token`)
                            console.log(`TRANSACTION:  ${txContents.hash} \n TOKEN : ${calledContract}`)

                            // If the owner of the token made a transaction, to the token we need to sell FAST
                            await exitOnScamTx(txContents, calledContract)
                        }
                    }
                })
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

        console.log("\n\n Tokens bought ", tokens.length)

        for (let each of tokens) {
            const tokenAddress = each.tokenAddress.toLowerCase()
            const collectionId = each._id.toString()

            if (!Object.keys(tokensBought).includes(collectionId)) {

                let tokenOwner;

                try {
                    // Get the owner of the token contract
                    console.log("Getting token owner for ", tokenAddress)
                    tokenOwner = await getTokenOwner(tokenAddress)
                    console.log("Token owner ", tokenOwner)

                } catch (error) {
                    // Error reading the owner from the contract means that the function does not exist in the contract
                    // We need to scrape it from etherscan

                    tokenOwner = await getContractDeployer(tokenAddress)
                }

                if (tokenOwner) {
                    tokensBought[collectionId] = { tokenAddress, tokenOwner: tokenOwner.toLowerCase() }
                }
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

                        let tokenOwner;

                        try {
                            // Get the owner of the token contract
                            tokenOwner = await getTokenOwner(tokenAddress)
                            console.log("Token owner ", tokenOwner)

                        } catch (error) {
                            // Error reading the owner from the contract means that the function does not exist in the contract
                            // We need to scrape it from etherscan
                            tokenOwner = await getContractDeployer(tokenAddress)
                        }

                        if (tokenOwner) {
                            tokensBought[collectionId] = { tokenAddress, tokenOwner: tokenOwner.toLowerCase() }
                        } else {
                            console.log("Token owner not found ", tokenAddress)
                        }
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


// Fetches the bought tokens when starting the bot and whenever a new token is bought 
const main = async () => {
    try {
        // Fetch bought tokens from db
        await fetchBoughtTokens()

        // Listen for newly bought tokens
        listenBoughtTokens()

        console.log("\n\n Tokens Bought  ", tokensBought)
    } catch (error) {
        console.log("Error in main function ", error)
    }
}


main()

