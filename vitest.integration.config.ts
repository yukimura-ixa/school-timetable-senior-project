import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Vitest config for DB-backed program integration tests.
 *
 * These require a SEEDED database. The default unit run (vitest.config.ts) uses
 * a dummy DATABASE_URL and excludes them via TEST_PATH_IGNORE_PATTERNS, so they
 * run here instead — in the seeded "Integration Tests" CI job, or locally
 * against the docker test DB (`pnpm test:db:up && pnpm test:db:migrate &&
 * pnpm test:db:seed`).
 *
 * fileParallelism is disabled: several specs create a throwaway program in a
 * free (Year, Track) slot, and parallel files could race for the same slot and
 * hit the @@unique([Year, Track]) constraint.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    fileParallelism: false,
    sequence: { hooks: "list" },
    include: [
      "__test__/features/program/program-repository-effective.test.ts",
      "__test__/features/program/program-validation-effective.test.ts",
      "__test__/features/program/seed-effective-parity.test.ts",
      "__test__/features/program/program-display-reads-effective.test.ts",
      "__test__/features/program/assign-subjects-guard.test.ts",
      "__test__/features/program/fundamental-override.test.ts",
    ],
    exclude: ["**/node_modules/**"],
    server: {
      deps: {
        inline: ["@prisma/client", /\.css$/],
      },
    },
  },
  resolve: {
    alias: {
      "@/public": path.resolve(__dirname, "./public"),
      "@/prisma/data": path.resolve(__dirname, "./prisma/data"),
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
