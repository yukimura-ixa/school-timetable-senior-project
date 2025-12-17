import { expect, type Page } from "@playwright/test";

type SessionBody = { user?: { role?: string; email?: string } };

export async function expectAdminSession(page: Page) {
  const res = await page.request.get("/api/auth/get-session");
  expect(res.ok()).toBeTruthy();
  const body = (await res.json().catch(() => ({}))) as SessionBody;
  expect(body.user?.role).toBe("admin");
}

