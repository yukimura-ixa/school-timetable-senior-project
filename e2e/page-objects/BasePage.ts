/**
 * BasePage - Base Page Object Model
 * 
 * Provides common functionality for all page objects:
 * - Navigation helpers
 * - Wait utilities
 * - Error handling
 * - Snackbar/notification assertions
 * 
 * @module page-objects/BasePage
 */

import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly baseUrl: string;

  // Common UI elements
  readonly loadingSpinner: Locator;
  readonly snackbar: Locator;
  readonly snackbarMessage: Locator;

  constructor(page: Page, baseUrl: string = 'http://localhost:3000') {
    this.page = page;
    this.baseUrl = baseUrl;

    // Common selectors
    this.loadingSpinner = page.locator('[role="progressbar"]');
    this.snackbar = page.locator('.notistack-Snackbar, [role="alert"]');
    this.snackbarMessage = this.snackbar.locator('.notistack-MuiContent-default, .MuiAlert-message');
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string) {
    await this.page.goto(`${this.baseUrl}${path}`);
  }

  /**
   * Wait for page to be fully loaded (no loading spinners)
   */
  async waitForPageLoad() {
    // Use 'load' instead of 'networkidle' for faster tests
    // networkidle can timeout if there are polling requests
    await this.page.waitForLoadState('load');
    await expect(this.loadingSpinner).toBeHidden({ timeout: 10000 }).catch(() => {
      // Spinner might not exist, that's ok
    });
  }

  /**
   * Assert success notification appears
   */
  async assertSuccessNotification(message?: string) {
    await expect(this.snackbar).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(this.snackbarMessage).toContainText(message);
    }
  }

  /**
   * Assert error notification appears
   */
  async assertErrorNotification(message?: string) {
    await expect(this.snackbar).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(this.snackbarMessage).toContainText(message);
    }
  }

  /**
   * Wait for notification to disappear
   */
  async waitForNotificationToDisappear() {
    await expect(this.snackbar).toBeHidden({ timeout: 10000 });
  }

  /**
   * Take a screenshot for debugging
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `screenshots/${name}-${Date.now()}.png`,
      fullPage: true
    });
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for specific element to be visible
   */
  async waitForElement(locator: Locator, timeout: number = 10000) {
    await expect(locator).toBeVisible({ timeout });
  }
}
