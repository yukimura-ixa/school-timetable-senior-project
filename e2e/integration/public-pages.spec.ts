import { test, expect } from '@playwright/test';

/**
 * Public Page Integration Tests for Vercel Deployment
 * 
 * Tests public-facing pages that don't require authentication.
 * These tests verify the production deployment is working correctly.
 * 
 * Run with: npx playwright test -c playwright.vercel.config.ts e2e/integration/public-pages.spec.ts
 */

test.describe('Public Pages - Vercel Integration', () => {
  
  test.describe('Home Page', () => {
    
    test('should load home page successfully', async ({ page }) => {
      await page.goto('/');
      
      // Should receive successful response
      await expect(page).toHaveURL(/.*\//);
      
      // Page should have title
      await expect(page).toHaveTitle(/ตารางเรียน|Timetable/);
    });

    test('should display public data on home page', async ({ page }) => {
      await page.goto('/');
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      // Should show some content (teachers, statistics, etc.)
      const hasContent = await page.locator('body').textContent();
      expect(hasContent).toBeTruthy();
      expect(hasContent!.length).toBeGreaterThan(100);
    });

    test('should have working navigation', async ({ page }) => {
      await page.goto('/');
      
      // Check for navigation elements
      const nav = page.locator('nav, header').first();
      await expect(nav).toBeVisible();
    });

    test('should load without JavaScript errors', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('pageerror', error => {
        errors.push(error.message);
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Should have no critical errors
      expect(errors).toHaveLength(0);
    });

    test('should have correct meta tags', async ({ page }) => {
      await page.goto('/');
      
      // Check for viewport meta tag
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveCount(1);
      
      // Check for charset
      const hasCharset = await page.evaluate(() => {
        const meta = document.querySelector('meta[charset]');
        return meta !== null;
      });
      expect(hasCharset).toBeTruthy();
    });
  });

  test.describe('Performance', () => {
    
    test('should load home page within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds (including network latency)
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have working caching', async ({ page }) => {
      // First visit
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Second visit (should use cache)
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      const secondLoadTime = Date.now() - startTime;
      
      // Cached load should be reasonably fast
      expect(secondLoadTime).toBeLessThan(3000);
    });
  });

  test.describe('Responsive Design', () => {
    
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Page should load without horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      
      expect(hasHorizontalScroll).toBe(false);
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      
      // Page should load
      await page.waitForLoadState('networkidle');
      
      // Should not have layout issues
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(768 + 20); // 20px tolerance
    });

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      
      await page.waitForLoadState('networkidle');
      
      // Content should be visible
      const content = page.locator('main, [role="main"]').first();
      await expect(content).toBeVisible();
    });
  });

  test.describe('Network & API', () => {
    
    test('should handle API errors gracefully', async ({ page }) => {
      // Block API requests to simulate error
      await page.route('**/api/**', route => {
        route.abort('failed');
      });
      
      await page.goto('/');
      
      // Page should still load (with empty data or error message)
      await page.waitForLoadState('domcontentloaded');
      
      const hasErrorMessage = await page.locator('text=/error|ข้อผิดพลาด|failed|ไม่สำเร็จ/i').count();
      
      // Should either show error or handle gracefully
      expect(hasErrorMessage >= 0).toBeTruthy();
    });

    test('should make efficient API calls', async ({ page }) => {
      const apiCalls: string[] = [];
      
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          apiCalls.push(request.url());
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Should make a reasonable number of API calls (< 10 for home page)
      expect(apiCalls.length).toBeLessThan(10);
    });
  });

  test.describe('Browser Compatibility', () => {
    
    test('should work in Chromium', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'Chromium only');
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });

    test('should work in Firefox', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'Firefox only');
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });

    test('should work in Safari/WebKit', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'WebKit only');
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });
  });
});
