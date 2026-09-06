import {
  getStockNews
} from "./news/finnhub.js";

import {
  processNews
} from "./news/newsProcessor.js";

async function main() {

  console.log(
    "Processing NVIDIA news...\n"
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

    console.log(
      "========== PROCESSED NEWS ==========\n"
    );

    console.log(
      `Total articles: ${processed.length}\n`
    );

    for (
      const article of processed.slice(0, 10)
    ) {

      console.log(
        `Headline: ${article.headline}`
      );

      console.log(
        `Type: ${article.type}`
      );

      console.log(
        `Relevance: ${article.relevance}`
      );

      console.log(
        `Importance: ${article.importance}`
      );

      console.log(
        `Source: ${article.source}`
      );

      console.log(
        `Published: ` +
        `${article.publishedAt.toISOString()}`
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
      "\nNews processing failed:"
    );

    console.error(error);
  }
}

main();