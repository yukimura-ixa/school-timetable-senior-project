import { defineConfig, devices } from "@playwright/test";

/**
 * Production Visual Smoke Configuration
 *
 * Runs a conservative visual smoke suite against a deployed URL (default) or a
 * locally-started server (opt-in).
 *
 * Usage:
 *   pnpm test:prod:visual
 *   pnpm test:prod:visual:ui
 *
 * Environment:
 *   E2E_BASE_URL=https://phrasongsa-timetable.vercel.app   (or BASE_URL legacy)
 *   E2E_ADMIN_EMAIL=...
 *   E2E_ADMIN_PASSWORD=...
 *   E2E_SEMESTER_ID=1-2567                                 (or SEMESTER_ID legacy)
 *
 * Security:
 * - Never record secrets in traces/screenshots: the auth setup project disables
 *   trace/video/screenshot because it types credentials.
 */

const baseURL =
  process.env.E2E_BASE_URL ??
  process.env.BASE_URL ??
  "https://phrasongsa-timetable.vercel.app";

const shouldStartWebServer =
  process.env.E2E_START_WEBSERVER === "true" ||
  (() => {
    try {
      const host = new URL(baseURL).hostname;
      return host === "localhost" || host === "127.0.0.1";
    } catch {
      return false;
    }
  })();

export default defineConfig({
  testDir: "./e2e/prod",
  testMatch: ["**/*.spec.ts", "**/*.setup.ts"],

  fullyParallel: false,
  forbidOnly: true,
  retries: 2,
  workers: 1,

  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/prod-results.json" }],
    ["junit", { outputFile: "test-results/prod-results.xml" }],
    ["html", { outputFolder: "playwright-report-prod", open: "never" }],
  ],

  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixels: 200,
    },
  },

  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    viewport: { width: 1440, height: 900 },
    timezoneId: "Asia/Bangkok",
    locale: "th-TH",
    colorScheme: "light",
    reducedMotion: "reduce",
  },

  projects: [
    {
      name: "prod-setup",
      testMatch: /prod-auth\.setup\.ts/,
      use: {
        trace: "off",
        screenshot: "off",
        video: "off",
      },
    },
    {
      name: "prod-desktop-admin",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        storageState: "playwright/.auth/prod-admin.json",
      },
      testMatch: ["**/visual/**/*.spec.ts"],
      dependencies: ["prod-setup"],
    },
  ],

  webServer: shouldStartWebServer
    ? {
        command: "pnpm dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120 * 1000,
        stdout: "pipe",
        stderr: "pipe",
        env: {
          ...process.env,
          NODE_ENV: "development",
        },
      }
    : undefined,

  outputDir: "test-results/prod-artifacts",
});

