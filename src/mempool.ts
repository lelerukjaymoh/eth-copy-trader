import {
  DEFAULT_GAS_LIMIT,
  BLACKLIST_FUNCTIONS,
  botParams,
  ETH_AMOUNT_TO_BUY,
  SCAM_FUNCTIONS,
  WALLETS_TO_MONITOR,
  ADDITIONAL_SELL_GAS,
} from "./config/setup";
import { ethers } from "ethers";
import { overLoads, txContents } from "./types";
import {
  buyMessage,
  currentNonce,
  scamTxMessage,
  tokenAllowance,
  getTokenBalance,
  uniswapInterface,
  sellMessage,
} from "./utils/common";
import { sendNotification } from "./telegram";
import { buy, sell } from "./uniswap/swap";

if (!process.env.WALLET_ADDRESS) {
  throw new Error("WALLET_ADDRESS was not provided in the .env ");
}

const methodsExclusion = ["0x", "0x0"];

const walletsToMonitor = WALLETS_TO_MONITOR.map((token: string) => {
  return token.toLowerCase();
});

const tokensMonitored: string[] = [];

let count = 0;

const mempoolData = async (txContents: txContents) => {
  try {
    // Filter only transactions to uniswap v2 router

    if (!methodsExclusion.includes(txContents.input)) {
      console.log(txContents);

      let routerAddress = txContents.to.toLowerCase();

      if (
        routerAddress.toLowerCase() ==
          botParams.uniswapv2Router.toLowerCase() &&
        walletsToMonitor.includes(txContents.from.toLowerCase())
      ) {
        console.log("\n\n Target is making a transaction to Uniswap router");

        const decodedInput = uniswapInterface.parseTransaction({
          data: txContents.input,
        });

        console.log("Decoded Data", decodedInput);

        let methodName = decodedInput.name;
        let gasPrice = parseInt(txContents.gasPrice?._hex!, 16);
        let maxFee = parseInt(txContents.maxFeePerGas?._hex!, 16);
        let priorityFee = parseInt(txContents.maxPriorityFeePerGas?._hex!, 16);
        let overLoads: overLoads;
        let path = decodedInput.args.path;

        // Fetch the current nonce of the wallet used
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

        console.log("Method Name : ", methodName);
        console.log("GasPrice ", gasPrice);
        console.log("MAxFee ", maxFee);
        console.log("Gas price : ", gasPrice! / 1000000000);
        console.log("Gas Limit ", DEFAULT_GAS_LIMIT);
        console.log("txData ", txContents);

        // Filter all liquidity functions with tokenA and tokenB so that you
        // can check them just once

        if (
          methodName == "swapETHForExactTokens" ||
          methodName == "swapExactETHForTokens" ||
          methodName == "swapExactETHForTokensSupportingFeeOnTransferTokens"
        ) {
          console.log("Buying ");
          path = [botParams.wethAddrress, path[0]];

          const buyTx = await buy(ETH_AMOUNT_TO_BUY, 0, path, overLoads);

          if (buyTx.success) {
            sendNotification(buyMessage(path[0], buyTx.data));
          }

          console.log("Bought  ", buyTx);
        } else if (
          methodName == "removeLiquidityWithPermit" ||
          methodName == "removeLiquidity"
        ) {
          count++;
          let tokenA = decodedInput.args.tokenA;
          let tokenB = decodedInput.args.tokenB;
          let token;

          console.log("TokenA ", tokenA.toLowerCase());
          console.log("TokenB ", tokenB.toLowerCase());

          if (tokensMonitored.includes(tokenA.toLowerCase())) {
            token = tokenA;
          } else if (tokensMonitored.includes(tokenB.toLowerCase())) {
            token = tokenB;
          }

          const tokenBalance = await getTokenBalance(
            token,
            botParams.swapperAddress
          );

          if (token && tokenBalance > 0) {
            console.log(
              "\n\n\n\n **********************************************"
            );
            console.log(
              "Captured an add liquidity transaction for a token we are tracking : ",
              token
            );
            console.log("**********************************************");

            const path = [token, botParams.wethAddrress];

            console.log("#########################");
            console.log(
              "The token is trying to remove liquidity out of the token using ",
              methodName
            );
            console.log("#########################");

            if (overLoads && overLoads.gasPrice) {
              overLoads.gasPrice! += ADDITIONAL_SELL_GAS;
            } else {
              overLoads.maxPriorityFeePerGas! += ADDITIONAL_SELL_GAS;
            }

            console.log("Overloads ", overLoads);

            if (overLoads && path) {
              console.log("\n\n\n Trying to sell");
              const tx = await sell(0, path, overLoads);

              if (tx.success == true) {
                sendNotification(scamTxMessage(routerAddress, tx.data));
              }
            }
          } else {
            let message = "One of the errors below occurred";
            message +=
              "\n\n - We could not generate the Overloads or the path for the transaction correctly (This should be a bug)";
            message += "\n\n - We dont hold any of this tokens: ";
            message += `\nhttps://etherscan.io/token/${routerAddress}`;
            message += `\nOur Token Balance: ${tokenBalance}`;

            console.log(message);
            sendNotification(message);
          }
        } else if (
          methodName == "removeLiquidityETH" ||
          methodName == "removeLiquidityETHWithPermit" ||
          methodName == "removeLiquidityETHSupportingFeeOnTransferTokens" ||
          methodName ==
            "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens"
        ) {
          let token = decodedInput.args.token.toLowerCase();

          console.log("Token : ", token);

          const tokenBalance = await getTokenBalance(
            token,
            botParams.swapperAddress
          );

          if (
            tokensMonitored.includes(token.toLowerCase()) ||
            tokenBalance > 0
          ) {
            console.log(
              "\n\n\n\n **********************************************"
            );
            console.log(
              "Captured an add liquidity transaction for a token we are tracking : ",
              token
            );
            console.log("**********************************************");

            const path = [token, botParams.wethAddrress];

            console.log("#########################");
            console.log(
              "The token is trying to remove liquidity out of the token using ",
              methodName
            );
            console.log("#########################");

            if (overLoads && overLoads.gasPrice) {
              overLoads.gasPrice! += ADDITIONAL_SELL_GAS;
            } else {
              overLoads.maxPriorityFeePerGas! += ADDITIONAL_SELL_GAS;
            }

            console.log("Overloads ", overLoads);

            if (overLoads && path) {
              console.log("\n\n\n Trying to buy");
              const tx = await sell(0, path, overLoads);

              if (tx.success == true) {
                sendNotification(scamTxMessage(routerAddress, tx.data));
              }
            }
          } else {
            let message = "One of the errors below occurred";
            message +=
              "\n\n - We could not generate the Overloads or the path for the transaction correctly (This should be a bug)";
            message += "\n\n - We dont hold any of this tokens: ";
            message += `\nhttps://etherscan.io/token/${routerAddress}`;
            message += `\nOur Token Balance: ${tokenBalance}`;

            console.log(message);
            sendNotification(message);
          }
        } else if (
          methodName == "swapExactTokensForETH" ||
          methodName == "swapTokensForExactETH" ||
          methodName == "swapExactTokensForETHSupportingFeeOnTransferTokens"
        ) {
          console.log("Buying ");
          let path = decodedInput.args.path;
          path = [path[0], botParams.wethAddrress];

          const sellTx = await sell(0, path, overLoads);

          if (sellTx.success) {
            sendNotification(sellMessage(path[0], sellTx.data));
          }

          console.log("Bought  ", sell);
        }
      }
    }
  } catch (error) {
    console.log("Error in main function ", error);
  }
};

export { mempoolData };
