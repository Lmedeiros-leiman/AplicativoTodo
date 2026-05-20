import { TodoItem, TodoItemId, type TodoItemRepository } from "@multitodo/todo-domain";

export type ChangeTodoBodyInput = {
    id: TodoItemId;
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

        const snapshot = todoItem.toSnapshot();

        await this.todoRepository.save(TodoItem.create({
            ...snapshot,
            id: TodoItemId.create(snapshot.id),
            body: input.body,
        }));
    }
}
