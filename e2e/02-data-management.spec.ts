import { test, expect } from "./fixtures/admin.fixture";
import type { Page } from "@playwright/test";
import { NavigationHelper } from "./helpers/navigation";
import { waitForAppReady } from "./helpers/wait-for-app-ready";

/**
 * TC-003 to TC-006: Data Management Tests
 *
 * These tests verify CRUD operations for:
 * - Teachers
 * - Subjects
 * - Rooms
 * - Grade Levels
 */

test.describe("Data Management - Teacher CRUD", () => {
  let nav: NavigationHelper;
  const buildTeacher = (label: string) => ({
    firstname: `TestTeacher_${label}_${Date.now()}`,
    lastname: "Automated",
    department: "คณิตศาสตร์",
    email: `teacher_${label}_${Date.now()}@test.local`,
  });

  const createTeacherViaModal = async (
    page: Page,
    teacher: ReturnType<typeof buildTeacher>,
  ) => {
    await page.getByTestId("add-teacher-button").click();
    await page.getByTestId("prefix-0").click();
    await page.getByRole("option", { name: "นาย" }).click();
    await page.getByTestId("firstname-0").fill(teacher.firstname);
    await page.getByTestId("lastname-0").fill(teacher.lastname);
    await page.getByTestId("department-0").click();
    await page.getByRole("option", { name: teacher.department }).click();
    await page.getByTestId("email-0").fill(teacher.email);
    await page.getByTestId("add-teacher-submit").click();
    await expect(page.getByText("เพิ่มข้อมูลครูสำเร็จ")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(teacher.firstname)).toBeVisible({
      timeout: 15000,
    });
  };

  test.beforeEach(async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    nav = new NavigationHelper(page);
    await nav.goToTeacherManagement();
  });

  test("TC-003-01: Teacher Management page loads", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await waitForAppReady(page);
    expect(page.url()).toContain("/management/teacher");
  });

  test("TC-003-04: Add new teacher", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    const teacher = buildTeacher("create");
    await createTeacherViaModal(page, teacher);
  });

  test("TC-003-05: Edit teacher via inline DataGrid editing", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const teacher = buildTeacher("edit");

    await createTeacherViaModal(page, teacher);

    // Wait for DataGrid to render the new teacher
    await expect(page.getByText(teacher.firstname)).toBeVisible({
      timeout: 15000,
    });

    // Find the row containing our teacher and click the Edit action
    const row = page
      .locator('[role="row"]')
      .filter({ hasText: teacher.firstname })
      .first();
    await row.getByLabel("แก้ไข").click();

    // In row edit mode, find the firstname input and change it
    const newName = `${teacher.firstname}_Edited`;
    await row.locator("input").first().fill(newName);

    // Click Save action
    await row.getByLabel("บันทึก").click();

    // Verify success snackbar
    await expect(page.getByText("บันทึกข้อมูลสำเร็จ")).toBeVisible({
      timeout: 15000,
    });

    // Verify the updated name appears
    await expect(page.getByText(newName)).toBeVisible();
  });

  test("TC-003-06: Delete teacher via DataGrid", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    const teacher = buildTeacher("delete");
    await createTeacherViaModal(page, teacher);

    // Wait for DataGrid to render the new teacher
    await expect(page.getByText(teacher.firstname)).toBeVisible({
      timeout: 15000,
    });

    // Find the row and click Delete action
    const row = page
      .locator('[role="row"]')
      .filter({ hasText: teacher.firstname })
      .first();
    await row.getByLabel("ลบ").click();

    // Confirm deletion in dialog
    await page.getByRole("button", { name: "ลบ", exact: true }).click();

    // Verify teacher is removed
    await expect(page.getByText(teacher.firstname)).not.toBeVisible({
      timeout: 15000,
    });
  });
});
