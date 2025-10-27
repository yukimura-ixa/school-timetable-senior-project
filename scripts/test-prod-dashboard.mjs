#!/usr/bin/env node
/**
 * Production Dashboard Visual Testing Script
 * Tests admin dashboard functionality on Vercel deployment
 * Uses Chromium browser automation
 */

import { chromium } from 'playwright';

const PROD_URL = 'https://phrasongsa-timetable.vercel.app';
const ADMIN_EMAIL = 'admin@school.local';
const ADMIN_PASSWORD = 'admin123';

async function testDashboard() {
  console.log('🚀 Starting Production Visual Bugs Test...\n');
  console.log('⚠️  Note: Production requires Google OAuth for login.');
  console.log('    Testing public pages and visual bugs instead.\n');
  
  const browser = await chromium.launch({
    headless: false, // Show browser window
    slowMo: 500, // Slow down for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  try {
    // Test 1: Homepage - Check responsive width and nested main tags
    console.log('═══════════════════════════════════════════════════');
    console.log('TEST 1: HOMEPAGE - Responsive Width & HTML Structure');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log('📍 Navigating to homepage...');
    await page.goto(`${PROD_URL}/`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/01-homepage.png', fullPage: true });
    console.log('✅ Homepage loaded\n');

    console.log('🔍 Checking responsive width at different viewport sizes...');
    
    const viewportSizes = [
      { width: 375, name: 'Mobile (iPhone)' },
      { width: 768, name: 'Tablet (iPad)' },
      { width: 1024, name: 'Laptop' },
      { width: 1280, name: 'Desktop' },
      { width: 1920, name: 'Large Desktop' },
    ];

    let horizontalScrollBugs = [];
    
    for (const size of viewportSizes) {
      await page.setViewportSize({ width: size.width, height: 720 });
      await page.waitForTimeout(500);
      
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      if (bodyWidth > viewportWidth + 5) { // 5px tolerance for scrollbar
        console.log(`❌ ${size.name} (${size.width}px): HORIZONTAL SCROLL`);
        console.log(`   Body: ${bodyWidth}px > Viewport: ${viewportWidth}px`);
        horizontalScrollBugs.push(size.name);
      } else {
        console.log(`✅ ${size.name} (${size.width}px): No scroll`);
      }
    }

    // Reset to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('\n🔍 Checking for nested <main> tags...');
    const mainTagCount = await page.evaluate(() => {
      return document.querySelectorAll('main').length;
    });
    
    if (mainTagCount > 1) {
      console.log(`❌ HTML SEMANTIC BUG: Found ${mainTagCount} <main> tags (should be exactly 1)`);
    } else {
      console.log(`✅ Correct HTML: Found ${mainTagCount} <main> tag`);
    }

    // Test 2: Teacher Links
    console.log('\n═══════════════════════════════════════════════════');
    console.log('TEST 2: TEACHER SCHEDULE LINKS');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log('📍 Checking teacher schedule links...');
    await page.goto(`${PROD_URL}/?tab=teachers`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/02-teachers-tab.png', fullPage: true });
    
    // Find first "ดูตาราง" link
    const teacherLinks = await page.locator('a:has-text("ดูตาราง")').all();
    
    if (teacherLinks.length > 0) {
      console.log(`✅ Found ${teacherLinks.length} teacher schedule links`);
      
      const firstLink = teacherLinks[0];
      const href = await firstLink.getAttribute('href');
      console.log(`   First link href: ${href}`);
      
      if (href?.includes('/dashboard/select-semester')) {
        console.log('❌ BUG: Links point to /dashboard/select-semester (admin route)');
        console.log('   Should point to: /teachers/[id]');
      } else if (href?.startsWith('/teachers/')) {
        console.log('✅ Links correctly point to public teacher view');
      } else {
        console.log(`⚠️  Unexpected link pattern: ${href}`);
      }
    } else {
      console.log('⚠️  No teacher schedule links found');
    }

    // Test 3: Charts Rendering
    console.log('\n═══════════════════════════════════════════════════');
    console.log('TEST 3: DATA VISUALIZATION - Charts');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log('📊 Checking charts rendering...');
    await page.goto(`${PROD_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for charts to render
    
    const chartElements = await page.locator('.recharts-wrapper, svg[class*="recharts"]').all();
    console.log(`Found ${chartElements.length} chart elements`);
    
    if (chartElements.length > 0) {
      for (let i = 0; i < Math.min(chartElements.length, 3); i++) {
        const box = await chartElements[i].boundingBox();
        if (box) {
          if (box.width < 10 || box.height < 10) {
            console.log(`❌ Chart ${i + 1}: Too small (${box.width}x${box.height}px) - likely width:0 bug`);
          } else {
            console.log(`✅ Chart ${i + 1}: Rendered properly (${box.width}x${box.height}px)`);
          }
        }
      }
    } else {
      console.log('⚠️  No chart elements found');
    }

    await page.screenshot({ path: 'screenshots/03-charts.png', fullPage: true });

    // Test 4: Sign-in Page
    console.log('\n═══════════════════════════════════════════════════');
    console.log('TEST 4: SIGN-IN PAGE - Auth UI');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log('� Navigating to signin page...');
    await page.goto(`${PROD_URL}/signin`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/04-signin-page.png' });
    
    // Check for dev bypass availability
    const bypassEnabled = await page.evaluate(() => {
      return fetch('/api/auth/dev-bypass-enabled')
        .then(res => res.json())
        .then(data => data.enabled)
        .catch(() => false);
    });
    
    console.log(`Auth mode: ${bypassEnabled ? '✅ Dev bypass enabled (local credentials work)' : '⚠️  Production mode (Google OAuth only)'}`);
    
    // Try credentials login if bypass is enabled
    if (bypassEnabled) {
      console.log('\n🔐 Attempting credentials login...');
      
      // Reset viewport to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`${PROD_URL}/signin`, { waitUntil: 'networkidle' });
      
      // Fill in credentials
      await page.fill('input[type="email"]', ADMIN_EMAIL);
      await page.fill('input[type="password"]', ADMIN_PASSWORD);
      await page.screenshot({ path: 'screenshots/05-credentials-filled.png' });
      
      // Click login button
      const loginButton = page.locator('button:has-text("เข้าสู่ระบบ")').first();
      await loginButton.click();
      
      // Wait for navigation
      await Promise.race([
        page.waitForURL('**/dashboard/**', { timeout: 5000 }),
        page.waitForTimeout(3000),
      ]);
      
      const currentUrl = page.url();
      await page.screenshot({ path: 'screenshots/06-after-login.png' });
      
      if (currentUrl.includes('/dashboard')) {
        console.log('✅ Successfully logged in to dashboard!');
        console.log(`   Current URL: ${currentUrl}\n`);
        
        // Test key dashboard pages
        console.log('🗺️  Testing dashboard pages...\n');
        
        const dashboardRoutes = [
          { name: 'Semester Selection', path: '/dashboard/select-semester' },
          { name: 'Teacher Table', path: '/dashboard/1-2567/teacher-table' },
          { name: 'Config', path: '/config' },
        ];

        for (const route of dashboardRoutes) {
          try {
            console.log(`  📄 ${route.name}...`);
            await page.goto(`${PROD_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 10000 });
            
            const hasError = await page.evaluate(() => {
              return document.body.innerText.includes('Error') || 
                     document.body.innerText.includes('404');
            });

            const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
            const viewportWidth = await page.evaluate(() => window.innerWidth);

            if (hasError) {
              console.log(`     ❌ Error on page`);
            } else if (bodyWidth > viewportWidth + 5) {
              console.log(`     ⚠️  Has horizontal scroll (${bodyWidth}px > ${viewportWidth}px)`);
            } else {
              console.log(`     ✅ Loaded successfully`);
            }

            await page.screenshot({ path: `screenshots/dash-${route.name.toLowerCase().replace(/\s+/g, '-')}.png` });
          } catch (error) {
            console.log(`     ❌ Failed: ${error.message}`);
          }
        }
      } else {
        console.log('❌ Login failed');
        const errorEl = await page.locator('[role="alert"]').first().textContent().catch(() => '');
        if (errorEl) console.log(`   Error: ${errorEl}`);
      }
    }
    
    // Check responsive width on signin page
    console.log('\n🔍 Checking signin page responsive width...');
    await page.goto(`${PROD_URL}/signin`, { waitUntil: 'networkidle' });
    for (const size of [{ width: 375, name: 'Mobile' }, { width: 768, name: 'Tablet' }]) {
      await page.setViewportSize({ width: size.width, height: 720 });
      await page.waitForTimeout(500);
      
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      if (bodyWidth > viewportWidth + 5) {
        console.log(`❌ ${size.name}: HORIZONTAL SCROLL (${bodyWidth}px > ${viewportWidth}px)`);
      } else {
        console.log(`✅ ${size.name}: No scroll`);
      }
    }

    // Final Summary
    console.log('\n\n═══════════════════════════════════════════════════');
    console.log('📊 PRODUCTION BUGS SUMMARY');
    console.log('═══════════════════════════════════════════════════\n');
    
    if (horizontalScrollBugs.length > 0) {
      console.log(`❌ HORIZONTAL SCROLL BUG on: ${horizontalScrollBugs.join(', ')}`);
      console.log('   Cause: Fixed width w-[1280px] in layout\n');
    } else {
      console.log('✅ No horizontal scroll bugs detected\n');
    }
    
    if (mainTagCount > 1) {
      console.log(`❌ NESTED MAIN TAGS: ${mainTagCount} <main> elements found`);
      console.log('   Cause: Both root layout and Content.tsx render <main>\n');
    } else {
      console.log('✅ No nested main tags\n');
    }
    
    console.log('📸 Screenshots saved to screenshots/ directory');
    console.log('   - 01-homepage.png (full page)');
    console.log('   - 02-teachers-tab.png (teacher list)');
    console.log('   - 03-charts.png (data visualizations)');
    console.log('   - 04-signin-page.png (auth page)');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'screenshots/error.png' });
  } finally {
    console.log('\n⏸️  Keeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    
    await browser.close();
    console.log('✅ Browser closed. Test complete.\n');
  }
}

// Create screenshots directory if it doesn't exist
import { mkdirSync } from 'fs';
try {
  mkdirSync('screenshots', { recursive: true });
} catch (err) {
  // Directory already exists
}

// Run the test
testDashboard().catch(console.error);
