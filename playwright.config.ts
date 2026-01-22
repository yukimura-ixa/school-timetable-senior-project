import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import os from "os";
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
  // Keep production (deployed) smoke suite isolated; it runs with playwright.config.prod.ts.
  // Without this, *.setup.ts files under e2e/prod can be picked up by the default 'setup' project,
  // breaking CI smoke/visual runs that don't provide E2E_* secrets.
  testIgnore: ["**/prod/**"],
  // CI: Sequential for stability (source of truth).
  // Local: Parallel with limited workers to avoid resource contention.
  fullyParallel: !process.env.CI,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // CI: 1 worker (stable, sequential - source of truth)
  // Local: 4 workers max to balance speed vs dev server load
  workers: process.env.CI ? 1 : Math.min(4, os.cpus().length),
  // Reduce local timeout since dev server should be warm after first test
  // CI uses longer timeout for cold start + retries
  timeout: process.env.CI ? 150000 : 60000,

  /* Global setup/teardown - manages test database lifecycle */
  globalSetup: path.resolve(__dirname, "playwright.global-setup.ts"),
  globalTeardown: path.resolve(__dirname, "playwright.global-teardown.ts"),

  /* Expect timeout for assertions (visibility, etc.) */
  expect: {
    timeout: process.env.CI ? 90000 : 30000,
  },

  reporter: process.env.CI
    ? [
        ["list"],
        ["json", { outputFile: "test-results/results.json" }],
        ["junit", { outputFile: junitOutput }],
        ["html", { outputFolder: "playwright-report", open: "never" }],
      ]
    : [
        ["list"],
        ["json", { outputFile: "test-results/results.json" }],
        ["html", { open: "on-failure" }],
      ],

  /* Visual testing configuration */
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixels: 200,
    },
  },

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3005",
    // Reduce trace overhead: only on retry for debugging
    trace: "on-first-retry",
    // Optimize artifacts: screenshots only on failure, no videos locally
    screenshot: "only-on-failure",
    video: process.env.CI ? "off" : "off", // Disable video locally for speed
    // Reduce action timeout locally (dev server should be warm)
    actionTimeout: process.env.CI ? 30000 : 10000,
    // Navigation timeout: increased for CI compilation overhead
    navigationTimeout: process.env.CI ? 90000 : 30000,
    // Reuse browser context state for faster test isolation
    launchOptions: {
      // Disable GPU for faster headless mode
      args: ["--disable-gpu", "--disable-dev-shm-usage"],
    },
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

    // Visual regression testing project
    {
      name: "visual",
      testMatch: /visual\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/admin.json",
      },
      dependencies: ["setup"],
    },
  ],

  /* Run your local dev server before starting the tests */
  /* 
   * Issue #5 (HIGH-02): Configure E2E tests to use prod build locally
   * 
   * Use PROD_BUILD=true to test against production build instead of dev server:
   *   PROD_BUILD=true pnpm test:e2e
   * 
   * This avoids slow dev compilation timeouts and tests the actual build output.
   * Before running, ensure you've built the project:
   *   pnpm build
   */
  webServer: process.env.SKIP_WEBSERVER
    ? undefined
    : {
        // CI: always use production build
        // Local: use prod build if PROD_BUILD=true, otherwise dev server
        command:
          process.env.CI === "true" || process.env.PROD_BUILD === "true"
            ? "pnpm exec dotenv -e .env.test.local -- next start -p 3005"
            : "pnpm exec dotenv -e .env.test.local -- next dev -p 3005",
        url: "http://localhost:3005",
        reuseExistingServer: false,
        timeout: 120 * 1000,
        stdout: "pipe", // Changed from 'ignore' to see startup logs
        stderr: "pipe",
        env: {
          ...process.env,
          // Use separate build directory for tests to avoid conflicts with dev .next
          ...(process.env.CI === "true" || process.env.PROD_BUILD === "true"
            ? {}
            : { NEXT_DIST_DIR: process.env.NEXT_DIST_DIR ?? ".next-test" }),
          // ✅ CRITICAL: Force dev server to use test database
          // This ensures the server reads from the same database that E2E setup seeds
          DATABASE_URL:
            process.env.DATABASE_URL ||
            "postgresql://test_user:test_password@localhost:5433/test_timetable?schema=public&connection_limit=10",
          NODE_ENV:
            process.env.CI === "true" || process.env.PROD_BUILD === "true"
              ? "production"
              : (process.env.NODE_ENV ?? "development"),
        },
      },

  /* Test output directories */
  outputDir: "test-results/artifacts",
});
