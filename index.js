const { Telegraf } = require("telegraf");
require("dotenv").config();

const { onStart } = require("./app/handlers/botHandlers");
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(onStart);

// Start bot
bot.launch();
console.log("🤖 Bot is running...");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
