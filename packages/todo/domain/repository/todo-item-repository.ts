import type { TodoItem } from "../entities/todo.entity.js";
import type { TodoItemId } from "../value-objects/todo-item-id.js";

export interface TodoItemRepository {
    save(todoItem: TodoItem): Promise<void>;
    findById(id: TodoItemId): Promise<TodoItem | null>;
    findAll(): Promise<TodoItem[]>;
    deleteById(id: TodoItemId): Promise<void>;
}
