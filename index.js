const { Telegraf } = require("telegraf");
require("dotenv").config();

const { onStart, onPrice, onHelp } = require("./app/handlers/botHandlers");
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(onStart);
bot.hears("قیمت تتر", onPrice);
bot.command("help", onHelp);
bot.command("price", onPrice);
bot.hears("درباره ربات", onHelp);

// Start bot
bot.launch();
console.log("🤖 Bot is running...");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
