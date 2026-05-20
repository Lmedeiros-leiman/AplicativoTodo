import type { TodoItemRepository } from "../../domain/repository/todo-item-repository.js";

export class RestoreTodoUseCase {
    constructor(
        private readonly todoRepository: TodoItemRepository,
    ) { }

    async execute(id: string): Promise<void> {
        const todoItem = await this.todoRepository.findById(id);

        if (!todoItem) {
            throw new Error("Todo item not found");
        }

        todoItem.restoreArchived();
        await this.todoRepository.save(todoItem);
    }
}
