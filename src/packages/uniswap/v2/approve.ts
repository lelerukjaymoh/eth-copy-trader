import {
  DEFAULT_GAS_PRICE,
  botParameters,
  DEFAULT_GAS_LIMIT,
} from "../../../config/setup";
import { overLoads } from "../../types";
import { readFileSync } from "fs";

const { ethers } = require("ethers");

const abi = [
  "function approve(address _spender, uint256 _value) public returns (bool success)",
];

const provider = ethers.getDefaultProvider(process.env.JSON_RPC);

const PRIVATE_KEY = process.env.V2_PRIVATE_KEY;

const WALLET_ADDRESS = process.env.V2_WALLET_ADDRESS;
let walletAddress = ethers.utils.getAddress(WALLET_ADDRESS);
const signer = new ethers.Wallet(PRIVATE_KEY);
const account = signer.connect(provider);

ethers;

const MAX_INT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

const FRONTRUNNER_ABI = JSON.parse(
  readFileSync("src/uniswap/erc20ABI.json", "utf8")
);

const frontrunnerContract = new ethers.Contract(
  FRONTRUNNER_ABI,
  botParameters.swapperAddress
);

const approve = async (tokenToApprove: string, overLoads: overLoads) => {
  try {
    let contract = new ethers.Contract(tokenToApprove, abi, account);

    const tx = await contract.approve(
      botParameters.uniswapv2Router,
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

export { approve };
