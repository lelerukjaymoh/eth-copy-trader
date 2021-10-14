import { allowToken, buy } from "./uniswap/swap";
import { ethers } from "ethers";
import { botParams } from "./config/setup";
import { swapExactETHForTokens } from "./uniswap/buy";
import { approve } from "./uniswap/approve";
import {
  ChainId,
  Fetcher,
  Pair,
  Route,
  Token,
  TokenAmount,
  Trade,
  TradeType,
} from "@uniswap/sdk";
const provider = new ethers.providers.JsonRpcProvider(
  process.env.RINKEBY_JSON_RPC!
);

const main = async () => {
  try {
    console.log("Wallet , ", process.env.RINKEBY_WALLET_ADDRESS);
    console.log("Key , ", process.env.RINKEBY_PRIVATE_KEY);
    const nonce = await provider.getTransactionCount(
      process.env.RINKEBY_WALLET_ADDRESS!
    );
    const bal = await (
      await provider.getBalance(process.env.RINKEBY_WALLET_ADDRESS!)
    )._hex;
    console.log("Bal ", parseInt(bal, 16) / 10 ** 18);
    const path = [botParams.rinkebyWeth, botParams.testToken];
    console.log("nonce", nonce);
    const overLoads = {
      gasLimit: 3000000,
      nonce,
      gasPrice: 150 * 10 ** 9,
    };

    const amountIn = 0.00001 * 10 ** 18;

    console.log(path);
    // await allowToken(botParams.testToken);
    await buy(amountIn, 0, path, overLoads);
    // await swapExactETHForTokens(0, 0.00001 * 10 ** 18, path, overLoads);
    // await approve(botParams.testToken, overLoads);
  } catch (error: any) {
    console.log(error.message);
  }
};

main();

const priceImpact = async (token: string, targetETHAmount: number) => {
  try {
    let WETHToken = new Token(ChainId.RINKEBY, botParams.rinkebyWeth, 18);

    let newToken = new Token(ChainId.RINKEBY, token, 9);

    console.log(newToken);
    console.log(WETHToken);

    const pair = await Fetcher.fetchPairData(newToken, WETHToken, provider);

    const route = new Route([pair], WETHToken);

    const amount = targetETHAmount.toString();

    let trade = new Trade(
      route,
      new TokenAmount(WETHToken, amount),
      TradeType.EXACT_INPUT
    );

    const priceImpact = parseFloat(trade.priceImpact.toFixed(5));
    const tokenPrice = parseFloat(trade.executionPrice.toFixed(5));
    const tokenLiquidity = pair.reserveOf(WETHToken).quotient.toString();

    console.log("\n\n\n\n");
    console.log("Token : ", token);
    console.log("Price Impact ", priceImpact);
    console.log("Token Price ", tokenPrice);
    console.log("Liquidity amount ", tokenLiquidity);

    const Impact = {
      priceImpact: priceImpact,
      tokenPrice: tokenPrice,
      liquidity: parseInt(tokenLiquidity),
    };

    return Impact;
  } catch (error) {
    console.log("Error while fetching price Impact ", token, error);
  }
};

// priceImpact(botParams.testToken, 100000000);
