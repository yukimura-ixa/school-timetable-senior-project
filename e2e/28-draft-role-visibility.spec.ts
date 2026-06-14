import { test, expect } from "@playwright/test";
import { TEACHER_E2E, loginAsViaApi } from "./helpers/login";

/**
 * Role boundaries around the seeded world (1-2568 PUBLISHED, 2-2568 DRAFT).
 *
 * NOTE: public draft-term invisibility (DRAFT terms 404 on the public
 * class/teacher routes) is asserted in public-draft-term-404.spec.ts, not
 * here; this spec focuses on role/auth boundaries.
 *
 * NOTE: the signin UI is admin-only (SignInForm blocks non-admin roles),
 * so the teacher persona is exercised via UI-rejection + API session.
 */
test.describe("draft-term role visibility", () => {
  test("teacher UI login is rejected (signin is admin-only)", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    try {
      await page.goto("/signin");
      await page.waitForLoadState("domcontentloaded");
      await page.fill('input[type="email"]', TEACHER_E2E.email);
      await page.fill('input[type="password"]', TEACHER_E2E.password);
      await page
        .locator('button:not([data-testid="google-signin-button"])', {
          hasText: /เข้าสู่ระบบ|sign in|login|submit|continue/i,
        })
        .first()
        .click();
      await expect(
        page.getByText(/ไม่ได้รับอนุญาต|admin|ผู้ดูแลระบบ|denied|ไม่สามารถ/i).first(),
      ).toBeVisible({ timeout: 10000 });
      expect(page.url()).not.toMatch(/\/dashboard/);
    } finally {
      await context.close();
    }
  });

  test("API-established teacher session gets 403 boundary on admin layouts", async ({ browser }) => {
    const { context, page } = await loginAsViaApi(browser, TEACHER_E2E);
    try {
      await page.goto("/dashboard");
      await expect(
        page.getByText(/403|forbidden|ไม่ได้รับอนุญาต/i).first(),
      ).toBeVisible({ timeout: 15000 });
      await page.goto("/management/teacher");
      await expect(
        page.getByText(/403|forbidden|ไม่ได้รับอนุญาต/i).first(),
      ).toBeVisible({ timeout: 15000 });
    } finally {
      await context.close();
    }
  });

  test("anonymous user is redirected from management to signin", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    try {
      await page.goto("/management/teacher");
      await expect(page).toHaveURL(/\/signin/, { timeout: 15000 });
    } finally {
      await context.close();
    }
  });

  test("public class page for the seeded grade renders", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    try {
      await page.goto("/classes/M1-1/2568/1");
      // 1-2568 is PUBLISHED, so the public class page renders the seeded grade.
      await expect(page.getByText(/ม\.1\/1|M1-1/).first()).toBeVisible({ timeout: 15000 });
    } finally {
      await context.close();
    }
  });
});
