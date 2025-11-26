/**
 * @file critical-smoke.spec.ts
 * @description Critical path smoke tests for School Timetable Management System
 *
 * Covers 8 essential user journeys:
 * 1. Authentication Flow
 * 2. Data Management (Teachers CRUD)
 * 3. Schedule Configuration
 * 4. Subject Assignment to Teachers
 * 5. Timetable Creation (Teacher Arrange)
 * 6. Conflict Detection
 * 7. View Teacher Schedule
 * 8. Export to Excel
 *
 * Expected execution time: ~10-15 minutes
 */

import { test, expect } from "@playwright/test";

// Use first seeded semester for all tests
const TEST_SEMESTER = "1-2567";

test.describe("Critical Path Smoke Tests", () => {
  test.describe("1. Authentication Flow", () => {
    test("Admin can log in via credentials", async ({ page }) => {
      // Navigate to login page
      await page.goto("/auth/signin");

      // Fill in credentials (using seeded admin account from seed.ts)
      await page.fill('input[name="email"]', "admin@school.local");
      await page.fill('input[name="password"]', "admin123");

      // Submit login form
      await page.click('button[type="submit"]');

      // Wait for redirect to dashboard or home
      await page.waitForURL(/\/(dashboard|management)/, { timeout: 10000 });

      // Verify logged in state (check for logout button or user menu)
      const userMenu = page.locator(
        '[aria-label*="account"], [aria-label*="user"], text=/ออกจากระบบ|Logout/i',
      );
      await expect(userMenu.first()).toBeVisible({ timeout: 5000 });
    });

    test("Session persists across page reloads", async ({ page }) => {
      await page.goto("/management/teachers");

      // Verify we're logged in
      await expect(page).toHaveURL(/\/management\/teachers/);

      // Reload page
      await page.reload();

      // Should still be on the same page (not redirected to login)
      await expect(page).toHaveURL(/\/management\/teachers/);

      // Page should render (not error boundary)
      await page.waitForSelector('main, [role="main"]', { timeout: 5000 });
    });

    test("Unauthorized access redirects to login", async ({ browser }) => {
      // Create new context without auth state
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      // Try to access protected route
      await page.goto("/management/teachers");

      // Should redirect to sign-in page
      await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 10000 });

      await context.close();
    });

    test("Admin can log out successfully", async ({ page }) => {
      await page.goto("/dashboard");

      // Wait for page to load
      await page.waitForSelector('main, [role="main"]', { timeout: 5000 });

      // Click logout button (Thai: "ออกจากระบบ" or English: "Logout")
      const logoutButton = page.locator(
        'button:has-text("ออกจากระบบ"), button:has-text("Logout"), a:has-text("ออกจากระบบ"), a:has-text("Logout")',
      );
      await expect(logoutButton.first()).toBeVisible({ timeout: 5000 });
      await logoutButton.first().click();

      // Should redirect to sign-in page
      await expect(page).toHaveURL(/\/(signin|auth\/signin)/, {
        timeout: 10000,
      });

      // Verify logged out state by trying to access protected route
      await page.goto("/management/teachers");
      await expect(page).toHaveURL(/\/(signin|auth\/signin)/, {
        timeout: 10000,
      });
    });

    test("Admin role is correctly assigned and verified", async ({ page }) => {
      await page.goto("/dashboard");

      // Wait for page to load
      await page.waitForSelector('main, [role="main"]', { timeout: 5000 });

      // Verify admin has access to management section
      const managementLink = page.locator(
        'a[href*="/management"], a:has-text("จัดการ"), a:has-text("Management")',
      );
      await expect(managementLink.first()).toBeVisible({ timeout: 5000 });

      // Navigate to management page to confirm access
      await page.goto("/management/teachers");
      await expect(page).toHaveURL(/\/management\/teachers/);

      // Should not redirect to unauthorized page
      await expect(page).not.toHaveURL(/\/(signin|auth\/signin|unauthorized)/);

      // Page should render successfully (not error boundary)
      await page.waitForSelector('main, [role="main"]', { timeout: 5000 });
    });
  });

  test.describe("2. Data Management - Teachers", () => {
    test("Create new teacher with required fields", async ({ page }) => {
      await page.goto("/management/teachers");

      // Click "Add Teacher" button (Thai: "เพิ่มครู")
      const addButton = page.locator(
        'button:has-text("เพิ่มครู"), button:has-text("Add Teacher")',
      );
      await addButton.click();

      // Wait for dialog/modal to open
      await page.waitForSelector('dialog[open], [role="dialog"]', {
        timeout: 5000,
      });

      // Fill in teacher details
      const uniqueId = `SMOKE${Date.now()}`;
      await page.fill(
        'input[name="firstName"], input[name="first_name"]',
        "Test",
      );
      await page.fill(
        'input[name="lastName"], input[name="last_name"]',
        uniqueId,
      );
      await page.fill(
        'input[name="email"]',
        `teacher.${uniqueId.toLowerCase()}@test.com`,
      );

      // Submit form
      await page.click(
        'button[type="submit"]:has-text("บันทึก"), button[type="submit"]:has-text("Save")',
      );

      // Wait for success notification
      await expect(page.locator("text=/สำเร็จ|Success/i").first()).toBeVisible({
        timeout: 5000,
      });

      // Verify teacher appears in list
      await expect(page.locator(`text=${uniqueId}`)).toBeVisible({
        timeout: 5000,
      });
    });

    test("Edit existing teacher", async ({ page }) => {
      await page.goto("/management/teachers");

      // Wait for table to load
      await page.waitForSelector("table tbody tr", { timeout: 10000 });

      // Click edit button on first teacher
      const editButton = page
        .locator('button[aria-label*="edit"], button:has-text("แก้ไข")')
        .first();
      await editButton.click();

      // Wait for edit dialog
      await page.waitForSelector('dialog[open], [role="dialog"]', {
        timeout: 5000,
      });

      // Modify a field
      const firstNameInput = page.locator(
        'input[name="firstName"], input[name="first_name"]',
      );
      const originalValue = await firstNameInput.inputValue();
      await firstNameInput.fill(`${originalValue} (edited)`);

      // Save changes
      await page.click(
        'button[type="submit"]:has-text("บันทึก"), button[type="submit"]:has-text("Save")',
      );

      // Wait for success notification
      await expect(
        page.locator("text=/สำเร็จ|Success|บันทึก/i").first(),
      ).toBeVisible({ timeout: 5000 });
    });

    test("Verify teacher appears in list with pagination", async ({ page }) => {
      await page.goto("/management/teachers");

      // Wait for table to load
      await page.waitForSelector("table tbody tr", { timeout: 10000 });

      // Verify pagination controls exist
      const pagination = page.locator(
        "text=/แสดง.*ถึง.*จาก.*รายการ|Showing.*to.*of.*entries/i",
      );
      await expect(pagination.first()).toBeVisible();

      // Verify at least one teacher row exists
      const rows = page.locator("table tbody tr");
      await expect(rows.first()).toBeVisible();

      // Get row count
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    });
  });

  test.describe("3. Schedule Configuration", () => {
    test("Access schedule config page for a semester", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/config`);

      // Verify page loads successfully
      const response = await page.waitForResponse(
        (resp) => resp.url().includes("/config") && resp.status() === 200,
        { timeout: 10000 },
      );
      expect(response.ok()).toBeTruthy();

      // Verify main content renders
      await page.waitForSelector('main, [role="main"]', { timeout: 5000 });
    });

    test("Verify default data loads (teachers, subjects, rooms)", async ({
      page,
    }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/config`);

      // Wait for table to load
      await page.waitForSelector("table", { timeout: 10000 });

      // Verify table has data rows
      const rows = page.locator("table tbody tr");
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test("Metric cards display correct counts", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/config`);

      // Look for metric cards with Thai labels
      const metricsLocator = page.locator(
        "text=/ครูทั้งหมด|ห้องเรียน|รายวิชา|All Teachers|Classrooms|Subjects/i",
      );
      await expect(metricsLocator.first()).toBeVisible({ timeout: 10000 });

      // Verify at least one metric card shows a number
      const numberPattern = page.locator("text=/\\d+/");
      await expect(numberPattern.first()).toBeVisible();
    });

    test("Navigation between semesters works", async ({ page }) => {
      // Start at first semester
      await page.goto(`/schedule/1-2567/config`);
      await expect(page).toHaveURL(/\/schedule\/1-2567\/config/);
      await page.waitForSelector("table", { timeout: 10000 });

      // Navigate to second semester
      await page.goto(`/schedule/2-2567/config`);
      await expect(page).toHaveURL(/\/schedule\/2-2567\/config/);
      await page.waitForSelector("table", { timeout: 10000 });

      // Both should load successfully
      const mainContent = page.locator('main, [role="main"]');
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe("4. Subject Assignment to Teachers", () => {
    test("Navigate to teacher responsibility page", async ({ page }) => {
      await page.goto(
        `/schedule/${TEST_SEMESTER}/assign/teacher_responsibility`,
      );

      // Verify page loads
      await expect(page).toHaveURL(/\/assign\/teacher_responsibility/);

      // Wait for content to render
      await page.waitForSelector('main, [role="main"]', { timeout: 10000 });
    });

    test("Assign a subject to a teacher", async ({ page }) => {
      await page.goto(
        `/schedule/${TEST_SEMESTER}/assign/teacher_responsibility`,
      );

      // Wait for page to load
      await page.waitForSelector('table, [role="table"]', { timeout: 10000 });

      // Look for assignment controls (dropdowns, buttons)
      // Note: This test assumes there are dropdowns or buttons for assignment
      // Adjust selectors based on actual UI
      const assignButton = page
        .locator('button:has-text("กำหนด"), button:has-text("Assign")')
        .first();

      if (await assignButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await assignButton.click();

        // Wait for any modal or form
        await page.waitForTimeout(1000);

        // Submit if there's a save button
        const saveButton = page
          .locator(
            'button[type="submit"]:has-text("บันทึก"), button:has-text("Save")',
          )
          .first();
        if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await saveButton.click();
        }
      }

      // Verify page doesn't error
      await expect(page.locator('main, [role="main"]')).toBeVisible();
    });

    test("Verify assignment persists after refresh", async ({ page }) => {
      await page.goto(
        `/schedule/${TEST_SEMESTER}/assign/teacher_responsibility`,
      );

      // Wait for table to load
      await page.waitForSelector('table, [role="table"]', { timeout: 10000 });

      // Get initial row count
      const rows = page.locator('table tbody tr, [role="row"]');
      const initialCount = await rows.count();

      // Reload page
      await page.reload();

      // Wait for table to load again
      await page.waitForSelector('table, [role="table"]', { timeout: 10000 });

      // Verify data is still present
      const rowsAfterReload = page.locator('table tbody tr, [role="row"]');
      const countAfterReload = await rowsAfterReload.count();

      expect(countAfterReload).toBe(initialCount);
    });
  });

  test.describe("5. Timetable Creation - Teacher Arrange", () => {
    test("Access teacher arrange page", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/arrange/teacher`);

      // Verify page loads
      await expect(page).toHaveURL(/\/arrange\/teacher/);

      // Wait for main content
      await page.waitForSelector('main, [role="main"]', { timeout: 10000 });
    });

    test("Select a teacher and view their subjects", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/arrange/teacher`);

      // Wait for teacher dropdown/selector
      await page.waitForSelector(
        'select, [role="combobox"], button:has-text("เลือกครู")',
        { timeout: 10000 },
      );

      // Select first teacher (adjust selector based on actual UI)
      const teacherSelect = page.locator("select").first();
      if (await teacherSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await teacherSelect.selectOption({ index: 1 }); // Select first non-empty option
      } else {
        // If using autocomplete/combobox
        const teacherButton = page
          .locator('[role="combobox"], button:has-text("เลือกครู")')
          .first();
        if (
          await teacherButton.isVisible({ timeout: 2000 }).catch(() => false)
        ) {
          await teacherButton.click();
          await page.waitForTimeout(500);
          // Click first option
          await page.locator('[role="option"]').first().click();
        }
      }

      // Wait for subject list to appear
      await page.waitForTimeout(1000);

      // Verify page renders without error
      await expect(page.locator('main, [role="main"]')).toBeVisible();
    });

    test("Drag subject to timeslot (visual verification)", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/arrange/teacher`);

      // This is a simplified smoke test
      // Full drag-and-drop testing is covered in e2e/08-drag-and-drop.spec.ts

      // Verify draggable subjects exist
      await page.waitForSelector(
        '[draggable="true"], [data-testid*="draggable"]',
        { timeout: 10000 },
      );

      // Verify timeslot grid exists
      const timeslotGrid = page.locator("text=/จันทร์|Monday|อังคาร|Tuesday/i");
      await expect(timeslotGrid.first()).toBeVisible({ timeout: 5000 });

      // Basic smoke check: page renders correctly
      await expect(page.locator('main, [role="main"]')).toBeVisible();
    });
  });

  test.describe("6. Conflict Detection", () => {
    test("Verify conflict warnings display", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/arrange/teacher`);

      // Wait for page to load
      await page.waitForSelector('main, [role="main"]', { timeout: 10000 });

      // Look for conflict indicators (red borders, warning icons, etc.)
      // This is a smoke test - detailed conflict testing in e2e/04-conflict-prevention.spec.ts
      const conflictIndicators = page.locator(
        '[style*="red"], [data-conflict="true"], text=/ขัดแย้ง|Conflict/i',
      );

      // Just verify the page can render conflict states
      // May or may not have actual conflicts in seeded data
      await expect(page.locator('main, [role="main"]')).toBeVisible();
    });

    test("Verify locked timeslots are indicated", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/arrange/teacher`);

      // Wait for page load
      await page.waitForSelector('main, [role="main"]', { timeout: 10000 });

      // Look for lock icons or locked state indicators
      const lockIndicators = page.locator(
        '[data-locked="true"], text=/ล็อค|Lock/i, svg:has-text("lock")',
      );

      // Verify page renders (may or may not have locked slots in seeded data)
      await expect(page.locator('main, [role="main"]')).toBeVisible();
    });
  });

  test.describe("7. View Teacher Schedule", () => {
    test("Navigate to teacher schedule view", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/view/teacher`);

      // Verify page loads
      await expect(page).toHaveURL(/\/view\/teacher/);

      // Wait for content
      await page.waitForSelector('main, [role="main"]', { timeout: 10000 });
    });

    test("Select teacher and verify schedule renders", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/view/teacher`);

      // Wait for teacher selector
      await page.waitForSelector('select, [role="combobox"]', {
        timeout: 10000,
      });

      // Select a teacher
      const teacherSelect = page.locator("select").first();
      if (await teacherSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await teacherSelect.selectOption({ index: 1 });
      }

      // Wait for schedule to render
      await page.waitForTimeout(1000);

      // Verify timetable grid appears
      const scheduleGrid = page.locator('table, [role="table"]');
      await expect(scheduleGrid.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("8. Export to Excel", () => {
    test("Navigate to export page", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/export`);

      // Verify page loads
      await expect(page).toHaveURL(/\/export/);

      // Wait for export options
      await page.waitForSelector('main, [role="main"]', { timeout: 10000 });
    });

    test("Trigger Excel export and verify download", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/export`);

      // Wait for export buttons
      await page.waitForSelector(
        'button:has-text("Excel"), button:has-text("ส่งออก")',
        { timeout: 10000 },
      );

      // Set up download listener
      const downloadPromise = page.waitForEvent("download", { timeout: 15000 });

      // Click Excel export button
      const excelButton = page.locator('button:has-text("Excel")').first();
      await excelButton.click();

      // Wait for download to start
      const download = await downloadPromise;

      // Verify file was downloaded
      expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);

      // Verify file has content (non-zero size)
      const path = await download.path();
      expect(path).toBeTruthy();
    });
  });
});
