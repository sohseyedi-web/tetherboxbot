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

function convertToEnglishDigits(str) {
  const persianDigits = /[۰-۹]/g;
  return str.replace(persianDigits, function (d) {
    return String.fromCharCode(d.charCodeAt(0) - 1728);
  });
}

// Utility function to sort prices from highest to lowest
function sortPriceResults(results) {
  return [...results].sort((a, b) => {
    const priceStrA = convertToEnglishDigits(a.price);
    const priceStrB = convertToEnglishDigits(b.price);

    const priceA = parseInt(priceStrA.replace(/[^\d]/g, ""));
    const priceB = parseInt(priceStrB.replace(/[^\d]/g, ""));

    return priceB - priceA;
  });
}

function formatPriceMessage(results) {
  let message = "🔰 قیمت تتر:\n\n";

  // Sort the results from highest to lowest
  const sortedResults = sortPriceResults(results);

  sortedResults.forEach((result) => {
    message += `${result.name}: ${result.price}\n\n`;
  });

  return message;
}

module.exports = {
  toPersianNumbersWithComma,
  toPersianNumbers,
  fetchPrice,
  sortPriceResults,
  formatPriceMessage,
};
