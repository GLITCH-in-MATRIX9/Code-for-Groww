import {
  getStockNews
} from "./news/finnhub.js";

import {
  processNews
} from "./news/newsProcessor.js";

import {
  aggregateNews
} from "./news/newsAggregator.js";

import {
  calculateNewsSignal
} from "./news/newsSignal.js";

async function main() {

  console.log(
    "Calculating NVIDIA news signal...\n"
  );

  try {

    const news =
      await getStockNews(
        "NVDA",
        3,
        "NVIDIA"
      );

    const processed =
      processNews(
        news,
        "NVDA",
        "NVIDIA"
      );

    const events =
      aggregateNews(
        processed
      );

    const signal =
      calculateNewsSignal(
        processed,
        events
      );

    console.log(
      "========== NEWS SIGNAL ==========\n"
    );

    console.log(
      `Has news: ${signal.hasNews}`
    );

    console.log(
      `Importance: ${signal.importance}`
    );

    console.log(
      `Strongest type: ${signal.strongestType}`
    );

    console.log(
      `Articles covering story: ` +
      `${signal.articleCount}`
    );

    console.log(
      `\nHeadline: ${signal.headline ?? "None"}`
    );

    console.log(
      `\nSummary: ${signal.summary ?? "None"}`
    );

    console.log("\nReasons:");

    for (
      const reason of signal.reasons
    ) {
      console.log(`- ${reason}`);
    }

    console.log(
      "\n========== TEST COMPLETE ==========\n"
    );

  } catch (error) {

    console.error(
      "\nNews signal calculation failed:"
    );

    console.error(error);
  }
}

main();