import { analyzePulse } from "./services/pulseAnalyzer.js";


async function main() {

  console.log(
    "Running complete Pulse analysis...\n"
  );


  try {

    const result =
      await analyzePulse("NVDA");


    console.log(
      "========== PULSE RESULT ==========\n"
    );


    // -------------------------------
    // STOCK
    // -------------------------------

    console.log("STOCK");

    console.log(
      `Symbol: ${result.stock.symbol}`
    );

    console.log(
      `Company: ${result.stock.companyName}`
    );

    console.log(
      `Price: ${result.stock.price}`
    );

    console.log(
      `Price change: ${result.stock.priceChange.toFixed(2)}%`
    );

    console.log(
      `Volume ratio: ${result.stock.volumeRatio.toFixed(2)}x`
    );

    console.log(
      `Volatility change: ${result.stock.volatilityChange.toFixed(2)}%`
    );


    // -------------------------------
    // NEWS
    // -------------------------------

    console.log("\nNEWS");

    console.log(
      `Type: ${result.news.type}`
    );

    console.log(
      `Importance: ${result.news.importance}`
    );

    console.log(
      `Articles: ${result.news.articleCount}`
    );

    console.log(
      `Headline: ${result.news.headline ?? "None"}`
    );


    // -------------------------------
    // MEANINGFULNESS
    // -------------------------------

    console.log("\nMEANINGFULNESS");

    console.log(
      `Score: ${result.meaningfulness.score}`
    );

    console.log(
      `Severity: ${result.meaningfulness.severity}`
    );

    console.log("Reasons:");

    for (
      const reason of result.meaningfulness.reasons
    ) {

      console.log(`- ${reason}`);

    }


    // -------------------------------
    // AI
    // -------------------------------

    console.log("\nAI EXPLANATION");

    console.log(
      `Headline: ${result.explanation.headline}`
    );

    console.log(
      `Explanation: ${result.explanation.explanation}`
    );

    console.log(
      `Why it matters: ${result.explanation.whyItMatters}`
    );


    console.log(
      "\n========== TEST COMPLETE ==========\n"
    );


  } catch (error) {

    console.error(
      "\nPulse analysis failed:"
    );

    console.error(error);

  }

}


main();