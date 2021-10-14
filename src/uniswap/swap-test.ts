import Web3 from "web3";
import { botParams } from "../config/setup";
import { overLoads } from "../types";
import { smartContract, toHex, tokenAllowance } from "../utils/common";

const MAX_INT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

// Ensure all enviroment varibales are provided in .env
if (!process.env.RINKEBY_JSON_RPC) {
  throw new Error("RINKEBY_JSON_RPC was on provided in the .env file");
}

const web3 = new Web3(process.env.RINKEBY_JSON_RPC!);

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
        from: process.env.WALLET_ADDRESS!,
      });

    const approveParams = {
      from: process.env.WALLET_ADDRESS,
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

// uint256 amountIn,
// uint256 amountOutMin,
// address[] memory path,
// uint256 deadline,
// IUniswapV2Router02 uniswapRouterAddress

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
      botParams.uniswapv2Router
    )
    .encodeABI({
      from: process.env.WALLET_ADDRESS,
    });

  if (overLoads.gasPrice) {
    buyParams = {
      from: process.env.WALLET_ADDRESS!,
      gasPrice: toHex(overLoads.gasPrice),
      gas: toHex(overLoads.gasLimit),
      to: botParams.swapperAddress,
      value: 0,
      data: buyData,
      nonce: overLoads.nonce,
    };
  } else {
    buyParams = {
      from: process.env.WALLET_ADDRESS!,
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
};

export { approveToken, buy };
