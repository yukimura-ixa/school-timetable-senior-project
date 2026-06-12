import { expect, type Browser } from "@playwright/test";

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
export async function loginAs(browser: Browser, creds: RoleCredentials) {
  const context = await browser.newContext({ storageState: undefined });
  const page = await context.newPage();
  await page.goto("/signin");
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await page
    .locator('button:not([data-testid="google-signin-button"])', {
      hasText: /เข้าสู่ระบบ|sign in|login|submit/i,
    })
    .first()
    .click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  return { context, page };
}
