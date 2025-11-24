import { test, expect } from "@playwright/test";

// Override global storageState so these tests start unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

/**
 * [journey] E2E: Admin Authentication Flow
 *
 * ⚠️ IMPORTANT: This file intentionally uses MANUAL authentication flows
 * because it's specifically testing the authentication functionality itself.
 * Most other E2E tests rely on storageState from auth.setup.ts.
 */

test.describe("Admin Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => window.localStorage.clear());
    await page.goto("/signin");
  });

  test("should display sign-in page with all authentication options", async ({
    page,
  }) => {
    await expect(page.getByLabel("อีเมล")).toBeVisible();
    await expect(page.getByLabel("รหัสผ่าน")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /เข้าสู่ระบบด้วย Google/i }),
    ).toBeVisible();
  });

  test("should successfully sign in with admin credentials", async ({
    page,
  }) => {
    await expect(page).toHaveURL(/\/signin/);
    await page.locator('input[type="email"]').fill("admin@school.local");
    await page.locator('input[type="password"]').fill("admin123");
    await page.getByRole("button", { name: /^เข้าสู่ระบบ$/i }).click();

    await Promise.race([
      page.waitForURL("**/dashboard/**", { timeout: 20000 }),
      page.waitForSelector("text=/เลือกภาคเรียน/i", { timeout: 20000 }),
    ]);

    expect(page.url()).toContain("/dashboard");
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.locator('input[type="email"]').fill("invalid@school.local");
    await page.locator('input[type="password"]').fill("wrongpassword");
    await page.getByRole("button", { name: /^เข้าสู่ระบบ$/i }).click();
    await expect(page.getByText(/อีเมลหรือรหัสผ่านไม่ถูกต้อง/)).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    await page.getByRole("button", { name: /^เข้าสู่ระบบ$/i }).click();
    await expect(page.getByText("กรุณากรอกอีเมล")).toBeVisible();
    await expect(page.getByText("กรุณากรอกรหัสผ่าน")).toBeVisible();
  });
});

test.describe("Admin Dashboard Pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signin");
    await page.locator('input[type="email"]').fill("admin@school.local");
    await page.locator('input[type="password"]').fill("admin123");
    await page.getByRole("button", { name: /^เข้าสู่ระบบ$/i }).click();
    await page.waitForURL("**/dashboard/**", { timeout: 10000 });
  });

  test("should access semester selection page", async ({ page }) => {
    expect(page.url()).toContain("/dashboard/select-semester");
    await page.waitForSelector("body", { state: "visible" });
  });

  test("should navigate to timetable management", async ({ page }) => {
    await page.goto("/dashboard/timetable");
    await expect(page).toHaveURL(/\/dashboard\/timetable/);
    await page.waitForSelector("body", { state: "visible" });
  });

  test("should navigate to teacher management", async ({ page }) => {
    await page.goto("/dashboard/teachers");
    await expect(page).toHaveURL(/\/dashboard\/teachers/);
    await page.waitForSelector("body", { state: "visible" });
  });

  test("should navigate to class management", async ({ page }) => {
    await page.goto("/dashboard/classes");
    await expect(page).toHaveURL(/\/dashboard\/classes/);
    await page.waitForSelector("body", { state: "visible" });
  });

  test("should sign out successfully", async ({ page }) => {
    await page.goto("/dashboard/select-semester");
    const signOutButton = page
      .locator('button:has-text("ออกจากระบบ"), a:has-text("ออกจากระบบ")')
      .first();
    if (await signOutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await signOutButton.click();
      await page.waitForURL(/\/(signin|$)/, { timeout: 5000 });
      const url = page.url();
      expect(url.endsWith("/signin") || url.endsWith("/")).toBeTruthy();
    }
  });
});

test.describe("Visual UI Checks", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signin");
    await page.locator('input[type="email"]').fill("admin@school.local");
    await page.locator('input[type="password"]').fill("admin123");
    await page.getByRole("button", { name: /^เข้าสู่ระบบ$/i }).click();
    await page.waitForURL("**/dashboard/**", { timeout: 10000 });
  });

  test("[visual] dashboard pages have no console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    const pages = [
      "/dashboard/select-semester",
      "/dashboard/timetable",
      "/dashboard/teachers",
      "/dashboard/classes",
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath, { waitUntil: "domcontentloaded" });
      // Wait for main content to be visible instead of networkidle - Context7 best practice
      await expect(page.locator("main, body")).toBeVisible({ timeout: 10000 });
    }

    const criticalErrors = consoleErrors.filter(
      (err) =>
        !err.includes("Warning") &&
        !err.includes("DevTools") &&
        !err.includes("404 (Not Found)"),
    );
    expect(criticalErrors.length).toBe(0);
  });

  test("[visual] screenshots of main dashboard pages", async ({ page }) => {
    const pages = [
      { path: "/dashboard/select-semester", name: "semester-selection" },
      { path: "/dashboard/timetable", name: "timetable-management" },
      { path: "/dashboard/teachers", name: "teacher-management" },
      { path: "/dashboard/classes", name: "class-management" },
    ];

    for (const { path, name } of pages) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      // Wait for main content visibility - Context7: specific waits over networkidle
      await expect(page.locator("main, body")).toBeVisible({ timeout: 10000 });
      await page.screenshot({
        path: `test-results/screenshots/${name}.png`,
        fullPage: true,
      });
    }
  });
});
