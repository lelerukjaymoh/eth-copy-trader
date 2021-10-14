import {
  DEFAULT_GAS_LIMIT,
  BLACKLIST_FUNCTIONS,
  botParams,
  ETH_AMOUNT_TO_BUY,
  LIQUIDITY_METHODS,
  SCAM_FUNCTIONS,
  TOKENS_TO_MONITOR,
  ADDITIONAL_SELL_GAS,
} from "./config/setup";
import { readFileSync } from "fs";
import { ethers } from "ethers";
import { overLoads, txContents } from "./types";
import { currentNonce, tokenBalance } from "./utils/common";
import { sendNotification } from "./telegram";
import { swapExactETHForTokens } from "./uniswap/buy";
import { swapExactTokensForETHSupportingFeeOnTransferTokens } from "./uniswap/sell";
import { buy } from "./uniswap/swap";
import { swapExactTokensForETH } from "./uniswap/sell";
import { approve } from "./uniswap/approve";
// import { buy } from "./uniswap/swap";

const methodsExclusion = ["0x", "0x0"];
var PANCAKESWAP_ABI = JSON.parse(
  readFileSync(`src/uniswap/pancakeSwapABI.json`, "utf8")
);

// Initilise an interface of the ABI
const inter = new ethers.utils.Interface(PANCAKESWAP_ABI);
const tokensToMonitor = TOKENS_TO_MONITOR.map((token) => token.toLowerCase());

const mempoolData = async (mempoolData: string) => {
  try {
    const JsonData = await JSON.parse(mempoolData);
    const tx = JsonData.params.result;
    const txContents: txContents = tx.txContents;

    if (!methodsExclusion.includes(txContents.input)) {
      console.log(tx);

      // Concentrate on txn to the pancakeswap router
      let routerAddress = tx.txContents.to.toLowerCase();

      if (
        routerAddress.toLowerCase() == botParams.uniswapv2Router.toLowerCase()
      ) {
        const decodedInput = inter.parseTransaction({
          data: tx.txContents.input,
        });

        console.log("Decoded Data", decodedInput);

        let gasLimit = parseInt(txContents.gas, 16);
        let gasPrice = parseInt(txContents.gasPrice!, 16);
        let maxFee = parseInt(txContents.maxFeePerGas!, 16);
        let priorityFee = parseInt(txContents.maxPriorityFeePerGas!, 16);
        const txnMethod = txContents.input.substring(2, 10);
        let overLoads: any;

        let nonce = await currentNonce();

        console.log("Nonce ", nonce);

        if (isNaN(gasLimit)) {
          gasLimit = DEFAULT_GAS_LIMIT;
        }

        if (isNaN(maxFee)) {
          overLoads = {
            nonce,
            gasPrice,
            gasLimit,
          };
        }

        if (isNaN(gasPrice)) {
          overLoads = {
            nonce,
            maxPriorityFeePerGas: priorityFee - 1,
            maxFeePerGas: maxFee,
            gasLimit,
          };
        }

        let methodName = decodedInput.name;

        console.log("GasPrice ", gasPrice);
        console.log("MAxFee ", maxFee);

        console.log("\n Method Name : ", methodName);
        console.log("Gas price : ", gasPrice! / 1000000000);
        console.log("Gas Limit ", gasLimit);

        if (methodName == "addLiquidity") {
          let tokenA = decodedInput.args.tokenA;
          let tokenB = decodedInput.args.tokenB;
          let token;

          console.log("TokenA ", tokenA.toLowerCase());
          console.log("TokenB ", tokenB.toLowerCase());

          if (tokensToMonitor.includes(tokenA.toLowerCase())) {
            token = tokenA;
          } else if (tokensToMonitor.includes(tokenB.toLowerCase())) {
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

            if (nonce && path && priorityFee && maxFee && gasLimit) {
              const tx = await swapExactETHForTokens(
                ETH_AMOUNT_TO_BUY,
                0,
                path,
                overLoads
              );
            }
            if (tx.success == true) {
              await approve(routerAddress, overLoads);

              let message = "BUY Notification";
              message += "\n\n Token:";
              message += `Token ${token}`;
              message += "\n\n Txn";
              message += `https://etherscan.io/token/${token}`;

              await sendNotification(message);
            }
          } else {
            console.log("\n\n =====>  Token was not on our tracking list");
          }
        } else if (methodName == "addLiquidityETH") {
          let token = decodedInput.args.token;

          console.log("Token : ", token);

          // if (tokensToMonitor.includes(token.toLowerCase())) {

          console.log(
            "\n\n\n\n\n\n\n **********************************************"
          );
          console.log(
            "\nCaptured an add liquidity transaction for a token we are tracking : ",
            token
          );
          console.log("Method used : ", methodName);
          console.log("\n**********************************************");

          let path = [botParams.wethAddrress, token];

          await swapExactETHForTokens(0, ETH_AMOUNT_TO_BUY, path, overLoads);

          let message = "Token Listing Notification";
          message += "\n\n Token:";
          message += `https://etherscan.io/token/${token}`;

          await sendNotification(message);

          // } else {
          //     console.log("\n\n =====>  Token was not on our tracking list");
          // }
        }
      } else if (tokensToMonitor.includes(routerAddress)) {
        console.log("\n\n\n\n **********************************************");
        console.log(
          "Captured a transaction to a token we are tracking ",
          tx.txContents.to
        );
        console.log("**********************************************");

        let gasLimit = parseInt(txContents.gas, 16);
        let gasPrice = parseInt(txContents.gasPrice!, 16);
        let maxFee = parseInt(txContents.maxFeePerGas!, 16);
        let priorityFee = parseInt(txContents.maxPriorityFeePerGas!, 16);
        const txnMethod = txContents.input.substring(2, 10);
        let overLoads: overLoads;

        let nonce = await currentNonce();
        console.log("Nonce ", nonce);

        if (isNaN(gasLimit)) {
          gasLimit = DEFAULT_GAS_LIMIT;
        }

        if (isNaN(maxFee)) {
          overLoads = {
            nonce,
            gasPrice,
            gasLimit,
          };
        }

        if (isNaN(gasPrice)) {
          overLoads = {
            nonce,
            maxPriorityFeePerGas: priorityFee,
            maxFeePerGas: maxFee,
            gasLimit,
          };
        }

        if (overLoads!) {
          let path = [botParams.wethAddrress, routerAddress!];

          if (LIQUIDITY_METHODS.includes(txnMethod)) {
            overLoads.maxPriorityFeePerGas! += 1;
            const tx = await swapExactETHForTokens(
              0,
              ETH_AMOUNT_TO_BUY,
              path,
              overLoads
            );
            if (tx.success == true) {
              await approve(routerAddress, overLoads);
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

            overLoads.maxPriorityFeePerGas! += ADDITIONAL_SELL_GAS;

            const amountIn = await tokenBalance(
              routerAddress,
              process.env.RINKEBY_WALLET_ADDRESS!
            );
            await swapExactTokensForETHSupportingFeeOnTransferTokens(
              amountIn,
              0,
              path,
              overLoads
            );
          }
        }

        let message = "Token Interaction notification";
        message += "\n\n Token:";
        message += `https://etherscan.io/token/${routerAddress}`;

        await sendNotification(message);
      }
    }
  } catch (error) {
    console.log("Error in main function ", error);
  }
};

export { mempoolData };
