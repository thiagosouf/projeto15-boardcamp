import pg from "pg";

const { Pool } = pg;


const db = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "thiago",
  database: "boardcamp"
});

export default db;