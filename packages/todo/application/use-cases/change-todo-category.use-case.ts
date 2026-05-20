import { TodoItem, TodoItemId, type TodoItemCategory, type TodoItemRepository } from "@multitodo/todo-domain";

export type ChangeTodoCategoryInput = {
    id: TodoItemId;
    category: TodoItemCategory;
};

export class ChangeTodoCategoryUseCase {
    constructor(
        private readonly todoRepository: TodoItemRepository,
    ) { }

    async execute(input: ChangeTodoCategoryInput): Promise<void> {
        const todoItem = await this.todoRepository.findById(input.id);

        if (!todoItem) {
            throw new Error("Todo item not found");
        }

        const snapshot = todoItem.toSnapshot();

        await this.todoRepository.save(TodoItem.restore({
            ...snapshot,
            id: TodoItemId.create(snapshot.id),
            category: input.category,
        }));
    }
}
