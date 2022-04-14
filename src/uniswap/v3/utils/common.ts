
import { ethers } from "ethers"
import ERC20ABI from "./abi/erc20ABI.json"
import uniswapRouterABI from "./abi/uniswapv3RouterABI.json"
import v3SwapperABI from "./abi/v3swapper.json"
import constants from "../utils/constants.json"


const erc20interface = new ethers.utils.Interface(ERC20ABI)

export const getContract = (tokenAddress: string) => {
    try {
        const contract = new ethers.Contract(tokenAddress, erc20interface, account)

        return contract
    } catch (error) {
        console.log("Error initializing contract : ", error);
    }
}


export const getTokenDecimals = async (tokenAddress: string) => {
    try {
        const contract = getContract(tokenAddress)!
        const decimals = await contract.decimals()

        return decimals
    } catch (error) {
        console.log("Error getting token decimals : ", error)
    }
}

export const provider = new ethers.providers.WebSocketProvider(process.env.WS_RPC_URL!)
export const signer = new ethers.Wallet(process.env.PRIVATE_KEY!)
export const account = signer.connect(provider)

export const routerContract = new ethers.Contract(constants.UNISWAP_V3_ROUTER, uniswapRouterABI, account)
export const v3swapperContract = new ethers.Contract(constants.V3_SWAPPER_ADDRESS, v3SwapperABI, account)


