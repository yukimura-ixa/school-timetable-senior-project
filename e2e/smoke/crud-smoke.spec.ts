/**
 * @file crud-smoke.spec.ts
 * @description CRUD smoke tests - validates Create operations work
 *
 * Uses admin fixture for authentication (no dev bypass).
 *
 * UI Patterns:
 * - Teacher: Uses dedicated AddModalForm (modal-based)
 * - Subject: Uses AddSubjectDialog (modal-based)
 * - Room: Uses EditableTable inline editing
 *
 * Note: Subject validation currently only accepts [A-Z0-9] codes
 * Thai MOE codes with Thai letters will require validation update
 */

import { test, expect } from "../fixtures/admin.fixture";

const timestamp = Date.now();
const seqNum = (timestamp % 100) + 1; // 1-100 range for cleaner codes

test.describe("CRUD Smoke Tests - Create Operations", () => {
  test("✅ Create Teacher (Modal Flow)", async ({ page }) => {
    const teacherFirstName = "ทดสอบ";
    const teacherLastName = `สโมค${seqNum}`;

    await page.goto("/management/teacher");
    await page.waitForSelector('[role="grid"], .MuiDataGrid-root', {
      timeout: 15000,
    });

    // Teacher management uses dedicated button with data-testid
    const addButton = page.locator('[data-testid="add-teacher-button"]');
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // Wait for the modal to appear - modal has "เพิ่มรายชื่อครู" title
    const modalTitle = page.locator('text=เพิ่มรายชื่อครู');
    await expect(modalTitle).toBeVisible({ timeout: 10000 });

    // Fill in the modal form fields using data-testid
    // First name field
    const firstnameInput = page.locator('[data-testid="firstname-0"]');
    await expect(firstnameInput).toBeVisible({ timeout: 5000 });
    await firstnameInput.fill(teacherFirstName);

    // Last name field
    const lastnameInput = page.locator('[data-testid="lastname-0"]');
    await expect(lastnameInput).toBeVisible({ timeout: 5000 });
    await lastnameInput.fill(teacherLastName);

    // Email field (pre-filled with UUID but can be changed)
    const emailInput = page.locator('[data-testid="email-0"]');
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Clear and fill with custom email
      await emailInput.clear();
      await emailInput.fill(`smoke_${seqNum}@test.local`);
    }

    // Submit the form - button has data-testid="add-teacher-submit"
    const submitButton = page.locator('[data-testid="add-teacher-submit"]');
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();

    // Wait for success snackbar - message is "เพิ่มข้อมูลครูสำเร็จ"
    const successSnackbar = page.locator('.notistack-SnackbarContainer').locator('text=/สำเร็จ/');
    await expect(successSnackbar).toBeVisible({ timeout: 15000 });
    console.log(`✅ Created teacher: ${teacherFirstName} ${teacherLastName}`);
  });

  test("✅ Create Subject (Modal Flow)", async ({ page }) => {
    // Subject code must be uppercase A-Z and 0-9 only
    const subjectCode = `TEST${seqNum}`;
    const subjectName = `วิชาทดสอบ ${seqNum}`;

    await page.goto("/management/subject");
    await page.waitForSelector('[role="grid"], .MuiDataGrid-root', {
      timeout: 15000,
    });

    const addButton = page.locator('[data-testid="add-subject-button"]').first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // Wait for modal inputs to appear
    const dialog = page.locator('[role="dialog"]').first();
    const subjectCodeInput = dialog.locator('[data-testid="subject-code-0"]');
    await expect(subjectCodeInput).toBeVisible({ timeout: 10000 });
    await subjectCodeInput.fill(subjectCode);

    const subjectNameInput = dialog.locator('[data-testid="subject-name-0"]');
    await expect(subjectNameInput).toBeVisible({ timeout: 5000 });
    await subjectNameInput.fill(subjectName);

    // Select credit (required)
    const creditSelect = dialog.getByRole("combobox", { name: "หน่วยกิต" });
    await creditSelect.click();
    const creditOption = page
      .locator('li[role="option"]:not([aria-disabled="true"])')
      .first();
    await creditOption.click();

    const submitButton = page.locator('[data-testid="add-subject-submit"]');
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();

    // Wait for success snackbar
    const successSnackbar = page.locator('.notistack-SnackbarContainer').locator('text=/สำเร็จ/');
    await expect(successSnackbar).toBeVisible({ timeout: 15000 });
    console.log(`✅ Created subject: ${subjectCode}`);
  });

  test("✅ Create Room (Inline Editing)", async ({ page }) => {
    const roomName = `TEST${seqNum}`;
    const building = "อาคาร1";
    const floor = "1";

    await page.goto("/management/rooms");
    await page.waitForSelector("table", { timeout: 15000 });

    // Room uses EditableTable with Add button - button contains text "เพิ่ม"
    const addButton = page.getByRole('button', { name: 'เพิ่ม' });
    
    await page.waitForLoadState("networkidle");
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // Wait for new row with input fields
    await page.waitForSelector('tbody tr input[type="text"]', { timeout: 10000 });

    // Find the editing row
    const editingRow = page.locator('tbody tr').filter({ has: page.locator('input[type="text"]') }).first();
    const textInputs = editingRow.locator('input[type="text"]');

    // RoomName is the first editable field
    const roomNameInput = textInputs.first();
    await expect(roomNameInput).toBeVisible({ timeout: 5000 });
    await roomNameInput.fill(roomName);

    // Building is the second field
    const buildingInput = textInputs.nth(1);
    if (await buildingInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await buildingInput.fill(building);
    }

    // Floor is the third field
    const floorInput = textInputs.nth(2);
    if (await floorInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await floorInput.fill(floor);
    }

    // Save using toolbar save button - IconButton with Thai aria-label
    const saveButton = page.locator('button[aria-label="บันทึก"]');
    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await saveButton.click();

    // Wait for success snackbar
    const successSnackbar = page.locator('.notistack-SnackbarContainer').locator('text=/สำเร็จ/');
    await expect(successSnackbar).toBeVisible({ timeout: 15000 });
    console.log(`✅ Created room: ${roomName}`);
  });
});
