import { test, expect } from "../fixtures/admin.fixture";
import { waitForAppReady } from "../helpers/wait-for-app-ready";
import { testSemester } from "../fixtures/seed-data.fixture";

const { Year: year, Semester: semester } = testSemester;
const ANALYTICS_URL = `/dashboard/${year}/${semester}/analytics`;

test.describe("Analytics overview — conflict stat card", () => {
  test("renders overview section with non-negative conflict count", async ({
    authenticatedAdmin,
  }) => {
    await authenticatedAdmin.goto(ANALYTICS_URL);
    await waitForAppReady(authenticatedAdmin);

    // Conflict stat card must be present
    const conflictCard = authenticatedAdmin.locator(
      '[data-testid="conflict-stat-card"]',
    );
    await expect(conflictCard).toBeVisible({ timeout: 15_000 });

    // The card must contain a non-negative numeric value somewhere
    const cardText = await conflictCard.textContent();
    const digits = cardText?.replace(/,/g, "").match(/\d+/);
    const value = digits ? parseInt(digits[0], 10) : -1;
    expect(value).toBeGreaterThanOrEqual(0);
  });

  test("renders all 4 overview stat cards", async ({ authenticatedAdmin }) => {
    await authenticatedAdmin.goto(ANALYTICS_URL);
    await waitForAppReady(authenticatedAdmin);

    // All 4 cards should appear (indices 0-2 + conflict card)
    for (let i = 0; i < 3; i++) {
      await expect(
        authenticatedAdmin.locator(`[data-testid="overview-stat-card-${i}"]`),
      ).toBeVisible({ timeout: 15_000 });
    }
    await expect(
      authenticatedAdmin.locator('[data-testid="conflict-stat-card"]'),
    ).toBeVisible();
  });
});
