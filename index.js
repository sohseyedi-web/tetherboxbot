const { Telegraf } = require("telegraf");
require("dotenv").config();

const {
  onStart,
  onPrice,
  onHelp,
  onSubscribe,
  onSetInterval,
  onReturn,
  setupNotificationSystem,
  onCancelSubscription,
} = require("./app/handlers/botHandlers");

const bot = new Telegraf(process.env.BOT_TOKEN);

// Main commands
bot.start(onStart);
bot.hears("قیمت تتر", onPrice);
bot.command("help", onHelp);
bot.command("price", onPrice);
bot.hears("درباره ربات", onHelp);

// Subscription commands
bot.hears("دریافت خودکار قیمت", onSubscribe);
bot.hears("لغو دریافت خودکار", onCancelSubscription);
bot.hears("بازگشت", onReturn);

// Handle interval input (any number or predefined buttons)
bot.hears(/^[0-9]+$/, onSetInterval);

// Setup the notification system
setupNotificationSystem(bot);

// Start bot
bot.launch();
console.log("🤖 Bot is running...");
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
