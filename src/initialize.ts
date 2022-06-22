export const init = () => {

    const envVariables = ["V3_PRIVATE_KEY", "V2_PRIVATE_KEY", "JSON_RPC", "ETHER_SCAN_API", "V2_WALLET_ADDRESS", "V3_WALLET_ADDRESS", "WS_RPC_URL", "MONGO_DB_URL",
        "BOT_TOKEN"]

    envVariables.forEach(envVariable => {
        if (!process.env[envVariable]) {
            throw Error(`${envVariable} was not provided in the .env file`)
        }
    });

}
