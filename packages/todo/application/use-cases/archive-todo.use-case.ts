import { TodoItem, TodoItemId, type TodoItemRepository } from "@multitodo/todo-domain";

/**
 * Move um TodoItem para o status `archived`.
 *
 * Itens arquivados não aparecem no fluxo principal mas permanecem
 * persistidos e podem ser restaurados via {@link RestoreTodoUseCase}.
 */
export class ArchiveTodoUseCase {
    constructor(
        private readonly todoRepository: TodoItemRepository,
    ) { }

    /**
     * @param id - Identificador do item a arquivar.
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
            status: "archived",
        }));
    }
}
