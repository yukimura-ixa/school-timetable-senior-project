import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Vitest config specifically for store tests
 * Used to test React 19 + Testing Library compatibility
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["__test__/stores/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**"],
    server: {
      deps: {
        inline: [
          "@prisma/client",
          "@mui/x-data-grid",
          /\.css$/,
        ],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
