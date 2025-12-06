import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load Vercel integration test environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env.vercel") });

/**
 * Integration Test Configuration for Vercel Deployment
 * Tests against live Vercel deployment (preview or production)
 *
 * Usage:
 * - Preview: VERCEL_URL=https://your-app-xyz.vercel.app npx playwright test -c playwright.vercel.config.ts
 * - Production: VERCEL_URL=https://phrasongsa-timetable.vercel.app npx playwright test -c playwright.vercel.config.ts
 */
export default defineConfig({
  testDir: "./e2e/integration",
  fullyParallel: true, // Safe for read-only integration tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry once for flaky network issues
  workers: process.env.CI ? 2 : 2, // Can run in parallel since no DB mutations

  reporter: [
    ["html", { outputFolder: "playwright-report-vercel" }],
    ["list"],
    ["json", { outputFile: "test-results/vercel-results.json" }],
  ],

  use: {
    // Use Vercel deployment URL
    baseURL:
      process.env.VERCEL_URL || "https://phrasongsa-timetable.vercel.app",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 20000, // Longer for network requests
    navigationTimeout: 60000, // Longer for cold starts

    // Extra headers for Vercel deployment
    extraHTTPHeaders: {
      "Accept-Language": "th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 13"] },
    },
  ],

  // No webServer for Vercel - we test against live deployment
  // webServer: undefined,

  /* Test output directories */
  outputDir: "test-results/vercel-artifacts",

  /* Global timeout for entire test suite */
  timeout: 60000, // 60 seconds per test

  /* Expect timeout for assertions */
  expect: {
    timeout: 10000,
  },
});
