// Amount of exact tokens to buy

// Set the ethamount to buy
const ETH_AMOUNT_TO_BUY = 0.001 * 10 ** 18;

// No of buys to make with the smart contract
const NO_OF_BUYS = 1;

// Fixed params used by the bot
// botParameters values are not to be changed
const botParameters = {
  uniswapv2Router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  swapperAddress: "0x3E9E2A987f47d6956aFE31f4D7FD6937582989Ab",
  wethAddrress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
};

// RINKEBY VALUES
// uniswapv2Router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
//   swapperAddress: "0xaf4375d1dd30c9C500518380Dc3DF08E74C8949A",
//   wethAddrress: "0xc778417e063141139fce010982780140aa0cd5ab",

// LIQUIDITY_METHODS
const LIQUIDITY_METHODS: string[] = [
  "a9b70727",
  "f305d719",
  "e8e33700",
  "e8078d94",
  "c9567bf9",
  "293230b8",
  "8a8c523c",
  "0bd05b69",
  "01339c21",
  "58780a82",
  "8f70ccf7",
  "fd2dbb0e",
  "2cde6081",
  "e01af92c",
  "7ba4bf34",
  "8f70ccf7",
];

const BLACKLIST_FUNCTIONS: string[] = [
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
];

const SCAM_FUNCTIONS: string[] = [
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

let METHODS_TO_MONITOR: string[] = [];

LIQUIDITY_METHODS.forEach((functionId) => {
  METHODS_TO_MONITOR.push(functionId);
});

SCAM_FUNCTIONS.forEach((functionId) => {
  METHODS_TO_MONITOR.push(functionId);
});

BLACKLIST_FUNCTIONS.forEach((functionId) => {
  METHODS_TO_MONITOR.push(functionId);
});

// Wallets being tracked

const BUY_AMOUNTS = {
  newWallet: 0.1 * Math.pow(10, 18),
  existingWallet: 0.00001 * Math.pow(10, 18),
  specialWallet: 0.1 * Math.pow(10, 18),
};

// Wallets we are monitoring

let WALLETS_TO_MONITOR = new Map([
  [
    "0x041dc272824239af43529afc90eba7733705b161".toLowerCase(),
    BUY_AMOUNTS.existingWallet,
  ],
  [
    "0xd5015953bc4e24f9dac96cacf60f348115077f4c".toLowerCase(),
    BUY_AMOUNTS.existingWallet,
  ],
 [
    "0xE51dD356f8007C8123Ea9cbaB1a074B9F38Fd6f2".toLowerCase(),
    BUY_AMOUNTS.existingWallet,
  ]

]);

// Users to receive telegram notifications
const TG_CHANNEL: number = -1001265534372;

const TG_USERS: string[] = [
  "584173555",
  "1645102790",
  "1295076847",
  "1741013492",
  "299108118",
  "1610178949",
  "2060423170",
  "420331061",
];

// Tokens to repeatedly buy
const REPEATED_BOUGHT_TOKENS: string[] = [
  "0xa0c8c80ed6b7f09f885e826386440b2349f0da7e",
];

// Gas limit to use if gasLimit is not specified

const DEFAULT_GAS_LIMIT = 700000;
const DEFAULT_GAS_PRICE = 90 * Math.pow(10, 9);

const EXCLUDED_TOKENS = ["0x4acfCedFABE1DB58e959D749BC61a8A5B83d08cb"];

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

// Time interval for running the token scheck cron job in secs
const TOKEN_CHECK_TIME_INTERVAL = 30;

// The interval in seconds the bots keep on checking the db and updating the amountof tokens we had bought
const GET_NONCE_TIMEOUT = 5;

const MAX_GAS_PRICE_TG = 100;

// Parameters used by the bot

export {
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
  LIQUIDITY_METHODS,
  METHODS_TO_MONITOR,
  SCAM_FUNCTIONS,
  BLACKLIST_FUNCTIONS,
  WALLETS_TO_MONITOR,
  ETH_AMOUNT_TO_BUY,
  DEFAULT_GAS_LIMIT,
  botParameters,
  NO_OF_BUYS,
  TG_USERS,
  GET_NONCE_TIMEOUT,
  ADDITIONAL_BUY_GAS,
};
