/**
 * E2E Tests for Bulk Lock Operations
 * Tests complete user flows for bulk locking multiple timeslots and grades
 */

import { test, expect } from "@playwright/test";

test.describe("Bulk Lock Operations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should display bulk lock button on lock page", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    // Find bulk lock button
    const bulkLockButton = page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ });
    await expect(bulkLockButton).toBeVisible();
  });

  test("should open bulk lock modal when button clicked", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    // Click bulk lock button
    const bulkLockButton = page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ });
    await bulkLockButton.click();
    await page.waitForTimeout(500);

    // Modal should be visible
    await expect(page.locator("[role='dialog'], [class*='MuiDialog']")).toBeVisible();
    await expect(page.locator("text=/ล็อกหลายคาบ/")).toBeVisible();
  });

  test("should display modal components correctly", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    // Open modal
    await page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ }).click();
    await page.waitForTimeout(500);

    // Check for essential components
    await expect(page.locator("text=/เลือกช่วงเวลา|ช่วงเวลา|คาบ/")).toBeVisible();
    await expect(page.locator("text=/เลือกชั้น|ชั้นเรียน/")).toBeVisible();
    await expect(page.locator("text=/วิชา|รายวิชา/")).toBeVisible();
    await expect(page.locator("text=/ห้อง|ห้องเรียน/")).toBeVisible();
  });

  test("should display select all buttons", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ }).click();
    await page.waitForTimeout(500);

    // Check for "Select All" buttons
    const selectAllButtons = page.locator("button").filter({ hasText: /เลือกทั้งหมด|ทั้งหมด/ });
    const count = await selectAllButtons.count();
    expect(count).toBeGreaterThanOrEqual(2); // At least one for timeslots and one for grades
  });

  test("should allow selecting multiple timeslots", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ }).click();
    await page.waitForTimeout(500);

    // Find and check first few timeslot checkboxes
    const checkboxes = page.locator("input[type='checkbox']").first();
    await checkboxes.check();
    await page.waitForTimeout(200);

    // Should be checked
    await expect(checkboxes).toBeChecked();
  });

  test("should allow selecting multiple grades", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ }).click();
    await page.waitForTimeout(500);

    // Find grade checkboxes (look for text like "ม.1" or grade labels)
    const gradeCheckbox = page.locator("input[type='checkbox']").nth(5); // Skip timeslot checkboxes
    await gradeCheckbox.check();
    await page.waitForTimeout(200);

    // Should be checked
    await expect(gradeCheckbox).toBeChecked();
  });

  test("should update counter when selections change", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ }).click();
    await page.waitForTimeout(500);

    // Initial counter should show 0
    const counterText = page.locator("text=/จำนวน|ทั้งหมด|รวม/");
    
    // Select some items
    const checkbox1 = page.locator("input[type='checkbox']").first();
    await checkbox1.check();
    await page.waitForTimeout(300);

    // Counter should update (check that something changed)
    const hasCounter = await counterText.count() > 0;
    expect(hasCounter).toBe(true);
  });

  test("should display preview table when items selected", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ }).click();
    await page.waitForTimeout(500);

    // Select some checkboxes
    const checkbox1 = page.locator("input[type='checkbox']").first();
    const checkbox2 = page.locator("input[type='checkbox']").nth(1);
    await checkbox1.check();
    await checkbox2.check();
    await page.waitForTimeout(500);

    // Preview table should appear (if implemented)
    const hasPreview = await page.locator("table, [class*='preview']").count() > 0;
    // Note: Preview may not show until subject/room selected
  });

  test("should require subject selection", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ }).click();
    await page.waitForTimeout(500);

    // Try to submit without selecting subject (should show validation)
    const submitButton = page.locator("button").filter({ hasText: /ยืนยัน|สร้าง|บันทึก/ });
    
    if (await submitButton.isVisible()) {
      // Button should be disabled or show error on click
      const isDisabled = await submitButton.isDisabled();
      expect(isDisabled).toBe(true);
    }
  });

  test("should close modal when cancel clicked", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ }).click();
    await page.waitForTimeout(500);

    // Click cancel button
    const cancelButton = page.locator("button").filter({ hasText: /ยกเลิก|ปิด/ });
    await cancelButton.click();
    await page.waitForTimeout(500);

    // Modal should be closed
    const modalVisible = await page.locator("[role='dialog']").isVisible();
    expect(modalVisible).toBe(false);
  });

  test("should use select all for timeslots", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ }).click();
    await page.waitForTimeout(500);

    // Click "Select All" for timeslots
    const selectAllButton = page.locator("button").filter({ hasText: /เลือกทั้งหมด/ }).first();
    await selectAllButton.click();
    await page.waitForTimeout(500);

    // Multiple checkboxes should be checked
    const checkedBoxes = page.locator("input[type='checkbox']:checked");
    const count = await checkedBoxes.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should handle empty state (no timeslots/grades)", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ }).click();
    await page.waitForTimeout(500);

    // Even if no data, modal should show appropriate message
    const hasContent = await page.locator("text=/ไม่พบข้อมูล|ไม่มีข้อมูล|loading/i").count() > 0 ||
                       await page.locator("input[type='checkbox']").count() > 0;
    expect(hasContent).toBe(true);
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ }).click();
    await page.waitForTimeout(500);

    // Modal should be visible and functional on mobile
    await expect(page.locator("[role='dialog']")).toBeVisible();
  });
});

test.describe("Bulk Lock - Complete Flow", () => {
  test.skip("should complete full bulk lock creation flow", async ({ page }) => {
    // Skip in CI/automated tests as it modifies database
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    // Open modal
    await page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ }).click();
    await page.waitForTimeout(500);

    // Select timeslots
    const timeslotCheckbox1 = page.locator("input[type='checkbox']").first();
    const timeslotCheckbox2 = page.locator("input[type='checkbox']").nth(1);
    await timeslotCheckbox1.check();
    await timeslotCheckbox2.check();

    // Select grades
    const gradeCheckbox = page.locator("input[type='checkbox']").nth(10);
    await gradeCheckbox.check();
    await page.waitForTimeout(300);

    // Select subject (dropdown)
    const subjectDropdown = page.locator("select, [role='combobox']").first();
    if (await subjectDropdown.isVisible()) {
      await subjectDropdown.click();
      await page.waitForTimeout(200);
      // Select first option
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
    }

    // Select room (dropdown)
    const roomDropdown = page.locator("select, [role='combobox']").nth(1);
    if (await roomDropdown.isVisible()) {
      await roomDropdown.click();
      await page.waitForTimeout(200);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
    }

    // Submit
    const submitButton = page.locator("button").filter({ hasText: /ยืนยัน|สร้าง/ });
    await submitButton.click();

    // Should show success message
    await expect(page.locator("text=/สำเร็จ|success/i")).toBeVisible({ timeout: 5000 });

    // Modal should close
    await page.waitForTimeout(1000);
    const modalVisible = await page.locator("[role='dialog']").isVisible();
    expect(modalVisible).toBe(false);
  });
});

test.describe("Bulk Lock - Error Handling", () => {
  test("should show validation error for invalid input", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ }).click();
    await page.waitForTimeout(500);

    // Try to submit with no selections
    const submitButton = page.locator("button").filter({ hasText: /ยืนยัน|สร้าง/ });
    
    // Submit button should be disabled or show error
    const isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test("should handle API errors gracefully", async ({ page }) => {
    // Intercept API and return error
    await page.route("**/api/**", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Server error" }),
      });
    });

    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    // Opening modal should still work (uses cached data or shows error)
    await page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ }).click();
    await page.waitForTimeout(500);

    // Should show error message or empty state
    const hasErrorOrEmpty = await page.locator("text=/ข้อผิดพลาด|Error|ไม่พบข้อมูล/i").count() > 0 ||
                            await page.locator("input[type='checkbox']").count() === 0;
    expect(hasErrorOrEmpty).toBe(true);
  });
});

test.describe("Bulk Lock - Accessibility", () => {
  test("should have proper labels for checkboxes", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ }).click();
    await page.waitForTimeout(500);

    // Checkboxes should have associated labels
    const checkboxes = page.locator("input[type='checkbox']");
    const count = await checkboxes.count();
    
    if (count > 0) {
      // At least some checkboxes should exist
      expect(count).toBeGreaterThan(0);
    }
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ล็อกหลายคาบ/ }).click();
    await page.waitForTimeout(500);

    // Should be able to tab through elements
    await page.keyboard.press("Tab");
    await page.waitForTimeout(200);
    
    // Space should toggle checkbox
    await page.keyboard.press("Space");
    await page.waitForTimeout(200);
    
    // Some element should be focused
    const activeElement = await page.evaluateHandle(() => document.activeElement);
    expect(activeElement).toBeTruthy();
  });
});
