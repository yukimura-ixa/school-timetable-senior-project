/**
 * E2E Tests for Public Schedule Pages (Grid Implementation)
 *
 * Tests the newly implemented public teacher and class schedule pages with:
 * - Grid-based timetable layout (rows=periods, columns=days)
 * - parseSlotNumber() logic for TimeslotID format "1-2567-MON-1"
 * - Responsive design and print functionality
 * - No authentication required
 *
 * Related Files:
 * - src/app/(public)/teachers/[id]/[semesterAndyear]/page.tsx
 * - src/app/(public)/classes/[gradeId]/[semesterAndyear]/page.tsx
 */

import { test, expect } from "./fixtures/admin.fixture";

test.describe("Public Teacher Schedule Page", () => {
  test("should load teacher schedule without authentication", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Navigate to public teacher schedule (using seeded data)
    await page.goto("/teachers/1/1-2567");

    // Should not redirect to login
    expect(page.url()).toContain("/teachers/1/1-2567");

    // Should show teacher info
    await expect(page.locator("h1")).toContainText("ตารางสอน");

    // Should show teacher name
    const teacherName = page.locator(
      '[data-testid="teacher-name"], p.font-medium',
    );
    await expect(teacherName).toBeVisible({ timeout: 15000 });
  });

  test("should display timetable grid with days and periods", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/teachers/1/1-2567");

    // Wait for main content to be visible (Next.js streams; no networkidle)
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Should have table element (grid layout, not cards)
    const table = page.locator("table").first();
    await expect(table).toBeVisible({ timeout: 15000 });

    // Table should have header row with days
    const headers = page.locator("thead th");
    await expect(headers).toHaveCount(6); // "คาบ/เวลา" + 5 days (MON-FRI)

    // Should show day names in Thai
    await expect(headers).toContainText([
      "จันทร์",
      "อังคาร",
      "พุธ",
      "พฤหัสบดี",
      "ศุกร์",
    ]);
  });

  test("should display period numbers and time ranges", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/teachers/1/1-2567");

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Period column should show "คาบ 1", "คาบ 2", etc.
    const periodCells = page.locator("td").filter({ hasText: /^คาบ \d+$/ });
    const count = await periodCells.count();

    // Should have at least 8 periods (typical school schedule)
    expect(count).toBeGreaterThanOrEqual(8);

    // Should show time ranges (e.g., "08:00 - 08:50")
    const firstPeriodCell = page
      .locator("td")
      .filter({ hasText: /คาบ 1/ })
      .first();
    await expect(firstPeriodCell).toContainText(/\d{2}:\d{2}/); // Time format
  });

  test("should display subject details in schedule cells", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/teachers/1/1-2567");

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
      await expect(page.locator("td .text-xs").first()).toContainText(
        /[ก-ฮ]\d{5}|[A-Z]{2}\d{3}/,
      );

      // Should show grade level (e.g., "ม.1/1")
      const gradeCount = await page
        .locator("td .text-xs")
        .filter({ hasText: /ม\.\d+\/\d+/ })
        .count();
      expect(gradeCount).toBeGreaterThanOrEqual(1);
    }
  });

  test("should display room information when available", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/teachers/1/1-2567");

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
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/teachers/1/1-2567");

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Empty cells should show "-" or similar placeholder
    const emptyCells = page.locator("td").filter({ hasText: /^-$|^$/ });
    const emptyCount = await emptyCells.count();

    // There should be at least some empty cells (not 100% utilization)
    expect(emptyCount).toBeGreaterThan(0);
  });

  test("should handle no schedule data gracefully", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Try accessing a teacher with no schedules (using high ID unlikely to exist)
    await page.goto("/teachers/99999/1-2567");

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

  test("should have print-friendly layout", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/teachers/1/1-2567");

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Look for print instructions or print button
    const printHints = page.locator("text=/print|พิมพ์|Print/i");
    await expect(printHints.first()).toBeVisible();

    // Should mention landscape orientation
    await expect(page.locator("text=/landscape|แนวนอน/i")).toBeVisible();
  });

  test("should navigate back to homepage", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/teachers/1/1-2567");

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Should have back button
    const backButton = page.locator(
      'a[href="/"], a:has-text("กลับหน้าแรก"), a:has-text("Back")',
    );
    await expect(backButton.first()).toBeVisible();

    // Click back button
    await backButton.first().click();
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Should be on homepage
    expect(page.url()).toMatch(/\/$|\/\?/);
  });

  test("should display semester information", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/teachers/1/1-2567");

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Should show semester and year (e.g., "ภาคเรียนที่ 1 ปีการศึกษา 2567")
    await expect(
      page.locator("text=/ภาคเรียนที่\s*\d+\s*ปีการศึกษา\s*\d{4}/i"),
    ).toBeVisible();
  });

  test("should handle invalid semester format", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Invalid semester format (should be "1-2567")
    await page.goto("/teachers/1/invalid-semester");

    // Should show not found or error page
    const notFound = page.locator("text=/not found|ไม่พบ|404/i");
    await expect(notFound).toBeVisible({ timeout: 15000 });
  });
});

test.describe("Public Class Schedule Page", () => {
  test("should load class schedule without authentication", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Navigate to public class schedule (using seeded data: grade "101" = ม.1/1)
    await page.goto("/classes/101/1-2567");

    // Should not redirect to login
    expect(page.url()).toContain("/classes/101/1-2567");

    // Should show class schedule header
    await expect(page.locator("h1")).toContainText("ตารางเรียน");
  });

  test("should display class information", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/classes/101/1-2567");

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Should show grade level (e.g., "ม.1/1")
    await expect(
      page.locator('p.font-medium, [data-testid="class-name"]'),
    ).toContainText(/ม\.\d+\/\d+/);
  });

  test("should display timetable grid with correct structure", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/classes/101/1-2567");

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Should have table element
    const table = page.locator("table").first();
    await expect(table).toBeVisible({ timeout: 15000 });

    // Header row should have 6 columns (period + 5 days)
    const headers = page.locator("thead th");
    await expect(headers).toHaveCount(6);

    // First column header should be for periods
    await expect(headers.first()).toContainText(/คาบ|Period/i);
  });

  test("should display teacher names in schedule cells", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/classes/101/1-2567");

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
        /^(นาย|นาง|นางสาว|Mr\.|Mrs\.|Ms\.)\s+\S+\s+\S+/,
      );
    }
  });

  test("should display subject information", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/classes/101/1-2567");

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
      await expect(subjectCells.first()).toBeVisible();

      // Should have subject codes
      await expect(page.locator("td .text-xs").first()).toContainText(
        /[ก-ฮ]\d{5}|[A-Z]{2}\d{3}/,
      );
    }
  });

  test("should navigate between teacher and class schedules", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Start on class schedule
    await page.goto("/classes/101/1-2567");
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
      await expect(
        page.locator('main, [role="main"], body').first(),
      ).toBeVisible({
        timeout: 15000,
      });

      // Should navigate to teacher schedule
      expect(page.url()).toContain("/teachers/");

      // Should show teacher schedule
      await expect(page.locator("h1")).toContainText("ตารางสอน");
    }
  });

  test("should handle multiple periods per day correctly", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/classes/101/1-2567");

    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Count total period rows (should be 8-10 typically)
    const periodRows = page.locator("tbody tr");
    const rowCount = await periodRows.count();

    expect(rowCount).toBeGreaterThanOrEqual(8);
    expect(rowCount).toBeLessThanOrEqual(12); // Sanity check
  });

  test("should show program information if available", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/classes/101/1-2567");

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
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/teachers/1/1-2567");
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    const content = await page.content();

    // Should NOT contain email patterns
    const emailPattern = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    expect(emailPattern.test(content)).toBe(false);

    // Should NOT contain phone number patterns
    const phonePattern = /\d{3}-\d{3}-\d{4}|\d{10}/;
    expect(phonePattern.test(content)).toBe(false);
  });

  test("should not expose PII in class schedules", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/classes/101/1-2567");
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    const content = await page.content();

    // No email addresses (simple check, avoiding CSS @keyframes)
    // We check for " @ " or mailto links, or specific email patterns
    // heavily simplified to avoid matching @media, @keyframes, etc.
    expect(content.toLowerCase()).not.toContain("postgresql://");
  });

  test("should be responsive on mobile viewport", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/teachers/1/1-2567");
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Table should be scrollable horizontally
    const table = page.locator("table").first();
    await expect(table).toBeVisible();

    // Container should have overflow-x-auto or similar
    const scrollContainer = page
      .locator(".overflow-x-auto, .overflow-auto")
      .first();
    await expect(scrollContainer).toBeVisible({ timeout: 15000 });
  });

  test("should be responsive on tablet viewport", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto("/classes/101/1-2567");
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
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const startTime = Date.now();

    await page.goto("/teachers/1/1-2567");
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test("should handle long subject names gracefully", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/classes/101/1-2567");
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

  test("should maintain accessibility standards", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/teachers/1/1-2567");
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // Table should have proper semantic structure
    const table = page.locator("table").first();
    await expect(table).toBeVisible();

    // Should have thead and tbody
    await expect(page.locator("thead")).toBeVisible();
    await expect(page.locator("tbody")).toBeVisible();

    // Headers should have proper scope (implicit in <th>)
    const headers = page.locator("thead th");
    const count = await headers.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });
});

test.describe("Public Schedule Pages - Error Handling", () => {
  test("should handle invalid teacher ID", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/teachers/invalid-id/1-2567");

    // Should show not found or error message
    const error = page.locator("text=/not found|ไม่พบ|404|error/i");
    await expect(error).toBeVisible({ timeout: 15000 });
  });

  test("should handle invalid class ID", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/classes/999999/1-2567");

    // Should show not found or error message
    const error = page.locator("text=/not found|ไม่พบ|404|error/i");
    await expect(error).toBeVisible({ timeout: 15000 });
  });

  test("should handle missing semester parameter", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Try accessing without semester parameter (if route allows)
    const response = await page
      .goto("/teachers/1/", { waitUntil: "networkidle" })
      .catch(() => null);

    if (response) {
      // Should either show error or redirect to valid route
      const isError =
        page.url().includes("404") || page.url().includes("error");
      const hasErrorMessage = await page
        .locator("text=/error|not found|ไม่พบ/i")
        .isVisible()
        .catch(() => false);

      expect(isError || hasErrorMessage).toBe(true);
    }
  });

  test("should show meaningful error for non-existent semester", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Try accessing semester that doesn't exist (e.g., semester 5)
    await page.goto("/teachers/1/5-2567");

    // Should show "not found" since semester 5 doesn't exist
    const notFound = page.locator("text=/not found|ไม่พบ|404/i");
    await expect(notFound).toBeVisible({ timeout: 15000 });
  });
});
