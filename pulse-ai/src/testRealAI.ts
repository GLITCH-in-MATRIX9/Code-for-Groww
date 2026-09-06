import { analyzeStock } from "./services/stockAnalyzer.js";
import { generatePulseExplanation } from "./aiService.js";

async function main() {

  console.log(
    "Running Pulse end-to-end AI test...\n"
  );

  try {

    // Get real Yahoo + Finnhub + Meaningfulness data
    const insight =
      await analyzeStock("NVDA");

    console.log(
      "Meaningfulness score:",
      insight.meaningfulnessScore
    );

    console.log(
      "Severity:",
      insight.severity
    );

    console.log(
      "News:",
      insight.newsHeadline ?? "None"
    );

    console.log(
      "\nGenerating Qwen explanation...\n"
    );

    const explanation =
      await generatePulseExplanation(
        insight
      );

    console.log(
      "========== PULSE AI ==========\n"
    );

    console.log(
      `Headline: ${explanation.headline}\n`
    );

    console.log(
      `Explanation: ${explanation.explanation}\n`
    );

    console.log(
      `Why it matters: ${explanation.whyItMatters}\n`
    );

    console.log(
      "========== TEST COMPLETE ==========\n"
    );

  } catch (error) {

    console.error(
      "\nEnd-to-end AI test failed:"
    );

    console.error(error);

  }
}

main();