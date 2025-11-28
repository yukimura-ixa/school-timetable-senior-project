/**
 * Authentication Setup for E2E Tests
 *
 * This setup script runs once before all tests to establish an authenticated
 * session. It saves the authentication state to a JSON file that can be reused
 * by all subsequent tests, eliminating the need for repeated logins.
 *
 * Uses credential-based authentication (email/password) to log in as the admin
 * user created during database seeding.
 *
 * Based on:
 * - Playwright best practices: https://playwright.dev/docs/auth
 * - Auth.js testing guide: https://authjs.dev/guides/testing
 *
 * @see https://playwright.dev/docs/auth#reuse-signed-in-state
 */

import { test as setup, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const authFile = path.join(__dirname, "../playwright/.auth/admin.json");

// Increase setup timeout to accommodate initial compile/HMR and seeding
setup.setTimeout(60_000);

setup("authenticate as admin", async ({ page }) => {
  console.log("[AUTH SETUP] Starting authentication flow...");

  // Listen to console logs from the browser
  page.on("console", (msg) =>
    console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`),
  );

  // Navigate to custom sign-in page
  // Increased timeout to 60s for initial page load/compilation
  await page.goto("/signin", {
    timeout: 60000,
    waitUntil: "domcontentloaded",
  });
  console.log("[AUTH SETUP] Navigated to signin page");

  // Wait for the page to load
  await page.waitForLoadState("domcontentloaded");

  // Check if we're already logged in (redirected to dashboard)
  if (page.url().includes("/dashboard")) {
    console.log("[AUTH SETUP] Already authenticated, skipping login");

    // Navigate to semester-specific dashboard
    await page.goto("/dashboard/1-2567", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForLoadState("domcontentloaded", { timeout: 20000 });

    // Double-check session is still admin before proceeding
    await expect
      .poll(
        async () => {
          const response = await page.request.get("/api/auth/session");
          if (!response.ok()) return null;
          const body = await response.json().catch(() => null);
          return body?.user?.role ?? null;
        },
        {
          timeout: 15000,
          message:
            "[AUTH SETUP] Waiting for admin session to be ready (cached login path)",
        },
      )
      .toBe("admin");

    // Wait for useSemesterSync hook to execute by checking localStorage
    console.log(
      "[AUTH SETUP] Waiting for semester sync (already authenticated path)...",
    );
    try {
      await page.waitForFunction(
        () => window.localStorage.getItem("semester-selection") !== null,
        { timeout: 20000 },
      );
      const storageValue = await page.evaluate(() =>
        window.localStorage.getItem("semester-selection"),
      );
      console.log(
        "[AUTH SETUP] Semester synced to localStorage:",
        storageValue,
      );
    } catch (error) {
      console.warn("[AUTH SETUP] Timeout waiting for semester-selection");
      if (!page.isClosed()) {
        const storageValue = await page.evaluate(() =>
          window.localStorage.getItem("semester-selection"),
        );
        console.log("[AUTH SETUP] Current storage value:", storageValue);

        if (!storageValue) {
          console.log(
            "[AUTH SETUP] Manually setting semester-selection as fallback",
          );
          await page.evaluate(() => {
            window.localStorage.setItem(
              "semester-selection",
              JSON.stringify({
                state: { semester: "1-2567" },
                version: 0,
              }),
            );
          });
          const verifyStorage = await page.evaluate(() =>
            window.localStorage.getItem("semester-selection"),
          );
          console.log("[AUTH SETUP] Verified semester storage:", verifyStorage);
        }
      } else {
        console.warn(
          "[AUTH SETUP] Page already closed; skipping semester-selection inspection",
        );
      }
    }

    // Save state and exit
    await page.context().storageState({ path: authFile });
    console.log(
      `[AUTH SETUP] Saved existing auth + semester state to ${authFile}`,
    );
    return;
  }

  // Wait for form to be ready and fill credentials (dev bypass removed)
  await expect(page.locator('input[type="email"]')).toBeVisible({
    timeout: 10000,
  });
  await expect(page.locator('input[type="password"]')).toBeVisible({
    timeout: 10000,
  });
  console.log("[AUTH SETUP] Filling in credentials...");
  await page.fill('input[type="email"]', "admin@school.local");
  await page.fill('input[type="password"]', "admin123");

  // Locate the credentials submit button (exclude Google button)
  let loginButton = page
    .locator('button:not([data-testid="google-signin-button"])', {
      hasText: /เข้าสู่ระบบ|sign in|login|continue/i,
    })
    .first();
  if (await loginButton.count().then((c) => c === 0)) {
    // Fallback: first visible non-Google button
    loginButton = page
      .locator('button:not([data-testid="google-signin-button"]):visible')
      .first();
  }
  await expect(loginButton).toBeVisible({ timeout: 10000 });
  console.log("[AUTH SETUP] Found login button");

  // Click and wait for client-side route change (Next.js uses SPA navigation)
  await loginButton.click();
  await expect(page).toHaveURL(/\/dashboard\//, { timeout: 60000 });
  console.log("[AUTH SETUP] Clicked login button and navigated");

  // Wait for page to be stable
  await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
  console.log("[AUTH SETUP] Page loaded");

  // Verify authentication via session API (less flaky than UI visibility checks)
  await expect
    .poll(
      async () => {
        const response = await page.request.get("/api/auth/session");
        if (!response.ok()) return null;
        const body = await response.json().catch(() => null);
        return body?.user?.role ?? null;
      },
      {
        timeout: 15000,
        message: "[AUTH SETUP] Waiting for admin session to be ready",
      },
    )
    .toBe("admin");
  console.log("[AUTH SETUP] Authentication verified via session API");

  // Pre-select semester by navigating to a semester-specific dashboard URL
  // The useSemesterSync hook will parse the URL and save to localStorage
  console.log(
    "[AUTH SETUP] Pre-selecting semester (1-2567) via URL navigation...",
  );
  await page.goto("/dashboard/1-2567", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  // Wait for page to finish loading and semester to sync
  await page.waitForLoadState("domcontentloaded", { timeout: 20000 });

  // Wait for useSemesterSync hook to execute by checking localStorage
  console.log("[AUTH SETUP] Waiting for semester sync...");
  try {
    await page.waitForFunction(
      () => window.localStorage.getItem("semester-selection") !== null,
      { timeout: 20000 }, // Increased to 20s to account for HMR/Fast Refresh delays
    );
    const storageValue = await page.evaluate(() =>
      window.localStorage.getItem("semester-selection"),
    );
    console.log("[AUTH SETUP] Semester synced to localStorage:", storageValue);
  } catch (error) {
    console.warn(
      "[AUTH SETUP] Timeout waiting for semester-selection after 20s",
    );

    // Check if page is still loading or if there are errors
    const currentUrl = page.url();
    const pageTitle = await page.title().catch(() => "unknown");
    console.log("[AUTH SETUP] Current URL:", currentUrl);
    console.log("[AUTH SETUP] Page title:", pageTitle);

    // Check current localStorage state
    const allStorage = await page.evaluate(() => {
      const storage: Record<string, string | null> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) storage[key] = window.localStorage.getItem(key);
      }
      return storage;
    });
    console.log("[AUTH SETUP] All localStorage keys:", Object.keys(allStorage));

    const storageValue = allStorage["semester-selection"];
    if (!storageValue) {
      console.log(
        "[AUTH SETUP] Manually setting semester-selection as fallback...",
      );
      await page.evaluate(() => {
        const semesterData = {
          state: { semester: "1-2567" },
          version: 0,
        };
        window.localStorage.setItem(
          "semester-selection",
          JSON.stringify(semesterData),
        );
        console.log("[BROWSER] Manually set semester-selection:", semesterData);
      });

      // Verify it was set
      const verifyStorage = await page.evaluate(() =>
        window.localStorage.getItem("semester-selection"),
      );
      console.log(
        "[AUTH SETUP] Verified semester storage after manual set:",
        verifyStorage,
      );
    } else {
      console.log(
        "[AUTH SETUP] Semester storage already exists:",
        storageValue,
      );
    }
  }

  // (Disabled) Pre-warm teacher-table route — adds 15s flake due to hidden buttons.
  // Keeping the hook for future use; no-op for speed and stability.

  // Save authenticated state (including localStorage with semester selection) to file
  await page.context().storageState({ path: authFile });
  console.log(`[AUTH SETUP] Saved auth + semester state to ${authFile}`);
});
