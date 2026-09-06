import { db } from "../database.js";
import type { StockSnapshot } from "./snapshotService.js";
import {
  getWatchlistItem
} from "./watchlistService.js";

export interface SnapshotChange {
  type:
    | "price"
    | "volume"
    | "meaningfulness"
    | "severity"
    | "news";

  message: string;

  importance: number;
}


export interface SinceLastCheckedResult {

  symbol: string;

  previousSnapshot: StockSnapshot | null;

  currentSnapshot: StockSnapshot | null;

  changes: SnapshotChange[];

}


/* ========================================
   SHARED SNAPSHOT COLUMNS + MAPPER

   StockSnapshot (snapshotService.ts) has
   grown fields over time — sectorPerformance,
   newsImportance, newsType, signals,
   newsSummary, newsSource, newsUrl were all
   added after this file's queries were first
   written, so they were silently missing here.

   Centralizing the column list and the row
   mapping in one place means adding a field
   to StockSnapshot only requires updating it
   here once, instead of independently in every
   query in this file.
======================================== */

const SNAPSHOT_COLUMNS = `
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
  created_at
`;


function mapRowToSnapshot(row: any): StockSnapshot {

  return {

    id: row.id,

    symbol: row.symbol,

    price: Number(row.price),

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
      row.created_at,

  };

}


function getSeverityRank(
  severity: string | null
): number {

  switch (severity) {

    case "low":
      return 1;

    case "medium":
      return 2;

    case "high":
      return 3;

    case "critical":
      return 4;

    default:
      return 0;

  }

}


/* ========================================
   CHANGE DETECTION

   Shared by both entry points below so the
   comparison rules only live in one place.
======================================== */

function detectChanges(
  currentSnapshot: StockSnapshot,
  previousSnapshot: StockSnapshot
): SnapshotChange[] {

  const changes: SnapshotChange[] = [];


  // --------------------------------
  // PRICE CHANGE
  // --------------------------------

  if (previousSnapshot.price !== 0) {

    const priceDifferencePercent =
      (
        (
          currentSnapshot.price -
          previousSnapshot.price
        )
        /
        previousSnapshot.price
      )
      * 100;


    if (
      Math.abs(priceDifferencePercent) >= 0.5
    ) {

      const direction =
        priceDifferencePercent > 0
          ? "increased"
          : "decreased";


      changes.push({

        type: "price",

        message:
          `Price ${direction} by ` +
          `${Math.abs(
            priceDifferencePercent
          ).toFixed(2)}% ` +
          `since you last checked.`,

        importance:
          Math.min(
            Math.round(
              Math.abs(
                priceDifferencePercent
              ) * 20
            ),
            100
          )

      });

    }

  }


  // --------------------------------
  // VOLUME ACTIVITY
  // --------------------------------

  if (
    previousSnapshot.volumeRatio !== null &&
    currentSnapshot.volumeRatio !== null
  ) {

    const volumeDifference =
      currentSnapshot.volumeRatio -
      previousSnapshot.volumeRatio;


    if (
      Math.abs(volumeDifference) >= 0.5
    ) {

      const direction =
        volumeDifference > 0
          ? "increased"
          : "decreased";


      changes.push({

        type: "volume",

        message:
          `Trading activity ${direction} ` +
          `significantly since you last checked.`,

        importance:
          Math.min(
            Math.round(
              Math.abs(volumeDifference) * 50
            ),
            100
          )

      });

    }

  }


  // --------------------------------
  // MEANINGFULNESS CHANGE
  // --------------------------------

  if (
    previousSnapshot.meaningfulnessScore !== null &&
    currentSnapshot.meaningfulnessScore !== null
  ) {

    const scoreDifference =
      currentSnapshot.meaningfulnessScore -
      previousSnapshot.meaningfulnessScore;


    if (
      Math.abs(scoreDifference) >= 10
    ) {

      const direction =
        scoreDifference > 0
          ? "increased"
          : "decreased";


      changes.push({

        type: "meaningfulness",

        message:
          `Pulse importance ${direction} ` +
          `from ${previousSnapshot.meaningfulnessScore} ` +
          `to ${currentSnapshot.meaningfulnessScore}.`,

        importance:
          Math.min(
            Math.abs(scoreDifference),
            100
          )

      });

    }

  }


  // --------------------------------
  // SEVERITY CHANGE
  // --------------------------------

  const previousSeverityRank =
    getSeverityRank(
      previousSnapshot.severity
    );


  const currentSeverityRank =
    getSeverityRank(
      currentSnapshot.severity
    );


  if (
    previousSeverityRank !==
    currentSeverityRank
  ) {

    changes.push({

      type: "severity",

      message:
        `Severity changed from ` +
        `${previousSnapshot.severity} ` +
        `to ${currentSnapshot.severity}.`,

      importance:
        Math.abs(
          currentSeverityRank -
          previousSeverityRank
        ) * 25

    });

  }


  // --------------------------------
  // NEWS CHANGE
  // --------------------------------

  if (
    currentSnapshot.newsHeadline &&
    currentSnapshot.newsHeadline !==
      previousSnapshot.newsHeadline
  ) {

    changes.push({

      type: "news",

      message:
        `New market news detected: ` +
        `${currentSnapshot.newsHeadline}`,

      importance: 70

    });

  }


  // Most important changes first

  changes.sort(
    (a, b) =>
      b.importance - a.importance
  );


  return changes;

}


export async function getSinceLastChecked(
  symbol: string
): Promise<SinceLastCheckedResult> {

  const normalizedSymbol =
    symbol.trim().toUpperCase();


  const result = await db.query(
    `
      SELECT
        ${SNAPSHOT_COLUMNS}

      FROM stock_snapshots

      WHERE symbol = $1

      ORDER BY created_at DESC

      LIMIT 2;
    `,
    [normalizedSymbol]
  );


  if (result.rows.length === 0) {

    return {
      symbol: normalizedSymbol,

      previousSnapshot: null,

      currentSnapshot: null,

      changes: []
    };

  }


  const snapshots =
    result.rows.map(mapRowToSnapshot);


  const currentSnapshot =
    snapshots[0];


  const previousSnapshot =
    snapshots[1] ?? null;


  // If there is no previous snapshot,
  // there is nothing to compare yet.

  if (!previousSnapshot) {

    return {
      symbol: normalizedSymbol,
      previousSnapshot: null,
      currentSnapshot,
      changes: []
    };

  }


  return {

    symbol: normalizedSymbol,

    previousSnapshot,

    currentSnapshot,

    changes: detectChanges(
      currentSnapshot,
      previousSnapshot
    )

  };

}


export async function getChangesSinceLastChecked(
  symbol: string
): Promise<SinceLastCheckedResult> {

  const normalizedSymbol =
    symbol.trim().toUpperCase();


  const watchlistItem =
    await getWatchlistItem(
      normalizedSymbol
    );


  // Stock is not in the watchlist

  if (!watchlistItem) {

    return {
      symbol: normalizedSymbol,

      previousSnapshot: null,

      currentSnapshot: null,

      changes: []
    };

  }


  // Get the latest snapshot

  const currentResult =
    await db.query(
      `
        SELECT
          ${SNAPSHOT_COLUMNS}

        FROM stock_snapshots

        WHERE symbol = $1

        ORDER BY created_at DESC

        LIMIT 1;
      `,
      [normalizedSymbol]
    );


  if (currentResult.rows.length === 0) {

    return {
      symbol: normalizedSymbol,

      previousSnapshot: null,

      currentSnapshot: null,

      changes: []
    };

  }


  const currentSnapshot =
    mapRowToSnapshot(currentResult.rows[0]);


  // If the user has never checked this stock,
  // there is no previous checkpoint yet.

  if (!watchlistItem.lastCheckedAt) {

    return {
      symbol: normalizedSymbol,

      previousSnapshot: null,

      currentSnapshot,

      changes: []
    };

  }


  // Find the latest snapshot that existed
  // when the user last checked.

  const previousResult =
    await db.query(
      `
        SELECT
          ${SNAPSHOT_COLUMNS}

        FROM stock_snapshots

        WHERE
          symbol = $1

          AND created_at <= $2

        ORDER BY created_at DESC

        LIMIT 1;
      `,
      [
        normalizedSymbol,
        watchlistItem.lastCheckedAt
      ]
    );


  if (previousResult.rows.length === 0) {

    return {
      symbol: normalizedSymbol,

      previousSnapshot: null,

      currentSnapshot,

      changes: []
    };

  }


  const previousSnapshot =
    mapRowToSnapshot(previousResult.rows[0]);


  return {

    symbol: normalizedSymbol,

    previousSnapshot,

    currentSnapshot,

    changes: detectChanges(
      currentSnapshot,
      previousSnapshot
    )

  };

}