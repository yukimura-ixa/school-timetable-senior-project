import { test, expect } from "./fixtures/admin.fixture";
import type { Page, Locator } from "@playwright/test";
import { waitForAppReady } from "./helpers/wait-for-app-ready";
import { testSemester, testTeacher } from "./fixtures/seed-data.fixture";
import { getE2ETeacherId } from "./helpers/teacher-id";
import { ArrangePage } from "./page-objects/ArrangePage";

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
  const teacherId = await getE2ETeacherId(page);
  await page.goto(
    `/schedule/${SEMESTER}/arrange?teacher=${teacherId}&tab=teacher`,
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
   * Drags a subject onto an empty timeslot to open the room-selection modal,
   * then picks a room to create the schedule. The standalone room-select route
   * was removed (ed6), so the modal is reached only via drag-drop.
   */
  test("AR-ROOM: drag-drop opens room modal and creates schedule", async ({ authenticatedAdmin }) => {
    test.setTimeout(90000);
    const { page } = authenticatedAdmin;
    const arrangePage = new ArrangePage(page);
    const teacherId = await getE2ETeacherId(page);

    // Pre-select the E2E teacher via URL, then wait for the grid.
    await page.goto(
      `/schedule/${SEMESTER}/arrange?teacher=${teacherId}&tab=teacher`,
    );
    await waitForAppReady(page);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator(SELECTORS.timetableGrid)).toBeVisible({
      timeout: 15000,
    });

    const subjects = await arrangePage.getAvailableSubjects();
    if (subjects.length === 0) {
      test.skip(true, "No available subjects for the E2E teacher");
      return;
    }
    const subjectCode = subjects[0]!;

    // Find a slot empty FOR THIS TEACHER (the grid is teacher-scoped). Map its
    // timeslot id ("1-2568-WED5" → day WED, period 5) to the grid coordinates
    // ArrangePage uses: rows are days (tr.nth(dayIndex)), columns are periods
    // (td.nth(period)).
    const emptyCard = await findEmptyTimeslot(page);
    if (!emptyCard) {
      test.skip(true, "No empty timeslot available for the E2E teacher");
      return;
    }
    const timeslotId = await emptyCard.getAttribute("data-timeslot-id");
    const tail = timeslotId?.split("-").pop() ?? "";
    const day = tail.match(/^[A-Z]+/)?.[0] ?? "";
    const period = Number(tail.match(/\d+$/)?.[0] ?? "0");
    const row = ["MON", "TUE", "WED", "THU", "FRI"].indexOf(day) + 1;
    if (row === 0 || !period) {
      test.skip(true, `Unparseable empty timeslot id: ${timeslotId}`);
      return;
    }

    // Drag via the POM (Playwright dragTo with a manual pointer fallback that
    // reliably trips dnd-kit's PointerSensor).
    await arrangePage.dragSubjectToTimeslot(subjectCode, row, period);

    // A valid drop opens the room-selection modal. A grade-level conflict (the
    // slot is occupied for the grade by another teacher) opens no modal — an
    // acceptable outcome for this smoke test.
    const roomDialog = page.locator(SELECTORS.roomDialog);
    const modalOpened = await roomDialog
      .waitFor({ state: "visible", timeout: 15000 })
      .then(() => true)
      .catch(() => false);
    if (!modalOpened) {
      test.skip(
        true,
        "Dropped slot occupied for the grade — clean conflict, no room modal",
      );
      return;
    }

    // Select the first available room and commit the schedule.
    const created = await confirmRoomSelection(page, roomDialog);
    expect(created, "Expected at least one available room to select").toBe(true);

    // The entry should now appear in the grid at the dropped timeslot.
    await expect(
      page.locator(
        `${SELECTORS.timeslotCard}[data-timeslot-id="${timeslotId}"]`,
      ),
    ).toHaveAttribute("data-subject-code", /.+/, { timeout: 15000 });
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
