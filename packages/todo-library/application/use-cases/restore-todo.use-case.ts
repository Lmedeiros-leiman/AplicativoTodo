import { TodoItem } from "../../domain/entities/todo.entity.js";
import type { TodoItemRepository } from "../../domain/repository/todo-item-repository.js";
import { TodoItemId } from "../../domain/value-objects/todo-item-id.js";

export class RestoreTodoUseCase {
    constructor(
        private readonly todoRepository: TodoItemRepository,
    ) { }

    async execute(id: TodoItemId): Promise<void> {
        const todoItem = await this.todoRepository.findById(id);

        if (!todoItem) {
            throw new Error("Todo item not found");
        }

        const snapshot = todoItem.toSnapshot();

        await this.todoRepository.save(TodoItem.restore({
            ...snapshot,
            id: TodoItemId.create(snapshot.id),
            status: "pending",
        }));
    }
}
