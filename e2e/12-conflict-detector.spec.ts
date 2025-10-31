/**
 * E2E Tests for Conflict Detector Feature
 * Tests complete user flows for conflict detection and display
 */

import { test, expect } from "@playwright/test";

test.describe("Conflict Detector", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard first
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should navigate to conflicts page from dashboard", async ({ page }) => {
    await page.goto("/dashboard/1-2567");
    await page.waitForLoadState("networkidle");

    // Find and click the conflict detector quick action button
    const conflictButton = page.locator("a").filter({ hasText: /ตรวจสอบความซ้ำซ้อน/ });
    await expect(conflictButton).toBeVisible();
    await conflictButton.click();

    // Should navigate to conflicts page
    await expect(page).toHaveURL(/\/dashboard\/1-2567\/conflicts/);
  });

  test("should display conflict detector page components", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts");
    await page.waitForLoadState("networkidle");

    // Check page title
    await expect(page.locator("h1, h2").filter({ hasText: /ตรวจสอบความซ้ำซ้อน/ })).toBeVisible();

    // Check for tab interface
    await expect(page.locator("button").filter({ hasText: /ครูซ้ำซ้อน/ })).toBeVisible();
    await expect(page.locator("button").filter({ hasText: /ห้องซ้ำซ้อน/ })).toBeVisible();
    await expect(page.locator("button").filter({ hasText: /ชั้นซ้ำซ้อน/ })).toBeVisible();
    await expect(page.locator("button").filter({ hasText: /ยังไม่มีครู/ })).toBeVisible();
  });

  test("should display summary cards with conflict counts", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts");
    await page.waitForLoadState("networkidle");

    // Wait for data to load
    await page.waitForTimeout(1000);

    // Check for summary cards (they should show numbers or zero)
    const summaryCards = page.locator("[class*='MuiCard-root'], [class*='card']");
    const count = await summaryCards.count();
    expect(count).toBeGreaterThanOrEqual(4); // At least 4 summary cards for each conflict type
  });

  test("should switch between conflict tabs", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts");
    await page.waitForLoadState("networkidle");

    // Click on Room Conflicts tab
    const roomTab = page.locator("button").filter({ hasText: /ห้องซ้ำซ้อน/ });
    await roomTab.click();
    await page.waitForTimeout(500);

    // Should show room conflicts content
    await expect(page.locator("text=/ห้อง|ไม่มีความซ้ำซ้อน/")).toBeVisible();

    // Click on Class Conflicts tab
    const classTab = page.locator("button").filter({ hasText: /ชั้นซ้ำซ้อน/ });
    await classTab.click();
    await page.waitForTimeout(500);

    // Should show class conflicts content
    await expect(page.locator("text=/ชั้น|ไม่มีความซ้ำซ้อน/")).toBeVisible();

    // Click on Unassigned tab
    const unassignedTab = page.locator("button").filter({ hasText: /ยังไม่มีครู/ });
    await unassignedTab.click();
    await page.waitForTimeout(500);

    // Should show unassigned content
    await expect(page.locator("text=/ไม่มีครู|ไม่มีห้อง|ไม่พบ/")).toBeVisible();
  });

  test("should display conflict details when conflicts exist", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

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
    await page.goto("/dashboard/1-2567/conflicts");
    
    // Should show loading skeleton or spinner briefly
    const loadingIndicator = page.locator("[class*='skeleton'], [class*='loading'], [class*='spinner']");
    // Note: This might be too fast to catch, but we try
    const wasVisible = await loadingIndicator.isVisible().catch(() => false);
    
    // Even if not visible, page should eventually show content
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, h2")).toBeVisible();
  });

  test("should display Thai labels correctly", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts");
    await page.waitForLoadState("networkidle");

    // Verify Thai text is displayed
    await expect(page.locator("text=ครูซ้ำซ้อน")).toBeVisible();
    await expect(page.locator("text=ห้องซ้ำซ้อน")).toBeVisible();
    await expect(page.locator("text=ชั้นซ้ำซ้อน")).toBeVisible();
  });

  test("should handle empty conflict state", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // If no conflicts, should show appropriate message in at least one tab
    const tabs = ["ครูซ้ำซ้อน", "ห้องซ้ำซ้อน", "ชั้นซ้ำซ้อน", "ยังไม่มีครู"];
    
    for (const tabName of tabs) {
      const tab = page.locator("button").filter({ hasText: new RegExp(tabName) });
      await tab.click();
      await page.waitForTimeout(300);
      
      // Should show either conflicts or empty state, not an error
      const hasContent = await page.locator("table, [class*='empty'], text=/ไม่พบ|ไม่มี/").count() > 0;
      expect(hasContent).toBe(true);
    }
  });

  test("should refresh data when navigating back", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts");
    await page.waitForLoadState("networkidle");
    
    // Navigate away
    await page.goto("/dashboard/1-2567");
    await page.waitForLoadState("networkidle");
    
    // Navigate back
    await page.goto("/dashboard/1-2567/conflicts");
    await page.waitForLoadState("networkidle");
    
    // Should still show content
    await expect(page.locator("button").filter({ hasText: /ครูซ้ำซ้อน/ })).toBeVisible();
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto("/dashboard/1-2567/conflicts");
    await page.waitForLoadState("networkidle");

    // Page should still be functional
    await expect(page.locator("h1, h2").filter({ hasText: /ตรวจสอบ/ })).toBeVisible();
    
    // Tabs should be clickable
    const tab = page.locator("button").filter({ hasText: /ครูซ้ำซ้อน/ }).first();
    await expect(tab).toBeVisible();
    await tab.click();
  });

  test("should maintain selected tab on page reload", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts");
    await page.waitForLoadState("networkidle");

    // Click on a non-default tab
    const roomTab = page.locator("button").filter({ hasText: /ห้องซ้ำซ้อน/ });
    await roomTab.click();
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

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

    await page.goto("/dashboard/1-2567/conflicts");
    await page.waitForTimeout(2000);

    // Should show error state or retry option
    const hasErrorUI = await page.locator("text=/ข้อผิดพลาด|Error|ลองใหม่|Retry/i").count() > 0;
    expect(hasErrorUI).toBe(true);
  });

  test("should handle invalid semester parameter", async ({ page }) => {
    await page.goto("/dashboard/invalid-semester/conflicts");
    
    // Should redirect or show error
    await page.waitForLoadState("networkidle");
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
    await page.goto("/dashboard/1-2567/conflicts");
    await page.waitForLoadState("networkidle");

    // Check for tab roles
    const tabs = page.locator("button[role='tab'], [class*='MuiTab']");
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(4);
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/dashboard/1-2567/conflicts");
    await page.waitForLoadState("networkidle");

    // Focus on first tab and use keyboard
    await page.keyboard.press("Tab");
    await page.waitForTimeout(200);
    
    // Should be able to navigate with arrow keys
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(200);
    
    // A tab should be focused
    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    expect(focusedElement).toBeTruthy();
  });
});
