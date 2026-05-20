import { TodoItem, TodoItemId, type TodoItemCategory, type TodoItemRepository } from "@multitodo/todo-domain";

/** Input para {@link ChangeTodoCategoryUseCase.execute}. */
export type ChangeTodoCategoryInput = {
    id: TodoItemId;
    /** Nova categoria: `work`, `personal` ou `other`. */
    category: TodoItemCategory;
};

/** Altera a categoria de um TodoItem existente. */
export class ChangeTodoCategoryUseCase {
    constructor(
        private readonly todoRepository: TodoItemRepository,
    ) { }

    /**
     * @throws {Error} Se o item não for encontrado.
     */
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
