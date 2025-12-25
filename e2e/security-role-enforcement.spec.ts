import { test, expect } from "@playwright/test";

/**
 * Security Role Enforcement Tests
 *
 * Tests that role-based access control works correctly:
 * - Guest users are redirected to signin or see errors
 * - Admin users have full access to teacher schedules
 *
 * Note: Uses @playwright/test directly to test both authenticated and
 * unauthenticated states. Guest tests override storageState to empty.
 */

test.describe("Security Role Enforcement", () => {
  test.describe("Guest User", () => {
    // Reset storage state to be empty (logged out)
    test.use({ storageState: { cookies: [], origins: [] } });

    test("Guest cannot view teacher schedule", async ({ page }) => {
      // Navigate to teacher table without logging in
      await page.goto("/dashboard/2567/1/teacher-table");

      await page.waitForLoadState("domcontentloaded");
      await page.waitForLoadState("networkidle");

      // Most flows redirect to /signin; accept a forbidden/unauthorized UI as well.
      const url = page.url();
      if (url.includes("/signin") || url.includes("/api/auth/signin")) return;

      const signinUi = page
        .getByRole("button", { name: /เข้าสู่ระบบ|sign in|login/i })
        .or(page.getByRole("heading", { name: /เข้าสู่ระบบ|sign in|login/i }));
      if (await signinUi.isVisible().catch(() => false)) return;

      const forbidden = page
        .locator(
          "text=/\\b403\\b|forbidden|unauthorized|ไม่อนุญาต|ไม่มีสิทธิ์|กรุณาเข้าสู่ระบบ/i",
        )
        .first();
      await expect(forbidden).toBeVisible({ timeout: 20000 });
    });
  });

  test.describe("Admin User", () => {
    // Inherits global storageState from playwright.config.ts (Admin)

    test("Admin can select any teacher", async ({ page }) => {
      await page.goto("/dashboard/2567/1/teacher-table");

      // Wait for page to load
      await expect(page.locator("main, body")).toBeVisible({ timeout: 15000 });

      // Admin should not be redirected to signin.
      expect(page.url()).toContain("/dashboard/2567/1/teacher-table");

      // At minimum, the teacher selector should render (even if data APIs fail).
      await expect(
        page
          .getByTestId("teacher-select")
          .or(page.getByRole("combobox").first()),
      ).toBeVisible({ timeout: 15000 });
    });
  });
});
