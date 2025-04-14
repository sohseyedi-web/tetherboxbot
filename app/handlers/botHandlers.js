
function onStart(ctx) {
  const name = ctx.from.first_name || "دوست عزیز";

  const welcomeMessage =
    `سلام ${name} 👋\n\n` +
    `به ربات ما خوش اومدی!\n` +
    `این ربات قیمت تتر رو از چند صرافی مختلف جمع آوری میکنه و برای شما نمایش میده.\n`;

  ctx.reply(welcomeMessage, {
    reply_markup: {
      keyboard: [[{ text: "قیمت تتر" }, { text: "درباره ربات" }]],
      resize_keyboard: true,
    },
  });

}

module.exports = {
  onStart,
};
