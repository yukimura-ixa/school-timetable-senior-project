import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Vitest config specifically for server action tests
 * Used to test management server actions with mocked Next.js context
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["__test__/management-server-actions.test.ts"],
    exclude: ["**/node_modules/**"],
    server: {
      deps: {
        inline: [
          "@prisma/client",
          /\.css$/,
        ],
      },
    },
  },
  resolve: {
    alias: {
      "@/public": path.resolve(__dirname, "./public"),
      "@/prisma/generated/client": path.resolve(
        __dirname,
        "./prisma/generated/client",
      ),
      "@/prisma/generated": path.resolve(__dirname, "./app/generated/prisma"),
      "@/": path.resolve(__dirname, "./src/"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
