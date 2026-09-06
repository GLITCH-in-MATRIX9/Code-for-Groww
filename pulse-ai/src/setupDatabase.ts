import { db } from "./database.js";


async function setupDatabase() {

  console.log(
    "Setting up Pulse database...\n"
  );


  try {

    // --------------------------------
    // WATCHLIST ITEMS
    // --------------------------------

    await db.query(`
      CREATE TABLE IF NOT EXISTS watchlist_items (

        id SERIAL PRIMARY KEY,

        symbol VARCHAR(20)
          NOT NULL
          UNIQUE,

        company_name VARCHAR(255)
          NOT NULL,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP

      );
    `);


    console.log(
      "✓ watchlist_items table ready"
    );


    // --------------------------------
    // STOCK SNAPSHOTS
    // --------------------------------

    await db.query(`
      CREATE TABLE IF NOT EXISTS stock_snapshots (

        id SERIAL PRIMARY KEY,

        symbol VARCHAR(20)
          NOT NULL,

        price DECIMAL(15, 4)
          NOT NULL,

        price_change DECIMAL(10, 4),

        volume BIGINT,

        average_volume BIGINT,

        volume_ratio DECIMAL(10, 4),

        volatility_change DECIMAL(10, 4),

        meaningfulness_score INTEGER,

        severity VARCHAR(20),

        reasons JSONB,

        news_headline TEXT,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP

      );
    `);


    console.log(
      "✓ stock_snapshots table ready"
    );


    // --------------------------------
    // INDEX
    // --------------------------------

    await db.query(`
      CREATE INDEX IF NOT EXISTS
      idx_stock_snapshots_symbol_created_at

      ON stock_snapshots (
        symbol,
        created_at DESC
      );
    `);


    console.log(
      "✓ snapshot index ready"
    );


    console.log(
      "\n========== DATABASE SETUP COMPLETE ==========\n"
    );


  } catch (error) {

    console.error(
      "\nDatabase setup failed:"
    );

    console.error(error);

  } finally {

    await db.end();

  }

}


setupDatabase();