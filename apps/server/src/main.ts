import "dotenv/config";
import Fastify from "fastify";
import {
    fastifyTRPCPlugin,
    type FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import { appRouter, type AppRouter } from "./app.router.js";
import { appContext } from "./context.js";

/**
 * Bootstrap do servidor.
 *
 * - Carrega variáveis de ambiente via dotenv.
 * - Registra o plugin tRPC no prefixo `/trpc`.
 * - Expõe `GET /health` para health-checks.
 * - Escuta na porta `PORT` (default: 3000) em todas as interfaces.
 * - Fecha o banco SQLite ao receber SIGTERM ou SIGINT.
 */

const fastify = Fastify({ logger: true });

await fastify.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
        router: appRouter,
        createContext: () => appContext,
    } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
});

fastify.get("/health", async () => ({ status: "ok" }));

const port = Number(process.env.PORT ?? 3000);

try {
    await fastify.listen({ port, host: "0.0.0.0" });
} catch (err) {
    fastify.log.error(err);
    appContext.close();
    process.exit(1);
}

let isShuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    fastify.log.info({ signal }, "Encerrando servidor...");

    try {
        await fastify.close();
        appContext.close();
        fastify.log.info("Servidor encerrado.");
        process.exit(0);
    } catch (err) {
        fastify.log.error(err, "Falha ao encerrar servidor.");
        process.exit(1);
    }
}

process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
    void shutdown("SIGINT");
});
