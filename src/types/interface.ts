import { BigNumber } from "ethers";

export interface txContents {
  hash: string;
  from: string;
  to: string;
  maxPriorityFeePerGas?: BigNumber;
  maxFeePerGas?: BigNumber;
  gasPrice?: BigNumber;
  gas: BigNumber;
  input: string;
}

export interface overLoads {
  gasLimit: number;
  nonce?: number;
  gasPrice?: number;
  maxPriorityFeePerGas?: number;
  maxFeePerGas?: number;
  value?: string;
}
