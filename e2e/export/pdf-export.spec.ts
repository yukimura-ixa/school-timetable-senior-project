import { test, expect } from "../fixtures/admin.fixture";

/**
 * Coverage for the unified server-rendered print routes.
 *
 * Architecture: each timetable surface has a chrome-free `/print/*` HTML route
 * (rendered via PrintShell + TimeslotGrid, no app nav) and a sibling `/pdf`
 * route handler that headless Chromium renders to a real PDF.
 *
 * The grid-render + access-control tests run by default (SSR only). The PDF
 * handler tests launch headless Chromium (CHROME_PATH in dev / @sparticuz in
 * prod), so they are gated behind E2E_PDF_EXPORT to keep CI green where no
 * Chrome binary is configured.
 */

const AY = "2568";
const SEM = "1";

const PUBLIC_PRINT_ROUTES = {
  classes: `/print/classes/M1-1/${AY}/${SEM}`,
  teachers: `/print/teachers/1/${AY}/${SEM}`,
};

const ADMIN_PRINT_ROUTES = {
  studentTable: `/print/student-table/M1-1/${AY}/${SEM}`,
  teacherTable: `/print/teacher-table/${AY}/${SEM}?ids=1`,
};

const ALL_PRINT_ROUTES = { ...PUBLIC_PRINT_ROUTES, ...ADMIN_PRINT_ROUTES };

const PDF_ROUTES = {
  classes: `/print/classes/M1-1/${AY}/${SEM}/pdf`,
  teachers: `/print/teachers/1/${AY}/${SEM}/pdf`,
  studentTable: `/print/student-table/M1-1/${AY}/${SEM}/pdf`,
  teacherTable: `/print/teacher-table/${AY}/${SEM}/pdf?ids=1`,
};

test.describe("Print routes render chrome-free grids", () => {
  for (const [name, url] of Object.entries(ALL_PRINT_ROUTES)) {
    test(`${name}: renders schedule grid without app nav`, async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;
      await page.goto(url, { timeout: 90000 });
      // The shared print grid marker the PDF renderer also waits for.
      await expect(
        page.locator('[data-testid="schedule-grid"]').first(),
      ).toBeVisible({ timeout: 30000 });
      // Dedicated print segment: no application navigation chrome.
      await expect(page.locator("nav[data-app-nav]")).toHaveCount(0);
    });
  }
});

test.describe("Admin print routes are not exposed to guests", () => {
  for (const [name, url] of Object.entries(ADMIN_PRINT_ROUTES)) {
    test(`${name}: guest sees no grid (admin-guarded)`, async ({
      guestPage,
    }) => {
      await guestPage.goto(url, { timeout: 90000 });
      // notFound() renders the not-found page — the grid must never appear.
      await expect(
        guestPage.locator('[data-testid="schedule-grid"]'),
      ).toHaveCount(0);
    });
  }

  test("public class/teacher print routes still render for guests", async ({
    guestPage,
  }) => {
    await guestPage.goto(PUBLIC_PRINT_ROUTES.classes, { timeout: 90000 });
    await expect(
      guestPage.locator('[data-testid="schedule-grid"]').first(),
    ).toBeVisible({ timeout: 30000 });
  });
});

test.describe("PDF handlers return application/pdf", () => {
  test.skip(
    process.env.E2E_PDF_EXPORT !== "true",
    "Set E2E_PDF_EXPORT=true (requires a Chrome binary) to run headless PDF render tests",
  );

  for (const [name, url] of Object.entries(PDF_ROUTES)) {
    test(`${name}: returns a non-empty PDF`, async ({ authenticatedAdmin }) => {
      const res = await authenticatedAdmin.page.request.get(url, {
        timeout: 180000,
      });
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("application/pdf");
      const body = await res.body();
      expect(body.length).toBeGreaterThan(1000);
      // PDF magic bytes.
      expect(body.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    });
  }

  test("admin PDF handler 404s for guests", async ({ guestPage }) => {
    const res = await guestPage.request.get(PDF_ROUTES.studentTable, {
      timeout: 180000,
    });
    expect(res.status()).toBe(404);
    expect(res.headers()["content-type"] ?? "").not.toContain(
      "application/pdf",
    );
  });
});
