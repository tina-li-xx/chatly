import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "server-only": fileURLToPath(new URL("./test/server-only.ts", import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: ["src/lib/**/*.ts", "app/**/*.ts", "app/**/*.tsx", "instrumentation.ts"]
    },
    restoreMocks: true,
    clearMocks: true,
    mockReset: true
  }
});
