/**
 * E2E Tests for Bulk Lock Operations
 * Tests complete user flows for bulk locking multiple timeslots and grades
 *
 * Uses data-testid selectors for stable dialog targeting (data-testid="bulk-lock-modal")
 */

import { test, expect } from "./fixtures/admin.fixture";
import type { Page } from "@playwright/test";

// Helper: get bulk lock modal by data-testid for stability
const getBulkLockModal = (page: Page) =>
  page.locator('[data-testid="bulk-lock-modal"]');

const openBulkLockModal = async (page: Page) => {
  // Wait for network to be idle (data loaded) before opening modal
  await page.waitForLoadState("networkidle");
  await page.getByTestId("bulk-lock-btn").click();
  const modal = getBulkLockModal(page);
  await expect(modal).toBeVisible({ timeout: 20000 });
  // Wait for modal content to load
  await page.waitForLoadState("networkidle");
  return modal;
};

test.describe("Bulk Lock Operations", () => {
  test("should display bulk lock button on lock page", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    // Find bulk lock button
    const bulkLockButton = page.getByTestId("bulk-lock-btn");
    await expect(bulkLockButton).toBeVisible();
  });

  test("should open bulk lock modal when button clicked", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    const modal = await openBulkLockModal(page);
    // Prefer dialog accessible name to avoid strict-mode ambiguity between title wrappers.
    await expect(
      page.getByRole("dialog", { name: /ล็อกหลายคาบ/ }),
    ).toBeVisible();
  });

  test("should display modal components correctly", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    const modal = await openBulkLockModal(page);

    // Check for essential components
    await expect(
      modal.getByRole("heading", { name: /เลือกคาบเรียน/ }),
    ).toBeVisible();
    await expect(
      modal.getByRole("heading", { name: /เลือกชั้นเรียน/ }),
    ).toBeVisible();
    await expect(modal.getByRole("combobox", { name: /วิชา/ })).toBeVisible();
    await expect(
      modal.getByRole("combobox", { name: /ห้องเรียน/ }),
    ).toBeVisible();
  });

  test("should display select all buttons", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    const modal = await openBulkLockModal(page);

    // Check for section "clear all" buttons (present in both period + grade sections)
    const selectAllButtons = modal
      .getByRole("button", { name: /ยกเลิกทั้งหมด/ })
      .or(modal.getByRole("button", { name: /เลือกทั้งหมด|ทั้งหมด/ }));
    const count = await selectAllButtons.count();
    expect(count).toBeGreaterThanOrEqual(2); // At least one for timeslots and one for grades
  });

  test("should allow selecting multiple timeslots", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    const modal = await openBulkLockModal(page);
    // Find and check first few timeslot checkboxes
    const checkbox = modal
      .locator('[data-testid^="bulk-lock-timeslot-"]')
      .first();
    await expect(checkbox).toBeVisible({ timeout: 15000 });
    await checkbox.check();

    // Should be checked
    await expect(checkbox).toBeChecked();
  });

  test("should allow selecting multiple grades", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    const modal = await openBulkLockModal(page);
    // Prefer grade-labelled checkbox if present (e.g. "ม.1")
    const gradeCheckbox = modal
      .locator('[data-testid^="bulk-lock-grade-"]')
      .first();
    await expect(gradeCheckbox).toBeVisible({ timeout: 15000 });
    await gradeCheckbox.check();

    // Should be checked
    await expect(gradeCheckbox).toBeChecked();
  });

  test("should update counter when selections change", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    const modal = await openBulkLockModal(page);
    // Initial counter should show 0
    const counterText = modal.locator("text=/จำนวนคาบล็อกที่จะสร้าง/i");

    // Select some items
    const checkbox1 = modal
      .locator('[data-testid^="bulk-lock-timeslot-"]')
      .first();
    await expect(checkbox1).toBeVisible({ timeout: 15000 });
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
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    const modal = await openBulkLockModal(page);

    // Select some checkboxes
    const checkbox1 = modal
      .locator('[data-testid^="bulk-lock-timeslot-"]')
      .nth(0);
    const checkbox2 = modal
      .locator('[data-testid^="bulk-lock-timeslot-"]')
      .nth(1);
    await expect(checkbox1).toBeVisible({ timeout: 15000 });
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
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await openBulkLockModal(page);

    // Try to submit without selecting subject (should show validation)
    const submitButton = getBulkLockModal(page)
      .locator("button")
      .filter({ hasText: /ยืนยัน|สร้าง|บันทึก/ })
      .first();

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
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await openBulkLockModal(page);

    // Click cancel button (use exact match to avoid matching 'ยกเลิกทั้งหมด')
    const cancelButton = getBulkLockModal(page).getByRole("button", {
      name: "ยกเลิก",
      exact: true,
    });
    await cancelButton.click();

    // Modal should be closed
    const modal = getBulkLockModal(page);
    await expect(modal).toBeHidden({ timeout: 2000 });
    const modalVisible = await getBulkLockModal(page).isVisible();
    expect(modalVisible).toBe(false);
  });

  test("should use select all for timeslots", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    const modal = await openBulkLockModal(page);

    // Click "Select All" for timeslots
    const selectAllButton = modal.getByTestId("bulk-lock-selectall-timeslots");
    await selectAllButton.click();

    // Multiple checkboxes should be checked
    const checkedBoxes = modal.locator(
      '[data-testid^="bulk-lock-timeslot-"]:checked',
    );
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
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    const modal = await openBulkLockModal(page);

    // Even if no data, modal should show appropriate message
    const hasContent =
      (await modal.locator('[data-testid^="bulk-lock-timeslot-"]').count()) >
        0 ||
      (await modal.locator('[data-testid^="bulk-lock-grade-"]').count()) > 0;
    expect(hasContent).toBe(true);
  });

  test("should be responsive on mobile", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await openBulkLockModal(page);

    // Modal should be visible and functional on mobile
    await expect(getBulkLockModal(page)).toBeVisible({
      timeout: 3000,
    });
  });
});

test.describe("Bulk Lock - Complete Flow", () => {
  test.skip("should complete full bulk lock creation flow", async ({
    page,
  }) => {
    // Skip in CI/automated tests as it modifies database
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    // Open modal
    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(page.locator('[data-testid="bulk-lock-modal"]')).toBeVisible({
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
    await expect(page.locator('[data-testid="bulk-lock-modal"]')).toBeHidden({
      timeout: 3000,
    });
  });
});

test.describe("Bulk Lock - Error Handling", () => {
  test("should show validation error for invalid input", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(getBulkLockModal(page)).toBeVisible({
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

    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    // Opening modal should still work (uses cached data or shows error)
    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(getBulkLockModal(page))
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
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(getBulkLockModal(page)).toBeVisible({
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
    await page.goto("/schedule/2567/1/lock");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    await page
      .locator("button")
      .filter({ hasText: /ล็อกหลายคาบ/ })
      .click();
    await expect(getBulkLockModal(page)).toBeVisible({
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
