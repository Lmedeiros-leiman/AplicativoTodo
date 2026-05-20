import { TodoItem, TodoItemId, type TodoItemCategory, type TodoItemStatus } from "@multitodo/todo-domain";
import type { PersistableTodoItem, TodoItemPersistence } from "./todo-item-persistence.js";

const TODO_ITEM_CATEGORIES = ["work", "personal", "other"] as const;
const TODO_ITEM_STATUSES = ["pending", "completed", "archived"] as const;

export class TodoItemPersistenceMapper {
    static toDomain(row: TodoItemPersistence): TodoItem {
        return TodoItem.restore({
            id: TodoItemId.create(row.id.referenceId),
            title: row.title,
            body: row.body,
            category: this.toCategory(row.category),
            status: this.toStatus(row.status)
        });
    }

    static toPersistence(todoItem: TodoItem, databaseId?: number): PersistableTodoItem {
        const snapshot = todoItem.toSnapshot();

        return {
            id: {
                ...(databaseId === undefined ? {} : { databaseId }),
                referenceId: snapshot.id,
            },
            title: snapshot.title,
            body: snapshot.body,
            category: snapshot.category,
            status: snapshot.status,
        };
    }

    private static toCategory(category: string): TodoItemCategory {
        if (TODO_ITEM_CATEGORIES.includes(category as TodoItemCategory)) {
            return category as TodoItemCategory;
        }

        throw new Error(`Invalid todo item category: ${category}`);
    }

    private static toStatus(status: string): TodoItemStatus {
        if (TODO_ITEM_STATUSES.includes(status as TodoItemStatus)) {
            return status as TodoItemStatus;
        }

        throw new Error(`Invalid todo item status: ${status}`);
    }
}
