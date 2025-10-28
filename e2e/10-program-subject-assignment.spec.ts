import { test, expect } from '@playwright/test';

/**
 * E2E Tests for MOE-Compliant Program Management Workflow
 * 
 * Tests the complete workflow:
 * 1. Create a new program
 * 2. Assign subjects to the program with custom credits/mandatory settings
 * 3. Assign program to gradelevel
 * 4. Validate MOE requirements
 */

test.describe('Program Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the program management page
    await page.goto('/management/program');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new program and assign subjects', async ({ page }) => {
    // Step 1: Create a new program
    await test.step('Create new program', async () => {
      const addButton = page.getByRole('button', { name: /add/i });
      await addButton.click();

      // Fill in program details
      await page.getByLabel(/program code/i).fill('M1-TEST');
      await page.getByLabel(/program name/i).fill('Test Program M1 Science-Math');
      await page.getByLabel(/year/i).fill('1');
      await page.getByLabel(/track/i).click();
      await page.getByRole('option', { name: /science.*math/i }).click();
      await page.getByLabel(/min total credits/i).fill('30');

      // Submit
      const saveButton = page.getByRole('button', { name: /save|create/i });
      await saveButton.click();

      // Verify program was created
      await expect(page.getByText('M1-TEST')).toBeVisible();
    });

    // Step 2: Navigate to subject assignment
    await test.step('Navigate to subject assignment', async () => {
      // Click on the program row or details button
      const programRow = page.getByText('M1-TEST').locator('..');
      await programRow.click();

      // Wait for navigation to program detail page
      await page.waitForURL(/\/management\/program\/\d+/);
      await expect(page.getByText(/assign subjects to program/i)).toBeVisible();
    });

    // Step 3: Assign subjects with custom credits
    await test.step('Assign subjects with custom credits and mandatory settings', async () => {
      // Select core subjects (mandatory)
      const mathCheckbox = page.locator('tr:has-text("MATH")').getByRole('checkbox');
      await mathCheckbox.check();
      await expect(mathCheckbox).toBeChecked();

      // Set custom credits for math (e.g., 2 credits)
      const mathMinCredits = page.locator('tr:has-text("MATH")').getByLabel(/min credits/i);
      await mathMinCredits.fill('2');
      
      const mathMaxCredits = page.locator('tr:has-text("MATH")').getByLabel(/max credits/i);
      await mathMaxCredits.fill('2');

      // Verify mandatory switch is enabled for CORE subjects
      const mathMandatorySwitch = page.locator('tr:has-text("MATH")').getByRole('switch');
      await expect(mathMandatorySwitch).toBeChecked();

      // Select an elective subject (not mandatory)
      const electiveCheckbox = page.locator('tr:has-text("ADDITIONAL")').first().getByRole('checkbox');
      await electiveCheckbox.check();

      // Set as non-mandatory
      const electiveMandatorySwitch = page.locator('tr:has-text("ADDITIONAL")').first().getByRole('switch');
      await electiveMandatorySwitch.uncheck();

      // Submit assignment
      const assignButton = page.getByRole('button', { name: /assign.*selected/i });
      await expect(assignButton).toBeEnabled();
      await assignButton.click();

      // Wait for assignment to complete
      await expect(page.getByText(/assigning/i)).not.toBeVisible({ timeout: 5000 });
    });

    // Step 4: Verify MOE validation
    await test.step('Verify MOE validation feedback', async () => {
      const validationSection = page.locator('text=MOE Validation').locator('..');
      await expect(validationSection).toBeVisible();

      // Check if compliant or see errors/warnings
      const isCompliant = await page.getByText(/compliant with moe requirements/i).isVisible();
      
      if (!isCompliant) {
        // If not compliant, errors should be visible
        const errors = await page.locator('ul li').allTextContents();
        console.log('MOE Validation Errors:', errors);
        expect(errors.length).toBeGreaterThan(0);
      } else {
        await expect(page.getByText(/compliant with moe requirements/i)).toBeVisible();
      }
    });
  });

  test('should assign program to gradelevel', async ({ page }) => {
    await test.step('Navigate to gradelevel management', async () => {
      await page.goto('/management/gradelevel');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Assign program to a gradelevel', async () => {
      // Find a gradelevel row (e.g., M.1/1)
      const gradelevelRow = page.locator('tr:has-text("M.1/1")').first();
      
      // Click the program dropdown
      const programSelect = gradelevelRow.getByRole('combobox', { name: /program/i });
      await programSelect.click();

      // Select the test program
      await page.getByRole('option', { name: /M1-TEST/i }).click();

      // Save/update
      const saveButton = gradelevelRow.getByRole('button', { name: /save|update/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
      }

      // Verify assignment
      await expect(gradelevelRow).toContainText('M1-TEST');
    });
  });

  test('should validate subject assignment with invalid credits', async ({ page }) => {
    await test.step('Create program and navigate to subject assignment', async () => {
      // Quick create a program
      const addButton = page.getByRole('button', { name: /add/i });
      await addButton.click();
      
      await page.getByLabel(/program code/i).fill('M1-INVALID');
      await page.getByLabel(/program name/i).fill('Invalid Credits Test');
      await page.getByLabel(/year/i).fill('1');
      await page.getByLabel(/track/i).click();
      await page.getByRole('option', { name: /science.*math/i }).click();
      await page.getByLabel(/min total credits/i).fill('30');
      
      await page.getByRole('button', { name: /save|create/i }).click();
      
      // Navigate to subject assignment
      const programRow = page.getByText('M1-INVALID').locator('..');
      await programRow.click();
      await page.waitForURL(/\/management\/program\/\d+/);
    });

    await test.step('Assign subjects with insufficient credits', async () => {
      // Select only one subject with minimal credits
      const firstSubject = page.locator('tbody tr').first();
      await firstSubject.getByRole('checkbox').check();
      
      // Set very low credits (e.g., 0.5)
      await firstSubject.getByLabel(/min credits/i).fill('0.5');
      await firstSubject.getByLabel(/max credits/i).fill('0.5');

      // Submit
      await page.getByRole('button', { name: /assign.*selected/i }).click();
      await expect(page.getByText(/assigning/i)).not.toBeVisible({ timeout: 5000 });

      // Verify validation errors
      await expect(page.getByText(/not compliant/i)).toBeVisible();
      
      const errorList = page.locator('ul[style*="color: red"] li');
      await expect(errorList).toHaveCount(await errorList.count());
      
      // Should have errors about insufficient credits per learning area
      const errors = await errorList.allTextContents();
      console.log('Validation Errors:', errors);
      expect(errors.some(e => e.includes('credit') || e.includes('หน่วยกิต'))).toBeTruthy();
    });
  });

  test('should update existing subject assignments', async ({ page }) => {
    await test.step('Navigate to existing program', async () => {
      // Find an existing program row
      const existingProgram = page.locator('tbody tr').first();
      await existingProgram.click();
      await page.waitForURL(/\/management\/program\/\d+/);
    });

    await test.step('Modify subject credits', async () => {
      // Find a selected subject
      const selectedSubject = page.locator('tr:has(input[type="checkbox"]:checked)').first();
      
      if (await selectedSubject.isVisible()) {
        // Change credits
        const minCreditsInput = selectedSubject.getByLabel(/min credits/i);
        const currentValue = await minCreditsInput.inputValue();
        const newValue = parseFloat(currentValue) + 0.5;
        
        await minCreditsInput.fill(newValue.toString());
        await selectedSubject.getByLabel(/max credits/i).fill(newValue.toString());

        // Save
        await page.getByRole('button', { name: /assign.*selected/i }).click();
        await expect(page.getByText(/assigning/i)).not.toBeVisible({ timeout: 5000 });

        // Verify update
        await expect(minCreditsInput).toHaveValue(newValue.toString());
      }
    });
  });
});

test.describe('Activity Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/management/subject');
    await page.waitForLoadState('networkidle');
  });

  test('should create and manage activity subjects', async ({ page }) => {
    await test.step('Navigate to activity management', async () => {
      // Look for activity management section or tab
      const activitySection = page.getByText(/activity management/i);
      if (await activitySection.isVisible()) {
        await activitySection.click();
      }
    });

    await test.step('Create new activity', async () => {
      const addButton = page.getByRole('button', { name: /add activity/i });
      await addButton.click();

      // Fill in activity details
      await page.getByLabel(/subject code/i).fill('ACT-CLUB01');
      await page.getByLabel(/subject name/i).fill('Science Club');
      
      // Select activity type
      await page.getByLabel(/activity type/i).click();
      await page.getByRole('option', { name: /club/i }).click();

      // Ensure not graded
      const gradedCheckbox = page.getByLabel(/is graded/i);
      await gradedCheckbox.uncheck();

      // Submit
      await page.getByRole('button', { name: /create|save/i }).click();

      // Verify creation
      await expect(page.getByText('ACT-CLUB01')).toBeVisible();
      await expect(page.getByText('Science Club')).toBeVisible();
    });

    await test.step('Edit activity', async () => {
      // Find the activity row
      const activityRow = page.locator('tr:has-text("ACT-CLUB01")');
      
      // Click edit button
      const editButton = activityRow.getByRole('button', { name: /edit/i });
      await editButton.click();

      // Modify name
      const nameInput = page.getByLabel(/subject name/i);
      await nameInput.fill('Advanced Science Club');

      // Save
      await page.getByRole('button', { name: /update|save/i }).click();

      // Verify update
      await expect(page.getByText('Advanced Science Club')).toBeVisible();
    });

    await test.step('Delete activity', async () => {
      const activityRow = page.locator('tr:has-text("ACT-CLUB01")');
      
      // Click delete button
      const deleteButton = activityRow.getByRole('button', { name: /delete/i });
      await deleteButton.click();

      // Confirm deletion
      const confirmButton = page.getByRole('button', { name: /delete|confirm/i }).last();
      await confirmButton.click();

      // Verify deletion
      await expect(page.getByText('ACT-CLUB01')).not.toBeVisible();
    });
  });

  test('should validate activity creation', async ({ page }) => {
    await test.step('Attempt to create activity without required fields', async () => {
      const addButton = page.getByRole('button', { name: /add activity/i });
      await addButton.click();

      // Leave subject code empty and try to submit
      await page.getByLabel(/subject name/i).fill('Invalid Activity');
      await page.getByRole('button', { name: /create|save/i }).click();

      // Should show validation error
      await expect(page.getByText(/required|ห้ามว่าง/i)).toBeVisible();
    });
  });
});
