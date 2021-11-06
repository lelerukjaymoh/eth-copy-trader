const { Telegraf } = require("telegraf");

if (!process.env.CHAT_ID) {
  throw new Error("CHAT_ID was not provided in .env file");
}

const chatIDs = ["584173555", process.env.CHAT_ID];

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx: any) => {
  console.log("New User : ", ctx.message.from);

  ctx.reply("Welcome ... \n\nBot status: Active");
});

const sendNotification = async (message: any) => {
  console.log("\n\nSending Tg notification...");

  chatIDs.forEach((chat) => {
    bot.telegram
      .sendMessage(chat, message, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      })
      .catch((error: any) => {
        console.log("Encouterd an error while sending notification to ", chat);
        console.log("==============================");
        console.log(error);
      });
  });
  console.log("Done!");
};

bot.launch();

export { sendNotification };
