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

export type NewsItem = {
  id: string;
  symbol: string;
  headline: string;
  summary: string;
  impact: "low" | "medium" | "high";
  sentimentScore: number;
  source: string;
  publishedAt: string;
};

export type HistoricalPoint = {
  date: string;
  close: number;
  volume: number;
};

export type DetectedEvent = {
  summary: string;
  importance: number;
  type: "news" | "volume" | "volatility" | "price";
};

export type ScoreBreakdown = {
  priceMovement: number;
  volumeAnomaly: number;
  volatilityExpansion: number;
  relativePerformance: number;
  eventImportance: number;
  newsImpact: number;
  userRelevance: number;
};

export type Insight = {
  id: string;
  symbol: string;
  companyName: string;
  score: number;
  severity: "critical" | "high" | "medium" | "low";
  explanation: string;
  breakdown: ScoreBreakdown;
  metrics: {
    priceChangePercent: number;
    sinceLastCheckedPercent: number;
    volumeRatio: number;
    relativePerformancePercent: number;
    volatilityExpansion: number;
  };
  event?: DetectedEvent;
  generatedAt: string;
};

export type Snapshot = {
  createdAt: string;
  quotes: Quote[];
};

export type GenerateInsightsResult = {
  steps: { label: string; done: boolean }[];
  lastCheckedAt: string | null;
  generatedAt: string;
  insights: Insight[];
};
