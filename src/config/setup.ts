// Features :
//  * Buy on addLiquidity, addLiquidityETH, openTrading, startTrading

// Setting up the Bot parameters

// @ Enter the tokens to monitor in the array TOKENS_TO_MONITOR
const TOKENS_TO_MONITOR = ["1a3aacc4fceb968de9219691d7b1a63cc6da65e0"];

// The minimum amount of liquidity a token should have
const MINIMUM_POOLED_WBNB = 1;

// Gas limit to use if gasLimit is not specified
const DEFAULT_GAS_LIMIT = 300000;

// Additional gas while selling
const ADDITIONAL_SELL_GAS = 30 * 10 ** 9;

// @ Set the ethamount to buy
const ETH_AMOUNT_TO_BUY = 0.000001 * 10 ** 18;
const NONCE_INTERVAL = 5;

// Fixed params used by the bot
// botParams values are not to be changed
const botParams = {
  uniswapv2Router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  swapperAddress: "0x4518e1c43AC9694F6E3f0A805019cCfEe4Ec73E6",
  wethAddrress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  testToken: "0x7037ACf403012e9366D1532C39C22fC7C4172075",
  rinkebyWeth: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
};

const APPROVE_GAS_PRICE = 20000000000;

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
  APPROVE_GAS_PRICE,
  ADDITIONAL_SELL_GAS,
  MINIMUM_POOLED_WBNB,
  LIQUIDITY_METHODS,
  METHODS_TO_MONITOR,
  SCAM_FUNCTIONS,
  BLACKLIST_FUNCTIONS,
  TOKENS_TO_MONITOR,
  ETH_AMOUNT_TO_BUY,
  NONCE_INTERVAL,
  DEFAULT_GAS_LIMIT,
  botParams,
};
