import {
  expect,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";

export type RoleCredentials = { email: string; password: string };

export const TEACHER_E2E: RoleCredentials = {
  email: "e2e.teacher@school.ac.th",
  password: process.env.TEACHER_PASSWORD ?? "teacher123",
};

export const TEACHER_HAPPY: RoleCredentials = {
  email: "teacher.happy@school.ac.th",
  password: process.env.TEACHER_PASSWORD ?? "teacher123",
};

/**
 * Fresh, storage-state-free context logged in via the real signin UI.
 * Caller owns the context: `const { page, context } = await loginAs(...)`,
 * then `await context.close()` when done.
 */
export async function loginAs(
  browser: Browser,
  creds: RoleCredentials,
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const page = await context.newPage();
  await page.goto("/signin");
  await page.waitForLoadState("domcontentloaded");
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await page
    .locator('button:not([data-testid="google-signin-button"])', {
      hasText: /เข้าสู่ระบบ|sign in|login|submit|continue/i,
    })
    .first()
    .click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  return { context, page };
}
