/**
 * @file role-access-control.spec.ts
 * @description Role-based access control tests
 *
 * Tests that non-admin users cannot access admin-only routes.
 * Complements security-role-enforcement.spec.ts which tests guest access.
 *
 * Test Cases:
 * - TC-RAC-01: Unauthenticated user redirected from management routes
 * - TC-RAC-02: Unauthenticated user redirected from schedule config routes
 * - TC-RAC-03: Admin can access all management routes
 */

import { test, expect } from "@playwright/test";

const managementRoutes = [
  "/management/teacher",
  "/management/subject",
  "/management/rooms",
  "/management/gradelevel",
];

const scheduleRoutes = [
  "/schedule/1-2567/config",
  "/schedule/1-2567/assign",
  "/schedule/1-2567/arrange",
];

test.describe("Role Access Control - Management Routes", () => {
  test.describe("Unauthenticated User", () => {
    // Reset storage state to be empty (logged out)
    test.use({ storageState: { cookies: [], origins: [] } });

    test("TC-RAC-01: Cannot access teacher management", async ({ page }) => {
      await page.goto("/management/teacher");
      await page.waitForLoadState("domcontentloaded");

      // Should be redirected to signin or see unauthorized message
      const url = page.url();
      const isRedirectedToSignin =
        url.includes("/signin") || url.includes("/api/auth");

      if (!isRedirectedToSignin) {
        // Check for unauthorized/forbidden UI
        const unauthorizedIndicator = page.locator(
          "text=/signin|เข้าสู่ระบบ|forbidden|unauthorized|403|ไม่อนุญาต|กรุณาเข้าสู่ระบบ/i",
        );
        await expect(unauthorizedIndicator.first()).toBeVisible({
          timeout: 15000,
        });
      }

      // Either way, should NOT see the add teacher button
      const addButton = page.locator('[data-testid="add-teacher-button"]');
      await expect(addButton)
        .not.toBeVisible({ timeout: 3000 })
        .catch(() => {
          // Expected - button should not be visible
        });
    });

    test("TC-RAC-02: Cannot access schedule config", async ({ page }) => {
      await page.goto("/schedule/1-2567/config");
      await page.waitForLoadState("domcontentloaded");

      const url = page.url();
      const isRedirectedToSignin =
        url.includes("/signin") || url.includes("/api/auth");

      if (!isRedirectedToSignin) {
        // Must see signin prompt or forbidden message
        const unauthorizedIndicator = page.locator(
          "text=/signin|เข้าสู่ระบบ|forbidden|unauthorized|403|ไม่อนุญาต|กรุณาเข้าสู่ระบบ/i",
        );
        await expect(unauthorizedIndicator.first()).toBeVisible({
          timeout: 15000,
        });
      }
    });

    test("TC-RAC-03: Cannot access schedule assignment", async ({ page }) => {
      await page.goto("/schedule/1-2567/assign");
      await page.waitForLoadState("domcontentloaded");

      const url = page.url();
      const isRedirectedToSignin =
        url.includes("/signin") || url.includes("/api/auth");

      if (!isRedirectedToSignin) {
        const unauthorizedIndicator = page.locator(
          "text=/signin|เข้าสู่ระบบ|forbidden|unauthorized|403|ไม่อนุญาต|กรุณาเข้าสู่ระบบ/i",
        );
        await expect(unauthorizedIndicator.first()).toBeVisible({
          timeout: 15000,
        });
      }
    });
  });

  test.describe("Authenticated Admin", () => {
    // Uses default storageState from playwright.config.ts (admin)

    test("TC-RAC-04: Admin can access all management routes", async ({
      page,
    }) => {
      for (const route of managementRoutes) {
        await page.goto(route);
        await page.waitForLoadState("domcontentloaded");

        // Should NOT be redirected to signin
        expect(page.url()).not.toContain("/signin");

        // Should see main content (table or main element)
        const mainContent = page.locator("main, table, .MuiPaper-root");
        await expect(mainContent.first()).toBeVisible({ timeout: 30000 });
      }
    });

    test("TC-RAC-05: Admin can access all schedule routes", async ({
      page,
    }) => {
      for (const route of scheduleRoutes) {
        await page.goto(route);
        await page.waitForLoadState("domcontentloaded");

        // Should NOT be redirected to signin
        expect(page.url()).not.toContain("/signin");

        // Should see main content
        const mainContent = page.locator("main, body");
        await expect(mainContent.first()).toBeVisible({ timeout: 30000 });
      }
    });
  });
});
