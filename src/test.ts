import { providers } from "ethers"

const main = async () => {
    const provider = new providers.WebSocketProvider(process.env.WS_RPC_URL!)

    const txn = await provider.getTransaction("0x6be4da018ed9ec92ada0879b8e44c87e2ba50fd6e775cab2fd9852411631e06c")

    console.log(txn);

}


main()