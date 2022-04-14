import { getPool, getPoolAddress, getPoolContract, getPoolImmutables, getPoolState } from "./pool";
import { getToken } from "./token";
import { Route, Trade } from "@uniswap/v3-sdk";
import { CurrencyAmount, Token, TradeType } from "@uniswap/sdk-core";
import constants from "../constants.json";
import { ethers } from "ethers";
import { abi as QuoterABI } from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import { provider } from "../../utils/common";
import { Immutables } from "../../interfaces";

const amountIn = 1500
const quoterContract = new ethers.Contract(constants.QUOTER_ADDRESS, QuoterABI, provider)

export const getTrade = async (token0: string, token1: string) => {

    const tokenA = await getToken(token0)
    const tokenB = await getToken(token1)

    const poolAddress = await getPoolAddress(token0, token1)

    if (tokenA && tokenB && poolAddress) {

        const poolContract = getPoolContract(poolAddress)!

        const pool = await getPool(tokenA, tokenB, constants.V3_DEFAULT_FEE, poolContract)

        if (pool) {
            const immutables = await getPoolImmutables(poolContract)

            const quotedAmountOut = await getQuotedAmountOut(immutables)
            const poolState = await getPoolState(poolContract)

            console.log("The quoted amount out is", quotedAmountOut.toString());

            return {
                sqrtPriceX96: poolState.sqrtPriceX96,
                amountOut: quotedAmountOut
            }

        }
    }
}


const getUncheckedTrade = async (route: any, tokenA: Token, tokenB: Token, immutables: Immutables) => {

    try {
        const amountOut = await getQuotedAmountOut(immutables)
        const uncheckedTrade = await Trade.createUncheckedTrade({
            route,
            inputAmount: CurrencyAmount.fromRawAmount(tokenA, amountIn.toString()),
            outputAmount: CurrencyAmount.fromRawAmount(
                tokenB,
                await amountOut.toString()
            ),
            tradeType: TradeType.EXACT_INPUT,
        });

        return uncheckedTrade
    } catch (error) {
        console.log("Error getting unchecked trade ", error);
    }
}

const getQuotedAmountOut = async (immutables: Immutables) => {
    try {

        const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
            immutables.token0,
            immutables.token1,
            immutables.fee,
            amountIn.toString(),
            0
        );

        return quotedAmountOut

    } catch (error) {
        console.log("Error querying the amount-out from the quoter contract ", error);

    }
}

