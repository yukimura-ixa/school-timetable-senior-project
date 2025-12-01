/**
 * Production Smoke Test - Authentication
 *
 * Minimal critical path test for production environment.
 * Verifies admin can log in using production database.
 */

import { test, expect } from "@playwright/test";

test.describe("Production Smoke Test - Authentication", () => {
  test("admin can log in to production", async ({ page }) => {
    // Navigate to signin
    await page.goto("/signin");

    // Fill credentials
    await page.fill('input[type="email"]', "admin@school.local");
    await page.fill('input[type="password"]', "admin123");

    // Click login
    const loginButton = page
      .locator('button:not([data-testid="google-signin-button"])', {
        hasText: /เข้าสู่ระบบ|sign in|login/i,
      })
      .first();
    await loginButton.click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Verify admin session (better-auth uses /api/auth/get-session)
    const response = await page.request.get("/api/auth/get-session");
    expect(response.ok()).toBeTruthy();

    const session = await response.json();
    expect(session?.user?.role).toBe("admin");
    expect(session?.user?.email).toBe("admin@school.local");
  });

  test("can access management pages", async ({ page }) => {
    // Should already be authenticated from previous test
    await page.goto("/management/teacher");
    await expect(page).toHaveURL("/management/teacher");

    // Verify page loaded
    await expect(page.getByRole("heading", { name: /teacher/i })).toBeVisible({
      timeout: 10000,
    });
  });
});
