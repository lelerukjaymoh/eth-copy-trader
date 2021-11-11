import {
  DEFAULT_GAS_LIMIT,
  BLACKLIST_FUNCTIONS,
  botParams,
  ETH_AMOUNT_TO_BUY,
  LIQUIDITY_METHODS,
  SCAM_FUNCTIONS,
  TOKENS_TO_MONITOR,
  ADDITIONAL_SELL_GAS,
  EXACT_TOKEN_AMOUNT_TO_BUY,
} from "./config/setup";
import { readFileSync } from "fs";
import { ethers } from "ethers";
import { overLoads, txContents } from "./types";
import {
  buyMessage,
  currentNonce,
  scamTxMessage,
  tokenBalance,
} from "./utils/common";
import { sendNotification } from "./telegram";
import { swapETHForExactTokens, swapExactETHForTokens } from "./uniswap/buy";
import { swapExactTokensForETHSupportingFeeOnTransferTokens } from "./uniswap/sell";
import { buy } from "./uniswap/swap";
import { swapExactTokensForETH } from "./uniswap/sell";
import { approve } from "./uniswap/approve";

const methodsExclusion = ["0x", "0x0"];
var PANCAKESWAP_ABI = JSON.parse(
  readFileSync(`src/uniswap/pancakeSwapABI.json`, "utf8")
);

// Initilise an interface of the ABI
const inter = new ethers.utils.Interface(PANCAKESWAP_ABI);

const constPrepareTokens = (tokens: any) => {
  const iTokens = new Map();
  TOKENS_TO_MONITOR.forEach((token) => {
    iTokens.set(token.token.toLowerCase(), {
      buyType: token.buyType.toLowerCase(),
      buyToken: token.buyToken.toLowerCase(),
    });
  });

  return iTokens;
};

const tokensToMonitor = constPrepareTokens(TOKENS_TO_MONITOR);
console.log("Tokens ", tokensToMonitor);

let count = 0;

const mempoolData = async (txContents: txContents) => {
  try {
    if (!methodsExclusion.includes(txContents.input)) {
      // console.log(txContents.hash);

      // Only Concentrate on txn to the uniswap router
      let routerAddress = txContents.to.toLowerCase();
      let TOKEN_AMOUNT_TO_BUY;

      if (
        routerAddress.toLowerCase() == botParams.uniswapv2Router.toLowerCase()
      ) {
        const decodedInput = inter.parseTransaction({
          data: txContents.input,
        });

        console.log("Decoded Data", decodedInput);

        let gasPrice = parseInt(txContents.gasPrice?._hex!, 16);
        let maxFee = parseInt(txContents.maxFeePerGas?._hex!, 16);
        let priorityFee = parseInt(txContents.maxPriorityFeePerGas?._hex!, 16);
        let overLoads: overLoads;

        let nonce = await currentNonce();

        console.log("Nonce ", nonce);

        if (isNaN(maxFee)) {
          overLoads = {
            nonce,
            gasPrice,
            gasLimit: DEFAULT_GAS_LIMIT,
          };
        } else {
          overLoads = {
            nonce,
            maxPriorityFeePerGas: priorityFee,
            maxFeePerGas: maxFee,
            gasLimit: DEFAULT_GAS_LIMIT,
          };
        }

        let methodName = decodedInput.name;

        console.log("GasPrice ", gasPrice);
        console.log("MAxFee ", maxFee);

        console.log("\n Method Name : ", methodName);
        console.log("Gas price : ", gasPrice! / 1000000000);
        console.log("Gas Limit ", DEFAULT_GAS_LIMIT);
        console.log("txData ", txContents);

        if (methodName == "addLiquidity") {
          count++;
          let tokenA = decodedInput.args.tokenA;
          let tokenB = decodedInput.args.tokenB;
          let token;

          console.log("TokenA ", tokenA.toLowerCase());
          console.log("TokenB ", tokenB.toLowerCase());

          if (tokensToMonitor.has(tokenA.toLowerCase())) {
            token = tokenA;
          } else if (tokensToMonitor.has(tokenB.toLowerCase())) {
            token = tokenB;
          }

          if (token) {
            console.log(
              "\n\n\n\n **********************************************"
            );
            console.log(
              "Captured an add liquidity transaction for a token we are tracking : ",
              token
            );
            console.log("Method Used : ", methodName);
            console.log("**********************************************");

            let path = [botParams.wethAddrress, token];
            let tx;

            if (nonce && path && priorityFee && maxFee && DEFAULT_GAS_LIMIT) {
              if ((tokensToMonitor.get(token)["buyToken"] = "t")) {
                TOKEN_AMOUNT_TO_BUY = EXACT_TOKEN_AMOUNT_TO_BUY;

                if (tokensToMonitor.get(token)["buyType"] == "c") {
                  tx = await buy(
                    ETH_AMOUNT_TO_BUY,
                    TOKEN_AMOUNT_TO_BUY,
                    path,
                    overLoads
                  );
                } else {
                  tx = await swapETHForExactTokens(
                    TOKEN_AMOUNT_TO_BUY,
                    ETH_AMOUNT_TO_BUY,
                    path,
                    overLoads
                  );
                }
              } else {
                if (tokensToMonitor.get(token)["buyType"] == "c") {
                  tx = await buy(ETH_AMOUNT_TO_BUY, 0, path, overLoads);
                } else {
                  tx = await swapExactETHForTokens(
                    0,
                    ETH_AMOUNT_TO_BUY,
                    path,
                    overLoads
                  );
                }
              }

              if (tx.success == true) {
                overLoads.nonce! += 1;
                await approve(token, overLoads);

                sendNotification(buyMessage(token, tx.data));
              }
            }
          } else {
            console.log("\n\n =====>  Token was not on our tracking list");
          }
        } else if (methodName == "addLiquidityETH") {
          let token = decodedInput.args.token.toLowerCase();

          console.log("Token : ", token);

          if (tokensToMonitor.has(token.toLowerCase())) {
            console.log(
              "\n\n\n\n\n\n\n **********************************************"
            );
            console.log(
              "\nCaptured an add liquidity transaction for a token we are tracking : ",
              token
            );
            console.log("Method used : ", methodName);
            console.log("\n**********************************************");

            let path = [botParams.wethAddrress, ethers.utils.getAddress(token)];

            console.log("Overloads ", overLoads);

            if (overLoads) {
              count++;

              let buyTxHash;

              console.log(tokensToMonitor);
              console.log(tokensToMonitor.get(token));
              console.log(tokensToMonitor.get(token)["buyType"]);

              if ((tokensToMonitor.get(token)["buyToken"] = "t")) {
                TOKEN_AMOUNT_TO_BUY = EXACT_TOKEN_AMOUNT_TO_BUY;

                if (tokensToMonitor.get(token)["buyType"] == "c") {
                  buyTxHash = await buy(
                    ETH_AMOUNT_TO_BUY,
                    TOKEN_AMOUNT_TO_BUY,
                    path,
                    overLoads
                  );
                } else {
                  buyTxHash = await swapETHForExactTokens(
                    TOKEN_AMOUNT_TO_BUY,
                    ETH_AMOUNT_TO_BUY,
                    path,
                    overLoads
                  );
                }
              } else {
                if (tokensToMonitor.get(token)["buyType"] == "c") {
                  buyTxHash = await buy(ETH_AMOUNT_TO_BUY, 0, path, overLoads);
                } else {
                  buyTxHash = await swapExactETHForTokens(
                    0,
                    ETH_AMOUNT_TO_BUY,
                    path,
                    overLoads
                  );
                }
              }

              if (buyTxHash && buyTxHash.success == true) {
                overLoads.nonce! += 1;
                await approve(token, overLoads);

                sendNotification(buyMessage(token, buyTxHash.data));
              }
            } else {
              let message =
                "We could not generate the Overloads or the path for the transaction correctly (This should be a bug)";

              console.log(message);
              sendNotification(message);
            }
          }
        } else {
          console.log("\n\n =====>  Token was not on our tracking list");
        }
      } else if (tokensToMonitor.has(routerAddress)) {
        console.log("\n\n\n\n **********************************************");
        console.log(
          "Captured a transaction to a token we are tracking ",
          txContents.to
        );
        console.log("**********************************************");

        let gasPrice = parseInt(txContents.gasPrice?._hex!, 16);
        let maxFee = parseInt(txContents.maxFeePerGas?._hex!, 16);
        let priorityFee = parseInt(txContents.maxPriorityFeePerGas?._hex!, 16);
        const txnMethod = txContents.input.substring(2, 10);
        let overLoads: overLoads;

        let nonce = await currentNonce();
        console.log("Nonce ", nonce);

        if (isNaN(maxFee)) {
          overLoads = {
            nonce,
            gasPrice: gasPrice,
            gasLimit: DEFAULT_GAS_LIMIT,
          };
        } else {
          overLoads = {
            nonce,
            maxPriorityFeePerGas: priorityFee,
            maxFeePerGas: maxFee,
            gasLimit: DEFAULT_GAS_LIMIT,
          };
        }

        if (overLoads!) {
          let path = [botParams.wethAddrress, routerAddress!];
          let buyTxHash;

          if (LIQUIDITY_METHODS.includes(txnMethod)) {
            if ((tokensToMonitor.get(routerAddress)["buyToken"] = "t")) {
              TOKEN_AMOUNT_TO_BUY = EXACT_TOKEN_AMOUNT_TO_BUY;

              if (tokensToMonitor.get(routerAddress)["buyType"] == "c") {
                buyTxHash = await buy(
                  ETH_AMOUNT_TO_BUY,
                  TOKEN_AMOUNT_TO_BUY,
                  path,
                  overLoads
                );
              } else {
                buyTxHash = await swapETHForExactTokens(
                  TOKEN_AMOUNT_TO_BUY,
                  ETH_AMOUNT_TO_BUY,
                  path,
                  overLoads
                );
              }
            } else {
              if (tokensToMonitor.get(routerAddress)["buyType"] == "c") {
                buyTxHash = await buy(ETH_AMOUNT_TO_BUY, 0, path, overLoads);
              } else {
                buyTxHash = await swapExactETHForTokens(
                  0,
                  ETH_AMOUNT_TO_BUY,
                  path,
                  overLoads
                );
              }
            }

            if (buyTxHash.success == true) {
              overLoads.nonce! += 1;
              await approve(routerAddress, overLoads);

              sendNotification(buyMessage(routerAddress, buyTxHash.data));
            }
          } else if (
            SCAM_FUNCTIONS.includes(txnMethod) ||
            BLACKLIST_FUNCTIONS.includes(txnMethod)
          ) {
            console.log("#########################");
            console.log(
              "The token is trying to use a SCAM or BLACKLIST method."
            );
            console.log("#########################");

            console.log("Trying to get out of the trade");

            if (overLoads && overLoads.gasPrice) {
              overLoads.gasPrice! + ADDITIONAL_SELL_GAS;
            } else {
              overLoads.maxPriorityFeePerGas! + ADDITIONAL_SELL_GAS;
            }

            const amountIn = await tokenBalance(
              routerAddress,
              process.env.WALLET_ADDRESS!
            );

            const path = [routerAddress!, botParams.wethAddrress];

            console.log("Overloads ", overLoads);

            if (overLoads && path && amountIn && amountIn > 0) {
              const tx =
                await swapExactTokensForETHSupportingFeeOnTransferTokens(
                  amountIn,
                  0,
                  path,
                  overLoads
                );

              if (tx.success == true) {
                sendNotification(scamTxMessage(routerAddress, tx.data));
              }
            } else {
              let message = "One of the errors below occurred";
              message +=
                "\n\n - We could not generate the Overloads or the path for the transaction correctly (This should be a bug)";
              message += "\n\n - We dont hold any of this tokens: ";
              message += `\n  Token: https://etherscan.io/token/${routerAddress}`;
              message += `\n  Our Token Balance: ${amountIn}`;

              console.log(message);
              sendNotification(message);
            }
          }
        }
      }
    }
  } catch (error) {
    console.log("Error in main function ", error);
  }
};

export { mempoolData };
