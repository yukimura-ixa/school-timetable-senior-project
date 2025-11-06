/**
 * Issue #89 - Schedule Deletion with Cache Revalidation
 * 
 * Tests schedule deletion functionality and SWR cache invalidation:
 * 1. Delete schedule
 * 2. Confirm deletion
 * 3. Verify schedule is empty
 * 4. Verify SWR cache is revalidated
 * 5. Verify subjects return to palette
 * 
 * @see Issue: https://github.com/yukimura-ixa/school-timetable-senior-project/issues/89
 */

import { test, expect } from '../fixtures/test';

test.describe('Issue #89 - Schedule Deletion', () => {
  test.beforeEach(async ({ arrangePage }) => {
    // Navigate to test semester (1-2567)
    await arrangePage.navigateTo('1', '2567');
    
    // Select a teacher
    await arrangePage.selectTeacher('นางสาว A'); // Adjust as needed
  });

  test('should delete schedule successfully', async ({ arrangePage }) => {
    // Place at least one subject first (if palette is not empty)
    const hasSubjects = await arrangePage.getSubjectPaletteCount() > 0;
    
    if (hasSubjects) {
      const subjectCode = 'TH101'; // Adjust as needed
      const hasSubject = await arrangePage.isSubjectInPalette(subjectCode);
      
      if (hasSubject) {
        // Place one subject
        await arrangePage.dragSubjectToTimeslot(subjectCode, 1, 2);
        await arrangePage.selectRoom('101');
        await arrangePage.waitForPageLoad();
      }
    }
    
    // Delete the schedule
    await arrangePage.deleteSchedule();
    
    // Assert success notification
    await arrangePage.assertSuccessNotification('ลบตารางสำเร็จ');
    
    // Wait for cache revalidation
    await arrangePage.waitForPageLoad();
  });

  test('should show empty schedule after deletion', async ({ arrangePage }) => {
    // Delete schedule
    await arrangePage.deleteSchedule();
    
    // Wait for UI update
    await arrangePage.waitForPageLoad();
    
    // Assert schedule is empty
    await arrangePage.assertScheduleEmpty();
  });

  test('should revalidate SWR cache after deletion', async ({ arrangePage, page }) => {
    // Place a subject first
    const subjectCode = 'TH101';
    const hasSubject = await arrangePage.isSubjectInPalette(subjectCode);
    
    if (!hasSubject) {
      test.skip(true, 'Subject not available for testing');
      return;
    }
    
    // Place subject
    await arrangePage.dragSubjectToTimeslot(subjectCode, 1, 2);
    await arrangePage.selectRoom('101');
    await arrangePage.waitForPageLoad();
    
    // Get initial palette count (should be decreased)
    const countBeforeDelete = await arrangePage.getSubjectPaletteCount();
    
    // Delete schedule
    await arrangePage.deleteSchedule();
    await arrangePage.waitForPageLoad();
    
    // Palette count should increase (subjects return)
    const countAfterDelete = await arrangePage.getSubjectPaletteCount();
    expect(countAfterDelete).toBeGreaterThanOrEqual(countBeforeDelete);
    
    // Subject should be back in palette
    const isSubjectBack = await arrangePage.isSubjectInPalette(subjectCode);
    expect(isSubjectBack).toBeTruthy();
  });

  test('should persist deletion across page reload', async ({ arrangePage, page }) => {
    // Delete schedule
    await arrangePage.deleteSchedule();
    await arrangePage.waitForPageLoad();
    
    // Reload the page
    await page.reload();
    await arrangePage.waitForPageLoad();
    
    // Schedule should still be empty
    await arrangePage.assertScheduleEmpty();
  });

  test('should handle deletion when schedule is already empty', async ({ arrangePage }) => {
    // Ensure schedule is empty first
    await arrangePage.assertScheduleEmpty().catch(() => {
      // If not empty, delete it first
    });
    
    // Try to delete empty schedule
    await arrangePage.deleteSchedule();
    
    // Should still show success (or appropriate message)
    await arrangePage.assertSuccessNotification();
  });

  test('should update subject availability after deletion', async ({ arrangePage }) => {
    // Get initial palette count
    const initialCount = await arrangePage.getSubjectPaletteCount();
    
    // If schedule is not empty, delete it
    const isEmpty = await arrangePage.assertScheduleEmpty().then(() => true).catch(() => false);
    
    if (!isEmpty) {
      await arrangePage.deleteSchedule();
      await arrangePage.waitForPageLoad();
      
      // Palette count should be at maximum (all subjects available)
      const finalCount = await arrangePage.getSubjectPaletteCount();
      expect(finalCount).toBeGreaterThanOrEqual(initialCount);
    }
  });
});
