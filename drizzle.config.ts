import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env", quiet: true });
config({ path: ".env.local", override: true, quiet: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL_NOT_CONFIGURED");
}

const parsedUrl = new URL(databaseUrl);
const sslMode = parsedUrl.searchParams.get("sslmode") ?? "require";
const ssl =
  sslMode === "disable"
    ? false
    : sslMode === "allow" || sslMode === "prefer" || sslMode === "require" || sslMode === "verify-full"
      ? sslMode
      : true;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/drizzle/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port || 5432),
    user: decodeURIComponent(parsedUrl.username),
    password: decodeURIComponent(parsedUrl.password),
    database: parsedUrl.pathname.replace(/^\//, ""),
    ssl
  },
  strict: true,
  verbose: true
});
