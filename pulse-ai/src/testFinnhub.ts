import {
  getStockNews
} from "./news/finnhub.js";

async function main() {

  console.log(
    "Fetching NVIDIA news...\n"
  );

  try {

    const news =
      await getStockNews(
        "NVDA",
        3,
        "NVIDIA"
      );

    console.log(
      "========== FINNHUB NEWS ==========\n"
    );

    console.log(
      `Relevant articles received: ${news.length}\n`
    );

    if (news.length === 0) {

      console.log(
        "No relevant NVIDIA articles found."
      );

    } else {

      for (
        const article of news.slice(0, 5)
      ) {

        console.log(
          `Headline: ${article.headline}`
        );

        console.log(
          `Source: ${article.source}`
        );

        console.log(
          `Published: ` +
          `${article.publishedAt.toISOString()}`
        );

        console.log(
          `URL: ${article.url}`
        );

        console.log(
          `Summary: ${article.summary}`
        );

        console.log(
          "\n-------------------------\n"
        );
      }
    }

    console.log(
      "========== TEST COMPLETE ==========\n"
    );

  } catch (error) {

    console.error(
      "\nFinnhub request failed:"
    );

    console.error(error);
  }
}

main();