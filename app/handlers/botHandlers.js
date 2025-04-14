const {
  getTetherLand,
  getNobitex,
  getWallex,
  getExir,
  getBitPin,
  getRamzinex,
} = require("./exchange");

// Cache storage
let priceCache = {
  data: null,
  lastUpdated: 0,
};

// Update interval in milliseconds (5 minutes)
const UPDATE_INTERVAL = 5 * 60 * 1000;

// Function to fetch and update the cache
async function updatePriceCache() {
  try {
    console.log("Updating price cache...");
    const results = await Promise.allSettled([
      getTetherLand(),
      getNobitex(),
      getWallex(),
      getExir(),
      getBitPin(),
      getRamzinex(),
    ]);

    const successfulResults = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    if (successfulResults.length > 0) {
      let message = "🔰 قیمت تتر امروز:\n\n";
      successfulResults.forEach((result) => {
        message += `${result.name}: ${result.price}\n`;
      });

      // Update cache
      priceCache.data = message;
      priceCache.lastUpdated = Date.now();
      console.log("Price cache updated successfully");
    }
  } catch (error) {
    console.error("Error updating price cache:", error);
  }
}

// Initialize cache on startup
updatePriceCache();

// Set up periodic update every 5 minutes
setInterval(updatePriceCache, UPDATE_INTERVAL);

function onStart(ctx) {
  const name = ctx.from.first_name || "دوست عزیز";

  const welcomeMessage =
    `سلام ${name} 👋\n\n` +
    `به ربات ما خوش اومدی!\n` +
    `این ربات قیمت تتر رو از چند صرافی مختلف جمع آوری میکنه و برای شما نمایش میده.\n`;

  ctx.reply(welcomeMessage, {
    reply_markup: {
      keyboard: [[{ text: "درباره ربات" }, { text: "قیمت تتر" }]],
      resize_keyboard: true,
    },
  });
}

async function onPrice(ctx) {
  // If cache is valid (has data and is less than 5 minutes old)
  if (
    priceCache.data &&
    Date.now() - priceCache.lastUpdated < UPDATE_INTERVAL
  ) {
    const minutesAgo = Math.floor(
      (Date.now() - priceCache.lastUpdated) / 60000
    );

    const messageWithTime = `${priceCache.data}\n\n🕒 بروزرسانی ${minutesAgo} دقیقه پیش`;

    return ctx.reply(messageWithTime);
  }

  // If cache is invalid or expired, show waiting message and update
  const waitingMessage = await ctx.reply("لطفا صبر کنید...");

  try {
    // If cache doesn't exist yet, fetch it
    if (!priceCache.data) {
      await updatePriceCache();
    }

    // If we have cache data after update, use it
    if (priceCache.data) {
      await ctx.deleteMessage(waitingMessage.message_id);
      return ctx.reply(priceCache.data);
    }

    // If we still don't have cache data, fetch directly
    const results = await Promise.allSettled([
      getTetherLand(),
      getNobitex(),
      getExir(),
      getBitPin(),
      getRamzinex(),
      getWallex(),
    ]);

    const successfulResults = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    if (successfulResults.length === 0) {
      await ctx.deleteMessage(waitingMessage.message_id);
      return ctx.reply("متأسفانه دریافت قیمت‌ها با خطا مواجه شد.");
    }

    let message = "🔰 قیمت تتر امروز:\n\n";
    successfulResults.forEach((result) => {
      message += `${result.name}: ${result.price}\n`;
    });

    await ctx.deleteMessage(waitingMessage.message_id);
    ctx.reply(message);
  } catch (error) {
    console.error("خطا در دریافت قیمت:", error);
    await ctx.deleteMessage(waitingMessage.message_id);
    ctx.reply("خطا در دریافت قیمت");
  }
}

function onHelp(ctx) {
  const helpMessage = `
🤖 <b>راهنمای ربات تترباکس</b>

این ربات برای نمایش قیمت لحظه‌ای تتر در صرافی‌های معتبر ایرانی ساخته شده.

📈 <b>ویژگی‌ها:</b>
• دریافت قیمت تتر از چندین صرافی ایرانی:
  - تترلند
  - نوبیتکس
  - والکس
  - اکسیر
  - بیت پین
  - رمزینکس
  - و به‌زودی بقیه صرافی‌ها...

⏱ <b>زمان بروزرسانی:</b>
• قیمت‌ها هر ۵ دقیقه یک‌بار بروزرسانی می‌شوند.
• در صورتی که قیمت‌ها از کش (Cache) خوانده شوند، ربات به شما اطلاع می‌دهد که آخرین بروزرسانی چند دقیقه پیش انجام شده است.

🧭 <b>دستورات قابل استفاده:</b>
• <b>قیمت تتر</b> — دریافت آخرین قیمت تتر از چند صرافی
• <b>درباره ربات</b> — اطلاعاتی درباره عملکرد ربات

💬 برای استفاده، کافیست از دکمه‌های پایین صفحه استفاده کنید یا یکی از دستورات بالا را ارسال نمایید.

  `;

  ctx.reply(helpMessage, { parse_mode: "HTML" });
}

module.exports = {
  onStart,
  onPrice,
  onHelp,
};
