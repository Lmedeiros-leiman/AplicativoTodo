import type { TodoItemCategory } from "../../domain/entities/todo.entity.js";
import type { TodoItemRepository } from "../../domain/repository/todo-item-repository.js";

export type ChangeTodoCategoryInput = {
    id: string;
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

        todoItem.changeCategory(input.category);
        await this.todoRepository.save(todoItem);
    }
}
