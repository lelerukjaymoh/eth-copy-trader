import {
  DEFAULT_GAS_LIMIT,
  BLACKLIST_FUNCTIONS,
  botParameters,
  SCAM_FUNCTIONS,
  WALLETS_TO_MONITOR,
  ADDITIONAL_SELL_GAS,
  ADDITIONAL_BUY_GAS,
  EXCLUDED_TOKENS,
  STABLE_TOKENS,
  REPEATED_BOUGHT_TOKENS,
  WAIT_TIME_AFTER_TRANSACTION,
  STABLE_COIN_BNB_AMOUNT_TO_BUY,
} from "./config/setup";
import { BigNumber, ethers } from "ethers";
import { overLoads, txContents } from "./types";
import {
  checkToken,
  ERC20Interface,
  walletNonce,
  provider,
  saveToken,
  wait,
} from "./utils/common";
import { sellingNotification, sendTgNotification } from "./utils/notifications";
import { buy, sell } from "./uniswap/swap";
import { sendNotification } from "./telegram";
import { decodeMulticallTransaction } from "./packages/decoder/multicall";
// import { decodeMulticallTransaction } from "./decoder/decodeMulticall";

if (!process.env.WALLET_ADDRESS) {
  throw new Error("WALLET_ADDRESS was not provided in the .env ");
}


const stableTokens = STABLE_TOKENS.map((token: string) => {
  return token.toLowerCase();
});

const repeatedTokens = REPEATED_BOUGHT_TOKENS.map((token: string) => {
  return token.toLowerCase();
});

const walletAddress = ethers.utils.getAddress(process.env.WALLET_ADDRESS);

const tokensMonitored: string[] = [];

let count = 0;

const mempoolData = async (txContents: txContents) => {
  try {

    // if (
    //   Array.from(WALLETS_TO_MONITOR.keys()).includes(
    //     txContents.from.toLowerCase()
    //   )
    // ) {
    if (!methodsExclusion.includes(txContents.input)) {
      console.log(
        "\n\n\n==================================================================================="
      );
      console.log("\nPicked up a transaction at ", new Date(), count);

      if (txContents.to) {

        let routerAddress = txContents.to.toLowerCase();

        // console.log("Value ", parseInt(txContents.value._hex, 16));

        const ethAmount = parseInt(txContents.value._hex, 16)

        // if (ethAmount > 1 * 1e18) {

        // console.log("\n\n\n Amount is greater than 1 eth");

        // console.log(routerAddress == botParameters.uniswapv2Router.toLowerCase());
        if (routerAddress == botParameters.uniswapv2Router.toLowerCase() || routerAddress == "0x7a250d5630b4cf539739df2c5dacb4c659f2488d") {

          console.log(txContents);

          const decodedMulticallData = decodeMulticallTransaction(txContents.input)

          console.log(decodedMulticallData);


          const decodedInput = decodeMulticallTransaction(txContents.input)

          ERC20Interface.parseTransaction({
            data: txContents.input,
          });

          console.log("Decoded Data", decodedInput);
          let path = decodedInput!.args.path;

          if (
            !EXCLUDED_TOKENS.includes(path[0].toLowerCase()) ||
            !EXCLUDED_TOKENS.includes(path[path.length - 1])
          ) {
            // Get Targets Transaction Details
            let gasLimit = parseInt(txContents.gas.toString(), 16);

            // let gasPrice = parseInt(txContents.gasPrice!, 16);
            let overLoads: overLoads;

            if (isNaN(gasLimit)) {
              gasLimit = DEFAULT_GAS_LIMIT;
            }

            const nonce = await provider.getTransactionCount(
              process.env.WALLET_ADDRESS!
            );

            if (txContents.gasPrice) {
              overLoads = {
                nonce,
                gasPrice: parseInt(txContents.gasPrice!.toString(), 16),
                gasLimit: DEFAULT_GAS_LIMIT,
              };
            } else {
              overLoads = {
                nonce,
                maxPriorityFeePerGas: parseInt(
                  txContents.maxPriorityFeePerGas!.toString(),
                  16
                ),
                maxFeePerGas: parseInt(txContents.maxFeePerGas!.toString(), 16),
                gasLimit: DEFAULT_GAS_LIMIT,
              };
            }

            let value = parseInt(txContents.value.toString(), 16);

            let txnMethod = decodedInput.name;
            let targetWallet = txContents.from;

            const MAX_ETH_AMOUNT_TO_BUY = WALLETS_TO_MONITOR.get(
              targetWallet.toLowerCase()
            )!;

            console.log("Buy amount ", MAX_ETH_AMOUNT_TO_BUY, value)

            let ourEthAmount =
              value > MAX_ETH_AMOUNT_TO_BUY ? MAX_ETH_AMOUNT_TO_BUY : value;

            if (
              txnMethod == "swapExactETHForTokens" ||
              txnMethod == "swapExactETHForTokensSupportingFeeOnTransferTokens"
            ) {
              let targetWallet = txContents.from;
              let token = path[path.length - 1];

              // if (value < TARGET_MINIMUM_BUY_AMOUNT) {

              console.log(
                "\n\n Check ",
                token,
                stableTokens.includes(token.toLowerCase())
              );

              if (!stableTokens.includes(token.toLowerCase())) {
                let nonce = await walletNonce(walletAddress);
                console.log("Nonce : ", nonce);

                if (nonce) {
                  let dbTokens = await checkToken(token);

                  if (
                    (dbTokens && dbTokens.length == 0) ||
                    repeatedTokens.includes(token.toLowerCase())
                  ) {
                    if (count < 1) {
                      count++;
                      let buyTx = await buy(ourEthAmount, 0, path, overLoads);

                      if (buyTx.success) {
                        await saveToken(token, buyTx.data);

                        await sendTgNotification(
                          targetWallet,
                          txContents.hash,
                          buyTx.data,
                          "BUY",
                          token
                        );
                      }

                      await provider.waitForTransaction(
                        buyTx.data,
                        1,
                        WAIT_TIME_AFTER_TRANSACTION
                      );
                      // count = 0;
                    }
                  } else {
                    let message =
                      "Target is buying a token we had already bought";
                    message += "\n\nTarget ";
                    message += `\n${txContents.from}`;
                    message += "\n\n Token";
                    message += `\nhttps://etherscan.io/token/${path[path.length - 1]
                      }?a=${botParameters.swapperAddress}`;

                    sendNotification(message);
                  }
                } else {
                  let message = "⚠️ Error message ⚠️";
                  message += "\n\n Bot timed out while getting nonce.";

                  sendNotification(message);
                }
              } else {
                console.log("\n\n Skipping stable token ", token);
              }
              // } else {
              //   let message = "Low Target BUY Amount";
              //   message += "\n--------";
              //   message += `\n\n Target buy amount : ${value / 10 ** 18} bnb`;
              //   message += `\n Target: https://etherscan.io/address/${targetWallet}`;
              //   message += `\n Tx : https://etherscan.io/tx/${txContents.hash}`;

              //   await sendNotification(message);
              // }
            } else if (txnMethod == "swapETHForExactTokens") {
              let targetWallet = txContents.from;
              let token = path[path.length - 1];

              // if (value < TARGET_MINIMUM_BUY_AMOUNT) {
              let ourEthAmount = value;

              let tokenAmounts = parseInt(decodedInput.args.amountOut._hex, 16);

              const MAX_ETH_AMOUNT_TO_BUY = WALLETS_TO_MONITOR.get(
                targetWallet.toLowerCase()
              )!;

              console.log("Buy amount ", MAX_ETH_AMOUNT_TO_BUY, value)


              if (value > MAX_ETH_AMOUNT_TO_BUY) {
                ourEthAmount = MAX_ETH_AMOUNT_TO_BUY;
                tokenAmounts = (MAX_ETH_AMOUNT_TO_BUY / value) * tokenAmounts;
              }

              let nonce = await walletNonce(walletAddress);
              console.log("Nonce : ", nonce);

              if (!stableTokens.includes(token.toLowerCase())) {
                if (nonce) {
                  let token = path[path.length - 1];
                  let dbTokens = await checkToken(token);

                  if (
                    (dbTokens && dbTokens.length == 0) ||
                    repeatedTokens.includes(token.toLowerCase())
                  ) {
                    if (count < 1) {
                      count++;
                      let buyTx = await buy(
                        ourEthAmount,
                        tokenAmounts,
                        path,
                        overLoads
                      );

                      if (buyTx.success) {
                        await saveToken(token, buyTx.data);

                        await sendTgNotification(
                          targetWallet,
                          txContents.hash,
                          buyTx.data,
                          "BUY",
                          token
                        );
                      }

                      await provider.waitForTransaction(
                        buyTx.data,
                        1,
                        WAIT_TIME_AFTER_TRANSACTION
                      );
                      // count = 0;
                    }
                  } else {
                    let message =
                      "Target is buying a token we had already bought";
                    message += "\n\nTarget ";
                    message += `\n${txContents.from}`;
                    message += "\n\n Token";
                    message += `\nhttps://etherscan.io/token/${path[path.length - 1]
                      }?a=${botParameters.swapperAddress}`;

                    sendNotification(message);
                  }
                } else {
                  let message = "⚠️ Error message ⚠️";
                  message += "\n\n Bot timed out while getting nonce.";

                  sendNotification(message);
                }
              } else {
                console.log("\n\n Skipping stable token ", token);
              }
              // } else {
              //   let message = "Low Target BUY Amount";
              //   message += "\n--------";
              //   message += `\n\n Target buy amount : ${value / 10 ** 18} bnb`;
              //   message += `\n Target: https://etherscan.io/address/${targetWallet}`;
              //   message += `\n Tx : https://etherscan.io/tx/${txContents.hash}`;

              //   await sendNotification(message);
              // }
            } else if (
              txnMethod == "swapExactTokensForETH" ||
              txnMethod == "swapTokensForExactETH" ||
              txnMethod == "swapExactTokensForETHSupportingFeeOnTransferTokens"
            ) {
              let token = decodedInput.args.path[0];

              if (await checkToken(token)) {
                try {
                  let nonce = await walletNonce(walletAddress);
                  console.log("Nonce : ", nonce);

                  if (nonce) {
                    if (count < 1) {
                      count++;
                      let sellTx = await sell(0, path, overLoads);

                      await sendTgNotification(
                        txContents.from,
                        txContents.hash,
                        sellTx!.data,
                        "SELL",
                        token
                      );

                      await wait(WAIT_TIME_AFTER_TRANSACTION);
                      // count = 0;
                    }
                  } else {
                    let message = "⚠️ Error message ⚠️";
                    message += "\n\n Bot timed out while getting nonce.";

                    sendNotification(message);
                  }
                } catch (error) {
                  // count = 0;
                  console.log(
                    "Got an error while preparing for a swapTokensForExactETH: ",
                    error
                  );
                }
              }

              await sellingNotification(token, targetWallet);
            } else if (
              txnMethod == "swapExactTokensForTokens" ||
              txnMethod == "swapExactTokensForTokensSupportingFeeOnTransferTokens"
            ) {
              if (
                (stableTokens.includes(path[0].toLowerCase()) &&
                  path[path.length - 1].toLowerCase() !=
                  botParameters.wethAddress.toLowerCase() &&
                  !stableTokens.includes(path[path.length - 1].toLowerCase())) ||
                path[0].toLowerCase() == botParameters.wethAddress.toLowerCase()
              ) {
                let token = path[path.length - 1];

                const nonce = await walletNonce(process.env.WALLET_ADDRESS!);

                console.log("Nonce ", nonce);

                if (nonce) {
                  let token = path[path.length - 1];
                  let dbTokens = await checkToken(token);

                  if (
                    (dbTokens && dbTokens.length == 0) ||
                    repeatedTokens.includes(token.toLowerCase())
                  ) {
                    if (count < 1) {
                      count++;
                      let buyTx = await buy(
                        STABLE_COIN_BNB_AMOUNT_TO_BUY,
                        0,
                        [botParameters.wethAddress, path[path.length - 1]],
                        overLoads
                      );

                      if (buyTx.success) {
                        await saveToken(token, buyTx.data);

                        await sendTgNotification(
                          txContents.from,
                          txContents.hash,
                          buyTx.data,
                          "BUY",
                          token
                        );
                      }

                      await wait(WAIT_TIME_AFTER_TRANSACTION);
                      // count = 0;
                    } else {
                      console.log("Count was greater than 1");
                    }
                  } else {
                    let message =
                      "Target is buying a token we had already bought";
                    message += "\n\nTarget ";
                    message += `\n${txContents.from}`;
                    message += "\n\n Token";
                    message += `\nhttps://etherscan.io/token/${path[path.length - 1]
                      }?a=${botParameters.swapperAddress}`;

                    sendNotification(message);
                  }
                } else {
                  let message = "⚠️ Error message ⚠️";
                  message += "\n\n Bot timed out while getting nonce.";

                  sendNotification(message);
                }

                console.log("\n\n Buying with tokens for tokens ");
              } else if (await checkToken(path[0])) {
                try {
                  let nonce = await walletNonce(walletAddress);
                  console.log("Nonce : ", nonce);

                  if (nonce) {
                    if (count < 1) {
                      count++;
                      let sellTx = await sell(
                        0,
                        [path[0], botParameters.wethAddress],
                        overLoads
                      );

                      await sendTgNotification(
                        txContents.from,
                        txContents.hash,
                        sellTx!.data,
                        "SELL",
                        path[0]
                      );

                      await wait(WAIT_TIME_AFTER_TRANSACTION);
                      // count = 0;
                    } else {
                      console.log("Count was greater than 1");
                    }
                  } else {
                    let message = "⚠️ Error message ⚠️";
                    message += "\n\n Bot timed out while getting nonce.";

                    sendNotification(message);
                  }
                } catch (error) {
                  // count = 0;
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
            }
          } else {
            console.log("\n\n Token was in our exclusion list ", path);
          }

        } else {
          console.log(
            "\n\n\n Target's transaction was not to UNISWAP Router ",
            routerAddress, txContents.hash
          );
        }
        // }
      }
    }
    // }
  } catch (error) {
    // count = 0;
    console.log("Error: ", error);
  }
};

export { mempoolData };
