import { TodoItem } from "../entities/todo.entity";


export interface TodoItemRepository {
    save(todoItem: TodoItem): Promise<void>;
    findById(id: string): Promise<TodoItem | null>;
    findAll(): Promise<TodoItem[]>;
    deleteById(id: string): Promise<void>;
}