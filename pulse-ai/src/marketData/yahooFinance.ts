import YahooFinance from "yahoo-finance2";

/* ========================================
   YAHOO FINANCE CLIENT
======================================== */

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

/* ========================================
   CACHE CONFIGURATION
======================================== */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const QUOTE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const HISTORY_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const SEARCH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/* ========================================
   HELPER FUNCTIONS
======================================== */

const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function isYahooRateLimitError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("429") ||
    message.includes("too many requests") ||
    message.includes("failed to get crumb") ||
    message.includes("rate limit")
  );
}

/**
 * Executes a Yahoo Finance request with retry handling.
 *
 * Delays:
 * Attempt 1: 2 seconds
 * Attempt 2: 4 seconds
 * Attempt 3: 8 seconds
 */
async function withYahooRetry<T>(
  operation: () => Promise<T>,
  retries = 3
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const message = getErrorMessage(error);

      console.error(
        `Yahoo Finance request failed on attempt ${
          attempt + 1
        }/${retries + 1}:`,
        message
      );

      const isRateLimitError = isYahooRateLimitError(error);

      /*
       * Do not retry unrelated errors such as invalid
       * arguments or programming errors.
       */
      if (!isRateLimitError || attempt === retries) {
        throw error;
      }

      const delay = 2000 * 2 ** attempt;

      console.warn(
        `Yahoo Finance rate-limited the request. Retrying in ${
          delay / 1000
        } seconds...`
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Returns cached data if available and not expired.
 * Otherwise, executes the supplied operation and caches
 * the result.
 */
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

  console.log(`[cache miss] ${key}`);

  const value = await operation();

  cache.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  });

  return value;
}

/**
 * Optional helper to clear the cache.
 * Useful if you add an admin/debug endpoint later.
 */
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
      withYahooRetry(() =>
        yahooFinance.quote(normalizedSymbol)
      ),
    QUOTE_CACHE_TTL
  );

  // Currency debugging
  console.log("[currency debug]", {
    input: normalizedSymbol,
    resolvedSymbol: quote.symbol,
    currency: quote.currency,
    exchange: quote.exchange,
  });

  const price = quote.regularMarketPrice ?? 0;

  const previousClose =
    quote.regularMarketPreviousClose ?? 0;

  const volume = quote.regularMarketVolume ?? 0;

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
    throw new Error("Number of historical days must be greater than zero");
  }

  const cacheKey = `history:${normalizedSymbol}:${days}`;

  return getCachedData(
    cacheKey,
    async () => {
      const endDate = new Date();

      const startDate = new Date();

      /*
       * Fetch enough history for:
       *
       * SMA 20
       * SMA 50
       * SMA 200
       * RSI
       * Support / Resistance
       * 1 Year charts
       */
      startDate.setDate(startDate.getDate() - days);

      const result = await withYahooRetry(() =>
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
        .map((day) => {
          return {
            date: new Date(day.date),

            open: Number(day.open),

            high: Number(day.high),

            low: Number(day.low),

            close: Number(day.close),

            volume: Number(day.volume),
          };
        });
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

  if (normalizedQuery.length < 1) {
    return [];
  }

  const cacheKey = `search:${normalizedQuery.toLowerCase()}`;

  return getCachedData(
    cacheKey,
    async () => {
      const result = await withYahooRetry(() =>
        yahooFinance.search(normalizedQuery)
      );

      /*
       * Yahoo returns multiple result types:
       *
       * stocks
       * ETFs
       * crypto
       * indexes
       * news
       *
       * We only want equities for Pulse.
       */
      const quotes = result.quotes ?? [];

      const stocks = quotes
        .filter((item) => {
          return (
            item.quoteType === "EQUITY" &&
            typeof item.symbol === "string" &&
            item.symbol.length > 0
          );
        })
        .slice(0, 8)
        .map((item) => {
          return {
            symbol: item.symbol,

            companyName:
              item.longname ??
              item.shortname ??
              item.symbol,

            exchange: item.exchDisp ?? null,
          };
        });

      return stocks;
    },
    SEARCH_CACHE_TTL
  );
}