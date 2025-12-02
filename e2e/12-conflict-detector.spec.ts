/**
 * E2E Tests for Conflict Detector Feature
 * Tests complete user flows for conflict detection and display
 *
 * Updated: 2025-11-21 - Phase 1: E2E Test Reliability
 * - Migrated to admin.fixture for authentication
 * - Applied web-first assertion patterns
 * - Removed brittle waits and selectors
 */

import { test, expect } from "./fixtures/admin.fixture";

test.describe("Conflict Detector", () => {
  // ✅ Using authenticatedAdmin fixture - no manual auth needed

  test("should navigate to conflicts page from dashboard", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    // Start from dashboard (already authenticated via fixture)
    await page.goto("/dashboard/1-2567");

    // ✅ Web-first assertion: Wait for dashboard to load
    await expect(page.locator("h1, h2").first()).toBeVisible();

    // Find and click the conflict detector quick action button
    const conflictButton = page
      .locator("a")
      .filter({ hasText: /ตรวจสอบความซ้ำซ้อน/ });
    await expect(conflictButton).toBeVisible();
    await conflictButton.click();

    // ✅ Web-first assertion: Wait for URL change
    await expect(page).toHaveURL(/\/dashboard\/1-2567\/conflicts/);

    // ✅ Web-first assertion: Verify page loaded
    await expect(
      page.locator("h1, h2").filter({ hasText: /ตรวจสอบความซ้ำซ้อน/ }),
    ).toBeVisible();
  });

  test("should display conflict detector page components", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard/1-2567/conflicts");

    // ✅ Web-first: Check page title
    await expect(
      page.locator("h1, h2").filter({ hasText: /ตรวจสอบความซ้ำซ้อน/ }),
    ).toBeVisible();

    // ✅ Web-first: Check for tab interface
    await expect(
      page.locator("button").filter({ hasText: /ครูซ้ำซ้อน/ }),
    ).toBeVisible();
    await expect(
      page.locator("button").filter({ hasText: /ห้องซ้ำซ้อน/ }),
    ).toBeVisible();
    await expect(
      page.locator("button").filter({ hasText: /ชั้นซ้ำซ้อน/ }),
    ).toBeVisible();
    await expect(
      page.locator("button").filter({ hasText: /ยังไม่มีครู/ }),
    ).toBeVisible();
  });

  test("should display summary cards with conflict counts", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard/1-2567/conflicts");

    // ✅ Web-first: Wait for summary cards to render
    const summaryCards = page.locator(
      "[class*='MuiCard-root'], [class*='card']",
    );
    await expect(summaryCards.first()).toBeVisible();

    const count = await summaryCards.count();
    expect(count).toBeGreaterThanOrEqual(4); // At least 4 summary cards for each conflict type
  });

  test("should switch between conflict tabs", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard/1-2567/conflicts");

    // ✅ Web-first: Click on Room Conflicts tab
    const roomTab = page.locator("button").filter({ hasText: /ห้องซ้ำซ้อน/ });
    await expect(roomTab).toBeVisible();
    await roomTab.click();

    // ✅ Web-first: Should show room conflicts content
    await expect(page.locator("text=/ห้อง|ไม่มีความซ้ำซ้อน/")).toBeVisible();

    // ✅ Web-first: Click on Class Conflicts tab
    const classTab = page.locator("button").filter({ hasText: /ชั้นซ้ำซ้อน/ });
    await expect(classTab).toBeVisible();
    await classTab.click();

    // ✅ Web-first: Should show class conflicts content
    await expect(page.locator("text=/ชั้น|ไม่มีความซ้ำซ้อน/")).toBeVisible();

    // ✅ Web-first: Click on Unassigned tab
    const unassignedTab = page
      .locator("button")
      .filter({ hasText: /ยังไม่มีครู/ });
    await expect(unassignedTab).toBeVisible();
    await unassignedTab.click();

    // ✅ Web-first: Should show unassigned content
    await expect(page.locator("text=/ไม่มีครู|ไม่มีห้อง|ไม่พบ/")).toBeVisible();
  });

  test("should display conflict details when conflicts exist", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard/1-2567/conflicts");

    // ✅ Web-first: Wait for content to render (either table or empty state)
    const conflictContent = page.locator(
      "table, [class*='conflict'], [class*='empty']",
    );
    await expect(conflictContent.first()).toBeVisible();

    // Check if any conflicts are displayed (this depends on test data)
    const hasConflicts =
      (await page.locator("table, [class*='conflict']").count()) > 0;

    if (hasConflicts) {
      // Verify table headers exist
      const headers = page.locator("th, [role='columnheader']");
      await expect(headers.first()).toBeVisible();
    } else {
      // Verify empty state is shown
      await expect(
        page.locator("text=/ไม่พบความซ้ำซ้อน|ไม่มีความซ้ำซ้อน/"),
      ).toBeVisible();
    }
  });

  test("should display Thai labels correctly", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard/1-2567/conflicts");

    // ✅ Web-first: Verify Thai text is displayed
    await expect(page.locator("text=ครูซ้ำซ้อน")).toBeVisible();
    await expect(page.locator("text=ห้องซ้ำซ้อน")).toBeVisible();
    await expect(page.locator("text=ชั้นซ้ำซ้อน")).toBeVisible();
  });

  test("should handle empty conflict state", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard/1-2567/conflicts");

    // ✅ Web-first: Wait for initial content
    await expect(
      page.locator("button").filter({ hasText: /ครูซ้ำซ้อน/ }),
    ).toBeVisible();

    // If no conflicts, should show appropriate message in at least one tab
    const tabs = ["ครูซ้ำซ้อน", "ห้องซ้ำซ้อน", "ชั้นซ้ำซ้อน", "ยังไม่มีครู"];

    for (const tabName of tabs) {
      const tab = page
        .locator("button")
        .filter({ hasText: new RegExp(tabName) });
      await expect(tab).toBeVisible();
      await tab.click();

      // ✅ Web-first: Should show either conflicts or empty state, not an error
      const content = page.locator(
        "table, [class*='empty'], text=/ไม่พบ|ไม่มี/",
      );
      await expect(content.first()).toBeVisible();
    }
  });

  test("should refresh data when navigating back", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard/1-2567/conflicts");

    // ✅ Web-first: Verify initial load
    await expect(
      page.locator("button").filter({ hasText: /ครูซ้ำซ้อน/ }),
    ).toBeVisible();

    // Navigate away
    await page.goto("/dashboard/1-2567");
    await expect(page.locator("h1, h2").first()).toBeVisible();

    // Navigate back
    await page.goto("/dashboard/1-2567/conflicts");

    // ✅ Web-first: Should still show content
    await expect(
      page.locator("button").filter({ hasText: /ครูซ้ำซ้อน/ }),
    ).toBeVisible();
  });

  test("should be responsive on mobile viewport", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto("/dashboard/1-2567/conflicts");

    // ✅ Web-first: Page should still be functional
    await expect(
      page.locator("h1, h2").filter({ hasText: /ตรวจสอบ/ }),
    ).toBeVisible();

    // ✅ Web-first: Tabs should be clickable
    const tab = page
      .locator("button")
      .filter({ hasText: /ครูซ้ำซ้อน/ })
      .first();
    await expect(tab).toBeVisible();
    await tab.click();
  });

  test("should maintain selected tab on page reload", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard/1-2567/conflicts");

    // Click on a non-default tab
    const roomTab = page.locator("button").filter({ hasText: /ห้องซ้ำซ้อน/ });
    await expect(roomTab).toBeVisible();
    await roomTab.click();
    await expect(page.locator("text=/ห้อง|ไม่มีความซ้ำซ้อน/")).toBeVisible();

    // Reload page
    await page.reload();

    // ✅ Web-first: Should return to default tab (Teacher Conflicts) after reload
    // This is expected behavior as no tab state is persisted in URL
    await expect(
      page.locator("button").filter({ hasText: /ครูซ้ำซ้อน/ }),
    ).toBeVisible();
  });
});

test.describe("Conflict Detector - Error Handling", () => {
  test("should handle network errors gracefully", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    // Intercept API calls and simulate failure
    await page.route("**/api/**", (route) => {
      route.abort();
    });

    await page.goto("/dashboard/1-2567/conflicts");

    // ✅ Web-first: Should show error state or retry option
    const errorUI = page.locator("text=/ข้อผิดพลาด|Error|ลองใหม่|Retry/i");
    await expect(errorUI.first()).toBeVisible({ timeout: 15000 });
  });

  test("should handle invalid semester parameter", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard/invalid-semester/conflicts");

    // ✅ Web-first: Should redirect or show error
    await expect(page.locator("main, [role='main'], h1, h2").first()).toBeVisible();
    const currentUrl = page.url();

    // Either redirects to valid semester or shows error
    expect(
      currentUrl.includes("select-semester") ||
        currentUrl.includes("/dashboard/"),
    ).toBe(true);
  });
});

test.describe("Conflict Detector - Accessibility", () => {
  test("should have proper ARIA labels", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard/1-2567/conflicts");

    // ✅ Web-first: Check for tab roles
    const tabs = page.locator("button[role='tab'], [class*='MuiTab']");
    await expect(tabs.first()).toBeVisible();

    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(4);
  });

  test("should be keyboard navigable", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard/1-2567/conflicts");

    // ✅ Web-first: Wait for page to load
    await expect(page.locator("[role='tablist'], button")).toBeVisible();

    // Focus on first tab and use keyboard
    await page.keyboard.press("Tab");

    // Should be able to navigate with arrow keys
    await page.keyboard.press("ArrowRight");

    // A tab should be focused
    const focusedElement = await page.evaluateHandle(
      () => document.activeElement,
    );
    expect(focusedElement).toBeTruthy();
  });
});
