// Fixed params used by the bot
// botParameters values are not to be changed
const botParameters = {
  uniswapv2Router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  uniswapv3Router: "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
  swapperAddress: "0x3E9E2A987f47d6956aFE31f4D7FD6937582989Ab",
  wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
};

const BUY_AMOUNTS = {
  lowSpender: 0.05 * Math.pow(10, 18),
  testingAmount: 0.000001 * Math.pow(10, 18),
  highSpender: 0.1 * Math.pow(10, 18),
};

// Wallets we are monitoring

let WALLETS_TO_MONITOR = new Map([
  [
    "0xdec08cb92a506B88411da9Ba290f3694BE223c26".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0x9F533382024F02632C832EA2B66F4Bbb1DBc4087".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0xFD91a20300546a2BAF80Fba713C3Aa0cd224620A".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0x3c1f60B578F3AaF06EDb594FAE223cB2AaA5bfD1".toLowerCase(),
    BUY_AMOUNTS.lowSpender,
  ],
  [
    "0xFe76f05dc59fEC04184fA0245AD0C3CF9a57b964".toLowerCase(),
    BUY_AMOUNTS.lowSpender,
  ],

]);

// Users to receive telegram notifications
// TODO: Change the receiver of the message back to TG channel
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
const REPEATED_BOUGHT_TOKENS: string[] = [""];

// Gas limit to use if gasLimit is not specified

const DEFAULT_GAS_LIMIT = 700000;
const DEFAULT_GAS_PRICE = 50 * Math.pow(10, 9);

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

// Time interval for running the token check cron job in secs
const TOKEN_CHECK_TIME_INTERVAL = 30;

// The interval in seconds the bots keep on checking the db and updating the amount of tokens we had bought
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
  WALLETS_TO_MONITOR,
  DEFAULT_GAS_LIMIT,
  botParameters,
  TG_USERS,
  GET_NONCE_TIMEOUT,
  ADDITIONAL_BUY_GAS,
};
