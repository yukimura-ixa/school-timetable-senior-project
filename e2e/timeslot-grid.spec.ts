import { test, expect } from "@playwright/test";

// Smoke coverage for the shared TimeslotGrid (4a0). The seed (prisma/seed.ts)
// uses academic year 2568, semester 1. M6-1 is a senior class with a full
// schedule and at least one break row, so it exercises the period-skip logic.
const TERM = "2568/1";

// These pages are public — no admin session needed. Override the project's
// stored auth state so the spec doesn't depend on the auth.setup fixture.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("timeslot grid period numbering", () => {
  test("class view: period numbers skip break columns", async ({ page }) => {
    await page.goto(`/classes/M6-1/${TERM}`);
    await page.waitForSelector('[data-testid="schedule-grid"]');

    // Grid is transposed: periods are column headers, days are rows.
    const headerCells = await page.locator("thead th").allInnerTexts();
    const periodNumbers = headerCells
      .map((t) => t.match(/คาบ\s*(\d+)/)?.[1])
      .filter((x): x is string => Boolean(x))
      .map((n) => parseInt(n, 10));

    // Teaching periods are present and strictly sequential across break columns.
    expect(periodNumbers.length).toBeGreaterThan(0);
    for (let i = 1; i < periodNumbers.length; i++) {
      expect(periodNumbers[i]).toBe(periodNumbers[i - 1]! + 1);
    }

    // Senior class has at least one break column (lunch) inserted between periods.
    await expect(
      page.locator('[data-testid="break-cell"]').first(),
    ).toBeVisible();
  });
});
