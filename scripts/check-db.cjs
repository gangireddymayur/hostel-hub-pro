const mysql = require("mysql2/promise");

async function main() {
  const {
    DB_HOST = "localhost",
    DB_PORT = "3306",
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
  } = process.env;

  if (!DB_USER || !DB_PASSWORD || !DB_NAME) {
    console.log("DB env vars are missing. Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME to check connectivity.");
    process.exit(0);
  }

  const pool = mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 2,
  });

  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    console.log(JSON.stringify(rows[0]));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
