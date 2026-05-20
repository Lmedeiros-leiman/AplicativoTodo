import { TodoItem, TodoItemId, type TodoItemRepository } from "@multitodo/todo-domain";

/** Input para {@link ChangeTodoTitleUseCase.execute}. */
export type ChangeTodoTitleInput = {
    id: TodoItemId;
    /** Novo título. Não pode ser vazio após trim. */
    title: string;
};

/** Altera o título de um TodoItem existente. */
export class ChangeTodoTitleUseCase {
    constructor(
        private readonly todoRepository: TodoItemRepository,
    ) { }

    /**
     * @throws {Error} Se o item não for encontrado.
     * @throws {Error} Se o novo título for vazio.
     */
    async execute(input: ChangeTodoTitleInput): Promise<void> {
        const todoItem = await this.todoRepository.findById(input.id);

        if (!todoItem) {
            throw new Error("Todo item not found");
        }

        const snapshot = todoItem.toSnapshot();

        await this.todoRepository.save(TodoItem.create({
            ...snapshot,
            id: TodoItemId.create(snapshot.id),
            title: input.title,
        }));
    }
}
