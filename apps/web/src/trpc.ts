import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@multitodo/server";

export const trpc = createTRPCReact<AppRouter>();
