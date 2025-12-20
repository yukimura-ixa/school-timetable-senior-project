/**
 * @file admin-edge-cases.spec.ts
 * @description Edge case tests for critical admin paths
 *
 * Covers edge cases not tested in main test suites:
 * 1. Auth: Invalid credentials, empty fields
 * 2. CRUD: Validation errors, duplicate prevention, delete cascade
 * 3. Navigation: Invalid routes, non-existent semesters
 *
 * Priority: HIGH - These are common user error scenarios
 */

import { test, expect } from "../fixtures/admin.fixture";

test.describe.skip("Auth Edge Cases", () => {
  test("TC-AUTH-E01: Invalid password shows error message", async ({
    browser,
  }) => {
    // Create fresh unauthenticated context
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto("/signin");
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });

    // Fill valid email but wrong password
    await page.fill('input[type="email"]', "admin@school.local");
    await page.fill('input[type="password"]', "wrongpassword123");

    // Submit
    const submitButton = page
      .locator('button:not([data-testid="google-signin-button"])', {
        hasText: /เข้าสู่ระบบ|sign in|login/i,
      })
      .first();
    await submitButton.click();

    // Should show error message (not redirect to dashboard)
    await expect(page).not.toHaveURL(/\/dashboard/, { timeout: 5000 });

    // Look for error text (Thai: "ข้อมูลไม่ถูกต้อง" or similar)
    const errorMessage = page.locator(
      "text=/ข้อมูลไม่ถูกต้อง|invalid|incorrect|ผิดพลาด|error/i",
    );
    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });

    await context.close();
  });

  test("TC-AUTH-E02: Empty credentials show validation error", async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto("/signin");
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    const submitButton = page
      .locator('button:not([data-testid="google-signin-button"])', {
        hasText: /เข้าสู่ระบบ|sign in|login/i,
      })
      .first();

    // Either button should be disabled or form shows validation
    const isDisabled = await submitButton.isDisabled().catch(() => false);

    if (!isDisabled) {
      // Try to submit
      await submitButton.click();

      // Should stay on signin page
      await expect(page).toHaveURL(/\/signin/);

      // Should show validation error or HTML5 validation
      const hasValidation =
        (await page
          .locator("input:invalid")
          .first()
          .isVisible()
          .catch(() => false)) ||
        (await page
          .locator("text=/required|กรุณา|ต้อง/i")
          .first()
          .isVisible()
          .catch(() => false));

      expect(hasValidation).toBe(true);
    } else {
      // Button disabled is valid behavior for empty form
      expect(isDisabled).toBe(true);
    }

    await context.close();
  });

  test("TC-AUTH-E03: Non-existent user shows error", async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto("/signin");
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await page.fill('input[type="email"]', "nonexistent@school.local");
    await page.fill('input[type="password"]', "anypassword123");

    const submitButton = page
      .locator('button:not([data-testid="google-signin-button"])', {
        hasText: /เข้าสู่ระบบ|sign in|login/i,
      })
      .first();
    await submitButton.click();

    // Should not redirect to dashboard
    await expect(page).not.toHaveURL(/\/dashboard/, { timeout: 5000 });

    // Should show error
    const errorMessage = page.locator(
      "text=/ไม่พบ|not found|invalid|ผิดพลาด|error/i",
    );
    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });

    await context.close();
  });
});

test.describe.skip("CRUD Validation Edge Cases", () => {
  test("TC-CRUD-E01: Create teacher with missing required field shows error", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/management/teacher");
    await page.waitForSelector("table", { timeout: 15000 });

    // Open add modal
    const addButton = page.locator('[data-testid="add-teacher-button"]');
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // Wait for modal
    await page.waitForSelector('[data-testid="firstname-0"]', {
      timeout: 10000,
    });

    // Fill only firstname, leave lastname empty
    await page.locator('[data-testid="firstname-0"]').fill("TestFirstOnly");
    // Don't fill lastname

    // Try to submit
    const submitButton = page.locator('[data-testid="add-teacher-submit"]');
    await submitButton.click();

    // Should show validation error (not success)
    // Either stay in modal with error OR show snackbar error
    const hasError =
      (await page
        .locator("text=/required|กรุณา|ต้อง|ผิดพลาด/i")
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)) ||
      (await page
        .locator('[data-testid="firstname-0"]')
        .isVisible()
        .catch(() => false)); // Still in modal

    expect(hasError).toBe(true);

    // Close modal if still open
    await page.keyboard.press("Escape");
  });

  test("TC-CRUD-E02: Create subject with duplicate code shows error", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/management/subject");
    await page.waitForSelector("table", { timeout: 15000 });

    // Get existing subject code from table
    const existingCode = await page
      .locator("table tbody tr td")
      .first()
      .textContent();

    if (!existingCode) {
      console.log("No existing subjects to test duplicate - skipping");
      return;
    }

    // Add new subject with same code
    const addButton = page.getByRole("button", { name: "เพิ่ม" });
    await addButton.click();

    // Wait for new row
    await page.waitForSelector('tbody tr input[type="text"]', {
      timeout: 10000,
    });

    // Fill duplicate code
    const editingRow = page
      .locator("tbody tr")
      .filter({ has: page.locator('input[type="text"]') })
      .first();
    const codeInput = editingRow.locator('input[type="text"]').first();
    await codeInput.fill(existingCode.trim().substring(0, 10));

    // Try to save
    const saveButton = page.locator('button[aria-label="save"]');
    await saveButton.click();

    // Should show error for duplicate
    const errorSnackbar = page.locator("text=/ซ้ำ|duplicate|already.*exist/i");
    const isVisible = await errorSnackbar
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    // If no error visible, might be validation on frontend
    if (!isVisible) {
      // Check if still in edit mode (save failed)
      const stillEditing = await codeInput.isVisible().catch(() => false);
      expect(stillEditing).toBe(true);
    }
  });

  test("TC-CRUD-E03: Delete teacher and verify removal from list", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/management/teacher");
    await page.waitForSelector("table", { timeout: 15000 });

    // First create a teacher to delete
    const uniqueId = `DEL${Date.now().toString().slice(-6)}`;
    const addButton = page.locator('[data-testid="add-teacher-button"]');
    await addButton.click();

    await page.locator('[data-testid="firstname-0"]').fill(`Delete${uniqueId}`);
    await page.locator('[data-testid="lastname-0"]').fill(`Test${uniqueId}`);

    const submitButton = page.locator('[data-testid="add-teacher-submit"]');
    await submitButton.click();

    // Wait for success
    await expect(
      page.locator("text=/สำเร็จ/").first(),
    ).toBeVisible({ timeout: 15000 });

    // Search for the teacher
    await page.getByTestId("teacher-search").fill(`Delete${uniqueId}`);
    await page.waitForTimeout(500);

    // Select and delete
    await page.locator('tbody input[type="checkbox"]').first().check();
    await page.getByLabel("delete").click();

    // Confirm deletion
    const confirmButton = page.getByRole("button", { name: "ลบ", exact: true });
    await confirmButton.click();

    // Verify removed from list
    await expect(page.locator(`text=Delete${uniqueId}`)).not.toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe.skip("Navigation Edge Cases", () => {
  test("TC-NAV-E01: Invalid semester format shows error or redirects", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    // Try invalid semester format
    const response = await page.goto("/schedule/invalid-semester/config");

    // Should either:
    // 1. Show 404 error
    // 2. Redirect to valid route
    // 3. Show error message

    const status = response?.status() || 200;

    if (status === 404) {
      // 404 is valid response
      expect(status).toBe(404);
    } else {
      // Check for error message or redirect
      const hasError =
        (await page
          .locator("text=/ไม่พบ|not found|error|invalid/i")
          .first()
          .isVisible({ timeout: 5000 })
          .catch(() => false)) ||
        (await page.url().includes("/dashboard")) ||
        (await page.url().includes("/signin"));

      expect(hasError).toBe(true);
    }
  });

  test("TC-NAV-E02: Non-existent semester shows appropriate message", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    // Try non-existent but valid format semester
    await page.goto("/schedule/9-9999/config");
    // Wait for page content to load (either error state or redirect)
    await expect(page.locator("body")).not.toBeEmpty({ timeout: 10000 });

    // Should show error or empty state (not crash)
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();

    // Either shows "not found" message or redirects
    const hasAppropriateResponse =
      pageContent?.includes("ไม่พบ") ||
      pageContent?.includes("not found") ||
      page.url().includes("/dashboard") ||
      page.url().includes("/signin") ||
      (await page
        .locator("text=/ไม่มีข้อมูล|no data/i")
        .first()
        .isVisible()
        .catch(() => false));

    expect(hasAppropriateResponse).toBe(true);
  });

  test("TC-NAV-E03: Protected route without auth redirects to signin", async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    // Try accessing schedule config without auth
    await page.goto("/schedule/1-2567/config");

    // Should redirect to signin
    await expect(page).toHaveURL(/\/signin/, { timeout: 15000 });

    await context.close();
  });
});

test.describe.skip("Table View Edge Cases", () => {
  test("TC-TABLE-E01: Student table page loads correctly", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard/1-2567/student-table");

    // Should load without errors
    await expect(page).toHaveURL(/\/student-table/);

    // Wait for content
    const content = page
      .locator("table")
      .or(page.locator('[class*="Skeleton"]'))
      .or(page.locator("text=/นักเรียน|student|ตารางเรียน/i"));

    await expect(content.first()).toBeVisible({ timeout: 15000 });
  });

  test("TC-TABLE-E02: All timeslot page loads and shows grid", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard/1-2567/all-timeslot");

    // Should load without errors
    await expect(page).toHaveURL(/\/all-timeslot/);

    // Should have meaningful content
    const content = await page.textContent("body");
    expect(content?.length).toBeGreaterThan(100);

    // Should have some table or grid structure
    const hasTableOrGrid =
      (await page.locator("table").count()) > 0 ||
      (await page.locator('[role="grid"]').count()) > 0 ||
      (await page.locator('[class*="timetable"]').count()) > 0;

    expect(hasTableOrGrid).toBe(true);
  });

  test("TC-TABLE-E03: Teacher table shows filter controls", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/dashboard/1-2567/teacher-table");
    // Wait for table or filter controls to be visible
    await expect(page.locator('table, [role="combobox"], input')).toBeVisible({ timeout: 15000 });

    // Should have filter or search controls
    const hasFilters =
      (await page.locator('input[placeholder*="ค้นหา"]').count()) > 0 ||
      (await page.locator('input[placeholder*="search"]').count()) > 0 ||
      (await page.locator("select").count()) > 0 ||
      (await page.locator('[role="combobox"]').count()) > 0;

    expect(hasFilters).toBe(true);
  });
});

test.describe.skip("Conflict Detection Edge Cases", () => {
  test("TC-CONF-E01: Arrange page shows conflict legend", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/schedule/1-2567/arrange");
    // Wait for arrange page content to load
    await expect(page.locator('[class*="timetable"], table, [class*="grid"]').first()).toBeVisible({ timeout: 15000 });

    // Look for conflict-related legend items
    const legendItems = page.locator(
      "text=/คาบว่าง|คาบพัก|คาบล็อก|ว่าง|occupied|locked/i",
    );

    const hasLegend = (await legendItems.count()) > 0;
    expect(hasLegend).toBe(true);
  });

  test("TC-CONF-E02: Lock page displays existing locks", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/schedule/1-2567/lock");
    // Wait for lock page content
    await expect(page.locator('table, [class*="grid"], main')).toBeVisible({ timeout: 15000 });

    // Page should load without errors
    const content = await page.textContent("body");
    expect(content?.length).toBeGreaterThan(100);

    // Should have lock-related UI elements
    const hasLockUI =
      (await page.locator("text=/ล็อก|lock/i").count()) > 0 ||
      (await page.locator("table").count()) > 0;

    expect(hasLockUI).toBe(true);
  });
});

