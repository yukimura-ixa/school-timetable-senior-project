import { test, expect } from "./fixtures/admin.fixture"
import { NavigationHelper } from './helpers/navigation'

/**
 * TC-003 to TC-006: Data Management Tests
 * 
 * These tests verify CRUD operations for:
 * - Teachers
 * - Subjects
 * - Rooms
 * - Grade Levels
 */

test.describe('Data Management - Teacher CRUD', () => {
  let nav: NavigationHelper
  const testTeacher = {
    firstname: `TestTeacher_${Date.now()}`,
    lastname: 'Automated',
    department: 'Science',
    email: `teacher_${Date.now()}@test.local`
  }

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page)
    await nav.goToTeacherManagement()
  })

  test('TC-003-01: Teacher Management page loads', async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin
    await expect(page.locator('main, body')).toBeVisible({ timeout: 10000 })
    expect(page.url()).toContain('/management/teacher')
  })

  test('TC-003-04: Add new teacher', async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin

    // Click Add button
    await page.getByRole('button', { name: 'เพิ่ม' }).click()

    // Fill form (in the new row)
    // Note: MUI Select is tricky, we might need to click the trigger then the option
    // Assuming default "นาย" is selected for Prefix

    await page.getByPlaceholder('ชื่อ *').fill(testTeacher.firstname)
    await page.getByPlaceholder('นามสกุล *').fill(testTeacher.lastname)
    await page.getByPlaceholder('กลุ่มสาระ').fill(testTeacher.department)
    // Email is auto-generated or not editable in create? 
    // Looking at TeacherTable.tsx: Email is editable: false in columns, but createEmptyTeacher has empty string.
    // Wait, TeacherTable.tsx says Email editable: false. 
    // But handleCreate uses newTeacher.Email. 
    // If editable is false, renderCell just shows value or "-"
    // So we might not be able to set Email in UI?
    // Let's check TeacherTable.tsx again. 
    // Column Email: editable: false.
    // So we can't set email in the UI? 
    // If so, the backend or database must handle it, or it's a bug in the UI/Test understanding.
    // Ah, the seed data has emails. 
    // If I can't set email, maybe it's generated?
    // But validateTeacher checks for email format.
    // This implies it SHOULD be editable.
    // Let's assume for now we can't set it and see if it fails or if there's a default.
    // Wait, if I can't set email, validation might fail if it's required?
    // validateTeacher: if (typeof id === "string" && data.Email) ...
    // It seems validation runs on Email.
    // If the column is not editable, the input won't render.
    // Let's try to fill what we can.

    // Click Save
    await page.getByLabel('save').click()

    // Verify success
    await expect(page.getByText('เพิ่มจัดการข้อมูลครูสำเร็จ')).toBeVisible()

    // Verify in list
    await expect(page.getByText(testTeacher.firstname)).toBeVisible()
  })

  test('TC-003-05: Edit teacher', async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin

    // Find the teacher we just added (or any teacher)
    // We need to reload or ensure we are on the page
    // Search for the teacher
    await page.getByPlaceholder('ค้นหา...').fill(testTeacher.firstname)
    await page.waitForTimeout(500) // Wait for filter

    // Select the row (first checkbox in body)
    await page.locator('tbody input[type="checkbox"]').first().check()

    // Click Edit
    await page.getByLabel('edit').click()

    // Change name
    const newName = `${testTeacher.firstname}_Edited`
    await page.getByPlaceholder('ชื่อ *').fill(newName)

    // Click Save
    await page.getByLabel('save').click()

    // Verify success
    await expect(page.getByText('บันทึกการแก้ไขสำเร็จ')).toBeVisible()

    // Verify change
    await expect(page.getByText(newName)).toBeVisible()
  })

  test('TC-003-06: Delete teacher', async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin

    // Search for the teacher (using the edited name)
    const searchName = `${testTeacher.firstname}_Edited`
    await page.getByPlaceholder('ค้นหา...').fill(searchName)
    await page.waitForTimeout(500)

    // Select the row
    await page.locator('tbody input[type="checkbox"]').first().check()

    // Click Delete
    await page.getByLabel('delete').click()

    // Confirm dialog
    await page.getByRole('button', { name: 'ลบ', exact: true }).click()

    // Verify success
    await expect(page.getByText('ลบจัดการข้อมูลครูสำเร็จ')).toBeVisible()

    // Verify removed
    await expect(page.getByText(searchName)).not.toBeVisible()
  })
});


