import type { TodoItemRepository } from "../../domain/repository/todo-item-repository.js";

export type ChangeTodoTitleInput = {
    id: string;
    title: string;
};

export class ChangeTodoTitleUseCase {
    constructor(
        private readonly todoRepository: TodoItemRepository,
    ) { }

    async execute(input: ChangeTodoTitleInput): Promise<void> {
        const todoItem = await this.todoRepository.findById(input.id);

        if (!todoItem) {
            throw new Error("Todo item not found");
        }

        todoItem.changeTitle(input.title);
        await this.todoRepository.save(todoItem);
    }
}
