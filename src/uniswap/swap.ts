import Web3 from "web3";
import {
  DEFAULT_GAS_PRICE,
  botParams,
  DEFAULT_GAS_LIMIT,
  NO_OF_BUYS,
} from "../config/setup";
import { overLoads } from "../types";
import { smartContract, toHex, tokenAllowance } from "../utils/common";

const MAX_INT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

// Ensure all enviroment varibales are provided in .env
if (!process.env.RINKEBY_JSON_RPC) {
  throw new Error("JSON_RPC was on provided in the .env file");
}

const web3 = new Web3(process.env.RINKEBY_JSON_RPC!);

const allowToken = async (token: string) => {
  const lastNonce = await web3.eth.getTransactionCount(
    process.env.RINKEBY_WALLET_ADDRESS!
  );

  console.log(lastNonce);

  console.log("Token to approve ", token);

  const approve = smartContract.methods
    .approve(token, botParams.uniswapv2Router)
    .encodeABI({
      from: process.env.RINKEBY_WALLET_ADDRESS!,
    });

  const approveParams = {
    from: process.env.RINKEBY_WALLET_ADDRESS,
    gasPrice: DEFAULT_GAS_PRICE,
    gas: DEFAULT_GAS_LIMIT,
    to: botParams.swapperAddress,
    value: 0,
    data: approve,
    nonce: lastNonce,
  };

  console.log(
    "Total Transaction charges ",
    (approveParams.gas * DEFAULT_GAS_PRICE) / 10 ** 18
  );

  const signedApprove = await web3.eth.accounts.signTransaction(
    approveParams,
    process.env.RINKEBY_PRIVATE_KEY!
  );

  await web3.eth
    .sendSignedTransaction(signedApprove.rawTransaction!)
    .on("transactionHash", async (hash) => {
      try {
        console.log(
          "\n\n\n ----------- SUCCESSFULLY BROADCAST AN APPROVE ---------"
        );
        console.log("Transaction Hash ", hash);
      } catch (error) {
        console.log("\n\n\n Encoutered an error broadcasting buy txn");
        console.log("Error :  ", error);
      }
    });
};

const approveToken = async (
  token: string,
  gasPrice: number,
  gasLimit: number,
  walletAddress: string,
  nonce: number
) => {
  const allowance = await tokenAllowance(token, walletAddress);

  if (allowance == 0) {
    const approve = smartContract.methods
      .approve(token, botParams.uniswapv2Router)
      .encodeABI({
        from: process.env.RINKEBY_WALLET_ADDRESS!,
      });

    const approveParams = {
      from: process.env.RINKEBY_WALLET_ADDRESS,
      gasPrice: web3.utils.toWei(gasPrice.toString(), "gwei"),
      gas: gasLimit,
      to: botParams.swapperAddress,
      value: 0,
      data: approve,
      nonce: nonce,
    };

    const signedApprove = await web3.eth.accounts.signTransaction(
      approveParams,
      process.env.RINKEBY_PRIVATE_KEY!
    );

    await web3.eth
      .sendSignedTransaction(signedApprove.rawTransaction!)
      .on("transactionHash", async (hash) => {
        try {
          console.log(
            "\n\n\n ----------- SUCCESSFULLY BROADCAST AN APPROVE ---------"
          );
          console.log("Transaction Hash ", hash);
        } catch (error) {
          console.log("\n\n\n Encoutered an error broadcasting buy txn");
          console.log("Error :  ", error);
        }
      });
  }
};

const buy = async (
  amountIn: number,
  amountOutMin: number,
  path: string[],
  overLoads: overLoads
) => {
  const deadline = Math.floor(Date.now() / 1000) + 60 * 2;
  let buyParams;

  const buyData = smartContract.methods
    .buy(
      toHex(amountIn),
      toHex(amountOutMin),
      path,
      deadline,
      botParams.uniswapv2Router,
      NO_OF_BUYS
    )
    .encodeABI({
      from: process.env.RINKEBY_WALLET_ADDRESS,
    });

  console.log(overLoads);

  // TODO: To remove the check to be greater than a given amount

  const igasPrice = overLoads["gasPrice"];

  if (
    (overLoads.gasPrice && overLoads.gasPrice > 70 * 10 ** 9) ||
    (overLoads.maxFeePerGas && overLoads.maxFeePerGas > 70 * 10 ** 9)
  ) {
    if (igasPrice) {
      buyParams = {
        from: process.env.RINKEBY_WALLET_ADDRESS!,
        gasPrice: toHex(overLoads.gasPrice),
        gas: toHex(overLoads.gasLimit),
        to: botParams.swapperAddress,
        value: 0,
        data: buyData,
        nonce: overLoads.nonce,
      };
    } else {
      buyParams = {
        from: process.env.RINKEBY_WALLET_ADDRESS!,
        gasPrice: toHex(
          overLoads.maxPriorityFeePerGas! + overLoads.maxFeePerGas!
        ),
        gas: toHex(overLoads.gasLimit),
        to: botParams.swapperAddress,
        value: 0,
        data: buyData,
        nonce: overLoads.nonce,
      };
    }

    console.log(buyParams);

    const signedBuy = await web3.eth.accounts.signTransaction(
      buyParams,
      process.env.RINKEBY_PRIVATE_KEY!
    );
    let txnHash;

    await web3.eth
      .sendSignedTransaction(signedBuy.rawTransaction!)
      .on("transactionHash", async (hash) => {
        try {
          console.log(
            "\n\n\n ----------- SUCCESSFULLY BROADCAST A BUY ---------"
          );
          console.log("Transaction Hash ", hash);

          txnHash = hash;
        } catch (error) {
          console.log("\n\n\n Encoutered an error broadcasting buy txn");
          console.log("Error :  ", error);
        }
      });

    return txnHash;
  } else {
    console.log(
      "\n\n\n   Victims gasPrice was so low ..... ",
      overLoads.gasPrice! / 10 ** 9,
      overLoads.maxFeePerGas! / 10 ** 9
    );
  }
};

export { allowToken, approveToken, buy };
