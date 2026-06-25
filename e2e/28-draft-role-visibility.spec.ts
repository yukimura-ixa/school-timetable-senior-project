import { test, expect } from "@playwright/test";

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
