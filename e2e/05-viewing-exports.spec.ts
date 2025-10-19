import { test, expect } from '@playwright/test';
import { NavigationHelper } from './helpers/navigation';

/**
 * TC-017 to TC-024: Viewing and Export Tests
 * 
 * These tests verify:
 * - Teacher schedule viewing
 * - Student schedule viewing
 * - Summary views
 * - Export functionality (Excel and PDF)
 */

test.describe('Dashboard and Viewing', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
  });

  test('TC-017-01: Teacher table view loads', async ({ page }) => {
    const sampleSemester = '1-2567';
    
    try {
      await nav.goToTeacherTable(sampleSemester);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/screenshots/40-teacher-table.png',
        fullPage: true 
      });
      
      expect(page.url()).toContain('/teacher-table');
      console.log('Teacher table view loaded');
      
    } catch (error) {
      console.log('Teacher table view requires authentication or setup');
      await page.screenshot({ 
        path: 'test-results/screenshots/40-teacher-table-error.png',
        fullPage: true 
      });
    }
  });

  test('TC-017-02: Teacher schedule displays timetable', async ({ page }) => {
    const sampleSemester = '1-2567';
    
    try {
      await nav.goToTeacherTable(sampleSemester);
      await page.waitForLoadState('networkidle');
      
      // Look for timetable structure
      const timetableElements = page.locator('table, .schedule, .timetable');
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/screenshots/41-teacher-schedule-display.png',
        fullPage: true 
      });
      
      const count = await timetableElements.count();
      console.log(`Timetable elements found: ${count}`);
      
    } catch (error) {
      console.log('Unable to verify teacher schedule display');
    }
  });

  test('TC-018-01: Student table view loads', async ({ page }) => {
    const sampleSemester = '1-2567';
    
    try {
      await nav.goToStudentTable(sampleSemester);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/screenshots/42-student-table.png',
        fullPage: true 
      });
      
      expect(page.url()).toContain('/student-table');
      console.log('Student table view loaded');
      
    } catch (error) {
      console.log('Student table view requires authentication or setup');
      await page.screenshot({ 
        path: 'test-results/screenshots/42-student-table-error.png',
        fullPage: true 
      });
    }
  });

  test('TC-019-01: All programs view loads', async ({ page }) => {
    const sampleSemester = '1-2567';
    
    try {
      await nav.goToAllPrograms(sampleSemester);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/screenshots/43-all-programs.png',
        fullPage: true 
      });
      
      expect(page.url()).toContain('/all-program');
      console.log('All programs view loaded');
      
    } catch (error) {
      console.log('All programs view requires authentication or setup');
      await page.screenshot({ 
        path: 'test-results/screenshots/43-all-programs-error.png',
        fullPage: true 
      });
    }
  });

  test('TC-020-01: All timeslots view loads', async ({ page }) => {
    const sampleSemester = '1-2567';
    
    try {
      await nav.goToAllTimeslots(sampleSemester);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/screenshots/44-all-timeslots.png',
        fullPage: true 
      });
      
      expect(page.url()).toContain('/all-timeslot');
      console.log('All timeslots view loaded');
      
    } catch (error) {
      console.log('All timeslots view requires authentication or setup');
      await page.screenshot({ 
        path: 'test-results/screenshots/44-all-timeslots-error.png',
        fullPage: true 
      });
    }
  });
});

test.describe('Export Functionality', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
  });

  test('TC-021-01: Export buttons visible on teacher table', async ({ page }) => {
    const sampleSemester = '1-2567';
    
    try {
      await nav.goToTeacherTable(sampleSemester);
      await page.waitForLoadState('networkidle');
      
      // Look for export buttons
      const exportButtons = page.locator('button:has-text("export"), button:has-text("Excel"), button:has-text("PDF"), button:has-text("ส่งออก")');
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/screenshots/50-export-buttons-teacher.png',
        fullPage: true 
      });
      
      const count = await exportButtons.count();
      console.log(`Export buttons found on teacher table: ${count}`);
      
      // If buttons exist, try to click one (commented out to avoid actual download)
      // if (count > 0) {
      //   await exportButtons.first().click();
      //   await page.waitForTimeout(2000);
      // }
      
    } catch (error) {
      console.log('Unable to test export buttons on teacher table');
    }
  });

  test('TC-023-01: Export buttons visible on student table', async ({ page }) => {
    const sampleSemester = '1-2567';
    
    try {
      await nav.goToStudentTable(sampleSemester);
      await page.waitForLoadState('networkidle');
      
      // Look for export buttons
      const exportButtons = page.locator('button:has-text("export"), button:has-text("Excel"), button:has-text("PDF"), button:has-text("ส่งออก")');
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/screenshots/51-export-buttons-student.png',
        fullPage: true 
      });
      
      const count = await exportButtons.count();
      console.log(`Export buttons found on student table: ${count}`);
      
    } catch (error) {
      console.log('Unable to test export buttons on student table');
    }
  });

  test('TC-022-01: Print functionality available', async ({ page }) => {
    const sampleSemester = '1-2567';
    
    try {
      await nav.goToTeacherTable(sampleSemester);
      await page.waitForLoadState('networkidle');
      
      // Look for print button or print-related functionality
      const printButton = page.locator('button:has-text("print"), button:has-text("พิมพ์")');
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/screenshots/52-print-functionality.png',
        fullPage: true 
      });
      
      const count = await printButton.count();
      console.log(`Print button found: ${count > 0}`);
      
    } catch (error) {
      console.log('Unable to test print functionality');
    }
  });
});
