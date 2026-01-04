/**
 * E2E Tests for Publish Gate
 *
 * Verifies that a semester cannot be published when completeness is below the threshold.
 */

import { test, expect } from "./fixtures/admin.fixture";

// Read-only status checks can run in parallel
test.describe.configure({ mode: "parallel" });

test.describe("Publish Gate", () => {
  test("should prevent publishing of an incomplete semester", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    // Config status badge (and publish controls) are rendered on the config page.
    await page.goto("/schedule/2567/1/config");
    await page.waitForLoadState("networkidle");

    const statusBadge = page.getByTestId("config-status-badge");
    await expect(statusBadge).toBeVisible({ timeout: 20000 });

    // When completeness is below threshold, there are no available transitions
    // so the status menu button should not render.
    await expect(statusBadge.getByRole("button")).toHaveCount(0);

    // Completeness indicator should explain why publishing is blocked.
    await expect(page.getByText(/ต้องการอย่างน้อย\s*30%/)).toBeVisible({
      timeout: 15000,
    });
  });
});
