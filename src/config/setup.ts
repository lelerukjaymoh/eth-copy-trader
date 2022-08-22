// Fixed params used by the bot
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
  //   "0x0aEadd5bB47bB7ff133076972ff44212f3bE5541".toLowerCase(),
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

const TARGET_MINIMUM_BUY_AMOUNT = 0.01 * Math.pow(10, 18);

const ADDITIONAL_SELL_GAS = 5 * Math.pow(10, 9);

const ADDITIONAL_BUY_GAS = 5 * Math.pow(10, 9);

const WAIT_TIME_AFTER_TRANSACTION = 15 * 1000;

// Time interval for running the token check cron job in secs
const TOKEN_CHECK_TIME_INTERVAL = 15;

// The interval in seconds the bots keep on checking the db and updating the amount of tokens we had bought
const GET_NONCE_TIMEOUT = 5;

const MAX_GAS_PRICE_TG = 100;

// Parameters used by the bot

// Slippage 
const SLIPPAGE = 20

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
