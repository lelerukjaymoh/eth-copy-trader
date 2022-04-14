import { Token } from "@uniswap/sdk-core";
import { getTokenDecimals } from "../common";
import constants from "../constants.json"

export const getToken = async (tokenAddress: string) => {
    try {
        const decimals = await getTokenDecimals(tokenAddress)
        const token = new Token(constants.CHAIN_ID, tokenAddress, decimals);

        return token
    } catch (error) {
        console.log("Error initializing a Token : ", error)
    }
}