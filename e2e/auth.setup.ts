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

  // Navigate to custom sign-in page
  await page.goto('http://localhost:3000/signin');
  console.log('[AUTH SETUP] Navigated to signin page');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Click the "Dev Bypass (Testing)" button
  // This button is only visible when ENABLE_DEV_BYPASS=true
  const devBypassButton = page.getByRole('button', { name: /Dev Bypass \(Testing\)/i });
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
  
  // Give a moment for useSemesterSync hook to execute and save to localStorage
  await page.waitForTimeout(1000);
  console.log('[AUTH SETUP] Semester 1-2567 should now be synced to localStorage');

  // Save authenticated state (including localStorage with semester selection) to file
  await page.context().storageState({ path: authFile });
  console.log(`[AUTH SETUP] Saved auth + semester state to ${authFile}`);
});
