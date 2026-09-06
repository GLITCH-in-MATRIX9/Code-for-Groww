import {
  getHistoricalMarketData
} from "./marketData/yahooFinance.js";

import {
  calculateAverageVolume,
  calculateVolumeRatio,
  calculateVolatility,
  calculateVolatilityChange
} from "./marketData/marketMetrics.js";

async function main() {

  console.log(
    "Calculating NVIDIA market metrics...\n"
  );

  try {

    const history =
      await getHistoricalMarketData(
        "NVDA",
        60
      );

    if (history.length < 25) {
      throw new Error(
        `Not enough historical data. ` +
        `Received ${history.length} records.`
      );
    }

    const currentVolume =
      history[history.length - 1].volume;

    const averageVolume =
      calculateAverageVolume(
        history.slice(0, -1),
        20
      );

    const volumeRatio =
      calculateVolumeRatio(
        currentVolume,
        averageVolume
      );

    const volatility =
      calculateVolatility(
        history.slice(-21)
      );

    const volatilityChange =
      calculateVolatilityChange(
        history
      );

    console.log(
      "========== MARKET METRICS ==========\n"
    );

    console.log(
      `Historical records: ${history.length}`
    );

    console.log(
      `\nCurrent volume: ${currentVolume}`
    );

    console.log(
      `20-day average volume: ` +
      `${averageVolume.toFixed(0)}`
    );

    console.log(
      `\nVolume ratio: ` +
      `${volumeRatio.toFixed(2)}x`
    );

    console.log(
      `\nRecent volatility: ` +
      `${volatility.toFixed(2)}%`
    );

    console.log(
      `Volatility change: ` +
      `${volatilityChange.toFixed(2)}%`
    );

    console.log(
      "\n========== TEST COMPLETE ==========\n"
    );

  } catch (error) {

    console.error(
      "\nMarket metrics calculation failed:"
    );

    console.error(error);
  }
}

main();