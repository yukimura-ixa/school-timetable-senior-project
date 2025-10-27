#!/usr/bin/env node
/**
 * Production Dashboard Visual Testing Script
 * Tests admin dashboard functionality on Vercel deployment
 * Uses Chromium browser automation
 */

import { chromium } from 'playwright';

const PROD_URL = 'https://phrasongsa-timetable.vercel.app';
const ADMIN_EMAIL = 'admin@school.local';
const ADMIN_PASSWORD = 'admin';

async function testDashboard() {
  console.log('🚀 Starting Production Dashboard Test...\n');
  
  const browser = await chromium.launch({
    headless: false, // Show browser window
    slowMo: 500, // Slow down for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to signin page
    console.log('📍 Step 1: Navigating to signin page...');
    await page.goto(`${PROD_URL}/signin`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/01-signin-page.png' });
    console.log('✅ Signin page loaded\n');

    // Step 2: Check for responsive width bug at different sizes
    console.log('🔍 Step 2: Checking for responsive width bug...');
    
    const viewportSizes = [
      { width: 375, name: 'Mobile' },
      { width: 768, name: 'Tablet' },
      { width: 1280, name: 'Desktop' },
    ];

    for (const size of viewportSizes) {
      await page.setViewportSize({ width: size.width, height: 720 });
      await page.waitForTimeout(500);
      
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      if (bodyWidth > viewportWidth) {
        console.log(`❌ ${size.name} (${size.width}px): HORIZONTAL SCROLL - Body ${bodyWidth}px > Viewport ${viewportWidth}px`);
      } else {
        console.log(`✅ ${size.name} (${size.width}px): No scroll - Body ${bodyWidth}px <= Viewport ${viewportWidth}px`);
      }
    }

    // Reset to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Step 3: Check for nested main tags
    console.log('\n🔍 Step 3: Checking for nested main tags...');
    const mainTagCount = await page.evaluate(() => {
      return document.querySelectorAll('main').length;
    });
    
    if (mainTagCount > 1) {
      console.log(`❌ NESTED MAIN TAGS BUG: Found ${mainTagCount} <main> tags`);
    } else {
      console.log(`✅ No nested main tags: Found ${mainTagCount} <main> tag`);
    }

    // Step 4: Fill in login credentials
    console.log('\n📝 Step 4: Entering login credentials...');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.screenshot({ path: 'screenshots/02-credentials-entered.png' });
    console.log('✅ Credentials entered\n');

    // Step 5: Click login button
    console.log('🔐 Step 5: Clicking login button...');
    const loginButton = page.locator('button:has-text("เข้าสู่ระบบ")').first();
    await loginButton.click();
    
    // Wait for either navigation or error message
    await Promise.race([
      page.waitForURL('**/dashboard/**', { timeout: 5000 }).catch(() => null),
      page.waitForSelector('[role="alert"]', { timeout: 5000 }).catch(() => null),
      page.waitForTimeout(3000),
    ]);
    
    await page.screenshot({ path: 'screenshots/03-after-login.png' });
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    // Step 6: Check if redirected to dashboard
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Successfully logged in to dashboard!\n');
      
      // Step 7: Test navigation to key pages
      console.log('🗺️  Step 7: Testing dashboard navigation...\n');
      
      const routes = [
        { name: 'Teacher Table', path: '/dashboard/1-2567/teacher-table' },
        { name: 'Room Management', path: '/dashboard/1-2567/room' },
        { name: 'Subject Management', path: '/dashboard/1-2567/subject' },
        { name: 'Config', path: '/config' },
      ];

      for (const route of routes) {
        try {
          console.log(`  📄 Testing ${route.name}...`);
          await page.goto(`${PROD_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 10000 });
          
          // Check for errors
          const hasError = await page.evaluate(() => {
            return document.body.innerText.includes('Error') || 
                   document.body.innerText.includes('404') ||
                   document.body.innerText.includes('ไม่พบ');
          });

          if (hasError) {
            console.log(`  ❌ ${route.name}: Page shows error`);
          } else {
            console.log(`  ✅ ${route.name}: Loaded successfully`);
          }

          await page.screenshot({ path: `screenshots/04-${route.name.toLowerCase().replace(/\s+/g, '-')}.png` });
        } catch (error) {
          console.log(`  ❌ ${route.name}: Navigation failed - ${error.message}`);
        }
      }

    } else if (currentUrl.includes('/signin')) {
      console.log('❌ Login failed - still on signin page');
      console.log('   Check if credentials are correct or if there are validation errors');
      
      // Check for error messages
      const errorText = await page.evaluate(() => {
        const alerts = document.querySelectorAll('[role="alert"], .error, .MuiAlert-root');
        return Array.from(alerts).map(el => el.textContent).join(', ');
      });
      
      if (errorText) {
        console.log(`   Error message: ${errorText}`);
      }
    } else {
      console.log(`⚠️  Redirected to unexpected page: ${currentUrl}`);
    }

    // Step 8: Final summary
    console.log('\n📊 Test Summary:');
    console.log('================');
    console.log('Screenshots saved to screenshots/ directory');
    console.log('Review screenshots for visual bugs');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'screenshots/error.png' });
  } finally {
    console.log('\n⏸️  Pausing for 5 seconds for manual inspection...');
    await page.waitForTimeout(5000);
    
    await browser.close();
    console.log('✅ Browser closed. Test complete.');
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
