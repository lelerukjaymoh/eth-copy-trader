import { ethers } from "ethers"
import V3_FACTORY_ABI from "../abi/uniswapV3FactoryABI.json"
import constants from "../constants.json"
import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { Pool } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import { Immutables, State } from "../../interfaces";
import { provider } from "../common";


const factoryContract = new ethers.Contract(constants.UNISWAP_V3_FACTORY_ADDRESS, V3_FACTORY_ABI, provider)

export const getPoolAddress = async (tokenA: string, tokenB: string) => {

    try {
        const poolAddress = await factoryContract.getPool(tokenA, tokenB, constants.V3_DEFAULT_FEE)
        console.log("Pool ", poolAddress)

        return poolAddress
    } catch (error) {
        console.log("Error getting pool address", error)
    }
}


export const getPoolContract = (poolAddress: string) => {
    try {
        const poolContract = new ethers.Contract(
            poolAddress,
            IUniswapV3PoolABI,
            provider
        );

        return poolContract
    } catch (error) {
        console.log("Error initializing pool contract : ", error)
    }
}



export const getPoolImmutables = async (poolContract: ethers.Contract) => {

    const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
        await Promise.all([
            poolContract.factory(),
            poolContract.token0(),
            poolContract.token1(),
            poolContract.fee(),
            poolContract.tickSpacing(),
            poolContract.maxLiquidityPerTick(),
        ]);

    const immutables: Immutables = {
        factory,
        token0,
        token1,
        fee,
        tickSpacing,
        maxLiquidityPerTick,
    };

    return immutables;
}


export const getPoolState = async (poolContract: ethers.Contract) => {
    const [liquidity, slot] = await Promise.all([
        poolContract.liquidity(),
        poolContract.slot0(),
    ]);

    const PoolState: State = {
        liquidity,
        sqrtPriceX96: slot[0],
        tick: slot[1],
        observationIndex: slot[2],
        observationCardinality: slot[3],
        observationCardinalityNext: slot[4],
        feeProtocol: slot[5],
        unlocked: slot[6],
    };

    return PoolState;
}


export const getPool = async (tokenA: Token, tokenB: Token, fee: number, poolContract: ethers.Contract): Promise<Pool | undefined> => {
    const [immutables, state] = await Promise.all([
        getPoolImmutables(poolContract),
        getPoolState(poolContract),
    ]);

    try {
        const pool = new Pool(
            tokenA,
            tokenB,
            immutables.fee,
            state.sqrtPriceX96.toString(),
            state.liquidity.toString(),
            state.tick
        );

        return pool

    } catch (error) {
        console.log("Error initializing pool : ", error);

    }

}