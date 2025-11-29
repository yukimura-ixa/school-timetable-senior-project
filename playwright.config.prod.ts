import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load production environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

/**
 * Production Smoke Test Configuration
 *
 * Runs critical E2E tests against the production database (Prisma Accelerate).
 * Use sparingly - only for smoke tests and production verification.
 *
 * Usage:
 *   pnpm test:e2e:prod           # Run production smoke tests
 *   pnpm test:e2e:prod:ui        # Interactive mode
 */

export default defineConfig({
  testDir: "./e2e/smoke",
  fullyParallel: false, // Sequential for production safety
  forbidOnly: true, // Never allow .only() in production tests
  retries: 2, // Retry flaky tests in production
  workers: 1, // Single worker to avoid race conditions

  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/prod-results.json" }],
    ["junit", { outputFile: "test-results/prod-results.xml" }],
  ],

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    // Production auth setup
    {
      name: "prod-setup",
      testMatch: /.*\\.setup\\.ts/,
    },

    // Production smoke tests
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/admin.json",
      },
      dependencies: ["prod-setup"],
    },
  ],

  /* Run dev server with production database */
  webServer: process.env.SKIP_WEBSERVER
    ? undefined
    : {
        command: "pnpm dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120 * 1000,
        stdout: "pipe",
        stderr: "pipe",
        env: {
          ...process.env,
          // ✅ Use production database from .env (Prisma Accelerate)
          // DATABASE_URL is loaded from .env by dotenv above
          NODE_ENV: "development",
        },
      },

  outputDir: "test-results/prod-artifacts",
});
