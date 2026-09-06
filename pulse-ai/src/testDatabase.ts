import { db } from "./database.js";


async function main() {

  console.log(
    "Connecting to Neon database...\n"
  );


  try {

    const result =
      await db.query(
        "SELECT NOW() AS current_time"
      );


    console.log(
      "========== DATABASE CONNECTED ==========\n"
    );

    console.log(
      "Current database time:"
    );

    console.log(
      result.rows[0].current_time
    );


    console.log(
      "\n========== TEST COMPLETE ==========\n"
    );


  } catch (error) {

    console.error(
      "\nDatabase connection failed:"
    );

    console.error(error);

  } finally {

    await db.end();

  }

}


main();