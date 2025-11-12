/**
 * Authentication Setup for E2E Tests
 * 
 * This setup script runs once before all tests to establish an authenticated
 * session. It saves the authentication state to a JSON file that can be reused
 * by all subsequent tests, eliminating the need for repeated logins.
 * 
 * Uses the Dev Bypass authentication provider which is available on the custom
 * signin page when ENABLE_DEV_BYPASS=true in the environment. This provides
 * instant authentication as a mock admin user without requiring credentials.
 * 
 * Based on:
 * - Playwright best practices: https://playwright.dev/docs/auth
 * - Auth.js testing guide: https://authjs.dev/guides/testing
 * 
 * @see https://playwright.dev/docs/auth#reuse-signed-in-state
 */

import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/admin.json');

setup('authenticate as admin', async ({ page }) => {
  console.log('[AUTH SETUP] Starting authentication flow...');

  // Listen to console logs from the browser
  page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));

  // Navigate to custom sign-in page
  await page.goto('http://localhost:3000/signin');
  console.log('[AUTH SETUP] Navigated to signin page');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Check if we're already logged in (redirected to dashboard)
  if (page.url().includes('/dashboard')) {
    console.log('[AUTH SETUP] Already authenticated, skipping login');
    
    // Navigate to semester-specific dashboard
    await page.goto('http://localhost:3000/dashboard/1-2567');
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    
    // Wait for useSemesterSync hook to execute by checking localStorage
    console.log('[AUTH SETUP] Waiting for semester sync (already authenticated path)...');
    try {
      await page.waitForFunction(
        () => window.localStorage.getItem('semester-storage') !== null,
        { timeout: 20000 }
      );
      const storageValue = await page.evaluate(() => window.localStorage.getItem('semester-storage'));
      console.log('[AUTH SETUP] Semester synced to localStorage:', storageValue);
    } catch (error) {
      console.warn('[AUTH SETUP] Timeout waiting for semester-storage');
      const storageValue = await page.evaluate(() => window.localStorage.getItem('semester-storage'));
      console.log('[AUTH SETUP] Current storage value:', storageValue);
      
      if (!storageValue) {
        console.log('[AUTH SETUP] Manually setting semester-storage as fallback');
        await page.evaluate(() => {
          window.localStorage.setItem('semester-storage', JSON.stringify({
            state: { semester: '1-2567' },
            version: 0
          }));
        });
        const verifyStorage = await page.evaluate(() => window.localStorage.getItem('semester-storage'));
        console.log('[AUTH SETUP] Verified semester storage:', verifyStorage);
      }
    }
    
    // Save state and exit
    await page.context().storageState({ path: authFile });
    console.log(`[AUTH SETUP] Saved existing auth + semester state to ${authFile}`);
    return;
  }

  // Debug: Check what's on the page
  const pageContent = await page.content();
  console.log('[AUTH SETUP] Page title:', await page.title());
  console.log('[AUTH SETUP] Dev bypass button exists:', pageContent.includes('dev-bypass-button'));
  
  // Click the "Dev Bypass (Testing)" button using data-testid
  // This button is only visible when ENABLE_DEV_BYPASS=true
  const devBypassButton = page.getByTestId('dev-bypass-button');
  await expect(devBypassButton).toBeVisible({ timeout: 10000 });
  console.log('[AUTH SETUP] Found Dev Bypass button');

  // Click and wait for navigation (use domcontentloaded instead of load)
  const [response] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }),
    devBypassButton.click(),
  ]);
  console.log('[AUTH SETUP] Clicked Dev Bypass button and navigated');

  // Wait for page to be stable
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
  console.log('[AUTH SETUP] Page loaded');

  // Verify authentication was successful by checking for authenticated user indicator
  // Look for admin name or role display (E2E Admin, ผู้ดูแลระบบ, etc.)
  const adminIndicator = page.locator('text=/E2E Admin|ทดสอบ Admin|ผู้ดูแลระบบ|Admin/i').first();
  await expect(adminIndicator).toBeVisible({ timeout: 5000 });
  console.log('[AUTH SETUP] Authentication verified');

  // Pre-select semester by navigating to a semester-specific dashboard URL
  // The useSemesterSync hook will parse the URL and save to localStorage
  console.log('[AUTH SETUP] Pre-selecting semester (1-2567) via URL navigation...');
  await page.goto('http://localhost:3000/dashboard/1-2567');
  
  // Wait for page to finish loading and semester to sync
  await page.waitForLoadState('networkidle', { timeout: 20000 });
  
  // Wait for useSemesterSync hook to execute by checking localStorage
  console.log('[AUTH SETUP] Waiting for semester sync...');
  try {
    await page.waitForFunction(
      () => window.localStorage.getItem('semester-storage') !== null,
      { timeout: 20000 } // Increased to 20s to account for HMR/Fast Refresh delays
    );
    const storageValue = await page.evaluate(() => window.localStorage.getItem('semester-storage'));
    console.log('[AUTH SETUP] Semester synced to localStorage:', storageValue);
  } catch (error) {
    console.warn('[AUTH SETUP] Timeout waiting for semester-storage after 20s');
    
    // Check if page is still loading or if there are errors
    const currentUrl = page.url();
    const pageTitle = await page.title().catch(() => 'unknown');
    console.log('[AUTH SETUP] Current URL:', currentUrl);
    console.log('[AUTH SETUP] Page title:', pageTitle);
    
    // Check current localStorage state
    const allStorage = await page.evaluate(() => {
      const storage: Record<string, string | null> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) storage[key] = window.localStorage.getItem(key);
      }
      return storage;
    });
    console.log('[AUTH SETUP] All localStorage keys:', Object.keys(allStorage));
    
    const storageValue = allStorage['semester-storage'];
    if (!storageValue) {
      console.log('[AUTH SETUP] Manually setting semester-storage as fallback...');
      await page.evaluate(() => {
        const semesterData = {
          state: { semester: '1-2567' },
          version: 0
        };
        window.localStorage.setItem('semester-storage', JSON.stringify(semesterData));
        console.log('[BROWSER] Manually set semester-storage:', semesterData);
      });
      
      // Verify it was set
      const verifyStorage = await page.evaluate(() => window.localStorage.getItem('semester-storage'));
      console.log('[AUTH SETUP] Verified semester storage after manual set:', verifyStorage);
    } else {
      console.log('[AUTH SETUP] Semester storage already exists:', storageValue);
    }
  }

  // Save authenticated state (including localStorage with semester selection) to file
  await page.context().storageState({ path: authFile });
  console.log(`[AUTH SETUP] Saved auth + semester state to ${authFile}`);
});
