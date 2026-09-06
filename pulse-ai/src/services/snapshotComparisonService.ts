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


export async function getSinceLastChecked(
  symbol: string
): Promise<SinceLastCheckedResult> {

  const normalizedSymbol =
    symbol.trim().toUpperCase();


  const result = await db.query(
    `
      SELECT
        id,
        symbol,
        price,
        price_change,

        volume,
        average_volume,
        volume_ratio,

        volatility_change,

        meaningfulness_score,
        severity,
        reasons,

        news_headline,

        currency,

        created_at

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
    result.rows.map((row) => ({

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

      meaningfulnessScore:
        row.meaningfulness_score,

      severity:
        row.severity,

      reasons:
        row.reasons,

      newsHeadline:
        row.news_headline,

      currency:
        row.currency,

      createdAt:
        row.created_at

    })) as StockSnapshot[];


  const currentSnapshot =
    snapshots[0];


  const previousSnapshot =
    snapshots[1] ?? null;


  const changes: SnapshotChange[] = [];


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


  // --------------------------------
  // PRICE CHANGE
  // --------------------------------

  if (
    previousSnapshot.price !== 0
  ) {

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


  // Sort most important changes first

  changes.sort(
    (a, b) =>
      b.importance -
      a.importance
  );


  return {

    symbol: normalizedSymbol,

    previousSnapshot,

    currentSnapshot,

    changes

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
          id,
          symbol,
          price,
          price_change,

          volume,
          average_volume,
          volume_ratio,

          volatility_change,

          meaningfulness_score,
          severity,
          reasons,

          news_headline,

          currency,

          created_at

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


  const currentRow =
    currentResult.rows[0];


  const currentSnapshot: StockSnapshot = {

    id: currentRow.id,

    symbol: currentRow.symbol,

    price: Number(currentRow.price),

    priceChange:
      currentRow.price_change !== null
        ? Number(currentRow.price_change)
        : null,

    volume:
      currentRow.volume !== null
        ? Number(currentRow.volume)
        : null,

    averageVolume:
      currentRow.average_volume !== null
        ? Number(currentRow.average_volume)
        : null,

    volumeRatio:
      currentRow.volume_ratio !== null
        ? Number(currentRow.volume_ratio)
        : null,

    volatilityChange:
      currentRow.volatility_change !== null
        ? Number(currentRow.volatility_change)
        : null,

    meaningfulnessScore:
      currentRow.meaningfulness_score,

    severity:
      currentRow.severity,

    reasons:
      currentRow.reasons,

    newsHeadline:
      currentRow.news_headline,

    currency:
      currentRow.currency,

    createdAt:
      currentRow.created_at

  };


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
          id,
          symbol,
          price,
          price_change,

          volume,
          average_volume,
          volume_ratio,

          volatility_change,

          meaningfulness_score,
          severity,
          reasons,

          news_headline,

          currency,

          created_at

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


  const previousRow =
    previousResult.rows[0];


  const previousSnapshot: StockSnapshot = {

    id: previousRow.id,

    symbol: previousRow.symbol,

    price: Number(previousRow.price),

    priceChange:
      previousRow.price_change !== null
        ? Number(previousRow.price_change)
        : null,

    volume:
      previousRow.volume !== null
        ? Number(previousRow.volume)
        : null,

    averageVolume:
      previousRow.average_volume !== null
        ? Number(previousRow.average_volume)
        : null,

    volumeRatio:
      previousRow.volume_ratio !== null
        ? Number(previousRow.volume_ratio)
        : null,

    volatilityChange:
      previousRow.volatility_change !== null
        ? Number(previousRow.volatility_change)
        : null,

    meaningfulnessScore:
      previousRow.meaningfulness_score,

    severity:
      previousRow.severity,

    reasons:
      previousRow.reasons,

    newsHeadline:
      previousRow.news_headline,

    currency:
      previousRow.currency,

    createdAt:
      previousRow.created_at

  };


  const changes: SnapshotChange[] = [];


  // PRICE

  if (previousSnapshot.price !== 0) {

    const priceDifferencePercent =
      (
        (
          currentSnapshot.price -
          previousSnapshot.price
        )
        /
        previousSnapshot.price
      ) * 100;


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


  // VOLUME

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
          `Trading activity ${direction} significantly ` +
          `since you last checked.`,

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


  // MEANINGFULNESS

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
          `Pulse importance ${direction} from ` +
          `${previousSnapshot.meaningfulnessScore} ` +
          `to ${currentSnapshot.meaningfulnessScore}.`,

        importance:
          Math.min(
            Math.abs(scoreDifference),
            100
          )

      });

    }

  }


  // SEVERITY

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


  // NEWS

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


  return {

    symbol: normalizedSymbol,

    previousSnapshot,

    currentSnapshot,

    changes

  };

}