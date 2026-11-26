//EDIT - SYNTAXT AND COMMENTS
import "server-only";
import postgres from "postgres";
import { config } from "@/src/backend/config/env";

// In development, Next.js reloads modules often. Keeping the client on
// globalThis stops it from opening a new set of connections on every reload.
const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

export const sql =
  globalForDb.sql ??
  postgres(config.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    // ssl: "require",  // enable only if the real database requires SSL
  });

if (config.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}