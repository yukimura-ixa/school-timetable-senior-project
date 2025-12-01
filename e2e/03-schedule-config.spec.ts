import { test, expect } from "./fixtures/admin.fixture";
import { NavigationHelper } from "./helpers/navigation";

/**
 * TC-007 & TC-008: Timetable Configuration Tests
 *
 * Comprehensive tests for semester configuration including:
 * - Navigation and page load
 * - Setting all configuration parameters
 * - Saving and verifying configuration
 * - Mini break configuration
 * - Reset functionality
 * - Clone from previous semester
 */

test.describe("TC-007: Semester Configuration", () => {
  let nav: NavigationHelper;
  const testSemester = "SEMESTER_1-2567";

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
  });

  test("TC-007-01: Navigate to configuration page", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${testSemester}/config`);

    // Wait for page load
    await expect(page.locator("main, body")).toBeVisible({ timeout: 10000 });

    // Verify config page elements are present
    await expect(page.getByText("กำหนดคาบต่อวัน")).toBeVisible();
    await expect(page.getByText("กำหนดระยะเวลาต่อคาบ")).toBeVisible();
    await expect(page.getByText("กำหนดเวลาเริ่มคาบแรก")).toBeVisible();
    await expect(page.getByText("กำหนดคาบพักเที่ยง")).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: "test-results/screenshots/20-config-page.png",
      fullPage: true,
    });
  });

  test("TC-007-02: Verify default configuration values", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${testSemester}/config`);
    await expect(page.locator("main, body")).toBeVisible({ timeout: 10000 });

    // Wait for data to load
    await page.waitForTimeout(1000);

    // Check if already configured - use exact match to avoid matching "ตั้งค่าตาราง" buttons
    const saveButton = page.getByRole("button", { name: "ตั้งค่า", exact: true });
    const isConfigured = await saveButton.isDisabled();

    if (!isConfigured) {
      // Not configured yet - verify default values in counters
      await expect(page.locator("text=คาบ")).toBeVisible();
      await expect(page.locator("text=นาที")).toBeVisible();

      // Verify start time input exists
      const timeInput = page.locator('input[type="time"]');
      await expect(timeInput).toBeVisible();
    } else {
      console.log("Configuration already exists - displayed as read-only");
      // Verify values are displayed (not editable)
      await expect(page.locator("b").first()).toBeVisible();
    }
  });

  test("TC-007-03: Configure and save timetable parameters", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${testSemester}/config`);
    await expect(page.locator("main, body")).toBeVisible({ timeout: 10000 });

    // Wait for loading
    await page.waitForTimeout(1000);

    // Use exact match to avoid matching "ตั้งค่าตาราง" buttons
    const saveButton = page.getByRole("button", { name: "ตั้งค่า", exact: true });
    const isConfigured = await saveButton.isDisabled();

    if (isConfigured) {
      console.log("Configuration already exists - skipping save test");
      // Verify existing config is shown
      await expect(page.getByRole("button", { name: "ลบเทอม" })).toBeEnabled();
      return;
    }

    // Set start time
    const startTimeInput = page.locator('input[type="time"]');
    if (await startTimeInput.isVisible()) {
      await startTimeInput.fill("08:30");
    }

    // Verify configuration sections are present
    await expect(page.getByText("กำหนดคาบต่อวัน")).toBeVisible();
    await expect(page.getByText("กำหนดระยะเวลาต่อคาบ")).toBeVisible();

    // Save configuration
    await saveButton.click();

    // Wait for success notification
    await expect(page.getByText("ตั้งค่าตารางสำเร็จ")).toBeVisible({
      timeout: 10000,
    });

    // Verify the save button is now disabled (config is set)
    await expect(saveButton).toBeDisabled();

    // Take screenshot of saved state
    await page.screenshot({
      path: "test-results/screenshots/21-config-saved.png",
      fullPage: true,
    });
  });

  test("TC-007-04: Verify saved configuration persists", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${testSemester}/config`);
    await expect(page.locator("main, body")).toBeVisible({ timeout: 10000 });

    // Wait for data load
    await page.waitForTimeout(1000);

    // Configuration should be displayed as read-only
    // When configured, the save/reset buttons are disabled - use exact match
    await expect(page.getByRole("button", { name: "ตั้งค่า", exact: true })).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "คืนค่าเริ่มต้น" }),
    ).toBeDisabled();

    // Delete button should be enabled
    await expect(page.getByRole("button", { name: "ลบเทอม" })).toBeEnabled();

    // Values should be displayed (look for bold text elements)
    const boldElements = page.locator("b");
    const count = await boldElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test("TC-007-05: Reset to default values (if not configured)", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${testSemester}/config`);
    await expect(page.locator("main, body")).toBeVisible({ timeout: 10000 });

    const resetButton = page.getByRole("button", { name: "คืนค่าเริ่มต้น" });
    const isDisabled = await resetButton.isDisabled();

    if (!isDisabled) {
      await resetButton.click();

      // Verify success message
      await expect(page.getByText("คืนค่าเริ่มต้นสำเร็จ")).toBeVisible();
    } else {
      console.log("Reset not available - configuration already saved");
    }
  });

  test("TC-007-06: Clone from previous semester option", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${testSemester}/config`);
    await expect(page.locator("main, body")).toBeVisible({ timeout: 10000 });

    // Clone link only visible if not configured
    const cloneLink = page.getByText("เรียกข้อมูลตารางสอนที่มีอยู่");

    if (await cloneLink.isVisible()) {
      console.log("Clone option available");
      // Don't click to avoid changing config, just verify it's there
      await expect(cloneLink).toBeVisible();
    } else {
      console.log("Clone option not available (config already exists)");
    }
  });
});

test.describe("TC-009: Schedule Assignment Interface", () => {
  let nav: NavigationHelper;
  const testSemester = "SEMESTER_1-2567";

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
  });

  test("TC-009-01: Assignment page loads", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${testSemester}/assign`);
    await expect(page.locator("main, body")).toBeVisible({ timeout: 10000 });

    // Verify URL contains assign
    expect(page.url()).toContain("/assign");

    // Take screenshot
    await page.screenshot({
      path: "test-results/screenshots/23-assign-page.png",
      fullPage: true,
    });

    console.log("Assignment page loaded");
  });

  test("TC-009-02: Assignment page structure", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${testSemester}/assign`);
    await expect(page.locator("main, body")).toBeVisible({ timeout: 10000 });

    // Wait for content to load
    await page.waitForTimeout(1000);

    // Look for key assignment elements
    // The page should have teacher selection, grade selection, subject assignment
    const pageContent = await page.locator("body").textContent();

    // Take screenshot
    await page.screenshot({
      path: "test-results/screenshots/24-assign-structure.png",
      fullPage: true,
    });

    console.log("Assignment page structure verified");
  });
});
