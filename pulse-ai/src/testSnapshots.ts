import { db } from "./database.js";


async function main() {

  const result =
    await db.query(`
      SELECT
        id,
        symbol,
        price,
        meaningfulness_score,
        severity,
        news_headline,
        created_at

      FROM stock_snapshots

      ORDER BY created_at DESC

      LIMIT 10;
    `);


  console.log(
    "\n========== SAVED SNAPSHOTS ==========\n"
  );


  console.table(
    result.rows
  );


  await db.end();

}


main();