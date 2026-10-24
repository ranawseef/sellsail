// MySQL / MariaDB access. One pool per process, kept on globalThis so dev
// hot reloads don't open a new pool each time.
//
// Every query uses placeholders (mysql2 escapes the values). Never build SQL
// from user input with string concatenation; identifiers that vary (table
// names, sort columns) come from fixed allow-lists in code.

import mysql, { type Pool, type PoolConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { runMigrations } from "./migrate.ts";

type Globals = { __ssPool?: Pool; __ssReady?: Promise<void> };
const g = globalThis as unknown as Globals;

function config(): mysql.PoolOptions {
  const url = process.env.DATABASE_URL;
  const base: mysql.PoolOptions = {
    connectionLimit: Number(process.env.DB_POOL_SIZE ?? 8),
    waitForConnections: true,
    queueLimit: 200,
    charset: "utf8mb4_unicode_ci",
    timezone: "Z",
    decimalNumbers: true,
    supportBigNumbers: true,
    bigNumberStrings: false,
    dateStrings: false,
    enableKeepAlive: true,
    multipleStatements: false,
  };
  if (url) return { ...base, uri: url };
  if (!process.env.DB_NAME) {
    throw new Error("Database is not configured: set DATABASE_URL, or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME.");
  }
  return {
    ...base,
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    socketPath: process.env.DB_SOCKET || undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

function pool(): Pool {
  if (!g.__ssPool) {
    const p = mysql.createPool(config());
    // All times are stored and compared in UTC.
    p.on("connection", (conn) => {
      conn.query("SET time_zone = '+00:00'");
    });
    g.__ssPool = p;
  }
  return g.__ssPool;
}

/** Resolves once the schema is up to date. Safe to call from anywhere, any number of times. */
export function dbReady(): Promise<void> {
  if (!g.__ssReady) {
    g.__ssReady = runMigrations(pool()).catch((err) => {
      g.__ssReady = undefined; // let the next caller retry
      throw err;
    });
  }
  return g.__ssReady;
}

export type Row = RowDataPacket;
type Param = string | number | bigint | boolean | Date | null | Buffer | readonly (string | number)[];

/** SELECT returning rows. */
export async function q<T = Row>(sql: string, params: readonly Param[] = []): Promise<T[]> {
  await dbReady();
  const [rows] = await pool().query<RowDataPacket[]>(sql, params as unknown[]);
  return rows as unknown as T[];
}

/** SELECT returning the first row, or null. */
export async function one<T = Row>(sql: string, params: readonly Param[] = []): Promise<T | null> {
  const rows = await q<T>(sql, params);
  return rows[0] ?? null;
}

/** INSERT / UPDATE / DELETE. */
export async function exec(sql: string, params: readonly Param[] = []): Promise<ResultSetHeader> {
  await dbReady();
  const [res] = await pool().query<ResultSetHeader>(sql, params as unknown[]);
  return res;
}

export type Tx = {
  q<T = Row>(sql: string, params?: readonly Param[]): Promise<T[]>;
  exec(sql: string, params?: readonly Param[]): Promise<ResultSetHeader>;
};

function wrap(conn: PoolConnection): Tx {
  return {
    async q<R = Row>(sql: string, params: readonly Param[] = []) {
      const [rows] = await conn.query<RowDataPacket[]>(sql, params as unknown[]);
      return rows as unknown as R[];
    },
    async exec(sql: string, params: readonly Param[] = []) {
      const [res] = await conn.query<ResultSetHeader>(sql, params as unknown[]);
      return res;
    },
  };
}

/**
 * Run fn on one dedicated connection, without a transaction. Needed for
 * connection-scoped state such as GET_LOCK / RELEASE_LOCK.
 */
export async function withConnection<T>(fn: (c: Tx) => Promise<T>): Promise<T> {
  await dbReady();
  const conn: PoolConnection = await pool().getConnection();
  try {
    return await fn(wrap(conn));
  } finally {
    conn.release();
  }
}

/** Run fn inside a transaction; rolled back if it throws. */
export async function tx<T>(fn: (t: Tx) => Promise<T>): Promise<T> {
  await dbReady();
  const conn: PoolConnection = await pool().getConnection();
  const t = wrap(conn);
  try {
    await conn.beginTransaction();
    const out = await fn(t);
    await conn.commit();
    return out;
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}

/** For tests and scripts. */
export async function closePool(): Promise<void> {
  if (g.__ssPool) {
    await g.__ssPool.end();
    g.__ssPool = undefined;
    g.__ssReady = undefined;
  }
}
