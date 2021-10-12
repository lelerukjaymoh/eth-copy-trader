import WebSocket from "ws";
import { METHODS_TO_MONITOR } from "./config/setup";
import { mempoolData } from "./mempool";
import { wait } from "./utils/common";

console.log(METHODS_TO_MONITOR);

if (
  !process.env.BLOXROUTE_ENDPOINT ||
  !process.env.BLOXROUTE_AUTHORIZATION_HEADER
) {
  throw new Error("BLOXROUTE_ENDPOINT was not provided in the .env");
}

const openWebsocketConnection = () => {
  const ws = new WebSocket(process.env.BLOXROUTE_ENDPOINT!, {
    headers: {
      Authorization: process.env.BLOXROUTE_AUTHORIZATION_HEADER,
    },
    rejectUnauthorized: false,
  });

  return ws;
};

let ws = openWebsocketConnection();

function subscribe() {
  console.log("Subscribing to Bloxroute");
  ws.send(
    `{"jsonrpc": "2.0", "id": 1, "method": "subscribe", "params": ["pendingTxs", {"duplicates":false,"include": ["tx_hash","tx_contents.from", "tx_contents.to","tx_contents.value", "tx_contents.max_priority_fee_per_gas", "tx_contents.max_fee_per_gas", "tx_contents.gas_price","tx_contents.gas","tx_contents.input"],"filters":"method_id in ${METHODS_TO_MONITOR}"}]}`
  );
}

let stateOn = true;

const processMempooldata = async (data: string) => {
  mempoolData(data);
};

const main = async () => {
  ws.on("open", subscribe);
  ws.on("message", processMempooldata);
  ws.on("close", async () => {
    console.log("Websocket closed");
    console.log("Terminating connection ... ");
    ws.terminate();
    await wait(2000); // Wait for 2 secs before establishing a connection again
    ws = openWebsocketConnection(); // Reconnect the websocket
  });
};

main();
