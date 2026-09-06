import { analyzeStock } from "./services/stockAnalyzer.js";

async function main() {
  console.log("Analyzing NVIDIA with Pulse...\n");

  try {
    const insight = await analyzeStock("NVDA");

    console.log(
      "========== PULSE STOCK ANALYSIS ==========\n"
    );

    console.log(`Symbol: ${insight.symbol}`);
    console.log(`Company: ${insight.companyName}\n`);

    console.log(`Price: ${insight.price.toFixed(2)}`);
    console.log(
      `Previous close: ${insight.previousClose.toFixed(2)}`
    );
    console.log(
      `Price change: ${insight.priceChange.toFixed(2)}%\n`
    );

    console.log(
      `Current volume: ${insight.volume}`
    );

    console.log(
      `20-day average volume: ${Math.round(
        insight.averageVolume
      )}`
    );

    console.log(
      `Volume ratio: ${insight.volumeRatio.toFixed(2)}x\n`
    );

    console.log(
      `Volatility change: ${insight.volatilityChange.toFixed(2)}%\n`
    );

    // -------------------------------
    // NEWS
    // -------------------------------

    console.log("---------- NEWS SIGNAL ----------\n");

    console.log(
      `News importance: ${insight.newsImportance}`
    );

    console.log(
      `News type: ${insight.newsType}`
    );

    console.log(
      `Articles covering story: ${insight.newsArticleCount}`
    );

    console.log(
      `Headline: ${insight.newsHeadline ?? "None"}`
    );

    console.log(
      `Source: ${insight.newsSource ?? "None"}`
    );

    console.log(
      `URL: ${insight.newsUrl ?? "None"}\n`
    );

    // -------------------------------
    // FINAL SCORE
    // -------------------------------

    console.log(
      "---------- MEANINGFULNESS ----------\n"
    );

    console.log(
      `Meaningfulness score: ${insight.meaningfulnessScore}`
    );

    console.log(
      `Severity: ${insight.severity}\n`
    );

    console.log("Reasons:");

    for (const reason of insight.reasons) {
      console.log(`- ${reason}`);
    }

    console.log(
      "\n========== TEST COMPLETE ==========\n"
    );

  } catch (error) {
    console.error(
      "\nStock analysis failed:"
    );

    console.error(error);
  }
}

main();