import { BigNumber } from "ethers";

export interface Immutables {
    factory: string;
    token0: string;
    token1: string;
    fee: number;
    tickSpacing: number;
    maxLiquidityPerTick: BigNumber;
}


export interface State {
    liquidity: BigNumber;
    sqrtPriceX96: BigNumber;
    tick: number;
    observationIndex: number;
    observationCardinality: number;
    observationCardinalityNext: number;
    feeProtocol: number;
    unlocked: boolean;
}

export interface Path {
    tokenIn: string,
    tokenOut: string
}

export interface TxnParams {
    tokenIn: string,
    tokenOut: string,
    amountIn: number,
    amountOut: BigNumber,
    fee: number,
    sqrtPriceLimitX96: number
}

export interface overLoads {
    gasLimit?: number;
    nonce?: number;
    gasPrice?: number;
    value?: string,
    maxPriorityFeePerGas?: number;
    maxFeePerGas?: number;
}