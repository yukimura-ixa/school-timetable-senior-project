import { test, expect } from './fixtures/admin.fixture';

test('Debug full form fill', async ({ authenticatedAdmin }) => {
  const { page } = authenticatedAdmin;
  
  // Capture all console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[EDITABLE_TABLE')) {
      console.log(`[BROWSER] ${text}`);
    }
  });
  
  await page.goto('/management/subject');
  await page.waitForSelector('table', { timeout: 15000 });
  
  const addButton = page.getByRole('button', { name: /เพิ่ม|add/i });
  await addButton.click();
  await page.waitForSelector('tbody tr input[type="text"]', { timeout: 10000 });
  
  const editingRow = page.locator('tbody tr').filter({ has: page.locator('input[type="text"]') }).first();
  
  // Fill SubjectCode
  const codeInput = editingRow.locator('input[type="text"]').first();
  await codeInput.fill('TESTACT001');
  
  // Fill SubjectName
  const nameInput = editingRow.locator('input[type="text"]').nth(1);
  await nameInput.fill('Test Activity');
  
  // Select fields
  const creditSelects = editingRow.locator('[role="combobox"], select');
  
  // Credit (index 0) - should already be 1.0
  const creditSelect = creditSelects.first();
  await creditSelect.click();
  await page.getByRole('option', { name: /1\.0|CREDIT_10/i }).first().click();
  await page.waitForTimeout(300);
  
  // Category (index 1)
  const categorySelect = creditSelects.nth(1);
  await categorySelect.click();
  await page.getByRole('option', { name: /กิจกรรม|ACTIVITY/i }).first().click();
  await page.waitForTimeout(300);
  
  // ActivityType (index 3)
  const activityTypeSelect = creditSelects.nth(3);
  await activityTypeSelect.click();
  await page.getByRole('option', { name: /ชุมนุม|CLUB/i }).first().click();
  await page.waitForTimeout(300);
  
  console.log('[TEST] About to click save button');
  
  // Click save
  const saveButton = page.locator('button[aria-label="save"]');
  await saveButton.click();
  
  // Wait to see the log output
  await page.waitForTimeout(3000);
});
