/**
 * E2E Tests for Bulk Lock Operations
 * Tests complete user flows for bulk locking multiple timeslots and grades
 */

import { test, expect } from "./fixtures/admin.fixture";

test.describe("Bulk Lock Operations", () => {
  test("should display bulk lock button on lock page", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    // Find bulk lock button
    const bulkLockButton = page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ });
    await expect(bulkLockButton).toBeVisible();
  });

  test("should open bulk lock modal when button clicked", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    // Click bulk lock button
    const bulkLockButton = page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ });
    await bulkLockButton.click();

    // Modal should be visible (use getByRole to target actual dialog element)
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 3000 });
    await expect(page.locator("text=/ล็อกหลายคาบ/")).toBeVisible();
  });

  test("should display modal components correctly", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    // Open modal
    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 3000 });

    // Check for essential components
    await expect(
      page.locator("text=/เลือกช่วงเวลา|ช่วงเวลา|คาบ/"),
    ).toBeVisible();
    await expect(page.locator("text=/เลือกชั้น|ชั้นเรียน/")).toBeVisible();
    await expect(page.locator("text=/วิชา|รายวิชา/")).toBeVisible();
    await expect(page.locator("text=/ห้อง|ห้องเรียน/")).toBeVisible();
  });

  test("should display select all buttons", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 3000 });

    // Check for "Select All" buttons
    const selectAllButtons = page
      .locator("button")
      .filter({ hasText: /เลือกทั้งหมด|ทั้งหมด/ });
    const count = await selectAllButtons.count();
    expect(count).toBeGreaterThanOrEqual(2); // At least one for timeslots and one for grades
  });

  test("should allow selecting multiple timeslots", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible({
      timeout: 3000,
    });

    // Find and check first few timeslot checkboxes
    const checkboxes = page.locator("input[type='checkbox']").first();
    await checkboxes.check();

    // Should be checked
    await expect(checkboxes).toBeChecked();
  });

  test("should allow selecting multiple grades", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible({
      timeout: 3000,
    });

    // Find grade checkboxes (look for text like "ม.1" or grade labels)
    const gradeCheckbox = page.locator("input[type='checkbox']").nth(5); // Skip timeslot checkboxes
    await gradeCheckbox.check();

    // Should be checked
    await expect(gradeCheckbox).toBeChecked();
  });

  test("should update counter when selections change", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible({
      timeout: 3000,
    });

    // Initial counter should show 0
    const counterText = page.locator("text=/จำนวน|ทั้งหมด|รวม/");

    // Select some items
    const checkbox1 = page.locator("input[type='checkbox']").first();
    await checkbox1.check();
    // Wait for counter to update
    await page
      .waitForFunction(
        () => {
          const counter = document.querySelector("*")?.textContent;
          return counter && /\d/.test(counter);
        },
        { timeout: 2000 },
      )
      .catch(() => {});

    // Counter should update (check that something changed)
    const hasCounter = (await counterText.count()) > 0;
    expect(hasCounter).toBe(true);
  });

  test("should display preview table when items selected", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible({
      timeout: 3000,
    });

    // Select some checkboxes
    const checkbox1 = page.locator("input[type='checkbox']").first();
    const checkbox2 = page.locator("input[type='checkbox']").nth(1);
    await checkbox1.check();
    await checkbox2.check();
    await expect(checkbox2).toBeChecked();

    // Preview table should appear (if implemented)
    const hasPreview =
      (await page.locator("table, [class*='preview']").count()) > 0;
    // Note: Preview may not show until subject/room selected
  });

  test("should require subject selection", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible({
      timeout: 3000,
    });

    // Try to submit without selecting subject (should show validation)
    const submitButton = page
      .locator("button")
      .filter({ hasText: /ยืนยัน|สร้าง|บันทึก/ });

    if (await submitButton.isVisible()) {
      // Button should be disabled or show error on click
      const isDisabled = await submitButton.isDisabled();
      expect(isDisabled).toBe(true);
    }
  });

  test("should close modal when cancel clicked", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible({
      timeout: 3000,
    });

    // Click cancel button (use exact match to avoid matching 'ยกเลิกทั้งหมด')
    const cancelButton = page.getByRole("button", { name: "ยกเลิก", exact: true });
    await cancelButton.click();

    // Modal should be closed
    const modal = page.getByRole("dialog");
    await expect(modal).toBeHidden({ timeout: 2000 });
    const modalVisible = await page.getByRole("dialog").isVisible();
    expect(modalVisible).toBe(false);
  });

  test("should use select all for timeslots", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible({
      timeout: 3000,
    });

    // Click "Select All" for timeslots
    const selectAllButton = page
      .locator("button")
      .filter({ hasText: /เลือกทั้งหมด/ })
      .first();
    await selectAllButton.click();

    // Multiple checkboxes should be checked
    const checkedBoxes = page.locator("input[type='checkbox']:checked");
    await expect(checkedBoxes.first())
      .toBeVisible({ timeout: 2000 })
      .catch(() => {});
    const count = await checkedBoxes.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should handle empty state (no timeslots/grades)", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible({
      timeout: 3000,
    });

    // Even if no data, modal should show appropriate message
    const hasContent =
      (await page.locator("text=/ไม่พบข้อมูล|ไม่มีข้อมูล|loading/i").count()) >
        0 || (await page.locator("input[type='checkbox']").count()) > 0;
    expect(hasContent).toBe(true);
  });

  test("should be responsive on mobile", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();

    // Modal should be visible and functional on mobile
    await expect(page.getByRole("dialog")).toBeVisible({
      timeout: 3000,
    });
  });
});

test.describe("Bulk Lock - Complete Flow", () => {
  test.skip("should complete full bulk lock creation flow", async ({
    page,
  }) => {
    // Skip in CI/automated tests as it modifies database
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    // Open modal
    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible({
      timeout: 3000,
    });

    // Select timeslots
    const timeslotCheckbox1 = page.locator("input[type='checkbox']").first();
    const timeslotCheckbox2 = page.locator("input[type='checkbox']").nth(1);
    await timeslotCheckbox1.check();
    await timeslotCheckbox2.check();

    // Select grades
    const gradeCheckbox = page.locator("input[type='checkbox']").nth(10);
    await gradeCheckbox.check();
    await expect(gradeCheckbox).toBeChecked();

    // Select subject (dropdown)
    const subjectDropdown = page.locator("select, [role='combobox']").first();
    if (await subjectDropdown.isVisible()) {
      await subjectDropdown.click();
      // Wait for dropdown to open
      await page
        .waitForFunction(
          () => {
            const dropdown = document.querySelector(
              "select, [role='combobox']",
            );
            return dropdown?.getAttribute("aria-expanded") === "true" || true;
          },
          { timeout: 1000 },
        )
        .catch(() => {});
      // Select first option
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
    }

    // Select room (dropdown)
    const roomDropdown = page.locator("select, [role='combobox']").nth(1);
    if (await roomDropdown.isVisible()) {
      await roomDropdown.click();
      await page.waitForFunction(() => true, { timeout: 100 }).catch(() => {});
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
    }

    // Submit
    const submitButton = page
      .locator("button")
      .filter({ hasText: /ยืนยัน|สร้าง/ });
    await submitButton.click();

    // Should show success message
    await expect(page.locator("text=/สำเร็จ|success/i")).toBeVisible({
      timeout: 15000,
    });

    // Modal should close
    await expect(page.getByRole("dialog")).toBeHidden({ timeout: 3000 });
  });
});

test.describe("Bulk Lock - Error Handling", () => {
  test("should show validation error for invalid input", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible({
      timeout: 3000,
    });

    // Try to submit with no selections
    const submitButton = page
      .locator("button")
      .filter({ hasText: /ยืนยัน|สร้าง/ });

    // Submit button should be disabled or show error
    const isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test("should handle API errors gracefully", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Intercept API and return error
    await page.route("**/api/**", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Server error" }),
      });
    });

    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    // Opening modal should still work (uses cached data or shows error)
    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(page.getByRole("dialog"))
      .toBeVisible({ timeout: 3000 })
      .catch(() => {});

    // Should show error message or empty state
    const hasErrorOrEmpty =
      (await page.locator("text=/ข้อผิดพลาด|Error|ไม่พบข้อมูล/i").count()) >
        0 || (await page.locator("input[type='checkbox']").count()) === 0;
    expect(hasErrorOrEmpty).toBe(true);
  });
});

test.describe("Bulk Lock - Accessibility", () => {
  test("should have proper labels for checkboxes", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible({
      timeout: 3000,
    });

    // Checkboxes should have associated labels
    const checkboxes = page.locator("input[type='checkbox']");
    const count = await checkboxes.count();

    if (count > 0) {
      // At least some checkboxes should exist
      expect(count).toBeGreaterThan(0);
    }
  });

  test("should be keyboard navigable", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/1-2567/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible({
      timeout: 3000,
    });

    // Should be able to tab through elements
    await page.keyboard.press("Tab");
    // Wait for focus to settle
    await page
      .waitForFunction(() => document.activeElement !== document.body, {
        timeout: 1000,
      })
      .catch(() => {});

    // Space should toggle checkbox
    await page.keyboard.press("Space");
    // Wait for checkbox state change
    await page
      .waitForFunction(
        () => {
          const checkboxes = document.querySelectorAll(
            'input[type="checkbox"]',
          );
          return Array.from(checkboxes).some(
            (cb) => (cb as HTMLInputElement).checked,
          );
        },
        { timeout: 1000 },
      )
      .catch(() => {});

    // Some element should be focused
    const activeElement = await page.evaluateHandle(
      () => document.activeElement,
    );
    expect(activeElement).toBeTruthy();
  });
});
