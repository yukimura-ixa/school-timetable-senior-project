import { test, expect } from '@playwright/test';

/**
 * Visual Inspection Test - Admin Flow
 * 
 * This test opens the app in headed mode for visual inspection.
 * Run with: pnpm playwright test visual-inspection.spec.ts --headed --debug
 * 
 * Or in UI mode: pnpm playwright test --ui
 */

test.describe('Visual Inspection - Admin User Journey', () => {
  test('01. Home page and sign-in', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('📍 Currently at:', page.url());
    console.log('👀 Inspect: Home page layout, sign-in button, navigation');
    
    // INTENTIONAL: Manual inspection delay (keep for visual testing)
    await page.waitForTimeout(2000);
    
    // Check for sign-in elements
    const signInButton = page.locator('text=/sign in/i').first();
    if (await signInButton.isVisible()) {
      console.log('✅ Sign-in button found');
    }
  });

  test('02. Navigate to dashboard (requires auth)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    console.log('📍 Currently at:', page.url());
    
    // If redirected to sign-in
    if (page.url().includes('signin')) {
      console.log('⚠️  Not authenticated - at sign-in page');
      console.log('💡 Manually sign in with: admin@school.local / admin123');
      
      // Wait for manual sign-in
      await page.waitForURL(url => !url.toString().includes('signin'), { timeout: 120000 });
      console.log('✅ Authenticated! Continuing...');
    }
    
    console.log('👀 Inspect: Dashboard layout, semester selector, navigation menu');
    // INTENTIONAL: Manual inspection delay (keep for visual testing)
    await page.waitForTimeout(3000);
  });

  test('03. Semester selection', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Handle auth redirect
    if (page.url().includes('signin')) {
      await page.waitForURL(url => !url.toString().includes('signin'), { timeout: 120000 });
    }
    
    console.log('📍 Dashboard loaded');
    console.log('👀 Inspect: Semester dropdown, year selector');
    
    // Look for semester selector
    const semesterSelector = page.locator('[data-testid="semester-selector"]').or(
      page.locator('select, [role="combobox"]').filter({ hasText: /2567|2568|ภาค/ })
    );
    
    if (await semesterSelector.isVisible()) {
      console.log('✅ Semester selector found');
    }
    
    // INTENTIONAL: Manual inspection delay (keep for visual testing)
    await page.waitForTimeout(3000);
  });

  test('04. Management - Teachers', async ({ page }) => {
    await page.goto('/management/teacher');
    await page.waitForLoadState('networkidle');
    
    // Handle auth
    if (page.url().includes('signin')) {
      await page.waitForURL(url => !url.toString().includes('signin'), { timeout: 120000 });
    }
    
    console.log('📍 Currently at:', page.url());
    console.log('👀 Inspect: Teacher list, add button, search, pagination');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-teacher-management.png',
      fullPage: true 
    });
    
    // INTENTIONAL: Manual inspection delay (keep for visual testing)
    await page.waitForTimeout(3000);
  });

  test('05. Management - Subjects', async ({ page }) => {
    await page.goto('/management/subject');
    await page.waitForLoadState('networkidle');
    
    // Handle auth
    if (page.url().includes('signin')) {
      await page.waitForURL(url => !url.toString().includes('signin'), { timeout: 120000 });
    }
    
    console.log('📍 Currently at:', page.url());
    console.log('👀 Inspect: Subject list, Thai curriculum codes, credit hours');
    
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-subject-management.png',
      fullPage: true 
    });
    
    // INTENTIONAL: Manual inspection delay (keep for visual testing)
    await page.waitForTimeout(3000);
  });

  test('06. Schedule Configuration', async ({ page }) => {
    const semester = '1-2567';
    await page.goto(`/schedule/${semester}/config`);
    await page.waitForLoadState('networkidle');
    
    // Handle auth
    if (page.url().includes('signin')) {
      await page.waitForURL(url => !url.toString().includes('signin'), { timeout: 120000 });
    }
    
    console.log('📍 Currently at:', page.url());
    console.log('👀 Inspect: Timeslot configuration, period setup, break times');
    
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-schedule-config.png',
      fullPage: true 
    });
    
    // INTENTIONAL: Manual inspection delay (keep for visual testing)
    await page.waitForTimeout(3000);
  });

  test('07. Teacher Arrangement Interface', async ({ page }) => {
    const semester = '1-2567';
    await page.goto(`/schedule/${semester}/arrange/teacher-arrange`);
    await page.waitForLoadState('networkidle');
    
    // Handle auth
    if (page.url().includes('signin')) {
      await page.waitForURL(url => !url.toString().includes('signin'), { timeout: 120000 });
    }
    
    console.log('📍 Currently at:', page.url());
    console.log('👀 Inspect:');
    console.log('  - Teacher selector dropdown (data-testid="teacher-selector")');
    console.log('  - Subject palette (data-testid="subject-list")');
    console.log('  - Timeslot grid (data-testid="timeslot-grid")');
    console.log('  - Save button (data-testid="save-button")');
    console.log('  - Drag-and-drop functionality');
    
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-teacher-arrange.png',
      fullPage: true 
    });
    
    // Highlight test IDs we added
    await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-testid]');
      elements.forEach(el => {
        const testId = el.getAttribute('data-testid');
        console.log(`Found test ID: ${testId}`);
        // Add visual highlight
        (el as HTMLElement).style.outline = '2px solid lime';
        (el as HTMLElement).style.outlineOffset = '2px';
      });
    });
    
    // INTENTIONAL: Extended manual inspection delay for complex UI (keep for visual testing)
    await page.waitForTimeout(5000);
  });

  test('08. Analytics Dashboard', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await page.waitForLoadState('networkidle');
    
    // Handle auth
    if (page.url().includes('signin')) {
      await page.waitForURL(url => !url.toString().includes('signin'), { timeout: 120000 });
    }
    
    console.log('📍 Currently at:', page.url());
    console.log('👀 Inspect: Charts, metrics, data visualization');
    
    await page.screenshot({ 
      path: 'test-results/screenshots/admin-analytics.png',
      fullPage: true 
    });
    
    // INTENTIONAL: Manual inspection delay (keep for visual testing)
    await page.waitForTimeout(3000);
  });

  test('09. Check Next.js DevTools', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('📍 Checking Next.js Dev Mode indicators...');
    
    // Check for Next.js dev mode indicators
    const isDev = await page.evaluate(() => {
      return (window as any).__NEXT_DATA__?.props?.pageProps || {};
    });
    
    console.log('Next.js Data:', isDev);
    
    // Check for React DevTools
    const hasReact = await page.evaluate(() => {
      return !!(window as any).React || !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    });
    
    console.log('React DevTools available:', hasReact);
    
    // Open browser console
    console.log('\n💡 Tips:');
    console.log('  - Press F12 to open browser DevTools');
    console.log('  - Check Console tab for errors/warnings');
    console.log('  - Check Network tab for API calls');
    console.log('  - Check React DevTools (if installed)');
    console.log('  - Check Next.js panel (if available)');
    
    // INTENTIONAL: Extended manual inspection delay (keep for visual testing)
    await page.waitForTimeout(5000);
  });
});

test.describe('Visual Inspection - Component Test IDs', () => {
  test('Verify all added test IDs are present', async ({ page }) => {
    const semester = '1-2567';
    await page.goto(`/schedule/${semester}/arrange/teacher-arrange`);
    await page.waitForLoadState('networkidle');
    
    // Handle auth
    if (page.url().includes('signin')) {
      console.log('⚠️  Waiting for manual authentication...');
      await page.waitForURL(url => !url.toString().includes('signin'), { timeout: 120000 });
    }
    
    console.log('\n🔍 Checking for test IDs we added...\n');
    
    const testIds = [
      'teacher-selector',
      'subject-list',
      'timeslot-grid',
      'save-button'
    ];
    
    for (const testId of testIds) {
      const element = page.locator(`[data-testid="${testId}"]`);
      const exists = await element.count() > 0;
      
      if (exists) {
        const isVisible = await element.first().isVisible({ timeout: 1000 }).catch(() => false);
        console.log(`✅ ${testId}: Found ${isVisible ? '(visible)' : '(hidden)'}`);
        
        // Highlight in browser
        if (isVisible) {
          await element.first().evaluate((el: Element) => {
            (el as HTMLElement).style.outline = '3px solid lime';
            (el as HTMLElement).style.outlineOffset = '3px';
          });
        }
      } else {
        console.log(`❌ ${testId}: NOT FOUND`);
      }
    }
    
    console.log('\n👀 Green outlines show elements with test IDs');
    // INTENTIONAL: Extended manual inspection delay for test ID verification (keep for visual testing)
    await page.waitForTimeout(10000);
  });
});
