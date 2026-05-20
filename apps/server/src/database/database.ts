import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

/**
 * Resolve o caminho do arquivo SQLite a partir de `DATABASE_URL`.
 * Aceita o formato `file:./dev.db` (padrão Drizzle/Turso) ou caminho direto.
 */
function getDatabasePath(): string {
    const url = process.env.DATABASE_URL ?? "file:./dev.db";
    return url.startsWith("file:") ? url.slice("file:".length) : url;
}

const sqlite = new Database(getDatabasePath());

/**
 * Instância Drizzle tipada com o schema da aplicação.
 * Compartilhada como singleton durante todo o ciclo de vida do processo.
 */
export const db: BetterSQLite3Database<typeof schema> = drizzle(sqlite, { schema });

/**
 * Fecha a conexão SQLite de forma limpa.
 * Chamado nos handlers de `SIGTERM` e `SIGINT` em {@link main}.
 */
export function closeDatabase(): void {
    sqlite.close();
}
