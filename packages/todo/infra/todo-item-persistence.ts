import type { TodoItemCategory, TodoItemStatus } from "@multitodo/todo-domain";

export type TodoItemPersistenceId = {
    databaseId: number;
    referenceId: string;
};

export type TodoItemPersistence = {
    id: TodoItemPersistenceId;

    title: string;
    body: string;
    category: string;
    status: string;

    createdAt: Date;
    lastlyUpdatedAt: Date;
};

export type PersistableTodoItemId = {
    databaseId?: number;
    referenceId: string;
};

export type PersistableTodoItem = {
    id: PersistableTodoItemId;
    title: string;
    body: string;
    category: TodoItemCategory;
    status: TodoItemStatus;
};
