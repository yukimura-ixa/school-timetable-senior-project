import { chromium } from '@playwright/test';

/**
 * Manual Visual Inspection Tool
 * 
 * Run with: pnpm tsx e2e/manual-inspection.ts
 * 
 * This opens a browser for you to manually inspect the app.
 * Highlights all elements with data-testid attributes.
 */

async function inspect() {
  console.log('🔍 Starting visual inspection tool...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down actions to see what's happening
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  console.log('📍 Navigating to home page...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  console.log('\n✅ Browser opened!');
  console.log('\n💡 Manual Inspection Guide:');
  console.log('  1. Sign in as admin: admin@school.local / admin123');
  console.log('  2. Navigate to: Management > Teachers');
  console.log('  3. Navigate to: Schedule > 1-2567 > Teacher Arrange');
  console.log('  4. Look for GREEN OUTLINES - these show data-testid elements');
  console.log('  5. Press F12 for DevTools');
  console.log('  6. Check Console for logs');
  console.log('  7. Check Network tab for API calls');
  console.log('\n🎯 Key Pages to Check:');
  console.log('  - /dashboard - Dashboard with semester selector');
  console.log('  - /management/teacher - Teacher management');
  console.log('  - /management/subject - Subject management');
  console.log('  - /schedule/1-2567/config - Schedule configuration');
  console.log('  - /schedule/1-2567/arrange/teacher-arrange - Teacher arrangement');
  console.log('  - /dashboard/analytics - Analytics dashboard');
  console.log('\n⏸️  Browser will stay open. Press Ctrl+C to close.');
  
  // Wait for sign-in
  console.log('\n⏳ Waiting for you to sign in...');
  await page.waitForURL(url => !url.toString().includes('signin'), { timeout: 300000 });
  console.log('✅ Signed in!');
  
  // Navigate to teacher arrange page
  console.log('\n📍 Navigating to teacher arrangement page...');
  await page.goto('http://localhost:3000/schedule/1-2567/arrange/teacher-arrange');
  await page.waitForLoadState('networkidle');
  
  // Highlight all test IDs
  console.log('\n🎨 Highlighting elements with data-testid...');
  await page.evaluate(() => {
    const elements = document.querySelectorAll('[data-testid]');
    console.log(`Found ${elements.length} elements with data-testid`);
    
    elements.forEach(el => {
      const testId = el.getAttribute('data-testid');
      console.log(`  - ${testId}`);
      (el as HTMLElement).style.outline = '3px solid lime';
      (el as HTMLElement).style.outlineOffset = '3px';
      
      // Add label
      const label = document.createElement('div');
      label.textContent = testId || '';
      label.style.cssText = `
        position: absolute;
        background: lime;
        color: black;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: bold;
        z-index: 10000;
        pointer-events: none;
      `;
      el.appendChild(label);
    });
  });
  
  console.log('\n✅ Elements highlighted!');
  console.log('👀 Green outlines and labels show data-testid elements');
  console.log('\n📋 Test IDs we added:');
  console.log('  - teacher-selector (SelectTeacher dropdown)');
  console.log('  - subject-list (SearchableSubjectPalette)');
  console.log('  - timeslot-grid (TimeSlot grid)');
  console.log('  - save-button (Save button)');
  
  // Keep browser open
  console.log('\n⏸️  Browser will stay open for inspection.');
  console.log('   Press Ctrl+C in terminal to close.');
  
  // Wait indefinitely
  await new Promise(() => {}); // Never resolves
}

inspect().catch(console.error);
