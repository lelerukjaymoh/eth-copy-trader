import { readFileSync } from "fs"
import WebSocket from "ws";
import { ADD_LIQUIDITY_METHODS } from "./config/setup";
import { mempoolData } from "./mempool";

if (!process.env.BLOXROUTE_ENDPOINT || !process.env.BLOXROUTE_AUTHORIZATION_HEADER) {
    throw new Error("BLOXROUTE_ENDPOINT was not provided in the .env")
}

const ws = new WebSocket(process.env.BLOXROUTE_ENDPOINT,
    {
        headers: {
            "Authorization": process.env.BLOXROUTE_AUTHORIZATION_HEADER
        },
        rejectUnauthorized: false,
    }
);

function subscribe() {
    ws.send(
        `{"jsonrpc": "2.0", "id": 1, "method": "subscribe", "params": 
        ["pendingTxs", {"duplicates":false,"include": ["tx_hash", "tx_contents.to", 
        "tx_contents.from", "tx_contents.value", "tx_contents.gas_price","tx_contents.gas",
        "tx_contents.input"], "filters":"method_id in ${ADD_LIQUIDITY_METHODS}"}]}`
    );
}

let stateOn = true

const processMempooldata = async (data: string) => {
    if (stateOn == true) {
        mempoolData(data);
    }
}

const main = async () => {
    ws.on("open", subscribe)
    ws.on("message", processMempooldata);
    ws.on("close", () => {
        console.log("Websocket closed")
    })

}

main()
