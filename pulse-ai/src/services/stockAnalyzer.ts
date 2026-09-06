import {
  getStockQuote,
  getHistoricalMarketData,
} from "../marketData/yahooFinance.js";

import {
  calculateAverageVolume,
  calculateVolumeRatio,
  calculateVolatilityChange,
} from "../marketData/marketMetrics.js";

import {
  calculateMeaningfulness,
} from "../engine/meaningfulnessEngine.js";

import {
  getStockNews,
} from "../news/finnhub.js";

import {
  processNews,
} from "../news/newsProcessor.js";

import {
  aggregateNews,
} from "../news/newsAggregator.js";

import {
  calculateNewsSignal,
} from "../news/newsSignal.js";

/* ========================================
   TYPES
======================================== */

export interface StockInsight {
  symbol: string;

  companyName: string;

  currency: string;

  /* --------------------------------
     MARKET DATA
  -------------------------------- */

  price: number;

  previousClose: number;

  priceChange: number;

  volume: number;

  averageVolume: number;

  volumeRatio: number;

  volatilityChange: number;

  sectorPerformance?: number;

  /* --------------------------------
     NEWS
  -------------------------------- */

  newsImportance: number;

  newsType:
    | "event"
    | "context"
    | "opinion"
    | "prediction"
    | "none";

  newsArticleCount: number;

  newsHeadline: string | null;

  newsSummary: string | null;

  newsSource: string | null;

  newsUrl: string | null;

  /* --------------------------------
     MEANINGFULNESS
  -------------------------------- */

  meaningfulnessScore: number;

  severity:
    | "low"
    | "medium"
    | "high"
    | "critical";

  reasons: string[];

  signals: {
    priceMovement: number;

    volumeAnomaly: number;

    volatility: number;

    relativePerformance: number;

    eventImpact: number;

    newsImpact: number;

    userRelevance: number;
  };
}

/* ========================================
   ANALYZE STOCK
======================================== */

export async function analyzeStock(
  symbol: string
): Promise<StockInsight> {

  // --------------------------------
  // 1. GET CURRENT MARKET DATA
  // --------------------------------

  const quote =
    await getStockQuote(symbol);


  // --------------------------------
  // 2. GET HISTORICAL DATA
  // --------------------------------

  const history =
    await getHistoricalMarketData(
      symbol,
      60
    );

  if (history.length < 25) {
    throw new Error(
      `Not enough historical data available for ${symbol}.`
    );
  }


  // --------------------------------
  // 3. CALCULATE VOLUME METRICS
  // --------------------------------

  /*
   * Exclude today's volume from the
   * historical baseline.
   */

  const historicalWithoutToday =
    history.slice(0, -1);

  const averageVolume =
    calculateAverageVolume(
      historicalWithoutToday,
      20
    );

  const volumeRatio =
    calculateVolumeRatio(
      quote.volume,
      averageVolume
    );


  // --------------------------------
  // 4. CALCULATE VOLATILITY
  // --------------------------------

  const volatilityChange =
    calculateVolatilityChange(history);


  // --------------------------------
  // 5. GET NEWS
  // --------------------------------

  let newsImportance = 0;

  let newsType:
    | "event"
    | "context"
    | "opinion"
    | "prediction"
    | "none" = "none";

  let newsArticleCount = 0;

  let newsHeadline: string | null = null;

  let newsSummary: string | null = null;

  let newsSource: string | null = null;

  let newsUrl: string | null = null;

  let newsReasons: string[] = [];


  /*
   * News failures should not stop
   * market-data analysis.
   */

  try {

    const rawNews =
      await getStockNews(
        quote.symbol,
        3,
        quote.companyName
      );

    const processedNews =
      processNews(
        rawNews,
        quote.symbol,
        quote.companyName
      );

    const newsEvents =
      aggregateNews(processedNews);

    const newsSignal =
      calculateNewsSignal(
        processedNews,
        newsEvents
      );


    newsImportance =
      newsSignal.importance;

    newsType =
      newsSignal.strongestType;

    newsArticleCount =
      newsSignal.articleCount;

    newsHeadline =
      newsSignal.headline;

    newsSummary =
      newsSignal.summary;

    newsSource =
      newsSignal.source;

    newsUrl =
      newsSignal.url;

    newsReasons =
      newsSignal.reasons;

  } catch (error) {

    console.warn(
      `News data unavailable for ${quote.symbol}. Continuing without news.`
    );

  }


  // --------------------------------
  // 6. MEANINGFULNESS ENGINE
  // --------------------------------

  const meaningfulness =
    calculateMeaningfulness({

      symbol:
        quote.symbol,

      companyName:
        quote.companyName,

      priceChange:
        quote.priceChange,

      volumeRatio,

      volatilityChange,

      sectorPerformance:
        undefined,

      newsImportance,

      newsType,

    });


  // --------------------------------
  // 7. COMBINE REASONS
  // --------------------------------

  const reasons = [
    ...meaningfulness.reasons,
  ];


  /*
   * Add additional news reasons only
   * if they aren't already included.
   */

  for (const reason of newsReasons) {

    if (!reasons.includes(reason)) {
      reasons.push(reason);
    }

  }


  // --------------------------------
  // 8. RETURN COMPLETE STOCK INSIGHT
  // --------------------------------

  return {

    /* --------------------------------
       IDENTITY
    -------------------------------- */

    symbol:
      quote.symbol,

    companyName:
      quote.companyName,

    currency:
      quote.currency,


    /* --------------------------------
       MARKET DATA
    -------------------------------- */

    price:
      quote.price,

    previousClose:
      quote.previousClose,

    priceChange:
      quote.priceChange,

    volume:
      quote.volume,

    averageVolume,

    volumeRatio,

    volatilityChange,

    sectorPerformance:
      undefined,


    /* --------------------------------
       NEWS
    -------------------------------- */

    newsImportance,

    newsType,

    newsArticleCount,

    newsHeadline,

    newsSummary,

    newsSource,

    newsUrl,


    /* --------------------------------
       MEANINGFULNESS
    -------------------------------- */

    meaningfulnessScore:
      meaningfulness.score,

    severity:
      meaningfulness.severity,

    reasons,

    signals:
      meaningfulness.signals,

  };
}