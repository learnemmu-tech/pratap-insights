import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as { url?: string; sql?: ReturnType<typeof postgres>; db?: Database };

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!globalForDb.db || globalForDb.url !== url) {
    void globalForDb.sql?.end({ timeout: 1 });
    globalForDb.url = url;
    globalForDb.sql = postgres(url, { max: 5, connect_timeout: 10, prepare: false });
    globalForDb.db = drizzle(globalForDb.sql, { schema });
  }
  return globalForDb.db;
}

export type Db = NonNullable<ReturnType<typeof getDb>>;
