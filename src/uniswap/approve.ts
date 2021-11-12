import {
  DEFAULT_GAS_PRICE,
  botParams,
  DEFAULT_GAS_LIMIT,
} from "../config/setup";
import { overLoads } from "../types";
import { readFileSync } from "fs";
import Web3 from "web3";

const { ethers } = require("ethers");

const abi = [
  "function approve(address _spender, uint256 _value) public returns (bool success)",
];

const provider = ethers.getDefaultProvider(process.env.JSON_RPC, {
  name: "binance",
  chainId: 56,
});

const web3 = new Web3(process.env.JSON_RPC!);

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
let walletAddress = ethers.utils.getAddress(WALLET_ADDRESS);
const signer = new ethers.Wallet(PRIVATE_KEY);
const account = signer.connect(provider);

ethers;

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

const FRONTRUNNER_ABI = JSON.parse(
  readFileSync("src/uniswap/pancakeSwapABI.json", "utf8")
);

const frontrunnerContract = new web3.eth.Contract(
  FRONTRUNNER_ABI,
  botParams.swapperAddress
);

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

const allowToken = async (token: string) => {
  const lastNonce = await web3.eth.getTransactionCount(
    process.env.WALLET_ADDRESS!,
    "pending"
  );

  console.log("Token to approve ", token);

  const approve = frontrunnerContract.methods
    .approve(token, botParams.swapperAddress)
    .encodeABI({
      from: process.env.WALLET_ADDRESS!,
    });

  const approveParams = {
    from: process.env.WALLET_ADDRESS,
    gasPrice: DEFAULT_GAS_PRICE,
    gas: DEFAULT_GAS_LIMIT,
    to: botParams.swapperAddress,
    value: 0,
    data: approve,
    nonce: lastNonce,
  };

  const signedApprove = await web3.eth.accounts.signTransaction(
    approveParams,
    process.env.PRIVATE_KEY!
  );

  await web3.eth
    .sendSignedTransaction(signedApprove.rawTransaction!)
    .on("transactionHash", async (hash) => {
      try {
        console.log(
          "\n\n\n ----------- SUCCESSFULLY BROADCAST AN APPROVE ---------"
        );
        console.log("Transaction Hash ", hash);
      } catch (error) {
        console.log("\n\n\n Encoutered an error broadcasting buy txn");
        console.log("Error :  ", error);
      }
    });
};

export { approve, walletNonce };
