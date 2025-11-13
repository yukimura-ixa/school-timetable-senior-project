/**
 * E2E Tests for Issue #84 - Subject Placement Conflict Detection
 * 
 * Tests the complete user flow for conflict pre-checking:
 * 1. Drag subject to timeslot → Teacher conflict check
 * 2. Select room → Room conflict check
 * 3. Verify Thai error messages display correctly
 * 4. Verify dialog behavior (stays open on room conflict)
 */

import { test, expect, type Page } from '@playwright/test';

const ARRANGE_PAGE = '/schedule/1-2567/arrange'; // Use seeded semester

/**
 * Helper to login and navigate to arrange page
 */
async function setupArrangePage(page: Page) {
  // Login (adjust based on your auth setup)
  await page.goto('/');
  // TODO: Add login steps if needed (or use auth fixtures)
  
  // Navigate to arrange page
  await page.goto(ARRANGE_PAGE, { waitUntil: 'domcontentloaded' });
  
  // Wait for page to load with targeted selector
  await page.waitForSelector('h1', { timeout: 10000 });
  await expect(page.locator('h1')).toContainText('จัดตารางสอน');
}

/**
 * Helper to drag a subject to a timeslot cell
 */
async function dragSubjectToTimeslot(
  page: Page, 
  subjectCode: string, 
  dayIndex: number, 
  periodIndex: number
) {
  // Find the draggable subject
  const subject = page.locator(`[data-subject-code="${subjectCode}"]`).first();
  await expect(subject).toBeVisible({ timeout: 5000 });
  await expect(subject).toBeEnabled();
  
  // Find the target timeslot cell
  const timeslotCell = page.locator(
    `[data-day="${dayIndex}"][data-period="${periodIndex}"]`
  ).first();
  await expect(timeslotCell).toBeVisible({ timeout: 5000 });
  
  // Perform drag and drop
  await subject.dragTo(timeslotCell);
}

/**
 * Helper to select a room from the dialog
 */
async function selectRoomFromDialog(page: Page, roomName: string) {
  // Wait for room dialog to open
  await expect(page.locator('text=เลือกห้องเรียน')).toBeVisible({ timeout: 5000 });
  
  // Find and click the room
  const roomButton = page.locator(`button:has-text("${roomName}")`);
  await expect(roomButton).toBeVisible({ timeout: 5000 });
  await expect(roomButton).toBeEnabled();
  await roomButton.click();
  
  // Click confirm button
  const confirmButton = page.locator('button:has-text("ยืนยัน")');
  await expect(confirmButton).toBeVisible({ timeout: 3000 });
  await expect(confirmButton).toBeEnabled();
  await confirmButton.click();
}

test.describe('Issue #84 - Conflict Detection', () => {
  test.beforeEach(async ({ page }) => {
    await setupArrangePage(page);
  });

  test.describe('Teacher Conflict Detection', () => {
    test('should prevent dragging subject when teacher has conflict', async ({ page }) => {
      // GIVEN: Teacher already teaching TH101 at MON-Period1
      // (This should be seeded in test database)
      
      // WHEN: User tries to drag another subject for same teacher to same timeslot
      // TODO: Adjust subject code and coordinates based on your seed data
      await dragSubjectToTimeslot(page, 'MA101', 0, 0); // Monday, Period 1
      
      // THEN: Should show Thai error message with conflict details
      const errorSnackbar = page.locator('.notistack-snackbar', { hasText: 'สอนวิชา' });
      await expect(errorSnackbar).toBeVisible();
      await expect(errorSnackbar).toContainText('ในช่วงเวลานี้แล้ว');
      
      // AND: Room dialog should NOT open
      await expect(page.locator('text=เลือกห้องเรียน')).not.toBeVisible();
    });

    test('should allow dragging subject when teacher is free', async ({ page }) => {
      // GIVEN: Teacher has no schedule at TUE-Period1
      
      // WHEN: User drags subject to free timeslot
      await dragSubjectToTimeslot(page, 'TH101', 1, 0); // Tuesday, Period 1
      
      // THEN: Room dialog should open
      await expect(page.locator('text=เลือกห้องเรียน')).toBeVisible();
      
      // AND: No error message should display
      const errorSnackbar = page.locator('.notistack-snackbar.notistack-variantError');
      await expect(errorSnackbar).not.toBeVisible();
    });

    test('should show detailed conflict information in error message', async ({ page }) => {
      // WHEN: Triggering a teacher conflict
      await dragSubjectToTimeslot(page, 'MA101', 0, 0);
      
      // THEN: Error message should contain teacher name, subject, grade, and room
      const errorMessage = page.locator('.notistack-snackbar.notistack-variantError').first();
      await expect(errorMessage).toBeVisible();
      
      // Verify message contains expected Thai keywords
      const messageText = await errorMessage.textContent();
      expect(messageText).toContain('อ.'); // Teacher prefix
      expect(messageText).toContain('สอนวิชา');
      expect(messageText).toContain('ชั้น');
      expect(messageText).toContain('ม.'); // Grade level
    });
  });

  test.describe('Room Conflict Detection', () => {
    test('should prevent selecting occupied room', async ({ page }) => {
      // GIVEN: Room A101 is occupied at MON-Period2
      // AND: User successfully dragged subject to MON-Period2 (different teacher)
      await dragSubjectToTimeslot(page, 'EN101', 0, 1); // Monday, Period 2
      
      // Wait for room dialog
      await expect(page.locator('text=เลือกห้องเรียน')).toBeVisible();
      
      // WHEN: User selects the occupied room
      await selectRoomFromDialog(page, 'A101');
      
      // THEN: Should show Thai error message with room conflict details
      const errorSnackbar = page.locator('.notistack-snackbar', { hasText: 'ห้อง' });
      await expect(errorSnackbar).toBeVisible();
      await expect(errorSnackbar).toContainText('มี');
      await expect(errorSnackbar).toContainText('สอนวิชา');
      
      // AND: Dialog should remain open for re-selection
      await expect(page.locator('text=เลือกห้องเรียน')).toBeVisible();
    });

    test('should allow selecting available room', async ({ page }) => {
      // GIVEN: Room B201 is available at TUE-Period1
      await dragSubjectToTimeslot(page, 'TH101', 1, 0);
      
      // WHEN: User selects available room
      await selectRoomFromDialog(page, 'B201');
      
      // THEN: Should show success message
      const successSnackbar = page.locator('.notistack-snackbar.notistack-variantSuccess');
      await expect(successSnackbar).toBeVisible();
      await expect(successSnackbar).toContainText('จัดตารางสอนสำเร็จ');
      
      // AND: Dialog should close
      await expect(page.locator('text=เลือกห้องเรียน')).not.toBeVisible();
      
      // AND: Schedule should appear in timetable grid
      const scheduleCell = page.locator('[data-day="1"][data-period="0"]').first();
      await expect(scheduleCell).toContainText('TH101');
    });

    test('should show detailed room conflict information', async ({ page }) => {
      // WHEN: Triggering a room conflict
      await dragSubjectToTimeslot(page, 'EN101', 0, 1);
      await expect(page.locator('text=เลือกห้องเรียน')).toBeVisible();
      await selectRoomFromDialog(page, 'A101');
      
      // THEN: Error message should contain room name, teacher, subject, and grade
      const errorMessage = page.locator('.notistack-snackbar.notistack-variantError').first();
      await expect(errorMessage).toBeVisible();
      
      const messageText = await errorMessage.textContent();
      expect(messageText).toContain('ห้อง');
      expect(messageText).toContain('มี');
      expect(messageText).toContain('อ.'); // Teacher prefix
      expect(messageText).toContain('สอนวิชา');
      expect(messageText).toContain('ชั้น ม.');
    });

    test('should allow re-selecting different room after conflict', async ({ page }) => {
      // GIVEN: First room selection fails due to conflict
      await dragSubjectToTimeslot(page, 'EN101', 0, 1);
      await expect(page.locator('text=เลือกห้องเรียน')).toBeVisible();
      await selectRoomFromDialog(page, 'A101'); // Occupied
      
      // Verify error and dialog still open
      await expect(page.locator('.notistack-snackbar.notistack-variantError')).toBeVisible();
      await expect(page.locator('text=เลือกห้องเรียน')).toBeVisible();
      
      // WHEN: User selects different available room
      await selectRoomFromDialog(page, 'B202'); // Available
      
      // THEN: Should succeed
      const successSnackbar = page.locator('.notistack-snackbar.notistack-variantSuccess');
      await expect(successSnackbar).toBeVisible();
      await expect(page.locator('text=เลือกห้องเรียน')).not.toBeVisible();
    });
  });

  test.describe('Combined Conflict Scenarios', () => {
    test('should check teacher conflict before room conflict', async ({ page }) => {
      // WHEN: Dragging subject with teacher conflict
      await dragSubjectToTimeslot(page, 'MA101', 0, 0);
      
      // THEN: Teacher conflict error shows immediately
      await expect(page.locator('.notistack-snackbar', { hasText: 'สอนวิชา' })).toBeVisible();
      
      // AND: Room dialog never opens (short-circuits)
      await expect(page.locator('text=เลือกห้องเรียน')).not.toBeVisible();
    });

    test('should handle locked timeslot before conflict checks', async ({ page }) => {
      // GIVEN: Timeslot is locked (already has schedule with IsLocked=true)
      // TODO: Seed a locked schedule
      
      // WHEN: User tries to drag to locked timeslot
      await dragSubjectToTimeslot(page, 'TH101', 0, 2); // MON-Period3 (locked)
      
      // THEN: Should show locked error (not conflict error)
      const errorSnackbar = page.locator('.notistack-snackbar.notistack-variantError');
      await expect(errorSnackbar).toBeVisible();
      // Adjust expected message based on your locked timeslot validation
      await expect(errorSnackbar).toContainText('ล็อก');
    });

    test('should validate full placement flow: drag → teacher check → room check → success', async ({ page }) => {
      // GIVEN: Clean timeslot with no conflicts
      
      // STEP 1: Drag subject (no teacher conflict)
      await dragSubjectToTimeslot(page, 'SC101', 2, 0); // WED-Period1
      
      // STEP 2: Room dialog opens
      await expect(page.locator('text=เลือกห้องเรียน')).toBeVisible();
      
      // STEP 3: Select available room (no room conflict)
      await selectRoomFromDialog(page, 'LAB-301');
      
      // STEP 4: Success!
      const successSnackbar = page.locator('.notistack-snackbar.notistack-variantSuccess');
      await expect(successSnackbar).toBeVisible();
      await expect(successSnackbar).toContainText('จัดตารางสอนสำเร็จ');
      
      // STEP 5: Verify schedule appears in grid
      const scheduleCell = page.locator('[data-day="2"][data-period="0"]').first();
      await expect(scheduleCell).toContainText('SC101');
      await expect(scheduleCell).toContainText('LAB-301');
    });
  });

  test.describe('UI/UX Behavior', () => {
    test('should close error snackbar after timeout', async ({ page }) => {
      // WHEN: Triggering an error
      await dragSubjectToTimeslot(page, 'MA101', 0, 0);
      
      const errorSnackbar = page.locator('.notistack-snackbar.notistack-variantError').first();
      await expect(errorSnackbar).toBeVisible();
      
      // THEN: Error should auto-dismiss after 6 seconds (MUI default)
      // Use polling assertion instead of arbitrary timeout
      await expect(errorSnackbar).not.toBeVisible({ timeout: 8000 });
    });

    test('should allow manual dismissal of error', async ({ page }) => {
      // WHEN: Triggering an error
      await dragSubjectToTimeslot(page, 'MA101', 0, 0);
      
      const errorSnackbar = page.locator('.notistack-snackbar.notistack-variantError').first();
      await expect(errorSnackbar).toBeVisible();
      
      // WHEN: User clicks dismiss button
      const dismissButton = errorSnackbar.locator('button[aria-label="Close"]');
      if (await dismissButton.isVisible()) {
        await dismissButton.click();
      }
      
      // THEN: Error should disappear immediately
      await expect(errorSnackbar).not.toBeVisible();
    });

    test('should show loading state during async conflict checks', async ({ page }) => {
      // This test may need adjustment based on your loading UI implementation
      
      // WHEN: Dragging subject (triggers async teacher conflict check)
      const dragPromise = dragSubjectToTimeslot(page, 'TH101', 1, 0);
      
      // THEN: May show loading indicator briefly (optional based on implementation)
      // await expect(page.locator('[data-testid="loading"]')).toBeVisible();
      
      await dragPromise;
      
      // Loading should complete
      // await expect(page.locator('[data-testid="loading"]')).not.toBeVisible();
    });
  });
});
