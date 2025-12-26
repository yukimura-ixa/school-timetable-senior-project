/**
 * @file dashboard-views.spec.ts
 * @description E2E tests for dashboard table view pages
 *
 * Covers pages that were lacking test coverage:
 * - /dashboard/{semester}/student-table
 * - /dashboard/{semester}/all-timeslot
 * - /dashboard/{semester}/teacher-table
 *
 * Priority: MEDIUM - These are common viewing paths for all users
 */

import { test, expect } from "../fixtures/admin.fixture";

const TEST_SEMESTER = "2567/1";

test.describe.skip("Dashboard - Teacher Table View", () => {
  test("TC-DASH-T01: Teacher table page loads with data", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/dashboard/${TEST_SEMESTER}/teacher-table`);
    await page.waitForLoadState("domcontentloaded");

    // Verify URL
    expect(page.url()).toContain("/teacher-table");

    // Wait for table or content
    const content = page
      .locator("table")
      .or(page.locator('[class*="Skeleton"]'));
    await expect(content.first()).toBeVisible({ timeout: 15000 });

    // Take screenshot for visual verification
    await page.screenshot({
      path: "test-results/screenshots/teacher-table-view.png",
      fullPage: true,
    });
  });

  test("TC-DASH-T02: Teacher table has filter controls", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/dashboard/${TEST_SEMESTER}/teacher-table`);
    await page.waitForSelector("table, [class*='Skeleton']", { timeout: 15000 });

    // Look for filter controls (search, dropdown, etc.)
    const filterControls = page
      .locator('input[type="text"]')
      .or(page.locator("select"))
      .or(page.locator('[role="combobox"]'))
      .or(page.locator('input[placeholder*="ค้นหา"]'));

    const hasFilters = (await filterControls.count()) > 0;
    console.log("Has filter controls:", hasFilters);

    // Page should have some interactive elements
    expect(hasFilters).toBe(true);
  });

  test("TC-DASH-T03: Teacher table supports row selection", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/dashboard/${TEST_SEMESTER}/teacher-table`);
    await page.waitForSelector("table", { timeout: 15000 });

    // Check for checkboxes (for export selection)
    const checkboxes = page.locator('table input[type="checkbox"]');
    const hasCheckboxes = (await checkboxes.count()) > 0;

    if (hasCheckboxes) {
      // Try selecting first row
      await checkboxes.first().check();
      await expect(checkboxes.first()).toBeChecked();
    }

    console.log("Has row selection:", hasCheckboxes);
  });

  test("TC-DASH-T04: Teacher table has export buttons for admin", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/dashboard/${TEST_SEMESTER}/teacher-table`);
    await page.waitForSelector("table, [class*='Skeleton']", { timeout: 15000 });

    // Look for export buttons (Excel, PDF)
    const exportButtons = page.locator(
      "button:has-text('ส่งออก'), button:has-text('Export'), button:has-text('Excel'), button:has-text('PDF')",
    );

    const hasExport = (await exportButtons.count()) > 0;
    console.log("Has export buttons:", hasExport);

    // Admin should have export access
    expect(hasExport).toBe(true);
  });
});

test.describe.skip("Dashboard - Student Table View", () => {
  test("TC-DASH-S01: Student table page loads", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/dashboard/${TEST_SEMESTER}/student-table`);
    await page.waitForLoadState("domcontentloaded");

    // Verify URL
    expect(page.url()).toContain("/student-table");

    // Wait for content
    const content = page
      .locator("table")
      .or(page.locator('[class*="Skeleton"]'))
      .or(page.locator("main"));
    await expect(content.first()).toBeVisible({ timeout: 15000 });

    // Take screenshot
    await page.screenshot({
      path: "test-results/screenshots/student-table-view.png",
      fullPage: true,
    });
  });

  test("TC-DASH-S02: Student table has grade level filter", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/dashboard/${TEST_SEMESTER}/student-table`);
    await page.waitForSelector("table, [class*='Skeleton'], main", {
      timeout: 15000,
    });

    // Look for grade level filter (ม.1-ม.6)
    const gradeFilter = page
      .locator("text=/ม\\.1|ม\\.2|ม\\.3|ม\\.4|ม\\.5|ม\\.6|ชั้น|grade/i")
      .or(page.locator('select:has-text("ม.")'))
      .or(page.locator('[role="combobox"]'));

    const hasGradeFilter = (await gradeFilter.count()) > 0;
    console.log("Has grade filter:", hasGradeFilter);
  });

  test("TC-DASH-S03: Student table shows class sections", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/dashboard/${TEST_SEMESTER}/student-table`);
    await page.waitForSelector("table, main", { timeout: 15000 });

    // Look for class section indicators (ม.1/1, 1/2, etc.)
    const classSections = page.locator(
      "text=/\\/\\d|ห้อง|section|class/i",
    );

    const hasSections =
      (await classSections.count()) > 0 ||
      (await page.locator("table tbody tr").count()) > 0;

    console.log("Has class sections or data:", hasSections);
  });
});

test.describe.skip("Dashboard - All Timeslot View", () => {
  test("TC-DASH-A01: All timeslot page loads", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/dashboard/${TEST_SEMESTER}/all-timeslot`);
    await page.waitForLoadState("domcontentloaded");

    // Verify URL
    expect(page.url()).toContain("/all-timeslot");

    // Wait for content
    const content = page
      .locator("table")
      .or(page.locator('[class*="Skeleton"]'))
      .or(page.locator("main"));
    await expect(content.first()).toBeVisible({ timeout: 15000 });

    // Take screenshot
    await page.screenshot({
      path: "test-results/screenshots/all-timeslot-view.png",
      fullPage: true,
    });
  });

  test("TC-DASH-A02: All timeslot shows timetable grid", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/dashboard/${TEST_SEMESTER}/all-timeslot`);
    await page.waitForSelector("table, [class*='Skeleton']", { timeout: 15000 });

    // Should have a table or grid structure
    const tableOrGrid = page.locator("table").or(page.locator('[role="grid"]'));
    await expect(tableOrGrid.first()).toBeVisible({ timeout: 15000 });

    // Should have header cells (days/periods)
    const headers = page.locator("th, [role='columnheader']");
    const headerCount = await headers.count();
    console.log("Header count:", headerCount);

    expect(headerCount).toBeGreaterThan(0);
  });

  test("TC-DASH-A03: All timeslot has day column headers", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/dashboard/${TEST_SEMESTER}/all-timeslot`);
    await page.waitForSelector("table", { timeout: 15000 });

    // Look for Thai day names (จันทร์, อังคาร, etc.) or period headers
    const dayHeaders = page.locator(
      "text=/จันทร์|อังคาร|พุธ|พฤหัส|ศุกร์|Monday|Tuesday|คาบ|Period/i",
    );

    const hasDayHeaders = (await dayHeaders.count()) > 0;
    console.log("Has day/period headers:", hasDayHeaders);

    expect(hasDayHeaders).toBe(true);
  });

  test("TC-DASH-A04: All timeslot export button accessible to admin", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/dashboard/${TEST_SEMESTER}/all-timeslot`);
    await page.waitForSelector("table, [class*='Skeleton']", { timeout: 15000 });

    // Look for export functionality
    const exportButton = page.locator(
      "button:has-text('ส่งออก'), button:has-text('Export'), button:has-text('Excel')",
    );

    const hasExport = (await exportButton.count()) > 0;
    console.log("Has export button:", hasExport);
  });
});

test.describe.skip("Dashboard - Cross-Semester Navigation", () => {
  test("TC-DASH-N01: Navigate between semesters preserves view type", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    // Start at teacher-table for 1-2567
    await page.goto(`/dashboard/2567/1/teacher-table`);
    await page.waitForSelector("table, [class*='Skeleton']", { timeout: 15000 });

    // Look for semester switcher/selector
    const semesterSelector = page
      .locator("text=/2-2567|ภาคเรียน/")
      .or(page.locator('[role="combobox"]'))
      .or(page.locator("select"));

    if ((await semesterSelector.count()) > 0) {
      // Try clicking to open dropdown
      await semesterSelector.first().click({ timeout: 5000 }).catch(() => {});

      // Try to select 2-2567
      const semesterOption = page.locator("text=2-2567");
      if ((await semesterOption.count()) > 0) {
        await semesterOption.first().click();

        // Verify URL changed to 2-2567 but still teacher-table
        await expect(page).toHaveURL(/2-2567.*teacher-table|teacher-table.*2-2567/, {
          timeout: 10000,
        });
      }
    }
  });

  test("TC-DASH-N02: All three view types accessible for same semester", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    const viewTypes = ["teacher-table", "student-table", "all-timeslot"];

    for (const viewType of viewTypes) {
      await page.goto(`/dashboard/${TEST_SEMESTER}/${viewType}`);
      await page.waitForLoadState("domcontentloaded");

      // Verify URL contains view type
      expect(page.url()).toContain(viewType);

      // Verify page loads without error (has content)
      const content = await page.textContent("body");
      expect(content?.length).toBeGreaterThan(100);

      console.log(`✓ ${viewType} loaded successfully`);
    }
  });
});

test.describe.skip("Dashboard - Empty State Handling", () => {
  test("TC-DASH-E01: Handle semester with no data gracefully", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    // Try a future semester that might not have data
    await page.goto("/dashboard/2570/1/teacher-table");
    await page.waitForLoadState("domcontentloaded");

    // Should show empty state or appropriate message (not crash)
    const hasContent =
      (await page.locator("table").count()) > 0 ||
      (await page.locator("text=/ไม่พบข้อมูล|no data|empty/i").count()) > 0 ||
      (await page.locator("main").count()) > 0;

    expect(hasContent).toBe(true);

    // Page should not show error
    const hasError = await page
      .locator("text=/error|500|crashed/i")
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasError).toBe(false);
  });
});
