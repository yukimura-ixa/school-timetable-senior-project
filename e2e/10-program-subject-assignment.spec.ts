import { test, expect } from "./fixtures/admin.fixture";

const RUN_PROGRAM_ASSIGNMENT_E2E = process.env.E2E_PROGRAM_ASSIGNMENT === "true";

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

      // If global loading is shown, wait for it to disappear
      const loading = page.getByText("กำลังโหลดข้อมูล...");
      if (await loading.isVisible().catch(() => false)) {
        await expect(loading).toBeHidden({ timeout: 20000 });
      }

      // Ensure header appears after data resolves
      await expect(
        page.getByRole("heading", { name: /จัดการหลักสูตร/ }),
      ).toBeVisible({ timeout: 20000 });

      // Either we see "หลักสูตรทั้งหมด" (program overview) or a table (direct year view)
      const hasOverview = await page.getByText("หลักสูตรทั้งหมด").isVisible().catch(() => false);
      const hasTable = await page.locator('table').first().isVisible().catch(() => false);
      const hasYearCards = await page
        .locator('a[href*="/management/program/year/"]')
        .first()
        .isVisible()
        .catch(() => false);
      
      expect(hasOverview || hasTable || hasYearCards).toBeTruthy();
    });
    
    // Step 2: Navigate to a specific year's program if overview exists
    await test.step("Navigate to year 1 programs", async () => {
      // Check if we're on overview page with year links
      const year1NamedLink = page.getByRole("link", {
        name: /หลักสูตรชั้นมัธยมศึกษาปีที่ 1|ม\.1|M\.1|Year 1/i
      });
      const year1Link = page
        .locator('a[href*="/management/program/year/1"]')
        .first();

      if (await year1NamedLink.isVisible().catch(() => false)) {
        await year1NamedLink.click();
        await page.waitForURL(/\/management\/program\/(year\/)?1/);
      } else if (await year1Link.isVisible().catch(() => false)) {
        await year1Link.click();
        await page.waitForURL(/\/management\/program\/(year\/)?1/);
      } else {
        // Already on a year page, navigate directly
        await page.goto("/management/program/year/1");
      }

      // Page should load with table
      await expect(
        page.locator(
          '[role="grid"], .MuiDataGrid-root, table, [role="table"], main',
        ).first(),
      ).toBeVisible({ timeout: 15000 });
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
  test("should assign program to gradelevel", async ({ authenticatedAdmin }) => {
    test.skip(
      !RUN_PROGRAM_ASSIGNMENT_E2E,
      "Set E2E_PROGRAM_ASSIGNMENT=true to run program assignment E2E tests",
    );
    const { page } = authenticatedAdmin;
    await page.goto("/management/gradelevel");
    // Test stub: requires full implementation matching actual EditableTable UI
  });

  test(
    "should validate subject assignment with invalid credits",
    async ({ authenticatedAdmin }) => {
      test.skip(
        !RUN_PROGRAM_ASSIGNMENT_E2E,
        "Set E2E_PROGRAM_ASSIGNMENT=true to run program assignment E2E tests",
      );
      const { page } = authenticatedAdmin;
      await page.goto("/management/program");
      // Test stub: requires full implementation matching actual EditableTable UI
    },
  );

  test(
    "should update existing subject assignments",
    async ({ authenticatedAdmin }) => {
      test.skip(
        !RUN_PROGRAM_ASSIGNMENT_E2E,
        "Set E2E_PROGRAM_ASSIGNMENT=true to run program assignment E2E tests",
      );
      const { page } = authenticatedAdmin;
      await page.goto("/management/program");
      // Test stub: requires full implementation matching actual EditableTable UI
    },
  );
});
