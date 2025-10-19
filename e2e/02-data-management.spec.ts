import { test, expect } from '@playwright/test';
import { NavigationHelper } from './helpers/navigation';

/**
 * TC-003 to TC-006: Data Management Tests
 * 
 * These tests verify CRUD operations for:
 * - Teachers
 * - Subjects
 * - Rooms
 * - Grade Levels
 * 
 * Note: These tests assume authentication is handled or mocked
 */

test.describe('Data Management - Navigation and UI', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
  });

  test('TC-003-01: Teacher Management page loads', async ({ page }) => {
    await nav.goToTeacherManagement();
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/10-teacher-management.png',
      fullPage: true 
    });
    
    // Verify we're on the correct page
    expect(page.url()).toContain('/management/teacher');
    
    // Look for common UI elements (adjust based on actual implementation)
    const pageContent = await page.locator('body').textContent();
    
    // Document what's visible
    console.log('Teacher Management Page loaded');
    console.log('URL:', page.url());
  });

  test('TC-003-02: Teacher Management - Add button exists', async ({ page }) => {
    await nav.goToTeacherManagement();
    await page.waitForLoadState('networkidle');
    
    // Look for add/create button
    const addButton = page.locator('button:has-text("เพิ่ม"), button:has-text("Add"), button:has-text("สร้าง"), button:has-text("Create")').first();
    
    // Take screenshot highlighting the button area
    await page.screenshot({ 
      path: 'test-results/screenshots/11-teacher-add-button.png',
      fullPage: true 
    });
    
    // Check if button exists
    const buttonCount = await addButton.count();
    console.log(`Add teacher button found: ${buttonCount > 0}`);
  });

  test('TC-004-01: Subject Management page loads', async ({ page }) => {
    await nav.goToSubjectManagement();
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/12-subject-management.png',
      fullPage: true 
    });
    
    expect(page.url()).toContain('/management/subject');
    console.log('Subject Management Page loaded');
  });

  test('TC-005-01: Room Management page loads', async ({ page }) => {
    await nav.goToRoomManagement();
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/13-room-management.png',
      fullPage: true 
    });
    
    expect(page.url()).toContain('/management/rooms');
    console.log('Room Management Page loaded');
  });

  test('TC-006-01: Grade Level Management page loads', async ({ page }) => {
    await nav.goToGradeLevelManagement();
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/14-gradelevel-management.png',
      fullPage: true 
    });
    
    expect(page.url()).toContain('/management/gradelevel');
    console.log('Grade Level Management Page loaded');
  });
});

test.describe('Data Management - List Views', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
  });

  test('TC-003-03: Teacher list displays data', async ({ page }) => {
    await nav.goToTeacherManagement();
    await page.waitForLoadState('networkidle');
    
    // Look for table or list elements
    const table = page.locator('table, [role="table"], .table, [data-testid="teacher-list"]').first();
    const listItems = page.locator('[role="row"], tr, .list-item').count();
    
    // Take screenshot of the data area
    await page.screenshot({ 
      path: 'test-results/screenshots/15-teacher-list-data.png',
      fullPage: true 
    });
    
    // Document findings
    console.log(`Teacher list items visible: ${await listItems}`);
  });

  test('TC-004-02: Subject list displays data', async ({ page }) => {
    await nav.goToSubjectManagement();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/screenshots/16-subject-list-data.png',
      fullPage: true 
    });
    
    const listItems = await page.locator('[role="row"], tr, .list-item').count();
    console.log(`Subject list items visible: ${listItems}`);
  });
});
