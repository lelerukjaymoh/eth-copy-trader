import WebSocket from "ws";
import { METHODS_TO_MONITOR } from "./config/setup";
import { mempoolData } from "./mempool";
import { providers } from "ethers";
import { txContents } from "./types";
import { getTokenBalance } from "./utils/common";

console.log(METHODS_TO_MONITOR);

// if (!process.env.CUSTOM_NODE_WS_RPC) {
//   throw new Error("CUSTOM_NODE_WS_RPC was not provided in the .env");
// }

// const customProvider = new providers.WebSocketProvider(
//   process.env.CUSTOM_NODE_WS_RPC!
// );

// const getTransation = async (txHash: string) => {
//   try {
//     return await customProvider.getTransaction(txHash);
//   } catch (error) {
//     console.log("Error fetching transaction data ", error);
//   }
// };

const main = async () => {
  try {
    const tb = await getTokenBalance(
      "0x88C25E9D35929c3913B56Cbc3f19969192b79BF4",
      process.env.WALLET_ADDRESS!
    );

    console.log(tb);

    // const wsProvider = new providers.WebSocketProvider(
    //   process.env.CUSTOM_NODE_WS_RPC!
    // );

    // wsProvider.on("pending", async (txHash: any) => {
    //   const txnReceipt = await getTransation(txHash);

    //   if (txnReceipt) {
    //     const txContents: txContents = {
    //       hash: txnReceipt.hash,
    //       from: txnReceipt.from,
    //       to: txnReceipt.to!,
    //       maxPriorityFeePerGas: txnReceipt.maxPriorityFeePerGas!,
    //       maxFeePerGas: txnReceipt.maxFeePerGas!,
    //       gasPrice: txnReceipt.gasPrice,
    //       gas: txnReceipt.gasLimit,
    //       input: txnReceipt.data,
    //       value: txnReceipt.value,
    //     };

    //     // mempoolData(txContents);
    //   }
    // });
  } catch (error) {
    console.log("Error ", error);
  }
};

main();
