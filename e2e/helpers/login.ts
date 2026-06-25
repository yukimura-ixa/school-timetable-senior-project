import {
  request,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";

export type Credentials = { email: string; password: string };

/** Non-admin "guest" fixture seeded in prisma/seed.ts for authz-boundary tests. */
export const GUEST_E2E: Credentials = {
  email: "e2e.guest@school.ac.th",
  password: process.env.GUEST_PASSWORD ?? "guest123",
};

/**
 * Fresh context authenticated via the auth API. The signin UI is admin-only,
 * so non-admin sessions can only be minted here. Caller owns the context:
 * `const { page, context } = await loginViaApi(...)`, then `context.close()`.
 */
export async function loginViaApi(
  browser: Browser,
  creds: Credentials,
): Promise<{ context: BrowserContext; page: Page }> {
  const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

  const apiContext = await request.newContext({ baseURL });
  // better-auth rejects Origin-less state-changing requests with 403 in
  // production (CSRF/trustedOrigins gate); Playwright's request omits Origin.
  const resp = await apiContext.post("/api/auth/sign-in/email", {
    data: { email: creds.email, password: creds.password },
    headers: { "Content-Type": "application/json", Origin: baseURL },
  });
  if (!resp.ok()) {
    await apiContext.dispose();
    throw new Error(
      `loginViaApi: sign-in failed (${resp.status()}) for ${creds.email}`,
    );
  }
  const storageState = await apiContext.storageState();
  await apiContext.dispose();

  if (!storageState.cookies.some((c) => /session/i.test(c.name))) {
    throw new Error("loginViaApi: no session cookie in response");
  }

  const context = await browser.newContext({ storageState });
  const page = await context.newPage();
  return { context, page };
}
