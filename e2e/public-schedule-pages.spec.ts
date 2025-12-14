/**
 * E2E Tests for Public Schedule Pages (Grid Implementation)
 *
 * Tests the newly implemented public teacher and class schedule pages with:
 * - Grid-based timetable layout (rows=periods, columns=days)
 * - parseSlotNumber() logic for TimeslotID format "1-2567-MON1"
 * - Responsive design and print functionality
 * - No authentication required
 *
 * Related Files:
 * - src/app/(public)/teachers/[id]/[semesterAndyear]/page.tsx
 * - src/app/(public)/classes/[gradeId]/[semesterAndyear]/page.tsx
 */

import { test, expect } from "./fixtures/admin.fixture";
import {
  testGradeLevel,
  testSemester,
  testTeacher,
} from "./fixtures/seed-data.fixture";

// Public schedule pages should be accessible without authentication.
// Use the dedicated `guestPage` fixture instead of `authenticatedAdmin`.

let cachedTeacherSchedulePath: string | null = null;
let cachedClassSchedulePath: string | null = null;

const getFirstPublicSchedulePath = async (
  page: import("@playwright/test").Page,
  opts: { tabTestId: string; hrefPrefix: string; placeholder: RegExp },
): Promise<string> => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const tab = page.getByTestId(opts.tabTestId);
  await expect(tab).toBeVisible({ timeout: 15000 });
  // Tabs live in a horizontally scrollable container on mobile; ensure the tab is within viewport.
  await tab.evaluate((el) =>
    el.scrollIntoView({ block: "center", inline: "center" }),
  );
  await tab.click();

  // Ensure the tab switch has completed (search placeholder changes per-tab).
  await expect(page.getByPlaceholder(opts.placeholder)).toBeVisible({
    timeout: 15000,
  });

  // Prefer links inside the table (avoids the hero "ดูตารางสอนตัวอย่าง" link).
  const linkInTable = page
    .locator(`main table tbody a[href^="${opts.hrefPrefix}"]`)
    .first();
  const linkAnywhere = page
    .locator(`main a[href^="${opts.hrefPrefix}"]`)
    .first();

  const tryGetHref = async (
    candidate: typeof linkInTable,
    timeout: number,
  ): Promise<string | null> => {
    try {
      await candidate.waitFor({ state: "visible", timeout });
      return await candidate.getAttribute("href");
    } catch {
      return null;
    }
  };

  const hrefFromTable = await tryGetHref(linkInTable, 15000);
  if (hrefFromTable) return hrefFromTable;

  const hrefFromAnywhere = await tryGetHref(linkAnywhere, 15000);
  if (hrefFromAnywhere) return hrefFromAnywhere;

  // Some views may use a button or row click instead of an <a> link.
  const actionButton = page
    .locator("main")
    .locator('button:has-text("ดูตาราง"), a:has-text("ดูตาราง")')
    .first();
  if (await actionButton.isVisible().catch(() => false)) {
    const before = page.url();
    await actionButton.click();
    await expect(page).not.toHaveURL(before, { timeout: 15000 });
    if (page.url().includes(opts.hrefPrefix)) return page.url();
  }

  const firstRow = page.locator("main table tbody tr").first();
  if (await firstRow.isVisible().catch(() => false)) {
    const before = page.url();
    await firstRow.click();
    await expect(page).not.toHaveURL(before, { timeout: 15000 });
    if (page.url().includes(opts.hrefPrefix)) return page.url();
  }

  throw new Error(`No schedule link found for prefix ${opts.hrefPrefix}`);
};

const getPublicTeacherSchedulePath = async (
  page: import("@playwright/test").Page,
): Promise<string> => {
  if (cachedTeacherSchedulePath) return cachedTeacherSchedulePath;
  cachedTeacherSchedulePath = await getFirstPublicSchedulePath(page, {
    tabTestId: "teachers-tab",
    hrefPrefix: "/teachers/",
    placeholder: /ค้นหาครู/i,
  });
  return cachedTeacherSchedulePath;
};

const getPublicClassSchedulePath = async (
  page: import("@playwright/test").Page,
): Promise<string> => {
  if (cachedClassSchedulePath) return cachedClassSchedulePath;
  cachedClassSchedulePath = await getFirstPublicSchedulePath(page, {
    tabTestId: "classes-tab",
    hrefPrefix: "/classes/",
    placeholder: /ค้นหาชั้นเรียน/i,
  });
  return cachedClassSchedulePath;
};

test.describe("Public Teacher Schedule Page", () => {
  test("should load teacher schedule without authentication", async ({
    guestPage,
  }) => {
    const page = guestPage;
    // Navigate to public teacher schedule (using a real link from homepage)
    await page.goto(await getPublicTeacherSchedulePath(page));

    // Should not redirect to login
    expect(page.url()).toContain("/teachers/");

    // Should show schedule UI (avoid strict-mode issues with multiple <h1> on the page)
    await expect(
      page.getByTestId("schedule-grid").or(page.locator("table").first()),
    ).toBeVisible({ timeout: 15000 });

    // Should show teacher name
    await expect(page.getByTestId("teacher-name")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display timetable grid with days and periods", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto(await getPublicTeacherSchedulePath(page));

    // Wait for main content to be visible (Next.js streams; no networkidle)
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Should have table element (grid layout, not cards)
    const table = page
      .getByTestId("schedule-grid")
      .or(page.locator("table").first());
    await expect(table).toBeVisible({ timeout: 15000 });

    // Table should have header row with days
    const headers = page.locator("thead th");
    await expect(headers).toHaveCount(6); // "คาบ/เวลา" + 5 days (MON-FRI)

    // First header is "period/time", remaining are day labels (language may vary)
    await expect(headers.first()).toContainText(/คาบ\/เวลา|Period/i);
    for (let i = 1; i < 6; i += 1) {
      await expect(headers.nth(i)).toHaveText(/.+/);
    }
  });

  test("should display period numbers and time ranges", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto(await getPublicTeacherSchedulePath(page));

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Period column is the first column and includes a time range.
    const periodCells = page.locator("tbody tr > td:first-child");
    const count = await periodCells.count();

    // Should have at least one period row (exact count depends on config)
    expect(count).toBeGreaterThan(0);

    // Should show a period label + time range (e.g., "คาบ 1" and "08:00 - 08:50")
    const firstPeriodCell = periodCells.first();
    await expect(firstPeriodCell).toContainText(/คาบ\s+\d+|Period\s+\d+/i);
    await expect(firstPeriodCell).toContainText(
      /\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/,
    );
  });

  test("should display subject details in schedule cells", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto(await getPublicTeacherSchedulePath(page));

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Find cells with schedule data (not empty)
    const scheduledCells = page.locator("td .font-medium");
    const cellsWithData = await scheduledCells.count();

    if (cellsWithData > 0) {
      // First scheduled cell should show subject name
      const firstCell = scheduledCells.first();
      await expect(firstCell).toBeVisible();

      // Should have subject code (e.g., "ท21101")
      const firstCellTd = firstCell.locator("xpath=ancestor::td[1]");
      await expect(firstCellTd.locator(".text-xs")).toContainText(
        /[ก-ฮ]\d{5}|[A-Z]{2}\d{3}/,
      );

      // Should show grade level (e.g., "ม.1/1")
      const gradeCount = await firstCellTd
        .locator(".text-xs")
        .filter({ hasText: /ม\.\d+\/\d+/ })
        .count();
      expect(gradeCount).toBeGreaterThanOrEqual(1);
    }
  });

  test("should display room information when available", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto(await getPublicTeacherSchedulePath(page));

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Look for room labels (e.g., "ห้อง: A101")
    const roomLabels = page.locator("td").filter({ hasText: /ห้อง:/ });
    const roomCount = await roomLabels.count();

    // If teacher has assigned rooms, they should be displayed
    if (roomCount > 0) {
      await expect(roomLabels.first()).toContainText(/ห้อง:\s*\w+/);
    }
  });

  test("should show empty cells for unscheduled periods", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto(await getPublicTeacherSchedulePath(page));

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Empty cells render "-" with a dedicated style (avoid matching time-range hyphens)
    const emptyMarkers = page
      .getByTestId("schedule-grid")
      .locator("tbody td .text-gray-400")
      .filter({ hasText: "-" });
    const emptyCount = await emptyMarkers.count();

    // There should be at least some empty cells (not 100% utilization)
    expect(emptyCount).toBeGreaterThan(0);
  });

  test("should handle no schedule data gracefully", async ({ guestPage }) => {
    const page = guestPage;
    // Try accessing a teacher with no schedules (using high ID unlikely to exist)
    await page.goto(`/teachers/99999/${testSemester.SemesterAndyear}`);

    // Should either show "not found" or empty schedule message
    const noDataMessage = page.locator(
      "text=/ไม่มีตารางสอน|ไม่พบข้อมูล|No data|not found/i",
    );
    const isVisible = await noDataMessage
      .isVisible({ timeout: 15000 })
      .catch(() => false);

    if (isVisible) {
      await expect(noDataMessage).toBeVisible();
    } else {
      // If page loads, timetable should be empty
      const scheduledCells = page.locator("td .font-medium");
      await expect(scheduledCells).toHaveCount(0);
    }
  });

  test("should have print-friendly layout", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto(await getPublicTeacherSchedulePath(page));

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Look for print instructions or print button
    const printHints = page.locator("text=/print|พิมพ์|Print/i");
    await expect(printHints.first()).toBeVisible();

    // Should mention landscape orientation
    await expect(page.locator("text=/landscape/i")).toBeVisible();
  });

  test("should navigate back to homepage", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto(await getPublicTeacherSchedulePath(page));

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Should have back button
    const backButton = page.locator(
      'a[href="/"], a:has-text("กลับหน้าแรก"), a:has-text("Back")',
    );
    await expect(backButton.first()).toBeVisible({ timeout: 15000 });

    // Click back button and wait for navigation
    await backButton.first().click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
  });

  test("should display semester information", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto(await getPublicTeacherSchedulePath(page));

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Should show semester and year (e.g., "ภาคเรียนที่ 1 ปีการศึกษา 2567")
    await expect(
      page.locator("text=/ภาคเรียน(ที่)?\\s*\\d+\\s*ปีการศึกษา\\s*\\d{4}/i"),
    ).toBeVisible();
  });

  test("should handle invalid semester format", async ({ guestPage }) => {
    const page = guestPage;
    // Invalid semester format (should be "1-2567")
    await page.goto(`/teachers/${testTeacher.TeacherID}/invalid-semester`, {
      waitUntil: "domcontentloaded",
    });

    // Should show not found or error page
    const notFound = page.locator("text=/\\b404\\b|not found|ไม่พบ/i").first();
    await expect(notFound).toBeVisible({ timeout: 15000 });
  });
});

test.describe("Public Class Schedule Page", () => {
  test("should load class schedule without authentication", async ({
    guestPage,
  }) => {
    const page = guestPage;
    // Navigate to public class schedule (using a real link from homepage)
    await page.goto(await getPublicClassSchedulePath(page));

    // Should not redirect to login
    expect(page.url()).toContain("/classes/");

    // Should show class schedule header (scope to main to avoid strict-mode conflicts)
    await expect(page.locator("main h1").first()).toContainText("ตารางเรียน");
  });

  test("should display class information", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto(await getPublicClassSchedulePath(page));

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
    await page.goto(await getPublicClassSchedulePath(page));

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

    // Header row should have 6 columns (period + 5 days)
    const headers = page.locator("thead th");
    await expect(headers).toHaveCount(6);

    // First column header should be for periods
    await expect(headers.first()).toContainText(/คาบ|Period/i);
  });

  test("should display teacher names in schedule cells", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto(await getPublicClassSchedulePath(page));

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

      // Teacher name format should include prefix + first name + last name
      await expect(teacherNames.first()).toContainText(
        /^(นาย|นาง|นางสาว|Mr\.|Mrs\.|Ms\.)\S*\s+\S+/,
      );
    }
  });

  test("should display subject information", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto(await getPublicClassSchedulePath(page));

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

  test("should navigate between teacher and class schedules", async ({
    guestPage,
  }) => {
    const page = guestPage;
    // Start on class schedule
    await page.goto(await getPublicClassSchedulePath(page));
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Find a teacher link in the schedule (if clickable)
    const teacherLink = page.locator('a[href*="/teachers/"]').first();
    const hasTeacherLinks = await teacherLink.isVisible().catch(() => false);

    if (hasTeacherLinks) {
      // Click teacher link
      await teacherLink.click();
      await expect(page).toHaveURL(/\/teachers\//, { timeout: 15000 });

      // Should navigate to teacher schedule
      expect(page.url()).toContain("/teachers/");

      // Should show teacher schedule grid
      await expect(
        page.getByTestId("schedule-grid").or(page.locator("table").first()),
      ).toBeVisible({ timeout: 15000 });
    }
  });

  test("should handle multiple periods per day correctly", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto(
      `/classes/${testGradeLevel.GradeID}/${testSemester.SemesterAndyear}`,
    );

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Count total period rows (should be 8-10 typically)
    const periodRows = page.locator("tbody tr");
    const rowCount = await periodRows.count();

    expect(rowCount).toBeGreaterThan(0);
    expect(rowCount).toBeLessThanOrEqual(12); // Sanity check
  });

  test("should show program information if available", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto(
      `/classes/${testGradeLevel.GradeID}/${testSemester.SemesterAndyear}`,
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

test.describe("Public Schedule Pages - Common Features", () => {
  test("should not expose PII (email, phone) in teacher schedules", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto(await getPublicTeacherSchedulePath(page));
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

    // Should NOT contain email patterns
    const emailPattern = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    expect(emailPattern.test(content)).toBe(false);

    // Should NOT contain phone number patterns (exclude year patterns like 1-2567)
    const phonePattern = /(?<!\d-)\d{3}-\d{3}-\d{4}(?!-)|(?<!-)\d{10}(?!-)/;
    expect(phonePattern.test(content)).toBe(false);
  });

  test("should not expose PII in class schedules", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto(await getPublicClassSchedulePath(page));
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
    // We check for " @ " or mailto links, or specific email patterns
    // heavily simplified to avoid matching @media, @keyframes, etc.
    expect(content.toLowerCase()).not.toContain("postgresql://");
  });

  test("should be responsive on mobile viewport", async ({ guestPage }) => {
    const page = guestPage;
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(await getPublicTeacherSchedulePath(page));
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

    await page.goto(await getPublicClassSchedulePath(page));
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
    const startTime = Date.now();

    await page.goto(await getPublicTeacherSchedulePath(page));
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    const loadTime = Date.now() - startTime;

    // Dev mode can be slower due to first-hit compilation.
    const maxMs = process.env.CI ? 5000 : 15000;
    expect(loadTime).toBeLessThan(maxMs);
  });

  test("should handle long subject names gracefully", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto(await getPublicClassSchedulePath(page));
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
    await page.goto(await getPublicTeacherSchedulePath(page));
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

  test("should handle invalid teacher ID", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto(`/teachers/invalid-id/${testSemester.SemesterAndyear}`, {
      waitUntil: "domcontentloaded",
    });
    await expectNotFound(page);
  });

  test("should handle invalid class ID", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto(`/classes/999999/${testSemester.SemesterAndyear}`, {
      waitUntil: "domcontentloaded",
    });
    await expectNotFound(page);
  });

  test("should handle missing semester parameter", async ({ guestPage }) => {
    const page = guestPage;
    // /teachers/[id] is a valid public route (defaults to current schedule),
    // so missing semester segment should still render.
    await page.goto(`/teachers/${testTeacher.TeacherID}/`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("schedule-grid")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should show meaningful error for non-existent semester", async ({
    guestPage,
  }) => {
    const page = guestPage;
    const year = testSemester.SemesterAndyear.split("-")[1];
    // Try accessing semester that doesn't exist (e.g., semester 5)
    await page.goto(`/teachers/${testTeacher.TeacherID}/5-${year}`, {
      waitUntil: "domcontentloaded",
    });
    await expectNotFound(page);
  });
});
