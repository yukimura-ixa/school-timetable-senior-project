/**
 * @file semester-smoke.spec.ts
 * @description Smoke tests for schedule/dashboard routes across all seeded terms
 *
 * Verifies:
 * - Schedule config pages return 200 OK
 * - Dashboard all-timeslot pages return 200 OK
 * - Critical UI elements render (pagination, tables, metrics)
 * - No runtime errors in console
 *
 * Runs against production OR local depending on PLAYWRIGHT_BASE_URL
 * Uses admin fixture for authentication (no dev bypass).
 */

import { test, expect } from "../fixtures/admin.fixture";

// IMPORTANT: Only 1-2567 is reliably seeded by prisma/seed.ts (db:seed:clean).
// The create-semesters.ts script adds 2-2567 and 1-2568, but that's a separate
// script not run in CI smoke tests workflow.
// Keep tests focused on the single confirmed seeded semester for reliability.
const SEEDED_TERMS = [{ semester: 1, year: 2567, label: "1-2567" }];

test.describe("Semester Smoke Tests - Schedule Config", () => {
  for (const term of SEEDED_TERMS) {
    test(`/schedule/${term.label}/config returns 200 OK`, async ({ page }) => {
      const response = await page.goto(`/schedule/${term.label}/config`);
      expect(response?.status()).toBe(200);
    });

    test(`/schedule/${term.label}/config renders teacher table`, async ({
      page,
    }) => {
      await page.goto(`/schedule/${term.label}/config`);

      // Wait for table to load
      await page.waitForSelector("table", { timeout: 10000 });

      // Check for pagination text (Thai: "แสดง X ถึง Y จาก Z รายการ")
      const paginationText = page.locator("text=/แสดง.*ถึง.*จาก.*รายการ/");
      await expect(paginationText).toBeVisible();
    });

    test(`/schedule/${term.label}/config has metric cards`, async ({
      page,
    }) => {
      await page.goto(`/schedule/${term.label}/config`);

      // Check for common metric card labels
      // Thai: "ครูทั้งหมด" (All Teachers), "ห้องเรียน" (Classrooms), etc.
      const hasMetrics = page.locator("text=/ครูทั้งหมด|ห้องเรียน|รายวิชา/");
      await expect(hasMetrics.first()).toBeVisible({ timeout: 10000 });
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
      await expect(page.locator('table, [class*="Skeleton"], body').first()).toBeVisible({
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
      await page.waitForSelector("table", { timeout: 10000 });

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
      await expect(pagination).toBeVisible({ timeout: 10000 });
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
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
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

    // Verify page renders
    await page.waitForSelector("table", { timeout: 10000 });

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
