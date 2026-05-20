import { TodoItem, TodoItemId, type TodoItemRepository } from "@multitodo/todo-domain";

export type ChangeTodoTitleInput = {
    id: TodoItemId;
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

        const snapshot = todoItem.toSnapshot();

        await this.todoRepository.save(TodoItem.create({
            ...snapshot,
            id: TodoItemId.create(snapshot.id),
            title: input.title,
        }));
    }
}
