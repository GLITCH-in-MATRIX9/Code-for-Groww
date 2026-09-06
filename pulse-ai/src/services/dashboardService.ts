import { db } from "../database.js";


/* ========================================
   MEANINGFULNESS SIGNALS
======================================== */

export interface MeaningfulnessSignals {
  priceMovement: number;
  volumeAnomaly: number;
  volatility: number;
  relativePerformance: number;
  eventImpact: number;
  newsImpact: number;
  userRelevance: number;
}


/* ========================================
   DASHBOARD STOCK
======================================== */

export interface DashboardStock {

  symbol: string;

  companyName: string;

  lastCheckedAt: Date | null;

  latestSnapshot: {
  price: number;

  priceChange: number;

  volumeRatio: number;

  volatilityChange: number;

  meaningfulnessScore: number;

  severity: string;

  reasons: string[];

  signals: MeaningfulnessSignals | null;

  newsHeadline: string | null;

  newsSummary: string | null;

  newsSource: string | null;

  newsUrl: string | null;

  createdAt: Date;
} | null;

}


/* ========================================
   ATTENTION SUMMARY
======================================== */

export interface AttentionSummary {

  critical: number;

  high: number;

  notable: number;

  stable: number;

  totalStocks: number;

  analyzedStocks: number;

  lastUpdated: Date | null;

}


/* ========================================
   GET DASHBOARD STOCKS
======================================== */

export async function getDashboardStocks(): Promise<
  DashboardStock[]
> {

  const result = await db.query(
    `
      SELECT

        w.symbol,

        w.company_name,

        w.last_checked_at,


        s.price,

        s.price_change,

        s.volume_ratio,

        s.volatility_change,

        s.meaningfulness_score,

        s.severity,

        s.reasons,

        s.signals,

        s.news_headline,

        s.news_summary,

        s.news_source,

        s.news_url,      

        s.created_at AS snapshot_created_at


      FROM watchlist_items w


      LEFT JOIN LATERAL (

        SELECT *

        FROM stock_snapshots

        WHERE symbol = w.symbol

        ORDER BY created_at DESC

        LIMIT 1

      ) s ON true


      ORDER BY w.created_at DESC;
    `
  );


  return result.rows.map((row) => ({

    symbol:
      row.symbol,

    companyName:
      row.company_name,

    lastCheckedAt:
      row.last_checked_at,


    latestSnapshot:

  row.snapshot_created_at

    ? {

        price:
          Number(row.price),

        priceChange:
          Number(row.price_change),

        volumeRatio:
          Number(row.volume_ratio),

        volatilityChange:
          Number(row.volatility_change),

        meaningfulnessScore:
          Number(row.meaningfulness_score),

        severity:
          row.severity,

        reasons:
          row.reasons ?? [],

        signals:
          row.signals ?? null,

        newsHeadline:
          row.news_headline,

        newsSummary:
          row.news_summary,

        newsSource:
          row.news_source,

        newsUrl:
          row.news_url,

        createdAt:
          new Date(
            row.snapshot_created_at
          )

      }

    : null

  }));

}


/* ========================================
   ATTENTION SUMMARY
======================================== */

export async function getAttentionSummary(): Promise<
  AttentionSummary
> {

  const stocks =
    await getDashboardStocks();


  let critical = 0;

  let high = 0;

  let notable = 0;

  let stable = 0;

  let analyzedStocks = 0;

  let lastUpdated: Date | null = null;


  for (const stock of stocks) {

    const snapshot =
      stock.latestSnapshot;


    /*
     * Stock has not been analyzed yet.
     */

    if (!snapshot) {

      continue;

    }


    analyzedStocks++;


    /*
     * Track the most recent snapshot
     * for dashboard freshness.
     */

    if (

      !lastUpdated ||

      snapshot.createdAt > lastUpdated

    ) {

      lastUpdated =
        snapshot.createdAt;

    }


    /*
     * Group by severity.
     */

    switch (
      snapshot.severity
    ) {

      case "critical":

        critical++;

        break;


      case "high":

        high++;

        break;


      case "medium":

        notable++;

        break;


      case "low":

        stable++;

        break;


      default:

        stable++;

        break;

    }

  }


  return {

    critical,

    high,

    notable,

    stable,

    totalStocks:
      stocks.length,

    analyzedStocks,

    lastUpdated

  };

}