import { botParameters, STABLE_COIN_BNB_AMOUNT_TO_BUY, WAIT_TIME_AFTER_TRANSACTION, WALLETS_TO_MONITOR } from "../../config/setup";
import { sendNotification } from "../../telegram";
import { overLoads, TransactionData } from "../../types";
import { buy, sell } from "../../uniswap/swap";
import { checkToken, repeatedTokens, saveToken, stableTokens, waitForTransaction, walletNonce, wait } from "../../utils/common";
import { sellingNotification, sendTgNotification } from "../../utils/notifications";

// A patch to ensure the bot does not make several transactions at almost the same time. 
// This could cause the transactions to fail due to the overlapping nonce value

// The patch is implemented by having a gate (if statement) that will only allow transactions
// to be executed if the value of count is 0. The count is incremented by one whenever the 
// execution passes the "gate" to ensure no any other transaction can pass through. After the 
// transaction is broadcast, the count is reset to 0 to allow other transactions to flow in. 
let count = 0

export const executeTxns = async (txnData: TransactionData, overLoads: overLoads) => {
    const path = txnData.path
    const targetWallet = txnData.from;

    if (
        txnData.txnMethodName == "swapExactETHForTokens" ||
        txnData.txnMethodName == "swapExactETHForTokensSupportingFeeOnTransferTokens"
    ) {
        const token = path[path.length - 1];

        // TODO: To remove this log once the check is validated
        console.log(
            "\n\n Check ",
            token,
            stableTokens.includes(token.toLowerCase())
        );


        // Prevent the bot from copying trades involving stable tokens
        // Since the target could be cashing out
        if (!stableTokens.includes(token.toLowerCase())) {

            let dbTokens = await checkToken(token);

            if (
                txnData.value &&
                (dbTokens && dbTokens.length == 0) ||
                repeatedTokens.includes(token.toLowerCase())
            ) {

                // Ensure the bot is investing more than the maximum amount it should be investing
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
                    await waitForTransaction(buyTx.data)

                    count = 0;
                }
            } else {
                let message =
                    "Target is buying a token we had already bought";
                message += "\n\nTarget ";
                message += `\n${targetWallet}`;
                message += "\n\n Token";
                message += `\nhttps://etherscan.io/token/${path[path.length - 1]
                    }?a=${botParameters.swapperAddress}`;

                await sendNotification(message);

                count = 0;
            }

        }

    } else if (txnData.txnMethodName == "swapETHForExactTokens") {
        const token = path[path.length - 1];

        if (!stableTokens.includes(token.toLowerCase())) {
            let token = path[path.length - 1];
            let dbTokens = await checkToken(token);

            if (
                (dbTokens && dbTokens.length == 0) ||
                repeatedTokens.includes(token.toLowerCase())
            ) {

                // Ensure the bot is investing more than the maximum amount it should be investing
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
                    await waitForTransaction(buyTx.data)

                    count = 0;
                }
            } else {
                let message =
                    "Target is buying a token we had already bought";
                message += "\n\nTarget ";
                message += `\n${targetWallet}`;
                message += "\n\n Token";
                message += `\nhttps://etherscan.io/token/${path[path.length - 1]
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
        let token = txnData.path[0];

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
        if (
            (stableTokens.includes(path[0].toLowerCase()) &&
                path[path.length - 1].toLowerCase() !=
                botParameters.wethAddress.toLowerCase() &&
                !stableTokens.includes(path[path.length - 1].toLowerCase())) ||
            path[0].toLowerCase() == botParameters.wethAddress.toLowerCase()
        ) {
            const nonce = await walletNonce();

            console.log("Nonce ", nonce);

            let token = path[path.length - 1];
            let dbTokens = await checkToken(token);

            if (
                (dbTokens && dbTokens.length == 0) ||
                repeatedTokens.includes(token.toLowerCase())
            ) {
                if (count < 1) {
                    count++;

                    console.log("\n\n Buying with tokens for tokens ");

                    let buyTx = await buy(
                        STABLE_COIN_BNB_AMOUNT_TO_BUY,
                        0,
                        [botParameters.wethAddress, path[path.length - 1]],
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
                }
            } else {
                let message =
                    "Target is buying a token we had already bought";
                message += "\n\nTarget ";
                message += `\n${targetWallet}`;
                message += "\n\n Token";
                message += `\nhttps://etherscan.io/token/${path[path.length - 1]
                    }?a=${botParameters.swapperAddress}`;

                await sendNotification(message);

                count = 0
            }

        } else if (await checkToken(path[0])) {
            try {

                if (count < 1) {
                    count++;
                    let sellTx = await sell(
                        0,
                        [path[0], botParameters.wethAddress],
                        overLoads
                    );

                    await sendTgNotification(
                        targetWallet,
                        txnData.hash,
                        sellTx!.data,
                        "SELL",
                        path[0]
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

    } else if (
        txnData.txnMethodName == "exactOutputSingle"
    ) {
        // Buying or Selling with Multicall using exact output

    }
}