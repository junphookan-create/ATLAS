import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

declare global {
  var _postgresPool: pg.Pool | undefined;
  var _drizzleDb: any | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const host = process.env.SQL_HOST || process.env.PGHOST || '127.0.0.1';
    const user = process.env.SQL_USER || process.env.PGUSER || 'postgres';
    const password = process.env.SQL_PASSWORD || process.env.PGPASSWORD || '';
    const database = process.env.SQL_DB_NAME || process.env.PGDATABASE || 'postgres';
    const connectionString = process.env.DATABASE_URL;

    global._postgresPool = new Pool(
      connectionString
        ? { connectionString, max: 10, connectionTimeoutMillis: 5000 }
        : { host, user, password, database, max: 10, connectionTimeoutMillis: 5000 }
    );

    global._postgresPool.on('error', (err) => {
      console.warn('Postgres SQL pool error (non-fatal):', err.message);
    });
  }
  return global._postgresPool;
};

export const getDb = () => {
  if (!global._drizzleDb) {
    const pool = createPool();
    global._drizzleDb = drizzle(pool, { schema });
  }
  return global._drizzleDb;
};

// Proxy export for backward compatibility
export const db = new Proxy({} as any, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

