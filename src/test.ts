import { buy } from "./uniswap/swap";
import { ethers } from "ethers";
import { botParams } from "./config/setup";
import { swapExactETHForTokens } from "./uniswap/buy";
const provider = new ethers.providers.JsonRpcProvider(
  process.env.RINKBEY_JSON_RPC!
);

const main = async () => {
  try {
    console.log("Wallet , ", process.env.WALLET_ADDRESS);
    console.log("Key , ", process.env.PRIVATE_KEY);
    const nonce = await provider.getTransactionCount(
      process.env.WALLET_ADDRESS!
    );
    const bal = await (
      await provider.getBalance(process.env.WALLET_ADDRESS!)
    )._hex;
    console.log("Bal ", parseInt(bal, 16) / 10 ** 18);
    const path = [
      botParams.wethAddrress,
      "0x8dc5ca19e64ade17aeeb4f8c52bf8ff220ed17de",
    ];
    console.log("nonc e", nonce);
    await swapExactETHForTokens(
      10000000,
      0,
      path,
      20 * 10 ** 9,
      20 * 10 ** 9,
      300000,
      nonce
    );
  } catch (error: any) {
    console.log(error.message);
  }
};

main();
