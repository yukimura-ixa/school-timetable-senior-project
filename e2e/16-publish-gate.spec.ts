/**
 * E2E Tests for Publish Gate
 *
 * Tests the functionality of the publish gate, ensuring that incomplete or
 * non-compliant semesters cannot be published without explicit override.
 */

import { test, expect } from "./fixtures/admin.fixture";
import { ArrangePage } from "./page-objects/ArrangePage";

test.describe("Publish Gate", () => {
  test("should prevent publishing of an incomplete semester", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const arrangePage = new ArrangePage(page);
    await arrangePage.navigateTo("1", "2567");

    // 1. Navigate to dashboard
    await page.goto("/dashboard/1-2567");
    await page.waitForSelector('[data-testid="config-status-badge"]');

    // 2. Try to publish
    const statusButton = page
      .locator('[data-testid="config-status-badge"]')
      .getByRole("button")
      .first();
    await statusButton.click();

    const publishOption = page
      .locator("role=menuitem")
      .filter({ hasText: /เผยแพร่|PUBLISHED/i })
      .first();
    await publishOption.click();

    // 3. Assert that an error message is shown
    const errorLocator = page.getByRole("alert").filter({
      hasText: /ไม่สามารถเผยแพร่ได้/i,
    });
    await expect(errorLocator).toBeVisible({ timeout: 10000 });
  });
});
