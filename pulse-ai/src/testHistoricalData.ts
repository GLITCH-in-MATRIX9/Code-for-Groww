import {
  getHistoricalMarketData
} from "./marketData/yahooFinance.js";

async function main() {

  console.log(
    "Fetching NVIDIA historical data...\n"
  );

  try {

    const history =
      await getHistoricalMarketData("NVDA", 30);

    console.log(
      "========== HISTORICAL DATA ==========\n"
    );

    console.log(
      `Records received: ${history.length}\n`
    );

    for (const day of history.slice(-10)) {

      console.log(
        `${day.date.toISOString().slice(0, 10)} | ` +
        `Close: ${day.close} | ` +
        `Volume: ${day.volume}`
      );
    }

    console.log(
      "\n========== TEST COMPLETE ==========\n"
    );

  } catch (error) {

    console.error(
      "\nYahoo historical data request failed:"
    );

    console.error(error);
  }
}

main();