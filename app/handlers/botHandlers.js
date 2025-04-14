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

// User subscriptions
const userSubscriptions = new Map();

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
        message += `${result.name}: ${result.price}\n\n`;
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

// Function to send notifications to subscribed users
async function sendNotificationsToUsers(bot) {
  const now = Date.now();

  for (const [userId, subscription] of userSubscriptions.entries()) {
    try {
      // Check if it's time to send a notification
      if (now - subscription.lastNotification >= subscription.interval) {
        // Get message with time info
        const minutesAgo = Math.floor((now - priceCache.lastUpdated) / 60000);
        const messageWithTime = `${priceCache.data}\n\n🕒 بروزرسانی ${minutesAgo} دقیقه پیش`;

        // Send the price update
        await bot.telegram.sendMessage(userId, messageWithTime);

        // Update the last notification time
        subscription.lastNotification = now;
        userSubscriptions.set(userId, subscription);

        console.log(`Sent scheduled price notification to user ${userId}`);
      }
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
    }
  }
}

// Initialize cache on startup
updatePriceCache();

// Set up periodic update every 5 minutes
setInterval(updatePriceCache, UPDATE_INTERVAL);

// Check for notifications to send every minute
function setupNotificationSystem(bot) {
  setInterval(() => {
    sendNotificationsToUsers(bot);
  }, 60 * 1000); // Every minute
}

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
  // Check if user has active subscription
  const hasActiveSubscription = userSubscriptions.has(ctx.from.id);

  // If cache is valid (has data and is less than 5 minutes old)
  if (
    priceCache.data &&
    Date.now() - priceCache.lastUpdated < UPDATE_INTERVAL
  ) {
    const minutesAgo = Math.floor(
      (Date.now() - priceCache.lastUpdated) / 60000
    );

    const messageWithTime = `${priceCache.data}\n\n🕒 بروزرسانی ${minutesAgo} دقیقه پیش`;

    // Different keyboard based on whether user has active subscription
    let keyboard;
    if (hasActiveSubscription) {
      keyboard = [[{ text: "بازگشت" }, { text: "لغو دریافت خودکار" }]];
    } else {
      keyboard = [[{ text: "بازگشت" }, { text: "دریافت خودکار قیمت" }]];
    }

    return ctx.reply(messageWithTime, {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
      },
    });
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

      // Different keyboard based on whether user has active subscription
      let keyboard;
      if (hasActiveSubscription) {
        keyboard = [[{ text: "بازگشت" }, { text: "لغو دریافت خودکار" }]];
      } else {
        keyboard = [[{ text: "بازگشت" }, { text: "دریافت خودکار قیمت" }]];
      }

      return ctx.reply(priceCache.data, {
        reply_markup: {
          keyboard: keyboard,
          resize_keyboard: true,
        },
      });
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
      message += `${result.name}: ${result.price}\n\n`;
    });

    await ctx.deleteMessage(waitingMessage.message_id);

    // Different keyboard based on whether user has active subscription
    let keyboard;
    if (hasActiveSubscription) {
      keyboard = [[{ text: "بازگشت" }, { text: "لغو دریافت خودکار" }]];
    } else {
      keyboard = [[{ text: "بازگشت" }, { text: "دریافت خودکار قیمت" }]];
    }

    ctx.reply(message, {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
      },
    });
  } catch (error) {
    console.error("خطا در دریافت قیمت:", error);
    await ctx.deleteMessage(waitingMessage.message_id);
    ctx.reply("خطا در دریافت قیمت");
  }
}

// Handler for auto notification setup
function onSubscribe(ctx) {
  ctx.reply(
    "📊 دریافت خودکار قیمت تتر\n\n" +
      "لطفا فاصله زمانی دریافت خودکار قیمت تتر را به ساعت وارد کنید.\n" +
      "برای مثال: عدد 2 برای دریافت هر 2 ساعت یکبار\n\n" +
      "توجه: حداقل فاصله زمانی 1 ساعت است.",
    {
      reply_markup: {
        keyboard: [
          [
            { text: "2" },
            { text: "3" },
            { text: "6" },
            { text: "12" },
            { text: "24" },
          ],
          [{ text: "بازگشت" }],
        ],
        resize_keyboard: true,
      },
    }
  );
}

// Handler for setting interval hours
function onSetInterval(ctx) {
  const text = ctx.message.text;

  // Check if the input is a valid number
  const hours = parseInt(text);

  if (isNaN(hours) || hours < 1) {
    return ctx.reply("⚠️ لطفا یک عدد بزرگتر از 1 وارد کنید.", {
      reply_markup: {
        keyboard: [
          [
            { text: "2" },
            { text: "3" },
            { text: "6" },
            { text: "12" },
            { text: "24" },
          ],
          [{ text: "بازگشت" }],
        ],
        resize_keyboard: true,
      },
    });
  }

  // Convert hours to milliseconds
  const interval = hours * 60 * 60 * 1000;

  // Add or update user subscription
  userSubscriptions.set(ctx.from.id, {
    interval,
    lastNotification: Date.now(),
  });

  ctx.reply(
    `✅ دریافت خودکار قیمت تتر هر ${hours} ساعت برای شما فعال شد.\n\n` +
      "پیام‌های قیمت به صورت خودکار برای شما ارسال خواهند شد.",
    {
      reply_markup: {
        keyboard: [[{ text: "درباره ربات" }, { text: "قیمت تتر" }]],
        resize_keyboard: true,
      },
    }
  );
}

// Handler for returning to main menu
function onReturn(ctx) {
  ctx.reply("بازگشت به منوی اصلی", {
    reply_markup: {
      keyboard: [[{ text: "درباره ربات" }, { text: "قیمت تتر" }]],
      resize_keyboard: true,
    },
  });
}

// Handler for canceling subscription
function onCancelSubscription(ctx) {
  const userId = ctx.from.id;

  if (userSubscriptions.has(userId)) {
    userSubscriptions.delete(userId);
    ctx.reply("✅ دریافت خودکار قیمت تتر برای شما غیرفعال شد.", {
      reply_markup: {
        keyboard: [[{ text: "درباره ربات" }, { text: "قیمت تتر" }]],
        resize_keyboard: true,
      },
    });
  } else {
    ctx.reply("در حال حاضر ربات برای شما قیمتی ارسال نمیکند", {
      reply_markup: {
        keyboard: [[{ text: "درباره ربات" }, { text: "قیمت تتر" }]],
        resize_keyboard: true,
      },
    });
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

🔔 <b>دریافت خودکار قیمت:</b>
• می‌توانید با انتخاب گزینه "دریافت خودکار قیمت" پس از دیدن قیمت‌ها، تنظیم کنید که هر چند ساعت یکبار قیمت‌های جدید برای شما ارسال شوند.
• حداقل فاصله زمانی ارسال خودکار قیمت‌ها 1 ساعت است.
• برای لغو دریافت خودکار، گزینه "لغو دریافت خودکار" را پس از دریافت قیمت تتر انتخاب کنید.

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
  onSubscribe,
  onSetInterval,
  onReturn,
  setupNotificationSystem,
  onCancelSubscription,
};
