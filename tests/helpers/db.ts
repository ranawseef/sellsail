// Database tests run against a throwaway MySQL/MariaDB database named in
// TEST_DATABASE_URL, and are skipped when it isn't set. Every table in that
// database is dropped first, so never point it at real data.

import mysql from "mysql2/promise";

export const TEST_DB = process.env.TEST_DATABASE_URL ?? "";
export const skipDb = TEST_DB ? false : "TEST_DATABASE_URL not set";

if (TEST_DB) {
  if (!/test/i.test(new URL(TEST_DB).pathname)) {
    throw new Error("TEST_DATABASE_URL must name a database with 'test' in it; its tables are dropped.");
  }
  process.env.DATABASE_URL = TEST_DB;
}

export async function resetDatabase(): Promise<void> {
  const conn = await mysql.createConnection({ uri: TEST_DB, multipleStatements: false });
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    const [rows] = await conn.query("SHOW TABLES");
    for (const r of rows as Record<string, string>[]) {
      const name = Object.values(r)[0];
      await conn.query(`DROP TABLE IF EXISTS \`${name.replace(/`/g, "")}\``);
    }
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
  } finally {
    await conn.end();
  }
}
