import { test, expect } from "./fixtures/admin.fixture";
import { testSemester } from "./fixtures/seed-data.fixture";
import { getE2ETeacherId } from "./helpers/teacher-id";

/**
 * E2E Tests for Public Data API Layer
 *
 * These tests verify the public-facing data endpoints that are used by:
 * - Homepage (teachers/classes listings, quick stats)
 * - Public teacher/class detail pages
 * - Analytics dashboards
 *
 * Converted from: __test__/public-data-layer.test.ts (database-dependent integration tests)
 *
 * Key verifications:
 * - PII protection (no email addresses exposed)
 * - Correct data structure and types
 * - Pagination functionality
 * - Sorting behavior
 * - Search/filter functionality
 * - Statistics accuracy
 * - Security (no sensitive data leakage)
 */

// These are public pages/endpoints; they should run unauthenticated.
// Use the `guestPage` fixture to avoid mixing unauth storageState with the
// `authenticatedAdmin` fixture (which navigates to /dashboard).

/**
 * Clicking a tab can race React hydration in `next dev`: the click lands before
 * the onClick handler attaches and is silently lost, leaving the default
 * (teachers) tab active. Re-click until the tab reports aria-selected=true.
 */
const selectTab = async (
  page: import("@playwright/test").Page,
  testId: string,
): Promise<void> => {
  const tab = page.getByTestId(testId);
  await expect(tab).toBeVisible({ timeout: 15000 });
  await expect(async () => {
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true", {
      timeout: 2000,
    });
  }).toPass({ timeout: 20000 });
};

test.describe("Public Teachers Data API", () => {
  test("should load homepage with teachers data", async ({
    guestPage,
  }) => {
    const page = guestPage;
    // Navigate to homepage
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });

    // Check if teachers tab exists and click it
    await expect(page.getByTestId("teachers-tab")).toBeVisible();
    await page.getByTestId("teachers-tab").click();

    // Verify teacher table is visible
    await expect(page.getByTestId("teacher-list")).toBeVisible();

    // Verify the list has content (cards, not table rows)
    const rowCount = await page
      .getByTestId("teacher-list")
      .getByTestId("person-card")
      .count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("should not expose email addresses (PII protection)", async ({
    guestPage,
  }) => {
    const page = guestPage;
    // Navigate to homepage and switch to teachers tab
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await page.getByTestId("teachers-tab").click();

    // Get page content
    const content = await page.content();

    // Check for email patterns in page content
    const emailPattern = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const hasEmail = emailPattern.test(content);

    // Should NOT contain email addresses
    expect(hasEmail).toBe(false);

    // Also check if the word "email" appears in visible content (it shouldn't)
    const emailTextVisible = await page.locator("text=/email/i").count();
    expect(emailTextVisible).toBe(0);
  });

  test("should display teacher name and department", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await page.getByTestId("teachers-tab").click();

    const firstCard = page
      .getByTestId("teacher-list")
      .getByTestId("person-card")
      .first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });

    // Card shows the teacher name (heading) + "department · N คาบ" secondary line
    await expect(firstCard).toContainText(/\S+/); // teacher name
    await expect(firstCard).toContainText(/คาบ/); // department/hours line
  });

  test("should support pagination for teachers", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await page.getByTestId("teachers-tab").click();

    // Check if pagination controls exist
    const paginationExists = await page
      .locator(
        '[role="navigation"], .pagination, button:has-text("Next"), button:has-text("ถัดไป")',
      )
      .count();

    if (paginationExists > 0) {
      // Get first page data
      const firstPageData = await page
        .getByTestId("teacher-list")
        .textContent();

      // Try clicking next page button if available
      const nextButton = page
        .locator(
          'button:has-text("Next"), button:has-text("ถัดไป"), [aria-label*="next"]',
        )
        .first();

      if (await nextButton.isVisible()) {
        await nextButton.click();

        // Verify data changed (client-side pagination, no URL change)
        const secondPageData = await page
          .getByTestId("teacher-list")
          .textContent();
        expect(secondPageData).not.toBe(firstPageData);
      }
    }
  });

  test("should support search functionality for teachers", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await page.getByTestId("teachers-tab").click();

    // Look for search input
    const searchInput = page
      .locator(
        'input[type="search"], input[type="text"][placeholder*="Search"], input[placeholder*="ค้นหา"]',
      )
      .first();

    if (await searchInput.isVisible()) {
      // Type a search term (Thai UI/seed uses Thai department names like "คณิตศาสตร์")
      await searchInput.fill("คณิต");

      // Wait for debounced search results to update
      await expect(async () => {
        const content = await page.getByTestId("teacher-list").textContent();
        expect(content || "").toContain("คณิต");
      }).toPass({ timeout: 3000 });
    }
  });

  test("should load individual teacher detail page", async ({
    authenticatedAdmin,
  }) => {
    // The public teacher page is term-scoped and 404s for teachers without a
    // schedule in the current term, so an arbitrary homepage link is unreliable.
    // Target the E2E teacher, which is seeded with a responsibility in the
    // published term (1-2568). Id resolution needs the authenticated
    // /api/teachers endpoint; the detail page itself is public.
    const { page } = authenticatedAdmin;
    const teacherId = await getE2ETeacherId(page);

    await page.goto(
      `/teachers/${teacherId}/${testSemester.Year}/${testSemester.Semester}`,
      { timeout: 60000, waitUntil: "domcontentloaded" },
    );

    expect(page.url()).toContain("/teachers/");

    // Public teacher schedule uses a grid table (allow dev cold-compile).
    await expect(page.getByTestId("schedule-grid")).toBeVisible({
      timeout: 30000,
    });
  });
});

test.describe("Public Classes Data API", () => {
  test("should load homepage with classes data", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });

    // Check if classes tab exists and click it
    await expect(page.getByTestId("classes-tab")).toBeVisible();
    await selectTab(page, "classes-tab");

    // Verify classes table is visible
    await expect(page.getByTestId("class-list")).toBeVisible();

    // Verify the list has content (cards, not table rows)
    const rowCount = await page
      .getByTestId("class-list")
      .getByTestId("person-card")
      .count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("should not expose individual student data", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await selectTab(page, "classes-tab");

    // Get page content
    const content = await page.content();

    // Should show grade-level data, NOT individual student names
    // Check that we don't have individual student identifiers
    const hasStudentIdPattern = /student[_-]?id|รหัสนักเรียน/i;
    const hasIndividualStudentData = hasStudentIdPattern.test(content);

    // Should be false (no individual student data)
    expect(hasIndividualStudentData).toBe(false);
  });

  test("should display grade level information", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await selectTab(page, "classes-tab");

    const firstCard = page
      .getByTestId("class-list")
      .getByTestId("person-card")
      .first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });

    // Card heading is the grade label: "ม.1/1", "M1-1", or a numeric id like "101"
    await expect(firstCard).toContainText(
      /(ม\.[1-6]\/\d+|M[1-6][-/]\d+|[1-6]\d{2})/,
    );
  });

  test("should support pagination for classes", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await selectTab(page, "classes-tab");

    // Check if pagination controls exist
    const paginationExists = await page
      .locator(
        '[role="navigation"], .pagination, button:has-text("Next"), button:has-text("ถัดไป")',
      )
      .count();

    if (paginationExists > 0) {
      // Get first page data
      const firstPageData = await page.getByTestId("class-list").textContent();

      const nextButton = page
        .locator(
          'button:has-text("Next"), button:has-text("ถัดไป"), [aria-label*="next"]',
        )
        .first();

      if (await nextButton.isVisible()) {
        await nextButton.click();

        // Verify data changed (client-side pagination, no URL change)
        const secondPageData = await page
          .getByTestId("class-list")
          .textContent();
        expect(secondPageData).not.toBe(firstPageData);
      }
    }
  });
});

test.describe("Public Statistics API", () => {
  test("should display quick stats on homepage", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });

    // Check for statistics cards or metrics
    // Common stats: total teachers, total classes, total rooms, etc.
    const statsText = await page.textContent("body");

    // Should have some numeric data (stats)
    const hasNumbers = /\d+/.test(statsText || "");
    expect(hasNumbers).toBe(true);

    // Look for common stat indicators
    const hasStatsLabels = await page
      .locator("text=/total|teachers|classes|rooms|ครู|ห้อง|รวม/i")
      .count();
    expect(hasStatsLabels).toBeGreaterThan(0);
  });

  test("should show valid current term information", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });

    // Check for current term display (e.g., "ภาคเรียนที่ 1 ปีการศึกษา 2568")
    const hasSemesterInfo = await page
      .locator("text=/semester|term|ภาคเรียน|ปีการศึกษา/i")
      .count();

    // Should display current semester somewhere on homepage
    expect(hasSemesterInfo).toBeGreaterThan(0);
  });

  test("should display analytics dashboard with charts", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/dashboard/2568/1/analytics", { timeout: 60000, waitUntil: "domcontentloaded" });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });

    await expect(page.getByRole("heading", { name: /วิเคราะห์/ })).toBeVisible();

    // Check for chart elements or canvas elements
    const hasCharts = await page
      .locator('canvas, svg[class*="recharts"], [class*="chart"]')
      .count();

    if (hasCharts > 0) {
      // Verify charts are rendered
      expect(hasCharts).toBeGreaterThan(0);
    } else {
      // If no charts, at least verify page loaded with data
      const hasAnalyticsContent = await page
        .locator("text=/analytics|analysis|statistics|วิเคราะห์|สถิติ/i")
        .count();
      expect(hasAnalyticsContent).toBeGreaterThan(0);
    }
  });

  test("should show period load data (weekly schedule intensity)", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/dashboard/2568/1/analytics", { timeout: 60000, waitUntil: "domcontentloaded" });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });

    // Look for weekday indicators (MON, TUE, WED, etc.)
    const weekdayPattern = /mon|tue|wed|thu|fri|จันทร์|อังคาร|พุธ|พฤหัส|ศุกร์/i;
    const content = await page.textContent("body");

    const hasWeekdayData = weekdayPattern.test(content || "");

    // Analytics page should show weekly data
    if (
      (await page
        .locator("text=/period load|schedule load|ความหนาแน่น/i")
        .count()) > 0
    ) {
      expect(hasWeekdayData).toBe(true);
    }
  });

  test("should show room occupancy data", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto("/dashboard/2568/1/analytics", { timeout: 60000, waitUntil: "domcontentloaded" });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });

    // Look for room-related statistics
    const hasRoomData = await page
      .locator("text=/room|occupancy|ห้องเรียน|ห้อง/i")
      .count();

    if (hasRoomData > 0) {
      // Verify occupancy percentages are displayed (0-100%)
      const percentPattern = /\d+%/;
      const content = await page.textContent("body");
      const hasPercentages = percentPattern.test(content || "");

      expect(hasPercentages).toBe(true);
    }
  });
});

test.describe("Security & Privacy Checks", () => {
  test("no PII (email) in homepage teachers section", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await page.getByTestId("teachers-tab").click();

    const content = await page.content();

    // Comprehensive email pattern check
    const emailPatterns = [
      /@gmail\.com/i,
      /@yahoo\.com/i,
      /@hotmail\.com/i,
      /@outlook\.com/i,
      /@[a-zA-Z0-9.-]+\.(com|net|org|edu|th)/i,
    ];

    for (const pattern of emailPatterns) {
      const hasEmail = pattern.test(content);
      expect(hasEmail).toBe(false);
    }
  });

  test("no PII (email) in classes section", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await selectTab(page, "classes-tab");

    const content = await page.content();

    // Check for email patterns
    const emailPattern = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const hasEmail = emailPattern.test(content);

    expect(hasEmail).toBe(false);
  });

  test("no PII (phone numbers) in public pages", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });

    const content = await page.content();

    // Check for phone number patterns (Thai format: 06X-XXX-XXXX, 08X-XXX-XXXX)
    const phonePatterns = [
      /0[689]\d-\d{3}-\d{4}/, // 06X-XXX-XXXX
      /0[689]\d{8}/, // 06XXXXXXXX
      /\+66[689]\d{8}/, // +6689XXXXXXXX
    ];

    for (const pattern of phonePatterns) {
      const hasPhone = pattern.test(content);
      expect(hasPhone).toBe(false);
    }
  });

  test("no database connection strings in HTML", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });

    const content = await page.content();

    // Check for common database connection string patterns
    const dbPatterns = [
      /DATABASE_URL/i,
      /postgres:\/\//i,
      /mysql:\/\//i,
      /mongodb:\/\//i,
      /prisma.*connect/i, // Combined pattern for Prisma connection strings
    ];

    const hasDbString = dbPatterns.some((pattern) => pattern.test(content));

    // Should NOT contain database connection info
    expect(hasDbString).toBe(false);
  });

  test("no API keys or secrets in HTML", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });

    const content = await page.content();

    // Check for common secret patterns
    const secretPatterns = [
      /API[_-]?KEY/i,
      /SECRET[_-]?KEY/i,
      /AUTH[_-]?SECRET/i,
      /BETTER[_-]?AUTH[_-]?SECRET/i,
      /GOOGLE[_-]?CLIENT[_-]?SECRET/i,
    ];

    const hasSecret = secretPatterns.some((pattern) => pattern.test(content));

    // Should NOT contain API keys or secrets
    expect(hasSecret).toBe(false);
  });
});

test.describe("Data Validation & Integrity", () => {
  test("teacher utilization should be between 0-150%", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await page.getByTestId("teachers-tab").click();

    const content = await page.textContent("body");

    // Find percentage values in content
    const percentMatches = content?.match(/(\d+)%/g) || [];

    for (const match of percentMatches) {
      const value = parseInt(match.replace("%", ""));

      // Utilization should be reasonable (0-150%, allowing for overtime)
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(150);
    }
  });

  test("grade levels should follow Thai education system (M.1-M.6)", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await selectTab(page, "classes-tab");

    const content = await page.textContent("body");

    // Accept common public formats: Thai "ม.1/1" or English-ish "M1-1".
    expect(content ?? "").toMatch(/(ม\.[1-6]\/\d+|M[1-6][-/]\d+)/);
  });

  test("statistics should be non-negative", async ({ guestPage }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });

    const content = await page.textContent("body");

    // Extract all numbers from page
    const numbers = content?.match(/\b\d+\b/g) || [];

    // All counts should be non-negative (this is implicit, but we check for sanity)
    for (const num of numbers) {
      const value = parseInt(num);
      expect(value).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe("Performance & Caching", () => {
  test("homepage should load within 5 seconds", async ({
    guestPage,
  }) => {
    const page = guestPage;
    const startTime = Date.now();

    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test("switching tabs should not require full page reload", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await page.getByTestId("teachers-tab").click();

    // Verify teachers tab is active
    await expect(page.getByTestId("teachers-tab")).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // Switch to classes tab
    await selectTab(page, "classes-tab");

    // Verify tab state changed (client-side, no URL change)
    await expect(page.getByTestId("classes-tab")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByTestId("teachers-tab")).toHaveAttribute(
      "aria-selected",
      "false",
    );

    // Verify URL did NOT change (client-side state only)
    expect(page.url()).toBe(new URL("/", page.url()).href);
  });

  test("pagination should be fast (client-side)", async ({
    guestPage,
  }) => {
    const page = guestPage;
    await page.goto("/", { timeout: 60000, waitUntil: "domcontentloaded" });
    await page.getByTestId("teachers-tab").click();

    const nextButton = page
      .locator(
        'button:has-text("Next"), button:has-text("ถัดไป"), [aria-label*="next"]',
      )
      .first();

    if (await nextButton.isVisible()) {
      const startTime = Date.now();

      await nextButton.click();

      const paginationTime = Date.now() - startTime;

      // Client-side pagination should be fast (< 1 second)
      expect(paginationTime).toBeLessThan(1000);
    }
  });
});
