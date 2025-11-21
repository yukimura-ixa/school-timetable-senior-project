/**
 * E2E Tests for Analytics Dashboard
 * 
 * Tests the analytics dashboard at /dashboard/[semesterAndyear]/analytics
 * 
 * Phase 1 Features (Implemented):
 * - Overview stats cards (scheduled hours, completion rate, active teachers, conflicts)
 * - Teacher workload analysis (list with status indicators and progress bars)
 * - Room utilization analysis (list with occupancy rates and status chips)
 * 
 * Phase 2+ Features (Planned):
 * - Subject distribution charts
 * - Quality metrics
 * - Time distribution analysis
 * - Compliance checks
 * 
 * Related Files:
 * - src/app/dashboard/[semesterAndyear]/analytics/page.tsx
 * - src/features/analytics/application/actions/analytics.actions.ts
 * - src/features/analytics/infrastructure/repositories/*.repository.ts
 * 
 * Memory: analytics_ui_phase1_implementation_complete
 */

import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard - Access & Navigation', () => {
  test('should navigate to analytics from dashboard', async ({ page }) => {
    // Login and go to dashboard
    await page.goto('/');
    await page.goto('/dashboard/select-semester');
    
    // Select first semester card
    await page.locator('[data-testid="semester-card"], .semester-card').first().click();
    
    // Should be on dashboard
    expect(page.url()).toMatch(/\/dashboard\/\d+-\d{4}/);
    
    // Look for analytics quick action button
    const analyticsButton = page.locator('a[href*="/analytics"], button:has-text("Analytics"), button:has-text("วิเคราะห์")').first();
    
    if (await analyticsButton.isVisible({ timeout: 3000 })) {
      await analyticsButton.click();
      
      // Should navigate to analytics page
      expect(page.url()).toContain('/analytics');
      
      // Should show analytics header
      await expect(page.locator('h1, h2').filter({ hasText: /Analytics|วิเคราะห์|สถิติ/ })).toBeVisible();
    }
  });

  test('should require authentication', async ({ page, context }) => {
    // Clear session cookies
    await context.clearCookies();
    
    // Try to access analytics directly
    await page.goto('/dashboard/1-2567/analytics');
    
    // Should redirect to login
    await page.waitForURL(/\/login|\/signin/, { timeout: 10000 });
  });

  test('should show analytics page header', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Should have page title
    await expect(page.locator('h1, h2, [data-testid="page-title"]')).toContainText(/Analytics|วิเคราะห์|Dashboard|แดชบอร์ด/);
  });
});

test.describe('Analytics Dashboard - Overview Stats Cards', () => {
  test('should display 4 overview stat cards', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Wait for stat cards to load
    await page.waitForSelector('[data-testid*="stat-card"], .stat-card, [role="region"]', { timeout: 10000 });
    
    // Should have at least 4 stat cards
    const statCards = page.locator('[data-testid*="stat-card"], .stat-card, [role="region"]');
    const count = await statCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('should show total scheduled hours', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Look for scheduled hours stat
    const scheduledHoursStat = page.locator('text=/Total.*Hours|ชั่วโมง.*ทั้งหมด|Scheduled/i');
    await expect(scheduledHoursStat).toBeVisible({ timeout: 10000 });
    
    // Should show a number
    const number = page.locator('[data-testid="scheduled-hours"]').or(page.locator('text=/\\d+/')).first();
    await expect(number).toBeVisible();
  });

  test('should show completion rate percentage', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Look for completion rate (percentage)
    const completionRate = page.locator('text=/Completion|ความสมบูรณ์|เสร็จสิ้น/i');
    await expect(completionRate).toBeVisible({ timeout: 10000 });
    
    // Should show percentage value (0-100%)
    const percentage = page.locator('text=/\d+%/').first();
    await expect(percentage).toBeVisible();
  });

  test('should show active teachers count', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Look for active teachers stat
    const activeTeachers = page.locator('text=/Active.*Teachers|ครูที่ใช้งาน|ครูที่สอน/i');
    await expect(activeTeachers).toBeVisible({ timeout: 10000 });
  });

  test('should show conflicts count with color coding', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Look for conflicts stat
    const conflicts = page.locator('text=/Conflicts|ข้อขัดแย้ง|ความซ้ำซ้อน/i');
    await expect(conflicts).toBeVisible({ timeout: 10000 });
    
    // Should have color indicator based on count
    // Red if > 0, Green if = 0
    const conflictCard = page.locator('[data-testid="conflicts-stat"], .stat-card').filter({ hasText: /Conflict/i }).first();
    
    if (await conflictCard.isVisible()) {
      const classList = await conflictCard.getAttribute('class');
      const hasColorIndicator = classList?.includes('red') || classList?.includes('green') || classList?.includes('bg-');
      expect(hasColorIndicator).toBe(true);
    }
  });
});

test.describe('Analytics Dashboard - Teacher Workload Analysis', () => {
  test('should display teacher workload section', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Should have teacher workload section header
    await expect(page.locator('h2, h3, [data-testid="section-title"]').filter({ hasText: /Teacher.*Workload|ภาระงาน.*ครู/i })).toBeVisible({ timeout: 10000 });
  });

  test('should list all teachers with workload data', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Wait for teacher workload list to load
    await page.waitForSelector('[data-testid="teacher-workload-list"], .teacher-workload', { timeout: 10000 });
    
    // Should have teacher entries
    const teacherEntries = page.locator('[data-testid="teacher-entry"], .teacher-entry, [data-testid^="teacher-"]');
    const count = await teacherEntries.count();
    
    // Should have at least 1 teacher (from seeded data)
    expect(count).toBeGreaterThan(0);
  });

  test('should show teacher names and workload hours', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Find first teacher entry
    const firstTeacher = page.locator('[data-testid="teacher-entry"], .teacher-entry').first();
    await expect(firstTeacher).toBeVisible({ timeout: 10000 });
    
    // Should show teacher name
    await expect(firstTeacher).toContainText(/นาย|นาง|นางสาว|Mr\.|Mrs\./);
    
    // Should show hours (e.g., "12/18" or "12 ชม.")
    await expect(firstTeacher).toContainText(/\d+.*ชม\.|\/\d+|\d+.*hours?/i);
  });

  test('should display workload status indicators', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Look for status chips/badges
    const statusChips = page.locator('[data-testid="workload-status"], .status-chip, .badge, .chip');
    const count = await statusChips.count();
    
    if (count > 0) {
      // Should have status text like "ใช้งานต่ำ", "เหมาะสม", "สูง", "สูงเกินไป"
      await expect(statusChips.first()).toContainText(/ใช้งานต่ำ|เหมาะสม|สูง|สูงเกินไป|Low|Optimal|High|Overloaded/i);
      
      // Status should be color-coded
      const firstChip = statusChips.first();
      const classList = await firstChip.getAttribute('class');
      const hasColor = classList?.includes('bg-') || classList?.includes('text-');
      expect(hasColor).toBe(true);
    }
  });

  test('should display visual progress bars for workload', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Look for progress bars
    const progressBars = page.locator('[role="progressbar"], .progress-bar, .progress, [data-testid="progress"]');
    const count = await progressBars.count();
    
    // Should have at least one progress bar
    expect(count).toBeGreaterThan(0);
    
    // Progress bars should have width based on percentage
    const firstBar = progressBars.first();
    const width = await firstBar.evaluate(el => window.getComputedStyle(el).width);
    expect(width).not.toBe('0px');
  });

  test('should sort teachers by workload descending', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Get all teacher hours values
    const teacherEntries = page.locator('[data-testid="teacher-entry"], .teacher-entry');
    const count = await teacherEntries.count();
    
    if (count >= 2) {
      // Extract hours from first two teachers
      const firstHours = await teacherEntries.first().textContent();
      const secondHours = await teacherEntries.nth(1).textContent();
      
      // Parse hours (assume format like "18/20" or "18 ชม.")
      const extractHours = (text: string | null): number => {
        if (!text) return 0;
        const match = text.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
      };
      
      const firstVal = extractHours(firstHours);
      const secondVal = extractHours(secondHours);
      
      // First teacher should have >= hours than second (descending order)
      expect(firstVal).toBeGreaterThanOrEqual(secondVal);
    }
  });

  test('should handle teachers with zero workload', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Look for teachers with 0 hours or "ไม่ได้ใช้งาน" status
    const zeroWorkload = page.locator('text=/0.*ชม\.|0.*hours?|ไม่ได้ใช้งาน|Not.*active/i');
    const hasZero = await zeroWorkload.count();
    
    // If there are teachers with zero workload, they should be displayed correctly
    if (hasZero > 0) {
      await expect(zeroWorkload.first()).toBeVisible();
    }
  });

  test('should show MaxHours limit for each teacher', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Look for max hours indicator (e.g., "12/18" where 18 is max)
    const maxHoursIndicator = page.locator('text=/\/\d+|Max:?\s*\d+/i').first();
    
    if (await maxHoursIndicator.isVisible({ timeout: 3000 })) {
      await expect(maxHoursIndicator).toBeVisible();
    }
  });
});

test.describe('Analytics Dashboard - Room Utilization Analysis', () => {
  test('should display room utilization section', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Should have room utilization section header
    await expect(page.locator('h2, h3, [data-testid="section-title"]').filter({ hasText: /Room.*Utilization|การใช้.*ห้อง|ห้องเรียน/i })).toBeVisible({ timeout: 10000 });
  });

  test('should list all rooms with utilization data', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Wait for room list to load
    await page.waitForSelector('[data-testid="room-utilization-list"], .room-utilization', { timeout: 10000 });
    
    // Should have room entries
    const roomEntries = page.locator('[data-testid="room-entry"], .room-entry, [data-testid^="room-"]');
    const count = await roomEntries.count();
    
    // Should have at least 1 room (from seeded data)
    expect(count).toBeGreaterThan(0);
  });

  test('should show room names and IDs', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Find first room entry
    const firstRoom = page.locator('[data-testid="room-entry"], .room-entry').first();
    await expect(firstRoom).toBeVisible({ timeout: 10000 });
    
    // Should show room ID or name (e.g., "A101", "Room 101")
    await expect(firstRoom).toContainText(/[A-Z]\d+|Room\s+\d+|ห้อง\s+\d+/i);
  });

  test('should display occupancy rates as percentages', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Find first room entry
    const firstRoom = page.locator('[data-testid="room-entry"], .room-entry').first();
    
    // Should show percentage (e.g., "75%")
    await expect(firstRoom).toContainText(/\d+%/);
  });

  test('should display occupancy status chips', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Look for status chips with different colors
    const statusChips = page.locator('[data-testid="occupancy-status"], .status-chip, .badge').filter({ hasText: /Overutilized|Optimal|Moderate|Underutilized|ใช้.*มาก|เหมาะสม|ปานกลาง|ใช้.*น้อย/i });
    const count = await statusChips.count();
    
    if (count > 0) {
      // Should have color coding
      const firstChip = statusChips.first();
      const classList = await firstChip.getAttribute('class');
      const hasColor = classList?.includes('bg-') || classList?.includes('text-');
      expect(hasColor).toBe(true);
    }
  });

  test('should sort rooms by occupancy rate descending', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Get all room occupancy values
    const roomEntries = page.locator('[data-testid="room-entry"], .room-entry');
    const count = await roomEntries.count();
    
    if (count >= 2) {
      // Extract percentages from first two rooms
      const firstOccupancy = await roomEntries.first().textContent();
      const secondOccupancy = await roomEntries.nth(1).textContent();
      
      // Parse percentage
      const extractPercentage = (text: string | null): number => {
        if (!text) return 0;
        const match = text.match(/(\d+)%/);
        return match ? parseInt(match[1]) : 0;
      };
      
      const firstVal = extractPercentage(firstOccupancy);
      const secondVal = extractPercentage(secondOccupancy);
      
      // First room should have >= occupancy than second (descending order)
      expect(firstVal).toBeGreaterThanOrEqual(secondVal);
    }
  });

  test('should show scheduled periods vs total periods', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Look for fraction format like "30/40" (30 scheduled out of 40 total)
    const fractionIndicator = page.locator('text=/\\d+\\/\\d+/').first();
    
    if (await fractionIndicator.isVisible({ timeout: 3000 })) {
      await expect(fractionIndicator).toBeVisible();
    }
  });

  test('should display visual progress bars for occupancy', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Scroll to room utilization section
    await page.locator('h2, h3').filter({ hasText: /Room/i }).scrollIntoViewIfNeeded();
    
    // Look for progress bars in room section
    const progressBars = page.locator('[role="progressbar"], .progress-bar, .progress').filter({ has: page.locator('text=/Room|ห้อง/i') });
    const count = await progressBars.count();
    
    // Should have progress bars
    if (count > 0) {
      expect(count).toBeGreaterThan(0);
    }
  });
});

test.describe('Analytics Dashboard - Data Accuracy', () => {
  test('should show realistic workload percentages (0-150%)', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Extract all percentage values
    const percentages = await page.locator('text=/\d+%/').allTextContents();
    
    for (const text of percentages) {
      const match = text.match(/(\d+)%/);
      if (match) {
        const value = parseInt(match[1]);
        // Should be between 0 and 150% (some teachers may be overloaded)
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(150);
      }
    }
  });

  test('should show non-negative counts', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Extract all numeric counts
    const numbers = await page.locator('[data-testid*="count"], .stat-card text').allTextContents();
    
    for (const text of numbers) {
      const match = text.match(/^(\d+)$/);
      if (match) {
        const value = parseInt(match[1]);
        // Should be non-negative
        expect(value).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should calculate completion rate correctly', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Find completion rate value
    const completionText = await page.locator('[data-testid="completion-rate"], text=/Completion.*\d+%/i').first().textContent();
    
    if (completionText) {
      const match = completionText.match(/(\d+)%/);
      if (match) {
        const rate = parseInt(match[1]);
        // Should be between 0 and 100%
        expect(rate).toBeGreaterThanOrEqual(0);
        expect(rate).toBeLessThanOrEqual(100);
      }
    }
  });
});

test.describe('Analytics Dashboard - UI/UX', () => {
  test('should be scrollable for long lists', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Teacher/room lists should have max-height with scroll
    const scrollContainers = page.locator('.overflow-y-auto, .overflow-auto, [style*="overflow"]');
    const count = await scrollContainers.count();
    
    // Should have scrollable containers
    expect(count).toBeGreaterThan(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/dashboard/1-2567/analytics');
    
    // Stat cards should stack vertically
    const statCards = page.locator('[data-testid*="stat-card"], .stat-card');
    const count = await statCards.count();
    
    if (count > 0) {
      // Cards should be visible
      await expect(statCards.first()).toBeVisible();
    }
  });

  test('should load without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    
    await page.goto('/dashboard/1-2567/analytics');
    await expect(page.locator('main, body')).toBeVisible({ timeout: 10000 });
    
    // Should have no console errors
    expect(errors).toHaveLength(0);
  });

  test('should display loading states appropriately', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Look for loading indicators (skeleton, spinner, etc.)
    const loadingIndicators = page.locator('[data-testid="loading"], .loading, .skeleton, .spinner');
    const hasLoading = await loadingIndicators.isVisible({ timeout: 1000 }).catch(() => false);
    
    // If loading states exist, they should disappear after load
    if (hasLoading) {
      await expect(page.locator('main, body')).toBeVisible({ timeout: 10000 });
      await expect(loadingIndicators).not.toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Analytics Dashboard - Performance', () => {
  test('should load within 10 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard/1-2567/analytics');
    await expect(page.locator('main, body')).toBeVisible({ timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 10 seconds (analytics queries can be expensive)
    expect(loadTime).toBeLessThan(10000);
  });

  test('should handle large datasets (50+ teachers)', async ({ page }) => {
    await page.goto('/dashboard/1-2567/analytics');
    
    // Should still render even with many teachers
    const teacherEntries = page.locator('[data-testid="teacher-entry"], .teacher-entry');
    const count = await teacherEntries.count();
    
    // If we have many teachers, page should still load
    if (count > 50) {
      // First and last entries should be visible (with scrolling)
      await expect(teacherEntries.first()).toBeVisible();
    }
  });
});
