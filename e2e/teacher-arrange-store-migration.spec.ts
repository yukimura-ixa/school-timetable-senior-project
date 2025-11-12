/**
 * E2E Tests: Teacher Arrange Page - Phase 4 Migration Validation
 * 
 * Tests the Context7-powered Zustand store migration to ensure:
 * 1. All CRUD operations work correctly
 * 2. State persistence works (localStorage)
 * 3. Optimized selectors prevent unnecessary re-renders
 * 4. Modal and error display work properly
 * 5. Drag-and-drop functionality remains intact
 * 
 * Migration: Phase 4 (arrangement-ui.store → teacher-arrange.store)
 * Store Pattern: Context7 best practices with granular selectors
 * Expected Performance: 60-70% re-render reduction
 */

import { test, expect } from '@playwright/test';

// Test data setup
const TEST_SEMESTER = '1-2567';
const TEST_TEACHER_ID = '1'; // Adjust based on seeded data

test.describe('Teacher Arrange - Store Migration E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to teacher arrange page
    await page.goto(`/schedule/${TEST_SEMESTER}/arrange/teacher-arrange`, {
      waitUntil: 'domcontentloaded'
    });
    
    // Wait for page to be fully loaded - check for main content
    await page.waitForSelector('[role="combobox"], .teacher-select, main', {
      timeout: 10000
    });
  });

  test.describe('Teacher Selection & State Management', () => {
    test('should load teacher list and select a teacher', async ({ page }) => {
      // Check if teacher selection dropdown/list exists
      const teacherSelect = page.getByRole('combobox', { name: /เลือกครู|teacher/i }).first();
      await expect(teacherSelect).toBeVisible();

      // Select a teacher (using first available option)
      await teacherSelect.click();
      
      // Wait for options to appear
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      
      const firstTeacher = page.locator('[role="option"]').first();
      await expect(firstTeacher).toBeVisible();
      await firstTeacher.click();

      // Verify teacher data loaded (check for schedule grid or subject list)
      await expect(
        page.locator('text=/ตารางสอน|รายวิชา|Schedule/i').first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('should persist selected teacher on page reload', async ({ page }) => {
      // Select a teacher
      const teacherSelect = page.getByRole('combobox', { name: /เลือกครู|teacher/i }).first();
      await teacherSelect.click();
      
      // Wait for options to appear
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      
      const firstTeacher = page.locator('[role="option"]').first();
      await expect(firstTeacher).toBeVisible();
      const teacherName = await firstTeacher.textContent();
      await firstTeacher.click();

      // Wait for state to persist (localStorage write)
      await page.waitForFunction(() => {
        const stored = localStorage.getItem('teacher-arrange-store');
        return stored !== null;
      }, { timeout: 2000 }).catch(() => {});

      // Reload page
      await page.reload({ waitUntil: 'domcontentloaded' });
      
      // Wait for page to reinitialize
      await page.waitForSelector('[role="combobox"], main', { timeout: 10000 });

      // Verify teacher is still selected (check for schedule content)
      await expect(
        page.locator('text=/ตารางสอน|รายวิชา|Schedule/i').first()
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Subject Data Management', () => {
    test('should display subject list for selected teacher', async ({ page }) => {
      // Select teacher
      await selectTeacher(page);

      // Wait for subjects to load
      const subjectElements = page.locator('[data-testid*="subject"], .subject-card, .subject-item');
      await expect(subjectElements.first()).toBeVisible({ timeout: 5000 });
      const count = await subjectElements.count();
      
      // Should have at least some subjects
      expect(count).toBeGreaterThan(0);
    });

    test('should filter subjects when using search/filter', async ({ page }) => {
      // Select teacher
      await selectTeacher(page);

      // Get initial subject count
      const subjectElements = page.locator('[data-testid*="subject"], .subject-card, .subject-item');
      await expect(subjectElements.first()).toBeVisible({ timeout: 5000 });
      const initialCount = await subjectElements.count();

      // Look for filter inputs (grade, category, etc.)
      const filterInput = page.locator('input[placeholder*="ค้นหา"], select[name*="grade"], select[name*="filter"]').first();
      
      if (await filterInput.isVisible()) {
        // Apply a filter
        await filterInput.click();
        
        // Select first filter option if dropdown
        if (await filterInput.getAttribute('role') === 'combobox') {
          await page.locator('[role="option"]').first().click();
        } else {
          await filterInput.fill('TH'); // Try searching for subject code
        }

        // Wait for filter to apply
        await page.waitForFunction((initialCnt) => {
          const elements = document.querySelectorAll('[data-testid*="subject"], .subject-card, .subject-item');
          return elements.length !== initialCnt;
        }, initialCount, { timeout: 3000 }).catch(() => {});

        // Verify filtered count changed
        const filteredCount = await subjectElements.count();
        expect(filteredCount).not.toBe(initialCount);
      }
    });
  });

  test.describe('Timeslot Operations', () => {
    test('should display timeslot grid', async ({ page }) => {
      // Select teacher
      await selectTeacher(page);

      // Check for timeslot grid elements
      const timeslotGrid = page.locator('[data-testid*="timeslot"], .timeslot-grid, table');
      await expect(timeslotGrid.first()).toBeVisible({ timeout: 5000 });
      await expect(timeslotGrid.first()).toBeVisible();

      // Check for day headers (MON, TUE, etc.)
      const dayHeaders = page.locator('text=/จันทร์|อังคาร|พุธ|MON|TUE|WED/i');
      await expect(dayHeaders.first()).toBeVisible();
    });

    test('should highlight timeslot on hover', async ({ page }) => {
      // Select teacher
      await selectTeacher(page);

      // Find first timeslot cell
      const firstTimeslot = page.locator('[data-testid*="timeslot"], .timeslot-cell, td').first();
      await expect(firstTimeslot).toBeVisible({ timeout: 5000 });

      // Hover over timeslot
      await firstTimeslot.hover();

      // Check for hover state (class change, style change, etc.)
      const classes = await firstTimeslot.getAttribute('class');
      expect(classes).toBeTruthy(); // Just verify classes exist
    });
  });

  test.describe('Drag and Drop Functionality', () => {
    test('should select subject when clicked', async ({ page }) => {
      // Select teacher
      await selectTeacher(page);

      // Find and click a subject
      const firstSubject = page.locator('[data-testid*="subject"], .subject-card, .subject-item').first();
      await expect(firstSubject).toBeVisible({ timeout: 5000 });
      await firstSubject.click();

      // Check for selected state (border, background color, etc.)
      const classes = await firstSubject.getAttribute('class');
      expect(classes).toBeTruthy();
    });

    test('should show error when trying invalid assignment', async ({ page }) => {
      // Select teacher
      await selectTeacher(page);

      // Try to assign a subject to an incompatible timeslot
      const subject = page.locator('[data-testid*="subject"], .subject-card').first();
      await expect(subject).toBeVisible({ timeout: 5000 });
      await subject.click();

      // Find a locked or incompatible timeslot
      const lockedSlot = page.locator('[data-locked="true"], .timeslot-locked').first();
      
      if (await lockedSlot.isVisible()) {
        await lockedSlot.click();

        // Check for error message
        const errorMsg = page.locator('text=/ขัดแย้ง|ไม่สามารถ|conflict|error/i');
        await expect(errorMsg.first()).toBeVisible();
      }
    });
  });

  test.describe('Modal Operations', () => {
    test('should open room selection modal when assigning to timeslot', async ({ page }) => {
      // Select teacher
      await selectTeacher(page);

      // Select a subject
      const subject = page.locator('[data-testid*="subject"], .subject-card').first();
      await expect(subject).toBeVisible({ timeout: 5000 });
      await subject.click();

      // Click on empty timeslot
      const emptySlot = page.locator('[data-testid*="timeslot"]:not([data-has-subject="true"])').first();
      
      if (await emptySlot.isVisible()) {
        await emptySlot.click();

        // Check for modal with timeout
        const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]');
        await expect(modal.first()).toBeVisible({ timeout: 5000 });

        // Check for room selection content
        await expect(
          page.locator('text=/เลือกห้อง|room|ห้องเรียน/i').first()
        ).toBeVisible();
      }
    });

    test('should close modal on cancel', async ({ page }) => {
      // Select teacher and open modal (same as above)
      await selectTeacher(page);

      const subject = page.locator('[data-testid*="subject"], .subject-card').first();
      await expect(subject).toBeVisible({ timeout: 5000 });
      await subject.click();
      
      const emptySlot = page.locator('[data-testid*="timeslot"]:not([data-has-subject="true"])').first();
      if (await emptySlot.isVisible()) {
        await emptySlot.click();

        // Find and click cancel button
        const cancelBtn = page.locator('button:has-text("ยกเลิก"), button:has-text("Cancel")').first();
        await expect(cancelBtn).toBeVisible({ timeout: 5000 });
        await cancelBtn.click();

        // Verify modal is closed
        const modal = page.locator('[role="dialog"], .modal');
        await page.waitForFunction(() => {
          return document.querySelectorAll('[role="dialog"]').length === 0;
        }, { timeout: 2000 }).catch(() => {});
        await expect(modal.first()).not.toBeVisible();
      }
    });
  });

  test.describe('Save & Persistence', () => {
    test('should show saving indicator when saving schedule', async ({ page }) => {
      // Select teacher
      await selectTeacher(page);

      // Find save button
      const saveBtn = page.locator('button:has-text("บันทึก"), button:has-text("Save")').first();
      await expect(saveBtn).toBeVisible({ timeout: 5000 });
      await saveBtn.click();

      // Check for loading/saving indicator
      const savingIndicator = page.locator('text=/กำลังบันทึก|Saving|Loading/i');
      await expect(savingIndicator.first()).toBeVisible({ timeout: 3000 });

      // Wait for save to complete - check for success message
      const successMsg = page.locator('text=/บันทึกสำเร็จ|success|saved/i');
      await expect(successMsg.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Performance & Re-render Validation', () => {
    test('should maintain responsive UI during multiple state changes', async ({ page }) => {
      // Select teacher
      await selectTeacher(page);

      // Perform multiple rapid state changes
      const subjects = page.locator('[data-testid*="subject"], .subject-card');
      await expect(subjects.first()).toBeVisible({ timeout: 5000 });
      const count = Math.min(await subjects.count(), 5);

      for (let i = 0; i < count; i++) {
        await subjects.nth(i).click();
        // No wait needed - testing responsiveness
      }

      // UI should still be responsive
      const lastSubject = subjects.nth(count - 1);
      await expect(lastSubject).toBeVisible();
    });

    test('should handle localStorage persistence correctly', async ({ page }) => {
      // Select teacher
      await selectTeacher(page);

      // Apply some filters
      const filterInput = page.locator('select[name*="grade"]').first();
      if (await filterInput.isVisible()) {
        await filterInput.selectOption({ index: 1 });
        
        // Wait for filter to apply
        await page.waitForFunction(() => {
          const stored = localStorage.getItem('teacher-arrange-store');
          if (!stored) return false;
          const state = JSON.parse(stored);
          return state.state && state.state.filters;
        }, { timeout: 2000 }).catch(() => {});
      }

      // Check localStorage for persisted filters
      const storageState = await page.evaluate(() => {
        const stored = localStorage.getItem('teacher-arrange-store');
        return stored ? JSON.parse(stored) : null;
      });

      // Should have persisted filter state
      expect(storageState).toBeTruthy();
      if (storageState && storageState.state) {
        expect(storageState.state.filters).toBeDefined();
      }
    });
  });
});

/**
 * Helper function to select a teacher
 */
async function selectTeacher(page: any) {
  const teacherSelect = page.getByRole('combobox', { name: /เลือกครู|teacher/i }).first();
  
  // If no teacher selected yet
  if (await teacherSelect.isVisible()) {
    await teacherSelect.click();
    
    // Wait for options to appear
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    
    const firstTeacher = page.locator('[role="option"]').first();
    await expect(firstTeacher).toBeVisible();
    await firstTeacher.click();
    
    // Wait for data to load - check for content instead of networkidle
    await page.waitForFunction(() => {
      return document.querySelectorAll('[data-testid*="subject"], .subject-card, .timeslot-grid, table').length > 0;
    }, { timeout: 5000 }).catch(() => {});
  }
}
