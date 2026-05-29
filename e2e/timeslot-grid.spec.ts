import { test, expect } from "@playwright/test";

// Smoke coverage for the shared TimeslotGrid (4a0). The seed (prisma/seed.ts)
// uses academic year 2568, semester 1. M6-1 is a senior class with a full
// schedule and at least one break row, so it exercises the period-skip logic.
const TERM = "2568/1";

test.describe("timeslot grid period numbering", () => {
  test("class view: period numbers skip break rows", async ({ page }) => {
    await page.goto(`/classes/M6-1/${TERM}`);
    await page.waitForSelector('[data-testid="schedule-grid"]');

    const periodCells = await page
      .locator('tbody tr td:first-child')
      .allInnerTexts();
    const periodNumbers = periodCells
      .map((t) => t.match(/คาบ\s*(\d+)/)?.[1])
      .filter((x): x is string => Boolean(x))
      .map((n) => parseInt(n, 10));

    // Teaching periods are present and strictly sequential across break rows.
    expect(periodNumbers.length).toBeGreaterThan(0);
    for (let i = 1; i < periodNumbers.length; i++) {
      expect(periodNumbers[i]).toBe(periodNumbers[i - 1]! + 1);
    }

    // Senior class has at least one break row (lunch) inserted between periods.
    await expect(
      page.locator('[data-testid="break-row"]').first(),
    ).toBeVisible();
  });

  test("teacher view: renders the shared grid", async ({ page }) => {
    // Pick a real teacher link off the landing page rather than hard-coding an id.
    await page.goto("/");
    const href = await page
      .locator('a[href^="/teachers/"]')
      .first()
      .getAttribute("href");
    expect(href).toBeTruthy();

    await page.goto(href!);
    await expect(page.locator('[data-testid="schedule-grid"]')).toBeVisible();
  });
});
