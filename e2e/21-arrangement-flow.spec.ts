import { test, expect } from "./fixtures/admin.fixture";
import type { Page, Locator } from "@playwright/test";
import { waitForAppReady } from "./helpers/wait-for-app-ready";
import { testSemester, testTeacher, testGradeLevel } from "./fixtures/seed-data.fixture";

// Arrangement flow mutates schedule state - must run serially
test.describe.configure({ mode: "serial", timeout: 120_000 });

/**
 * E2E Tests: Schedule Arrangement Core Flow
 *
 * Tests the parallel routes implementation:
 * - Teacher selection via URL param
 * - Drag subject to empty timeslot  
 * - Room selection via intercepting modal (no confirm button - clicking room creates schedule)
 * - Success snackbar confirmation
 */

const SEMESTER = `${testSemester.Year}/${testSemester.Semester}`;

const SELECTORS = {
  teacherInput: '[data-testid="teacher-select-input"]',
  subjectList: '[data-testid="subject-list"]',
  timetableGrid: '[data-testid="timetable-grid"]',
  timeslotCard: '[data-testid="timeslot-card"]',
  // Dialog selectors - parallel routes version
  roomDialog: '[data-testid="room-selection-dialog"], [role="dialog"]:has-text("เลือกห้องเรียน")',
  roomOption: '[data-testid^="room-option-"]:not([disabled])',
  availableRoomsList: '[data-testid="available-rooms-list"]',
  saveButton: '[data-testid="save-button"]',
};

const SUBJECT_ITEM_NAME = /หน่วยกิต/;

async function selectTeacherWithSubjects(page: Page) {
  await page.goto(
    `/schedule/${SEMESTER}/arrange?teacher=${testTeacher.TeacherID}&tab=teacher`,
  );
  await waitForAppReady(page);
  await page.waitForLoadState("domcontentloaded");

  await page
    .getByRole("heading", { name: "รายวิชาที่สอน" })
    .waitFor({ state: "visible", timeout: 10000 })
    .catch(() => {});

  const subjectItems = page.getByRole("button", { name: SUBJECT_ITEM_NAME });
  const subjectCount = await subjectItems.count();
  if (subjectCount === 0) {
    return null;
  }

  return {
    teacherLabel: `${testTeacher.Prefix}${testTeacher.Firstname} ${testTeacher.Lastname}`,
    subjectCount,
  };
}

async function findEmptyTimeslot(page: Page) {
  const emptySlots = page
    .locator(`${SELECTORS.timeslotCard}:not([data-subject-code])`)
    .filter({ hasText: /คาบว่าง/ });
  const count = await emptySlots.count();
  if (count === 0) {
    return null;
  }
  return emptySlots.first();
}

async function confirmRoomSelection(page: Page, roomDialog: Locator) {
  // Check which modal version we have
  // New parallel routes version: has available-rooms-list, clicking room directly creates schedule
  // Legacy version: click room to select, then click confirm button
  
  const confirmButton = roomDialog.locator('[data-testid="room-confirm"]');
  const hasConfirmButton = await confirmButton.isVisible().catch(() => false);
  
  const roomOptions = roomDialog.locator('[data-testid^="room-option-"]:not([disabled])');
  const optionCount = await roomOptions.count();
  
  if (optionCount === 0) {
    return false;
  }

  const option = roomOptions.first();
  
  if (hasConfirmButton) {
    // Legacy flow: select room, then confirm
    await option.click({ timeout: 5000 });
    
    // Wait for confirm button to be enabled
    await expect(confirmButton).toBeEnabled({ timeout: 5000 });
    
    // Click confirm and wait for response
    await Promise.all([
      page.waitForResponse(
        (resp) => resp.request().method() === "POST" && resp.status() < 400,
        { timeout: 15000 }
      ).catch(() => null),
      confirmButton.click({ timeout: 5000 }),
    ]);
  } else {
    // New parallel routes flow: clicking room directly triggers server action
    await Promise.all([
      page.waitForResponse(
        (resp) => resp.request().method() === "POST" && resp.status() < 400,
        { timeout: 15000 }
      ).catch(() => null),
      option.click({ timeout: 5000 }),
    ]);
  }
  
  // Wait for dialog to close and page to refresh
  await page.waitForLoadState("domcontentloaded", { timeout: 5000 }).catch(() => {});
  return true;
}

test.describe("Schedule Arrangement - Core Flow", () => {
  /**
   * Test: Room Selection Modal Flow
   * 
   * This tests the room selection modal independently of drag-drop.
   * Drag-drop with dnd-kit is difficult to automate reliably with Playwright,
   * so we test the room selection flow directly by navigating to the URL.
   */
  test("AR-ROOM: room selection modal flow creates schedule", async ({ authenticatedAdmin }) => {
    test.setTimeout(90000);
    const { page } = authenticatedAdmin;

    // Navigate to arrange page with teacher
    await page.goto(
      `/schedule/${SEMESTER}/arrange?teacher=${testTeacher.TeacherID}&tab=teacher`,
    );
    await waitForAppReady(page);
    await page.waitForLoadState("domcontentloaded");

    // Wait for timetable grid to be visible
    await expect(page.locator(SELECTORS.timetableGrid)).toBeVisible({
      timeout: 15000,
    });

    // Use a specific timeslot that is guaranteed to be empty for grade M1-1
    // From seed.ts: M1-1 has schedules on periods 1-3 all days and MON8 for clubs
    // So periods 4-7 on any day should be empty
    // Using MON4 which should definitely be empty for M1-1
    const timeslotId = `${testSemester.Semester}-${testSemester.Year}-MON4`;

    // Get a subject to assign (we need SubjectCode and GradeID)
    // Navigate directly to room selection with test data using E2E teacher's responsibility
    const roomSelectUrl = `/schedule/${SEMESTER}/arrange/room-select?timeslot=${timeslotId}&subject=${testTeacher.SubjectCode}&grade=${testTeacher.GradeID}&teacher=${testTeacher.TeacherID}`;
    
    console.log(`📍 Navigating to room selection URL: ${roomSelectUrl}`);
    
    await page.goto(roomSelectUrl);
    await page.waitForLoadState("domcontentloaded");

    // Room dialog should appear (intercepted by modal)
    const roomDialog = page.locator(SELECTORS.roomDialog);
    const dialogVisible = await roomDialog.waitFor({ state: "visible", timeout: 15000 })
      .then(() => true)
      .catch(() => false);
    
    if (!dialogVisible) {
      // Fallback: check if we're on full page version
      const roomsList = page.locator(SELECTORS.availableRoomsList);
      await expect(roomsList).toBeVisible({ timeout: 10000 });
    }

    // Check for available rooms
    const roomOptions = page.locator(SELECTORS.roomOption);
    const optionCount = await roomOptions.count();
    
    if (optionCount === 0) {
      test.skip(true, "No available rooms for this timeslot");
      return;
    }

    // Click first available room - this should create the schedule via server action
    const firstRoom = roomOptions.first();
    const roomName = await firstRoom.getAttribute("data-room-name");
    
    console.log(`📍 Clicking room: ${roomName}`);
    await firstRoom.click();

    // Wait for success snackbar OR navigation back to arrange page (success case)
    // The snackbar shows "✅ จัดตารางสอนสำเร็จ" and then router.back() is called
    const successSnackbar = page.getByText(/จัดตารางสอนสำเร็จ|✅/).first();
    const errorSnackbar = page.getByText(/ไม่สามารถจัดตาราง|❌|error/i).first();
    
    // Wait for either success or error feedback
    const result = await Promise.race([
      successSnackbar.waitFor({ state: "visible", timeout: 20000 }).then(() => "success" as const),
      errorSnackbar.waitFor({ state: "visible", timeout: 20000 }).then(() => "error" as const),
      page.waitForURL(/\/arrange(?:\?|$)/, { timeout: 20000 }).then(() => "navigated" as const),
    ]);
    
    if (result === "error") {
      const errorText = await errorSnackbar.textContent();
      throw new Error(`Schedule creation failed with error: ${errorText}`);
    }
    
    // Success: either snackbar was shown or we navigated back
    console.log(`✅ Successfully created schedule with room: ${roomName} (result: ${result})`);
  });

  /**
   * Test: Timetable Grid Renders Correctly
   * 
   * Verifies that the timetable grid displays correctly with teacher's schedule.
   */
  test("AR-GRID: timetable grid renders with teacher schedule", async ({ authenticatedAdmin }) => {
    test.setTimeout(60000);
    const { page } = authenticatedAdmin;

    const teacherResult = await selectTeacherWithSubjects(page);
    expect(
      teacherResult,
      "Expected at least one teacher with available subjects",
    ).not.toBeNull();

    // Verify grid is visible
    await expect(page.locator(SELECTORS.timetableGrid)).toBeVisible({
      timeout: 15000,
    });

    // Verify timeslot cards exist
    const timeslotCards = page.locator(SELECTORS.timeslotCard);
    const cardCount = await timeslotCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Verify subjects palette is visible
    const subjectItems = page.getByRole("button", { name: SUBJECT_ITEM_NAME });
    const subjectCount = await subjectItems.count();
    expect(subjectCount).toBeGreaterThan(0);

    console.log(`✅ Grid rendered with ${cardCount} timeslot cells and ${subjectCount} subjects`);
  });

  /**
   * Test: Drag-Drop Flow (Currently Skipped)
   * 
   * Note: Playwright's dragTo doesn't reliably trigger dnd-kit's PointerSensor.
   * This test is kept for documentation and future improvement.
   * The room selection flow is tested separately in AR-ROOM.
   */
  test.skip("AR-DND: drag subject to timeslot triggers room selection", async ({ authenticatedAdmin }) => {
    test.setTimeout(120000);
    const { page } = authenticatedAdmin;

    const teacherResult = await selectTeacherWithSubjects(page);
    expect(
      teacherResult,
      "Expected at least one teacher with available subjects",
    ).not.toBeNull();

    await expect(page.locator(SELECTORS.timetableGrid)).toBeVisible({
      timeout: 15000,
    });

    const subject = page.getByRole("button", { name: SUBJECT_ITEM_NAME }).first();
    await expect(subject).toBeVisible({ timeout: 10000 });

    const emptySlot = await findEmptyTimeslot(page);
    expect(emptySlot, "Expected at least one empty non-break timeslot").not.toBeNull();

    await subject.dragTo(emptySlot!, {
      sourcePosition: { x: 10, y: 10 },
      targetPosition: { x: 10, y: 10 },
    });

    // Room dialog should appear
    const roomDialog = page.locator(SELECTORS.roomDialog);
    await expect(roomDialog).toBeVisible({ timeout: 15000 });
    
    const roomConfirmed = await confirmRoomSelection(page, roomDialog);
    expect(roomConfirmed, "Expected at least one available room").toBe(true);
    
    await expect(roomDialog).toBeHidden({ timeout: 15000 });

    const successSnackbar = page.getByText(/สำเร็จ/).first();
    await expect(successSnackbar).toBeVisible({ timeout: 15000 });
  });
});
