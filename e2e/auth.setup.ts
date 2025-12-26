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
// Dev server compilation can take 20-30s each time in dev mode
setup.setTimeout(180_000);

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
    process.env.BASE_URL ??
    process.env.PLAYWRIGHT_TEST_BASE_URL ??
    "http://localhost:3005";

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
    await page.goto("/dashboard/2567/1", {
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

    // Set localStorage directly - /dashboard/2567/1 is a Server Component,
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
  
  // CRITICAL: Wait for React hydration by checking form is interactive
  // Using a fixed delay is more reliable than networkidle in dev mode
  // because Fast Refresh can keep the network active indefinitely
  log.info("Waiting for React hydration to complete...");
  // Wait for form inputs to be enabled (indicates hydration complete)
  await expect(page.locator('input[type="email"]')).toBeEnabled({ timeout: 15000 });
  await expect(page.locator('input[type="password"]')).toBeEnabled({ timeout: 15000 });
  
  // Wait for Fast Refresh cycles to complete
  // Dev server triggers 2-3 Fast Refresh cycles that can clear form inputs
  // We must wait for ALL cycles to finish before filling the form
  log.info("Waiting for Fast Refresh cycles to complete...");
  await page.waitForTimeout(3000); // Wait 3 seconds for Fast Refresh to settle
  
  // Check if there are any pending Fast Refresh cycles by looking for network activity
  try {
    await page.waitForLoadState("networkidle", { timeout: 5000 });
  } catch {
    // Network may not become idle if HMR connection stays open, that's OK
    log.debug("Network not fully idle, continuing anyway...");
  }
  log.info("Form ready for interaction");

  log.info("Filling in credentials...");
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  
  // Fill and verify email
  await emailInput.fill(ADMIN_EMAIL);
  await expect(emailInput).toHaveValue(ADMIN_EMAIL, { timeout: 5000 });
  
  // Fill and verify password
  await passwordInput.fill(ADMIN_PASSWORD);
  await expect(passwordInput).toHaveValue(ADMIN_PASSWORD, { timeout: 5000 });
  
  log.info("Credentials filled and verified");

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
  await expect(loginButton).toBeEnabled({ timeout: 5000 });
  log.info("Found login button");

  // Click and wait for client-side route change (Next.js uses SPA navigation)
  log.info("Clicking login button...");
  await loginButton.click();
  log.info("Click completed, waiting for navigation or auth cookies...");
  
  // In dev mode, Fast Refresh can interfere with client-side navigation
  // Strategy: Wait for either URL change OR auth cookies to be set
  // Note: In dev mode, API endpoints need compilation (can take 25-30s each)
  const startTime = Date.now();
  const maxWaitTime = 180000; // 180 seconds max (API compilation can take a while)
  let navigatedToDashboard = false;
  let authCookieSet = false;
  let lastLog = 0;
  
  while (Date.now() - startTime < maxWaitTime) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    
    // Log progress every 10 seconds
    if (elapsed - lastLog >= 10) {
      log.info(`Still waiting... ${elapsed}s elapsed`);
      lastLog = elapsed;
    }
    
    // Check if URL changed to dashboard
    const currentUrl = page.url();
    if (/\/dashboard(\/|$)/.test(currentUrl)) {
      navigatedToDashboard = true;
      log.info("Successfully navigated to dashboard via client-side navigation");
      break;
    }
    
    // Check if auth cookies are set (auth succeeded but navigation may have failed)
    const cookies = await page.context().cookies();
    const hasAuthCookie = cookies.some(c => 
      c.name.toLowerCase().includes("better-auth") && c.name.includes("session")
    );
    
    if (hasAuthCookie && !authCookieSet) {
      authCookieSet = true;
      log.info("Auth cookies detected, waiting a bit more for navigation...");
      // Give client-side navigation a chance to complete
      await page.waitForTimeout(5000);
      
      // Check URL again
      const urlAfterWait = page.url();
      if (/\/dashboard(\/|$)/.test(urlAfterWait)) {
        navigatedToDashboard = true;
        log.info("Successfully navigated to dashboard after auth cookie wait");
        break;
      }
      
      // Navigation failed - Fast Refresh likely interfered
      // Manually navigate using Playwright
      log.info("Client-side navigation failed (Fast Refresh interference), using manual navigation");
      await page.goto("/dashboard/2567/1", { timeout: 60000 });
      await page.waitForLoadState("domcontentloaded", { timeout: 30000 });
      navigatedToDashboard = true;
      break;
    }
    
    await page.waitForTimeout(500);
  }
  
  if (!navigatedToDashboard) {
    // Last resort: Try manual navigation anyway
    log.info("Timeout waiting for auth, attempting manual navigation as last resort...");
    try {
      await page.goto("/dashboard/2567/1", { timeout: 60000 });
      await page.waitForLoadState("domcontentloaded", { timeout: 30000 });
      
      // Check if we're actually authenticated
      const cookies = await page.context().cookies();
      const hasAuthCookie = cookies.some(c => 
        c.name.toLowerCase().includes("better-auth") && c.name.includes("session")
      );
      if (hasAuthCookie) {
        log.info("Manual navigation succeeded with auth cookies present");
        navigatedToDashboard = true;
      }
    } catch (e) {
      log.error("Manual navigation failed", { error: String(e) });
    }
  }
  
  if (!navigatedToDashboard) {
    throw new Error("Failed to navigate to dashboard - neither client navigation nor auth cookies detected");
  }
  
  log.info("Navigation to dashboard completed");

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
    "[AUTH SETUP] Pre-selecting semester (2567/1) via URL navigation...",
  );
  await page.goto("/dashboard/2567/1", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  // Wait for page to finish loading and semester to sync
  await page.waitForLoadState("domcontentloaded", { timeout: 20000 });

  // Set localStorage directly - /dashboard/2567/1 is a Server Component,
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
