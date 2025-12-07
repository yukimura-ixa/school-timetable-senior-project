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
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// E2E test logger helper
const log = {
  info: (msg: string, ctx?: Record<string, unknown>) =>
    console.log(`[AUTH SETUP] ${msg}`, ctx || ""),
  debug: (msg: string, ctx?: Record<string, unknown>) =>
    console.log(`[AUTH SETUP] ${msg}`, ctx || ""),
  error: (msg: string, ctx?: Record<string, unknown>) =>
    console.error(`[AUTH SETUP] ${msg}`, ctx || ""),
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const authFile =
  process.env.PLAYWRIGHT_AUTH_FILE ??
  path.join(__dirname, "../playwright/.auth/admin.json");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@school.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

// Increase setup timeout to accommodate initial compile/HMR and seeding
setup.setTimeout(60_000);

/**
 * Ensures database is fully seeded before proceeding with tests
 * Prevents race conditions where tests start before data is available
 *
 * Related: Issue #172, Commit 50f6861
 *
 * @throws Error if database is not ready after maximum attempts
 */
async function ensureDatabaseReady(): Promise<void> {
  const maxAttempts = 10;
  const baseUrl =
    process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://localhost:3000";

  log.info("Verifying database is ready...");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${baseUrl}/api/health/db`);

      if (response.ok) {
        const data = await response.json();

        if (data.ready) {
          log.info("✅ Database verified ready");
          log.debug("Record counts", data.counts);
          return;
        }

        log.info(
          `⏳ Database not ready (attempt ${attempt}/${maxAttempts})`,
        );
        log.debug("Current counts", data.counts);
        log.debug("Required minimums", data.minExpected);
      } else {
        log.info(
          `⚠️ Health endpoint returned ${response.status} (attempt ${attempt}/${maxAttempts})`,
        );
      }
    } catch (error) {
      log.error(
        `❌ Health check failed (attempt ${attempt}/${maxAttempts})`,
        { error: error instanceof Error ? error.message : "Unknown error" },
      );
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error(
    "[DB HEALTH] Database not ready after maximum attempts. " +
      "Ensure database is seeded with demo or test data before running E2E tests. " +
      "Run: pnpm db:seed:demo or pnpm db:seed:clean",
  );
}

setup("authenticate as admin", async ({ page }) => {
  // Verify database is ready BEFORE attempting authentication
  // This prevents test failures due to missing seed data
  await ensureDatabaseReady();

  log.info("Starting authentication flow...");

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
    // Note: better-auth uses /api/auth/get-session, not /api/auth/session
    await expect
      .poll(
        async () => {
          const response = await page.request.get("/api/auth/get-session");
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

    // Set localStorage directly - /dashboard/1-2567 is a Server Component,
    // so useSemesterSync hook never runs. Direct localStorage is faster and reliable.
    console.log(
      "[AUTH SETUP] Setting semester-selection directly (already authenticated path)...",
    );
    await page.evaluate(() => {
      window.localStorage.setItem(
        "semester-selection",
        JSON.stringify({
          state: {
            selectedSemester: "1-2567",
            academicYear: 2567,
            semester: 1,
          },
          version: 0,
        }),
      );
    });
    const storageValue = await page.evaluate(() =>
      window.localStorage.getItem("semester-selection"),
    );
    console.log("[AUTH SETUP] Semester set in localStorage:", storageValue);

    // Save state and exit
    await page.context().storageState({ path: authFile });
    console.log(
      `[AUTH SETUP] Saved existing auth + semester state to ${authFile}`,
    );
    return;
  }

  // Wait for form to be ready and fill credentials (dev bypass removed)
  await expect(page.locator('input[type="email"]')).toBeVisible({
    timeout: 15000,
  });
  await expect(page.locator('input[type="password"]')).toBeVisible({
    timeout: 15000,
  });
  
  // CRITICAL: Wait for HMR/Fast Refresh to complete before interacting
  // Dev server triggers 2-3 Fast Refresh cycles that re-mount React components
  // If we click before hydration completes, event handlers won't be attached
  log.info("Waiting for HMR/Fast Refresh to complete...");
  await page.waitForLoadState("networkidle", { timeout: 30000 });
  log.info("Network idle - hydration should be complete");

  log.info("Filling in credentials...");
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);

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
  await expect(loginButton).toBeVisible({ timeout: 15000 });
  log.info("Found login button");

  // Click and wait for client-side route change (Next.js uses SPA navigation)
  log.info("Clicking login button...");
  await loginButton.click();
  log.info("Click completed, waiting for navigation...");
  // Match /dashboard with or without trailing slash/path segment
  await expect(page).toHaveURL(/\/dashboard(\/|$)/, { timeout: 60000 });
  log.info("Clicked login button and navigated");

  // Wait for page to be stable
  await page.waitForLoadState("domcontentloaded", { timeout: 15000 });
  log.debug("Page loaded");

  // ===== CI DEBUGGING: Step 1 - Cookie inspection =====
  const cookies = await page.context().cookies();
  log.debug("Cookies after login", {
    count: cookies.length,
    domains: [...new Set(cookies.map((c) => c.domain))],
    names: cookies.map((c) => c.name),
    authCookies: cookies.filter((c) => c.name.toLowerCase().includes("auth"))
      .length,
    details: cookies.map((c) => ({
      name: c.name,
      domain: c.domain,
      secure: c.secure,
      httpOnly: c.httpOnly,
      sameSite: c.sameSite,
    })),
  });

  // ===== CI DEBUGGING: Step 4 - Add timing buffer =====
  // CI is slower than local; give session time to propagate
  console.log("[DEBUG] Waiting 2s for session to propagate...");
  await page.waitForTimeout(2000);

  // Verify authentication via session API (less flaky than UI visibility checks)
  // INCREASED TIMEOUT: 15s → 30s for CI slowness
  // Note: better-auth uses /api/auth/get-session, not /api/auth/session
  await expect
    .poll(
      async () => {
        const response = await page.request.get("/api/auth/get-session");

        // ===== CI DEBUGGING: Log full response =====
        console.log("[DEBUG] Session API response:", {
          status: response.status(),
          ok: response.ok(),
          headers: Object.fromEntries(
            Object.entries(response.headers()).filter(([k]) =>
              ["content-type", "set-cookie", "cache-control"].includes(k),
            ),
          ),
        });

        if (!response.ok()) {
          console.log("[DEBUG] Session API not OK, status:", response.status());
          return null;
        }

        const body = await response.json().catch((e) => {
          console.log("[DEBUG] Failed to parse session JSON:", e.message);
          return null;
        });

        console.log("[DEBUG] Session API body:", {
          hasUser: !!body?.user,
          role: body?.user?.role ?? null,
          email: body?.user?.email ?? null,
        });

        return body?.user?.role ?? null;
      },
      {
        timeout: 30000, // Increased from 15s to 30s
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

  // Set localStorage directly - /dashboard/1-2567 is a Server Component,
  // so useSemesterSync hook never runs. Direct localStorage is faster and reliable.
  console.log("[AUTH SETUP] Setting semester-selection directly...");
  await page.evaluate(() => {
    window.localStorage.setItem(
      "semester-selection",
      JSON.stringify({
        state: {
          selectedSemester: "1-2567",
          academicYear: 2567,
          semester: 1,
        },
        version: 0,
      }),
    );
  });
  const storageValue = await page.evaluate(() =>
    window.localStorage.getItem("semester-selection"),
  );
  console.log("[AUTH SETUP] Semester set in localStorage:", storageValue);

  // (Disabled) Pre-warm teacher-table route — adds 15s flake due to hidden buttons.
  // Keeping the hook for future use; no-op for speed and stability.

  // Save authenticated state (including localStorage with semester selection) to file
  await page.context().storageState({ path: authFile });
  console.log(`[AUTH SETUP] Saved auth + semester state to ${authFile}`);
});
