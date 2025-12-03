import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load production environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

/**
 * Production Visual Test Configuration
 *
 * Runs visual tests against production deployment with multi-viewport support.
 * Supports desktop, tablet, and mobile viewports for both authenticated (admin)
 * and public pages.
 *
 * Usage:
 *   pnpm test:prod:visual              # Run all visual tests
 *   pnpm test:prod:visual:ui           # Interactive mode
 *   pnpm test:prod:visual -- --project=mobile-admin  # Mobile only
 *   pnpm test:prod:visual -- --project=public-*      # Public pages only
 *
 * Environment:
 *   BASE_URL=https://phrasongsa-timetable.vercel.app
 *   ADMIN_EMAIL=admin@school.local
 *   ADMIN_PASSWORD=admin123
 *   SEMESTER_ID=1-2567
 */

export default defineConfig({
  testDir: "./e2e",
  // Match both smoke tests and visual tests
  testMatch: ["**/smoke/**/*.spec.ts", "**/visual/**/*.spec.ts"],
  fullyParallel: false, // Sequential for production safety
  forbidOnly: true, // Never allow .only() in production tests
  retries: 2, // Retry flaky tests in production
  workers: 1, // Single worker to avoid race conditions

  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/prod-results.json" }],
    ["junit", { outputFile: "test-results/prod-results.xml" }],
    ["html", { outputFolder: "playwright-report-prod", open: "never" }],
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
    // ===========================================
    // Auth Setup (runs once before admin tests)
    // ===========================================
    {
      name: "prod-setup",
      testMatch: /auth\.setup\.ts/,
    },

    // ===========================================
    // Admin Pages - Desktop (1440×900)
    // ===========================================
    {
      name: "desktop-admin",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        storageState: "playwright/.auth/admin.json",
      },
      testMatch: ["**/visual/admin-*.spec.ts", "**/smoke/**/*.spec.ts"],
      dependencies: ["prod-setup"],
    },

    // ===========================================
    // Admin Pages - Tablet (768×1024 iPad)
    // ===========================================
    {
      name: "tablet-admin",
      use: {
        ...devices["iPad Pro"],
        viewport: { width: 768, height: 1024 },
        storageState: "playwright/.auth/admin.json",
      },
      testMatch: "**/visual/admin-*.spec.ts",
      dependencies: ["prod-setup"],
    },

    // ===========================================
    // Admin Pages - Mobile (390×844 iPhone 14)
    // ===========================================
    {
      name: "mobile-admin",
      use: {
        ...devices["iPhone 14"],
        viewport: { width: 390, height: 844 },
        storageState: "playwright/.auth/admin.json",
      },
      testMatch: "**/visual/admin-*.spec.ts",
      dependencies: ["prod-setup"],
    },

    // ===========================================
    // Public Pages - Desktop (no auth required)
    // ===========================================
    {
      name: "public-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        // No storageState - public pages don't need auth
      },
      testMatch: "**/visual/public-*.spec.ts",
    },

    // ===========================================
    // Public Pages - Tablet (no auth required)
    // ===========================================
    {
      name: "public-tablet",
      use: {
        ...devices["iPad Pro"],
        viewport: { width: 768, height: 1024 },
      },
      testMatch: "**/visual/public-*.spec.ts",
    },

    // ===========================================
    // Public Pages - Mobile (no auth required)
    // ===========================================
    {
      name: "public-mobile",
      use: {
        ...devices["iPhone 14"],
        viewport: { width: 390, height: 844 },
      },
      testMatch: "**/visual/public-*.spec.ts",
    },

    // ===========================================
    // Legacy: Original chromium project (backward compat)
    // ===========================================
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/admin.json",
      },
      testMatch: "**/smoke/**/*.spec.ts",
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
