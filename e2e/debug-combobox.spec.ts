import { test, expect } from './fixtures/admin.fixture';

test('Debug combobox count', async ({ authenticatedAdmin }) => {
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
  await page.getByRole('option', { name: /กิจกรรม|ACTIVITY/i }).first().click();
  
  // Wait a bit for any conditional rendering
  await page.waitForTimeout(1000);
  
  // Now count all comboboxes
  const comboboxCount = await editingRow.locator('[role="combobox"], select').count();
  console.log(`Total comboboxes after setting Category=ACTIVITY: ${comboboxCount}`);
  
  // List all of them
  for (let i = 0; i < comboboxCount; i++) {
    const text = await editingRow.locator('[role="combobox"], select').nth(i).textContent();
    console.log(`Combobox ${i}: ${text}`);
  }
});
