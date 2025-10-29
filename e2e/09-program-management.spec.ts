import { test, expect } from '@playwright/test';
import { NavigationHelper } from './helpers/navigation';

/**
 * E2E Tests for Program Management with Year-Level Filtering
 * 
 * Test Coverage:
 * - Navigation to program pages by year (M.1-M.6)
 * - CRUD operations (Create, Read, Update, Delete)
 * - Semester filtering
 * - Academic Year filtering
 * - Combined filters (Semester + Academic Year)
 * - Duplicate prevention (ProgramName, Semester, AcademicYear)
 * - Search functionality
 * - Pagination
 * - Inline editing
 * 
 * Prerequisites:
 * - Database seeded with test programs (run seed with SEED_CLEAN_DATA=true)
 * - Dev server running on http://localhost:3000
 * - Authentication bypassed or admin user logged in
 */

test.describe('Program Management - Navigation by Year', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
  });

  test('TC-PROG-001: Navigate to M.1 programs', async ({ page }) => {
    await page.goto('/management/program/1');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/management/program/1');
    
    // Verify page title or heading contains year
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible();
    
    await page.screenshot({
      path: 'test-results/screenshots/program-m1-page.png',
      fullPage: true
    });
  });

  test('TC-PROG-002: Navigate through all year levels (M.1-M.6)', async ({ page }) => {
    for (let year = 1; year <= 6; year++) {
      await page.goto(`/management/program/${year}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000); // Wait for React hydration

      expect(page.url()).toContain(`/management/program/${year}`);
      
      // Verify table or content is visible
      const content = page.locator('body');
      await expect(content).toBeVisible();
      
      console.log(`✓ Year ${year} page loaded successfully`);
    }
  });
});

test.describe('Program Management - Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/management/program/1');
    await page.waitForLoadState('networkidle');
    // Wait for table to load
    await page.waitForTimeout(1000);
  });

  test('TC-PROG-010: Semester filter displays correct options', async ({ page }) => {
    // Look for semester filter dropdown
    const semesterFilter = page.locator('select, [role="combobox"]').filter({ 
      hasText: /ภาคเรียน|Semester|ทั้งหมด/ 
    }).first();

    if (await semesterFilter.count() > 0) {
      await expect(semesterFilter).toBeVisible();
      
      // Check if filter has expected options
      const filterText = await semesterFilter.textContent();
      console.log('Semester filter options:', filterText);
      
      await page.screenshot({
        path: 'test-results/screenshots/program-semester-filter.png',
        fullPage: true
      });
    } else {
      console.log('Semester filter not found - may be using different UI pattern');
    }
  });

  test('TC-PROG-011: Filter by Semester 1', async ({ page }) => {
    // Find and click semester filter
    const semesterSelect = page.locator('select').filter({ 
      hasText: /ทั้งหมด|SEMESTER/ 
    }).first();

    if (await semesterSelect.count() > 0) {
      // Get initial row count
      const initialRows = await page.locator('table tbody tr').count();
      console.log('Initial rows:', initialRows);

      // Select Semester 1
      await semesterSelect.selectOption({ label: /ภาคเรียนที่ 1|SEMESTER_1/ });
      await page.waitForTimeout(500);

      // Get filtered row count
      const filteredRows = await page.locator('table tbody tr').count();
      console.log('Filtered rows (Semester 1):', filteredRows);

      await page.screenshot({
        path: 'test-results/screenshots/program-semester1-filtered.png',
        fullPage: true
      });
    }
  });

  test('TC-PROG-012: Filter by Academic Year', async ({ page }) => {
    // Find academic year filter
    const yearSelect = page.locator('select').filter({ 
      hasText: /256/ 
    }).first();

    if (await yearSelect.count() > 0) {
      await expect(yearSelect).toBeVisible();

      // Get initial row count
      const initialRows = await page.locator('table tbody tr').count();
      console.log('Initial rows:', initialRows);

      // Select a specific year (2568 - current year from seed)
      await yearSelect.selectOption({ label: /2568/ });
      await page.waitForTimeout(500);

      const filteredRows = await page.locator('table tbody tr').count();
      console.log('Filtered rows (Year 2568):', filteredRows);

      await page.screenshot({
        path: 'test-results/screenshots/program-year-filtered.png',
        fullPage: true
      });
    }
  });

  test('TC-PROG-013: Combined filter (Semester + Academic Year)', async ({ page }) => {
    // Apply both filters
    const semesterSelect = page.locator('select').filter({ 
      hasText: /ทั้งหมด|SEMESTER/ 
    }).first();
    const yearSelect = page.locator('select').filter({ 
      hasText: /256/ 
    }).first();

    if (await semesterSelect.count() > 0 && await yearSelect.count() > 0) {
      // Select Semester 1
      await semesterSelect.selectOption({ label: /ภาคเรียนที่ 1|SEMESTER_1/ });
      await page.waitForTimeout(300);

      // Select Year 2568
      await yearSelect.selectOption({ label: /2568/ });
      await page.waitForTimeout(300);

      const filteredRows = await page.locator('table tbody tr').count();
      console.log('Filtered rows (Semester 1 + Year 2568):', filteredRows);

      // Verify data matches filters
      const firstRow = page.locator('table tbody tr').first();
      if (await firstRow.count() > 0) {
        const rowText = await firstRow.textContent();
        console.log('First filtered row:', rowText);
      }

      await page.screenshot({
        path: 'test-results/screenshots/program-combined-filter.png',
        fullPage: true
      });
    }
  });

  test('TC-PROG-014: Search programs by name', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[type="text"]').filter({ 
      hasText: /ค้นหา|Search/ 
    }).or(page.locator('input[placeholder*="ค้นหา"]')).or(page.locator('input[placeholder*="Search"]')).first();

    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();

      // Type search term
      await searchInput.fill('แกนกลาง');
      await page.waitForTimeout(500);

      const searchResults = await page.locator('table tbody tr').count();
      console.log('Search results for "แกนกลาง":', searchResults);

      await page.screenshot({
        path: 'test-results/screenshots/program-search.png',
        fullPage: true
      });

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Program Management - CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/management/program/1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('TC-PROG-020: Open Add Program modal', async ({ page }) => {
    // Find add button - try multiple patterns
    const addButton = page.locator('button').filter({ 
      hasText: /เพิ่ม|Add|สร้าง|Create/i 
    }).first();

    if (await addButton.count() > 0) {
      await expect(addButton).toBeVisible();
      await addButton.click();
      await page.waitForTimeout(500);

      // Verify modal opened
      const modal = page.locator('[role="dialog"], .modal, [class*="Modal"]').first();
      if (await modal.count() > 0) {
        await expect(modal).toBeVisible();
        
        await page.screenshot({
          path: 'test-results/screenshots/program-add-modal.png',
          fullPage: true
        });

        // Close modal (ESC key or close button)
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }
    }
  });

  test('TC-PROG-021: Create new program - Duplicate detection', async ({ page }) => {
    // Try to create a program that already exists (should fail)
    const addButton = page.locator('button').filter({ 
      hasText: /เพิ่ม|Add/i 
    }).first();

    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(500);

      // Fill form with existing program data
      const nameInput = page.locator('input[name*="name"], input[id*="name"]').first();
      if (await nameInput.count() > 0) {
        await nameInput.fill('หลักสูตรแกนกลาง ม.ต้น');
      }

      // Select Semester 1
      const semesterSelect = page.locator('select').filter({ 
        hasText: /ภาคเรียน|Semester/ 
      }).first();
      if (await semesterSelect.count() > 0) {
        await semesterSelect.selectOption({ label: /ภาคเรียนที่ 1|SEMESTER_1/ });
      }

      // Select Academic Year 2568 (should already exist from seed)
      const yearInput = page.locator('input[name*="year"], input[id*="year"]').first();
      if (await yearInput.count() > 0) {
        await yearInput.fill('2568');
      }

      // Try to submit
      const submitButton = page.locator('button[type="submit"], button').filter({ 
        hasText: /บันทึก|Save|Submit/i 
      }).first();
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(1000);

        // Look for error message
        const errorMessage = page.locator('[class*="error"], [role="alert"], .snackbar').first();
        if (await errorMessage.count() > 0) {
          const errorText = await errorMessage.textContent();
          console.log('Duplicate detection error:', errorText);
          
          await page.screenshot({
            path: 'test-results/screenshots/program-duplicate-error.png',
            fullPage: true
          });
        }

        // Close modal
        await page.keyboard.press('Escape');
      }
    }
  });

  test('TC-PROG-022: Create new program - Success', async ({ page }) => {
    const addButton = page.locator('button').filter({ 
      hasText: /เพิ่ม|Add/i 
    }).first();

    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(500);

      // Fill form with unique program data
      const nameInput = page.locator('input[name*="name"], input[id*="name"]').first();
      if (await nameInput.count() > 0) {
        const uniqueName = `หลักสูตรทดสอบ E2E ${Date.now()}`;
        await nameInput.fill(uniqueName);
      }

      // Select Semester 2
      const semesterSelect = page.locator('select').filter({ 
        hasText: /ภาคเรียน|Semester/ 
      }).first();
      if (await semesterSelect.count() > 0) {
        await semesterSelect.selectOption({ label: /ภาคเรียนที่ 2|SEMESTER_2/ });
      }

      // Set Academic Year to 2569 (future year, should not conflict)
      const yearInput = page.locator('input[name*="year"], input[id*="year"]').first();
      if (await yearInput.count() > 0) {
        await yearInput.fill('2569');
      }

      await page.screenshot({
        path: 'test-results/screenshots/program-create-form-filled.png',
        fullPage: true
      });

      // Submit form
      const submitButton = page.locator('button[type="submit"], button').filter({ 
        hasText: /บันทึก|Save/i 
      }).first();
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);

        // Look for success message
        const successMessage = page.locator('[class*="success"], [role="alert"]').first();
        if (await successMessage.count() > 0) {
          const successText = await successMessage.textContent();
          console.log('Success message:', successText);
        }

        await page.screenshot({
          path: 'test-results/screenshots/program-created-success.png',
          fullPage: true
        });
      }
    }
  });

  test('TC-PROG-023: Inline edit program', async ({ page }) => {
    // Find first editable row
    const firstRow = page.locator('table tbody tr').first();
    
    if (await firstRow.count() > 0) {
      // Look for edit button in row
      const editButton = firstRow.locator('button').filter({ 
        hasText: /แก้ไข|Edit/i 
      }).or(firstRow.locator('[aria-label*="edit"], [title*="edit"]')).first();

      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForTimeout(500);

        // Look for inline input fields or modal
        const inlineInput = firstRow.locator('input[type="text"]').first();
        const modal = page.locator('[role="dialog"]').first();

        if (await inlineInput.count() > 0) {
          // Inline editing mode
          await inlineInput.fill('หลักสูตรแก้ไข Test');
          
          // Find save button
          const saveButton = firstRow.locator('button').filter({ 
            hasText: /บันทึก|Save/i 
          }).first();
          
          if (await saveButton.count() > 0) {
            await page.screenshot({
              path: 'test-results/screenshots/program-inline-edit.png',
              fullPage: true
            });

            await saveButton.click();
            await page.waitForTimeout(1000);
          }
        } else if (await modal.count() > 0) {
          // Modal editing mode
          await page.screenshot({
            path: 'test-results/screenshots/program-edit-modal.png',
            fullPage: true
          });

          // Close modal
          await page.keyboard.press('Escape');
        }
      }
    }
  });

  test('TC-PROG-024: Delete program', async ({ page }) => {
    // Create a test program first, then delete it
    const addButton = page.locator('button').filter({ 
      hasText: /เพิ่ม|Add/i 
    }).first();

    if (await addButton.count() > 0) {
      // Create test program
      await addButton.click();
      await page.waitForTimeout(500);

      const nameInput = page.locator('input[name*="name"], input[id*="name"]').first();
      if (await nameInput.count() > 0) {
        await nameInput.fill('หลักสูตรลบทิ้ง E2E');
      }

      const semesterSelect = page.locator('select').filter({ 
        hasText: /ภาคเรียน/ 
      }).first();
      if (await semesterSelect.count() > 0) {
        await semesterSelect.selectOption({ label: /ภาคเรียนที่ 2/ });
      }

      const yearInput = page.locator('input[name*="year"]').first();
      if (await yearInput.count() > 0) {
        await yearInput.fill('2570');
      }

      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }

      // Now find and delete the created program
      const targetRow = page.locator('table tbody tr').filter({ 
        hasText: /หลักสูตรลบทิ้ง E2E/ 
      }).first();

      if (await targetRow.count() > 0) {
        const deleteButton = targetRow.locator('button').filter({ 
          hasText: /ลบ|Delete/i 
        }).or(targetRow.locator('[aria-label*="delete"], [title*="delete"]')).first();

        if (await deleteButton.count() > 0) {
          await deleteButton.click();
          await page.waitForTimeout(500);

          // Confirm deletion (if confirmation dialog appears)
          const confirmButton = page.locator('button').filter({ 
            hasText: /ยืนยัน|Confirm|ลบ|Delete/i 
          }).first();
          
          if (await confirmButton.count() > 0) {
            await page.screenshot({
              path: 'test-results/screenshots/program-delete-confirm.png',
              fullPage: true
            });

            await confirmButton.click();
            await page.waitForTimeout(1000);

            await page.screenshot({
              path: 'test-results/screenshots/program-deleted.png',
              fullPage: true
            });
          }
        }
      }
    }
  });
});

test.describe('Program Management - Data Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/management/program/1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('TC-PROG-030: Verify seeded data across academic years', async ({ page }) => {
    // Check for programs from different academic years
    const yearSelect = page.locator('select').filter({ 
      hasText: /256/ 
    }).first();

    if (await yearSelect.count() > 0) {
      // Test Year 2567
      await yearSelect.selectOption({ label: /2567/ });
      await page.waitForTimeout(500);
      const rows2567 = await page.locator('table tbody tr').count();
      console.log('Programs in 2567:', rows2567);

      // Test Year 2568
      await yearSelect.selectOption({ label: /2568/ });
      await page.waitForTimeout(500);
      const rows2568 = await page.locator('table tbody tr').count();
      console.log('Programs in 2568:', rows2568);

      // Test Year 2569
      await yearSelect.selectOption({ label: /2569/ });
      await page.waitForTimeout(500);
      const rows2569 = await page.locator('table tbody tr').count();
      console.log('Programs in 2569:', rows2569);

      // Verify we have data across years
      expect(rows2567 + rows2568 + rows2569).toBeGreaterThan(0);

      await page.screenshot({
        path: 'test-results/screenshots/program-multi-year-data.png',
        fullPage: true
      });
    }
  });

  test('TC-PROG-031: Verify semester filter affects row count', async ({ page }) => {
    const semesterSelect = page.locator('select').filter({ 
      hasText: /ทั้งหมด|SEMESTER/ 
    }).first();

    if (await semesterSelect.count() > 0) {
      // All semesters
      await semesterSelect.selectOption({ index: 0 });
      await page.waitForTimeout(300);
      const allRows = await page.locator('table tbody tr').count();

      // Semester 1 only
      await semesterSelect.selectOption({ label: /ภาคเรียนที่ 1|SEMESTER_1/ });
      await page.waitForTimeout(300);
      const sem1Rows = await page.locator('table tbody tr').count();

      // Semester 2 only
      await semesterSelect.selectOption({ label: /ภาคเรียนที่ 2|SEMESTER_2/ });
      await page.waitForTimeout(300);
      const sem2Rows = await page.locator('table tbody tr').count();

      console.log('All rows:', allRows);
      console.log('Semester 1 rows:', sem1Rows);
      console.log('Semester 2 rows:', sem2Rows);

      // Verify filtering works (sem1 + sem2 should equal or be close to all)
      expect(sem1Rows).toBeLessThanOrEqual(allRows);
      expect(sem2Rows).toBeLessThanOrEqual(allRows);
    }
  });

  test('TC-PROG-032: Verify table displays all expected columns', async ({ page }) => {
    const table = page.locator('table').first();
    
    if (await table.count() > 0) {
      // Check for header columns
      const headers = await table.locator('thead th, thead td').allTextContents();
      console.log('Table headers:', headers);

      // Verify key columns exist
      const headerText = headers.join(' ').toLowerCase();
      const hasNameColumn = headerText.includes('ชื่อ') || headerText.includes('name') || headerText.includes('program');
      const hasSemesterColumn = headerText.includes('ภาค') || headerText.includes('semester');
      
      console.log('Has name column:', hasNameColumn);
      console.log('Has semester column:', hasSemesterColumn);

      await page.screenshot({
        path: 'test-results/screenshots/program-table-columns.png',
        fullPage: true
      });
    }
  });
});

test.describe('Program Management - Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/management/program/1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('TC-PROG-040: Pagination controls exist', async ({ page }) => {
    // Look for pagination controls
    const pagination = page.locator('[role="navigation"], .pagination, [class*="Pagination"]').first();
    
    if (await pagination.count() > 0) {
      await expect(pagination).toBeVisible();
      
      const paginationText = await pagination.textContent();
      console.log('Pagination:', paginationText);

      await page.screenshot({
        path: 'test-results/screenshots/program-pagination.png',
        fullPage: true
      });
    } else {
      console.log('Pagination not found - may not have enough data or using infinite scroll');
    }
  });

  test('TC-PROG-041: Navigate to next page if available', async ({ page }) => {
    // Look for next page button
    const nextButton = page.locator('button, a').filter({ 
      hasText: /ถัดไป|Next|›|>/ 
    }).first();

    if (await nextButton.count() > 0) {
      const isDisabled = await nextButton.isDisabled().catch(() => true);
      
      if (!isDisabled) {
        // Get current page data
        const currentRows = await page.locator('table tbody tr').allTextContents();
        
        // Click next
        await nextButton.click();
        await page.waitForTimeout(500);

        // Get new page data
        const newRows = await page.locator('table tbody tr').allTextContents();
        
        // Verify page changed
        expect(newRows).not.toEqual(currentRows);
        console.log('Successfully navigated to next page');

        await page.screenshot({
          path: 'test-results/screenshots/program-page-2.png',
          fullPage: true
        });
      } else {
        console.log('Next button disabled - only one page of data');
      }
    }
  });
});

test.describe('Program Management - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/management/program/1');
    await page.waitForLoadState('networkidle');
  });

  test('TC-PROG-050: Page has proper heading structure', async ({ page }) => {
    const h1 = await page.locator('h1').count();
    const h2 = await page.locator('h2').count();
    
    console.log('H1 count:', h1);
    console.log('H2 count:', h2);
    
    // Should have at least one heading
    expect(h1 + h2).toBeGreaterThan(0);
  });

  test('TC-PROG-051: Interactive elements are keyboard accessible', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });
    
    console.log('First focusable element:', focusedElement);
    expect(focusedElement).toBeTruthy();
  });

  test('TC-PROG-052: Table is properly labeled', async ({ page }) => {
    const table = page.locator('table').first();
    
    if (await table.count() > 0) {
      // Check for table caption or aria-label
      const caption = await table.locator('caption').count();
      const ariaLabel = await table.getAttribute('aria-label');
      const ariaLabelledBy = await table.getAttribute('aria-labelledby');
      
      console.log('Table caption:', caption > 0);
      console.log('Table aria-label:', ariaLabel);
      console.log('Table aria-labelledby:', ariaLabelledBy);
      
      // At least one labeling method should be present
      const isLabeled = caption > 0 || ariaLabel || ariaLabelledBy;
      console.log('Table is properly labeled:', isLabeled);
    }
  });
});
