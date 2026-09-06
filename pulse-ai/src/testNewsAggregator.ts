import {
  getStockNews
} from "./news/finnhub.js";

import {
  processNews
} from "./news/newsProcessor.js";

import {
  aggregateNews
} from "./news/newsAggregator.js";

async function main() {

  console.log(
    "Aggregating NVIDIA news...\n"
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

    console.log(
      "========== NEWS AGGREGATION ==========\n"
    );

    console.log(
      `Raw articles: ${news.length}`
    );

    console.log(
      `Processed articles: ${processed.length}`
    );

    console.log(
      `High-relevance events: ${events.length}\n`
    );

    for (
      const event of events.slice(0, 10)
    ) {

      console.log(
        `Headline: ${event.headline}`
      );

      console.log(
        `Type: ${event.type}`
      );

      console.log(
        `Importance: ${event.importance}`
      );

      console.log(
        `Articles covering story: ` +
        `${event.articleCount}`
      );

      console.log(
        `Published: ` +
        `${event.publishedAt.toISOString()}`
      );

      console.log(
        "\n-------------------------\n"
      );
    }

    console.log(
      "========== TEST COMPLETE ==========\n"
    );

  } catch (error) {

    console.error(
      "\nNews aggregation failed:"
    );

    console.error(error);
  }
}

main();