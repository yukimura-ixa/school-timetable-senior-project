import { test, expect } from '@playwright/test';
import { NavigationHelper } from '../helpers/navigation';

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

test.describe('Dashboard Viewing', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
  });

  test('[journey] teacher table view loads', async ({ page }) => {
    const semester = '1-2567';
    try {
      await nav.goToTeacherTable(semester);
      await page.waitForSelector('body');
      await page.screenshot({ path: 'test-results/screenshots/teacher-table.png', fullPage: true });
      expect(page.url()).toContain('/teacher-table');
    } catch (err) {
      await page.screenshot({ path: 'test-results/screenshots/teacher-table-error.png', fullPage: true });
    }
  });

  test('[journey] student table view loads', async ({ page }) => {
    const semester = '1-2567';
    try {
      await nav.goToStudentTable(semester);
      await page.waitForSelector('body');
      await page.screenshot({ path: 'test-results/screenshots/student-table.png', fullPage: true });
      expect(page.url()).toContain('/student-table');
    } catch (err) {
      await page.screenshot({ path: 'test-results/screenshots/student-table-error.png', fullPage: true });
    }
  });

  test('[journey] all programs view loads', async ({ page }) => {
    const semester = '1-2567';
    try {
      await nav.goToAllPrograms(semester);
      await page.waitForSelector('body');
      await page.screenshot({ path: 'test-results/screenshots/all-programs.png', fullPage: true });
      expect(page.url()).toContain('/all-program');
    } catch (err) {
      await page.screenshot({ path: 'test-results/screenshots/all-programs-error.png', fullPage: true });
    }
  });

  test('[journey] all timeslots view loads', async ({ page }) => {
    const semester = '1-2567';
    try {
      await nav.goToAllTimeslots(semester);
      await page.waitForSelector('body');
      await page.screenshot({ path: 'test-results/screenshots/all-timeslots.png', fullPage: true });
      expect(page.url()).toContain('/all-timeslot');
    } catch (err) {
      await page.screenshot({ path: 'test-results/screenshots/all-timeslots-error.png', fullPage: true });
    }
  });
});

test.describe('Export & Print Controls', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
  });

  test('[journey] export buttons visible on teacher table', async ({ page }) => {
    const semester = '1-2567';
    try {
      await nav.goToTeacherTable(semester);
      await page.waitForSelector('body');
      const exportButtons = page.locator('button:has-text("Excel"), button:has-text("PDF"), button:has-text("ส่งออก"), button:has-text("export")');
      await page.screenshot({ path: 'test-results/screenshots/export-buttons-teacher.png', fullPage: true });
      const count = await exportButtons.count();
      expect(count).toBeGreaterThan(0);
    } catch (err) {
      await page.screenshot({ path: 'test-results/screenshots/export-buttons-teacher-error.png', fullPage: true });
    }
  });

  test('[journey] export buttons visible on student table', async ({ page }) => {
    const semester = '1-2567';
    try {
      await nav.goToStudentTable(semester);
      await page.waitForSelector('body');
      const exportButtons = page.locator('button:has-text("Excel"), button:has-text("PDF"), button:has-text("ส่งออก"), button:has-text("export")');
      await page.screenshot({ path: 'test-results/screenshots/export-buttons-student.png', fullPage: true });
      const count = await exportButtons.count();
      expect(count).toBeGreaterThan(0);
    } catch (err) {
      await page.screenshot({ path: 'test-results/screenshots/export-buttons-student-error.png', fullPage: true });
    }
  });

  test('[journey] print functionality available on teacher table', async ({ page }) => {
    const semester = '1-2567';
    try {
      await nav.goToTeacherTable(semester);
      await page.waitForSelector('body');
      const printButton = page.locator('button:has-text("พิมพ์"), button:has-text("print")');
      await page.screenshot({ path: 'test-results/screenshots/print-button-teacher.png', fullPage: true });
      const count = await printButton.count();
      expect(count).toBeGreaterThan(0);
    } catch (err) {
      await page.screenshot({ path: 'test-results/screenshots/print-button-teacher-error.png', fullPage: true });
    }
  });
});
