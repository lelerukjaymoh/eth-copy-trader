// Fixed params used by the bot

import { BigNumber } from "ethers";

// botParameters values are not to be changed
const botParameters = {
  uniswapv2Router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  uniswapv3Router: "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
  swapperAddress: "0xc2096919C0F088100a7a48b00e5Ea59F2f7C1025",
  wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  rugCheckerAddress: "0xa6c35951ca57a0739d770113b8320316bbe505a7"
};

const BUY_AMOUNTS = {
  testingAmount: 0.000001 * Math.pow(10, 18),
  lowSpender: 0.01 * Math.pow(10, 18),
  highSpender: 0.02 * Math.pow(10, 18),
};

// Wallets we are monitoring
// 27 wallets

let WALLETS_TO_MONITOR = new Map([

  // [
  //   "0xe58fcc0335b48396c12d580edec65ed5f5b29fda".toLowerCase(),
  //   BUY_AMOUNTS.testingAmount,
  // ],
  [
    "0xDb6A898EAb7302a860208076be9f856818F00744".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0xF20e53b1b21b4cF9e688aa65439e4C364F51fAc9".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0x5688bCe725aF46e3058D144045BA7FBe1c16A592".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0x1615dC85ACdb95B5F3572AFA2E1e75f4998Cb844".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0xbCb05a3F85d34f0194C70d5914d5C4E28f11Cc02".toLowerCase(),
    BUY_AMOUNTS.lowSpender,
  ],
  [
    "0x2a143d164bb57f10570d81b5045aeb9ee7738a29".toLowerCase(),
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
    "0x9081dDf23634d9ae86E83B5d812a342D0565fab3".toLowerCase(),
    BUY_AMOUNTS.highSpender,
  ],
  [
    "0x66C039A152730f07932466598D88883d811707Ad".toLowerCase(),
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
  [
    "0x02c2adbdB7c0C1037B5278626A78B6c71787dFe8".toLowerCase(),
    BUY_AMOUNTS.lowSpender,
  ],
  [
    "0xe2008ef79a7d0d75edae70263384d4ac5d1a9f9a".toLowerCase(),
    BUY_AMOUNTS.lowSpender,
  ],
  [
    "0x2f9c38bd6e2f382c031bfda65aea2b76becd6808".toLowerCase(),
    BUY_AMOUNTS.lowSpender,
  ],
  [
    "0xe5956B4807116084E595057De6d795b7FDe12A3b".toLowerCase(),
    BUY_AMOUNTS.lowSpender,
  ],
  ["0x68B531349EB44496943Be5FF15A5F510849D561f".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x9098cea37117E29c792340169800290784Ad8FC1".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0xE2008Ef79a7d0D75EdAE70263384D4aC5D1A9f9A".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x01D5EA3634837d15D5b4d03A3271B43b809f3C15".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0xB794B87E959f991eBb03b207FA5C757e56FA50E9".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x9eAD60C59D3a68ec8ed7B50fac68de4C385e4187".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0xB0C5744824A692C208bc9F32bb98b1AC44D00418".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0xdb7154aF7C9C7663f0cC899957F296bD5DF1Cde7".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x0d9044A9E9e3A9f510342a7B77BadFFcb4B5D2B0".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0xD2E487b12Ec3CfaA7EB417E572309Dd643f420f2".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x2f4a22ef077559117B86D54E88a8c9f98ffb7b1F".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x89526Fa1B1400628426dc307a1d51cC84B3AB74d".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0xf5323a443Dd307755B3f247EAE1791d5e94C9497".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x5C9603601797207d63d19B0b0B8826648E638009".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x8684a96E03F866ECFd57A930AbB66A8f181c21E1".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0xE18b6a267a3840B48F0DE94aD93965d5b1A03fb8".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x173Cc4B21b35C12481B68CA33704444d4F6c74d0".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0xeb467F831233c47b25877eaF895773C6031D7E71".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x4956bf3E03DF13d8003FBd65bD91dC33191F6E40".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0xC89e8e0F9cAd8443e787EEf92b29DCa113D2FCe8".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x83F7aD79635cD06eA1E52b506624bd4350b69b33".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x7a83e700F385233C644c30a4eCb029183AC53C47".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x231a7eF1051246577d774e79536f7B06d7986309".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x8A69E65671D75f9D234f71e505316657d4B8f6E6".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x7116B0087621Bb36628EC21eb39D3cA917e3FAd3".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x129a2fa592d3986b7A98B17E9ab2cD54e02A8abC".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x27848cb862d42AF725DC8E340B86747D1e0c7d76".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0xc2C665f49674a7243909C6068fC17B88366d57e3".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0xC7C32357585293d072464209c8649f48F7c973bf".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0xEDBA0751f411f0C454b25Caf33D682FE8358F854".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x9E4A9b4334F3167Bc7DD35f48f2238c73F532bAf".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x72aB505FE1C90adadD13E4d3C3C52b96c0F2a9CA".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x5fA998Dde306201D105acbCB125effDf446D6f5b".toLowerCase(),
  BUY_AMOUNTS.highSpender,
  ],
  ["0x9dda370f43567b9C757A3F946705567BcE482C42".toLowerCase(),
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

const STABLE_COIN_BNB_AMOUNT_TO_BUY = 0.05 * 10 ** 18;

export const ADDITIONAL_EXIT_SCAM_GAS = BigNumber.from(20)

const TARGET_MINIMUM_BUY_AMOUNT = 0.01 * Math.pow(10, 18);

const ADDITIONAL_SELL_GAS = 30 * Math.pow(10, 9);

const ADDITIONAL_BUY_GAS = 30 * Math.pow(10, 9);

const WAIT_TIME_AFTER_TRANSACTION = 8 * 1000;

// Time interval for running the token check cron job in secs
const TOKEN_CHECK_TIME_INTERVAL = 5;

// The interval in seconds the bots keep on checking the db and updating the amount of tokens we had bought
const GET_NONCE_TIMEOUT = 5;

const MAX_GAS_PRICE_TG = 100;

// Parameters used by the bot

// Slippage 
const SLIPPAGE = 20

// Minimum tax a token charges for buy transactions
export const MINIMUM_BUY_TAX = 6

// Minimum tax a token charges for sell transactions
export const MINIMUM_SELL_TAX = 6


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
  "5ae401dc"    // multicall
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
