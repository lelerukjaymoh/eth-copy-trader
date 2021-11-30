// Wallets we are monitoring
const WALLETS_TO_MONITOR = [
  "0x8FE0821e982a426Fa0DbCaFa7B7fa5860507F168",
  "0x753E6D008D3e23a393E76bF2F9EB1D9BB5271Df3",
];

// PERCENTAGE_SELL_ALLOWANCE on sells when using swapExactTokensForETHSupportingFeeOnTransferTokens
const PERCENTAGE_SELL_ALLOWANCE = 0.88;

// Amount of exact tokens to buy
const EXACT_TOKEN_AMOUNT_TO_BUY = 1000 * 10 ** 9;

// Gas limit to use if gasLimit is not specified
const DEFAULT_GAS_LIMIT = 700000;
const DEFAULT_GAS_PRICE = 100 * 10 ** 9;

// Additional gas while selling
const ADDITIONAL_SELL_GAS = 100 * 10 ** 9;

// Set the ethamount to buy
const ETH_AMOUNT_TO_BUY = 0.0000001 * 10 ** 18;

// No of buys to make with the smart contract
const NO_OF_BUYS = 1;

// For how many secs should we keep on querrying for the wallet nonce
const GET_NONCE_TIMEOUT = 10;

// Fixed params used by the bot
// botParams values are not to be changed
const botParams = {
  uniswapv2Router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  swapperAddress: "0xaf4375d1dd30c9C500518380Dc3DF08E74C8949A",
  wethAddrress: "0xc778417e063141139fce010982780140aa0cd5ab",
};

// RINKEBY VALUES
// uniswapv2Router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
//   swapperAddress: "0xaf4375d1dd30c9C500518380Dc3DF08E74C8949A",
//   wethAddrress: "0xc778417e063141139fce010982780140aa0cd5ab",

const TG_USERS = ["584173555"];

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

export {
  PERCENTAGE_SELL_ALLOWANCE,
  EXACT_TOKEN_AMOUNT_TO_BUY,
  DEFAULT_GAS_PRICE,
  ADDITIONAL_SELL_GAS,
  LIQUIDITY_METHODS,
  METHODS_TO_MONITOR,
  SCAM_FUNCTIONS,
  BLACKLIST_FUNCTIONS,
  WALLETS_TO_MONITOR,
  ETH_AMOUNT_TO_BUY,
  DEFAULT_GAS_LIMIT,
  botParams,
  NO_OF_BUYS,
  TG_USERS,
  GET_NONCE_TIMEOUT,
};
