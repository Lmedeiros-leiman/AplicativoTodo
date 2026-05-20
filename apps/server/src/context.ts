import { db, closeDatabase } from "./database/database.js";
import { DrizzleTodoItemRepository } from "./todos/drizzle-todo-item.repository.js";
import {
    ArchiveTodoUseCase,
    ChangeTodoBodyUseCase,
    ChangeTodoCategoryUseCase,
    ChangeTodoTitleUseCase,
    CreateTodoItemUseCase,
    MarkTodoCompletedUseCase,
    RestoreTodoUseCase,
    UnmarkTodoCompletedUseCase,
} from "@multitodo/todo-application";

const todoRepository = new DrizzleTodoItemRepository(db);

export const appContext = {
    close: closeDatabase,
    todos: {
        repository: todoRepository,
        create: new CreateTodoItemUseCase(todoRepository),
        changeTitle: new ChangeTodoTitleUseCase(todoRepository),
        changeBody: new ChangeTodoBodyUseCase(todoRepository),
        changeCategory: new ChangeTodoCategoryUseCase(todoRepository),
        markCompleted: new MarkTodoCompletedUseCase(todoRepository),
        unmarkCompleted: new UnmarkTodoCompletedUseCase(todoRepository),
        archive: new ArchiveTodoUseCase(todoRepository),
        restore: new RestoreTodoUseCase(todoRepository),
    },
};

export type AppContext = typeof appContext;
