import { test, expect } from '@playwright/test';

/**
 * TC-001 & TC-002: Home Page and Authentication Tests
 * 
 * REFACTORED: Phase 1 - Playwright Best Practices
 * - ✅ Replaced manual waits with web-first assertions
 * - ✅ Using data-testid selectors instead of text patterns
 * - ✅ Using expect().toBeVisible() auto-waiting
 * - ✅ Removed waitForTimeout() and unnecessary waitForLoadState()
 * 
 * These tests verify:
 * - Home page loads correctly
 * - Sign-in page is accessible
 * - Protected routes redirect to sign-in
 */

test.describe('Home Page and Basic Navigation', () => {
  test('TC-001-01: Home page loads successfully', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/screenshots/01-home-page.png', fullPage: true });
    
    // Verify page loaded using web-first assertions (auto-waits)
    await expect(page).toHaveURL('/');
    
    // ✅ IMPROVED: Use data-testid for stable selector
    await expect(page.getByTestId('sign-in-button')).toBeVisible();
    
    // ✅ IMPROVED: Check for teachers and classes tabs
    await expect(page.getByTestId('teachers-tab')).toBeVisible();
    await expect(page.getByTestId('classes-tab')).toBeVisible();
  });

  test('TC-001-02: Sign-in page is accessible', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto('/signin');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/screenshots/02-signin-page.png', fullPage: true });
    
    // ✅ IMPROVED: Use web-first assertion instead of manual URL check
    await expect(page).toHaveURL(/\/signin/);
    
    // ✅ IMPROVED: Use role-based selector for accessibility
    // Note: This assumes the sign-in button has proper ARIA role
    // If not, add data-testid to the component
    const signInButton = page.getByRole('button', { name: /sign in|google|เข้าสู่ระบบ/i });
    await expect(signInButton).toBeVisible();
  });

  test('TC-002: Protected routes redirect to sign-in', async ({ page }) => {
    // List of protected routes to test
    const protectedRoutes = [
      '/management/teacher',
      '/management/subject',
      '/management/rooms',
      '/dashboard/select-semester',
    ];

    for (const route of protectedRoutes) {
      // Navigate to protected route
      await page.goto(route);
      
      // ✅ IMPROVED: Use web-first assertion instead of waitForTimeout
      // Wait for either redirect to signin or auth error message
      await expect(async () => {
        const url = page.url();
        const isOnSignIn = url.includes('/signin') || url.includes('/api/auth');
        expect(isOnSignIn).toBe(true);
      }).toPass({ timeout: 5000 });
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/screenshots/03-protected-${route.replace(/\//g, '-')}.png`,
        fullPage: true 
      });
      
      // Document the actual behavior
      console.log(`Route ${route} -> ${page.url()}`);
    }
  });
});
