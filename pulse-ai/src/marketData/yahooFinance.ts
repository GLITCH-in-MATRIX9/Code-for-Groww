import YahooFinance from "yahoo-finance2";

/* ========================================
   YAHOO FINANCE CLIENT
======================================== */

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

/* ========================================
   CACHE
======================================== */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const QUOTE_CACHE_TTL = 5 * 60 * 1000;
const HISTORY_CACHE_TTL = 15 * 60 * 1000;
const SEARCH_CACHE_TTL = 10 * 60 * 1000;

/* ========================================
   REQUEST DEDUPLICATION
======================================== */

const pendingRequests = new Map<
  string,
  Promise<unknown>
>();

async function getCachedData<T>(
  key: string,
  operation: () => Promise<T>,
  ttl: number
): Promise<T> {
  const cached = cache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    console.log(`[cache hit] ${key}`);
    return cached.value as T;
  }

  const existingRequest = pendingRequests.get(key);

  if (existingRequest) {
    console.log(`[request deduplicated] ${key}`);
    return existingRequest as Promise<T>;
  }

  console.log(`[cache miss] ${key}`);

  const request = operation();

  pendingRequests.set(key, request);

  try {
    const value = await request;

    cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });

    return value;
  } finally {
    pendingRequests.delete(key);
  }
}

/* ========================================
   YAHOO REQUEST QUEUE
======================================== */

let lastYahooRequestTime = 0;
let yahooQueue: Promise<unknown> = Promise.resolve();

const MIN_REQUEST_INTERVAL = 1500;

function isYahooRateLimitError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    message.includes("429") ||
    message.includes("too many requests") ||
    message.includes("failed to get crumb") ||
    message.includes("rate limit")
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : String(error);
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, milliseconds)
  );
}

/**
 * Runs Yahoo requests sequentially.
 * This prevents multiple simultaneous crumb requests.
 */
function runYahooRequest<T>(
  operation: () => Promise<T>
): Promise<T> {
  const request = yahooQueue.then(async () => {
    const elapsed =
      Date.now() - lastYahooRequestTime;

    if (elapsed < MIN_REQUEST_INTERVAL) {
      await wait(
        MIN_REQUEST_INTERVAL - elapsed
      );
    }

    lastYahooRequestTime = Date.now();

    try {
      return await operation();
    } catch (error) {
      console.error(
        "Yahoo Finance request failed:",
        getErrorMessage(error)
      );

      /*
       * Retry only once, and only for rate limits.
       * Do not create a repeated retry storm.
       */
      if (isYahooRateLimitError(error)) {
        console.warn(
          "Yahoo Finance rate limit detected. Waiting before one retry..."
        );

        await wait(5000);

        lastYahooRequestTime = Date.now();

        return await operation();
      }

      throw error;
    }
  });

  yahooQueue = request.catch(() => undefined);

  return request;
}

/* ========================================
   CACHE CONTROL
======================================== */

export function clearYahooCache(): void {
  cache.clear();
  console.log("[cache] Yahoo Finance cache cleared");
}

/* ========================================
   STOCK QUOTE
======================================== */

export interface StockQuote {
  symbol: string;
  companyName: string;
  price: number;
  previousClose: number;
  priceChange: number;
  volume: number;
  averageVolume: number;
  currency: string;
}

export async function getStockQuote(
  symbol: string
): Promise<StockQuote> {
  const normalizedSymbol = symbol.trim().toUpperCase();

  if (!normalizedSymbol) {
    throw new Error("Stock symbol is required");
  }

  const quote = await getCachedData(
    `quote:${normalizedSymbol}`,
    () =>
      runYahooRequest(() =>
        yahooFinance.quote(normalizedSymbol)
      ),
    QUOTE_CACHE_TTL
  );

  console.log("[currency debug]", {
    input: normalizedSymbol,
    resolvedSymbol: quote.symbol,
    currency: quote.currency,
    exchange: quote.exchange,
  });

  const price =
    quote.regularMarketPrice ?? 0;

  const previousClose =
    quote.regularMarketPreviousClose ?? 0;

  const volume =
    quote.regularMarketVolume ?? 0;

  const averageVolume =
    quote.averageDailyVolume3Month ?? 0;

  const priceChange =
    previousClose > 0
      ? ((price - previousClose) / previousClose) * 100
      : 0;

  const resolvedSymbol =
    quote.symbol ?? normalizedSymbol;

  const isIndianExchange =
    quote.exchange === "NSI" ||
    quote.exchange === "BSE" ||
    resolvedSymbol.endsWith(".NS") ||
    resolvedSymbol.endsWith(".BO");

  return {
    symbol: resolvedSymbol,

    companyName:
      quote.longName ??
      quote.shortName ??
      normalizedSymbol,

    price,
    previousClose,
    priceChange,
    volume,
    averageVolume,

    currency:
      quote.currency ??
      (isIndianExchange ? "INR" : "USD"),
  };
}

/* ========================================
   HISTORICAL MARKET DATA
======================================== */

export interface HistoricalMarketData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function getHistoricalMarketData(
  symbol: string,
  days: number = 365
): Promise<HistoricalMarketData[]> {
  const normalizedSymbol = symbol.trim().toUpperCase();

  if (!normalizedSymbol) {
    throw new Error("Stock symbol is required");
  }

  if (days <= 0) {
    throw new Error(
      "Historical days must be greater than zero"
    );
  }

  return getCachedData(
    `history:${normalizedSymbol}:${days}`,
    async () => {
      const endDate = new Date();

      const startDate = new Date();

      startDate.setDate(
        startDate.getDate() - days
      );

      const result = await runYahooRequest(() =>
        yahooFinance.chart(normalizedSymbol, {
          period1: startDate,
          period2: endDate,
          interval: "1d",
        })
      );

      return result.quotes
        .filter((day) => {
          return (
            day.date &&
            day.open !== null &&
            day.high !== null &&
            day.low !== null &&
            day.close !== null &&
            day.volume !== null
          );
        })
        .map((day) => ({
          date: new Date(day.date),
          open: Number(day.open),
          high: Number(day.high),
          low: Number(day.low),
          close: Number(day.close),
          volume: Number(day.volume),
        }));
    },
    HISTORY_CACHE_TTL
  );
}

/* ========================================
   STOCK SEARCH
======================================== */

export interface StockSearchResult {
  symbol: string;
  companyName: string;
  exchange: string | null;
}

export async function searchStocks(
  query: string
): Promise<StockSearchResult[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  return getCachedData(
    `search:${normalizedQuery.toLowerCase()}`,
    async () => {
      const result = await runYahooRequest(() =>
        yahooFinance.search(normalizedQuery)
      );

      const quotes = result.quotes ?? [];

      return quotes
        .filter((item) => {
          return (
            item.quoteType === "EQUITY" &&
            typeof item.symbol === "string" &&
            item.symbol.length > 0
          );
        })
        .slice(0, 8)
        .map((item): StockSearchResult => {
          /*
           * The .filter() above already confirmed
           * item.symbol is a non-empty string, but
           * that narrowing doesn't carry into this
           * separate .map() callback — yahoo-finance2's
           * quote union still types these loosely here
           * (symbol as unknown, exchDisp as an object
           * type), so we validate/coerce explicitly
           * rather than trusting the inferred type.
           */

          const symbol = String(item.symbol);

          const companyName =
            typeof item.longname === "string" &&
            item.longname.length > 0
              ? item.longname
              : typeof item.shortname === "string" &&
                item.shortname.length > 0
                ? item.shortname
                : symbol;

          const exchange =
            typeof item.exchDisp === "string"
              ? item.exchDisp
              : null;

          return { symbol, companyName, exchange };
        });
    },
    SEARCH_CACHE_TTL
  );
}

/* ========================================
   ERROR IDENTIFICATION
======================================== */

export function isYahooUnavailableError(
  error: unknown
): boolean {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("429") ||
    normalizedMessage.includes("too many requests") ||
    normalizedMessage.includes("failed to get crumb") ||
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("rate-limited")
  );
}