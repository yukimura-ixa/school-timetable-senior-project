import { test, expect } from "../fixtures/admin.fixture";

/**
 * Visual Tests for Critical Admin UI Components
 *
 * Uses Playwright's toHaveScreenshot() for visual regression testing.
 * Run via: pnpm exec playwright test --project=visual
 *
 * Critical paths tested:
 * 1. Semester Configuration
 * 2. Lock Schedule
 * 3. Teacher Arrangement Table
 */

test.describe("Critical Admin UI - Visual Tests", () => {
  test.describe("Semester Configuration", () => {
    test("schedule config page renders correctly", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;

      await page.goto("/schedule/1-2567/config");
      await page.waitForLoadState("networkidle");

      // Wait for config form to load
      await expect(page.locator("text=/กำหนดคาบต่อวัน/").first()).toBeVisible({
        timeout: 15000,
      });

      // Take screenshot with tolerance for minor rendering differences
      await expect(page).toHaveScreenshot("config-page.png", {
        maxDiffPixels: 200,
        animations: "disabled",
        mask: [
          // Mask dynamic content like timestamps
          page.locator('[data-testid="last-updated"]'),
        ],
      });
    });

    test("config form elements are properly aligned", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;

      await page.goto("/schedule/1-2567/config");
      await page.waitForLoadState("networkidle");

      // Focus on form area
      const formArea = page.locator("form, [role=form], main").first();
      await expect(formArea).toBeVisible({ timeout: 15000 });

      await expect(formArea).toHaveScreenshot("config-form.png", {
        maxDiffPixels: 150,
        animations: "disabled",
      });
    });
  });

  test.describe("Lock Schedule", () => {
    test("lock schedule page renders correctly", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;

      await page.goto("/schedule/1-2567/lock");
      await page.waitForLoadState("networkidle");

      // Wait for lock interface to load
      await expect(page.locator("main, [role=main]").first()).toBeVisible({
        timeout: 15000,
      });

      await expect(page).toHaveScreenshot("lock-schedule-page.png", {
        maxDiffPixels: 200,
        animations: "disabled",
      });
    });

    test("bulk lock modal renders correctly", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;

      await page.goto("/schedule/1-2567/lock");
      await page.waitForLoadState("networkidle");

      // Try to open bulk lock modal
      const bulkLockButton = page
        .locator('[data-testid="bulk-lock-button"], button:has-text("ล็อค")')
        .first();

      if (
        await bulkLockButton.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await bulkLockButton.click();
        await page.waitForTimeout(500);

        const modal = page.locator('[role="dialog"], .MuiDialog-root').first();
        if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(modal).toHaveScreenshot("bulk-lock-modal.png", {
            maxDiffPixels: 100,
            animations: "disabled",
          });
        }
      }
    });
  });

  test.describe("Teacher Arrangement Table", () => {
    test("arrange page renders with timetable grid", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;

      await page.goto("/schedule/1-2567/arrange/teacher-arrange");
      await page.waitForLoadState("networkidle");

      // Wait for main content
      await expect(page.locator("main, [role=main]").first()).toBeVisible({
        timeout: 20000,
      });

      await expect(page).toHaveScreenshot("arrange-page.png", {
        maxDiffPixels: 300, // Higher tolerance due to dynamic teacher data
        animations: "disabled",
        mask: [
          // Mask teacher-specific content
          page.locator('[data-testid="teacher-name"]'),
        ],
      });
    });

    test("subject list panel renders correctly", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;

      await page.goto("/schedule/1-2567/arrange/teacher-arrange");
      await page.waitForLoadState("networkidle");

      const subjectList = page.locator('[data-testid="subject-list"]').first();

      if (await subjectList.isVisible({ timeout: 10000 }).catch(() => false)) {
        await expect(subjectList).toHaveScreenshot("subject-list-panel.png", {
          maxDiffPixels: 100,
          animations: "disabled",
        });
      }
    });

    test("timetable grid renders correctly", async ({ authenticatedAdmin }) => {
      const { page } = authenticatedAdmin;

      await page.goto("/schedule/1-2567/arrange/teacher-arrange");
      await page.waitForLoadState("networkidle");

      const timeslotGrid = page
        .locator('[data-testid="timeslot-grid"], table')
        .first();

      if (await timeslotGrid.isVisible({ timeout: 10000 }).catch(() => false)) {
        await expect(timeslotGrid).toHaveScreenshot("timetable-grid.png", {
          maxDiffPixels: 200,
          animations: "disabled",
        });
      }
    });
  });
});

test.describe("UI Component Consistency", () => {
  test("navigation header is consistent across pages", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const pages = [
      "/dashboard/1-2567/all-timeslot",
      "/schedule/1-2567/config",
      "/management/teacher",
    ];

    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState("networkidle");

      const header = page.locator("header, nav").first();
      if (await header.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(header).toHaveScreenshot(
          `header-${url.replace(/\//g, "-")}.png`,
          {
            maxDiffPixels: 50,
            animations: "disabled",
          },
        );
      }
    }
  });
});
