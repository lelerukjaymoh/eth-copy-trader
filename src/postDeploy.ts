// This script is to be run every time a new contract is deployed

import { botParameters } from "./config/setup";
import { approveToken } from "./uniswap/swap";

// It approves Uniswap v2 router to transfer Tokens from the swapper contract address

approveToken(botParameters.wethAddrress);
