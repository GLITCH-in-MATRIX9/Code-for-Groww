import type { HistoricalPoint, NewsItem, Quote } from "../types";

export type Timeframe = "1D" | "1W" | "1M" | "3M" | "1Y";

export interface MarketDataProvider {
  getQuotes(symbols: string[]): Promise<Quote[]>;
  searchStocks(query: string): Promise<Array<{ symbol: string; companyName: string }>>;
  getHistorical(symbol: string, timeframe: Timeframe): Promise<HistoricalPoint[]>;
  getNews(symbol: string): Promise<NewsItem[]>;
}
