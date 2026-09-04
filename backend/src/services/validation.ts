import { z } from "zod";
import type { NewsItem, Quote } from "../types";

const quoteSchema = z.object({
  symbol: z.string().min(1),
  companyName: z.string().min(1),
  price: z.number().positive().max(100000),
  previousClose: z.number().positive().max(100000),
  change: z.number(),
  changePercent: z.number().min(-100).max(100),
  volume: z.number().int().nonnegative(),
  averageVolume: z.number().positive(),
  lastUpdated: z.string().datetime()
});

export function validateQuotes(quotes: Quote[]) {
  const valid: Quote[] = [];
  const dropped: Array<{ symbol: string; reason: string }> = [];
  const now = Date.now();

  for (const quote of quotes) {
    const parsed = quoteSchema.safeParse(quote);
    if (!parsed.success) {
      dropped.push({ symbol: quote.symbol, reason: "schema_validation_failed" });
      continue;
    }

    const lastUpdatedMs = new Date(quote.lastUpdated).getTime();
    if (Math.abs(now - lastUpdatedMs) > 1000 * 60 * 15) {
      dropped.push({ symbol: quote.symbol, reason: "stale_data" });
      continue;
    }

    valid.push(quote);
  }

  return { valid, dropped };
}

export function dedupeNews(news: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return news.filter((item) => {
    const key = `${item.headline.toLowerCase()}-${item.publishedAt}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
