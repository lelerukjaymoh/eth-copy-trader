import { ethers } from "ethers";
import { init } from "./initialize";
import { processData } from "./packages/processor";
import { sendNotification } from "./telegram";
import { prepareTxContents, provider, wait } from "./utils/common";

// initializing the bot
console.log("\n\n INITIALIZING THE BOT")

init()

const main = async () => {

    try {
        const _provider = new ethers.providers.WebSocketProvider(
            process.env.STREAMING_WS_RPC_URL!
        );

        _provider.on("pending", async (txHash: string) => {
            let txnTime = Date.now()

            const txnObject = await _provider.getTransaction(txHash);

            if (txnObject) {
                const txContents = prepareTxContents(txnObject);
                await processData(txContents);

            } else {

                // Some transactions are not fetched the first time we query using ether.getTransaction
                // This because the transaction is not yet discovered by the node we are querying
                // This is an indication that the node is fast at propagating pending transaction
                // To solve this, a wait (of 3 secs) is used to give time for the node to discover the txn 

                await wait(3000)

                const txnObject = await provider.getTransaction(txHash);

                if (txnObject) {
                    const txContents = prepareTxContents(txnObject);
                    await processData(txContents);

                }

            }
        });
    } catch (error: any) {
        console.log("Error on main function : ", error);
    }
};

main();
