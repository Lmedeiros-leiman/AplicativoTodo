import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

function getDatabasePath(): string {
    const url = process.env.DATABASE_URL ?? "file:./dev.db";
    return url.startsWith("file:") ? url.slice("file:".length) : url;
}

const sqlite = new Database(getDatabasePath());

export const db: BetterSQLite3Database<typeof schema> = drizzle(sqlite, { schema });

export function closeDatabase(): void {
    sqlite.close();
}
