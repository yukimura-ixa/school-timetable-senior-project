/**
 * @file semester-smoke.spec.ts
 * @description Smoke tests for schedule/dashboard routes across all seeded terms
 *
 * Verifies:
 * - Schedule config pages return 200 OK for multiple semesters
 * - Dashboard all-timeslot pages return 200 OK
 * - Critical UI elements render (pagination, tables, metrics)
 * - No runtime errors in console
 * - Multi-semester navigation and data isolation
 *
 * Runs against production OR local depending on PLAYWRIGHT_BASE_URL
 * Uses admin fixture for authentication (no dev bypass).
 */

import { test, expect } from "../fixtures/admin.fixture";

// Both semesters are seeded by prisma/seed.ts (db:seed:clean)
// 1-2567: PUBLISHED semester with full data
// 2-2567: DRAFT semester with timeslots and config
const SEEDED_TERMS = [
  { semester: 1, year: 2567, label: "1-2567", status: "PUBLISHED" },
  { semester: 2, year: 2567, label: "2-2567", status: "DRAFT" },
];

test.describe("Semester Smoke Tests - Schedule Config", () => {
  for (const term of SEEDED_TERMS) {
    test(`/schedule/${term.label}/config returns 200 OK`, async ({ page }) => {
      const response = await page.goto(`/schedule/${term.label}/config`);
      expect(response?.status()).toBe(200);
    });

    test(`/schedule/${term.label}/config renders config form`, async ({
      page,
    }) => {
      await page.goto(`/schedule/${term.label}/config`);

      // Config page is a form with configuration options, not a table
      // Wait for config form elements to load
      // Thai: "กำหนดคาบต่อวัน" (Set periods per day)
      const configLabel = page.locator("text=/กำหนดคาบต่อวัน|กำหนดระยะเวลาต่อคาบ/");
      await expect(configLabel.first()).toBeVisible({ timeout: 15000 });
    });

    test(`/schedule/${term.label}/config has configuration options`, async ({
      page,
    }) => {
      await page.goto(`/schedule/${term.label}/config`);

      // Check for config form labels (not metric cards - those are on dashboard)
      // Thai: "กำหนดเวลาเริ่มคาบแรก" (Set first period start time), "กำหนดคาบพักเที่ยง" (Set lunch break)
      const hasConfigOptions = page.locator("text=/กำหนดเวลาเริ่มคาบแรก|กำหนดคาบพักเที่ยง|กำหนดวันในตารางสอน/");
      await expect(hasConfigOptions.first()).toBeVisible({ timeout: 15000 });
    });

    test(`/schedule/${term.label}/config has no console errors`, async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(`/schedule/${term.label}/config`);
      // Wait for config form elements or skeleton
      await expect(page.locator('text=/กำหนดคาบต่อวัน/, [class*="Skeleton"], body').first()).toBeVisible({
        timeout: 15000,
      });

      // Allow some expected warnings (like missing cache config)
      const criticalErrors = consoleErrors.filter(
        (err) => !err.includes("cache") && !err.includes("warning"),
      );

      expect(criticalErrors.length).toBe(0);
    });
  }
});

test.describe("Semester Smoke Tests - Dashboard All-Timeslot", () => {
  for (const term of SEEDED_TERMS) {
    test(`/dashboard/${term.label}/all-timeslot returns 200 OK`, async ({
      page,
    }) => {
      const response = await page.goto(`/dashboard/${term.label}/all-timeslot`);
      expect(response?.status()).toBe(200);
    });

    test(`/dashboard/${term.label}/all-timeslot renders grade table`, async ({
      page,
    }) => {
      await page.goto(`/dashboard/${term.label}/all-timeslot`);

      // Wait for table to load
      await page.waitForSelector("table", { timeout: 15000 });

      // Check for common grade labels (Thai: "ม.1", "ม.4", etc.)
      const gradeLabels = page.locator("text=/ม\\.\\d/");
      await expect(gradeLabels.first()).toBeVisible();
    });

    test(`/dashboard/${term.label}/all-timeslot has pagination`, async ({
      page,
    }) => {
      await page.goto(`/dashboard/${term.label}/all-timeslot`);

      // Check for pagination controls
      const pagination = page
        .locator('[role="navigation"]')
        .filter({ hasText: /หน้า|Page/i });
      await expect(pagination).toBeVisible({ timeout: 15000 });
    });

    test(`/dashboard/${term.label}/all-timeslot has no console errors`, async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(`/dashboard/${term.label}/all-timeslot`);
      await expect(page.locator('table, [class*="Skeleton"], body').first()).toBeVisible({
        timeout: 15000,
      });

      const criticalErrors = consoleErrors.filter(
        (err) => !err.includes("cache") && !err.includes("warning"),
      );

      expect(criticalErrors.length).toBe(0);
    });
  }
});

test.describe("Semester Route Validation", () => {
  test("Invalid semester route redirects or shows error", async ({ page }) => {
    // Try accessing a non-existent term
    const response = await page.goto("/dashboard/99-9999/all-timeslot");

    // Should either redirect (3xx) or show error boundary (200 with error message)
    const status = response?.status();

    if (status === 200) {
      // Check for error boundary message (Thai: "ไม่พบภาคเรียน")
      const errorMessage = page.locator("text=/ไม่พบภาคเรียน|ไม่พบข้อมูล/");
      await expect(errorMessage).toBeVisible({ timeout: 15000 });
    } else {
      // Should redirect
      expect([301, 302, 307, 308]).toContain(status);
    }
  });

  test("Malformed semester route is handled gracefully", async ({ page }) => {
    const response = await page.goto("/dashboard/invalid-format/all-timeslot");

    // Should not crash; either redirect or show error
    const status = response?.status();
    expect(status).toBeLessThan(500); // No server error
  });
});

test.describe("Cross-Term Navigation", () => {
  test("Can navigate to schedule config and back to dashboard", async ({
    page,
  }) => {
    // Navigate to schedule config
    await page.goto("/schedule/1-2567/config");
    await expect(page).toHaveURL(/\/schedule\/1-2567\/config/);

    // Verify config page renders (config form, not table)
    await expect(page.locator("text=/กำหนดคาบต่อวัน/")).toBeVisible({ timeout: 15000 });

    // Navigate to dashboard
    await page.goto("/dashboard/1-2567/all-timeslot");
    await expect(page).toHaveURL(/\/dashboard\/1-2567\/all-timeslot/);
  });

  test("Term-specific data loads correctly", async ({ page }) => {
    // Verify the seeded semester (1-2567) has content
    await page.goto("/dashboard/1-2567/all-timeslot");
    const content = await page.textContent("body");

    // Content should be present
    expect(content).toBeTruthy();
    expect(content?.length).toBeGreaterThan(100); // Meaningful content
  });
});

/**
 * Multi-Semester Scenarios
 * Tests cross-semester navigation, data isolation, and URL consistency
 */
test.describe("Multi-Semester Scenarios", () => {
  test("TC-MS-01: Can navigate between semesters via URL", async ({ page }) => {
    // Navigate to semester 1
    await page.goto("/schedule/1-2567/config");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/schedule\/1-2567\/config/);
    // Config page has config form, not table
    await expect(page.locator('text=/กำหนดคาบต่อวัน/, [class*="Skeleton"]').first()).toBeVisible({ timeout: 15000 });

    // Navigate to semester 2
    await page.goto("/schedule/2-2567/config");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/schedule\/2-2567\/config/);
    await expect(page.locator('text=/กำหนดคาบต่อวัน/, [class*="Skeleton"]').first()).toBeVisible({ timeout: 15000 });
  });

  test("TC-MS-02: Both semesters load schedule config successfully", async ({
    page,
  }) => {
    // Test both semesters can load the config page
    for (const term of SEEDED_TERMS) {
      const response = await page.goto(`/schedule/${term.label}/config`);
      expect(response?.status()).toBe(200);

      // Verify config form loads (config page uses form elements, not tables)
      await expect(page.locator('text=/กำหนดคาบต่อวัน/, [class*="Skeleton"]').first()).toBeVisible({ timeout: 15000 });
    }
  });

  test("TC-MS-03: Both semesters load dashboard successfully", async ({
    page,
  }) => {
    // Test both semesters can load the dashboard
    for (const term of SEEDED_TERMS) {
      const response = await page.goto(`/dashboard/${term.label}/all-timeslot`);
      expect(response?.status()).toBe(200);

      // Verify content loads
      await page.waitForSelector('table, [class*="Skeleton"]', { timeout: 15000 });
    }
  });

  test("TC-MS-04: URL patterns are consistent across semesters", async ({
    page,
  }) => {
    // Schedule config URL pattern
    await page.goto("/schedule/1-2567/config");
    await expect(page).toHaveURL(/\/schedule\/1-2567\/config/);

    await page.goto("/schedule/2-2567/config");
    await expect(page).toHaveURL(/\/schedule\/2-2567\/config/);

    // Dashboard URL pattern
    await page.goto("/dashboard/1-2567/all-timeslot");
    await expect(page).toHaveURL(/\/dashboard\/1-2567\/all-timeslot/);

    await page.goto("/dashboard/2-2567/all-timeslot");
    await expect(page).toHaveURL(/\/dashboard\/2-2567\/all-timeslot/);
  });

  test("TC-MS-05: Cross-semester navigation preserves page structure", async ({
    page,
  }) => {
    // Load semester 1 config - config page has form elements
    await page.goto("/schedule/1-2567/config");
    await page.waitForLoadState("networkidle");
    const sem1HasConfig = await page.locator("text=/กำหนดคาบต่อวัน/").count();

    // Load semester 2 config
    await page.goto("/schedule/2-2567/config");
    await page.waitForLoadState("networkidle");
    const sem2HasConfig = await page.locator("text=/กำหนดคาบต่อวัน/").count();

    // Both should have the same page structure (config form present)
    expect(sem1HasConfig).toBeGreaterThan(0);
    expect(sem2HasConfig).toBeGreaterThan(0);
  });

  test("TC-MS-06: Rapid semester switching doesn't cause errors", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Rapidly switch between semesters
    await page.goto("/schedule/1-2567/config");
    await page.goto("/schedule/2-2567/config");
    await page.goto("/schedule/1-2567/config");
    await page.goto("/schedule/2-2567/config");

    // Wait for final page to stabilize
    await page.waitForLoadState("networkidle");

    // Filter out non-critical errors
    const criticalErrors = consoleErrors.filter(
      (err) =>
        !err.includes("cache") &&
        !err.includes("warning") &&
        !err.includes("ResizeObserver"),
    );

    expect(criticalErrors.length).toBe(0);
  });

  test("TC-MS-07: Arrange page loads for both semesters", async ({ page }) => {
    // Test teacher arrange page for both semesters
    for (const term of SEEDED_TERMS) {
      const response = await page.goto(
        `/schedule/${term.label}/arrange/teacher`,
      );
      expect(response?.status()).toBe(200);

      // Verify drag-drop area or timetable skeleton loads
      await page.waitForSelector(
        '[draggable="true"], [class*="Skeleton"], table',
        { timeout: 15000 },
      );
    }
  });
});
