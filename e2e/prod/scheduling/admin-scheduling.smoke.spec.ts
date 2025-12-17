import { expect, test, type Page } from "@playwright/test";
import { expectAdminSession } from "../helpers/session";
import {
  goToConflictDetector,
  goToScheduleAssign,
  goToScheduleConfig,
  goToTeacherArrange,
} from "../helpers/navigation";
import { mainRegion } from "../helpers/visual";

test.describe.configure({ mode: "serial", timeout: 120_000 });

async function expectHasInteractiveControls(pageName: string, page: Page) {
  const semanticMain = page.locator("main, [role='main']").first();
  if (await semanticMain.isVisible({ timeout: 2000 }).catch(() => false)) {
    await expect(semanticMain).toMatchAriaSnapshot(`
      - main:
        - button
    `);
    return;
  }

  const snapshot = await mainRegion(page).ariaSnapshot();
  expect(
    snapshot.includes("button") || snapshot.includes("combobox"),
    `Expected ${pageName} to contain interactive controls`,
  ).toBe(true);
}

test("schedule assign page renders", async ({ page }) => {
  await expectAdminSession(page);
  await goToScheduleAssign(page);

  // The page should have some assignment controls; tolerate varying layouts.
  await expect(mainRegion(page)).toBeVisible({ timeout: 20_000 });
  await expectHasInteractiveControls("schedule assign", page);
});

test("conflict detector dashboard renders", async ({ page }) => {
  await expectAdminSession(page);
  await goToConflictDetector(page);

  await expect(mainRegion(page)).toBeVisible({ timeout: 20_000 });
  await expectHasInteractiveControls("conflicts dashboard", page);
});

test("config page shows publish/status badge", async ({ page }) => {
  await expectAdminSession(page);
  await goToScheduleConfig(page);

  const statusBadge = page.getByTestId("config-status-badge");
  await expect(statusBadge).toBeVisible({ timeout: 20_000 });

  const snapshot = await mainRegion(page).ariaSnapshot();
  expect(
    snapshot.includes("button") || snapshot.includes("combobox"),
    "Expected config page to contain interactive controls",
  ).toBe(true);
});

test("teacher arrange surface shows grid or conflict UI", async ({ page }) => {
  await expectAdminSession(page);
  await goToTeacherArrange(page);

  const grid = page.locator("[data-testid='timeslot-grid']").first();
  const markers = page.locator(
    '[data-testid="conflict"], [class*="conflict"], [class*="error"], [class*="warning"], svg[color="error"]',
  );

  const hasGrid = await grid.isVisible({ timeout: 15_000 }).catch(() => false);
  const hasMarkers = (await markers.count().catch(() => 0)) > 0;

  expect.soft(
    hasGrid || hasMarkers,
    "Expected a timeslot grid or conflict markers to be present",
  ).toBe(true);

  await expect(mainRegion(page)).toBeVisible({ timeout: 20_000 });
});
