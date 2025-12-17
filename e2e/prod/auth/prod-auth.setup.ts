import { expect, test as setup } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import { loginAsAdmin } from "../helpers/login";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFile =
  process.env.PLAYWRIGHT_PROD_AUTH_FILE ??
  path.resolve(__dirname, "../../../playwright/.auth/prod-admin.json");

setup.setTimeout(120_000);

async function assertAdminSessionReady({
  getSession,
}: {
  getSession: () => Promise<{
    ok: boolean;
    json: () => Promise<unknown>;
    status: number;
  }>;
}) {
  type SessionBody = { user?: { role?: string } };

  const maxAttempts = 6;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await getSession();
    if (res.ok) {
      const body = (await res.json().catch(() => ({}))) as SessionBody;
      expect(body.user?.role).toBe("admin");
      return;
    }

    // Back off on transient 429/5xx before failing.
    if (attempt < maxAttempts && (res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 750 * attempt));
      continue;
    }

    break;
  }

  // Final attempt: ensure error is actionable but does not leak any secrets.
  const finalRes = await getSession();
  expect(finalRes.ok).toBeTruthy();
  const body = (await finalRes.json().catch(() => ({}))) as SessionBody;
  expect(body.user?.role).toBe("admin");
}

setup("prod admin: authenticate and save storageState", async ({ page }) => {
  await loginAsAdmin(page);

  await assertAdminSessionReady({
    getSession: async () => {
      const res = await page.request.get("/api/auth/get-session");
      return {
        ok: res.ok(),
        status: res.status(),
        json: () => res.json(),
      };
    },
  });

  await page.context().storageState({ path: authFile });
});
