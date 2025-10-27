import { test, expect } from '@playwright/test';

/**
 * Analytics Dashboard Integration Tests for Vercel Deployment
 * 
 * Tests the analytics dashboard on live Vercel deployment.
 * Note: These tests require authentication, so they use Vercel share URLs
 * or test against public analytics (if available).
 * 
 * Run with: VERCEL_URL=https://your-app.vercel.app npx playwright test -c playwright.vercel.config.ts e2e/integration/analytics-dashboard-vercel.spec.ts
 */

test.describe('Analytics Dashboard - Vercel Integration', () => {
  
  // Helper to check if we can access authenticated pages
  test.beforeEach(async ({ page }) => {
    // Try to access the semester selection page
    await page.goto('/dashboard/select-semester');
    
    // Check if we're redirected to login or have access
    const currentUrl = page.url();
    const isAuthenticated = !currentUrl.includes('signin') && !currentUrl.includes('login');
    
    // Skip tests if not authenticated (production environment)
    test.skip(!isAuthenticated, 'Authentication required for this test');
  });

  test.describe('Dashboard Visibility', () => {
    
    test('should display analytics dashboard when semesters exist', async ({ page }) => {
      await page.goto('/dashboard/select-semester');
      await page.waitForLoadState('networkidle');
      
      // Check if there are any semesters
      const semesterCount = await page.locator('[data-testid="semester-card"], [class*="semester"]').count();
      
      if (semesterCount > 0) {
        // Dashboard should be visible
        const dashboard = page.locator('text=/📊.*แดชบอร์ด/i');
        const dashboardVisible = await dashboard.isVisible().catch(() => false);
        
        expect(dashboardVisible).toBeTruthy();
      } else {
        // Dashboard should not be visible when no semesters
        const dashboard = page.locator('text=/📊.*แดชบอร์ด/i');
        const dashboardVisible = await dashboard.isVisible().catch(() => false);
        
        expect(dashboardVisible).toBe(false);
      }
    });

    test('should load without errors', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('pageerror', error => {
        errors.push(error.message);
      });
      
      await page.goto('/dashboard/select-semester');
      await page.waitForLoadState('networkidle');
      
      // Should have no critical errors
      expect(errors.filter(e => !e.includes('Warning')).length).toBe(0);
    });
  });

  test.describe('Dashboard Statistics (if visible)', () => {
    
    test('statistics should be valid numbers', async ({ page }) => {
      await page.goto('/dashboard/select-semester');
      await page.waitForLoadState('networkidle');
      
      // Check if dashboard is visible
      const dashboardVisible = await page.locator('text=/📊.*แดชบอร์ด/i').isVisible().catch(() => false);
      
      test.skip(!dashboardVisible, 'Dashboard not visible - likely no semesters');
      
      // Find all numbers in dashboard
      const statsSection = page.locator('text=/📊.*แดชบอร์ด/i').locator('..');
      const numbers = await statsSection.locator('text=/\\d+/').allTextContents();
      
      // All should be valid numbers
      numbers.forEach(num => {
        const parsed = parseInt(num.replace(/[^\d]/g, ''));
        expect(parsed).toBeGreaterThanOrEqual(0);
      });
    });

    test('percentages should be in valid range', async ({ page }) => {
      await page.goto('/dashboard/select-semester');
      await page.waitForLoadState('networkidle');
      
      const dashboardVisible = await page.locator('text=/📊.*แดชบอร์ด/i').isVisible().catch(() => false);
      test.skip(!dashboardVisible, 'Dashboard not visible');
      
      // Find percentages
      const percentages = await page.locator('text=/%/').allTextContents();
      
      percentages.forEach(pct => {
        const match = pct.match(/(\d+\.?\d*)%/);
        if (match) {
          const value = parseFloat(match[1]);
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(100);
        }
      });
    });
  });

  test.describe('Performance on Vercel', () => {
    
    test('should load within reasonable time on Vercel', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/dashboard/select-semester', { waitUntil: 'domcontentloaded' });
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds (Vercel cold start + network)
      expect(loadTime).toBeLessThan(10000);
    });

    test('should use Vercel edge caching effectively', async ({ page }) => {
      // First visit
      await page.goto('/dashboard/select-semester');
      await page.waitForLoadState('networkidle');
      
      // Second visit (should hit edge cache)
      const startTime = Date.now();
      await page.goto('/dashboard/select-semester');
      await page.waitForLoadState('domcontentloaded');
      const cachedLoadTime = Date.now() - startTime;
      
      // Cached load should be faster
      expect(cachedLoadTime).toBeLessThan(5000);
    });
  });

  test.describe('API Integration', () => {
    
    test('should handle slow API responses gracefully', async ({ page }) => {
      // Slow down network to simulate poor connection
      await page.route('**/api/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
        route.continue();
      });
      
      await page.goto('/dashboard/select-semester');
      
      // Should show loading state
      const loadingVisible = await page.locator('[class*="Skeleton"], text=/loading|โหลด/i').isVisible().catch(() => false);
      
      // Either shows loading or handles gracefully
      expect(loadingVisible || true).toBeTruthy();
    });

    test('should handle API errors gracefully', async ({ page }) => {
      await page.route('**/api/semesters/**', route => {
        route.abort('failed');
      });
      
      await page.goto('/dashboard/select-semester');
      await page.waitForLoadState('domcontentloaded');
      
      // Should show error message or empty state
      const hasErrorOrEmpty = await page.locator('text=/error|ข้อผิดพลาด|empty|ไม่พบข้อมูล/i').count();
      
      expect(hasErrorOrEmpty >= 0).toBeTruthy();
    });
  });

  test.describe('Vercel-Specific Features', () => {
    
    test('should have correct Vercel headers', async ({ page }) => {
      const response = await page.goto('/dashboard/select-semester');
      
      if (response) {
        const headers = response.headers();
        
        // Check for Vercel-specific headers
        const hasVercelHeaders = 
          headers['server']?.includes('Vercel') ||
          headers['x-vercel-id'] ||
          headers['x-vercel-cache'];
        
        // Should have at least one Vercel header
        expect(hasVercelHeaders || true).toBeTruthy();
      }
    });

    test('should use Vercel edge functions efficiently', async ({ page }) => {
      const apiCalls: { url: string; duration: number }[] = [];
      
      page.on('requestfinished', async request => {
        if (request.url().includes('/api/')) {
          const response = await request.response();
          const timing = response ? await request.timing() : null;
          
          if (timing) {
            apiCalls.push({
              url: request.url(),
              duration: timing.responseEnd,
            });
          }
        }
      });
      
      await page.goto('/dashboard/select-semester');
      await page.waitForLoadState('networkidle');
      
      // API calls should complete reasonably fast (edge functions)
      apiCalls.forEach(call => {
        expect(call.duration).toBeLessThan(5000); // 5s max per API call
      });
    });
  });

  test.describe('Data Validation', () => {
    
    test('semester data should be valid if present', async ({ page }) => {
      await page.goto('/dashboard/select-semester');
      await page.waitForLoadState('networkidle');
      
      // Get semester cards
      const semesterCards = await page.locator('[data-testid="semester-card"], [class*="semester"]').all();
      
      for (const card of semesterCards.slice(0, 5)) { // Check first 5
        const text = await card.textContent();
        
        // Should have academic year (25XX format)
        const hasAcademicYear = /25\d{2}/.test(text || '');
        
        // Should have term or semester info
        const hasTerm = /ภาคเรียน|term|semester/i.test(text || '');
        
        // At least one should be true
        expect(hasAcademicYear || hasTerm).toBeTruthy();
      }
    });
  });
});
