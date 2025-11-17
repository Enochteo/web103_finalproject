import pg from "pg";
import "./dotenv.js";

const connectionString =
  process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING || null;

const config = connectionString
  ? {
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      database: process.env.PGDATABASE,
      ssl: {
        rejectUnauthorized: false,
      },
    };

const pool = new pg.Pool(config);

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export { pool };
