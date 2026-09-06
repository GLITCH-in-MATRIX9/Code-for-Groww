import { getStockQuote } from "./marketData/yahooFinance.js";

async function main() {
  console.log("Fetching NVIDIA data from Yahoo Finance...\n");

  try {
    const quote = await getStockQuote("NVDA");

    console.log("========== YAHOO FINANCE RESULT ==========\n");

    console.log("Symbol:");
    console.log(quote.symbol);

    console.log("\nCompany:");
    console.log(quote.companyName);

    console.log("\nCurrent Price:");
    console.log(quote.price);

    console.log("\nPrevious Close:");
    console.log(quote.previousClose);

    console.log("\nPrice Change:");
    console.log(`${quote.priceChange.toFixed(2)}%`);

    console.log("\nVolume:");
    console.log(quote.volume);

    console.log("\nAverage Volume:");
    console.log(quote.averageVolume);

    console.log("\n========== TEST COMPLETE ==========\n");

  } catch (error) {
    console.error("\nYahoo Finance request failed:");
    console.error(error);
  }
}

main();