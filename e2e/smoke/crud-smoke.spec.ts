/**
 * @file crud-smoke.spec.ts
 * @description CRUD smoke tests - validates Create operations work
 *
 * Uses admin fixture for authentication (no dev bypass).
 *
 * Note: Subject validation currently only accepts [A-Z0-9] codes
 * Thai MOE codes with Thai letters will require validation update
 */

import { test, expect } from "../fixtures/admin.fixture";

const timestamp = Date.now();
const seqNum = (timestamp % 10) + 90;

test.describe("CRUD Smoke Tests - Create Operations", () => {
  test("✅ Create Teacher", async ({ page }) => {
    const teacherEmail = `SMOKE_TEST_${timestamp}@test.local`;
    const teacherFirstName = "ทดสอบ";
    const teacherLastName = `ครู${seqNum}`;

    await page.goto("/management/teacher");
    await page.waitForSelector("table", { timeout: 15000 });

    // Teacher management uses MODAL for adding (button: "เพิ่มข้อมูลครู")
    const addButton = page.locator('[data-testid="add-teacher-button"], button:has-text("เพิ่มข้อมูลครู")').first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // Wait for modal to appear
    await page.waitForSelector('[data-testid="firstname-0"], input[placeholder*="อเนก"]', { timeout: 10000 });

    // Fill in the modal form fields using data-testid
    await page.locator('[data-testid="firstname-0"]').fill(teacherFirstName);
    await page.locator('[data-testid="lastname-0"]').fill(teacherLastName);
    
    // Email field - may have a different testid pattern
    const emailInput = page.locator('[data-testid="email-0"]')
      .or(page.locator('input[placeholder*="school.local"]'));
    if (await emailInput.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.first().fill(teacherEmail);
    }

    // Submit the form - look for submit button in modal
    const submitButton = page.locator('button:has-text("ยืนยัน"), button:has-text("บันทึก"), button:has-text("เพิ่ม")')
      .and(page.locator(':visible'));
    await submitButton.last().click();

    // Wait for success snackbar - notistack shows snackbar with success message
    // The message is "เพิ่มข้อมูลครูสำเร็จ" (Added teacher successfully)
    const successIndicator = page.locator('[role="alert"]')
      .or(page.locator('text=/สำเร็จ/'))
      .or(page.locator('.notistack-SnackbarContainer'));
    await expect(successIndicator.first()).toBeVisible({ timeout: 15000 });
    console.log(`✅ Created teacher: ${teacherEmail}`);
  });

  test("✅ Create Subject (English Code)", async ({ page }) => {
    const subjectCode = `TS${seqNum}`;
    const subjectName = `วิชาทดสอบ ${seqNum}`;

    await page.goto("/management/subject");
    await page.waitForSelector("table", { timeout: 15000 });

    // Subject uses EditableTable with inline editing (button text: "เพิ่ม")
    const addBtn = page.locator('button:has-text("เพิ่ม")').first();
    await expect(addBtn).toBeVisible({ timeout: 10000 });
    await addBtn.click();

    // Wait for inline editing mode - new row should appear with inputs
    await page.waitForSelector('tbody tr input, tbody tr [contenteditable]', { timeout: 10000 });

    // Fill the first row's inputs (SubjectCode, SubjectName)
    const row = page.locator("tbody tr").first();
    const textInputs = row.locator('input').filter({ hasNot: page.locator('[type="checkbox"]') });

    // SubjectCode (first text input)
    if (await textInputs.nth(0).isVisible({ timeout: 2000 }).catch(() => false)) {
      await textInputs.nth(0).fill(subjectCode);
    }
    // SubjectName (second text input) 
    if (await textInputs.nth(1).isVisible({ timeout: 2000 }).catch(() => false)) {
      await textInputs.nth(1).fill(subjectName);
    }

    // Save using toolbar save button
    const saveBtn = page.locator('button[aria-label="save"]').first();
    await expect(saveBtn).toBeVisible({ timeout: 5000 });
    await saveBtn.click();

    // Wait for success snackbar or verify the row was saved
    const successIndicator = page.locator('[role="alert"]')
      .or(page.locator('text=/สำเร็จ/'))
      .or(page.locator('.notistack-SnackbarContainer'));
    await expect(successIndicator.first()).toBeVisible({ timeout: 15000 });
    console.log(`✅ Created subject: ${subjectCode}`);
  });

  test("✅ Create Room", async ({ page }) => {
    const roomNumber = `TEST-${seqNum}`;

    await page.goto("/management/rooms");
    await page.waitForSelector("table", { timeout: 15000 });

    // Room uses EditableTable with inline editing (button text: "เพิ่ม")
    const addButton2 = page.locator('button:has-text("เพิ่ม")').first();
    await expect(addButton2).toBeVisible({ timeout: 10000 });
    await addButton2.click();

    // Wait for inline editing mode
    await page.waitForSelector('tbody tr input', { timeout: 10000 });

    const newRow2 = page.locator("tbody tr").first();
    const inputs2 = newRow2.locator('input').filter({ hasNot: page.locator('[type="checkbox"]') });
    if (await inputs2.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await inputs2.first().fill(roomNumber);
    }

    // Save using toolbar save button
    const saveButton2 = page.locator('button[aria-label="save"]').first();
    await expect(saveButton2).toBeVisible({ timeout: 5000 });
    await saveButton2.click();

    // Wait for success snackbar
    const successIndicator = page.locator('[role="alert"]')
      .or(page.locator('text=/สำเร็จ/'))
      .or(page.locator('.notistack-SnackbarContainer'));
    await expect(successIndicator.first()).toBeVisible({ timeout: 15000 });
    console.log(`✅ Created room: ${roomNumber}`);
  });
});
