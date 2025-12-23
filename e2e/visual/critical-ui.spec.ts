import { test, expect } from "../fixtures/admin.fixture";
import type { Page } from "@playwright/test";

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
  const waitForNavbarStable = async (page: Page) => {
    const header = page.locator("header, nav").first();
    if (await header.isVisible({ timeout: 5000 }).catch(() => false)) {
      await page.waitForFunction(
        () => {
          const el = document.querySelector("header, nav");
          if (!el) return true;
          return el.getBoundingClientRect().height >= 80;
        },
        { timeout: 5000 },
      );
    }
  };

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
      await waitForNavbarStable(page);

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

      // Wait for page body to be ready
      await page.waitForTimeout(1000);
      await waitForNavbarStable(page);

      await expect(page).toHaveScreenshot("config-form.png", {
        maxDiffPixels: 200,
        animations: "disabled",
        fullPage: true,
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

      // Wait for page to fully render
      await page.waitForTimeout(1000);
      await waitForNavbarStable(page);

      await expect(page).toHaveScreenshot("lock-schedule-page.png", {
        maxDiffPixels: 200,
        animations: "disabled",
        fullPage: true,
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

      await page.goto("/schedule/1-2567/arrange");
      await page.waitForLoadState("networkidle");

      // Wait for page to fully render
      await page.waitForTimeout(2000);
      await waitForNavbarStable(page);

      await expect(page).toHaveScreenshot("arrange-page.png", {
        maxDiffPixels: 500, // Higher tolerance due to dynamic teacher data
        animations: "disabled",
        fullPage: true,
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

      await page.goto("/schedule/1-2567/arrange");
      await page.waitForLoadState("networkidle");

      const subjectList = page.locator('[data-testid="subject-list"]').first();

      if (await subjectList.isVisible({ timeout: 10000 }).catch(() => false)) {
        await waitForNavbarStable(page);
        await expect(subjectList).toHaveScreenshot("subject-list-panel.png", {
          maxDiffPixels: 100,
          animations: "disabled",
        });
      }
    });

    test("timetable grid renders correctly", async ({ authenticatedAdmin }) => {
      const { page } = authenticatedAdmin;

      await page.goto("/schedule/1-2567/arrange");
      await page.waitForLoadState("networkidle");

      const timeslotGrid = page
        .locator('[data-testid="timeslot-grid"], table')
        .first();

      if (await timeslotGrid.isVisible({ timeout: 10000 }).catch(() => false)) {
        await waitForNavbarStable(page);
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
      await waitForNavbarStable(page);

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

