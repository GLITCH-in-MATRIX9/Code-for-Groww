export type Quote = {
  symbol: string;
  companyName: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  averageVolume: number;
  lastUpdated: string;
};

export type WatchlistItem = {
  symbol: string;
  companyName: string;
  quote: Quote | null;
};

export type Insight = {
  id: string;
  symbol: string;
  companyName: string;
  score: number;
  severity: "critical" | "high" | "medium" | "low";
  explanation: string;
  breakdown: {
    priceMovement: number;
    volumeAnomaly: number;
    volatilityExpansion: number;
    relativePerformance: number;
    eventImportance: number;
    newsImpact: number;
    userRelevance: number;
  };
  metrics: {
    priceChangePercent: number;
    sinceLastCheckedPercent: number;
    volumeRatio: number;
    relativePerformancePercent: number;
    volatilityExpansion: number;
  };
  event?: {
    summary: string;
    importance: number;
    type: "news" | "volume" | "volatility" | "price";
  };
  generatedAt: string;
};

export type StockDetail = {
  quote: Quote;
  historical: Array<{ date: string; close: number; volume: number }>;
  news: Array<{
    id: string;
    headline: string;
    summary: string;
    source: string;
    impact: "low" | "medium" | "high";
    publishedAt: string;
  }>;
  insights: Insight[];
};

export type GenerateResult = {
  steps: { label: string; done: boolean }[];
  lastCheckedAt: string | null;
  generatedAt: string;
  insights: Insight[];
};
