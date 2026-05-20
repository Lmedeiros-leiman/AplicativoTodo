import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { TodoItem, TodoItemId, type TodoItemRepository } from "@multitodo/todo-domain";
import { TodoItemPersistenceMapper, type TodoItemPersistence } from "@multitodo/todo-infra";
import { todoItems, type TodoItemRow } from "../database/schema.js";
import type * as schema from "../database/schema.js";

export class DrizzleTodoItemRepository implements TodoItemRepository {
    constructor(private readonly db: BetterSQLite3Database<typeof schema>) { }

    async save(todoItem: TodoItem): Promise<void> {
        const persistence = TodoItemPersistenceMapper.toPersistence(todoItem);
        const now = new Date();

        await this.db
            .insert(todoItems)
            .values({
                referenceId: persistence.id.referenceId,
                title: persistence.title,
                body: persistence.body,
                category: persistence.category,
                status: persistence.status,
                createdAt: now,
                lastlyUpdatedAt: now,
            })
            .onConflictDoUpdate({
                target: todoItems.referenceId,
                set: {
                    title: persistence.title,
                    body: persistence.body,
                    category: persistence.category,
                    status: persistence.status,
                    lastlyUpdatedAt: now,
                },
            });
    }

    async findById(id: TodoItemId): Promise<TodoItem | null> {
        const row = await this.db.query.todoItems.findFirst({
            where: eq(todoItems.referenceId, id.toString()),
        });

        if (!row) return null;

        return TodoItemPersistenceMapper.toDomain(this.toPersistence(row));
    }

    async findAll(): Promise<TodoItem[]> {
        const rows = await this.db.query.todoItems.findMany();
        return rows.map(row => TodoItemPersistenceMapper.toDomain(this.toPersistence(row)));
    }

    async deleteById(id: TodoItemId): Promise<void> {
        await this.db
            .delete(todoItems)
            .where(eq(todoItems.referenceId, id.toString()));
    }

    private toPersistence(row: TodoItemRow): TodoItemPersistence {
        return {
            id: {
                databaseId: row.databaseId,
                referenceId: row.referenceId,
            },
            title: row.title,
            body: row.body,
            category: row.category,
            status: row.status,
            createdAt: row.createdAt,
            lastlyUpdatedAt: row.lastlyUpdatedAt,
        };
    }
}
