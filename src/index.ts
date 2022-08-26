import { ethers } from "ethers";
import { init } from "./initialize";
import { processData } from "./packages/processor";
import { prepareTxContents, provider, wait } from "./packages/utils/common";
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

console.log("\n\n INITIALIZING THE BOT")

console.log("\n STARTING SENTRY MONITORING")

Sentry.init({
    dsn: process.env.SENTRY_DNS,
    tracesSampleRate: 1.0,
});

// initializing the bot
init()

const main = async () => {

    try {


        const _provider = new ethers.providers.WebSocketProvider(
            process.env.WS_RPC_URL!
        );

        // REVIEW: Transaction for testing 
        // const txnObject = await _provider.getTransaction("0x5310ffd37a7034b726482be516b6ac77116ca868db63036aafdd1a43ebcb37ed");

        // const txContents = prepareTxContents(txnObject);
        // await processData(txContents);

        // await processData(txContents);


        _provider.on("pending", async (txHash: string) => {

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

        _provider.on("error", (error: any) => {
            console.log("Got an error streaming : ", error)
        })
    } catch (error: any) {
        console.log("Error on main function : ", error);
    }
};

main();
