import { BigNumber } from "ethers";
import { Path } from "../uniswap/v3/interfaces";

export interface txContents {
  hash: string;
  from: string;
  to: string;
  gasPrice?: BigNumber;
  maxPriorityFeePerGas?: BigNumber;
  maxFeePerGas?: BigNumber;
  gas: BigNumber;
  input: string;
  value: BigNumber;
}

export interface overLoads {
  gasLimit?: number;
  nonce?: number;
  gasPrice?: number;
  value?: string,
  maxPriorityFeePerGas?: number;
  maxFeePerGas?: number;
}

export interface tokenInterface {
  tokenAddress: string;
  bought: boolean;
  sold: boolean;
  txHash: string;
}


export interface TransactionData {
  path: Path,
  txnMethodName: string,
  from: string,
  hash: string,
  botAmountIn: number,
  botAmountOut: number
  maxInvestment: number,
  targetAmountIn?: number,
  targetAmountOutMinimum?: number,
  value?: number,
  txnType?: string
}


export interface DecodedData {
  methodName: string,
  path: Path,
  txnType?: string,
  amountIn?: number,
  amountOutMin?: number,
  amountOut?: number,
  amountInMax?: number,
}

export interface _BoughtTokens {
  [key: string]: string;
}