import { test, expect } from './fixtures/admin.fixture';

// Skip in CI - this is a debugging test for local investigation
test.skip('Debug ActivityType selection', async ({ authenticatedAdmin }) => {
  const { page } = authenticatedAdmin;
  await page.goto('/management/subject');
  await page.waitForSelector('table', { timeout: 15000 });
  
  const addButton = page.getByRole('button', { name: /เพิ่ม|add/i });
  await addButton.click();
  await page.waitForSelector('tbody tr input[type="text"]', { timeout: 10000 });
  
  const editingRow = page.locator('tbody tr').filter({ has: page.locator('input[type="text"]') }).first();
  
  // Fill Category first
  const creditSelects = editingRow.locator('[role="combobox"], select');
  
  console.log('Step 1: Clicking Category select');
  const categorySelect = creditSelects.nth(1);
  await categorySelect.click();
  const categoryOption = page.getByRole('option', { name: /กิจกรรม|ACTIVITY/i }).first();
  await expect(categoryOption).toBeVisible();
  await categoryOption.click();
  
  const categoryValue = await categorySelect.textContent();
  console.log(`Category value after selection: ${categoryValue}`);
  
  // Now try ActivityType
  console.log('Step 2: Clicking ActivityType select (index 3)');
  const activityTypeSelect = creditSelects.nth(3);
  
  // Wait for conditional field to appear
  await expect(activityTypeSelect).toBeVisible({ timeout: 5000 });
  const isVisible = await activityTypeSelect.isVisible();
  console.log(`ActivityType is visible: ${isVisible}`);
  
  if (isVisible) {
    const beforeValue = await activityTypeSelect.textContent();
    console.log(`ActivityType value before selection: ${beforeValue}`);
    
    await activityTypeSelect.click();
    const optionsList = page.getByRole('option');
    await expect(optionsList.first()).toBeVisible();
    
    // Check what options are available
    const options = await page.getByRole('option').allTextContents();
    console.log(`Available options: ${options.join(', ')}`);
    
    // Select CLUB option
    const clubOption = page.getByRole('option', { name: /ชุมนุม|CLUB/i }).first();
    await expect(clubOption).toBeVisible();
    await clubOption.click();
    
    const afterValue = await activityTypeSelect.textContent();
    console.log(`ActivityType value after selection: ${afterValue}`);
  }
});
