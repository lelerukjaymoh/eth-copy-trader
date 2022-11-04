import { BigNumber, utils } from "ethers"
import { botParameters } from "../../config/setup"
import { rugCheckerContract } from "../utils/common"

export const checkRug = async (token: string) => {

    try {

        const path = [botParameters.wethAddress, token]
        const amountIn = utils.parseEther("0.001")

        // The screen method of the the rug checker contract should only be accessed using callstatic
        const screenResponse = await rugCheckerContract.callStatic.screen(botParameters.uniswapv2Router, path, amountIn)

        const estimatedBuy = parseInt(screenResponse.estimatedBuy)
        const actualBuy = parseInt(screenResponse.actualBuy)
        const estimatedSell = parseInt(screenResponse.estimatedSell)
        const actualSell = parseInt(screenResponse.actualSell)
        const buyGas = parseInt(screenResponse.buyGas)
        const sellGas = parseInt(screenResponse.sellGas)

        const buyTax = ((estimatedBuy - actualBuy) / ((estimatedBuy + actualBuy) / 2)) * 100
        const sellTax = ((estimatedSell - actualSell) / ((estimatedSell + actualSell) / 2)) * 100

        console.log("Respose ", screenResponse, buyTax, sellTax, estimatedSell, actualSell)

        return { buyTax, sellTax }

    } catch (error) {
        console.log("Error checking token rug status ", error)
    }


}

// checkRug(["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "0x19f3c989827b96f8a6b28ccb4a0e9e1d6d35612b"], utils.parseEther("0.001"))

