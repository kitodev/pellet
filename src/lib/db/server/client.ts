import mysql from 'mysql2/promise';
import { serverEnv } from './env';

const globalForDb = globalThis as unknown as { pelletPool?: mysql.Pool };

/** Shared MySQL connection pool (reused across hot reloads in dev). */
export function db(): mysql.Pool {
  if (!globalForDb.pelletPool) {
    globalForDb.pelletPool = mysql.createPool({
      uri: serverEnv().databaseUrl,
      connectionLimit: 10,
      charset: 'utf8mb4',
      timezone: 'Z',
      dateStrings: false,
    });
  }
  return globalForDb.pelletPool;
}
