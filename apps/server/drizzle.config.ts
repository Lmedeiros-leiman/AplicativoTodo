import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

export default defineConfig({
    schema: "./src/database/schema.ts",
    out: "./drizzle",
    dialect: "sqlite",
    dbCredentials: {
        url: databaseUrl.startsWith("file:")
            ? databaseUrl.slice("file:".length)
            : databaseUrl,
    },
});
