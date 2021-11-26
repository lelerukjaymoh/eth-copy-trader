import { TG_USERS } from "../config/setup";

const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx: any) => {
  console.log("New User : ", ctx.message.from);

  ctx.reply("Welcome ... \n\nBot status: Active");
});

const sendNotification = async (message: any) => {
  console.log("\n\nSending Tg notification...");

  TG_USERS.forEach((chat) => {
    bot.telegram
      .sendMessage(chat, message, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      })
      .catch((error: any) => {
        console.log("Encouterd an error while sending notification");
        console.log("==============================");
        console.log(error);
      });
  });
  console.log("Done!");
};

bot.launch();

export { sendNotification };
