export interface txContents {
  from: string;
  to: string;
  value: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
  gasPrice?: string;
  gas: string;
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
