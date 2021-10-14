import { botParams } from "../config/setup";
import { overLoads } from "../types";

const { ethers } = require("ethers");

const abi = [
  "function approve(address _spender, uint256 _value) public returns (bool success)",
];

const provider = ethers.getDefaultProvider(process.env.RINKEBY_JSON_RPC, {
  name: "binance",
  chainId: 56,
});
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;

const RINKEBY_WALLET_ADDRESS = process.env.RINKEBY_WALLET_ADDRESS;
let walletAddress = ethers.utils.getAddress(RINKEBY_WALLET_ADDRESS);

const signer = new ethers.Wallet(RINKEBY_PRIVATE_KEY);
const account = signer.connect(provider);

const MAX_INT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

const walletNonce = async () => {
  try {
    let nonce = await provider.getTransactionCount(walletAddress);

    if (nonce) {
      return nonce;
    } else {
      let nonce = await provider.getTransactionCount(walletAddress);
      return nonce;
    }
  } catch (error) {
    console.log("Error fetching Wallet nonce ", error);
  }
};

const approve = async (tokenToapprove: string, overLoads: overLoads) => {
  try {
    let contract = new ethers.Contract(tokenToapprove, abi, account);

    const tx = await contract.approve(
      botParams.uniswapv2Router,
      MAX_INT,
      overLoads
    );

    console.log("\n\n\n ************** APPROVE ***************");
    console.log("Transaction hash: ", tx.hash);
    console.log("*********************************************");
  } catch (error) {
    console.log("Error => ", error);
  }
};

export { approve, walletNonce };
