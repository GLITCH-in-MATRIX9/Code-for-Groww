import type { ProviderGateway } from "../providers";
import type { Timeframe } from "../providers/base";
import type { GenerateInsightsResult, Insight, Quote } from "../types";
import { detectEvent } from "./events";
import { generateExplanation } from "./ai";
import { buildMeaningfulnessScore } from "./meaningfulness";
import { dedupeNews, validateQuotes } from "./validation";
import type { Store } from "../db/store";

const average = (nums: number[]) => (nums.length ? nums.reduce((sum, n) => sum + n, 0) / nums.length : 0);

const stdDev = (nums: number[]) => {
  const avg = average(nums);
  const variance = average(nums.map((n) => (n - avg) ** 2));
  return Math.sqrt(variance);
};

function findPrevious(quote: Quote, previousQuotes: Quote[]) {
  return previousQuotes.find((p) => p.symbol === quote.symbol);
}

export async function generateInsights(provider: ProviderGateway, store: Store): Promise<GenerateInsightsResult> {
  const steps = [
    { label: "Fetching market data", done: false },
    { label: "Validating data", done: false },
    { label: "Detecting events", done: false },
    { label: "Calculating meaningfulness", done: false },
    { label: "Generating explanations", done: false },
    { label: "Ranking insights", done: false }
  ];

  const watchlist = await store.getWatchlist();
  const symbols = watchlist.map((w) => w.symbol);

  const rawQuotes = await provider.getQuotes(symbols);
  steps[0].done = true;

  const { valid } = validateQuotes(rawQuotes);
  steps[1].done = true;

  const previousSnapshot = await store.getLatestSnapshot();
  const previousQuotes = previousSnapshot?.quotes ?? [];

  const sectorMoveProxy = average(valid.map((q) => q.changePercent));
  const insights: Insight[] = [];

  for (const quote of valid) {
    const previous = findPrevious(quote, previousQuotes);
    const sinceLastCheckedPercent = previous ? ((quote.price - previous.price) / previous.price) * 100 : quote.changePercent;
    const volumeRatio = quote.volume / Math.max(quote.averageVolume, 1);

    const history = await provider.getHistorical(quote.symbol, "1M");
    const latest5 = history.slice(-5).map((h) => h.close);
    const latest20 = history.slice(-20).map((h) => h.close);
    const volatilityExpansion = stdDev(latest20) === 0 ? 0 : stdDev(latest5) / stdDev(latest20);

    const relativePerformancePercent = quote.changePercent - sectorMoveProxy;

    const allNews = dedupeNews(await provider.getNews(quote.symbol));
    const topNews = allNews[0];
    const event = detectEvent(quote, allNews);
    steps[2].done = true;

    const userRelevanceRaw = await store.getUserRelevance(quote.symbol);
    const userRelevance = Math.min(10, 4 + userRelevanceRaw * 0.5);

    const scored = buildMeaningfulnessScore({
      quote,
      sinceLastCheckedPercent,
      volumeRatio,
      relativePerformancePercent,
      volatilityExpansion,
      newsImpact: Math.abs(topNews?.sentimentScore ?? 0),
      userRelevance,
      event
    });

    const insightBase: Insight = {
      id: `${quote.symbol}-${new Date().toISOString().slice(0, 16)}`,
      symbol: quote.symbol,
      companyName: quote.companyName,
      generatedAt: new Date().toISOString(),
      explanation: "",
      ...scored
    };

    insights.push(insightBase);
  }
  steps[3].done = true;

  const explained = await Promise.all(
    insights.map(async (insight) => ({
      ...insight,
      explanation: await generateExplanation(insight)
    }))
  );
  steps[4].done = true;

  const dismissed = new Set(await store.getDismissedInsightIds());
  const ranked = explained.filter((insight) => !dismissed.has(insight.id)).sort((a, b) => b.score - a.score);
  steps[5].done = true;

  await store.saveSnapshot({ createdAt: new Date().toISOString(), quotes: valid });
  await store.saveLatestInsights(ranked);

  return {
    steps,
    lastCheckedAt: previousSnapshot?.createdAt ?? null,
    generatedAt: new Date().toISOString(),
    insights: ranked
  };
}

export async function getStockDetail(provider: ProviderGateway, store: Store, symbol: string, timeframe: Timeframe) {
  const upper = symbol.toUpperCase();
  await store.trackView(upper);
  const [quote] = await provider.getQuotes([upper]);
  const historical = await provider.getHistorical(upper, timeframe);
  const news = await provider.getNews(upper);
  const latestInsights = await store.getLatestInsights();
  return {
    quote,
    historical,
    news,
    insights: latestInsights.filter((i) => i.symbol === upper)
  };
}
