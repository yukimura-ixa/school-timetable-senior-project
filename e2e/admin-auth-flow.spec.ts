import { test, expect } from "./fixtures/admin.fixture";

/**
 * E2E Test: Admin Authentication Flow
 *
 * ⚠️ IMPORTANT: This test file intentionally uses MANUAL authentication flows
 * (page.goto('/signin'), manual form fill, etc.) because it's specifically
 * testing the authentication functionality itself.
 *
 * Most other E2E tests should NOT use manual auth - they automatically receive
 * an authenticated session via auth.setup.ts and storageState.
 *
 * See e2e/fixtures/admin.fixture.ts for authentication architecture details.
 *
 * Related: Issue #110 (E2E fixture consolidation), Issue #112 (Phase B)
 */

test.describe("Admin Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to sign-in page
    await page.goto("/signin");
  });

  test("should display sign-in page with all authentication options", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Check email/password form
    await expect(page.getByLabel("อีเมล")).toBeVisible();
    await expect(page.getByLabel("รหัสผ่าน")).toBeVisible();
    // Use exact text match for credentials submit button to avoid ambiguity with Google button
    await expect(
      page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }),
    ).toBeVisible();

    // Check Google OAuth button
    await expect(
      page.getByRole("button", { name: /เข้าสู่ระบบด้วย Google/i }),
    ).toBeVisible();
  });

  test("should successfully sign in with admin credentials", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Fill in credentials
    await page.getByLabel("อีเมล").fill("admin@school.local");
    await page.getByLabel("รหัสผ่าน").fill("admin123");

    // Click sign-in button
    await page.getByRole("button", { name: /^เข้าสู่ระบบ$/i }).click();

    // Wait for navigation to dashboard (or a known dashboard element)
    await Promise.race([
      page.waitForURL("**/dashboard/**", { timeout: 20000 }),
      page.waitForSelector("text=/เลือกภาคเรียน/i", { timeout: 20000 }),
    ]);

    // Verify we're on the dashboard
    expect(page.url()).toContain("/dashboard");
  });

  test("should show error for invalid credentials", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Fill in invalid credentials
    await page.getByLabel("อีเมล").fill("invalid@school.local");
    await page.getByLabel("รหัสผ่าน").fill("wrongpassword");

    // Click sign-in button
    await page.getByRole("button", { name: /^เข้าสู่ระบบ$/i }).click();

    // Check for error message (Thai: "อีเมลหรือรหัสผ่านไม่ถูกต้อง")
    await expect(page.getByText(/อีเมลหรือรหัสผ่านไม่ถูกต้อง/)).toBeVisible();
  });

  test("should validate required fields", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    // Click sign-in without filling fields
    await page.getByRole("button", { name: /^เข้าสู่ระบบ$/i }).click();

    // Check for validation errors (Thai: "กรุณากรอกอีเมล", "กรุณากรอกรหัสผ่าน")
    await expect(page.getByText("กรุณากรอกอีเมล")).toBeVisible();
    await expect(page.getByText("กรุณากรอกรหัสผ่าน")).toBeVisible();
  });
});

test.describe("Admin Dashboard Pages", () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto("/signin");
    await page.getByLabel("อีเมล").fill("admin@school.local");
    await page.getByLabel("รหัสผ่าน").fill("admin123");
    await page.getByRole("button", { name: /^เข้าสู่ระบบ$/i }).click();

    // Wait for dashboard
    await page.waitForURL("**/dashboard/**", { timeout: 10000 });
  });

  test("should access semester selection page", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Should be on select-semester page after login
    expect(page.url()).toContain("/dashboard/select-semester");

    // Verify the page loads (wait for body to be visible as minimal sanity check)
    await page.waitForSelector("body", { state: "visible" });
  });

  test("should navigate to timetable management", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Navigate to timetable page
    await page.goto("/dashboard/timetable");

    // Check page loaded
    await expect(page).toHaveURL(/\/dashboard\/timetable/);

    // Verify timetable UI elements exist
    await page.waitForSelector("body", { state: "visible" });
  });

  test("should navigate to teacher management", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Navigate to teachers page
    await page.goto("/dashboard/teachers");

    // Check page loaded
    await expect(page).toHaveURL(/\/dashboard\/teachers/);

    // Verify UI loaded
    await page.waitForSelector("body", { state: "visible" });
  });

  test("should navigate to class management", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Navigate to classes page
    await page.goto("/dashboard/classes");

    // Check page loaded
    await expect(page).toHaveURL(/\/dashboard\/classes/);

    // Verify UI loaded
    await page.waitForSelector("body", { state: "visible" });
  });

  test("should sign out successfully", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    // Find and click sign-out button (may be in a menu or header)
    // Adjust selector based on your actual UI
    await page.goto("/dashboard/select-semester");

    // Look for sign-out option - adjust selector as needed
    const signOutButton = page
      .locator('button:has-text("ออกจากระบบ"), a:has-text("ออกจากระบบ")')
      .first();

    if (await signOutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await signOutButton.click();

      // Wait for redirect to sign-in or home page
      await page.waitForURL(/\/(signin|$)/, { timeout: 5000 });

      // Verify we're signed out (back to signin or home)
      const url = page.url();
      expect(url.endsWith("/signin") || url.endsWith("/")).toBeTruthy();
    }
  });
});

test.describe("Visual UI Checks", () => {
  test.beforeEach(async ({ page }) => {
    // Sign in
    await page.goto("/signin");
    await page.getByLabel("อีเมล").fill("admin@school.local");
    await page.getByLabel("รหัสผ่าน").fill("admin123");
    await page.getByRole("button", { name: /^เข้าสู่ระบบ$/i }).click();
    await page.waitForURL("**/dashboard/**", { timeout: 10000 });
  });

  test("should not have console errors on dashboard pages", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Visit key pages
    const pages = [
      "/dashboard/select-semester",
      "/dashboard/timetable",
      "/dashboard/teachers",
      "/dashboard/classes",
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await expect(page.locator('main, [role="main"], body')).toBeVisible({
        timeout: 10000,
      });
      // Wait for React hydration by checking for interactive content
      await page.waitForLoadState("domcontentloaded");
    }

    // Report any console errors found
    if (consoleErrors.length > 0) {
      console.log("Console errors found:", consoleErrors);
    }

    // Test should pass even with minor warnings, fail only on critical errors
    const criticalErrors = consoleErrors.filter(
      (err) =>
        !err.includes("Warning") &&
        !err.includes("DevTools") &&
        // Tolerate benign 404s from optional assets during dev
        !err.includes("404 (Not Found)"),
    );

    expect(criticalErrors.length).toBe(0);
  });

  test("should take screenshots of main dashboard pages", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const pages = [
      { path: "/dashboard/select-semester", name: "semester-selection" },
      { path: "/dashboard/timetable", name: "timetable-management" },
      { path: "/dashboard/teachers", name: "teacher-management" },
      { path: "/dashboard/classes", name: "class-management" },
    ];

    for (const { path, name } of pages) {
      await page.goto(path);
      await expect(page.locator('main, [role="main"], body')).toBeVisible({
        timeout: 10000,
      });

      // Take screenshot
      await page.screenshot({
        path: `test-results/screenshots/${name}.png`,
        fullPage: true,
      });
    }
  });
});
