import { test, expect } from "@playwright/test";
import { GUEST_E2E, loginViaApi } from "./helpers/login";

/**
 * Role boundaries around the seeded world (1-2568 PUBLISHED, 2-2568 DRAFT).
 *
 * NOTE: public draft-term invisibility (DRAFT terms 404 on the public
 * class/teacher routes) is asserted in public-draft-term-404.spec.ts, not
 * here; this spec focuses on role/auth boundaries.
 */
test.describe("draft-term role visibility", () => {
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

  test("API-established non-admin session gets 403 on admin layouts", async ({ browser }) => {
    // The signin UI is admin-only, but mint a non-admin session directly via
    // the auth API: the dashboard/management layouts must still 403 it
    // (defense-in-depth). Uses a role-neutral guest fixture (no teacher role).
    const { context, page } = await loginViaApi(browser, GUEST_E2E);
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
