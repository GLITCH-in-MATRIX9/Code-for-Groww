import type { HistoricalPoint, NewsItem, Quote } from "../types";
import type { MarketDataProvider, Timeframe } from "./base";

const demoStocks = [
  { symbol: "NVDA", companyName: "NVIDIA Corporation", basePrice: 461.25, averageVolume: 52000000 },
  { symbol: "AAPL", companyName: "Apple Inc.", basePrice: 228.9, averageVolume: 61000000 },
  { symbol: "MSFT", companyName: "Microsoft Corporation", basePrice: 513.45, averageVolume: 23000000 },
  { symbol: "GOOGL", companyName: "Alphabet Inc.", basePrice: 201.3, averageVolume: 28000000 },
  { symbol: "TSLA", companyName: "Tesla, Inc.", basePrice: 341.12, averageVolume: 97000000 }
];

const demoNewsBySymbol: Record<string, NewsItem[]> = {
  NVDA: [
    {
      id: "nvda-1",
      symbol: "NVDA",
      headline: "AI chip demand remains elevated",
      summary: "Cloud providers increased AI infrastructure guidance.",
      impact: "high",
      sentimentScore: 0.78,
      source: "Finnhub (demo)",
      publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
    }
  ],
  AAPL: [
    {
      id: "aapl-1",
      symbol: "AAPL",
      headline: "Services revenue expectations lifted",
      summary: "Analysts raised services growth forecasts.",
      impact: "medium",
      sentimentScore: 0.42,
      source: "Finnhub (demo)",
      publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
    }
  ],
  MSFT: [
    {
      id: "msft-1",
      symbol: "MSFT",
      headline: "Enterprise cloud spending steady",
      summary: "Channel checks indicate resilient enterprise demand.",
      impact: "medium",
      sentimentScore: 0.31,
      source: "Finnhub (demo)",
      publishedAt: new Date(Date.now() - 1000 * 60 * 70).toISOString()
    }
  ],
  GOOGL: [
    {
      id: "googl-1",
      symbol: "GOOGL",
      headline: "Ad market momentum improves",
      summary: "Digital ad pricing trends improved sequentially.",
      impact: "medium",
      sentimentScore: 0.28,
      source: "Finnhub (demo)",
      publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
    }
  ],
  TSLA: [
    {
      id: "tsla-1",
      symbol: "TSLA",
      headline: "EV pricing pressure persists",
      summary: "Competitor discounts increased in key geographies.",
      impact: "high",
      sentimentScore: -0.45,
      source: "Finnhub (demo)",
      publishedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
    }
  ]
};

const seed = (symbol: string): number => symbol.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

const noise = (symbol: string, scale: number) => {
  const t = Math.floor(Date.now() / (1000 * 30));
  const s = seed(symbol);
  return Math.sin((t + s) / 7) * scale;
};

const toTimeframeDays = (timeframe: Timeframe): number => {
  switch (timeframe) {
    case "1D":
      return 1;
    case "1W":
      return 7;
    case "1M":
      return 30;
    case "3M":
      return 90;
    case "1Y":
      return 365;
  }
};

export class DemoProvider implements MarketDataProvider {
  async getQuotes(symbols: string[]): Promise<Quote[]> {
    return symbols
      .map((symbol) => demoStocks.find((s) => s.symbol === symbol.toUpperCase()))
      .filter((s): s is (typeof demoStocks)[number] => Boolean(s))
      .map((stock) => {
        const movePct = noise(stock.symbol, 0.018);
        const price = Number((stock.basePrice * (1 + movePct)).toFixed(2));
        const previousClose = Number((stock.basePrice * (1 + movePct * 0.4)).toFixed(2));
        const change = Number((price - previousClose).toFixed(2));
        const changePercent = Number(((change / previousClose) * 100).toFixed(2));
        const volume = Math.floor(stock.averageVolume * (1 + Math.abs(noise(stock.symbol, 1.7))));

        return {
          symbol: stock.symbol,
          companyName: stock.companyName,
          price,
          previousClose,
          change,
          changePercent,
          volume,
          averageVolume: stock.averageVolume,
          lastUpdated: new Date().toISOString()
        };
      });
  }

  async searchStocks(query: string) {
    const normalized = query.trim().toUpperCase();
    if (!normalized) {
      return demoStocks.map(({ symbol, companyName }) => ({ symbol, companyName }));
    }

    return demoStocks
      .filter((stock) => stock.symbol.includes(normalized) || stock.companyName.toUpperCase().includes(normalized))
      .map(({ symbol, companyName }) => ({ symbol, companyName }));
  }

  async getHistorical(symbol: string, timeframe: Timeframe): Promise<HistoricalPoint[]> {
    const stock = demoStocks.find((s) => s.symbol === symbol.toUpperCase());
    if (!stock) return [];
    const days = toTimeframeDays(timeframe);
    const points: HistoricalPoint[] = [];
    const now = Date.now();
    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date(now - i * 86400000);
      const drift = 1 + Math.sin((seed(symbol) + i) / 8) * 0.035;
      const close = Number((stock.basePrice * drift).toFixed(2));
      const volume = Math.floor(stock.averageVolume * (1 + Math.abs(Math.cos((seed(symbol) + i) / 5))));
      points.push({ date: date.toISOString().slice(0, 10), close, volume });
    }
    return points;
  }

  async getNews(symbol: string): Promise<NewsItem[]> {
    return demoNewsBySymbol[symbol.toUpperCase()] ?? [];
  }
}
