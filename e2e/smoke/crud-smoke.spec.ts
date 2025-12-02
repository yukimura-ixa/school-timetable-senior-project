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
    const teacherLastName = `ครู ${seqNum}`;

    await page.goto("/management/teacher");
    await page.waitForSelector("table tbody", { timeout: 15000 });

    const addButton = page.locator('button:has-text("เพิ่ม")');
    await addButton.click();
    await page.waitForTimeout(1000);

    const newRow = page.locator("tbody tr").first();
    const inputs = newRow.locator('input[type="text"]');

    await inputs.nth(0).fill(teacherFirstName);
    await inputs.nth(1).fill(teacherLastName);
    await inputs.nth(2).fill(teacherEmail);

    const saveButton = page.locator('button[aria-label="save"]');
    await saveButton.click();

    await expect(page.locator("text=/เพิ่ม.*สำเร็จ|สำเร็จ/i")).toBeVisible({
      timeout: 15000,
    });
    console.log(`✅ Created teacher: ${teacherEmail}`);
  });

  test("✅ Create Subject (English Code)", async ({ page }) => {
    const subjectCode = `TS${seqNum}`;
    const subjectName = `วิชาทดสอบ ${seqNum}`;

    await page.goto("/management/subject");
    await page.waitForSelector("table tbody", { timeout: 15000 });

    const addBtn = page.locator('button:has-text("เพิ่ม")');
    await addBtn.click();
    await page.waitForTimeout(1000);

    const row = page.locator("tbody tr").first();
    const textInputs = row.locator('input[type="text"]');

    // SubjectCode (first text input)
    await textInputs.nth(0).fill(subjectCode);
    // SubjectName (second text input)
    await textInputs.nth(1).fill(subjectName);

    const saveBtn = page.locator('button[aria-label="save"]');
    await saveBtn.click();

    await expect(page.locator("text=/เพิ่ม.*สำเร็จ|สำเร็จ/i")).toBeVisible({
      timeout: 15000,
    });
    console.log(`✅ Created subject: ${subjectCode}`);
  });

  test("✅ Create Room", async ({ page }) => {
    const roomNumber = `TEST-${seqNum}`;

    await page.goto("/management/rooms");
    await page.waitForSelector("table tbody", { timeout: 15000 });

    const addButton2 = page.locator('button:has-text("เพิ่ม")');
    await addButton2.click();
    await page.waitForTimeout(1000);

    const newRow2 = page.locator("tbody tr").first();
    const inputs2 = newRow2.locator('input[type="text"]');
    await inputs2.first().fill(roomNumber);

    const saveButton2 = page.locator('button[aria-label="save"]');
    await saveButton2.click();

    await expect(page.locator("text=/เพิ่ม.*สำเร็จ|สำเร็จ/i")).toBeVisible({
      timeout: 15000,
    });
    console.log(`✅ Created room: ${roomNumber}`);
  });
});
