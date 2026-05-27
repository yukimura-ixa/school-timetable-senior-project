import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, ".env.test") });

/**
 * Isolated E2E config for the clean-publish happy path (task kjm).
 *
 * Runs ONLY e2e/25-publish-happy.spec.ts against a dedicated minimal, globally
 * MOE-compliant seed (playwright.publish-happy.global-setup.ts). Kept fully
 * separate from playwright.config.ts so its TRUNCATE+tiny-world seed never
 * collides with the 18-grade demo the main suite expects.
 *
 *   pnpm test:e2e:publish-happy
 */

// Dedicated auth storage so this suite can't corrupt the main suite's session.
const AUTH_FILE = path.resolve(
  __dirname,
  "playwright/.auth/admin-publish-happy.json",
);
process.env.PLAYWRIGHT_AUTH_FILE = AUTH_FILE;

export default defineConfig({
  testDir: "./e2e",
  // Keep the deployed-prod smoke setup out; its *.setup.ts needs E2E_* secrets.
  testIgnore: ["**/prod/**"],
  testMatch: ["**/25-publish-happy.spec.ts", "**/auth.setup.ts"],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: process.env.CI ? 150000 : 60000,

  globalSetup: path.resolve(__dirname, "playwright.publish-happy.global-setup.ts"),

  expect: { timeout: process.env.CI ? 90000 : 30000 },

  reporter: [["list"]],

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: process.env.CI ? 30000 : 10000,
    navigationTimeout: process.env.CI ? 90000 : 60000,
    launchOptions: { args: ["--disable-gpu", "--disable-dev-shm-usage"] },
  },

  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      testMatch: /25-publish-happy\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_FILE,
      },
      dependencies: ["setup"],
    },
  ],

  webServer: process.env.SKIP_WEBSERVER
    ? undefined
    : {
        command:
          process.env.CI === "true" || process.env.PROD_BUILD === "true"
            ? "pnpm exec dotenv -e .env.test.local -- next start -p 3000"
            : "pnpm exec dotenv -e .env.test.local -- next dev -p 3000",
        url: "http://localhost:3000",
        reuseExistingServer: false,
        timeout: 120 * 1000,
        stdout: "pipe",
        stderr: "pipe",
        env: {
          ...process.env,
          ...(process.env.CI === "true" || process.env.PROD_BUILD === "true"
            ? {}
            : { NEXT_DIST_DIR: process.env.NEXT_DIST_DIR ?? ".next-test" }),
          // Minimal-world health-check minimums (see /api/health/db). Matches
          // the publish-happy seed so auth.setup's readiness gate passes.
          HEALTH_MIN_TEACHERS: "1",
          HEALTH_MIN_SCHEDULES: "5",
          HEALTH_MIN_TIMESLOTS: "5",
          HEALTH_MIN_GRADES: "1",
          HEALTH_MIN_SUBJECTS: "8",
          DATABASE_URL:
            process.env.DATABASE_URL ||
            "postgresql://test_user:test_password@localhost:5433/test_timetable?schema=public&connection_limit=10",
          NODE_ENV:
            process.env.CI === "true" || process.env.PROD_BUILD === "true"
              ? "production"
              : (process.env.NODE_ENV ?? "development"),
        },
      },

  outputDir: "test-results/artifacts-publish-happy",
});
