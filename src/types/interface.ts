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
  gasLimit: Number;
  nonce: Number;
  gasPrice?: Number;
  maxPriorityFeePerGas?: Number;
  maxFeePerGas?: Number;
}
