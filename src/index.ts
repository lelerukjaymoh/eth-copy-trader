import WebSocket from "ws";
import { WALLETS_TO_MONITOR } from "./config/setup";
import { mempoolData } from "./mempool";
import { sendNotification } from "./telegram";
import { txContents } from "./types";
import { wait } from "./utils/common";

if (
  !process.env.BLOXROUTE_ETH_ENDPOINT ||
  !process.env.BLOXROUTE_AUTHORIZATION_HEADER
) {
  throw new Error(
    "BLOXROUTE_ETH_ENDPOINT or BLOXROUTE_AUTHORIZATION_HEADER was not provided in .env file"
  );
}

let count = 0;

const processMempooldata = async (notification: string) => {
  try {
    // if (count < 2) {
    count++;
    let JsonData = await JSON.parse(notification);
    let tx = JsonData.params.result;
    console.log(tx);

    // tx = {
    //   txHash:
    //     "0xd0768bdba9e75fe9a973435f2b74f17bb967998fabe74de8bd2708025b7b02cb",
    //   txContents: {
    //     to: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
    //     from: "0xe51dd356f8007c8123ea9cbab1a074b9f38fd6f2",
    //     value: "0x9184e72a000",
    //     gasPrice: null,
    //     maxPriorityFeePerGas: "0x665e7b93",
    //     maxFeePerGas: "0x2540be400",
    //     gas: "0x438be",
    //     input:
    //       "0x7ff36ab5000000000000000000000000000000000000000000000000000000347f4b6a990000000000000000000000000000000000000000000000000000000000000080000000000000000000000000e51dd356f8007c8123ea9cbab1a074b9f38fd6f20000000000000000000000000000000000000000000000000000000061b3dda70000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000043f11c02439e2736800433b4594994bd43cd066d",
    //   },
    // };

    const txContents: txContents = {
      hash: tx.txHash,
      from: tx.txContents.from,
      to: tx.txContents.to!,
      maxPriorityFeePerGas: tx.txContents.maxPriorityFeePerGas!,
      maxFeePerGas: tx.txContents.maxFeePerGas!,
      gasPrice: tx.txContents.gasPrice,
      gas: tx.txContents.gas,
      input: tx.txContents.input,
      value: tx.txContents.value,
    };

    mempoolData(txContents);
    // }
  } catch (error) {
    console.log("Error ", error);
  }
};

const ws = new WebSocket(process.env.BLOXROUTE_ETH_ENDPOINT, {
  headers: {
    Authorization: process.env.BLOXROUTE_AUTHORIZATION_HEADER!,
  },
  rejectUnauthorized: false,
});

const main = () => {
  function subscribe() {
    ws.send(
      // `{"jsonrpc": "2.0", "id": 1, "method": "subscribe", "params": ["newTxs", {"duplicates":false,"include": ["tx_hash", "tx_contents.to", "tx_contents.from", "tx_contents.value", "tx_contents.gas_price","tx_contents.gas","tx_contents.input"],"filters":"method_id in [fb3bdb41, 7ff36ab5]"}]}`
      `{"jsonrpc": "2.0", "id": 1, "method": "subscribe", "params": ["newTxs", {"duplicates":false,"include": ["tx_hash", "tx_contents.to", "tx_contents.from", "tx_contents.value", "tx_contents.gas_price", "tx_contents.gas", "tx_contents.input"],"filters":"from in ${Array.from(
        WALLETS_TO_MONITOR.keys()
      )}}"}]}`
    );
  }

  ws.on("open", subscribe);
  ws.on("message", processMempooldata);
  ws.on("close", async () => {
    console.log("Websocket closed");
    sendNotification(
      "Error \n\n ETH copy trader has disconnected from bloxroute"
    );
  });
};

main();
