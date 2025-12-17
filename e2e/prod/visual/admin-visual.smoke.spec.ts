import { expect, test } from "@playwright/test";
import {
  expectLocatorScreenshot,
  expectMainScreenshot,
  mainRegion,
} from "../helpers/visual";
import {
  goToDashboardAllTimeslots,
  goToExportEntry,
  goToGradeLevels,
  goToLockOverview,
  goToPrograms,
  goToRooms,
  goToScheduleConfig,
  goToSubjects,
  goToTeacherArrange,
  goToTeachers,
} from "../helpers/navigation";
import { getSemesterId } from "../helpers/env";

test.describe.configure({ mode: "serial", timeout: 90_000 });

test("unauthenticated protected route redirects to /signin", async ({
  browser,
}) => {
  const context = await browser.newContext({ storageState: undefined });
  const page = await context.newPage();

  await page.goto("/management/teacher", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/signin/i);

  await expectLocatorScreenshot(
    page,
    page.locator("body"),
    "unauth-redirect-signin.png",
  );

  await context.close();
});

test("dashboard all-timeslot renders", async ({ page }) => {
  await goToDashboardAllTimeslots(page);
  await expectMainScreenshot(page, "dashboard-all-timeslot.png");
});

test("teachers management list renders", async ({ page }) => {
  await goToTeachers(page);
  const table = page.locator("table").first();
  await expect(table).toBeVisible();
  await expectLocatorScreenshot(page, table, "management-teachers-table.png");
});

test("subjects management list renders", async ({ page }) => {
  await goToSubjects(page);
  const table = page.locator("table").first();
  await expect(table).toBeVisible();
  await expectLocatorScreenshot(page, table, "management-subjects-table.png");
});

test("rooms management list renders", async ({ page }) => {
  await goToRooms(page);
  const table = page.locator("table").first();
  await expect(table).toBeVisible();
  await expectLocatorScreenshot(page, table, "management-rooms-table.png");
});

test("grade levels management surface renders (aria snapshot)", async ({
  page,
}) => {
  await goToGradeLevels(page);
  await expect(mainRegion(page)).toMatchAriaSnapshot({
    name: "management-gradelevels.aria.yml",
  });
});

test("program/curriculum management surface renders (aria snapshot)", async ({
  page,
}) => {
  await goToPrograms(page);
  await expect(mainRegion(page)).toMatchAriaSnapshot({
    name: "management-programs.aria.yml",
  });
});

test("schedule config surface renders", async ({ page }) => {
  await goToScheduleConfig(page);
  await expectMainScreenshot(page, "schedule-config.png");
});

test("teacher arrange surface renders (grid or stable prompt)", async ({
  page,
}) => {
  await goToTeacherArrange(page);

  const grid = page.locator("[data-testid='timeslot-grid']").first();
  const hasGrid = await grid.isVisible({ timeout: 15_000 }).catch(() => false);
  if (hasGrid) {
    await expectLocatorScreenshot(page, grid, "arrange-teacher-grid.png");
  } else {
    // Fallback: capture the main region if grid is not present (valid empty/prompt state).
    await expectMainScreenshot(page, "arrange-teacher-main.png");
  }
});

test("lock overview surface renders", async ({ page }) => {
  await goToLockOverview(page);
  await expectMainScreenshot(page, "schedule-lock-overview.png");
});

test("export entry point exists (optional modal)", async ({ page }) => {
  await goToExportEntry(page);

  const exportButton = page
    .getByRole("button", { name: /export|download|ส่งออก|ดาวน์โหลด/i })
    .first();

  if (await exportButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await exportButton.click();

    const dialog = page.getByRole("dialog").first();
    const hasDialog = await dialog
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    if (hasDialog) {
      await expectLocatorScreenshot(page, dialog, "export-modal.png");
      return;
    }
  }

  // If no export button/modal (feature toggled or different UI), at least confirm the page is reachable.
  await expectMainScreenshot(page, "export-entry.png", { maxDiffPixels: 300 });
});

test("semester-scoped routes do not loop (sanity)", async ({ page }) => {
  const semester = getSemesterId();
  await page.goto(`/dashboard/${semester}/teacher-table`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await expect(page).not.toHaveURL(/\/signin/i);
  await expectMainScreenshot(page, "dashboard-teacher-table.png");
});
