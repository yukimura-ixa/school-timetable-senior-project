// get the client
import mysql from 'mysql2/promise';
let pool = null;
// Create the connection pool. The pool-specific settings are the defaults
export function createPool() {
  return mysql.createPool({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "school_timetable",
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
}

export function getPool() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}
