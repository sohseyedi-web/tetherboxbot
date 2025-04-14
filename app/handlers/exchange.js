const { fetchPrice } = require("../utils/functions");

async function getNobitex() {
  return fetchPrice(process.env.API_NOBITEX, "نوبیتکس", (data) =>
    data?.lastTradePrice?.slice(0, -1)
  );
}

async function getWallex() {
  return fetchPrice(process.env.API_WALLEX, "والکس", (data) =>
    data?.result?.symbols?.USDTTMN?.stats?.lastPrice?.slice(0, 5)
  );
}

async function getTetherLand() {
  return fetchPrice(
    process.env.API_TETHERLAND,
    "تترلند",
    (data) => data?.data?.currencies?.USDT?.price
  );
}

async function getExir() {
  return fetchPrice(
    `${process.env.API_EXIR}?symbol=usdt-irt`,
    "اکسیر",
    (data) => data?.last
  );
}

async function getBitPin() {
  return fetchPrice(
    "https://api.bitpin.ir/api/v1/mth/matches/USDT_IRT/",
    "بیت پین",
    (data) => data[0]?.price?.slice(0, 5)
  );
}
async function getRamzinex() {
  return fetchPrice(
    "https://publicapi.ramzinex.com/exchange/api/v1.0/exchange/pairs/11",
    "رمزینکس",
    (data) => data?.data?.buy?.toString().slice(0, -1)
  );
}

module.exports = {
  getNobitex,
  getWallex,
  getTetherLand,
  getExir,
  getBitPin,
  getRamzinex,
};
