import { test, expect } from "./fixtures/admin.fixture";
import type { Page, Locator } from "@playwright/test";
import { waitForAppReady } from "./helpers/wait-for-app-ready";
import { testSemester, testTeacher } from "./fixtures/seed-data.fixture";

/**
 * E2E Tests: Schedule Arrangement Core Flow
 *
 * Focuses on critical workflow:
 * - Teacher selection
 * - Drag subject to empty timeslot
 * - Room selection modal
 * - Save schedule
 */

const SEMESTER = `${testSemester.Year}/${testSemester.Semester}`;

const SELECTORS = {
  teacherInput: '[data-testid="teacher-select-input"]',
  subjectList: '[data-testid="subject-list"]',
  timetableGrid: '[data-testid="timetable-grid"]',
  timeslotCard: '[data-testid="timeslot-card"]',
  roomDialog: '[data-testid="room-selection-dialog"]',
  roomOption: '[data-testid^="room-option-"]',
  roomConfirm: '[data-testid="room-confirm"]',
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
  const roomOptions = page.locator(SELECTORS.roomOption);
  const optionCount = await roomOptions.count();

  for (let index = 0; index < optionCount; index += 1) {
    const option = roomOptions.nth(index);
    const isDisabled = await option.isDisabled().catch(() => false);
    if (isDisabled) continue;

    await option.click();
    await page.locator(SELECTORS.roomConfirm).click();
    await page.waitForTimeout(500);

    const closed = await roomDialog.isHidden().catch(() => false);
    if (closed) {
      return true;
    }
  }

  return false;
}

test.describe("Schedule Arrangement - Core Flow", () => {
  test("AR-CORE: drag subject, choose room, save", async ({ authenticatedAdmin }) => {
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

    const roomDialog = page.locator(SELECTORS.roomDialog);
    await expect(roomDialog).toBeVisible({ timeout: 15000 });

    const roomConfirmed = await confirmRoomSelection(page, roomDialog);
    expect(roomConfirmed, "Expected at least one available room").toBe(true);
    await expect(roomDialog).toBeHidden({ timeout: 15000 });

    const saveButton = page.locator(SELECTORS.saveButton);
    await expect(saveButton).toBeEnabled({ timeout: 15000 });
    await saveButton.click();

    await expect(
      page.getByText(/บันทึกตารางสอนสำเร็จ/),
    ).toBeVisible({ timeout: 15000 });
  });
});
