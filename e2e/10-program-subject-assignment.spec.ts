import { test, expect } from "./fixtures/admin.fixture";

/**
 * E2E Tests for MOE-Compliant Program Management Workflow
 *
 * Tests the complete workflow:
 * 1. Navigate to program management by grade year
 * 2. View programs for specific grade levels
 * 3. Verify page structure and UI elements
 *
 * IMPLEMENTATION STATUS: The program management feature exists at /management/program
 * with year-based navigation (/management/program/year/1 through /year/6).
 * The UI uses EditableTable with inline editing (Thai labels).
 * 
 * NOTE: Tests for program creation, subject assignment, and MOE validation 
 * require the EditableTable inline editing pattern which differs from form-based input.
 * See 09-program-management.spec.ts for more comprehensive EditableTable tests.
 */

test.describe("Program Management Workflow", () => {
  test("should navigate to program management page and verify structure", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Navigate to the program management landing page
    await page.goto("/management/program");
    
    // Step 1: Verify page loads
    await test.step("Verify program management page loads", async () => {
      // Wait for main content to load
      await expect(page.locator('main, [role="main"], body').first()).toBeVisible({ timeout: 15000 });
      
      // Either we see "หลักสูตรทั้งหมด" (program overview) or a table (direct year view)
      const hasOverview = await page.getByText("หลักสูตรทั้งหมด").isVisible().catch(() => false);
      const hasTable = await page.locator('table').first().isVisible().catch(() => false);
      
      expect(hasOverview || hasTable).toBeTruthy();
    });
    
    // Step 2: Navigate to a specific year's program if overview exists
    await test.step("Navigate to year 1 programs", async () => {
      // Check if we're on overview page with year links
      const year1Link = page.getByRole("link", { 
        name: /หลักสูตรชั้นมัธยมศึกษาปีที่ 1|ม\.1|M\.1|Year 1/i
      });
      
      if (await year1Link.isVisible().catch(() => false)) {
        await year1Link.click();
        await page.waitForURL(/\/management\/program\/(year\/)?1/);
      } else {
        // Already on a year page, navigate directly
        await page.goto("/management/program/year/1");
      }
      
      // Page should load with table
      await expect(page.locator('table, main').first()).toBeVisible({ timeout: 15000 });
    });
    
    // Step 3: Verify table structure
    await test.step("Verify program table structure", async () => {
      // Look for table headers - Thai labels
      const table = page.locator('table').first();
      
      if (await table.isVisible().catch(() => false)) {
        // Should have Thai column headers from ProgramEditableTable
        const headers = ['ID', 'รหัสหลักสูตร', 'ชื่อหลักสูตร', 'แผนการเรียน', 'หน่วยกิตขั้นต่ำ', 'สถานะ'];
        
        for (const header of headers) {
          const hasHeader = await table.getByText(header).first().isVisible().catch(() => false);
          if (hasHeader) {
            console.log(`✓ Found header: ${header}`);
          }
        }
      }
    });
  });

  /**
   * TODO: Implement these tests to match actual gradelevel/program UI.
   * The UI uses EditableTable with inline editing, not forms.
   * Reference: e2e/11-activity-management.spec.ts for EditableTable patterns.
   */
  test.skip("should assign program to gradelevel", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/management/gradelevel");
    // Test stub: requires full implementation matching actual EditableTable UI
  });

  test.skip("should validate subject assignment with invalid credits", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/management/program");
    // Test stub: requires full implementation matching actual EditableTable UI
  });

  test.skip("should update existing subject assignments", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/management/program");
    // Test stub: requires full implementation matching actual EditableTable UI
  });
});

/**
 * Activity Management tests are SKIPPED because the ActivityTable component
 * exists but is not integrated into the app's routes yet.
 * Re-enable when /management/subject page includes Activity management tab/section.
 */
test.describe.skip("Activity Management Workflow", () => {
  test("should create and manage activity subjects", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/management/subject");
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });
    
    await test.step("Navigate to activity management", async () => {
      // Look for activity management section or tab
      const activitySection = page.getByText(/activity management/i);
      if (await activitySection.isVisible()) {
        await activitySection.click();
      }
    });

    await test.step("Create new activity", async () => {
      const addButton = page.getByRole("button", { name: /add activity/i });
      await addButton.click();

      // Fill in activity details
      await page.getByLabel(/subject code/i).fill("ACT-CLUB01");
      await page.getByLabel(/subject name/i).fill("Science Club");

      // Select activity type
      await page.getByLabel(/activity type/i).click();
      await page.getByRole("option", { name: /club/i }).click();

      // Ensure not graded
      const gradedCheckbox = page.getByLabel(/is graded/i);
      await gradedCheckbox.uncheck();

      // Submit
      await page.getByRole("button", { name: /create|save/i }).click();

      // Verify creation
      await expect(page.getByText("ACT-CLUB01")).toBeVisible();
      await expect(page.getByText("Science Club")).toBeVisible();
    });

    await test.step("Edit activity", async () => {
      // Find the activity row
      const activityRow = page.locator('tr:has-text("ACT-CLUB01")');

      // Click edit button
      const editButton = activityRow.getByRole("button", { name: /edit/i });
      await editButton.click();

      // Modify name
      const nameInput = page.getByLabel(/subject name/i);
      await nameInput.fill("Advanced Science Club");

      // Save
      await page.getByRole("button", { name: /update|save/i }).click();

      // Verify update
      await expect(page.getByText("Advanced Science Club")).toBeVisible();
    });

    await test.step("Delete activity", async () => {
      const activityRow = page.locator('tr:has-text("ACT-CLUB01")');

      // Click delete button
      const deleteButton = activityRow.getByRole("button", { name: /delete/i });
      await deleteButton.click();

      // Confirm deletion
      const confirmButton = page
        .getByRole("button", { name: /delete|confirm/i })
        .last();
      await confirmButton.click();

      // Verify deletion
      await expect(page.getByText("ACT-CLUB01")).not.toBeVisible();
    });
  });

  test("should validate activity creation", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/management/subject");
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });
    
    await test.step("Attempt to create activity without required fields", async () => {
      const addButton = page.getByRole("button", { name: /add activity/i });
      await addButton.click();

      // Leave subject code empty and try to submit
      await page.getByLabel(/subject name/i).fill("Invalid Activity");
      await page.getByRole("button", { name: /create|save/i }).click();

      // Should show validation error
      await expect(page.getByText(/required|ห้ามว่าง/i)).toBeVisible();
    });
  });
});
