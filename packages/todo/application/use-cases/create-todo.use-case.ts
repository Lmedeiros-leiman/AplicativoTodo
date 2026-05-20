import { TodoItem, type CreateTodoItemProps, type TodoItemRepository } from "@multitodo/todo-domain";

export class CreateTodoItemUseCase {
    constructor(
        private readonly todoRepository: TodoItemRepository
    ) { }

    async execute(props: CreateTodoItemProps): Promise<void> {
        const todoItem = TodoItem.create(props);

        await this.todoRepository.save(todoItem);
    }
}
