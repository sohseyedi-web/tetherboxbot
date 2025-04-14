const axios = require("axios");
const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toPersianNumbersWithComma(n) {
  const numWithCommas = numberWithCommas(n);
  const persianNumber = toPersianNumbers(numWithCommas);
  return persianNumber;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function toPersianNumbers(n) {
  return n.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
}

async function fetchPrice(url, name, extractPrice) {
  try {
    const { data } = await axios.get(url);
    let price = extractPrice(data);

    return {
      name,
      price: price
        ? `${toPersianNumbersWithComma(price)} تومان`
        : "قیمت پیدا نشد",
    };
  } catch (error) {
    console.error(`خطا در دریافت قیمت از ${name}:`, error.message);
    return {
      name,
      price: "خطا در دریافت",
    };
  }
}

module.exports = {
  toPersianNumbersWithComma,
  toPersianNumbers,
  fetchPrice,
};
