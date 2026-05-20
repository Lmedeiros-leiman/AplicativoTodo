import { router } from "./trpc.js";
import { todosRouter } from "./todos/todos.router.js";

/**
 * Router raiz da aplicação. Agrega todos os sub-routers por namespace.
 *
 * O frontend importa apenas o tipo {@link AppRouter} — nunca o valor —
 * para inferir os tipos das procedures sem incluir código de servidor no bundle.
 *
 * @example
 * ```ts
 * import type { AppRouter } from "@multitodo/server";
 * ```
 */
export const appRouter = router({
    todos: todosRouter,
});

/** Tipo exportado para o cliente tRPC. Importar sempre como `import type`. */
export type AppRouter = typeof appRouter;
