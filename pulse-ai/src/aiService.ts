import "dotenv/config";

import type { StockInsight } from "./services/stockAnalyzer.js";

const OLLAMA_URL =
  process.env.OLLAMA_URL ??
  "http://localhost:11434";

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL ??
  "qwen2.5:7b";

const AI_TIMEOUT_MS = 10_000;


export interface PulseAIResponse {
  headline: string;
  explanation: string;
  whyItMatters: string;
}


function createFallbackExplanation(
  insight: StockInsight
): PulseAIResponse {

  const direction =
    insight.priceChange >= 0
      ? "up"
      : "down";

  const reasons =
    insight.reasons.length > 0
      ? insight.reasons.join(", ")
      : "the market data showed a meaningful change";

  return {
    headline:
      `${insight.companyName} moved ${direction} ${Math.abs(insight.priceChange).toFixed(2)}%`,

    explanation:
      `${insight.companyName} moved ${Math.abs(insight.priceChange).toFixed(2)}% ${direction}, with trading volume at ${insight.volumeRatio.toFixed(2)} times its 20-day average.`,

    whyItMatters:
      `${reasons}.`
  };
}


function isValidAIResponse(
  value: unknown
): value is PulseAIResponse {

  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const response =
    value as Record<string, unknown>;

  return (
    typeof response.headline === "string" &&
    typeof response.explanation === "string" &&
    typeof response.whyItMatters === "string"
  );
}


function buildPrompt(
  insight: StockInsight
): string {

  return `
You are the explanation layer for Pulse, a smart stock watchlist.

Your job is to explain structured market data that has ALREADY been analyzed by a deterministic Meaningfulness Engine.

IMPORTANT RULES:

1. Use ONLY the information provided below.
2. Do NOT invent facts, events, causes, statistics, or news.
3. Do NOT make predictions.
4. Do NOT give investment advice.
5. Do NOT recommend buying, selling, or holding.
6. Do NOT claim that one event caused a price movement unless the input explicitly says so.
7. Do NOT calculate or modify any numbers.
8. Do NOT use the meaningfulness score or severity as evidence for why something matters.
9. The "whyItMatters" field must be based ONLY on the provided reasons.
10. News headline and summary are context only. Do not assume the news caused the stock movement.
11. If there is no meaningful news, do not invent a reason.
12. Return ONLY valid JSON.

STOCK DATA:

Symbol: ${insight.symbol}
Company: ${insight.companyName}

Price: ${insight.price}
Previous close: ${insight.previousClose}
Price change: ${insight.priceChange}%

Current volume: ${insight.volume}
20-day average volume: ${insight.averageVolume}
Volume ratio: ${insight.volumeRatio}x

Volatility change: ${insight.volatilityChange}%

News type: ${insight.newsType}
News importance: ${insight.newsImportance}
News article count: ${insight.newsArticleCount}

News headline:
${insight.newsHeadline ?? "None"}

News summary:
${insight.newsSummary ?? "None"}

News source:
${insight.newsSource ?? "None"}

Meaningfulness reasons:
${insight.reasons.length > 0
    ? insight.reasons.map(reason => `- ${reason}`).join("\n")
    : "- No major signals detected"
}

Return exactly this JSON structure:

{
  "headline": "short factual headline",
  "explanation": "short factual explanation using only the supplied information",
  "whyItMatters": "explanation based only on the supplied meaningfulness reasons"
}
`;
}


export async function generatePulseExplanation(
  insight: StockInsight
): Promise<PulseAIResponse> {

  const prompt =
    buildPrompt(insight);

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      AI_TIMEOUT_MS
    );

  const startTime =
    Date.now();

  try {

    const response =
      await fetch(
        `${OLLAMA_URL}/api/generate`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt,

            stream: false,

            format: "json"
          }),

          signal:
            controller.signal
        }
      );

    if (!response.ok) {
      throw new Error(
        `Ollama request failed with status ${response.status}`
      );
    }

    const data =
      await response.json() as {
        response?: string;
      };

    if (
      typeof data.response !== "string"
    ) {
      throw new Error(
        "Ollama returned an unexpected response."
      );
    }

    const parsed: unknown =
      JSON.parse(data.response);

    if (!isValidAIResponse(parsed)) {
      throw new Error(
        "Ollama returned invalid Pulse response format."
      );
    }

    console.log(
      `AI response time: ${Date.now() - startTime} ms`
    );

    return parsed;

  } catch (error) {

    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      console.warn(
        `Qwen request timed out after ${AI_TIMEOUT_MS / 1000} seconds.`
      );
    } else {
      console.warn(
        "Qwen explanation failed. Using deterministic fallback."
      );
    }

    return createFallbackExplanation(
      insight
    );

  } finally {

    clearTimeout(timeout);

  }
}