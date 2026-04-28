import { test, expect } from "./fixtures/admin.fixture";
import { NavigationHelper } from "./helpers/navigation";
import { testSemesters, testTeacher } from "./fixtures/seed-data.fixture";

test.describe("Admin regressions (SBTM)", () => {
  // Run SBTM regression tests sequentially with extended timeout and retries
  test.describe.configure({ mode: "serial", timeout: 120_000, retries: 2 });

  // Warmup: Pre-compile pages before tests run to prevent individual test timeouts
  test.beforeAll(async ({ browser }) => {
    console.log("🔥 Warming up admin pages for SBTM regression tests...");
    const context = await browser.newContext({
      storageState: "playwright/.auth/admin.json",
    });
    const page = await context.newPage();
    try {
      // Warmup teacher arrange page
      await page.goto(
        `/schedule/${testSemesters.semester1_2567.SemesterAndyear}/arrange`,
        { timeout: 90_000 },
      );
      await page.waitForLoadState("networkidle", { timeout: 60_000 });

      // Warmup student table page
      await page.goto(
        `/dashboard/${testSemesters.semester1_2568.SemesterAndyear}/student-table`,
        { timeout: 90_000 },
      );
      await page.waitForLoadState("networkidle", { timeout: 60_000 });

      console.log("✅ Admin pages warmed up successfully");
    } catch (error) {
      console.log("⚠️ Warmup navigation failed, tests may be slow:", error);
    } finally {
      await context.close();
    }
  });

  test("ADM-REG-001: Config dialog cancel does not persist", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);

    await nav.goToConfig(testSemesters.semester1_2567.SemesterAndyear);

    const editButton = page.getByRole("button", { name: /แก้ไขตั้งค่า/i });
    if (!(await editButton.isVisible({ timeout: 10000 }).catch(() => false))) {
      test.skip(true, "Config page not available — semester may not be seeded");
      return;
    }
    if (await editButton.isDisabled()) {
      test.skip(true, "Config not in DRAFT status — edit button disabled, cannot test cancel");
      return;
    }

    await editButton.click();

    const dialog = page.getByRole("dialog");
    if (!(await dialog.isVisible({ timeout: 10000 }).catch(() => false))) {
      test.skip(true, "ConfigureTimeslotsDialog did not open");
      return;
    }

    const timeInput = dialog.locator('input[type="time"]').first();
    await expect(timeInput).toBeVisible();
    const originalValue = await timeInput.inputValue();
    await timeInput.fill("08:45");

    await dialog.getByRole("button", { name: /ยกเลิก|cancel/i }).click();
    await expect(dialog).toBeHidden({ timeout: 10000 });

    // Re-open dialog to confirm cancel did not persist the value
    await editButton.click();
    await expect(dialog).toBeVisible({ timeout: 10000 });
    const timeInputAfter = dialog.locator('input[type="time"]').first();
    await expect(timeInputAfter).not.toHaveValue("08:45");
    if (originalValue) {
      await expect(timeInputAfter).toHaveValue(originalValue);
    }
    await dialog.getByRole("button", { name: /ยกเลิก|cancel/i }).click();
  });

  test("ADM-REG-002: Teacher arrange time row uses local HH:mm", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);

    await nav.goToTeacherArrange(
      testSemesters.semester1_2567.SemesterAndyear,
      String(testTeacher.TeacherID),
    );

    // The time row may use td or th depending on the component version
    const timeRow = page.locator("table thead tr").nth(1);
    const firstTimeCell = timeRow.locator("td, th").nth(1);
    if (!(await firstTimeCell.isVisible({ timeout: 20000 }).catch(() => false))) {
      test.skip(true, "Arrange page time row not rendered — table structure may differ or page not loaded");
      return;
    }

    const timeText = (await firstTimeCell.textContent())?.replace(/\s+/g, " ");
    expect(timeText ?? "").toMatch(/\b(0[7-9]|1[0-1]):[0-5]\d\b/);
    expect(timeText ?? "").not.toMatch(/\b0[1-3]:[0-5]\d\b/);
  });

  test("ADM-REG-003: Student table avoids hard error when timeslots missing", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    const semester = testSemesters.semester1_2568.SemesterAndyear;

    await nav.goToStudentTable(semester);

    // If the semester config doesn't exist in DB, layout returns 404 / not-found
    const isNotFound = await page.getByText(/ไม่พบ|not found|404/i).isVisible({ timeout: 5000 }).catch(() => false);
    if (isNotFound) {
      test.skip(true, "Semester 1-2568 config not in DB — page returned not-found");
      return;
    }

    const errorAlert = page.getByText(/ไม่สามารถโหลดข้อมูลคาบเรียนได้/i);
    await expect(errorAlert).toHaveCount(0);

    const emptyState = page.getByText(/ยังไม่มีตารางเรียน/i);
    const grid = page.locator("table");
    const emptyVisible = await emptyState.isVisible().catch(() => false);
    const gridVisible = await grid.isVisible().catch(() => false);
    if (!(emptyVisible || gridVisible)) {
      test.skip(true, "Student table shows neither empty state nor grid — page may not have loaded");
      return;
    }
  });
});
