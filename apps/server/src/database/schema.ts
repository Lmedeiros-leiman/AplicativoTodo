import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Tabela `todo_items` no SQLite.
 *
 * - `database_id`: chave primária auto-incrementada, usada internamente pelo ORM.
 * - `reference_id`: identificador de negócio único (ex: UUID), exposto pela API.
 * - `category` e `status` são gravados como texto — validação ocorre no mapper.
 * - timestamps armazenados como inteiros Unix (modo `timestamp` do Drizzle).
 */
export const todoItems = sqliteTable("todo_items", {
    databaseId: integer("database_id").primaryKey({ autoIncrement: true }),
    referenceId: text("reference_id").notNull().unique(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    category: text("category").notNull(),
    status: text("status").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    lastlyUpdatedAt: integer("lastly_updated_at", { mode: "timestamp" }).notNull(),
});

/** Tipo inferido de uma linha lida da tabela `todo_items`. */
export type TodoItemRow = typeof todoItems.$inferSelect;
