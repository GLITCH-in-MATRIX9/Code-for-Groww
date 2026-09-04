import type { DetectedEvent, NewsItem, Quote } from "../types";

export function detectEvent(quote: Quote, news: NewsItem[]): DetectedEvent | undefined {
  const topNews = [...news].sort((a, b) => Math.abs(b.sentimentScore) - Math.abs(a.sentimentScore))[0];
  const volumeRatio = quote.volume / Math.max(quote.averageVolume, 1);

  if (topNews) {
    const impactBase = topNews.impact === "high" ? 14 : topNews.impact === "medium" ? 9 : 5;
    const sentimentBoost = Math.round(Math.abs(topNews.sentimentScore) * 6);
    return {
      summary: topNews.headline,
      importance: Math.min(20, impactBase + sentimentBoost),
      type: "news"
    };
  }

  if (Math.abs(quote.changePercent) > 2.5) {
    return {
      summary: `${quote.symbol} moved ${quote.changePercent.toFixed(2)}% intraday.`,
      importance: 10,
      type: "price"
    };
  }

  if (volumeRatio > 1.8) {
    return {
      summary: `${quote.symbol} traded on ${volumeRatio.toFixed(2)}x average volume.`,
      importance: 11,
      type: "volume"
    };
  }

  return undefined;
}
