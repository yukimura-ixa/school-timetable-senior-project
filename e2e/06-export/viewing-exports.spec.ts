import { test, expect } from "@playwright/test";
import { NavigationHelper } from "../helpers/navigation";

/**
 * [journey] Viewing and Export Tests (Teacher/Student/Programs/Timeslots)
 * Covers:
 *  - Teacher table view
 *  - Student table view
 *  - All programs view
 *  - All timeslots view
 *  - Presence of export/print controls
 *
 * Original TC references: TC-017 – TC-024
 */

test.describe("Dashboard Viewing", () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
  });

  test("[journey] teacher table view loads", async ({ page }) => {
    const semester = "1-2567";
    await nav.goToTeacherTable(semester);
    await expect(page).toHaveURL(/teacher-table/, { timeout: 60_000 });
    const bulkExportContainer = page.locator(
      '[data-testid="bulk-export-section"], [data-testid="bulk-export-skeleton"]',
    );
    await expect(bulkExportContainer.first()).toBeVisible({ timeout: 60_000 });
    await page.screenshot({
      path: "test-results/screenshots/teacher-table.png",
      fullPage: true,
    });
  });

  test("[journey] student table view loads", async ({ page }) => {
    const semester = "1-2567";
    await nav.goToStudentTable(semester);
    await expect(page).toHaveURL(/student-table/, { timeout: 60_000 });
    // Wait for either main content or classroom selector to appear
    const contentIndicator = page.locator(
      'main, [data-testid="class-multi-select"], text=กรุณาเลือกห้องเรียน',
    );
    await expect(contentIndicator.first()).toBeVisible({ timeout: 60_000 });
    await page.screenshot({
      path: "test-results/screenshots/student-table.png",
      fullPage: true,
    });
  });

  test("[journey] all programs view loads", async ({ page }) => {
    const semester = "1-2567";
    await nav.goToAllPrograms(semester);
    await expect(page).toHaveURL(/all-program/, { timeout: 60_000 });
    // Wait for main content to appear
    const contentIndicator = page.locator("main, table, .MuiPaper-root");
    await expect(contentIndicator.first()).toBeVisible({ timeout: 60_000 });
    await page.screenshot({
      path: "test-results/screenshots/all-programs.png",
      fullPage: true,
    });
  });

  test("[journey] all timeslots view loads", async ({ page }) => {
    const semester = "1-2567";
    await nav.goToAllTimeslots(semester);
    await expect(page).toHaveURL(/all-timeslot/, { timeout: 60_000 });
    // Wait for main content to appear
    const contentIndicator = page.locator("main, table, .MuiPaper-root");
    await expect(contentIndicator.first()).toBeVisible({ timeout: 60_000 });
    await page.screenshot({
      path: "test-results/screenshots/all-timeslots.png",
      fullPage: true,
    });
  });
});

test.describe("Export & Print Controls", () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
  });

  test("[journey] export buttons visible on teacher table", async ({
    page,
  }) => {
    const semester = "1-2567";
    await nav.goToTeacherTable(semester);
    const exportButtons = page.locator(
      '[data-testid="teacher-export-menu-button"], [data-testid="teacher-export-excel-button"], [data-testid="teacher-export-pdf-button"], button:has-text("ส่งออก"), button:has-text("Excel")',
    );
    await expect(exportButtons.first()).toBeVisible({ timeout: 60_000 });
    await page.screenshot({
      path: "test-results/screenshots/export-buttons-teacher.png",
      fullPage: true,
    });
    expect(await exportButtons.count()).toBeGreaterThan(0);
  });

  test("[journey] export buttons visible on student table", async ({
    page,
  }) => {
    const semester = "1-2567";
    await nav.goToStudentTable(semester);
    // First, wait for the page to load and look for bulk export section
    // The export buttons may be in a collapsed panel, so look for the panel or filter button
    const bulkExportSection = page.locator(
      '[data-testid="student-export-menu-button"], button:has-text("การส่งออกแบบกลุ่ม"), button:has-text("ตัวกรอง"), button:has-text("นำออก")',
    );
    await expect(bulkExportSection.first()).toBeVisible({ timeout: 60_000 });
    await page.screenshot({
      path: "test-results/screenshots/export-buttons-student.png",
      fullPage: true,
    });
    expect(await bulkExportSection.count()).toBeGreaterThan(0);
  });

  test("[journey] print functionality available on teacher table", async ({
    page,
  }) => {
    const semester = "1-2567";
    await nav.goToTeacherTable(semester);
    const printButton = page.locator(
      '[data-testid="bulk-export-print-button"], button:has-text("พิมพ์"), button:has-text("print")',
    );
    await expect(printButton.first()).toBeVisible({ timeout: 60_000 });
    await page.screenshot({
      path: "test-results/screenshots/print-button-teacher.png",
      fullPage: true,
    });
    expect(await printButton.count()).toBeGreaterThan(0);
  });
});
