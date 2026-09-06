import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();


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
  const quote =
    await yahooFinance.quote(symbol);

  // 👇 ADD THE DEBUG LOG HERE
  console.log("[currency debug]", {
    input: symbol,
    resolvedSymbol: quote.symbol,
    currency: quote.currency,
    exchange: quote.exchange
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
      ? (
          (price - previousClose) /
          previousClose
        ) * 100
      : 0;

  const resolvedSymbol =
    quote.symbol ?? symbol;

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
      symbol,

    price,
    previousClose,
    priceChange,
    volume,
    averageVolume,

    currency:
      quote.currency ??
      (isIndianExchange ? "INR" : "USD")

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

  const endDate =
    new Date();

  const startDate =
    new Date();

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

  startDate.setDate(
    startDate.getDate() - days
  );


  const result =
    await yahooFinance.chart(
      symbol,
      {
        period1: startDate,
        period2: endDate,
        interval: "1d"
      }
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

      date:
        new Date(day.date),

      open:
        Number(day.open),

      high:
        Number(day.high),

      low:
        Number(day.low),

      close:
        Number(day.close),

      volume:
        Number(day.volume)

    }));

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

  const normalizedQuery =
    query.trim();


  if (normalizedQuery.length < 1) {
    return [];
  }


  const result =
    await yahooFinance.search(
      normalizedQuery
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

  const quotes =
    result.quotes ?? [];


  const stocks =
    quotes
      .filter((item) => {

        return (
          item.quoteType === "EQUITY" &&
          typeof item.symbol === "string" &&
          item.symbol.length > 0
        );

      })

      .slice(0, 8)

      .map((item) => ({

        symbol:
          item.symbol,

        companyName:
          item.longname ??
          item.shortname ??
          item.symbol,

        exchange:
          item.exchDisp ??
          null

      }));


  return stocks;

}