import "dotenv/config";
import Fastify from "fastify";
import {
    fastifyTRPCPlugin,
    type FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import { appRouter, type AppRouter } from "./app.router.js";
import { appContext } from "./context.js";

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

process.on("SIGTERM", async () => {
    await fastify.close();
    appContext.close();
    process.exit(0);
});

process.on("SIGINT", async () => {
    await fastify.close();
    appContext.close();
    process.exit(0);
});
