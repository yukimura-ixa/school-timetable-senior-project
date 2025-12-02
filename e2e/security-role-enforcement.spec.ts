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
      await page.goto("/dashboard/1-2567/teacher-table");

      // Should see error or redirect
      // If redirected to signin:
      if (
        page.url().includes("/signin") ||
        page.url().includes("/api/auth/signin")
      ) {
        // Pass - guest was correctly redirected
        return;
      }

      // If not redirected, check for error alert or disabled selector
      const alert = page.getByRole("alert");
      if ((await alert.count()) > 0) {
        await expect(alert).toBeVisible();
      } else {
        // Check if teacher selector is disabled for guests
        const selector = page.getByTestId("teacher-multi-select");
        await expect(selector).toBeDisabled();
      }
    });
  });

  test.describe("Admin User", () => {
    // Inherits global storageState from playwright.config.ts (Admin)

    test("Admin can select any teacher", async ({ page }) => {
      await page.goto("/dashboard/1-2567/teacher-table");

      // Wait for page to load
      await expect(page.locator("main, body")).toBeVisible({ timeout: 10000 });

      // Selector should be enabled (use testid to avoid strict mode violations)
      const selector = page.getByTestId("teacher-multi-select");
      await expect(selector).toBeVisible();

      // Click to open dropdown
      await selector.click();

      // Wait for options to appear
      const option = page.getByRole("option").first();
      await option.waitFor({ timeout: 5000 });
      await option.click();

      // Verify teacher schedule heading appears
      await expect(page.getByText("ตารางสอน:")).toBeVisible({ timeout: 10000 });
    });
  });
});
