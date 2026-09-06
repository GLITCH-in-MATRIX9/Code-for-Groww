import "dotenv/config";
import { parseStringPromise } from "xml2js";

export interface StockNews {
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: Date;
}

function isRelevantToStock(
  article: StockNews,
  symbol: string,
  companyName?: string
): boolean {

  const text = (
    article.headline +
    " " +
    article.summary
  ).toLowerCase();

  const cleanSymbol =
    symbol.split(".")[0].toLowerCase();

  const symbolMatch =
    text.includes(cleanSymbol);

  const companyMatch =
    companyName
      ? text.includes(companyName.toLowerCase())
      : false;

  return symbolMatch || companyMatch;
}

/* ========================================
   GOOGLE NEWS RSS
   No API key required.
   Best coverage for Indian equities.
======================================== */

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

async function fetchGoogleNews(
  query: string
): Promise<StockNews[]> {

  const rssUrl =
    `https://news.google.com/rss/search` +
    `?q=${encodeURIComponent(query)}` +
    `&hl=en-IN&gl=IN&ceid=IN:en`;

  const response = await fetch(rssUrl);

  if (!response.ok) {
    throw new Error(
      `Google News RSS request failed with status ${response.status}`
    );
  }

  const xml = await response.text();

  const parsed = await parseStringPromise(xml, {
    trim: true,
    explicitArray: false
  });

  const items = parsed?.rss?.channel?.item;

  if (!items) {
    return [];
  }

  const itemList = Array.isArray(items)
    ? items
    : [items];

  return itemList.map((item: any): StockNews => {

    const rawTitle: string =
      item.title ?? "";

    /*
     * Google News titles are formatted as:
     * "Headline - Source Name"
     */

    const lastDashIndex =
      rawTitle.lastIndexOf(" - ");

    const headline =
      lastDashIndex !== -1
        ? rawTitle.slice(0, lastDashIndex)
        : rawTitle;

    const source =
      lastDashIndex !== -1
        ? rawTitle.slice(lastDashIndex + 3)
        : (item.source?._ ?? "Google News");

    return {
      headline,

      summary:
        stripHtml(item.description ?? ""),

      source,

      url:
        item.link ?? "",

      publishedAt:
        item.pubDate
          ? new Date(item.pubDate)
          : new Date()
    };

  });

}

/* ========================================
   FINNHUB (kept for non-Indian symbols)
======================================== */

const FINNHUB_API_KEY =
  process.env.FINNHUB_API_KEY;

async function fetchFinnhubNews(
  symbol: string,
  days: number
): Promise<StockNews[]> {

  if (!FINNHUB_API_KEY) {
    return [];
  }

  const endDate = new Date();

  const startDate = new Date();

  startDate.setDate(
    startDate.getDate() - days
  );

  const formatDate = (date: Date) =>
    date.toISOString().slice(0, 10);

  const url =
    `https://finnhub.io/api/v1/company-news` +
    `?symbol=${encodeURIComponent(symbol)}` +
    `&from=${formatDate(startDate)}` +
    `&to=${formatDate(endDate)}` +
    `&token=${FINNHUB_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Finnhub request failed with status ${response.status}`
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((article: any) => ({
    headline: article.headline ?? "",
    summary: article.summary ?? "",
    source: article.source ?? "",
    url: article.url ?? "",
    publishedAt: new Date((article.datetime ?? 0) * 1000)
  }));

}

/* ========================================
   MAIN ENTRY POINT
======================================== */

export async function getStockNews(
  symbol: string,
  days: number = 3,
  companyName?: string
): Promise<StockNews[]> {

  const isIndianStock =
    symbol.endsWith(".NS") ||
    symbol.endsWith(".BO");

  let articles: StockNews[] = [];

  if (isIndianStock) {

    /*
     * Finnhub doesn't support NSE/BSE symbols,
     * so use Google News RSS directly.
     */

    const query =
      companyName ?? symbol.split(".")[0];

    articles = await fetchGoogleNews(query);

  } else {

    try {

      articles =
        await fetchFinnhubNews(symbol, days);

    } catch (error) {

      console.warn(
        `Finnhub failed for ${symbol}, falling back to Google News.`
      );

      articles =
        await fetchGoogleNews(
          companyName ?? symbol
        );

    }

  }

  return articles.filter(
    article =>
      isRelevantToStock(
        article,
        symbol,
        companyName
      )
  );

}