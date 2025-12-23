import { defineConfig } from "vitest/config";
import path from "path";

export const TEST_PATH_IGNORE_PATTERNS = [
  "**/node_modules/**",
  "**/.next/**",
  "**/e2e/**",
  "**/__test__/stores/**", // Skip until React 19 + Testing Library compatible (Issue #53)
  "**/__test__/integration/**", // Skip until converted to E2E tests (Issue #55)
  "**/__test__/features/teaching-assignment/teaching-assignment.repository.test.ts", // Covered by heavy Playwright regression workflow
  "**/__test__/features/teaching-assignment/teacher-validation.service.test.ts", // Duplicated by dedicated heavy suite run
  "**/__test__/features/conflict/**",
  "**/__test__/features/program/**",
  // Note: src/features/schedule-arrangement tests are now included
  "**/__test__/moe-standards/**",
  "**/__test__/features/dashboard/**",
  "**/__test__/features/lock/**",
  "**/__test__/lib/feature-flags.test.ts",
  "**/__test__/seed-validation.test.ts",
  "**/__test__/management-server-actions.test.ts",
  "**/compliance.repository.test.ts",
  // Server actions requiring Next.js request context (headers())
  "**/config-lifecycle.actions.test.ts",
];

export default defineConfig({
  test: {
    // Enable Jest-compatible globals (describe, it, expect)
    globals: true,

    // Test environment - use happy-dom for DOM tests
    // Can be overridden per-file with @vitest-environment directive
    environment: "node",

    // Setup files
    setupFiles: ["./vitest.setup.ts"],

    // Include test files
    include: [
      "__test__/**/*.{test,spec}.{ts,tsx}",
      "src/**/*.{test,spec}.{ts,tsx}",
    ],

    // Exclude patterns (same as Jest testPathIgnorePatterns)
    exclude: TEST_PATH_IGNORE_PATTERNS,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
    },

    // Jest-compatible hook execution order
    sequence: {
      hooks: "list",
    },

    // Parallel execution (Vitest 4 uses threads by default)
    // Note: poolOptions was removed in Vitest 4

    // Inline dependencies that need transformation (ESM modules)
    server: {
      deps: {
        inline: [
          "next-auth",
          "@auth/core",
          "@prisma/client",
          "@mui/x-data-grid", // Has CSS imports
          // Inline all CSS to avoid extension errors
          /\.css$/,
        ],
      },
    },

    // CSS handling for component tests
    css: {
      modules: {
        classNameStrategy: "stable",
      },
    },
  },

  resolve: {
    alias: {
      // Handle module aliases from tsconfig.json paths
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
