import { test, expect } from "./fixtures/admin.fixture";
import type { Page } from "@playwright/test";
import { NavigationHelper } from "./helpers/navigation";

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
    await expect(page.locator("main, body")).toBeVisible({ timeout: 15000 });
    expect(page.url()).toContain("/management/teacher");
  });

  test("TC-003-04: Add new teacher", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    const teacher = buildTeacher("create");
    await createTeacherViaModal(page, teacher);
  });

  test("TC-003-05: Edit teacher", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    const teacher = buildTeacher("edit");

    await createTeacherViaModal(page, teacher);

    // Search for the teacher we just added
    await page.getByTestId("teacher-search").fill(teacher.firstname);
    await page.waitForTimeout(500); // Wait for filter

    // Select the row (first checkbox in body)
    await page.locator('tbody input[type="checkbox"]').first().check();

    // Click Edit
    await page.getByLabel("edit").click();

    // Change name
    const newName = `${teacher.firstname}_Edited`;
    await page.getByPlaceholder("ชื่อ *").fill(newName);

    // Click Save
    await page.getByLabel("save").click();

    // Verify success
    await expect(page.getByText("บันทึกการแก้ไขสำเร็จ")).toBeVisible();

    // Verify change
    await expect(page.getByText(newName)).toBeVisible();
  });

  test("TC-003-06: Delete teacher", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;

    const teacher = buildTeacher("delete");
    await createTeacherViaModal(page, teacher);

    // Search for the teacher (using the edited name)
    const searchName = teacher.firstname;
    await page.getByTestId("teacher-search").fill(searchName);
    await page.waitForTimeout(500);

    // Select the row
    await page.locator('tbody input[type="checkbox"]').first().check();

    // Click Delete
    await page.getByLabel("delete").click();

    // Confirm dialog
    await page.getByRole("button", { name: "ลบ", exact: true }).click();

    // Verify removed
    await expect(page.getByText(searchName)).not.toBeVisible({
      timeout: 15000,
    });
  });
});
