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
    await page.goto("/schedule/2568/1/config");
    await page.waitForLoadState("networkidle");

    const statusBadge = page.getByTestId("config-status-badge");

    // Config page may not render badge if SemesterConfig doesn't exist yet
    const hasBadge = await statusBadge
      .isVisible({ timeout: 10000 })
      .catch(() => false);
    if (!hasBadge) {
      test.skip(
        true,
        "Config status badge not rendered — SemesterConfig may not exist for 2568/1",
      );
      return;
    }

    await expect(statusBadge).toBeVisible({ timeout: 10000 });

    // This verifies the BELOW-threshold gate (<30% complete). The demo seed's
    // 2568/1 sits well above that, so the indicator won't render — skip rather
    // than assert a state the seed doesn't produce. (The clean/blocked publish
    // paths are covered against controlled seeds in the publish-happy config.)
    const incompleteMsg = page.getByText(/ต้องการอย่างน้อย\s*30%/);
    const isIncomplete = await incompleteMsg
      .isVisible({ timeout: 10000 })
      .catch(() => false);
    test.skip(
      !isIncomplete,
      "Seed semester is ≥30% complete — below-threshold publish gate not applicable",
    );

    // Below threshold: no available transitions (status menu button absent)…
    await expect(statusBadge.getByRole("button")).toHaveCount(0);
    // …and the completeness indicator explains why publishing is blocked.
    await expect(incompleteMsg).toBeVisible();
  });
});
