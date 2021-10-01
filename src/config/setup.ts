
// Features :
//  * Buy on addLiquidity, addLiquidityETH, openTrading, startTrading
//  * Capable of editing setting if the bot should use Exacttokens or ExactETH when buying



// Setting up the Bot parameters

// @ Enter the tokens to monitor in the array TOKENS_TO_MONITOR 
const TOKENS_TO_MONITOR = [
     "0x1a3aacc4fceb968de9219691d7b1a63cc6da65e0",
]

// The minimum amount of liquidity a token should have
const MINIMUM_POOLED_WBNB = 1

const APPROVE_GAS_LIMIT = 300000

// @ Set the ethamount to buy
const ETH_AMOUNT_TO_BUY = 0.05 * 10 ** 18
const NONCE_INTERVAL = 5

// @ Set if the token should use the exact tokens to make a buy and the amount of tokens it should purchase
//      - If the TOKEN_AMOUNT_TO_BUY value is greater than zero, the bot will buy the token using the swapETHforExactTokens
//      - The bot uses the amount of token as the TOKEN_AMOUNT_TO_BUY to make a buy
//      - The amount set should not be more than the token's _txAmount value ( the maximum amount of tokens you can buy :
//        This value is got from the token source code )

const TOKEN_AMOUNT_TO_BUY = 5000000 * 10 ** 18



// Fixed params used by the bot
// botParams values are not to be changed
const botParams = {
     "uniswapv2Router": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
     "smartContractAddress": "",
     "wethAddrress": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
}

// Liquidity Methods to keep track of
const ADD_LIQUIDITY_METHODS: string[] = ["0x293230b8", "0xc9567bf9", "0xf305d719", "0xe8078d94", "0xa9b70727"]

export { MINIMUM_POOLED_WBNB, ADD_LIQUIDITY_METHODS, TOKENS_TO_MONITOR, ETH_AMOUNT_TO_BUY, TOKEN_AMOUNT_TO_BUY, NONCE_INTERVAL, APPROVE_GAS_LIMIT, botParams }