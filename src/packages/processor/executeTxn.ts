import { botParameters, EXCLUDED_TOKENS, STABLE_COIN_BNB_AMOUNT_TO_BUY, WAIT_TIME_AFTER_TRANSACTION } from "../../config/setup";
import { sendNotification } from "../../telegram";
import { overLoads, TransactionData } from "../../types";
import { buy, sell } from "../../uniswap/v2/swap";
import { checkToken, repeatedTokens, saveToken, stableTokens, waitForTransaction, walletNonce, wait } from "../../utils/common";
import { sellingNotification, sendTgNotification } from "../../utils/notifications";
import { v3buy, v3sell } from "../../uniswap/v3";


// A patch to ensure the bot does not make several transactions at almost the same time. 
// This could cause the transactions to fail due to the overlapping nonce value

// The patch is implemented by having a gate (if statement) that will only allow transactions
// to be executed if the value of count is 0. The count is incremented by one whenever the 
// execution passes the "gate" to ensure no any other transaction can pass through. After the 
// transaction is broadcast, the count is reset to 0 to allow other transactions to flow in. 
let count = 0

export const executeTxn = async (txnData: TransactionData, overLoads: overLoads) => {
    const path = txnData.path

    // console.log("Executing transactions", path);


    const targetWallet = txnData.from;

    if (
        txnData.txnMethodName == "swapExactETHForTokens" ||
        txnData.txnMethodName == "swapExactETHForTokensSupportingFeeOnTransferTokens"
    ) {
        const token = path.tokenOut;

        // TODO: To remove this log once the check is validated
        // console.log(
        //     "\n\n Check ",
        //     token,
        //     stableTokens.includes(token.toLowerCase())
        // );

        console.log("\n\n[PROCESSING] : SwapExactETH transaction to be routed to v2 ")


        // Prevent the bot from copying trades involving stable tokens
        // Since the target could be cashing out
        if (!stableTokens.includes(token.toLowerCase())) {

            let dbTokens = await checkToken(token);

            // Prevent the bot from buying tokens we have already bought
            if (
                (dbTokens && dbTokens.length == 0) ||
                repeatedTokens.includes(token.toLowerCase())
            ) {

                // Ensure the bot is not investing more than the maximum amount it should be investing
                const botAmountIn = txnData.value! > txnData.maxInvestment ? txnData.maxInvestment : txnData.value;

                if (count < 1) {
                    count++;
                    let buyTx = await buy(botAmountIn!, txnData.botAmountOut, path, overLoads);

                    if (buyTx.success) {
                        await saveToken(token, buyTx.data);

                        await sendTgNotification(
                            targetWallet,
                            txnData.hash,
                            buyTx.data,
                            "BUY",
                            token
                        );
                    }

                    // Wait for the transaction to be confirmed
                    // await waitForTransaction(buyTx.data)

                    count = 0;
                }
            } else {
                let message =
                    "Target is buying a token we had already bought";
                message += "\n\nTarget ";
                message += `\n${targetWallet}`;
                message += "\n\n Token";
                message += `\nhttps://etherscan.io/token/${path.tokenOut
                    }?a=${botParameters.swapperAddress}`;

                await sendNotification(message);

                count = 0;
            }

        }

    } else if (txnData.txnMethodName == "swapETHForExactTokens") {

        console.log("\n\n[PROCESSING] : SwapETHForExactTokens transaction to be routed to v2 ")

        const token = path.tokenOut;

        // Prevent the bot from buying a stable coin
        if (!stableTokens.includes(token.toLowerCase())) {
            let token = path.tokenOut;
            let dbTokens = await checkToken(token);

            // Prevent the bot from buying tokens we have already bought
            if (
                (dbTokens && dbTokens.length == 0) ||
                repeatedTokens.includes(token.toLowerCase())
            ) {

                // Ensure the bot is not investing more than the maximum amount it should be investing
                const botAmountIn = txnData.value! > txnData.maxInvestment ? txnData.maxInvestment : txnData.value;

                if (count < 1) {
                    count++;

                    let buyTx = await buy(botAmountIn!, txnData.botAmountOut, path, overLoads);

                    if (buyTx.success) {
                        await saveToken(token, buyTx.data);

                        await sendTgNotification(
                            targetWallet,
                            txnData.hash,
                            buyTx.data,
                            "BUY",
                            token
                        );
                    }

                    // Wait for the transaction to be confirmed
                    // await waitForTransaction(buyTx.data)

                    count = 0;
                }
            } else {
                let message =
                    "Target is buying a token we had already bought";
                message += "\n\nTarget ";
                message += `\n${targetWallet}`;
                message += "\n\n Token";
                message += `\nhttps://etherscan.io/token/${path.tokenOut
                    }?a=${botParameters.swapperAddress}`;

                await sendNotification(message);
            }

        } else {
            console.log("\n\n Skipping stable token ", token);
        }

    } else if (
        txnData.txnMethodName == "swapExactTokensForETH" ||
        txnData.txnMethodName == "swapTokensForExactETH" ||
        txnData.txnMethodName == "swapExactTokensForETHSupportingFeeOnTransferTokens"
    ) {

        console.log("\n\n [PROCESSING] : Sell transaction to be routed through v2 ")

        let token = path.tokenIn;

        // Check if we currently hold this token
        if (await checkToken(token)) {
            try {

                if (count < 1) {
                    count++;

                    let sellTx = await sell(0, path, overLoads);

                    await sendTgNotification(
                        targetWallet,
                        txnData.hash,
                        sellTx!.data,
                        "SELL",
                        token
                    );

                    await wait(WAIT_TIME_AFTER_TRANSACTION);
                    count = 0;
                }
            } catch (error) {
                console.log(
                    "Got an error while preparing for a swapTokensForExactETH: ",
                    error
                );
            }
        }

        await sellingNotification(token, targetWallet);
    } else if (
        txnData.txnMethodName == "swapExactTokensForTokens" ||
        txnData.txnMethodName == "swapExactTokensForTokensSupportingFeeOnTransferTokens"
    ) {

        console.log("\n\n [PROCESSING] : SwapTokensForTokens transaction to be routed through v2 ")

        // This check are required so as to ensure we are buying or selling as required 
        // since swapTokensForTokens transactions can either be a buy or sell.
        // Checking several this as listed below :
        // 1. The token IN is WETH, to ensure its a buy

        if (
            (path.tokenIn.toLowerCase() == botParameters.wethAddress.toLowerCase())   // Token used to buy is WETH
        ) {
            const nonce = await walletNonce();

            let token = path.tokenOut;
            let dbTokens = await checkToken(token);

            // Check if we currently hold this token
            if (
                (dbTokens && dbTokens.length == 0) ||
                repeatedTokens.includes(token.toLowerCase())
            ) {
                if (count < 1) {
                    count++;

                    let buyTx = await buy(
                        STABLE_COIN_BNB_AMOUNT_TO_BUY,
                        0,
                        path,
                        overLoads
                    );

                    if (buyTx.success) {
                        await saveToken(token, buyTx.data);

                        await sendTgNotification(
                            targetWallet,
                            txnData.hash,
                            buyTx.data,
                            "BUY",
                            token
                        );
                    }

                    await wait(WAIT_TIME_AFTER_TRANSACTION);
                    count = 0;

                }
            } else {
                let message =
                    "Target is buying a token we had already bought";
                message += "\n\nTarget ";
                message += `\n${targetWallet}`;
                message += "\n\n Token";
                message += `\nhttps://etherscan.io/token/${path.tokenOut}?a=${botParameters.swapperAddress}`;

                await sendNotification(message);

                count = 0
            }

            // In TokensForTokens swap we check if its a sell by 
        } else if (await checkToken(path.tokenIn)) {
            try {

                if (count < 1) {
                    count++;
                    let sellTx = await sell(
                        0,
                        path,
                        overLoads
                    );

                    await sendTgNotification(
                        targetWallet,
                        txnData.hash,
                        sellTx!.data,
                        "SELL",
                        path.tokenIn
                    );

                    await wait(WAIT_TIME_AFTER_TRANSACTION);

                    count = 0
                }

            } catch (error) {
                console.log(
                    "Got an error while preparing for a swapExactTokensForTokens: ",
                    error
                );
            }
        } else {
            console.log(
                "\n\n Target is trying to sell a token that we never bought or is buying with a token that's not WBNB"
            );

        }
    } else if (
        txnData.txnMethodName == "exactInputSingle"
    ) {
        // Buying or Selling with Multicall using exact input
        console.log("\n\n [PROCESSING] : V3 transaction using exactInputSingle  to be routed through the smart contract and V3 router")

        const txnParams = {
            tokenIn: path.tokenIn,
            tokenOut: path.tokenOut,
            amountIn: txnData.botAmountIn,
            amountOut: txnData.botAmountOut,
            fee: 3000,
            sqrtPriceLimitX96: 0
        }
        if (txnData.txnType == "buy") {

            overLoads.value = txnData.value?.toString()
            const buyTx = await v3buy(txnParams, overLoads)

            if (buyTx && buyTx.success) {
                await saveToken(txnParams.tokenOut, buyTx.data);

                await sendTgNotification(
                    targetWallet,
                    txnData.hash,
                    buyTx.data,
                    "BUY",
                    path.tokenOut
                );
            }


        } else if (txnData.txnType == "sell") {

            const sellTx = await v3sell(txnParams, overLoads)

            if (sellTx && sellTx.success) {
                await sendTgNotification(
                    targetWallet,
                    txnData.hash,
                    sellTx!.data,
                    "SELL",
                    path.tokenIn
                );
            }
        }

    } else if (
        txnData.txnMethodName == "exactOutputSingle"
    ) {
        // Buying or Selling with Multicall using exact output

        if (txnData.txnType == "buy") {

        } else if (txnData.txnType == "sell") {

        }

    }
}