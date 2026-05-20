import { router } from "./trpc.js";
import { todosRouter } from "./todos/todos.router.js";

export const appRouter = router({
    todos: todosRouter,
});

export type AppRouter = typeof appRouter;
