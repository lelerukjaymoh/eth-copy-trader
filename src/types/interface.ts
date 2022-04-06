import { BigNumber } from "ethers";

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
  gasLimit: number;
  nonce?: number;
  gasPrice?: number;
  value?: string;
  maxPriorityFeePerGas?: number;
  maxFeePerGas?: number;
}

export interface tokenInterface {
  tokenAddress: string;
  bought: boolean;
  txHash: string;
}


export interface TransactionData {
  path: string[],
  txnMethodName: string,
  from: string,
  hash: string,
  botAmountIn: number,
  botAmountOut: number
  maxInvestment: number,
  targetAmountIn?: number,
  targetAmountOutMinimum?: number,
  value?: number
}


export interface DecodedData {
  path: string[],
  amountIn?: number,
  amountOutMin?: number,
  amountOut?: number,
  amountInMax?: number,
}