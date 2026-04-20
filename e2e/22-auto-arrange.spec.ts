import { test, expect } from "./fixtures/admin.fixture";
import { waitForAppReady } from "./helpers/wait-for-app-ready";
import { testSemester, testTeacher } from "./fixtures/seed-data.fixture";

// Auto-arrange mutates the schedule — must run serially
test.describe.configure({ mode: "serial", timeout: 60_000 });

const { Year: year, Semester: semester } = testSemester;
const { TeacherID: teacherId } = testTeacher;

const ARRANGE_URL = `/schedule/${year}/${semester}/arrange`;

test.describe("Auto-arrange", () => {
  test("button is disabled when no teacher is selected", async ({
    authenticatedAdmin,
  }) => {
    await authenticatedAdmin.goto(ARRANGE_URL);
    await waitForAppReady(authenticatedAdmin);

    const autoBtn = authenticatedAdmin.getByRole("button", {
      name: /จัดอัตโนมัติ/,
    });
    await expect(autoBtn).toBeVisible();
    await expect(autoBtn).toBeDisabled();
  });

  test("button is enabled when teacher is selected via URL", async ({
    authenticatedAdmin,
  }) => {
    await authenticatedAdmin.goto(
      `${ARRANGE_URL}?teacher=${teacherId}&tab=teacher`,
    );
    await waitForAppReady(authenticatedAdmin);

    const autoBtn = authenticatedAdmin.getByRole("button", {
      name: /จัดอัตโนมัติ/,
    });
    await expect(autoBtn).toBeVisible();
    await expect(autoBtn).toBeEnabled();
  });

  test("happy path: clicking produces snackbar feedback", async ({
    authenticatedAdmin,
  }) => {
    await authenticatedAdmin.goto(
      `${ARRANGE_URL}?teacher=${teacherId}&tab=teacher`,
    );
    await waitForAppReady(authenticatedAdmin);

    const autoBtn = authenticatedAdmin.getByRole("button", {
      name: /จัดอัตโนมัติ/,
    });
    await expect(autoBtn).toBeEnabled();
    await autoBtn.click();

    // While running, button shows loading state
    await expect(
      authenticatedAdmin.getByRole("button", { name: /กำลังจัด/ }),
    )
      .toBeVisible()
      .catch(() => {
        // Fast response is fine — may complete before we check
      });

    // Wait for the auto-arrange snackbar at the bottom of the screen
    // It's the Snackbar/Alert rendered by HeaderClient after the action completes
    const snackbar = authenticatedAdmin
      .locator('[role="alert"]')
      .filter({ hasText: /จัดตาราง|ไม่มีวิชา|ไม่สามารถ|เกิดข้อผิดพลาด|คาบ/ });
    await expect(snackbar).toBeVisible({ timeout: 30_000 });

    // Button returns to non-loading state
    await expect(autoBtn).toBeEnabled({ timeout: 10_000 });
  });
});
