import type { DetectedEvent, Insight, Quote, ScoreBreakdown } from "../types";

type BuildScoreInput = {
  quote: Quote;
  sinceLastCheckedPercent: number;
  volumeRatio: number;
  relativePerformancePercent: number;
  volatilityExpansion: number;
  newsImpact: number;
  userRelevance: number;
  event?: DetectedEvent;
};

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export function buildMeaningfulnessScore(input: BuildScoreInput): Omit<Insight, "id" | "symbol" | "companyName" | "generatedAt" | "explanation"> {
  const priceMovement = Math.round(clamp(Math.abs(input.sinceLastCheckedPercent) * 7, 0, 25));
  const volumeAnomaly = Math.round(clamp((input.volumeRatio - 1) * 16, 0, 20));
  const volatilityExpansion = Math.round(clamp(input.volatilityExpansion * 12, 0, 15));
  const relativePerformance = Math.round(clamp(Math.abs(input.relativePerformancePercent) * 4.5, 0, 15));
  const eventImportance = Math.round(clamp(input.event?.importance ?? 0, 0, 15));
  const newsImpact = Math.round(clamp(input.newsImpact * 15, 0, 10));
  const userRelevance = Math.round(clamp(input.userRelevance, 0, 10));

  const breakdown: ScoreBreakdown = {
    priceMovement,
    volumeAnomaly,
    volatilityExpansion,
    relativePerformance,
    eventImportance,
    newsImpact,
    userRelevance
  };

  const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0);

  const severity = score >= 75 ? "critical" : score >= 55 ? "high" : score >= 35 ? "medium" : "low";

  return {
    score,
    severity,
    breakdown,
    event: input.event,
    metrics: {
      priceChangePercent: input.quote.changePercent,
      sinceLastCheckedPercent: Number(input.sinceLastCheckedPercent.toFixed(2)),
      volumeRatio: Number(input.volumeRatio.toFixed(2)),
      relativePerformancePercent: Number(input.relativePerformancePercent.toFixed(2)),
      volatilityExpansion: Number(input.volatilityExpansion.toFixed(2))
    }
  };
}
