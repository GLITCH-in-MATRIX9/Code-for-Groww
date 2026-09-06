import { db } from "../database.js";


export interface PerformancePoint {
  label: string;
  value: number;
}


export interface WatchlistPerformance {
  totalStocks: number;
  gainers: number;
  losers: number;
  unchanged: number;
  data: PerformancePoint[];
}


export type PerformanceRange =
  | "today"
  | "week"
  | "month";


export async function getWatchlistPerformance(
  range: PerformanceRange
): Promise<WatchlistPerformance> {

  // ----------------------------------------
  // GET CURRENT WATCHLIST
  // ----------------------------------------

  const watchlistResult =
    await db.query(`
      SELECT symbol
      FROM watchlist_items
      ORDER BY created_at ASC
    `);


  const symbols =
    watchlistResult.rows.map(
      (row) => row.symbol
    );


  // ----------------------------------------
  // EMPTY WATCHLIST
  // ----------------------------------------

  if (symbols.length === 0) {

    return {
      totalStocks: 0,
      gainers: 0,
      losers: 0,
      unchanged: 0,
      data: []
    };

  }


  // ----------------------------------------
  // GET LATEST SNAPSHOT FOR EACH STOCK
  // ----------------------------------------

  const latestResult =
    await db.query(
      `
        SELECT DISTINCT ON (symbol)
          symbol,
          price_change

        FROM stock_snapshots

        WHERE symbol = ANY($1)

        ORDER BY
          symbol,
          created_at DESC
      `,
      [symbols]
    );


  // ----------------------------------------
  // CLASSIFY STOCKS
  // ----------------------------------------

  let gainers = 0;
  let losers = 0;
  let unchanged = 0;


  for (const row of latestResult.rows) {

    const change =
      Number(row.price_change ?? 0);


    if (change > 0) {
      gainers++;
    } else if (change < 0) {
      losers++;
    } else {
      unchanged++;
    }

  }


  // ----------------------------------------
  // RANGE CONFIGURATION
  // ----------------------------------------

  let interval: string;
  let bucket: string;


  switch (range) {

    case "today":
      interval = "1 day";
      bucket = "hour";
      break;

    case "week":
      interval = "7 days";
      bucket = "day";
      break;

    case "month":
      interval = "30 days";
      bucket = "day";
      break;

  }


  // ----------------------------------------
  // GET HISTORICAL WATCHLIST PERFORMANCE
  // ----------------------------------------

  const historyResult =
    await db.query(
      `
        SELECT

          date_trunc(
            $3::text,
            created_at
          ) AS time_bucket,

          AVG(price_change) AS average_change

        FROM stock_snapshots

        WHERE
          symbol = ANY($1)

          AND created_at >=
            NOW() - $2::interval

        GROUP BY time_bucket

        ORDER BY time_bucket ASC
      `,
      [
        symbols,
        interval,
        bucket
      ]
    );


  // ----------------------------------------
  // FORMAT CHART DATA
  // ----------------------------------------

  const data =
    historyResult.rows.map((row) => {

      const date =
        new Date(row.time_bucket);


      let label: string;


      if (range === "today") {

        label =
          date.toLocaleTimeString(
            "en-US",
            {
              hour: "numeric",
              minute: "2-digit"
            }
          );

      } else if (range === "week") {

        label =
          date.toLocaleDateString(
            "en-US",
            {
              weekday: "short"
            }
          );

      } else {

        label =
          date.toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric"
            }
          );

      }


      return {
        label,
        value: Number(
          Number(row.average_change).toFixed(2)
        )
      };

    });


  return {

    totalStocks: symbols.length,

    gainers,

    losers,

    unchanged,

    data

  };

}