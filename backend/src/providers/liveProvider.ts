import { config } from "../config";
import type { HistoricalPoint, NewsItem, Quote } from "../types";
import type { MarketDataProvider, Timeframe } from "./base";

const timeframeToRange: Record<Timeframe, string> = {
  "1D": "1d",
  "1W": "7d",
  "1M": "1mo",
  "3M": "3mo",
  "1Y": "1y"
};

export class LiveProvider implements MarketDataProvider {
  async getQuotes(symbols: string[]): Promise<Quote[]> {
    if (!symbols.length) return [];
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Yahoo quote fetch failed");
    const json = await response.json();
    const items = json?.quoteResponse?.result ?? [];
    return items.map((item: any) => ({
      symbol: item.symbol,
      companyName: item.longName ?? item.shortName ?? item.symbol,
      price: Number(item.regularMarketPrice ?? 0),
      previousClose: Number(item.regularMarketPreviousClose ?? item.regularMarketPrice ?? 0),
      change: Number(item.regularMarketChange ?? 0),
      changePercent: Number(item.regularMarketChangePercent ?? 0),
      volume: Number(item.regularMarketVolume ?? 0),
      averageVolume: Number(item.averageDailyVolume3Month ?? item.regularMarketVolume ?? 1),
      lastUpdated: new Date(Number(item.regularMarketTime ?? Date.now()) * 1000).toISOString()
    }));
  }

  async searchStocks(query: string) {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Yahoo search failed");
    const json = await response.json();
    const quotes = json?.quotes ?? [];
    return quotes
      .filter((q: any) => q.symbol && q.shortname)
      .map((q: any) => ({ symbol: q.symbol, companyName: q.shortname }));
  }

  async getHistorical(symbol: string, timeframe: Timeframe): Promise<HistoricalPoint[]> {
    const range = timeframeToRange[timeframe];
    const interval = timeframe === "1D" ? "5m" : "1d";
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Yahoo historical fetch failed");
    const json = await response.json();
    const result = json?.chart?.result?.[0];
    if (!result?.timestamp?.length) return [];

    const closes = result.indicators?.quote?.[0]?.close ?? [];
    const volumes = result.indicators?.quote?.[0]?.volume ?? [];
    return result.timestamp
      .map((ts: number, idx: number) => {
        const close = closes[idx];
        if (close == null) return null;
        return {
          date: new Date(ts * 1000).toISOString().slice(0, 10),
          close: Number(close.toFixed(2)),
          volume: Number(volumes[idx] ?? 0)
        } satisfies HistoricalPoint;
      })
      .filter((p: HistoricalPoint | null): p is HistoricalPoint => Boolean(p));
  }

  async getNews(symbol: string): Promise<NewsItem[]> {
    if (!config.finnhubApiKey) return [];
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 86400000 * 4).toISOString().slice(0, 10);
    const url = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}&token=${config.finnhubApiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Finnhub news fetch failed");
    const json = await response.json();

    return (json ?? []).slice(0, 8).map((item: any) => {
      const sentiment = typeof item.sentiment === "number" ? item.sentiment : 0;
      const abs = Math.abs(sentiment);
      return {
        id: `${symbol}-${item.id ?? item.datetime}`,
        symbol,
        headline: item.headline ?? "Market update",
        summary: item.summary ?? "",
        impact: abs > 0.6 ? "high" : abs > 0.3 ? "medium" : "low",
        sentimentScore: sentiment,
        source: item.source ?? "Finnhub",
        publishedAt: new Date((item.datetime ?? Date.now() / 1000) * 1000).toISOString()
      } satisfies NewsItem;
    });
  }
}
