import { initTRPC } from "@trpc/server";
import type { AppContext } from "./context.js";

/**
 * Instância tRPC tipada com {@link AppContext}.
 * `router` e `publicProcedure` são os únicos exports necessários —
 * a instância `t` não é exportada para evitar uso acidental fora deste módulo.
 */
const t = initTRPC.context<AppContext>().create();

/** Factory de sub-routers. Usado em `todos.router.ts` e `app.router.ts`. */
export const router = t.router;

/** Procedure base sem autenticação. Ponto de partida de todas as procedures. */
export const publicProcedure = t.procedure;
