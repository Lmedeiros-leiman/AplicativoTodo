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

/**
 * Contexto singleton da aplicação: agrega a conexão com o banco,
 * o repositório e todos os use-cases instanciados.
 *
 * É injetado em cada procedure tRPC via `createContext` em {@link main}.
 * Por ser singleton, todos os requests compartilham as mesmas instâncias —
 * adequado para SQLite, que é single-writer por natureza.
 */
export const appContext = {
    /** Fecha a conexão SQLite. Chamado no shutdown do processo. */
    close: closeDatabase,
    todos: {
        /** Repositório Drizzle. Acesso direto para queries sem use-case dedicado. */
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

/** Tipo do contexto injetado nas procedures tRPC. */
export type AppContext = typeof appContext;
