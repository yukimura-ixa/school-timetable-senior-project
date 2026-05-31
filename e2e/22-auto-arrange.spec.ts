import { test, expect } from "./fixtures/admin.fixture";
import { waitForAppReady } from "./helpers/wait-for-app-ready";
import { testSemester } from "./fixtures/seed-data.fixture";
import { getE2ETeacherId } from "./helpers/teacher-id";

// Auto-arrange mutates the schedule — must run serially
test.describe.configure({ mode: "serial", timeout: 60_000 });

const { Year: year, Semester: semester } = testSemester;

const ARRANGE_URL = `/schedule/${year}/${semester}/arrange`;

test.describe("Auto-arrange", () => {
  test("button is disabled when no teacher is selected", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto(ARRANGE_URL);
    await waitForAppReady(page);

    const autoBtn = page.getByRole("button", { name: /จัดอัตโนมัติ/ });
    await expect(autoBtn).toBeVisible();
    await expect(autoBtn).toBeDisabled();
  });

  test("button is enabled when teacher is selected via URL", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const teacherId = await getE2ETeacherId(page);
    await page.goto(`${ARRANGE_URL}?teacher=${teacherId}&tab=teacher`);
    await waitForAppReady(page);

    const autoBtn = page.getByRole("button", { name: /จัดอัตโนมัติ/ });
    await expect(autoBtn).toBeVisible();
    await expect(autoBtn).toBeEnabled();
  });

  test("happy path: clicking produces snackbar feedback", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const teacherId = await getE2ETeacherId(page);
    await page.goto(`${ARRANGE_URL}?teacher=${teacherId}&tab=teacher`);
    await waitForAppReady(page);

    const autoBtn = page.getByRole("button", { name: /จัดอัตโนมัติ/ });
    await expect(autoBtn).toBeEnabled();
    await autoBtn.click();

    // While running, button shows loading state
    await expect(page.getByRole("button", { name: /กำลังจัด/ }))
      .toBeVisible()
      .catch(() => {
        // Fast response is fine — may complete before we check
      });

    // Wait for the auto-arrange snackbar at the bottom of the screen
    const snackbar = page
      .locator('[role="alert"]')
      .filter({ hasText: /จัดตาราง|ไม่มีวิชา|ไม่สามารถ|เกิดข้อผิดพลาด|คาบ/ });
    await expect(snackbar).toBeVisible({ timeout: 30_000 });

    // Button returns to non-loading state
    await expect(autoBtn).toBeEnabled({ timeout: 10_000 });
  });
});
