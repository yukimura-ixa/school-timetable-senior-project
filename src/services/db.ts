// get the client
import { Pool } from "mysql2";
import mysql from "mysql2/promise";
let pool: Pool | undefined;
// Create the connection pool. The pool-specific settings are the defaults
export async function getPool(): Promise<Pool> {
  if (pool) {
    return pool;
  }
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "school_timetable",
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

  return pool;
}
