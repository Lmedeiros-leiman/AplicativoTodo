import { TodoItem, type CreateTodoItemProps, type TodoItemRepository } from "@multitodo/todo-domain";

/**
 * Cria um novo TodoItem e persiste no repositório.
 *
 * Delega a validação das regras de negócio para {@link TodoItem.create}
 * (título/corpo não-vazios, defaults de categoria e status).
 */
export class CreateTodoItemUseCase {
    constructor(
        private readonly todoRepository: TodoItemRepository
    ) { }

    /**
     * @param props - Dados do novo item. `category` e `status` são opcionais.
     * @throws {Error} Se `title` ou `body` forem vazios.
     */
    async execute(props: CreateTodoItemProps): Promise<void> {
        const todoItem = TodoItem.create(props);

        await this.todoRepository.save(todoItem);
    }
}
