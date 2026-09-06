import { db } from "../database.js";
import type { PulseAnalysis } from "./pulseAnalyzer.js";


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
   STOCK SNAPSHOT
======================================== */

export interface StockSnapshot {
  id: number;

  symbol: string;

  price: number;

  priceChange: number | null;

  volume: number | null;

  averageVolume: number | null;

  volumeRatio: number | null;

  volatilityChange: number | null;

  sectorPerformance: number | null;

  newsImportance: number;

  newsType:
    | "event"
    | "context"
    | "opinion"
    | "prediction"
    | "none";

  meaningfulnessScore: number | null;

  severity: string | null;

  reasons: string[] | null;

  signals: MeaningfulnessSignals | null;

  newsHeadline: string | null;

  newsSummary: string | null;

  newsSource: string | null;

  newsUrl: string | null;

  currency: string | null;

  createdAt: Date;
}


/* ========================================
   SAVE SNAPSHOT
======================================== */

export async function saveSnapshot(
  analysis: PulseAnalysis
): Promise<StockSnapshot> {

  const result = await db.query(
    `
      INSERT INTO stock_snapshots (

        symbol,

        price,
        price_change,

        volume,
        average_volume,
        volume_ratio,

        volatility_change,

        sector_performance,

        news_importance,
        news_type,

        meaningfulness_score,
        severity,
        reasons,

        signals,

        news_headline,
        news_summary,
        news_source,
        news_url,

        currency

      )

      VALUES (

        $1,

        $2, $3,

        $4, $5, $6,

        $7,

        $8,

        $9, $10,

        $11, $12, $13,

        $14,

        $15, $16, $17, $18,

        $19

      )

      RETURNING

        id,

        symbol,

        price,
        price_change,

        volume,
        average_volume,
        volume_ratio,

        volatility_change,

        sector_performance,

        news_importance,
        news_type,

        meaningfulness_score,
        severity,
        reasons,

        signals,

        news_headline,
        news_summary,
        news_source,
        news_url,

        currency,

        created_at;
    `,
    [

      analysis.stock.symbol,

      analysis.stock.price,
      analysis.stock.priceChange,

      analysis.stock.volume,
      analysis.stock.averageVolume,
      analysis.stock.volumeRatio,

      analysis.stock.volatilityChange,

      analysis.stock.sectorPerformance ?? null,

      analysis.news.importance,
      analysis.news.type,

      analysis.meaningfulness.score,
      analysis.meaningfulness.severity,

      JSON.stringify(
        analysis.meaningfulness.reasons
      ),

      JSON.stringify(
        analysis.meaningfulness.signals
      ),

      analysis.news.headline,
      analysis.news.summary,
      analysis.news.source,
      analysis.news.url,

      analysis.stock.currency

    ]
  );


  const row = result.rows[0];


  return {

    id:
      Number(row.id),

    symbol:
      row.symbol,

    price:
      Number(row.price),


    priceChange:
      row.price_change !== null
        ? Number(row.price_change)
        : null,


    volume:
      row.volume !== null
        ? Number(row.volume)
        : null,


    averageVolume:
      row.average_volume !== null
        ? Number(row.average_volume)
        : null,


    volumeRatio:
      row.volume_ratio !== null
        ? Number(row.volume_ratio)
        : null,


    volatilityChange:
      row.volatility_change !== null
        ? Number(row.volatility_change)
        : null,


    sectorPerformance:
      row.sector_performance !== null
        ? Number(row.sector_performance)
        : null,


    newsImportance:
      Number(row.news_importance ?? 0),


    newsType:
      row.news_type ?? "none",


    meaningfulnessScore:
      row.meaningfulness_score !== null
        ? Number(row.meaningfulness_score)
        : null,


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


    currency:
      row.currency,


    createdAt:
      new Date(row.created_at)

  };

}