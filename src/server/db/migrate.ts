// Applies pending migrations once per process. A named MySQL lock makes sure
// two processes starting at once (Passenger can start several) don't both
// run them. Each migration is recorded only after all its statements ran.

import type { Pool } from "mysql2/promise";
import { migrations } from "./migrations";

export async function runMigrations(pool: Pool): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.query("SET time_zone = '+00:00'");
    const [lockRows] = await conn.query("SELECT GET_LOCK('sellsail_migrate', 60) AS got");
    if ((lockRows as { got: number }[])[0]?.got !== 1) {
      throw new Error("Could not take the migration lock within 60s");
    }
    try {
      await conn.query(
        `CREATE TABLE IF NOT EXISTS schema_migrations (
          id         VARCHAR(64) NOT NULL,
          applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      );
      const [rows] = await conn.query("SELECT id FROM schema_migrations");
      const done = new Set((rows as { id: string }[]).map((r) => r.id));

      for (const m of migrations) {
        if (done.has(m.id)) continue;
        // MySQL DDL commits implicitly, so a migration can't be one
        // transaction. Statements are written so a re-run after a partial
        // failure is safe to fix by hand; the log names the one that failed.
        for (const [i, sql] of m.statements.entries()) {
          try {
            await conn.query(sql);
          } catch (err) {
            throw new Error(`Migration ${m.id} statement ${i + 1} failed: ${(err as Error).message}`);
          }
        }
        await conn.query("INSERT INTO schema_migrations (id) VALUES (?)", [m.id]);
        console.log(`[db] applied migration ${m.id}`);
      }
    } finally {
      await conn.query("SELECT RELEASE_LOCK('sellsail_migrate')");
    }
  } finally {
    conn.release();
  }
}
