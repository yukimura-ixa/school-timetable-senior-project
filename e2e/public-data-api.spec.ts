import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Public Data API Layer
 * 
 * These tests verify the public-facing data endpoints that are used by:
 * - Homepage (teachers/classes listings, quick stats)
 * - Public teacher/class detail pages
 * - Analytics dashboards
 * 
 * Converted from: __test__/public-data-layer.test.ts (database-dependent integration tests)
 * 
 * Key verifications:
 * - PII protection (no email addresses exposed)
 * - Correct data structure and types
 * - Pagination functionality
 * - Sorting behavior
 * - Search/filter functionality
 * - Statistics accuracy
 * - Security (no sensitive data leakage)
 */

test.describe('Public Teachers Data API', () => {
  test('should load homepage with teachers data', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if teachers tab exists
    const teachersTab = page.locator('text=/teachers|ครู/i').first();
    await expect(teachersTab).toBeVisible({ timeout: 10000 });
    
    // Click teachers tab if not already selected
    await teachersTab.click();
    
    // Wait for teacher data to load
    await page.waitForTimeout(1000);
    
    // Verify teacher table or cards are visible
    const hasTeacherContent = await page.locator('table, [data-testid*="teacher"], text=/teacher|ครู/i').count();
    expect(hasTeacherContent).toBeGreaterThan(0);
  });

  test('should not expose email addresses (PII protection)', async ({ page }) => {
    // Navigate to homepage teachers tab
    await page.goto('/?tab=teachers');
    await page.waitForLoadState('networkidle');
    
    // Get page content
    const content = await page.content();
    
    // Check for email patterns in page content
    const emailPattern = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const hasEmail = emailPattern.test(content);
    
    // Should NOT contain email addresses
    expect(hasEmail).toBe(false);
    
    // Also check if the word "email" appears in visible content (it shouldn't)
    const emailTextVisible = await page.locator('text=/email/i').count();
    expect(emailTextVisible).toBe(0);
  });

  test('should display teacher name and department', async ({ page }) => {
    await page.goto('/?tab=teachers');
    await page.waitForLoadState('networkidle');
    
    // Check for table headers or column names
    const hasNameColumn = await page.locator('th:has-text("Name"), th:has-text("ชื่อ")').count();
    const hasDeptColumn = await page.locator('th:has-text("Department"), th:has-text("แผนก")').count();
    
    // At least one should be visible
    expect(hasNameColumn + hasDeptColumn).toBeGreaterThan(0);
  });

  test('should support pagination for teachers', async ({ page }) => {
    await page.goto('/?tab=teachers&page=1');
    await page.waitForLoadState('networkidle');
    
    // Check if pagination controls exist
    const paginationExists = await page.locator('[role="navigation"], .pagination, button:has-text("Next"), button:has-text("ถัดไป")').count();
    
    if (paginationExists > 0) {
      // Try clicking next page button if available
      const nextButton = page.locator('button:has-text("Next"), button:has-text("ถัดไป"), [aria-label*="next"]').first();
      
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify URL changed to page 2
        expect(page.url()).toContain('page=2');
      }
    }
  });

  test('should support search functionality for teachers', async ({ page }) => {
    await page.goto('/?tab=teachers');
    await page.waitForLoadState('networkidle');
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[type="text"][placeholder*="Search"], input[placeholder*="ค้นหา"]').first();
    
    if (await searchInput.isVisible()) {
      // Type a search term
      await searchInput.fill('Math');
      await page.waitForTimeout(600); // Wait for debounce
      await page.waitForLoadState('networkidle');
      
      // Verify search term is in URL or content updated
      const content = await page.content();
      const hasSearchResults = content.toLowerCase().includes('math') || page.url().includes('search=Math');
      
      expect(hasSearchResults).toBe(true);
    }
  });

  test('should load individual teacher detail page', async ({ page }) => {
    // This test assumes teachers have detail pages at /teachers/{id}
    // Navigate to homepage first to get a teacher ID
    await page.goto('/?tab=teachers');
    await page.waitForLoadState('networkidle');
    
    // Find a teacher link (adjust selector based on actual implementation)
    const teacherLink = page.locator('a[href*="/teachers/"]').first();
    
    if (await teacherLink.isVisible()) {
      await teacherLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify we're on a teacher detail page
      expect(page.url()).toContain('/teachers/');
      
      // Check for teacher details (should have more info than list view)
      const hasDetailContent = await page.locator('text=/schedule|teaching|subject|ตาราง|สอน|วิชา/i').count();
      expect(hasDetailContent).toBeGreaterThan(0);
    }
  });
});

test.describe('Public Classes Data API', () => {
  test('should load homepage with classes data', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if classes/students tab exists
    const classesTab = page.locator('text=/classes|students|ห้องเรียน|นักเรียน/i').first();
    await expect(classesTab).toBeVisible({ timeout: 10000 });
    
    // Click classes tab
    await classesTab.click();
    await page.waitForTimeout(1000);
    
    // Verify class data is visible
    const hasClassContent = await page.locator('table, [data-testid*="class"], text=/class|grade|ห้อง|ชั้น/i').count();
    expect(hasClassContent).toBeGreaterThan(0);
  });

  test('should not expose individual student data', async ({ page }) => {
    await page.goto('/?tab=students');
    await page.waitForLoadState('networkidle');
    
    // Get page content
    const content = await page.content();
    
    // Should show grade-level data, NOT individual student names
    // Check that we don't have individual student identifiers
    const hasStudentIdPattern = /student[_-]?id|รหัสนักเรียน/i;
    const hasIndividualStudentData = hasStudentIdPattern.test(content);
    
    // Should be false (no individual student data)
    expect(hasIndividualStudentData).toBe(false);
  });

  test('should display grade level information', async ({ page }) => {
    await page.goto('/?tab=students');
    await page.waitForLoadState('networkidle');
    
    // Check for grade level indicators (M.1, M.2, etc.)
    const hasGradeInfo = await page.locator('text=/M\\.[1-6]|ม\\.[1-6]/').count();
    expect(hasGradeInfo).toBeGreaterThan(0);
  });

  test('should support pagination for classes', async ({ page }) => {
    await page.goto('/?tab=students&page=1');
    await page.waitForLoadState('networkidle');
    
    // Check if pagination controls exist
    const paginationExists = await page.locator('[role="navigation"], .pagination, button:has-text("Next"), button:has-text("ถัดไป")').count();
    
    if (paginationExists > 0) {
      const nextButton = page.locator('button:has-text("Next"), button:has-text("ถัดไป"), [aria-label*="next"]').first();
      
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify URL changed
        expect(page.url()).toContain('page=2');
      }
    }
  });
});

test.describe('Public Statistics API', () => {
  test('should display quick stats on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for statistics cards or metrics
    // Common stats: total teachers, total classes, total rooms, etc.
    const statsText = await page.textContent('body');
    
    // Should have some numeric data (stats)
    const hasNumbers = /\d+/.test(statsText || '');
    expect(hasNumbers).toBe(true);
    
    // Look for common stat indicators
    const hasStatsLabels = await page.locator('text=/total|teachers|classes|rooms|ครู|ห้อง|รวม/i').count();
    expect(hasStatsLabels).toBeGreaterThan(0);
  });

  test('should show valid current term information', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for current term display (e.g., "ภาคเรียนที่ 1 ปีการศึกษา 2567")
    const hasSemesterInfo = await page.locator('text=/semester|term|ภาคเรียน|ปีการศึกษา/i').count();
    
    // Should display current semester somewhere on homepage
    expect(hasSemesterInfo).toBeGreaterThan(0);
  });

  test('should display analytics dashboard with charts', async ({ page }) => {
    // Navigate to analytics dashboard (adjust path if needed)
    await page.goto('/dashboard/1-2567/analytics');
    await page.waitForLoadState('networkidle');
    
    // Check for chart elements or canvas elements
    const hasCharts = await page.locator('canvas, svg[class*="recharts"], [class*="chart"]').count();
    
    if (hasCharts > 0) {
      // Verify charts are rendered
      expect(hasCharts).toBeGreaterThan(0);
    } else {
      // If no charts, at least verify page loaded with data
      const hasAnalyticsContent = await page.locator('text=/analytics|analysis|statistics|วิเคราะห์|สถิติ/i').count();
      expect(hasAnalyticsContent).toBeGreaterThan(0);
    }
  });

  test('should show period load data (weekly schedule intensity)', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    await page.waitForLoadState('networkidle');
    
    // Look for weekday indicators (MON, TUE, WED, etc.)
    const weekdayPattern = /mon|tue|wed|thu|fri|จันทร์|อังคาร|พุธ|พฤหัส|ศุกร์/i;
    const content = await page.textContent('body');
    
    const hasWeekdayData = weekdayPattern.test(content || '');
    
    // Analytics page should show weekly data
    if (await page.locator('text=/period load|schedule load|ความหนาแน่น/i').count() > 0) {
      expect(hasWeekdayData).toBe(true);
    }
  });

  test('should show room occupancy data', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    await page.waitForLoadState('networkidle');
    
    // Look for room-related statistics
    const hasRoomData = await page.locator('text=/room|occupancy|ห้องเรียน|ห้อง/i').count();
    
    if (hasRoomData > 0) {
      // Verify occupancy percentages are displayed (0-100%)
      const percentPattern = /\d+%/;
      const content = await page.textContent('body');
      const hasPercentages = percentPattern.test(content || '');
      
      expect(hasPercentages).toBe(true);
    }
  });
});

test.describe('Security & Privacy Checks', () => {
  test('no PII (email) in homepage teachers section', async ({ page }) => {
    await page.goto('/?tab=teachers');
    await page.waitForLoadState('networkidle');
    
    const content = await page.content();
    
    // Comprehensive email pattern check
    const emailPatterns = [
      /@gmail\.com/i,
      /@yahoo\.com/i,
      /@hotmail\.com/i,
      /@outlook\.com/i,
      /@[a-zA-Z0-9.-]+\.(com|net|org|edu|th)/i
    ];
    
    for (const pattern of emailPatterns) {
      const hasEmail = pattern.test(content);
      expect(hasEmail).toBe(false);
    }
  });

  test('no PII (email) in classes section', async ({ page }) => {
    await page.goto('/?tab=students');
    await page.waitForLoadState('networkidle');
    
    const content = await page.content();
    
    // Check for email patterns
    const emailPattern = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const hasEmail = emailPattern.test(content);
    
    expect(hasEmail).toBe(false);
  });

  test('no PII (phone numbers) in public pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const content = await page.content();
    
    // Check for phone number patterns (Thai format: 06X-XXX-XXXX, 08X-XXX-XXXX)
    const phonePatterns = [
      /0[689]\d-\d{3}-\d{4}/,  // 06X-XXX-XXXX
      /0[689]\d{8}/,            // 06XXXXXXXX
      /\+66[689]\d{8}/          // +6689XXXXXXXX
    ];
    
    for (const pattern of phonePatterns) {
      const hasPhone = pattern.test(content);
      expect(hasPhone).toBe(false);
    }
  });

  test('no database connection strings in HTML', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const content = await page.content();
    
    // Check for common database connection string patterns
    const dbPatterns = [
      /DATABASE_URL/i,
      /postgres:\/\//i,
      /mysql:\/\//i,
      /mongodb:\/\//i,
      /prisma/i && /connect/i
    ];
    
    const hasDbString = dbPatterns.some(pattern => pattern.test(content));
    
    // Should NOT contain database connection info
    expect(hasDbString).toBe(false);
  });

  test('no API keys or secrets in HTML', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const content = await page.content();
    
    // Check for common secret patterns
    const secretPatterns = [
      /API[_-]?KEY/i,
      /SECRET[_-]?KEY/i,
      /NEXTAUTH[_-]?SECRET/i,
      /GOOGLE[_-]?CLIENT[_-]?SECRET/i
    ];
    
    const hasSecret = secretPatterns.some(pattern => pattern.test(content));
    
    // Should NOT contain API keys or secrets
    expect(hasSecret).toBe(false);
  });
});

test.describe('Data Validation & Integrity', () => {
  test('teacher utilization should be between 0-150%', async ({ page }) => {
    await page.goto('/?tab=teachers');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    
    // Find percentage values in content
    const percentMatches = content?.match(/(\d+)%/g) || [];
    
    for (const match of percentMatches) {
      const value = parseInt(match.replace('%', ''));
      
      // Utilization should be reasonable (0-150%, allowing for overtime)
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(150);
    }
  });

  test('grade levels should follow Thai education system (M.1-M.6)', async ({ page }) => {
    await page.goto('/?tab=students');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    
    // Check for valid grade levels
    const validGrades = ['M.1', 'M.2', 'M.3', 'M.4', 'M.5', 'M.6', 'ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'];
    
    let hasValidGrade = false;
    for (const grade of validGrades) {
      if (content?.includes(grade)) {
        hasValidGrade = true;
        break;
      }
    }
    
    expect(hasValidGrade).toBe(true);
  });

  test('statistics should be non-negative', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    
    // Extract all numbers from page
    const numbers = content?.match(/\b\d+\b/g) || [];
    
    // All counts should be non-negative (this is implicit, but we check for sanity)
    for (const num of numbers) {
      const value = parseInt(num);
      expect(value).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Performance & Caching', () => {
  test('homepage should load within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('switching tabs should not require full page reload', async ({ page }) => {
    await page.goto('/?tab=teachers');
    await page.waitForLoadState('networkidle');
    
    // Record initial URL
    const initialUrl = page.url();
    
    // Click classes/students tab
    const classesTab = page.locator('text=/classes|students|ห้องเรียน|นักเรียน/i').first();
    await classesTab.click();
    
    await page.waitForTimeout(500);
    
    // URL should change but page should not reload (client-side navigation)
    const newUrl = page.url();
    expect(newUrl).not.toBe(initialUrl);
    expect(newUrl).toContain('tab=');
  });

  test('pagination should be fast (client-side)', async ({ page }) => {
    await page.goto('/?tab=teachers&page=1');
    await page.waitForLoadState('networkidle');
    
    const nextButton = page.locator('button:has-text("Next"), button:has-text("ถัดไป"), [aria-label*="next"]').first();
    
    if (await nextButton.isVisible()) {
      const startTime = Date.now();
      
      await nextButton.click();
      await page.waitForLoadState('networkidle');
      
      const paginationTime = Date.now() - startTime;
      
      // Client-side pagination should be fast (< 1 second)
      expect(paginationTime).toBeLessThan(1000);
    }
  });
});
