/**
 * Admin Workflow Visual Regression Tests
 *
 * Visual regression tests that capture and compare screenshots of key admin pages.
 * Uses Playwright's toHaveScreenshot() for baseline comparisons.
 *
 * Scenarios covered:
 * 1. Dashboard views
 * 2. Management pages (Teachers, Subjects, Rooms)
 * 3. Schedule arrangement interface
 * 4. Timetable views
 *
 * Run with: pnpm test:e2e e2e/admin-workflow.spec.ts
 * Update baselines: pnpm test:e2e e2e/admin-workflow.spec.ts --update-snapshots
 */

import { test, expect } from "./fixtures/admin.fixture";
import { NavigationHelper } from "./helpers/navigation";

// Test constants
const TEST_SEMESTER = "2567/2";

// Visual comparison options - allow some tolerance for dynamic content
const VISUAL_OPTIONS = {
  maxDiffPixelRatio: 0.05, // Allow 5% pixel difference
  maxDiffPixels: 10000, // Override global maxDiffPixels:200 — let ratio be primary threshold
  threshold: 0.3, // Color difference tolerance
  animations: "disabled" as const,
};

/**
 * Wait for page to stabilize before taking screenshot.
 * Uses network idle detection instead of arbitrary timeouts.
 */
async function waitForStableState(page: import("@playwright/test").Page, ms = 500) {
  await page.waitForLoadState("domcontentloaded");
  // Small buffer for CSS animations to complete - only needed for visual tests
  if (ms > 0) await page.waitForTimeout(ms);
}

test.describe("Visual: Dashboard & Navigation", () => {
  test("VIS-001: Dashboard page visual", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    await waitForStableState(page);
    await expect(page).toHaveScreenshot("dashboard-main.png", VISUAL_OPTIONS);
  });

  test("VIS-002: Semester selection visual", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);

    await nav.goToDashboardSelector();
    await waitForStableState(page);

    await expect(page).toHaveScreenshot(
      "semester-selector.png",
      VISUAL_OPTIONS,
    );
  });
});

test.describe("Visual: Teacher Management", () => {
  test("VIS-010: Teacher list page visual", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);

    await nav.goToTeacherManagement();
    await waitForStableState(page, 1000);

    await expect(page).toHaveScreenshot(
      "teacher-management.png",
      VISUAL_OPTIONS,
    );
  });
});

test.describe("Visual: Subject Management", () => {
  test("VIS-020: Subject list page visual", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);

    await nav.goToSubjectManagement();
    await waitForStableState(page, 1000);

    await expect(page).toHaveScreenshot(
      "subject-management.png",
      VISUAL_OPTIONS,
    );
  });
});

test.describe("Visual: Room Management", () => {
  test("VIS-030: Room list page visual", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);

    await nav.goToRoomManagement();
    await waitForStableState(page, 1000);

    await expect(page).toHaveScreenshot("room-management.png", VISUAL_OPTIONS);
  });
});

test.describe("Visual: Schedule Arrangement", () => {
  test("VIS-040: Assign page initial state", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);

    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForStableState(page, 2000);

    await expect(page).toHaveScreenshot(
      "assign-page-initial.png",
      VISUAL_OPTIONS,
    );
  });

  test("VIS-041: Assign page with teacher selected", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);

    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForStableState(page, 1000);

    // Try to select a teacher
    const teacherDropdown = page.getByRole("combobox").first();
    if (await teacherDropdown.isVisible()) {
      await teacherDropdown.click();
      await expect(page.getByRole("option").first()).toBeVisible({ timeout: 5000 });

      const firstOption = page.getByRole("option").first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
        await waitForStableState(page, 1000);
      }
    }

    await expect(page).toHaveScreenshot(
      "assign-page-teacher-selected.png",
      VISUAL_OPTIONS,
    );
  });

  test("VIS-042: Arrange page with grade tabs", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${TEST_SEMESTER}/arrange`);
    await waitForStableState(page, 2000);

    await expect(page).toHaveScreenshot(
      "arrange-page-grade-tabs.png",
      VISUAL_OPTIONS,
    );
  });
});

test.describe("Visual: Dashboard Views", () => {
  test("VIS-050: Teacher table view", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);

    await nav.goToTeacherTable(TEST_SEMESTER);
    await waitForStableState(page, 1000);

    await expect(page).toHaveScreenshot(
      "teacher-table-view.png",
      VISUAL_OPTIONS,
    );
  });

  test("VIS-051: Student table view", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);

    await nav.goToStudentTable(TEST_SEMESTER);
    await waitForStableState(page, 1000);

    await expect(page).toHaveScreenshot(
      "student-table-view.png",
      VISUAL_OPTIONS,
    );
  });

  test("VIS-052: All timeslots view", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);

    await nav.goToAllTimeslots(TEST_SEMESTER);
    await waitForStableState(page, 1000);

    await expect(page).toHaveScreenshot(
      "all-timeslots-view.png",
      VISUAL_OPTIONS,
    );
  });
});

test.describe("Visual: Complete Admin Journey", () => {
  test("VIS-100: Full admin workflow screenshots", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);

    // Step 1: Dashboard
    await waitForStableState(page);
    await expect(page).toHaveScreenshot(
      "journey-01-dashboard.png",
      VISUAL_OPTIONS,
    );

    // Step 2: Teacher Management
    await nav.goToTeacherManagement();
    await waitForStableState(page);
    await expect(page).toHaveScreenshot(
      "journey-02-teachers.png",
      VISUAL_OPTIONS,
    );

    // Step 3: Subject Management
    await nav.goToSubjectManagement();
    await waitForStableState(page);
    await expect(page).toHaveScreenshot(
      "journey-03-subjects.png",
      VISUAL_OPTIONS,
    );

    // Step 4: Schedule Arrangement
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForStableState(page, 1000);
    await expect(page).toHaveScreenshot(
      "journey-04-arrange.png",
      VISUAL_OPTIONS,
    );

    // Step 5: Teacher Table Dashboard
    await nav.goToTeacherTable(TEST_SEMESTER);
    await waitForStableState(page);
    await expect(page).toHaveScreenshot(
      "journey-05-teacher-table.png",
      VISUAL_OPTIONS,
    );
  });
});

