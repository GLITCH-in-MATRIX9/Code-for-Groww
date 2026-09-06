import { db } from "../database.js";


export interface WatchlistItem {
  id: number;

  symbol: string;

  companyName: string;

  createdAt: Date;

  lastCheckedAt: Date | null;
}


export async function addToWatchlist(
  symbol: string,
  companyName: string
): Promise<WatchlistItem> {

  const normalizedSymbol =
    symbol.trim().toUpperCase();


  const result = await db.query(
    `
      INSERT INTO watchlist_items (
        symbol,
        company_name
      )

      VALUES ($1, $2)

      RETURNING
        id,
        symbol,
        company_name,
        created_at,
        last_checked_at;
    `,
    [
      normalizedSymbol,
      companyName
    ]
  );


  const row = result.rows[0];


  return {
    id: row.id,

    symbol: row.symbol,

    companyName: row.company_name,

    createdAt: row.created_at,

    lastCheckedAt:
      row.last_checked_at ?? null
  };

}


export async function getWatchlist(): Promise<
  WatchlistItem[]
> {

  const result = await db.query(
    `
      SELECT
        id,
        symbol,
        company_name,
        created_at,
        last_checked_at

      FROM watchlist_items

      ORDER BY created_at DESC;
    `
  );


  return result.rows.map((row) => ({
    id: row.id,

    symbol: row.symbol,

    companyName: row.company_name,

    createdAt: row.created_at,

    lastCheckedAt:
      row.last_checked_at ?? null
  }));

}


export async function getWatchlistItem(
  symbol: string
): Promise<WatchlistItem | null> {

  const normalizedSymbol =
    symbol.trim().toUpperCase();


  const result = await db.query(
    `
      SELECT
        id,
        symbol,
        company_name,
        created_at,
        last_checked_at

      FROM watchlist_items

      WHERE symbol = $1

      LIMIT 1;
    `,
    [normalizedSymbol]
  );


  if (result.rows.length === 0) {
    return null;
  }


  const row = result.rows[0];


  return {
    id: row.id,

    symbol: row.symbol,

    companyName: row.company_name,

    createdAt: row.created_at,

    lastCheckedAt:
      row.last_checked_at ?? null
  };

}


export async function updateLastChecked(
  symbol: string
): Promise<void> {

  const normalizedSymbol =
    symbol.trim().toUpperCase();


  await db.query(
    `
      UPDATE watchlist_items

      SET last_checked_at = NOW()

      WHERE symbol = $1;
    `,
    [normalizedSymbol]
  );

}


export async function removeFromWatchlist(
  symbol: string
): Promise<boolean> {

  const normalizedSymbol =
    symbol.trim().toUpperCase();


  const result = await db.query(
    `
      DELETE FROM watchlist_items

      WHERE symbol = $1;
    `,
    [normalizedSymbol]
  );


  return result.rowCount !== 0;

}