import type { TodoItemRepository } from "../../domain/repository/todo-item-repository.js";

export type ChangeTodoBodyInput = {
    id: string;
    body: string;
};

export class ChangeTodoBodyUseCase {
    constructor(
        private readonly todoRepository: TodoItemRepository,
    ) { }

    async execute(input: ChangeTodoBodyInput): Promise<void> {
        const todoItem = await this.todoRepository.findById(input.id);

        if (!todoItem) {
            throw new Error("Todo item not found");
        }

        todoItem.changeBody(input.body);
        await this.todoRepository.save(todoItem);
    }
}
