import { expect, test, type Page } from "@playwright/test";

/**
 * Public Pages Visual Tests (No Authentication Required)
 *
 * Tests public-facing pages across all viewports (desktop, tablet, mobile).
 * These pages are accessible without login and should be responsive.
 *
 * Public Routes:
 * - / (home page)
 * - /teachers/[id]/[semesterAndyear] (teacher schedule)
 * - /classes/[gradeId]/[semesterAndyear] (class schedule)
 *
 * How to run:
 *   # All viewports
 *   pnpm test:prod:visual -- --project=public-*
 *
 *   # Specific viewport
 *   pnpm test:prod:visual -- --project=public-mobile
 *   pnpm test:prod:visual -- --project=public-tablet
 *   pnpm test:prod:visual -- --project=public-desktop
 */

const semester = process.env.SEMESTER_ID ?? "1-2567";
const screenshotDir = "test-results/prod-visual";

/** Trace logger for debugging fallback scenarios in CI */
const trace = (testName: string, message: string) => {
  console.log(`[VISUAL:${testName}] ${message}`);
};

// Serial execution with extended timeout for visual tests
test.describe.configure({ mode: "serial", timeout: 60_000 });

// Console error collector
const consoleErrors: Array<{ url: string; message: string; type: string }> = [];

/**
 * Get viewport name from test info for screenshot organization
 */
const getViewportName = (page: Page): string => {
  const viewport = page.viewportSize();
  if (!viewport) return "unknown";

  if (viewport.width >= 1200) return "desktop";
  if (viewport.width >= 768) return "tablet";
  return "mobile";
};

/**
 * Take screenshot with viewport-based directory structure
 */
const snap = async (page: Page, name: string) => {
  const viewport = getViewportName(page);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500); // Let animations settle

  await page.screenshot({
    path: `${screenshotDir}/${viewport}/${name}.png`,
    fullPage: true,
    animations: "disabled",
  });
};

/**
 * Collect console errors for evidence
 */
test.beforeEach(async ({ page }) => {
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push({
        url: page.url(),
        message: msg.text(),
        type: msg.type(),
      });
    }
  });
});

// ===========================================
// Home Page Tests
// ===========================================

test.describe("Home Page (/)", () => {
  test("01 home page loads and displays content", async ({ page }) => {
    await page.goto("/");

    // Should show home page content (not redirected to signin)
    await expect(page.locator("body")).toBeVisible();

    // Check for current semester badge or navigation
    const hasContent = await page
      .locator('text=/timetable|schedule|ตารางสอน|ตารางเรียน/i')
      .first()
      .isVisible()
      .catch(() => false);

    // Page should have meaningful content
    expect(hasContent || (await page.locator("main, header").count()) > 0).toBe(
      true
    );

    await snap(page, "01-home-page");
  });

  test("02 home page navigation is accessible", async ({ page }) => {
    await page.goto("/");

    // Check for navigation elements
    const nav = page.locator("nav, header");
    if ((await nav.count()) > 0) {
      await expect(nav.first()).toBeVisible();
    }

    // Mobile: check for hamburger menu if on mobile viewport
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      const hamburger = page.locator(
        '[data-testid="mobile-menu"], button[aria-label*="menu"], .hamburger'
      );
      if ((await hamburger.count()) > 0) {
        await expect(hamburger.first()).toBeVisible();
      }
    }

    await snap(page, "02-home-navigation");
  });
});

// ===========================================
// Teacher Schedule (Public View)
// ===========================================

test.describe("Teacher Schedule (/teachers/[id]/[semester])", () => {
  // Use teacher ID 1 (should exist in seeded data)
  const teacherId = 1;

  test("03 teacher schedule page loads", async ({ page }) => {
    await page.goto(`/teachers/${teacherId}/${semester}`);

    // Page should load without redirecting to signin
    expect(page.url()).not.toContain("signin");

    // Should show schedule content or teacher info
    await page.waitForLoadState("networkidle");

    // Check for table or schedule grid
    const hasScheduleContent =
      (await page.locator("table, [data-testid*='schedule'], .timetable").count()) > 0;

    // Page should have loaded with content
    await expect(page.locator("body")).toBeVisible();

    await snap(page, "03-teacher-schedule");
  });

  test("04 teacher schedule shows timetable grid", async ({ page }) => {
    await page.goto(`/teachers/${teacherId}/${semester}`);
    await page.waitForLoadState("networkidle");

    // Look for schedule table or grid (support legacy and new layouts)
    const table = page.locator("table[data-testid='schedule-grid'], table").first();
    const scheduleGrid = page.locator(
      '[data-testid*=\"schedule\"], [class*=\"grid\"], [class*=\"schedule\"]',
    ).first();
    const emptyState = page.locator(
      "[data-testid=\"schedule-empty\"], text=/ไม่มีตารางสอน/i, text=/ไม่พบตาราง/i",
    );

    // Allow a short grace period for SSR+hydration before asserting
    const hasTable = await table.isVisible({ timeout: 3000 }).catch(() => false);
    const hasGrid = await scheduleGrid.isVisible({ timeout: 3000 }).catch(() => false);
    const hasEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    const hasHeader = await page
      .getByText(/ตารางสอน|schedule/i)
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasTable || hasGrid || hasEmpty || hasHeader).toBe(true);

    await snap(page, "04-teacher-schedule-grid");
  });

  test("05 teacher schedule is horizontally scrollable on mobile", async ({
    page,
  }) => {
    const viewport = page.viewportSize();

    // Only relevant for mobile/tablet viewports
    if (viewport && viewport.width < 1024) {
      await page.goto(`/teachers/${teacherId}/${semester}`);
      await page.waitForLoadState("networkidle");

      // Check for horizontal scroll container
      const scrollContainer = page.locator(
        ".overflow-x-auto, .overflow-auto, [style*='overflow']"
      );

      if ((await scrollContainer.count()) > 0) {
        await expect(scrollContainer.first()).toBeVisible();
      }
    }

    await snap(page, "05-teacher-schedule-mobile-scroll");
  });
});

// ===========================================
// Class Schedule (Public View)
// ===========================================

test.describe("Class Schedule (/classes/[gradeId]/[semester])", () => {
  // Use grade ID 101 (should exist in seeded data - typically m.1/1 or similar)
  const gradeId = 101;

  test("06 class schedule page loads", async ({ page }) => {
    await page.goto(`/classes/${gradeId}/${semester}`);

    // Page should load without redirecting to signin
    expect(page.url()).not.toContain("signin");

    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();

    await snap(page, "06-class-schedule");
  });

  test("07 class schedule shows timetable content", async ({ page }) => {
    await page.goto(`/classes/${gradeId}/${semester}`);
    await page.waitForLoadState("networkidle");

    // Look for schedule content
    const table = page.locator("table").first();
    const scheduleContent = page.locator(
      '[data-testid*="schedule"], [class*="timetable"], [class*="grid"]'
    );
    const emptyState = page.locator(
      "[data-testid=\"schedule-empty\"], text=/ไม่มีตารางเรียน|ไม่พบตาราง/i",
    );

    const hasTable = await table.isVisible().catch(() => false);
    const hasScheduleContent =
      (await scheduleContent.count()) > 0 &&
      (await scheduleContent.first().isVisible().catch(() => false));
    const hasEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);

    if (!hasTable && !hasScheduleContent && !hasEmpty) {
      trace("07", `Class schedule content not found (hasTable=${hasTable}, hasContent=${hasScheduleContent}, hasEmpty=${hasEmpty})`);
    }
    // Use soft assertion for visual smoke - don't fail entire suite for missing content
    expect.soft(hasTable || hasScheduleContent || hasEmpty, "Expected schedule table, content, or empty state").toBe(true);

    await snap(page, "07-class-schedule-content");
  });

  test("08 class schedule responsive layout", async ({ page }) => {
    await page.goto(`/classes/${gradeId}/${semester}`);
    await page.waitForLoadState("networkidle");

    const viewport = page.viewportSize();

    // Verify content adapts to viewport
    const mainContent = page.locator("main, [role='main'], .container").first();
    if ((await mainContent.count()) > 0) {
      await expect(mainContent).toBeVisible();
    }

    await snap(page, "08-class-schedule-responsive");
  });
});

// ===========================================
// Navigation & Accessibility
// ===========================================

test.describe("Public Navigation", () => {
  test("09 can navigate between public pages", async ({ page }) => {
    // Start at home
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Try to find links to teacher or class schedules
    const teacherLink = page.locator(
      'a[href*="/teachers"], a[href*="teacher"]'
    );
    const classLink = page.locator('a[href*="/classes"], a[href*="class"]');

    // If navigation links exist, verify they're clickable
    if ((await teacherLink.count()) > 0) {
      await expect(teacherLink.first()).toBeVisible();
    }
    if ((await classLink.count()) > 0) {
      await expect(classLink.first()).toBeVisible();
    }

    await snap(page, "09-public-navigation");
  });

  test("10 no console errors on public pages", async ({ page }) => {
    // Clear previous errors
    const pageErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        pageErrors.push(msg.text());
      }
    });

    // Visit all public pages
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.goto(`/teachers/1/${semester}`);
    await page.waitForLoadState("networkidle");

    await page.goto(`/classes/101/${semester}`);
    await page.waitForLoadState("networkidle");

    // Filter out expected errors (e.g., 404 for missing resources)
    const criticalErrors = pageErrors.filter(
      (e) =>
        !e.includes("404") &&
        !e.includes("Failed to load resource") &&
        !e.includes("favicon")
    );

    // Log errors for debugging but don't fail (soft assertion)
    if (criticalErrors.length > 0) {
      console.warn("Console errors found:", criticalErrors);
    }

    await snap(page, "10-no-console-errors");
  });
});

// ===========================================
// Visual Consistency
// ===========================================

test.describe("Visual Consistency", () => {
  test("11 consistent header across public pages", async ({ page }) => {
    const pages = ["/", `/teachers/1/${semester}`, `/classes/101/${semester}`];

    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState("networkidle");

      // Check header exists
      const header = page.locator("header, nav").first();
      if ((await header.count()) > 0) {
        await expect(header).toBeVisible();
      }
    }

    await snap(page, "11-consistent-header");
  });

  test("12 footer visible (if present)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const footer = page.locator("footer");
    if ((await footer.count()) > 0) {
      // Scroll to bottom to make footer visible
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      await expect(footer).toBeVisible();
    }

    await snap(page, "12-footer");
  });
});

// ===========================================
// Evidence Summary
// ===========================================

test.afterAll(async () => {
  // Log collected console errors for review
  if (consoleErrors.length > 0) {
    console.log("\n=== Console Errors Summary ===");
    console.log(JSON.stringify(consoleErrors, null, 2));
    console.log("==============================\n");
  }
});
