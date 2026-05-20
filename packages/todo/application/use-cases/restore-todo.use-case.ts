import { TodoItem, TodoItemId, type TodoItemRepository } from "@multitodo/todo-domain";

/**
 * Restaura um TodoItem arquivado de volta para o status `pending`.
 *
 * Caso de uso inverso de {@link ArchiveTodoUseCase}.
 */
export class RestoreTodoUseCase {
    constructor(
        private readonly todoRepository: TodoItemRepository,
    ) { }

    /**
     * @param id - Identificador do item a restaurar.
     * @throws {Error} Se o item não for encontrado.
     */
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
