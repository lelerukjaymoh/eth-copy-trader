import Web3 from "web3";
import { botParameters } from "./config/setup";
import { smartContract, toHex } from "./utils/common";

const web3 = new Web3(process.env.JSON_RPC!);
const withdraw = async () => {
  try {
    const overLoads = {};
    const deadline = Math.floor(Date.now() / 1000) + 60 * 2;
    let withdrawParams;

    const withdrawData = smartContract.methods
      .withdrawToken(
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        toHex(1499989000000000000)
      )
      .encodeABI({
        from: process.env.WALLET_ADDRESS,
      });

    withdrawParams = {
      from: process.env.WALLET_ADDRESS!,
      gas: toHex(700000),
      gasPrice: toHex(120 * 10 ** 9),
      to: botParameters.swapperAddress,
      value: 0,
      data: withdrawData,
      nonce: 94,
    };

    console.log(withdrawParams);

    const signedWithdraw = await web3.eth.accounts.signTransaction(
      withdrawParams,
      process.env.PRIVATE_KEY!
    );

    let withdrawResponseData: any;

    await web3.eth
      .sendSignedTransaction(signedWithdraw.rawTransaction!)
      .on("transactionHash", async (hash) => {
        try {
          console.log(
            "\n\n\n ----------- SUCCESSFULLY BROADCAST A WITDRAW ---------"
          );
          console.log("Transaction Hash ", hash);

          withdrawResponseData = {
            success: true,
            data: hash,
          };
        } catch (error) {
          console.log("\n\n\n Encoutered an error broadcasting withdraw txn");
          console.log("Error :  ", error);
        }
      });

    return withdrawResponseData;
  } catch (error) {
    console.log("error ", error);
  }
};

withdraw();
