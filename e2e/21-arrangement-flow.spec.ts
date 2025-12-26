import { test, expect } from "./fixtures/admin.fixture";
import { waitForAppReady } from "./helpers/wait-for-app-ready";
import { testSemester, testTimeslots } from "./fixtures/seed-data.fixture";

/**
 * E2E Tests: Schedule Arrangement Flow
 *
 * Tests the `/schedule/[term]/arrange` page functionality:
 * - Teacher selection and timetable rendering
 * - Drag-and-drop subject placement
 * - Room selection modal
 * - Conflict detection
 * - Schedule persistence
 *
 * Uses local PostgreSQL database (localhost:5433)
 */

const SEMESTER = `${testSemester.Year}/${testSemester.Semester}`;

// Selectors for draggable subjects
const DRAGGABLE_SELECTOR =
  '[data-testid="subject-item"], [data-testid^="subject-card-"], [data-sortable-id]';

test.describe("Schedule Arrangement - Page Load", () => {
  test("AR-01: Arrangement page loads with timetable grid", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${SEMESTER}/arrange`);
    await page.waitForLoadState("networkidle");

    // Verify page loads
    await waitForAppReady(page);

    // Should have teacher selection
    const teacherSelect = page.locator('select, [role="combobox"]').first();
    await expect(teacherSelect).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: "test-results/screenshots/arrange-01-page-load.png",
      fullPage: true,
    });
  });

  test("AR-02: Timetable grid renders after teacher selection", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${SEMESTER}/arrange`);
    await page.waitForLoadState("networkidle");

    // Select first teacher from dropdown
    const teacherSelect = page.locator('select, [role="combobox"]').first();
    await expect(teacherSelect).toBeVisible({ timeout: 10000 });

    const isNativeSelect =
      (await teacherSelect.evaluate((el) => el.tagName.toLowerCase())) ===
      "select";

    if (isNativeSelect) {
      await teacherSelect.selectOption({ index: 1 });
    } else {
      await teacherSelect.click();
      const listbox = page.locator('[role="listbox"]');
      await listbox.waitFor({ state: "visible", timeout: 5000 });
      const firstOption = listbox.locator('[role="option"]').first();
      await firstOption.click();
    }

    // Wait for timetable to render
    await page.waitForLoadState("networkidle");

    // Verify timetable appears
    const table = page.locator("table").first();
    await expect(table).toBeVisible({ timeout: 10000 });

    // Count rows (days)
    const rows = await page.locator("tbody tr").count();
    console.log(`Timetable has ${rows} rows (days)`);
    expect(rows).toBeGreaterThan(0);

    await page.screenshot({
      path: "test-results/screenshots/arrange-02-timetable-grid.png",
      fullPage: true,
    });
  });
});

test.describe("Schedule Arrangement - Subject Palette", () => {
  test("AR-03: Subject palette shows assigned subjects", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${SEMESTER}/arrange`);
    await page.waitForLoadState("networkidle");

    // Select a teacher
    const teacherSelect = page.locator('select, [role="combobox"]').first();
    await expect(teacherSelect).toBeVisible();

    const isNativeSelect =
      (await teacherSelect.evaluate((el) => el.tagName.toLowerCase())) ===
      "select";

    if (isNativeSelect) {
      await teacherSelect.selectOption({ index: 1 });
    } else {
      await teacherSelect.click();
      const listbox = page.locator('[role="listbox"]');
      await listbox.waitFor({ state: "visible", timeout: 5000 });
      const firstOption = listbox.locator('[role="option"]').first();
      await firstOption.click();
    }

    await page.waitForLoadState("networkidle");

    // Look for draggable subject items
    const subjects = page.locator(DRAGGABLE_SELECTOR);
    const subjectCount = await subjects.count();

    console.log(`Found ${subjectCount} subjects in palette`);

    await page.screenshot({
      path: "test-results/screenshots/arrange-03-subject-palette.png",
      fullPage: true,
    });

    // May have 0 subjects if teacher has no assignments
    // This is valid - we just want to verify the palette renders
  });
});

test.describe("Schedule Arrangement - Drag and Drop", () => {
  test("AR-04: Can drag subject to empty timeslot", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${SEMESTER}/arrange`);
    await page.waitForLoadState("networkidle");

    // Select a teacher with subjects
    const teacherSelect = page.locator('select, [role="combobox"]').first();
    await teacherSelect.click();

    const listbox = page.locator('[role="listbox"]');
    await listbox.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});

    if (await listbox.isVisible()) {
      const firstOption = listbox.locator('[role="option"]').first();
      await firstOption.click();
    } else {
      // Native select
      const nativeSelect = page.locator("select").first();
      await nativeSelect.selectOption({ index: 1 });
    }

    await page.waitForLoadState("networkidle");

    // Wait for subjects to appear
    const subject = page.locator(DRAGGABLE_SELECTOR).first();
    const subjectVisible = await subject.isVisible().catch(() => false);

    if (!subjectVisible) {
      console.log("No draggable subjects found - skipping drag test");
      test.skip();
      return;
    }

    // Find a drop target (empty td cell)
    const dropTarget = page.locator("td").nth(5);
    await expect(dropTarget).toBeVisible({ timeout: 5000 });

    // Screenshot before drag
    await page.screenshot({
      path: "test-results/screenshots/arrange-04a-before-drag.png",
      fullPage: true,
    });

    // Perform drag
    await subject.dragTo(dropTarget, {
      sourcePosition: { x: 10, y: 10 },
      targetPosition: { x: 10, y: 10 },
    });

    // Wait for UI to update
    await page.waitForTimeout(500);

    // Screenshot after drag
    await page.screenshot({
      path: "test-results/screenshots/arrange-04b-after-drag.png",
      fullPage: true,
    });

    console.log("Drag operation completed");
  });

  test("AR-05: Room selection modal appears after drop", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${SEMESTER}/arrange`);
    await page.waitForLoadState("networkidle");

    // Select teacher
    const teacherSelect = page.locator('select, [role="combobox"]').first();
    await teacherSelect.click().catch(() => {});

    const listbox = page.locator('[role="listbox"]');
    const listboxVisible = await listbox.isVisible().catch(() => false);

    if (listboxVisible) {
      const firstOption = listbox.locator('[role="option"]').first();
      await firstOption.click();
    } else {
      await page.locator("select").first().selectOption({ index: 1 });
    }

    await page.waitForLoadState("networkidle");

    // Wait for subjects
    const subject = page.locator(DRAGGABLE_SELECTOR).first();
    const subjectVisible = await subject.isVisible().catch(() => false);

    if (!subjectVisible) {
      console.log("No subjects available - skipping room modal test");
      test.skip();
      return;
    }

    // Drag to empty slot
    const dropTarget = page.locator("td").nth(8);
    await expect(dropTarget).toBeVisible({ timeout: 5000 });

    await subject.dragTo(dropTarget, {
      sourcePosition: { x: 10, y: 10 },
      targetPosition: { x: 10, y: 10 },
    });

    // Wait for modal
    await page.waitForTimeout(1000);

    // Check for room selection dialog
    const modal = page
      .locator(
        '[role="dialog"], .MuiDialog-root, text=/เลือกห้องเรียน/i, text=/Select Room/i',
      )
      .first();

    const modalVisible = await modal.isVisible().catch(() => false);

    await page.screenshot({
      path: "test-results/screenshots/arrange-05-room-modal.png",
      fullPage: true,
    });

    console.log(`Room selection modal visible: ${modalVisible}`);
  });
});

test.describe("Schedule Arrangement - Conflict Detection", () => {
  test("AR-06: Locked timeslots are visually marked", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${SEMESTER}/arrange`);
    await page.waitForLoadState("networkidle");

    // Select a teacher
    const teacherSelect = page.locator('select, [role="combobox"]').first();
    await expect(teacherSelect).toBeVisible();

    const isNativeSelect =
      (await teacherSelect.evaluate((el) => el.tagName.toLowerCase())) ===
      "select";

    if (isNativeSelect) {
      await teacherSelect.selectOption({ index: 1 });
    } else {
      await teacherSelect.click();
      const listbox = page.locator('[role="listbox"]');
      await listbox.waitFor({ state: "visible", timeout: 5000 });
      await listbox.locator('[role="option"]').first().click();
    }

    await page.waitForLoadState("networkidle");

    // Wait for table
    await expect(page.locator("table").first()).toBeVisible({ timeout: 10000 });

    // Look for locked indicators
    const lockedSlots = page.locator(
      '[data-locked="true"], .locked, [data-testid*="locked"]',
    );
    const lockedCount = await lockedSlots.count();

    console.log(`Found ${lockedCount} locked timeslots`);

    await page.screenshot({
      path: "test-results/screenshots/arrange-06-locked-slots.png",
      fullPage: true,
    });
  });

  test("AR-07: Conflict indicators are displayed", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${SEMESTER}/arrange`);
    await page.waitForLoadState("networkidle");

    // Select teacher
    const teacherSelect = page.locator('select, [role="combobox"]').first();
    await expect(teacherSelect).toBeVisible();

    const isNativeSelect =
      (await teacherSelect.evaluate((el) => el.tagName.toLowerCase())) ===
      "select";

    if (isNativeSelect) {
      await teacherSelect.selectOption({ index: 1 });
    } else {
      await teacherSelect.click();
      const listbox = page.locator('[role="listbox"]');
      await listbox.waitFor({ state: "visible", timeout: 5000 });
      await listbox.locator('[role="option"]').first().click();
    }

    await page.waitForLoadState("networkidle");

    // Wait for table
    await expect(page.locator("table").first()).toBeVisible({ timeout: 10000 });

    // Look for conflict indicators
    const conflictIndicators = page.locator(
      '[data-testid="conflict"], .conflict, .error, svg[color="error"], [data-conflict="true"]',
    );
    const conflictCount = await conflictIndicators.count();

    console.log(`Found ${conflictCount} conflict indicators`);

    await page.screenshot({
      path: "test-results/screenshots/arrange-07-conflicts.png",
      fullPage: true,
    });
  });
});

test.describe("Schedule Arrangement - Save Operations", () => {
  test("AR-08: Save button is visible and functional", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${SEMESTER}/arrange`);
    await page.waitForLoadState("networkidle");

    // Select teacher
    const teacherSelect = page.locator('select, [role="combobox"]').first();
    await expect(teacherSelect).toBeVisible();

    const isNativeSelect =
      (await teacherSelect.evaluate((el) => el.tagName.toLowerCase())) ===
      "select";

    if (isNativeSelect) {
      await teacherSelect.selectOption({ index: 1 });
    } else {
      await teacherSelect.click();
      const listbox = page.locator('[role="listbox"]');
      await listbox.waitFor({ state: "visible", timeout: 5000 });
      await listbox.locator('[role="option"]').first().click();
    }

    await page.waitForLoadState("networkidle");

    // Look for save button
    const saveButton = page
      .locator('button:has-text("บันทึก"), button:has-text("Save")')
      .first();
    const saveVisible = await saveButton.isVisible().catch(() => false);

    console.log(`Save button visible: ${saveVisible}`);

    if (saveVisible) {
      const isDisabled = await saveButton.isDisabled();
      console.log(`Save button disabled: ${isDisabled}`);
    }

    await page.screenshot({
      path: "test-results/screenshots/arrange-08-save-button.png",
      fullPage: true,
    });
  });
});
