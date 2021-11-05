// This script is to be run every time a new contract is deployed

import { botParams } from "./config/setup";
import { allowToken } from "./uniswap/swap";

// It approves Uniswap v2 router to transfer Tokens from the swapper contract address

allowToken(botParams.wethAddrress);
