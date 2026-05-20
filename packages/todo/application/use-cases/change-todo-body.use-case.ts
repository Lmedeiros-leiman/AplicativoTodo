import { TodoItem, TodoItemId, type TodoItemRepository } from "@multitodo/todo-domain";

/** Input para {@link ChangeTodoBodyUseCase.execute}. */
export type ChangeTodoBodyInput = {
    id: TodoItemId;
    /** Novo corpo. Não pode ser vazio após trim. */
    body: string;
};

/** Altera o corpo (descrição) de um TodoItem existente. */
export class ChangeTodoBodyUseCase {
    constructor(
        private readonly todoRepository: TodoItemRepository,
    ) { }

    /**
     * @throws {Error} Se o item não for encontrado.
     * @throws {Error} Se o novo corpo for vazio.
     */
    async execute(input: ChangeTodoBodyInput): Promise<void> {
        const todoItem = await this.todoRepository.findById(input.id);

        if (!todoItem) {
            throw new Error("Todo item not found");
        }

        const snapshot = todoItem.toSnapshot();

        await this.todoRepository.save(TodoItem.create({
            ...snapshot,
            id: TodoItemId.create(snapshot.id),
            body: input.body,
        }));
    }
}
