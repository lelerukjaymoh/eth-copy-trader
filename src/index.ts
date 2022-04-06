import { ethers } from "ethers";
import { mempoolData } from "./mempool";

if (!process.env.WALLET_ADDRESS || !process.env.WS_RPC_URL) {
    throw new Error("WS_RPC_URL or WALLET_ADDRESS not provided in .env");
}

const main = async () => {
    try {
        const _provider = new ethers.providers.WebSocketProvider(
            process.env.WS_RPC_URL!
        );

        _provider.on("pending", async (txHash: string) => {
            let txnTime = Date.now()
            const txnObject = await _provider.getTransaction(txHash);

            if (txnObject) {
                const txContents = {
                    hash: txnObject.hash,
                    from: txnObject.from,
                    to: txnObject.to!,
                    gasPrice: txnObject.gasPrice,
                    maxPriorityFeePerGas: txnObject.maxPriorityFeePerGas,
                    maxFeePerGas: txnObject.maxFeePerGas,
                    gas: txnObject.gasLimit,
                    input: txnObject.data,
                    value: txnObject.value,
                };

                await mempoolData(txContents);

            }
        });
    } catch (error: any) {
        console.log("Error on main function : ", error);
    }
};

main();
