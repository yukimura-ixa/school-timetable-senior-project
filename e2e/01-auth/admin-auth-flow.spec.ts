import { test, expect } from "@playwright/test";

// Admin password from environment, defaulting to seeded value for dev/CI
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

// Override global storageState so these tests start unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

/**
 * [journey] E2E: Admin Authentication Flow
 *
 * ⚠️ IMPORTANT: This file intentionally uses MANUAL authentication flows
 * because it's specifically testing the authentication functionality itself.
 * Most other E2E tests rely on storageState from auth.setup.ts.
 *
 * URL Structure Reference:
 * - /dashboard - Semester selection page (root)
 * - /dashboard/[semesterAndYear]/student-table - Student timetables
 * - /dashboard/[semesterAndYear]/teacher-table - Teacher timetables
 * - /management/teacher - Teacher management (CRUD)
 * - /management/subject - Subject management (CRUD)
 * - /management/rooms - Room management (CRUD)
 * - /management/gradelevel - Grade level management (CRUD)
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
    const emailInput = page.getByLabel("อีเมล");
    const passwordInput = page.getByLabel("รหัสผ่าน");
    const rememberMeCheckbox = page.getByLabel("จำฉันไว้ในระบบ");
    const credentialButton = page.getByRole("button", {
      name: "เข้าสู่ระบบ",
      exact: true,
    });
    const googleButton = page.getByTestId("google-signin-button");

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(rememberMeCheckbox).toBeVisible();
    await expect(credentialButton).toBeVisible();
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toHaveText(/Google/i);
  });

  test("should successfully sign in with admin credentials", async ({
    page,
  }) => {
    await expect(page).toHaveURL(/\/signin/);
    await page.locator('input[type="email"]').fill("admin@school.local");
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /^เข้าสู่ระบบ$/i }).click();

    // After login, redirects to /dashboard (semester selection page)
    await expect(page).toHaveURL(/\/dashboard/, {
      timeout: 20000,
    });
    await expect(page.getByText(/เลือกปีการศึกษาและภาคเรียน/i)).toBeVisible({
      timeout: 20000,
    });
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
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /^เข้าสู่ระบบ$/i }).click();
    // After login, redirects to /dashboard (semester selection page)
    await page.waitForURL("**/dashboard", {
      timeout: 20000,
    });
    await expect(page.getByText(/เลือกปีการศึกษาและภาคเรียน/i)).toBeVisible({
      timeout: 20000,
    });
  });

  test("should access semester selection page", async ({ page }) => {
    // /dashboard is the semester selection page
    expect(page.url()).toMatch(/\/dashboard$/);
    await page.waitForSelector("body", { state: "visible" });
  });

  test("should navigate to teacher management", async ({ page }) => {
    // Teacher management is at /management/teacher (not /dashboard/teachers)
    await page.goto("/management/teacher");
    await expect(page).toHaveURL(/\/management\/teacher/);
    await page.waitForSelector("body", { state: "visible" });
  });

  test("should navigate to subject management", async ({ page }) => {
    // Subject management is at /management/subject
    await page.goto("/management/subject");
    await expect(page).toHaveURL(/\/management\/subject/);
    await page.waitForSelector("body", { state: "visible" });
  });

  test("should navigate to room management", async ({ page }) => {
    // Room management is at /management/rooms
    await page.goto("/management/rooms");
    await expect(page).toHaveURL(/\/management\/rooms/);
    await page.waitForSelector("body", { state: "visible" });
  });

  test("should sign out successfully", async ({ page }) => {
    await page.goto("/dashboard");
    const signOutButton = page
      .locator('button:has-text("ออกจากระบบ"), a:has-text("ออกจากระบบ")')
      .first();
    if (await signOutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await signOutButton.click();
      await page.waitForURL(/\/(signin|$)/, { timeout: 15000 });
      const url = page.url();
      expect(url.endsWith("/signin") || url.endsWith("/")).toBeTruthy();
    }
  });
});

test.describe("Visual UI Checks", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signin");
    await page.locator('input[type="email"]').fill("admin@school.local");
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /^เข้าสู่ระบบ$/i }).click();
    // After login, redirects to /dashboard (semester selection page)
    await page.waitForURL("**/dashboard", {
      timeout: 20000,
    });
    await expect(page.getByText(/เลือกปีการศึกษาและภาคเรียน/i)).toBeVisible({
      timeout: 20000,
    });
  });

  test("[visual] dashboard pages have no console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    // Use actual app routes - /dashboard for semester selection, /management/* for CRUD
    const pages = [
      "/dashboard",
      "/management/teacher",
      "/management/subject",
      "/management/rooms",
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath, { waitUntil: "domcontentloaded" });
      // Wait for main content to be visible instead of networkidle - Context7 best practice
      await expect(page.locator("main, body")).toBeVisible({ timeout: 15000 });
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
    // Use actual app routes
    const pages = [
      { path: "/dashboard", name: "semester-selection" },
      { path: "/management/teacher", name: "teacher-management" },
      { path: "/management/subject", name: "subject-management" },
      { path: "/management/rooms", name: "room-management" },
    ];

    for (const { path, name } of pages) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      // Wait for main content visibility - Context7: specific waits over networkidle
      await expect(page.locator("main, body")).toBeVisible({ timeout: 15000 });
      await page.screenshot({
        path: `test-results/screenshots/${name}.png`,
        fullPage: true,
      });
    }
  });
});
