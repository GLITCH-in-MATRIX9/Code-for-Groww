import "dotenv/config";
import { Pool } from "pg";




const connectionString =
  process.env.DATABASE_URL;


if (!connectionString) {

  throw new Error(
    "DATABASE_URL is not defined in .env"
  );

}


export const db = new Pool({
  connectionString
});