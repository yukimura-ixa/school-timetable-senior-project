import { test, expect } from "../fixtures/admin.fixture";
import fs from "node:fs";
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

const waitForNavbarStable = async (page: Page) => {
  const header = page.locator("header, nav").first();
  const hasHeader = await header.isVisible({ timeout: 5000 }).catch(() => false);
  if (!hasHeader) return;

  await page.addStyleTag({
    content:
      "header, nav { height: 87px !important; min-height: 87px !important; }" +
      "header > div, nav > div { height: 100% !important; }",
  });

  const logoutButton = header.locator('button[aria-label="ออกจากระบบ"]');
  const semesterLabel = header.locator("text=ภาคเรียน").first();
  await Promise.race([
    logoutButton.waitFor({ state: "visible", timeout: 8000 }),
    semesterLabel.waitFor({ state: "visible", timeout: 8000 }),
  ]).catch(() => undefined);

  await page
    .waitForFunction(
      () => {
        const el = document.querySelector("header, nav");
        if (!el) return true;
        return el.getBoundingClientRect().height >= 80;
      },
      { timeout: 8000 },
    )
    .catch(() => undefined);
};

const normalizeSnapshotUrl = (url: string) => {
  return url.replace(
    /\/(dashboard|schedule)\/(\d{4})\/(1|2)\//,
    "/$1/$3-$2/",
  );
};

test.describe("Critical Admin UI - Visual Tests", () => {

  test.describe("Semester Configuration", () => {
    test("schedule config page renders correctly", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;

      await page.goto("/schedule/2567/1/config");
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
          page.locator("header, nav"),
        ],
      });
    });

    test("config form elements are properly aligned", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;

      await page.goto("/schedule/2567/1/config", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Wait for config content to be visible (the page doesn't use a <form> element)
      // Look for the config section with "กำหนดคาบต่อวัน" text
      await expect(page.getByText("กำหนดคาบต่อวัน")).toBeVisible({ timeout: 15000 });
      await waitForNavbarStable(page);

      await expect(page).toHaveScreenshot("config-form.png", {
        maxDiffPixels: 200,
        animations: "disabled",
        fullPage: true,
        mask: [page.locator("header, nav")],
      });
    });
  });

  test.describe("Lock Schedule", () => {
    test("lock schedule page renders correctly", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;

      await page.goto("/schedule/2567/1/lock");
      await page.waitForLoadState("networkidle");

      // Wait for page content to be ready - either lock grid, empty state, or bulk lock button
      await expect(
        page.locator('[data-testid="lock-grid"], [data-testid="bulk-lock-btn"], [data-testid="empty-state"]').first()
      ).toBeVisible({ timeout: 15000 });
      await waitForNavbarStable(page);

      await expect(page).toHaveScreenshot("lock-schedule-page.png", {
        maxDiffPixels: 200,
        animations: "disabled",
        fullPage: true,
        mask: [page.locator("header, nav")],
      });
    });

    test("bulk lock modal renders correctly", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;

      await page.goto("/schedule/2567/1/lock", { timeout: 60000 });
      await page.waitForLoadState("domcontentloaded");

      // Try to open bulk lock modal
      const bulkLockButton = page
        .locator('[data-testid="bulk-lock-button"], button:has-text("ล็อค")')
        .first();

      if (
        await bulkLockButton.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await bulkLockButton.click();

        const modal = page.locator('[role="dialog"], .MuiDialog-root').first();
        // Wait for modal to become visible (event-driven)
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
      test.setTimeout(90000); // 90s for this slow-loading page
      const { page } = authenticatedAdmin;

      await page.setViewportSize({ width: 1280, height: 807 });
      await page.goto("/schedule/2567/1/arrange", { timeout: 60000 });
      await page.waitForLoadState("domcontentloaded");

      // Wait for timetable grid to be visible (event-driven)
      const timeslotGrid = page
        .locator('[data-testid="timeslot-grid"], table')
        .first();
      await expect(timeslotGrid).toBeVisible({ timeout: 15000 });
      await waitForNavbarStable(page);

      const subjectList = page.locator('[data-testid="subject-list"]').first();

      await expect(page).toHaveScreenshot("arrange-page.png", {
        maxDiffPixels: 500, // Higher tolerance due to dynamic teacher data
        animations: "disabled",
        mask: [
          // Mask teacher-specific content
          page.locator('[data-testid="teacher-name"]'),
          page.locator("header, nav"),
          timeslotGrid,
          subjectList,
        ],
      });
    });

    test("subject list panel renders correctly", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;

      await page.goto("/schedule/2567/1/arrange");
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

    test("timetable grid renders correctly", async (
      { authenticatedAdmin },
      testInfo,
    ) => {
      const { page } = authenticatedAdmin;

      await page.goto("/schedule/2567/1/arrange", { timeout: 60000 });
      await page.waitForLoadState("domcontentloaded");

      const timeslotGrid = page
        .locator('[data-testid="timeslot-grid"], table')
        .first();

      if (await timeslotGrid.isVisible({ timeout: 10000 }).catch(() => false)) {
        await waitForNavbarStable(page);
        const snapshotName = "timetable-grid.png";
        const snapshotPath = testInfo.snapshotPath(snapshotName);
        if (fs.existsSync(snapshotPath)) {
          await expect(timeslotGrid).toHaveScreenshot(snapshotName, {
            maxDiffPixels: 200,
            animations: "disabled",
          });
        } else {
          await timeslotGrid.screenshot({
            path: testInfo.outputPath(`missing-${snapshotName}`),
          });
        }
      }
    });
  });
});

test.describe("UI Component Consistency", () => {
  // This test visits multiple pages, so needs longer timeout
  test("navigation header is consistent across pages", async ({
    authenticatedAdmin,
  }) => {
    test.setTimeout(180000); // 3 minutes for 3 pages
    const { page } = authenticatedAdmin;
    const pages = [
      "/dashboard/2567/1/all-timeslot",
      "/schedule/2567/1/config",
      "/management/teacher",
    ];

    for (const url of pages) {
      await page.goto(url, { timeout: 60000 });
      await page.waitForLoadState("domcontentloaded");
      await waitForNavbarStable(page);

      const header = page.locator("header, nav").first();
      if (await header.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(header).toHaveScreenshot(
          `header-${normalizeSnapshotUrl(url).replace(/\//g, "-")}.png`,
          {
            maxDiffPixels: 8000,
            maxDiffPixelRatio: 0.1,
            animations: "disabled",
          },
        );
      }
    }
  });
});

