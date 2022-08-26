import { BigNumber, Contract, ethers, providers, Transaction, utils } from "ethers";
import { botParameters, DEFAULT_GAS_LIMIT, GET_NONCE_TIMEOUT, REPEATED_BOUGHT_TOKENS, SLIPPAGE, STABLE_TOKENS, WAIT_TIME_AFTER_TRANSACTION, WALLETS_TO_MONITOR } from "../../config/setup";
import ERC20ABI from "./abi/erc20ABI.json";
import smartContractABI from "./abi/swapperABI.json";
import { BoughtTokens } from "../../db/models";
import "../../db/connect";
import { overLoads, txContents } from "../types";
import { init } from "../../initialize";
import { routerContract } from "../uniswap/v3/utils/common";

// Ensure all .env variables are loaded 
init()

const routerABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "internalType": "address[]",
        "name": "path",
        "type": "address[]"
      }
    ],
    "name": "getAmountsOut",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

const smartContractInterface = new ethers.utils.Interface(smartContractABI);

// Initialize an interface of the ABI
const ERC20Interface = new ethers.utils.Interface(ERC20ABI);

const tokenAllowance = async (tokenAddress: string, walletAddress: string) => {
  try {
    console.log("Token ", tokenAddress);
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20ABI,
      provider
    );
    return await tokenContract
      .allowance(botParameters.swapperAddress, botParameters.uniswapv2Router);
  } catch (error) {
    console.log("Error fetching the allowance amount ", error);
  }
};

export const v2walletNonce = async () => {
  try {
    return provider.getTransactionCount(process.env.V2_WALLET_ADDRESS!);
  } catch (error) {
    console.log("Error getting v2 wallet nonce : ", error);
  }
};

export const v3walletNonce = async () => {
  try {
    return provider.getTransactionCount(process.env.V3_WALLET_ADDRESS!);
  } catch (error) {
    console.log("Error getting v3 wallet nonce : ", error);
  }
};

export const fetchGasPrice = async () => {
  try {
    const gasData = await provider.getFeeData()

    const maxFeePerGas = parseInt(utils.formatUnits(gasData.maxFeePerGas!, "gwei")) + 5
    const maxPriorityFeePerGas = parseInt(utils.formatUnits(gasData.maxPriorityFeePerGas!, "gwei")) + 2

    return { maxFeePerGas, maxPriorityFeePerGas }
  } catch (error) {
    console.log("Error checking the users ")
  }
}

export const prepareOverLoads = async (txContents: txContents, nonce: number) => {
  try {
    // Prepare transaction overloads
    let gasLimit = parseInt(txContents.gas._hex, 16);

    if (gasLimit < DEFAULT_GAS_LIMIT) {
      gasLimit = DEFAULT_GAS_LIMIT
    }

    // Fetch the current average gas data to use for the transactions
    const gasData = await fetchGasPrice()

    const overLoads = { maxFeePerGas: gasData?.maxFeePerGas! * 1e9, maxPriorityFeePerGas: gasData?.maxPriorityFeePerGas! * 1e9, nonce, gasLimit };

    return overLoads
  } catch (error) {
    console.log("Error preparing overLoads : ", error);
  }

}

const provider = new ethers.providers.WebSocketProvider(process.env.WS_RPC_URL!);


const getTxnStatus = async (txn: string) => {
  try {
    let transactionReceipt = await provider.getTransactionReceipt(txn);

    return {
      status: transactionReceipt.status, confirmations: transactionReceipt.confirmations
    };
  } catch (error) {
    console.log(
      "\n\n Encountered an error getting status of the transaction ",
      txn,
      error
    );
  }
};

const signer = new ethers.Wallet(process.env.V2_PRIVATE_KEY!);
const v2account = signer.connect(provider);

const
  v2smartContract = new ethers.Contract(
    botParameters.swapperAddress,
    smartContractABI,
    v2account
  );

export const uniswapv2RouterContract = new Contract(botParameters.uniswapv2Router, routerABI, provider)

export const getSlippagedAmoutOut = async (amountIn: any, path: any) => {
  try {

    console.log("\n\nPath ", path, amountIn)

    const tokenDecimals = await getTokenDecimals(path.tokenIn)
    amountIn = (amountIn / (1 * 10 ** tokenDecimals))

    console.log("Decimals ", tokenDecimals, amountIn)

    const _amountIn = utils.parseUnits(amountIn.toString(), tokenDecimals)

    console.log("[Slippage] Amount in ", _amountIn)

    const amountsOut = await uniswapv2RouterContract.getAmountsOut(_amountIn, [path.tokenIn, path.tokenOut])

    console.log("Amount outs ", amountsOut)

    const amountOut: BigNumber = amountsOut[1].mul(BigNumber.from(100 - SLIPPAGE)).div(BigNumber.from(100))

    return { amountOut, amountIn: amountsOut[0] }

  } catch (error) {
    console.log("Error getting the slippaged amount out ", error)
  }
}
const getTokenAllowance = async (
  tokenAddress: string,
  walletAddress: string
) => {
  try {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20ABI,
      provider
    );
    return await tokenContract
      .allowance(walletAddress, botParameters.uniswapv2Router)

  } catch (error) {
    console.log("Error fetching the allowance amount ", error);
  }
};

const getTokenDecimals = async (tokenAddress: string) => {
  try {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20ABI,
      provider
    );
    return await tokenContract.decimals()
  } catch (error) {
    console.log("Error fetching token decimals ", error);
  }
};

const getTokenBalance = async (tokenAddress: string, walletAddress: string) => {
  try {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20ABI,
      provider
    );

    return await tokenContract.balanceOf(walletAddress)
  } catch (error) {
    console.log("Error getting token balance ", error);
  }
};

const wait = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const toHex = (currencyAmount: any) => {
  if (currencyAmount.toString().indexOf("e") > -1) {
    let hexedAmount = currencyAmount.toString(16);
    console.log("Hexed amount ", hexedAmount);
    return `0x${hexedAmount}`;
  } else {
    let parsedAmount = parseInt(currencyAmount);
    let hexedAmount = parsedAmount.toString(16);
    return `0x${hexedAmount}`;
  }
};

const lowerCaseItems = (items: string[]) => {
  items.map((item) => {
    return item.toLowerCase();
  });
};

const tokenAmountToBuy = (
  targetEthAmount: number,
  targetTokenAmount: number,
  ourEthAmount: number
) => {
  let tokensPerEth = targetTokenAmount / targetEthAmount;
  console.log(
    "Expected amounts : ",
    tokensPerEth,
    ourEthAmount * tokensPerEth
  );

  return ourEthAmount * tokensPerEth;
};

/**
 * Returns a checksummed address or send a notification if the address is invalid
 * @param address Address to checksum
 * @returns A checksummed address
 */
const checkAddress = (ctx: any, address: string) => {
  try {
    const tokenAddress = ethers.utils.getAddress(address);
    return tokenAddress;
  } catch (error) {
    let message = "Error  ";
    message += "\n\n Invalid token address provided ";
    message += `\n\n ${error}`;
    ctx.reply(message);
  }
};

const checkToken = async (token: string) => {
  try {
    return await BoughtTokens.find({
      tokenAddress: token.toLowerCase(),
      bought: true,
    });
  } catch (error) {
    console.log("Got an error checking if token is in DB ", token, error);
  }
};

const saveToken = async (token: string, txHash: string) => {
  const bought = new BoughtTokens({
    tokenAddress: token.toLowerCase(),
    txHash: txHash,
  });

  await bought
    .save()
    .then(() => {
      console.log("Successfully saved token in DB");
    })
    .catch((error: any) => {
      console.log("Error saving token ", token, error);
    });
};

const deleteToken = async (token: string) => {
  await BoughtTokens.findOneAndDelete({ tokenAddress: token.toLowerCase() })
    .then(() => {
      console.log("Successfully deleted token from db ", token);
    })
    .catch((error: any) => {
      console.log("Error deleting token ", token, error);
    });
};

export const methodsExclusion = ["0x", "0x0"];

export const multiCallMethods = ["0x5ae401dc", "0xac9650d8"]

export const stableTokens = STABLE_TOKENS.map((token: string) => {
  return token.toLowerCase();
});

export const repeatedTokens = REPEATED_BOUGHT_TOKENS.map((token: string) => {
  return token.toLowerCase();
});

export const waitForTransaction = async (txnHash: string) => {
  await provider.waitForTransaction(
    txnHash,
    1,
    WAIT_TIME_AFTER_TRANSACTION
  );
}

export const getBuyAmount = (targetWallet: string, value: number) => {
  const MAX_ETH_AMOUNT_TO_BUY = WALLETS_TO_MONITOR.get(
    targetWallet.toLowerCase()
  )!;

  console.log("Buy amount : ", MAX_ETH_AMOUNT_TO_BUY, value)

  let buyAmount =
    value > MAX_ETH_AMOUNT_TO_BUY ? MAX_ETH_AMOUNT_TO_BUY : value;

  return buyAmount
}

export const prepareTxContents = (txnObject: ethers.providers.TransactionResponse): txContents => {
  const txContents = {
    hash: txnObject.hash!,
    from: txnObject.from!,
    to: txnObject.to!,
    gasPrice: txnObject.gasPrice,
    maxPriorityFeePerGas: txnObject.maxPriorityFeePerGas,
    maxFeePerGas: txnObject.maxFeePerGas,
    gas: txnObject.gasLimit,
    input: txnObject.data,
    value: txnObject.value,
  };

  return txContents;
}

export {
  getTxnStatus,
  tokenAmountToBuy,
  ERC20ABI,
  getTokenAllowance,
  provider,
  saveToken,
  checkToken,
  deleteToken,
  getTokenDecimals,
  lowerCaseItems,
  getTokenBalance,
  wait,
  toHex,
  tokenAllowance,
  ERC20Interface,
  v2smartContract,
  checkAddress,
};
