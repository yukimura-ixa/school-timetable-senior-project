import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

/**
 * Production visual + smoke checks for Admin role (read-only)
 *
 * How to run (production URL):
 *   BASE_URL=https://phrasongsa-timetable.vercel.app \
 *   ADMIN_EMAIL=you@example.com \
 *   ADMIN_PASSWORD=yourPassword \
 *   pnpm exec playwright test \
 *     --config=playwright.config.prod.ts \
 *     --project=chromium \
 *     e2e/auth.setup.ts \
 *     e2e/visual/admin-production-visual.spec.ts
 *
 * The first test uses /api/auth/get-session to fail fast if the storage state
 * is missing or not an admin session.
 *
 * Non-destructive: pages are opened read-only and only screenshots/assertions
 * are taken. No mutations are performed.
 */

const semester = process.env.SEMESTER_ID ?? "1-2567";
const screenshotDir = "test-results/prod-visual";

test.describe.configure({ mode: "serial", timeout: 90_000 });

const ensureAuthenticated = async ({ request }: { request: APIRequestContext }) => {
  const res = await request.get("/api/auth/get-session");
  expect(res.ok()).toBeTruthy();
  const body = await res.json().catch(() => ({}));
  expect(body?.user?.role).toBe("admin");
  return body?.user;
};

const snap = async (
  page: Page,
  name: string,
  opts: { mask?: ReturnType<typeof page.locator>[] } = {},
) => {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);
  await page.screenshot({
    path: `${screenshotDir}/${name}.png`,
    fullPage: true,
    animations: "disabled",
    mask: opts.mask,
  });
};

const assertNotSignin = async (page: Page) => {
  if (page.url().includes("signin")) {
    throw new Error(
      "Redirected to /signin — run auth setup with ADMIN_EMAIL/ADMIN_PASSWORD and try again.",
    );
  }
};

test("00 auth guard: admin session is active", async ({ request }) => {
  await ensureAuthenticated({ request });
});

test("01 dashboard overview", async ({ page }) => {
  await page.goto(`/dashboard/${semester}/all-timeslot`);
  await assertNotSignin(page);
  await expect(page.getByRole("heading")).toBeVisible();
  await snap(page, "01-dashboard-all-timeslot");
});

test("02 teacher table", async ({ page }) => {
  await page.goto(`/dashboard/${semester}/teacher-table`);
  await assertNotSignin(page);
  await expect(page.getByText(/teacher/i)).toBeVisible();
  await snap(page, "02-dashboard-teacher-table");
});

test("03 student table", async ({ page }) => {
  await page.goto(`/dashboard/${semester}/student-table`);
  await assertNotSignin(page);
  await expect(page.getByText(/student/i)).toBeVisible();
  await snap(page, "03-dashboard-student-table");
});

test("04 config page", async ({ page }) => {
  await page.goto(`/schedule/${semester}/config`);
  await assertNotSignin(page);
  await expect(page.getByRole("heading")).toBeVisible();
  await snap(page, "04-schedule-config");
});

test("05 teacher arrange board", async ({ page }) => {
  await page.goto(`/schedule/${semester}/arrange/teacher-arrange`);
  await assertNotSignin(page);
  await expect(page.locator("[data-testid='timeslot-grid']")).toBeVisible({
    timeout: 20_000,
  });
  await snap(page, "05-teacher-arrange", {
    mask: [page.locator("[data-testid='toast']")],
  });
});

test("06 lock overview", async ({ page }) => {
  await page.goto(`/schedule/${semester}/lock`);
  await assertNotSignin(page);
  await expect(page.getByText(/lock/i)).toBeVisible();
  await snap(page, "06-lock");
});

test("07 export page", async ({ page }) => {
  await page.goto(`/dashboard/${semester}/all-program`);
  await assertNotSignin(page);
  await expect(page.getByRole("button", { name: /export|download/i })).toBeVisible();
  await snap(page, "07-export");
});

test("08 management teachers", async ({ page }) => {
  await page.goto("/management/teacher");
  await assertNotSignin(page);
  await expect(page.getByRole("heading", { name: /teacher/i })).toBeVisible();
  await snap(page, "08-management-teacher");
});
