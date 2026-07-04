import dns from 'node:dns';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

dns.setDefaultResultOrder('ipv4first');

const connectionString = process.env.DATABASE_URL;

const isValidPostgresUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  return url.startsWith('postgresql://') || url.startsWith('postgres://');
};

const pool = new Pool({
  connectionString: isValidPostgresUrl(connectionString)
    ? connectionString
    : 'postgresql://postgres:postgres@localhost:5432/postgres',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err);
});

export const db = drizzle(pool, { schema });
export const isDbConfigured = (): boolean => {
  return isValidPostgresUrl(process.env.DATABASE_URL);
};
export * from './schema';
