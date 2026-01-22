import { test, expect } from './fixtures/admin.fixture';

// Skip in CI - this is a debugging test for local investigation
test.skip('Debug full form fill', async ({ authenticatedAdmin }) => {
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
  const creditOption = page.getByRole('option', { name: /1\.0|CREDIT_10/i }).first();
  await expect(creditOption).toBeVisible();
  await creditOption.click();
  
  // Category (index 1)
  const categorySelect = creditSelects.nth(1);
  await categorySelect.click();
  const categoryOption = page.getByRole('option', { name: /กิจกรรม|ACTIVITY/i }).first();
  await expect(categoryOption).toBeVisible();
  await categoryOption.click();
  
  // ActivityType (index 3)
  const activityTypeSelect = creditSelects.nth(3);
  await activityTypeSelect.click();
  const activityOption = page.getByRole('option', { name: /ชุมนุม|CLUB/i }).first();
  await expect(activityOption).toBeVisible();
  await activityOption.click();
  
  console.log('[TEST] About to click save button');
  
  // Click save
  const saveButton = page.locator('button[aria-label="save"]');
  await saveButton.click();
  
  // Wait for save to complete
  await expect(editingRow.locator('input[type="text"]')).not.toBeVisible({ timeout: 5000 });
});
