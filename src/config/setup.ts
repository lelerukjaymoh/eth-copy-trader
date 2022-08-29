// Fixed params used by the bot

import { BigNumber } from "ethers";

// botParameters values are not to be changed
const botParameters = {
  uniswapv2Router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  uniswapv3Router: "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
  swapperAddress: "0x3E9E2A987f47d6956aFE31f4D7FD6937582989Ab",
  wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
};

const BUY_AMOUNTS = {
  testingAmount: 0.000001 * Math.pow(10, 18),
  lowSpender: 0.05 * Math.pow(10, 18),
  highSpender: 0.1 * Math.pow(10, 18),
};

// Wallets we are monitoring
// 27 wallets

let WALLETS_TO_MONITOR = new Map([

  // [
  //   "0x5309Bc59C91E6fefA894c70381AbdC871c0D1b33".toLowerCase(),
  //   BUY_AMOUNTS.testingAmount,
  // ],
  [
    "0xDb6A898EAb7302a860208076be9f856818F00744".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0x3fCea81Bf88704d4794F7B6C4B8c4000F9d106be".toLowerCase(),
    BUY_AMOUNTS.lowSpender,
  ],
  [
    "0xDe960e3cEDfE5b942656cad2D749EA28bd45fA15".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0xdec08cb92a506B88411da9Ba290f3694BE223c26".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0xAE637BF6cAD3F3bfabc3215964b0af84cEAE2984".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0x9dda370f43567b9C757A3F946705567BcE482C42".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0x75377155BAbB1512f390905c8DeAE378eb829105".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0xF3CD36797f0d8363768e8BB8F8BEA48c34e519E2".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0x7FF0373F706E07eE326d538f6a6B2Cf8F7397e77".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0xDe960e3cEDfE5b942656cad2D749EA28bd45fA15".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0xdE4ccBEC75b083CD04813F6A4Dc12a6Bb3791C11".toLowerCase(),
    BUY_AMOUNTS.lowSpender,
  ],
  ["0x345eB826a33bec023A2fb09F35256398563129D4".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ]
]);

// Users to receive telegram notifications
// TODO: Change the receiver of the message back to TG channel
const TG_CHANNEL: number = -1001265534372;

const TG_USERS: string[] = [
  "584173555",
  "5035419034",
  "2060423170",
  "1645102790",
  "1295076847",
  "1741013492",
  "299108118",
  "1610178949",
  "420331061",
  "2059064846",
];

// Tokens to repeatedly buy
const REPEATED_BOUGHT_TOKENS: string[] = [""];

// Gas limit to use if gasLimit is not specified

const DEFAULT_GAS_LIMIT = 700000;
const DEFAULT_GAS_PRICE = 50 * Math.pow(10, 9);

const EXCLUDED_TOKENS = ["0x4acfcedfabe1db58e959d749bc61a8a5b83d08cb", "0x4316f6e5558e62cf77ec1296295347e88f7fbd02", "0x631896a570b2de5b3145f1f3fbc17c86b5031191", "0x880d8b17a36bd5b3e3b08fe99b6c30e3751df462"];

const STABLE_TOKENS = [
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
  "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
  "0xdac17f958d2ee523a2206206994597c13d831ec7", //  USDT
];

const STABLE_COIN_BNB_AMOUNT_TO_BUY = 0.1 * 10 ** 18;

export const ADDITIONAL_EXIT_SCAM_GAS = BigNumber.from(20)

const TARGET_MINIMUM_BUY_AMOUNT = 0.01 * Math.pow(10, 18);

const ADDITIONAL_SELL_GAS = 10 * Math.pow(10, 9);

const ADDITIONAL_BUY_GAS = 10 * Math.pow(10, 9);

const WAIT_TIME_AFTER_TRANSACTION = 8 * 1000;

// Time interval for running the token check cron job in secs
const TOKEN_CHECK_TIME_INTERVAL = 15;

// The interval in seconds the bots keep on checking the db and updating the amount of tokens we had bought
const GET_NONCE_TIMEOUT = 5;

const MAX_GAS_PRICE_TG = 100;

// Parameters used by the bot

// Slippage 
const SLIPPAGE = 20


// Scam functions method Ids we use to capture events when the token dev wants to rug a token
export const SCAM_FUNCTIONS: string[] = [
  //  Blacklist methods 
  "b515566a",
  "4303443d",
  "1d7ef879",
  "83b61c8b",
  "98d5a5cb",
  "47a64f44",
  "00b8cf2a",
  "eec2744e",
  "f2cc0c18",
  "228e7a91",
  "8326699d",
  "d01dd6d2",
  "41959586",
  "f9f92be4",
  "772558ce",
  "cad6ebf9",
  "e084ba59",
  "455a4396",

  // Scam methods
  "baa2abde",
  "02751cec",
  "af2979eb",
  "ded9382a",
  "5b0d5984",
  "2195995c",
  "1031e36e",
  "1bbae6e0",
  "d543dbeb",
];


export const REMOVE_LIQUIDITY_FUNCTIONS = [
  "ded9382a",   // removeLiquidityETHWithPermit
  "2195995c",   // removeLiquidityWithPermit
  "02751cec",   // removeLiquidityETH
  "baa2abde",   // removeLiquidity
  "5b0d5984",   // removeLiquidityETHWithPermitSupportingFeeOnTransferTokens
  "af2979eb",   //removeLiquidityETHSupportingFeeOnTransferTokens
]



export {
  SLIPPAGE,
  TG_CHANNEL,
  EXCLUDED_TOKENS,
  TARGET_MINIMUM_BUY_AMOUNT,
  MAX_GAS_PRICE_TG,
  WAIT_TIME_AFTER_TRANSACTION,
  STABLE_COIN_BNB_AMOUNT_TO_BUY,
  STABLE_TOKENS,
  TOKEN_CHECK_TIME_INTERVAL,
  REPEATED_BOUGHT_TOKENS,
  DEFAULT_GAS_PRICE,
  ADDITIONAL_SELL_GAS,
  WALLETS_TO_MONITOR,
  DEFAULT_GAS_LIMIT,
  botParameters,
  TG_USERS,
  GET_NONCE_TIMEOUT,
  ADDITIONAL_BUY_GAS,
};
