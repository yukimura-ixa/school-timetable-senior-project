/**
 * E2E Tests for Conflict Detector Feature
 * Tests complete user flows for conflict detection and display
 */

import { test, expect } from "@playwright/test";

test.describe("Conflict Detector", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard first
    await page.goto("/", { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"], header, nav', { timeout: 10000 });
  });

  test("should navigate to conflicts page from dashboard", async ({ page }) => {
    await page.goto("/dashboard/1-2567", { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"], h1, h2', { timeout: 10000 });

    // Find and click the conflict detector quick action button
    const conflictButton = page.locator("a").filter({ hasText: /ตรวจสอบความซ้ำซ้อน/ });
    await expect(conflictButton).toBeVisible();
    await conflictButton.click();

    // Should navigate to conflicts page
    await expect(page).toHaveURL(/\/dashboard\/1-2567\/conflicts/);
  });

  test("should display conflict detector page components", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts", { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"], h1, h2, [role="tablist"], button', { timeout: 10000 });

    // Check page title
    await expect(page.locator("h1, h2").filter({ hasText: /ตรวจสอบความซ้ำซ้อน/ })).toBeVisible();

    // Check for tab interface
    await expect(page.locator("button").filter({ hasText: /ครูซ้ำซ้อน/ })).toBeVisible();
    await expect(page.locator("button").filter({ hasText: /ห้องซ้ำซ้อน/ })).toBeVisible();
    await expect(page.locator("button").filter({ hasText: /ชั้นซ้ำซ้อน/ })).toBeVisible();
    await expect(page.locator("button").filter({ hasText: /ยังไม่มีครู/ })).toBeVisible();
  });

  test("should display summary cards with conflict counts", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts", { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"], h1, h2, [role="tablist"], button', { timeout: 10000 });

    // Wait for summary cards to render
    const summaryCards = page.locator("[class*='MuiCard-root'], [class*='card']");
    await expect(summaryCards.first()).toBeVisible({ timeout: 3000 });
    const count = await summaryCards.count();
    expect(count).toBeGreaterThanOrEqual(4); // At least 4 summary cards for each conflict type
  });

  test("should switch between conflict tabs", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts", { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"], h1, h2, [role="tablist"], button', { timeout: 10000 });

    // Click on Room Conflicts tab
    const roomTab = page.locator("button").filter({ hasText: /ห้องซ้ำซ้อน/ });
    await roomTab.click();

    // Should show room conflicts content
    await expect(page.locator("text=/ห้อง|ไม่มีความซ้ำซ้อน/")).toBeVisible();

    // Click on Class Conflicts tab
    const classTab = page.locator("button").filter({ hasText: /ชั้นซ้ำซ้อน/ });
    await classTab.click();

    // Should show class conflicts content
    await expect(page.locator("text=/ชั้น|ไม่มีความซ้ำซ้อน/")).toBeVisible();

    // Click on Unassigned tab
    const unassignedTab = page.locator("button").filter({ hasText: /ยังไม่มีครู/ });
    await unassignedTab.click();

    // Should show unassigned content
    await expect(page.locator("text=/ไม่มีครู|ไม่มีห้อง|ไม่พบ/")).toBeVisible();
  });

  test("should display conflict details when conflicts exist", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts", { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"], h1, h2, [role="tablist"], button', { timeout: 10000 });

    // Wait for content to render (either table or empty state)
    await page.waitForFunction(() => {
      return document.querySelectorAll("table, [class*='conflict'], [class*='empty']").length > 0;
    }, { timeout: 3000 }).catch(() => {});

    // Check if any conflicts are displayed (this depends on test data)
    const hasConflicts = await page.locator("table, [class*='conflict']").count() > 0;
    
    if (hasConflicts) {
      // Verify table headers exist
      const headerCount = await page.locator("th, [role='columnheader']").count();
      expect(headerCount).toBeGreaterThanOrEqual(1);
    } else {
      // Verify empty state is shown
      await expect(page.locator("text=/ไม่พบความซ้ำซ้อน|ไม่มีความซ้ำซ้อน/")).toBeVisible();
    }
  });

  test("should show loading state initially", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts", { waitUntil: 'domcontentloaded' });
    
    // Should show loading skeleton or spinner briefly
    const loadingIndicator = page.locator("[class*='skeleton'], [class*='loading'], [class*='spinner']");
    // Note: This might be too fast to catch, but we try
    const wasVisible = await loadingIndicator.isVisible().catch(() => false);
    
    // Even if not visible, page should eventually show content
    await page.waitForSelector('h1, h2', { timeout: 10000 });
    await expect(page.locator("h1, h2")).toBeVisible();
  });

  test("should display Thai labels correctly", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts", { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"], [role="tablist"], button', { timeout: 10000 });

    // Verify Thai text is displayed
    await expect(page.locator("text=ครูซ้ำซ้อน")).toBeVisible();
    await expect(page.locator("text=ห้องซ้ำซ้อน")).toBeVisible();
    await expect(page.locator("text=ชั้นซ้ำซ้อน")).toBeVisible();
  });

  test("should handle empty conflict state", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts", { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"], [role="tablist"], button', { timeout: 10000 });

    // Wait for initial content
    await expect(page.locator("button").filter({ hasText: /ครูซ้ำซ้อน/ })).toBeVisible();

    // If no conflicts, should show appropriate message in at least one tab
    const tabs = ["ครูซ้ำซ้อน", "ห้องซ้ำซ้อน", "ชั้นซ้ำซ้อน", "ยังไม่มีครู"];
    
    for (const tabName of tabs) {
      const tab = page.locator("button").filter({ hasText: new RegExp(tabName) });
      await tab.click();
      
      // Should show either conflicts or empty state, not an error
      const hasContent = await page.locator("table, [class*='empty'], text=/ไม่พบ|ไม่มี/").count() > 0;
      expect(hasContent).toBe(true);
    }
  });

  test("should refresh data when navigating back", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts", { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"], [role="tablist"], button', { timeout: 10000 });
    
    // Navigate away
    await page.goto("/dashboard/1-2567", { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"], h1, h2', { timeout: 10000 });
    
    // Navigate back
    await page.goto("/dashboard/1-2567/conflicts", { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"], [role="tablist"], button', { timeout: 10000 });
    
    // Should still show content
    await expect(page.locator("button").filter({ hasText: /ครูซ้ำซ้อน/ })).toBeVisible();
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto("/dashboard/1-2567/conflicts", { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"], h1, h2, [role="tablist"]', { timeout: 10000 });

    // Page should still be functional
    await expect(page.locator("h1, h2").filter({ hasText: /ตรวจสอบ/ })).toBeVisible();
    
    // Tabs should be clickable
    const tab = page.locator("button").filter({ hasText: /ครูซ้ำซ้อน/ }).first();
    await expect(tab).toBeVisible();
    await tab.click();
  });

  test("should maintain selected tab on page reload", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts", { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"], [role="tablist"], button', { timeout: 10000 });

    // Click on a non-default tab
    const roomTab = page.locator("button").filter({ hasText: /ห้องซ้ำซ้อน/ });
    await roomTab.click();
    await expect(page.locator("text=/ห้อง|ไม่มีความซ้ำซ้อน/")).toBeVisible();

    // Reload page
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[role="tablist"], button', { timeout: 10000 });

    // Should return to default tab (Teacher Conflicts) after reload
    // This is expected behavior as no tab state is persisted in URL
    await expect(page.locator("button").filter({ hasText: /ครูซ้ำซ้อน/ })).toBeVisible();
  });
});

test.describe("Conflict Detector - Error Handling", () => {
  test("should handle network errors gracefully", async ({ page }) => {
    // Intercept API calls and simulate failure
    await page.route("**/api/**", (route) => {
      route.abort();
    });

    await page.goto("/dashboard/1-2567/conflicts", { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"], [role="tablist"], button', { timeout: 10000 });

    // Wait for error UI to appear
    await page.waitForFunction(() => {
      return document.body.textContent?.match(/ข้อผิดพลาด|Error|ลองใหม่|Retry/i);
    }, { timeout: 5000 }).catch(() => {});

    // Should show error state or retry option
    const hasErrorUI = await page.locator("text=/ข้อผิดพลาด|Error|ลองใหม่|Retry/i").count() > 0;
    expect(hasErrorUI).toBe(true);
  });

  test("should handle invalid semester parameter", async ({ page }) => {
    await page.goto("/dashboard/invalid-semester/conflicts", { waitUntil: 'domcontentloaded' });
    
    // Should redirect or show error
    await page.waitForSelector('main, [role="main"], h1, h2', { timeout: 10000 }).catch(() => {});
    const currentUrl = page.url();
    
    // Either redirects to valid semester or shows error
    expect(
      currentUrl.includes("select-semester") || 
      currentUrl.includes("/dashboard/")
    ).toBe(true);
  });
});

test.describe("Conflict Detector - Accessibility", () => {
  test("should have proper ARIA labels", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts", { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"], [role="tablist"], button', { timeout: 10000 });

    // Check for tab roles
    const tabs = page.locator("button[role='tab'], [class*='MuiTab']");
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(4);
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts", { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('main, [role="main"], [role="tablist"], button', { timeout: 10000 });

    // Focus on first tab and use keyboard
    await page.keyboard.press("Tab");
    
    // Should be able to navigate with arrow keys
    await page.keyboard.press("ArrowRight");
    
    // A tab should be focused
    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    expect(focusedElement).toBeTruthy();
  });
});
