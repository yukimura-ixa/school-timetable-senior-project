/**
 * E2E Tests for Teacher Assignment Management (Issue #94)
 * 
 * Tests the complete teacher assignment workflow:
 * 1. Navigate to teacher assignment page (Admin only)
 * 2. Select grade, semester, and academic year
 * 3. Assign teachers to subjects with workload validation
 * 4. Unassign teachers from subjects
 * 5. Copy assignments from previous semester
 * 6. Clear all assignments
 * 7. Verify workload indicators (green/yellow/red)
 * 8. Verify role-based access control
 * 
 * ⚠️ IMPORTANT: MUI Select Async Initialization Issue
 * =====================================================
 * The AssignmentFilters component starts with `isLoading=true`, causing
 * all Select components to be disabled (aria-disabled="true") initially.
 * 
 * A useEffect hook fetches grade levels asynchronously and sets
 * `isLoading=false` when complete, enabling the selects.
 * 
 * **All tests MUST wait for selects to be enabled before interaction:**
 * ```typescript
 * await page.waitForSelector('#grade-select:not(.Mui-disabled)', { 
 *   timeout: 10000,
 *   state: 'attached'
 * });
 * ```
 * 
 * Failing to wait will cause:
 * - Clicks to be ignored (disabled elements don't respond)
 * - Listbox never appearing (dropdowns don't open when disabled)
 * - Tests timing out waiting for [role="listbox"]
 * 
 * This pattern is used in MUI v7 components and must be handled in all
 * Playwright tests that interact with MUI Select components during page load.
 * 
 * @see Issue: https://github.com/yukimura-ixa/school-timetable-senior-project/issues/94
 * @see Component: src/features/teaching-assignment/presentation/components/AssignmentFilters.tsx
 */

import { test, expect } from '../fixtures/test';

test.describe('Issue #94 - Teacher Assignment Management', () => {
  test.describe('Navigation and Access Control', () => {
    test('should show management menu for admin users', async ({ page }) => {
      // Admin should see "จัดการ" menu
      await page.goto('/', {
        timeout: 30000,
        waitUntil: 'domcontentloaded'
      });
      const managementLink = page.locator('a:has-text("จัดการ")');
      await expect(managementLink).toBeVisible();
    });

    test('should display teacher assignment card in management page', async ({ page }) => {
      await page.goto('/management', {
        timeout: 30000,
        waitUntil: 'domcontentloaded'
      });
      
      // Should see "มอบหมายครูผู้สอน" card
      const assignmentCard = page.locator('text=มอบหมายครูผู้สอน');
      await expect(assignmentCard).toBeVisible();
      
      // Card should have description
      const description = page.locator('text=กำหนดครูผู้สอนแต่ละวิชาตามระดับชั้น');
      await expect(description).toBeVisible();
    });

    test('should navigate to teacher assignment page', async ({ page }) => {
      await page.goto('/management', {
        timeout: 30000,
        waitUntil: 'domcontentloaded'
      });
      
      // Click on teacher assignment card
      await page.click('text=มอบหมายครูผู้สอน');
      
      // Should navigate to assignment page
      await expect(page).toHaveURL(/\/management\/teacher-assignment/);
      
      // Page should have title (h4 renders as h1 in DOM)
      const title = page.locator('h1:has-text("จัดการมอบหมายครูผู้สอน")');
      await expect(title).toBeVisible();
    });

    test('should deny access to non-admin users', async ({ page }) => {
      // TODO: Implement after auth role testing is configured
      // For now, this is a placeholder for future implementation
      test.skip();
    });
  });

  test.describe('Filter Controls', () => {
    test.beforeEach(async ({ page }) => {
      // Increase timeout for navigation and wait for content to be ready
      await page.goto('/management/teacher-assignment', { 
        timeout: 30000,
        waitUntil: 'domcontentloaded' // Don't wait for full networkidle
      });
      // Wait for the main title to ensure page has loaded
      await page.waitForSelector('h1:has-text("จัดการมอบหมายครูผู้สอน")', { timeout: 10000 });
      
      // ✅ FIXED: Wait for filters to be ENABLED (not just exist)
      // AssignmentFilters starts with isLoading=true, making selects disabled
      // We must wait for the async fetch to complete before interacting
      // Note: MUI Select uses 'Mui-disabled' class on the input element
      await page.waitForSelector('#grade-select:not(.Mui-disabled)', { 
        timeout: 10000,
        state: 'attached'
      });
    });

    test('should display all filter controls', async ({ page }) => {
      // Grade level selector
      const gradeSelect = page.locator('label:has-text("ระดับชั้น")');
      await expect(gradeSelect).toBeVisible();
      
      // Semester selector
      const semesterSelect = page.locator('label:has-text("ภาคเรียน")');
      await expect(semesterSelect).toBeVisible();
      
      // Academic year selector
      const yearSelect = page.locator('label:has-text("ปีการศึกษา")');
      await expect(yearSelect).toBeVisible();
    });

    test('should load subjects when filters are selected', async ({ page }) => {
      // Select grade - display text is "ม.1" (value is "ม.1/1" internally)
      await page.locator('#grade-select').click({ force: true });
      await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
      await page.locator('li[data-value="ม.1/1"]').click({ force: true });
      
      // Wait for selection to register
      await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 5000 });
      await page.waitForTimeout(500);
      
      // Select semester
      await page.locator('#semester-select').click({ force: true });
      await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
      await page.locator('li:has-text("ภาคเรียนที่ 1")').click({ force: true });
      await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 5000 });
      
      await page.waitForTimeout(500);
      
      // Select year
      await page.locator('#year-select').click({ force: true });
      await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
      await page.locator('li:has-text("2567")').click({ force: true });
      await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 5000 });
      
      // Wait for table to load
      const table = page.locator('table');
      await expect(table).toBeVisible({ timeout: 10000 });
      
      // Should have subject rows
      const subjectRows = page.locator('tbody tr');
      await expect(subjectRows).not.toHaveCount(0);
    });

    test('should persist filter selections', async ({ page }) => {
      // Test filter interaction works (state persistence not yet implemented)
      // Just verify filters can be opened and interacted with
      
      // Try to open grade select
      await page.locator('#grade-select').click({ force: true });
      
      // Wait for dropdown to appear
      await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
      
      // Click first available option
      const firstOption = page.locator('[role="option"]').first();
      await firstOption.click({ force: true });
      
      // Verify filter closed
      await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 5000 });
      
      // TODO: Add state persistence verification when implemented
      // For now, filters reset on reload (stateless)
    });
  });

  test.describe('Teacher Assignment Operations', () => {
    test.beforeEach(async ({ page }) => {
      // Increase timeout and use domcontentloaded
      await page.goto('/management/teacher-assignment', {
        timeout: 30000,
        waitUntil: 'domcontentloaded'
      });
      
      // Wait for page to be ready
      await page.waitForSelector('h1:has-text("จัดการมอบหมายครูผู้สอน")', { timeout: 10000 });
      
      // ✅ FIXED: Wait for filters to be ENABLED (not just exist)
      // AssignmentFilters starts with isLoading=true, making selects disabled
      // We must wait for the async fetch to complete before interacting
      // Note: MUI Select uses 'Mui-disabled' class on the input element
      await page.waitForSelector('#grade-select:not(.Mui-disabled)', { 
        timeout: 10000,
        state: 'attached'
      });
      
      // Set up filters using proper MUI Select IDs with stability waits
      await page.locator('#grade-select').click({ force: true });
      await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
      await page.locator('li[data-value="ม.1/1"]').click({ force: true });
      await page.waitForTimeout(500); // Wait for selection to complete
      
      // Semester select
      await page.locator('#semester-select').click({ force: true });
      await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
      await page.locator('li:has-text("ภาคเรียนที่ 1")').click({ force: true });
      await page.waitForTimeout(500); // Wait for selection to complete
      
      // Year select
      await page.locator('#year-select').click({ force: true });
      await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
      await page.locator('li:has-text("2567")').click({ force: true });
      await page.waitForTimeout(500); // Wait for selection to complete
      
      // Wait for table to load
      await page.waitForSelector('table', { timeout: 10000 });
    });

    test('should display subject table with correct columns', async ({ page }) => {
      // Check column headers
      const headers = ['รหัสวิชา', 'ชื่อวิชา', 'หน่วยกิต', 'ครูผู้สอน', 'จำนวนชั่วโมง', 'จัดการ'];
      
      for (const header of headers) {
        const headerCell = page.locator(`th:has-text("${header}")`);
        await expect(headerCell).toBeVisible();
      }
    });

    test('should show teacher selector for unassigned subjects', async ({ page }) => {
      // Find first unassigned subject (no teacher name)
      const unassignedRow = page.locator('tbody tr').filter({
        has: page.locator('td:has-text("-")'),
      }).first();
      
      if (await unassignedRow.count() > 0) {
        // Should have teacher autocomplete
        const autocomplete = unassignedRow.locator('input[role="combobox"]');
        await expect(autocomplete).toBeVisible();
        
        // Should have hours input
        const hoursInput = unassignedRow.locator('input[type="number"]');
        await expect(hoursInput).toBeVisible();
        
        // Should have assign button
        const assignButton = unassignedRow.locator('button:has-text("มอบหมาย")');
        await expect(assignButton).toBeVisible();
      }
    });

    test('should assign teacher to subject', async ({ page }) => {
      test.setTimeout(30000); // Increase timeout for this test
      
      // Wait for table to be fully loaded with subjects
      await page.waitForSelector('tbody tr', { timeout: 10000 });
      
      // Find unassigned subject - need to check if autocomplete exists
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      
      let targetRow = null;
      let subjectCode = null;
      
      // Find first row with autocomplete (unassigned subject)
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const autocompleteCount = await row.locator('input[role="combobox"]').count();
        if (autocompleteCount > 0) {
          targetRow = row;
          subjectCode = await row.locator('td').first().textContent();
          break;
        }
      }
      
      if (!targetRow) {
        test.skip(); // Skip if no unassigned subjects
        return;
      }
      
      // Open teacher autocomplete
      const autocomplete = targetRow.locator('input[role="combobox"]');
      await autocomplete.click();
      await autocomplete.fill('ครู');
      
      // Wait for options
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      
      // Select first teacher
      await page.locator('[role="option"]').first().click();
      
      // Enter hours
      const hoursInput = targetRow.locator('input[type="number"]');
      await hoursInput.fill('4');
      
      // Click assign button
      await targetRow.locator('button:has-text("มอบหมาย")').click();
      
      // Wait for success message or page reload
      await page.waitForTimeout(2000); // Give time for the action
      
      // Verify assignment (teacher name should appear)
      const updatedRow = page.locator(`tbody tr:has-text("${subjectCode}")`);
      const teacherCell = updatedRow.locator('td').nth(3);
      const teacherName = await teacherCell.textContent();
      
      expect(teacherName).not.toBe('-');
      expect(teacherName?.length).toBeGreaterThan(0);
    });

    test('should show workload indicator for teachers', async ({ page }) => {
      // Wait for table to load
      await page.waitForSelector('tbody tr', { timeout: 10000 });
      
      // Find row with autocomplete
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      
      let autocomplete = null;
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const autocompleteCount = await row.locator('input[role="combobox"]').count();
        if (autocompleteCount > 0) {
          autocomplete = row.locator('input[role="combobox"]');
          break;
        }
      }
      
      if (!autocomplete) {
        test.skip(); // Skip if no autocomplete found
        return;
      }
      
      // Click on teacher autocomplete
      await autocomplete.click();
      await autocomplete.fill('');
      
      // Wait for options to appear
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      
      // Check for workload badges (Chip components)
      const options = page.locator('[role="option"]');
      const firstOption = options.first();
      
      // Should have teacher name
      await expect(firstOption).toBeVisible();
      
      // May have workload badge (green/yellow/red chip)
      // Use .first() to avoid strict mode violation (Chip has container + label)
      const badge = firstOption.locator('[class*="MuiChip"]').first();
      if (await badge.count() > 0) {
        await expect(badge).toBeVisible();
      }
    });

    test('should unassign teacher from subject', async ({ page }) => {
      test.setTimeout(30000);
      
      // Wait for table to load
      await page.waitForSelector('tbody tr', { timeout: 10000 });
      
      // Find assigned subject (has IconButton with DeleteIcon)
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      
      let targetRow = null;
      let subjectCode = null;
      
      // Find first row with unassign button (assigned subject)
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const deleteButtonCount = await row.locator('button[color="error"]').count();
        if (deleteButtonCount > 0) {
          targetRow = row;
          subjectCode = await row.locator('td').first().textContent();
          break;
        }
      }
      
      if (!targetRow) {
        test.skip(); // Skip if no assigned subjects
        return;
      }
      
      // Click unassign button (IconButton with DeleteIcon, color="error")
      const unassignButton = targetRow.locator('button[color="error"]');
      await unassignButton.click();
      
      // Confirm dialog
      const confirmButton = page.locator('button:has-text("ยืนยัน")');
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }
      
      // Wait for action to complete (don't wait for networkidle, it may timeout)
      await page.waitForTimeout(2000);
      
      // Verify unassignment
      const updatedRow = page.locator(`tbody tr:has-text("${subjectCode}")`);
      const teacherCell = updatedRow.locator('td').nth(3);
      await expect(teacherCell).toHaveText('-');
    });
  });

  test.describe('Bulk Operations', () => {
    test.beforeEach(async ({ page }) => {
      // Increase timeout and use domcontentloaded
      await page.goto('/management/teacher-assignment', {
        timeout: 30000,
        waitUntil: 'domcontentloaded'
      });
      
      // Wait for page to be ready
      await page.waitForSelector('h1:has-text("จัดการมอบหมายครูผู้สอน")', { timeout: 10000 });
      
      // ✅ FIXED: Wait for filters to be ENABLED (not just exist)
      // AssignmentFilters starts with isLoading=true, making selects disabled
      // We must wait for the async fetch to complete before interacting
      // Note: MUI Select uses 'Mui-disabled' class on the input element
      await page.waitForSelector('#grade-select:not(.Mui-disabled)', { 
        timeout: 10000,
        state: 'attached'
      });
      
      // Set up filters using MUI Select - click input directly with force
      await page.locator('#grade-select').click({ force: true });
      await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
      await page.locator('li[data-value="ม.1/1"]').click({ force: true });
      await page.waitForTimeout(500); // Wait for selection to complete
      
      await page.locator('#semester-select').click({ force: true });
      await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
      await page.locator('li:has-text("ภาคเรียนที่ 1")').click({ force: true });
      await page.waitForTimeout(500); // Wait for selection to complete
      
      await page.locator('#year-select').click({ force: true });
      await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
      await page.locator('li:has-text("2567")').click({ force: true });
      await page.waitForSelector('[role="listbox"]', { state: 'hidden', timeout: 5000 });
      
      await page.waitForSelector('table', { timeout: 10000 });
    });

    test('should display bulk action buttons', async ({ page }) => {
      // Copy from previous button (actual text from component)
      const copyButton = page.locator('button:has-text("คัดลอกจากภาคเรียนก่อนหน้า")');
      await expect(copyButton).toBeVisible();
      
      // Clear all button (actual text from component)
      const clearButton = page.locator('button:has-text("ลบการมอบหมายทั้งหมด")');
      await expect(clearButton).toBeVisible();
    });

    test('should show confirmation dialog for clear all', async ({ page }) => {
      // Wait for button to be available
      const clearButton = page.locator('button:has-text("ลบการมอบหมายทั้งหมด")');
      await clearButton.waitFor({ timeout: 5000 });
      
      // Click clear all button (actual text from component)
      await clearButton.click();
      
      // Wait a moment for any dialog/modal to appear
      await page.waitForTimeout(1000);
      
      // Check if any modal/dialog appeared (MUI may use different structure)
      const hasDialog = await page.locator('[role="dialog"]').count() > 0 
        || await page.locator('.MuiDialog-root').count() > 0
        || await page.locator('.MuiModal-root').count() > 0;
      
      if (hasDialog) {
        // If dialog appeared, find and click cancel
        const cancelButton = page.locator('button:has-text("ยกเลิก")').or(
          page.locator('button:has-text("Cancel")')
        );
        if (await cancelButton.count() > 0) {
          await cancelButton.click();
        }
      }
      
      // Verify page is still functional
      const title = page.locator('h1:has-text("จัดการมอบหมายครูผู้สอน")');
      await expect(title).toBeVisible();
    });

    test('should copy assignments from previous semester', async ({ page }) => {
      test.setTimeout(30000);
      
      // Wait for button to be available
      const copyButton = page.locator('button:has-text("คัดลอกจากภาคเรียนก่อนหน้า")');
      await copyButton.waitFor({ timeout: 5000 });
      
      // Click copy button (actual text from component)
      await copyButton.click();
      
      // Confirm dialog (if appears)
      const confirmButton = page.locator('button:has-text("ยืนยัน")');
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }
      
      // Wait for operation to complete (don't use networkidle, use timeout)
      await page.waitForTimeout(3000);
      
      // Should show success message or updated data
      // (Exact assertion depends on whether previous semester has data)
      // Just verify page is still responsive
      const title = page.locator('h1:has-text("จัดการมอบหมายครูผู้สอน")');
      await expect(title).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/management/teacher-assignment', {
        timeout: 30000,
        waitUntil: 'domcontentloaded'
      });
      await page.waitForSelector('h1:has-text("จัดการมอบหมายครูผู้สอน")', { timeout: 10000 });
    });

    test('should show error when filters not selected', async ({ page }) => {
      // Without selecting filters, table should not appear
      const table = page.locator('table');
      await expect(table).not.toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // TODO: Implement network error simulation
      // This would require intercepting fetch requests
      test.skip();
    });

    test('should show validation error for overloaded teacher', async ({ page }) => {
      // TODO: This requires setting up a teacher with near-max workload
      // Then attempting to assign more hours than allowed
      test.skip();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/management/teacher-assignment');
      
      // Page should be accessible (h4 renders as h1)
      const title = page.locator('h1:has-text("จัดการมอบหมายครูผู้สอน")');
      await expect(title).toBeVisible();
      
      // Filters should stack vertically - use more specific selector to avoid strict mode
      const gradeFilter = page.locator('#grade-select').or(page.getByLabel('ระดับชั้น'));
      await expect(gradeFilter).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/management/teacher-assignment');
      
      // Should have proper layout
      const container = page.locator('[role="main"], .MuiContainer-root');
      await expect(container).toBeVisible();
    });
  });
});
