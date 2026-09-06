import {
  calculateMeaningfulness
} from "./engine/meaningfulnessEngine.js";

function main() {

  console.log(
    "Testing Pulse Meaningfulness Engine...\n"
  );

  const result =
    calculateMeaningfulness({
      symbol: "NVDA",
      companyName: "NVIDIA",

      priceChange: 3.2,

      volumeRatio: 2.5,

      volatilityChange: 18,

      sectorPerformance: 0.4
    });

  console.log(
    "========== MEANINGFULNESS RESULT ==========\n"
  );

  console.log(
    `Score: ${result.score}`
  );

  console.log(
    `Severity: ${result.severity}`
  );

  console.log("\nReasons:");

  for (const reason of result.reasons) {
    console.log(`- ${reason}`);
  }

  console.log(
    "\n========== TEST COMPLETE ==========\n"
  );
}

main();