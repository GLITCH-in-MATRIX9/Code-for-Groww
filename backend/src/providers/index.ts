import { config } from "../config";
import type { HistoricalPoint, NewsItem, Quote } from "../types";
import type { MarketDataProvider, Timeframe } from "./base";
import { DemoProvider } from "./demoProvider";
import { LiveProvider } from "./liveProvider";

export class ProviderGateway implements MarketDataProvider {
  private demo = new DemoProvider();
  private live = new LiveProvider();

  private async withFallback<T>(action: (provider: MarketDataProvider) => Promise<T>, fallback: () => Promise<T>) {
    if (!config.useLiveData) return fallback();
    try {
      return await action(this.live);
    } catch {
      return fallback();
    }
  }

  getQuotes(symbols: string[]): Promise<Quote[]> {
    return this.withFallback((p) => p.getQuotes(symbols), () => this.demo.getQuotes(symbols));
  }

  searchStocks(query: string): Promise<Array<{ symbol: string; companyName: string }>> {
    return this.withFallback((p) => p.searchStocks(query), () => this.demo.searchStocks(query));
  }

  getHistorical(symbol: string, timeframe: Timeframe): Promise<HistoricalPoint[]> {
    return this.withFallback((p) => p.getHistorical(symbol, timeframe), () => this.demo.getHistorical(symbol, timeframe));
  }

  getNews(symbol: string): Promise<NewsItem[]> {
    return this.withFallback((p) => p.getNews(symbol), () => this.demo.getNews(symbol));
  }
}
