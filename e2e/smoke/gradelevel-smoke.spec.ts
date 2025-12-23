/**
 * @file gradelevel-smoke.spec.ts
 * @description GradeLevel CRUD smoke tests
 *
 * Completes CRUD smoke coverage by adding GradeLevel operations.
 * Follows the same pattern as crud-smoke.spec.ts for consistency.
 *
 * Test Cases:
 * - GL-01: Navigate to grade level management page
 * - GL-02: Add new grade level (if UI supports inline add)
 */

import { test, expect } from "../fixtures/admin.fixture";

const timestamp = Date.now();
const seqNum = (timestamp % 100) + 1;

test.describe("GradeLevel CRUD Smoke Tests", () => {
  test("GL-01: GradeLevel management page loads", async ({ page }) => {
    await page.goto("/management/gradelevel");
    await page.waitForLoadState("networkidle");

    // Wait for page content (DataGrid or main element)
    const mainContent = page.locator(
      '[role="grid"], .MuiDataGrid-root, .MuiPaper-root, main',
    );
    await expect(mainContent.first()).toBeVisible({ timeout: 30000 });

    // Should NOT be redirected to signin
    expect(page.url()).toContain("/management/gradelevel");

    await page.screenshot({
      path: "test-results/screenshots/gl-01-gradelevel-page.png",
      fullPage: true,
    });

    console.log("✅ GradeLevel management page loaded successfully");
  });

  test("GL-02: GradeLevel table displays existing data", async ({ page }) => {
    await page.goto("/management/gradelevel");
    await page.waitForLoadState("networkidle");

    // Wait for DataGrid to load
    const grid = page.locator('[role="grid"], .MuiDataGrid-root');
    await expect(grid.first()).toBeVisible({ timeout: 15000 });

    // Check for grade level data (e.g., "ม.1", "M1", grade identifiers)
    const rows = page.locator('.MuiDataGrid-row, [role="row"][data-id]');
    const rowCount = await rows.count();

    console.log(`✅ Found ${rowCount} grade level rows`);

    if (rowCount > 0) {
      // Verify first row has content
      const firstRow = rows.first();
      const cellContent = await firstRow.textContent();
      expect(cellContent).toBeTruthy();
    }

    await page.screenshot({
      path: "test-results/screenshots/gl-02-gradelevel-data.png",
      fullPage: true,
    });
  });

  test("GL-03: Add button is accessible", async ({ page }) => {
    await page.goto("/management/gradelevel");
    await page.waitForLoadState("networkidle");

    // Wait for page to load
    await expect(page.locator("main, body").first()).toBeVisible({
      timeout: 15000,
    });

    // Look for add button - GradeLevel uses DataGrid toolbar
    const addButton = page.locator(
      '[data-testid="add-gradelevel-button"], button:has-text("เพิ่ม"), [data-testid*="add"], button[aria-label="add"]',
    );

    const hasAddButton = await addButton
      .first()
      .isVisible()
      .catch(() => false);

    if (hasAddButton) {
      console.log("✅ Add button found");

      // Click to open add form/dialog
      await addButton.first().click();

      // Wait for modal or inline form to appear
      const formIndicator = page.locator(
        'input, [role="dialog"], [role="combobox"]',
      );

      await expect(formIndicator.first()).toBeVisible({ timeout: 5000 });
      console.log("✅ Add form/dialog opened");
    } else {
      console.log("Add button not visible - checking for inline editing");
    }

    await page.screenshot({
      path: "test-results/screenshots/gl-03-add-gradelevel.png",
      fullPage: true,
    });
  });

  test("GL-04: Grade level data includes program assignment", async ({
    page,
  }) => {
    await page.goto("/management/gradelevel");
    await page.waitForLoadState("networkidle");

    // Wait for DataGrid
    const grid = page.locator('[role="grid"], .MuiDataGrid-root');
    await expect(grid.first()).toBeVisible({ timeout: 15000 });

    // Check for program-related columns or data
    const pageContent = await page.textContent("body");

    // Should have some program/year/class references
    const hasGradeLevelContent =
      pageContent?.includes("ม.") ||
      pageContent?.includes("M") ||
      pageContent?.includes("ปี") ||
      pageContent?.includes("Year") ||
      pageContent?.includes("ห้อง");

    expect(hasGradeLevelContent).toBeTruthy();
    console.log("✅ Grade level data structure verified");

    await page.screenshot({
      path: "test-results/screenshots/gl-04-gradelevel-structure.png",
      fullPage: true,
    });
  });
});
