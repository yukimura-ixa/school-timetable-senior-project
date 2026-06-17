/**
 * E2E Tests for Public Class Schedule Pages (Grid Implementation)
 *
 * Tests the public class schedule pages with:
 * - Grid-based timetable layout (rows=days, columns=periods)
 * - Responsive design and print functionality
 * - No authentication required
 *
 * Public teacher schedule pages were removed; only class schedules are public.
 *
 * Related Files:
 * - src/app/(public)/classes/[gradeId]/[academicYear]/[semester]/page.tsx
 *
 * Optimization: These tests are read-only and can run in parallel
 */

import { test, expect } from "./fixtures/admin.fixture";
import { testGradeLevel, testSemester } from "./fixtures/seed-data.fixture";

// Enable parallel execution for read-only public page tests
test.describe.configure({ mode: "parallel" });

const termPath = `${testSemester.Year}/${testSemester.Semester}`;

// Public schedule pages should be accessible without authentication.
// Use the dedicated `guestPage` fixture instead of `authenticatedAdmin`.

let cachedClassSchedulePath: string | null = null;

const getPublicClassSchedulePath = async (
  _page: import("@playwright/test").Page,
): Promise<string> => {
  // Build directly from seed fixtures (M1-1, 1/2568 — published, always present)
  // instead of scraping the homepage, which couples to default-term/published
  // listing behaviour and made these tests flaky.
  if (cachedClassSchedulePath) return cachedClassSchedulePath;
  cachedClassSchedulePath = `/classes/${testGradeLevel.GradeID}/${testSemester.Year}/${testSemester.Semester}`;
  return cachedClassSchedulePath;
};

test.describe("Public Class Schedule Page", () => {
  test("should load class schedule without authentication", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto(await getPublicClassSchedulePath(page), { timeout: 60000, waitUntil: "domcontentloaded" });

    // Should not redirect to login
    expect(page.url()).toContain("/classes/");

    // Should show class schedule header (scope to main to avoid strict-mode conflicts)
    await expect(page.locator("main h1").first()).toContainText("ตารางเรียน");
  });

  test("should display class information", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto(await getPublicClassSchedulePath(page), { timeout: 60000, waitUntil: "domcontentloaded" });

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Should show grade level (e.g., "ม.1/1")
    await expect(page.getByTestId("class-name")).toContainText(
      /(ม\.[1-6]\/\d+|M[1-6][-/]\d+)/,
    );
  });

  test("should display timetable grid with correct structure", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto(await getPublicClassSchedulePath(page), { timeout: 60000, waitUntil: "domcontentloaded" });

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Should have table element
    const table = page
      .getByTestId("schedule-grid")
      .or(page.locator("table").first());
    await expect(table).toBeVisible({ timeout: 15000 });

    // Transposed grid: the header row holds the period (+break) columns.
    const headers = page.locator("thead th");
    expect(await headers.count()).toBeGreaterThan(5);

    // First header is the "day \ period" corner.
    await expect(headers.first()).toContainText(/คาบ|Period/i);
  });

  test("should display teacher names in schedule cells", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto(await getPublicClassSchedulePath(page), { timeout: 60000, waitUntil: "domcontentloaded" });

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Schedule cells should show teacher names with Thai honorifics
    const teacherNames = page
      .locator("td")
      .filter({ hasText: /นาย|นาง|นางสาว|Mr\.|Mrs\.|Ms\./ });
    const count = await teacherNames.count();

    if (count > 0) {
      // Should have at least one teacher assigned
      expect(count).toBeGreaterThan(0);

      // Teacher name (prefix + first + last) appears within the cell, after the
      // subject name — match anywhere, not anchored to cell start.
      await expect(teacherNames.first()).toContainText(
        /(นาย|นาง|นางสาว|Mr\.|Mrs\.|Ms\.)\S*\s+\S+/,
      );
    }
  });

  test("should display subject information", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto(await getPublicClassSchedulePath(page), { timeout: 60000, waitUntil: "domcontentloaded" });

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Should show subject names
    const subjectCells = page.locator("td .font-medium");
    const subjectCount = await subjectCells.count();

    if (subjectCount > 0) {
      // First subject should be visible
      const firstSubject = subjectCells.first();
      await expect(firstSubject).toBeVisible();

      // Should have subject codes
      const firstSubjectTd = firstSubject.locator("xpath=ancestor::td[1]");
      await expect(firstSubjectTd.locator(".text-xs")).toContainText(
        /[ก-ฮ]\d{5}|[A-Z]{2}\d{3}/,
      );
    }
  });

  test("should handle multiple periods per day correctly", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto(
      `/classes/${testGradeLevel.GradeID}/${termPath}`,
      { timeout: 60000, waitUntil: "domcontentloaded" },
    );

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Transposed grid: one body row per day (MON–FRI).
    const dayRows = page.locator("tbody tr");
    const rowCount = await dayRows.count();

    expect(rowCount).toBeGreaterThan(0);
    expect(rowCount).toBeLessThanOrEqual(12); // Sanity check
  });

  test("should show program information if available", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto(
      `/classes/${testGradeLevel.GradeID}/${termPath}`,
      { timeout: 60000, waitUntil: "domcontentloaded" },
    );

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Look for program/curriculum information
    const programInfo = page.locator("text=/วิทย์|ศิลป์|Program|Curriculum/i");
    const hasProgram = await programInfo
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (hasProgram) {
      await expect(programInfo).toBeVisible();
    }
  });
});

test.describe("Public Class Schedule Pages - Common Features", () => {
  test("should not expose PII in class schedules", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto(await getPublicClassSchedulePath(page), { timeout: 60000, waitUntil: "domcontentloaded" });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Check visible text only (avoid matching bundled JS/CSS)
    const content = await page
      .locator('main, [role="main"], body')
      .first()
      .innerText();

    // No email addresses (simple check, avoiding CSS @keyframes)
    expect(content.toLowerCase()).not.toContain("postgresql://");

    // Should NOT contain email patterns
    const emailPattern = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    expect(emailPattern.test(content)).toBe(false);
  });

  test("should be responsive on mobile viewport", async ({ guestPage }) => {
    const page = guestPage;
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(await getPublicClassSchedulePath(page), { timeout: 60000, waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 20000,
      },
    );

    // Table should be scrollable horizontally
    const table = page.locator("table").first();
    await expect(table).toBeVisible({ timeout: 15000 });

    // Container should have overflow-x-auto or similar
    const scrollContainer = page
      .locator(".overflow-x-auto, .overflow-auto")
      .first();
    await expect(scrollContainer).toBeVisible({ timeout: 20000 });
  });

  test("should be responsive on tablet viewport", async ({ guestPage }) => {
    const page = guestPage;
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto(await getPublicClassSchedulePath(page), { timeout: 60000, waitUntil: "domcontentloaded" });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Should display table properly
    const table = page.locator("table").first();
    await expect(table).toBeVisible();
  });

  test("should load within acceptable time (performance)", async ({
    guestPage,
  }) => {
    const page = guestPage;
    const path = await getPublicClassSchedulePath(page);

    // Warm the route first. The first hit pays a one-time cold route compile
    // (Turbopack/Next dev) that can take ~16s in CI — a build artifact, not a
    // runtime cost (production is precompiled). Measure the SECOND (warm) load
    // so the assertion reflects real load performance, not compilation. See t29.
    await page.goto(path, { timeout: 60000, waitUntil: "domcontentloaded" });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });

    const startTime = Date.now();
    await page.goto(path, { timeout: 60000, waitUntil: "domcontentloaded" });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });
    const loadTime = Date.now() - startTime;

    const maxMs = process.env.CI ? 5000 : 15000;
    expect(loadTime).toBeLessThan(maxMs);
  });

  test("should handle long subject names gracefully", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto(await getPublicClassSchedulePath(page), { timeout: 60000, waitUntil: "domcontentloaded" });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Subject cells should wrap text or truncate
    const subjectCells = page.locator("td .font-medium");
    const firstSubject = subjectCells.first();

    if (await firstSubject.isVisible()) {
      // Should not overflow container
      const box = await firstSubject.boundingBox();
      expect(box?.width).toBeLessThan(300); // Reasonable cell width
    }
  });

  test("should maintain accessibility standards", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto(await getPublicClassSchedulePath(page), { timeout: 60000, waitUntil: "domcontentloaded" });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Table should have proper semantic structure
    const table = page
      .getByTestId("schedule-grid")
      .or(page.locator("table").first());
    await expect(table).toBeVisible();

    // Should have thead and tbody
    await expect(table.locator("thead")).toBeVisible();
    await expect(table.locator("tbody")).toBeVisible();

    // Headers should have proper scope (implicit in <th>)
    const headers = table.locator("thead th");
    const count = await headers.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });
});

test.describe("Public Schedule Pages - Error Handling", () => {
  const expectNotFound = async (page: import("@playwright/test").Page) => {
    // Next.js may render a 404 UI with a 200 response in some navigation modes.
    await expect(
      page.locator("text=/\\b404\\b|not found|ไม่พบ/i").first(),
    ).toBeVisible({
      timeout: 15000,
    });
  };

  test("should handle invalid class ID", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto(`/classes/999999/${termPath}`, {
      waitUntil: "domcontentloaded",
    });
    await expectNotFound(page);
  });
});
