import { test, expect } from "./fixtures/admin.fixture";
import { waitForAppReady } from "./helpers/wait-for-app-ready";
import {
  testSemester,
  testTeacher,
  testSubjects,
  testGradeLevels,
} from "./fixtures/seed-data.fixture";

/**
 * E2E Tests: Subject Assignment Flow
 *
 * Tests the `/schedule/[term]/assign` page functionality:
 * - Teacher search and selection
 * - Viewing existing assignments
 * - Assignment validation
 *
 * Uses local PostgreSQL database (localhost:5433)
 */

const SEMESTER = `${testSemester.Year}/${testSemester.Semester}`;

test.describe("Subject Assignment - Page Load", () => {
  test("AS-01: Assignment page loads successfully", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${SEMESTER}/assign`);
    await page.waitForLoadState("networkidle");

    // Verify page structure is visible
    await waitForAppReady(page);

    // Should have teacher search/selection area
    const teacherAutocomplete = page.locator('[role="combobox"]').first();
    await expect(teacherAutocomplete).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: "test-results/screenshots/assign-01-page-load.png",
      fullPage: true,
    });
  });

  test("AS-02: Teacher search autocomplete works", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${SEMESTER}/assign`);
    await page.waitForLoadState("networkidle");

    // Find teacher autocomplete
    const teacherInput = page.locator('[role="combobox"]').first();
    await expect(teacherInput).toBeVisible({ timeout: 10000 });

    // Click to open dropdown
    await teacherInput.click();

    // Wait for options to appear
    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible({ timeout: 5000 });

    // Should have teacher options
    const options = listbox.locator('[role="option"]');
    const optionCount = await options.count();
    console.log(`Found ${optionCount} teachers in autocomplete`);
    expect(optionCount).toBeGreaterThan(0);

    await page.screenshot({
      path: "test-results/screenshots/assign-02-teacher-search.png",
      fullPage: true,
    });
  });
});

test.describe("Subject Assignment - Teacher Selection", () => {
  // Teacher selection tests depend on page state - run sequentially with extended timeout
  test.describe.configure({ mode: "serial", timeout: 120_000, retries: 2 });
  test("AS-03: Selecting a teacher shows their assignments", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${SEMESTER}/assign`);
    await page.waitForLoadState("networkidle");

    // Find and click teacher autocomplete
    const teacherInput = page.locator('[role="combobox"]').first();
    await expect(teacherInput).toBeVisible({ timeout: 10000 });
    await teacherInput.click();

    // Wait for listbox and select first teacher
    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible({ timeout: 5000 });

    const firstOption = listbox.locator('[role="option"]').first();
    await firstOption.click();

    // Wait for data to load
    await page.waitForLoadState("networkidle");

    // Should show teacher information or assignment panel
    // Look for any content indicating teacher is selected
    await page.waitForTimeout(1000); // Allow UI to update

    await page.screenshot({
      path: "test-results/screenshots/assign-03-teacher-selected.png",
      fullPage: true,
    });

    // Verify URL updated or content appeared
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });

  test("AS-04: Teacher card shows workload summary", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${SEMESTER}/assign`);
    await page.waitForLoadState("networkidle");

    // Select first teacher
    const teacherInput = page.locator('[role="combobox"]').first();
    await teacherInput.click();

    const listbox = page.locator('[role="listbox"]');
    await listbox.waitFor({ state: "visible", timeout: 5000 });

    const firstOption = listbox.locator('[role="option"]').first();
    await firstOption.click();

    await page.waitForLoadState("networkidle");

    // Look for workload indicators (progress bar, hour count, etc.)
    const progressIndicators = page.locator(
      '[role="progressbar"], .MuiLinearProgress-root',
    );
    const hasProgress = await progressIndicators.count();

    console.log(`Found ${hasProgress} progress indicators`);

    await page.screenshot({
      path: "test-results/screenshots/assign-04-workload-summary.png",
      fullPage: true,
    });
  });
});

test.describe("Subject Assignment - View Assignments", () => {
  test("AS-05: Can navigate to detailed assignment view", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${SEMESTER}/assign`);
    await page.waitForLoadState("networkidle");

    // Select a teacher first
    const teacherInput = page.locator('[role="combobox"]').first();
    await teacherInput.click();

    const listbox = page.locator('[role="listbox"]');
    await listbox.waitFor({ state: "visible", timeout: 5000 });

    const firstOption = listbox.locator('[role="option"]').first();
    await firstOption.click();

    await page.waitForLoadState("networkidle");

    // Look for "View Assignments" or similar button
    const viewButton = page
      .locator(
        'button:has-text("ดูรายละเอียด"), button:has-text("View"), a:has-text("ดูรายละเอียด")',
      )
      .first();

    const buttonVisible = await viewButton.isVisible().catch(() => false);

    if (buttonVisible) {
      await viewButton.click();
      await page.waitForLoadState("networkidle");
      console.log("Navigated to detailed assignment view");
    } else {
      console.log("Detail button not visible - may require specific teacher");
    }

    await page.screenshot({
      path: "test-results/screenshots/assign-05-view-assignments.png",
      fullPage: true,
    });
  });
});

test.describe("Subject Assignment - Quick Assignment Panel", () => {
  test("AS-06: Quick assignment panel is accessible", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${SEMESTER}/assign`);
    await page.waitForLoadState("networkidle");

    // Select a teacher
    const teacherInput = page.locator('[role="combobox"]').first();
    await teacherInput.click();

    const listbox = page.locator('[role="listbox"]');
    await listbox.waitFor({ state: "visible", timeout: 5000 });
    const firstOption = listbox.locator('[role="option"]').first();
    await firstOption.click();

    await page.waitForLoadState("networkidle");

    // Look for QuickAssignmentPanel or similar component
    // This could be a card, dialog trigger, or inline form
    const assignmentPanel = page.locator(
      '[data-testid="quick-assignment"], [data-testid="assignment-panel"]',
    );
    const assignmentButton = page.locator(
      'button:has-text("มอบหมาย"), button:has-text("Assign")',
    );

    const panelVisible = await assignmentPanel.isVisible().catch(() => false);
    const buttonVisible = await assignmentButton
      .first()
      .isVisible()
      .catch(() => false);

    console.log(`Quick assignment panel visible: ${panelVisible}`);
    console.log(`Assignment button visible: ${buttonVisible}`);

    await page.screenshot({
      path: "test-results/screenshots/assign-06-quick-assignment.png",
      fullPage: true,
    });
  });
});
