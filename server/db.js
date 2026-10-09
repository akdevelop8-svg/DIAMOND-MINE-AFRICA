import { Pool } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || '';
let pool = null;

function getPool() {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured. Create a Neon Postgres database and add DATABASE_URL to your environment.');
  }
  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      max: Number(process.env.DB_POOL_MAX || 5),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
}

export async function query(text, params = []) {
  return getPool().query(text, params);
}

export async function withTransaction(work) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    client.release();
  }
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
