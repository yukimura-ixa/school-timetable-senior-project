import { test, expect } from './fixtures/admin.fixture';

// Skip in CI - this is a debugging test for local investigation
test.skip('Debug combobox count', async ({ authenticatedAdmin }) => {
  const { page } = authenticatedAdmin;
  await page.goto('/management/subject');
  await page.waitForSelector('table', { timeout: 15000 });
  
  const addButton = page.getByRole('button', { name: /เพิ่ม|add/i });
  await addButton.click();
  await page.waitForSelector('tbody tr input[type="text"]', { timeout: 10000 });
  
  const editingRow = page.locator('tbody tr').filter({ has: page.locator('input[type="text"]') }).first();
  
  // Fill Category first
  const categorySelect = editingRow.locator('[role="combobox"], select').nth(1);
  await categorySelect.click();
  const categoryOption = page.getByRole('option', { name: /กิจกรรม|ACTIVITY/i }).first();
  await expect(categoryOption).toBeVisible();
  await categoryOption.click();
  
  // Wait for conditional rendering to update
  await expect(editingRow.locator('[role="combobox"], select')).toHaveCount(4, { timeout: 5000 }).catch(() => {});
  
  // Now count all comboboxes
  const comboboxCount = await editingRow.locator('[role="combobox"], select').count();
  console.log(`Total comboboxes after setting Category=ACTIVITY: ${comboboxCount}`);
  
  // List all of them
  for (let i = 0; i < comboboxCount; i++) {
    const text = await editingRow.locator('[role="combobox"], select').nth(i).textContent();
    console.log(`Combobox ${i}: ${text}`);
  }
});
