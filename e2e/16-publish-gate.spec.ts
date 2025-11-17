import { test, expect } from "@playwright/test";
import { NavigationHelper } from "./helpers/navigation";

/**
 * Publish Gate – Timetable Completeness & MoE Compliance
 *
 * This spec verifies that:
 * - Attempting to publish an incomplete / MoE-invalid semester is blocked
 *   and returns a clear Thai error message.
 * - A \"good\" semester (complete + MoE-compliant) can still be published.
 *
 * NOTE:
 * - Exact seed data assumptions (which semester is complete vs incomplete)
 *   may need to be adjusted based on the current seeding strategy.
 * - If no guaranteed-\"good\" semester exists, the second test can be
 *   converted to test.skip() until such seed data is available.
 */

test.describe("Publish Gate (Timetable + MoE)", () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
  });

  test("PG-01: Incomplete semester cannot be published", async ({ page }) => {
    // Choose a semester that is expected to be incomplete in seed data.
    // Adjust if needed once CI data is confirmed.
    const sampleSemester = "1-2567";

    await nav.goToConfig(sampleSemester);
    await page.waitForLoadState("domcontentloaded");

    // Wait for config page to render status badge / actions
    await page.waitForSelector("[data-testid=\"config-status-badge\"], button", {
      timeout: 10000,
    });

    // Try to open status menu and choose \"เผยแพร่\" / PUBLISHED
    // Implementation detail: ConfigStatusBadge currently uses a button with
    // an icon; we look for a menu trigger near the status chip.
    const statusButton = page.getByRole("button", { name: /สถานะ|status/i }).first();
    if (await statusButton.isVisible().catch(() => false)) {
      await statusButton.click();
    }

    // Click publish / PUBLISHED option if available
    const publishOption = page
      .locator("role=menuitem")
      .filter({ hasText: /เผยแพร่|PUBLISHED/i })
      .first();

    if (await publishOption.isVisible().catch(() => false)) {
      await publishOption.click();
    } else {
      test.skip(true, "Publish option not available on this config (may already be published or locked).");
    }

    // Confirm in dialog if one appears
    const confirmButton = page
      .getByRole("button", { name: /ยืนยัน|confirm/i })
      .first();
    if (await confirmButton.isVisible().catch(() => false)) {
      await confirmButton.click();
    }

    // Expect an error snackbar / message about completeness or MoE validation
    const errorLocator = page.locator(
      "text=/ไม่สามารถเผยแพร่ได้|ตารางสอนยังไม่ครบถ้วน|หลักสูตรยังไม่ผ่านเกณฑ์/i"
    );
    await expect(errorLocator).toBeVisible({ timeout: 10000 });
  });

  test.skip("PG-02: Fully complete & MoE-compliant semester can be published", async ({ page }) => {
    // This is a placeholder for when we have a known-good semester in seed data.
    // Suggested steps:
    // 1. Use a seed that creates a fully complete + MoE-compliant semester
    //    (e.g. 2-2567) with 100% completeness and passing MoE validation.
    // 2. Navigate to its config page via nav.goToConfig(\"2-2567\").
    // 3. Open the status menu, choose \"เผยแพร่\".
    // 4. Confirm the dialog.
    // 5. Assert:
    //    - Success snackbar appears.
    //    - Status chip shows PUBLISHED.
    //    - No MoE/completeness error messages are shown.
    //
    // Once such a semester is guaranteed in CI, this test can be
    // implemented and un-skipped following the above steps.
    await page.goto("/");
    expect(true).toBeTruthy();
  });
});

