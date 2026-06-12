import {
  expect,
  request,
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
 * Fresh context logged in via the auth API directly (bypasses the /signin UI
 * which only allows admin-role users). Use for teacher-role sessions.
 * Caller owns the context: `const { page, context } = await loginAsViaApi(...)`,
 * then `await context.close()` when done.
 */
export async function loginAsViaApi(
  browser: Browser,
  creds: RoleCredentials,
): Promise<{ context: BrowserContext; page: Page }> {
  const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

  // Sign in via the auth API; Playwright's request context records the
  // session cookies better-auth sets, so no manual cookie parsing.
  const apiContext = await request.newContext({ baseURL });
  const resp = await apiContext.post("/api/auth/sign-in/email", {
    data: { email: creds.email, password: creds.password },
    headers: { "Content-Type": "application/json" },
  });
  if (!resp.ok()) {
    await apiContext.dispose();
    throw new Error(
      `loginAsViaApi: sign-in failed (${resp.status()}) for ${creds.email}`,
    );
  }
  const storageState = await apiContext.storageState();
  await apiContext.dispose();

  if (!storageState.cookies.some((c) => /session/i.test(c.name))) {
    throw new Error("loginAsViaApi: no session cookie in response");
  }

  const context = await browser.newContext({ storageState });
  const page = await context.newPage();
  return { context, page };
}

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
