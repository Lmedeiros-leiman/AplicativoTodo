
import { TodoItem, type CreateTodoItemProps } from "../../domain/entities/todo.entity.js";
import type { TodoItemRepository } from "../../domain/repository/todo-item-repository.js";

export class CreateTodoItemUseCase {
    constructor(
        private readonly todoRepository: TodoItemRepository,
    ) { }

    async execute(props: CreateTodoItemProps): Promise<void> {
        const todoItem = TodoItem.create(props);
        await this.todoRepository.save(todoItem);
    }
}
