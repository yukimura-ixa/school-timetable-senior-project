import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, ".env.test") });

const junitOutput =
  process.env.PLAYWRIGHT_JUNIT_OUTPUT_FILE ?? "test-results/results.xml";

/**
 * E2E Test Configuration for School Timetable System
 * See https://playwright.dev/docs/test-configuration
 */
console.log("SKIP_WEBSERVER:", process.env.SKIP_WEBSERVER);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true, // ✅ Run tests in parallel
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined, // ✅ 4 parallel workers in CI, all cores locally

  /* Global setup/teardown - manages test database lifecycle */
  globalSetup: path.resolve(__dirname, "playwright.global-setup.ts"),
  globalTeardown: path.resolve(__dirname, "playwright.global-teardown.ts"),

  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: junitOutput }],
  ],

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    // Optimize CI artifacts: disable videos in CI, keep screenshots only on failure
    screenshot: process.env.CI ? "only-on-failure" : "only-on-failure",
    video: process.env.CI ? "off" : "retain-on-failure",
    actionTimeout: 10000, // Reduced from 15s → 10s (actions should be faster)
    navigationTimeout: 20000, // Reduced from 30s → 20s (pages should load faster)
  },

  projects: [
    // Setup project - runs authentication once and saves state
    // This runs before all other tests
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    // Main test project - uses saved authentication state
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use saved authentication state from setup project
        // This eliminates repeated login steps in every test
        storageState: "playwright/.auth/admin.json",
      },
      dependencies: ["setup"],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.SKIP_WEBSERVER
    ? undefined
    : {
        // In CI, reuse the production build to avoid dev compile latency
        // and HMR stalls that were causing widespread selector timeouts.
        command:
          process.env.CI === "true"
            ? "pnpm exec next start -p 3000"
            : "pnpm dev:e2e",
        url: "http://localhost:3000",
        reuseExistingServer: true, // ✅ Always reuse - prevents port conflicts
        timeout: 120 * 1000,
        stdout: "pipe", // Changed from 'ignore' to see startup logs
        stderr: "pipe",
        env: {
          ...process.env,
          NODE_ENV:
            process.env.CI === "true"
              ? "production"
              : process.env.NODE_ENV ?? "development",
        },
      },

/* Test output directories */
  outputDir: "test-results/artifacts",
});
