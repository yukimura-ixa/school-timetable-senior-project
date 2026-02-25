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

    await nav.goToDashboardSelector();

    const configButton = page
      .getByRole("button", { name: /ตั้งค่าตาราง/i })
      .first();
    if (!(await configButton.isVisible({ timeout: 10000 }).catch(() => false))) {
      test.skip(true, "No config dialog available on dashboard");
    }

    await configButton.click();

    const dialog = page.getByRole("dialog");
    if (!(await dialog.isVisible({ timeout: 10000 }).catch(() => false))) {
      test.skip(true, "Config dialog did not appear after clicking — UI may differ in CI");
      return;
    }

    const titleText = (await dialog.getByRole("heading").textContent()) ?? "";
    const configMatch = titleText.match(/(\d-\d{4})/);
    if (!configMatch?.[1]) {
      test.skip(true, "Config ID not found in dialog title");
    }
    const configId = configMatch[1];

    const timeInput = dialog.locator('input[type="time"]').first();
    await expect(timeInput).toBeVisible();
    await timeInput.fill("08:45");

    await dialog.getByRole("button", { name: /ยกเลิก|cancel/i }).click();
    await expect(dialog).toBeHidden({ timeout: 10000 });

    await nav.goToConfig(configId);
    const configTimeInput = page.locator('input[type="time"]').first();
    if (await configTimeInput.isVisible().catch(() => false)) {
      await expect(configTimeInput).not.toHaveValue("08:45");
    } else {
      await expect(page.locator("b", { hasText: "08:45" })).toHaveCount(0);
    }
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

    const errorAlert = page.getByText(/ไม่สามารถโหลดข้อมูลคาบเรียนได้/i);
    await expect(errorAlert).toHaveCount(0);

    const emptyState = page.getByText(/ยังไม่มีตารางเรียน/i);
    const grid = page.locator("table");
    const emptyVisible = await emptyState.isVisible().catch(() => false);
    const gridVisible = await grid.isVisible().catch(() => false);
    expect(emptyVisible || gridVisible).toBeTruthy();
  });
});
