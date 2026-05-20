import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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

export type TodoItemRow = typeof todoItems.$inferSelect;
