import { TodoItem, TodoItemId, type TodoItemRepository } from "@multitodo/todo-domain";

export class ArchiveTodoUseCase {
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
            status: "archived",
        }));
    }
}
