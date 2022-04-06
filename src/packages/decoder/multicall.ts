
import { ethers } from "ethers";
import { DecodedData } from "../../types";
import multicall from "../../utils/abi/multicall.json";

const multicallInterface = new ethers.utils.Interface(multicall);

console.log(multicallInterface);


export const decodeMulticallTransaction = (inputData: string): DecodedData | undefined => {

    try {
        const decodedData = multicallInterface.parseTransaction({ data: inputData })
        const txnData = multicallInterface.parseTransaction({ data: decodedData.args.data[0] })
        const txn = txnData.args.params

        const tokenIn = txn.tokenIn
        const tokenOut = txn.tokenOut
        const amountIn = txn.amountIn
        const amountOutMinimum = txn.amountOutMinimum
        const path = [tokenIn, tokenOut]

        console.log(tokenIn, tokenOut, amountIn, amountOutMinimum);

        const data = {
            path,
            amountIn,
            amountOutMinimum,
            txnMethodName: decodedData.name,
        }

        return data
    } catch (error) {
        console.log("Error decoding multicall ", error);
    }
}

decodeMulticallTransaction("0x414bf389000000000000000000000000cd17fa52528f37facb3028688e62ec82d9417581000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000000000002710000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000624c2f7200000000000000000000000000000000000000000000000000000000000001b800000000000000000000000000000000000000000000000001409a8c81cde58d0000000000000000000000000000000000000000000000000000000000000000")


// 0	data	bytes[]	0x414bf389000000000000000000000000cd17fa52528f37facb3028688e62ec82d9417581000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000000000002710000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000624c2f7200000000000000000000000000000000000000000000000000000000000001b800000000000000000000000000000000000000000000000001409a8c81cde58d0000000000000000000000000000000000000000000000000000000000000000
// Function: exactInputSingle((address, address, uint24, address, uint256, uint256, uint256, uint160))
// #	Name	Type	Data
// 0	params.tokenIn	address	0xcd17fA52528f37FACB3028688E62ec82d9417581
// 0	params.tokenOut	address	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
// 0	params.fee	uint24	10000
// 0	params.recipient	address	0x0000000000000000000000000000000000000000
// 0	params.deadline	uint256	1649160050
// 0	params.amountIn	uint256	440
// 0	params.amountOutMinimum	uint256	90241920811263373
// 0	params.sqrtPriceLimitX96	uint160	0

// 0x49404b7c00000000000000000000000000000000000000000000000001409a8c81cde58d000000000000000000000000bbd472134464f87758a937d19d319dbb6e412386
// Function: unwrapWETH9(uint256, address)
// #	Name	Type	Data
// 1	amountMinimum	uint256	90241920811263373
// 2	recipient	address	bbd472134464f87758a937d19d319dbb6e412386
