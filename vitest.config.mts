import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // Logic and API tests run in node; UI tests (*.test.tsx) opt into jsdom with a file comment
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
