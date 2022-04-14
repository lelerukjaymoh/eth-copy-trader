import {
  botParameters,
  DEFAULT_GAS_LIMIT,
  MAX_GAS_PRICE_TG,
  TG_CHANNEL,
  TG_USERS,
} from "../config/setup";
import { checkAddress, walletNonce, getTokenBalance, wait } from "../utils/common";
import { Telegraf } from "telegraf";
import { sell } from "../uniswap/v2/swap";
import { init } from "../initialize";

// Ensure all .env variables are loaded 
init()

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start((ctx: any) => {
  console.log("\n\n User is starting the bot")
  ctx.reply(
    "Welcome, You account is successfully setup to receive notifications  ..."
  );
});

/**
 * Selling Manually using the bot
 */

bot.on("text", async (ctx) => {
  try {
    const text: any = ctx.message?.text
      ? ctx.message?.text
      : ctx.update.message.text || "";
    let details = text.split(",");

    let user = ctx.message.from.id.toString();

    if (TG_USERS.includes(user)) {
      if (text.toLowerCase() == "stop") {

        console.log("\n\n Stopping the bot")
        ctx.reply("Stopping the bot")
        bot.stop("Manual bot stop initiated from TG")

        // REVIEW: IF the bot was stopped on Tg you need to uncomment this line run the bot then return it 
        process.exit(1)

      }

      if (details.length > 1) {
        const tokenAddress = checkAddress(ctx, details[0].trim());
        let gasPrice = details[1].trim();

        if (tokenAddress && gasPrice && gasPrice < MAX_GAS_PRICE_TG) {
          ctx.reply("Processing Transaction ...");

          const tokenBalance = await getTokenBalance(
            tokenAddress!,
            botParameters.swapperAddress
          );

          if (tokenBalance > 0) {
            gasPrice = parseInt(gasPrice) * 10 ** 9;

            const nonce = await walletNonce();
            const overLoads = { gasPrice, nonce, gasLimit: DEFAULT_GAS_LIMIT };

            const path = {
              tokenIn: tokenAddress,
              tokenOut: botParameters.wethAddress
            }

            const sellTx = await sell(
              0,
              path,
              overLoads
            );

            if (sellTx!.success) {
              let message = "Manual Sell Notification";
              message += "\n\n Txn ";
              message += `\nhttps://etherscan.io/tx/${sellTx!.data}`;
              message += "\n\n Token";
              message += `\nhttps://etherscan.io/token/${tokenAddress}`;

              ctx.reply(message);
            } else {
              let message = "Manual Sell Error";
              message += "\n\n Token";
              message += `\nhttps://etherscan.io/token/${tokenAddress}`;
              message += "\n\n Error";
              message += `\nhttps://etherscan.io/tx/${sellTx!.data}`;

              ctx.reply(message);
            }
          } else {
            let message =
              "Warning! Either could not get token balance (If this is the case, ensure the token is a token address and try again. Also refer to the information ";
            message +=
              "below for more insights on the cause of the error OR token balance is 0";
            message += `\n\n Token Balance: ${tokenBalance}`;
            message += "\n\nReason for error: ";
            message += `\n${tokenBalance}`;

            ctx.reply(message);
          }
          // }
        } else {
          let message =
            "Error! You did not provide the gas price to be used for selling or You over priced the transaction";
          message += `. You either did not provide the token address or the gas price value or provided a large amount of gas. `;
          message += `Gas price cant be more than ${MAX_GAS_PRICE_TG}`;
          message += "\n\nExample of a correct sell command";
          message +=
            "\n\n contractAddress, gasPrice, ie 0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b, 30";
          ctx.reply(message);
        }
      } else {
        let message =
          "Error! you did not provide enough parameteres for selling. You need to provide token to sell and gas to be used for selling in gwei. is contractAddress, gasPrice ";
        message += "\n\nExample of a correct sell command";
        message += "\n\n 0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b, 30";
        ctx.reply(message);
      }
    } else {
      ctx.reply("Error, You are not authorized to make this request");
    }
  } catch (error) {
    let message = "Encountered this error while selling";
    message += `\n\n\ ${error}`;

    ctx.reply(message);
  }
});

const sendNotification = async (message: any) => {
  console.log("\n\nSending Tg notification...");

  // TG_USERS.forEach((chat) => {

  bot.telegram
    .sendMessage(TG_CHANNEL, message, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    })
    .catch((error: any) => {
      console.log(
        "\n\n Encoutered an error while sending notification to ",
        TG_CHANNEL
      );
      console.log("==============================");
      console.log(error);
    });
  // });
  console.log("Done!");
};

bot.launch();

export { sendNotification };
