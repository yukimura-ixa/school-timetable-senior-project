/**
 * Visual Inspection Test - Admin Flow
 *
 * Updated: 2025-11-21 - Phase 1: E2E Test Reliability
 * - Migrated to admin.fixture for authentication
 * - Replaced waitForTimeout() with web-first assertions where appropriate
 * - Kept INTENTIONAL visual inspection delays (for manual testing)
 * - Removed manual authentication flows
 *
 * Run with: pnpm playwright test visual-inspection.spec.ts --headed --debug
 * Or in UI mode: pnpm playwright test --ui
 */

import { test, expect } from "./fixtures/admin.fixture";

test.describe("Visual Inspection - Admin User Journey", () => {
  test("01. Home page and sign-in", async ({ page }) => {
    await page.goto("/");

    // ✅ Web-first: Wait for page to be ready
    await expect(page.locator("body")).toBeVisible();

    console.log("📍 Currently at:", page.url());
    console.log("👀 Inspect: Home page layout, sign-in button, navigation");

    // INTENTIONAL: Manual inspection delay (keep for visual testing)
    await page.waitForTimeout(2000);

    // ✅ Web-first: Check for sign-in elements
    const signInButton = page.locator("text=/sign in/i").first();
    if (await signInButton.isVisible().catch(() => false)) {
      console.log("✅ Sign-in button found");
    }
  });

  test("02. Navigate to dashboard (authenticated)", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard");

    // ✅ Web-first: Wait for dashboard to load
    await expect(page.locator('main, [role="main"], h1, h2')).toBeVisible();

    console.log("📍 Currently at:", page.url());
    console.log("✅ Authenticated automatically via fixture");
    console.log(
      "👀 Inspect: Dashboard layout, semester selector, navigation menu",
    );

    // INTENTIONAL: Manual inspection delay (keep for visual testing)
    await page.waitForTimeout(3000);
  });

  test("03. Semester selection", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard");

    // ✅ Web-first: Wait for dashboard
    await expect(page.locator('main, [role="main"]')).toBeVisible();

    console.log("📍 Dashboard loaded");
    console.log("👀 Inspect: Semester dropdown, year selector");

    // ✅ Web-first: Look for semester selector
    const semesterSelector = page
      .locator('[data-testid="semester-selector"]')
      .or(
        page
          .locator('select, [role="combobox"]')
          .filter({ hasText: /2567|2568|ภาค/ }),
      );

    if (await semesterSelector.isVisible().catch(() => false)) {
      console.log("✅ Semester selector found");
    }

    // INTENTIONAL: Manual inspection delay (keep for visual testing)
    await page.waitForTimeout(3000);
  });

  test("04. Management - Teachers", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/management/teacher");

    // ✅ Web-first: Wait for page to load
    await expect(page.locator('main, [role="main"], h1, h2')).toBeVisible();

    console.log("📍 Currently at:", page.url());
    console.log("👀 Inspect: Teacher list, add button, search, pagination");

    // Take screenshot
    await page.screenshot({
      path: "test-results/screenshots/admin-teacher-management.png",
      fullPage: true,
    });

    // INTENTIONAL: Manual inspection delay (keep for visual testing)
    await page.waitForTimeout(3000);
  });

  test("05. Management - Subjects", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/management/subject");

    // ✅ Web-first: Wait for page to load
    await expect(page.locator('main, [role="main"], h1, h2')).toBeVisible();

    console.log("📍 Currently at:", page.url());
    console.log(
      "👀 Inspect: Subject list, Thai curriculum codes, credit hours",
    );

    await page.screenshot({
      path: "test-results/screenshots/admin-subject-management.png",
      fullPage: true,
    });

    // INTENTIONAL: Manual inspection delay (keep for visual testing)
    await page.waitForTimeout(3000);
  });

  test("06. Schedule Configuration", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;

    const semester = "1-2567";
    await page.goto(`/schedule/${semester}/config`);

    // ✅ Web-first: Wait for page to load
    await expect(page.locator('main, [role="main"], h1, h2')).toBeVisible();

    console.log("📍 Currently at:", page.url());
    console.log(
      "👀 Inspect: Timeslot configuration, period setup, break times",
    );

    await page.screenshot({
      path: "test-results/screenshots/admin-schedule-config.png",
      fullPage: true,
    });

    // INTENTIONAL: Manual inspection delay (keep for visual testing)
    await page.waitForTimeout(3000);
  });

  test("07. Teacher Arrangement Interface", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;

    const semester = "1-2567";
    await page.goto(`/schedule/${semester}/arrange/teacher-arrange`);

    // ✅ Web-first: Wait for page to load
    await expect(page.locator('main, [role="main"]')).toBeVisible();

    console.log("📍 Currently at:", page.url());
    console.log("👀 Inspect:");
    console.log(
      '  - Teacher selector dropdown (data-testid="teacher-selector")',
    );
    console.log('  - Subject palette (data-testid="subject-list")');
    console.log('  - Timeslot grid (data-testid="timeslot-grid")');
    console.log('  - Save button (data-testid="save-button")');
    console.log("  - Drag-and-drop functionality");

    await page.screenshot({
      path: "test-results/screenshots/admin-teacher-arrange.png",
      fullPage: true,
    });

    // Highlight test IDs we added
    await page.evaluate(() => {
      const elements = document.querySelectorAll("[data-testid]");
      elements.forEach((el) => {
        const testId = el.getAttribute("data-testid");
        console.log(`Found test ID: ${testId}`);
        // Add visual highlight
        (el as HTMLElement).style.outline = "2px solid lime";
        (el as HTMLElement).style.outlineOffset = "2px";
      });
    });

    // INTENTIONAL: Extended manual inspection delay for complex UI (keep for visual testing)
    await page.waitForTimeout(5000);
  });

  test("08. Analytics Dashboard", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard/analytics");

    // ✅ Web-first: Wait for page to load
    await expect(page.locator('main, [role="main"], h1, h2')).toBeVisible();

    console.log("📍 Currently at:", page.url());
    console.log("👀 Inspect: Charts, metrics, data visualization");

    await page.screenshot({
      path: "test-results/screenshots/admin-analytics.png",
      fullPage: true,
    });

    // INTENTIONAL: Manual inspection delay (keep for visual testing)
    await page.waitForTimeout(3000);
  });

  test("09. Check Next.js DevTools", async ({ page }) => {
    await page.goto("/");

    // ✅ Web-first: Wait for page to load
    await expect(page.locator("body")).toBeVisible();

    console.log("📍 Checking Next.js Dev Mode indicators...");

    // Check for Next.js dev mode indicators
    const isDev = await page.evaluate(() => {
      return (window as any).__NEXT_DATA__?.props?.pageProps || {};
    });

    console.log("Next.js Data:", isDev);

    // Check for React DevTools
    const hasReact = await page.evaluate(() => {
      return (
        !!(window as any).React ||
        !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
      );
    });

    console.log("React DevTools available:", hasReact);

    // Open browser console
    console.log("\n💡 Tips:");
    console.log("  - Press F12 to open browser DevTools");
    console.log("  - Check Console tab for errors/warnings");
    console.log("  - Check Network tab for API calls");
    console.log("  - Check React DevTools (if installed)");
    console.log("  - Check Next.js panel (if available)");

    // INTENTIONAL: Extended manual inspection delay (keep for visual testing)
    await page.waitForTimeout(5000);
  });
});

test.describe("Visual Inspection - Component Test IDs", () => {
  test("Verify all added test IDs are present", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    const semester = "1-2567";
    await page.goto(`/schedule/${semester}/arrange/teacher-arrange`);

    // ✅ Web-first: Wait for page to load
    await expect(page.locator('main, [role="main"]')).toBeVisible();

    console.log("\n🔍 Checking for test IDs we added...\n");

    const testIds = [
      "teacher-selector",
      "subject-list",
      "timeslot-grid",
      "save-button",
    ];

    for (const testId of testIds) {
      const element = page.locator(`[data-testid="${testId}"]`);
      const count = await element.count();

      if (count > 0) {
        const isVisible = await element
          .first()
          .isVisible({ timeout: 1000 })
          .catch(() => false);
        console.log(
          `✅ ${testId}: Found ${isVisible ? "(visible)" : "(hidden)"}`,
        );

        // Highlight in browser
        if (isVisible) {
          await element.first().evaluate((el: Element) => {
            (el as HTMLElement).style.outline = "3px solid lime";
            (el as HTMLElement).style.outlineOffset = "3px";
          });
        }
      } else {
        console.log(`❌ ${testId}: NOT FOUND`);
      }
    }

    console.log("\n👀 Green outlines show elements with test IDs");
    // INTENTIONAL: Extended manual inspection delay for test ID verification (keep for visual testing)
    await page.waitForTimeout(10000);
  });
});
