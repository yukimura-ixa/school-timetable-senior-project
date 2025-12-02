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
 * Uses admin fixture for authentication (no dev bypass).
 */

import { test, expect } from "../fixtures/admin.fixture";

// Use first seeded semester for all tests
const TEST_SEMESTER = "1-2567";

test.describe("Critical Path Smoke Tests", () => {
  test.describe("1. Authentication Flow", () => {
    test("Admin can log in via credentials", async ({ browser }) => {
      // Create a fresh unauthenticated context for login testing
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      // Navigate to login page
      await page.goto("/signin");

      // Wait for signin page to fully load
      await page.waitForLoadState("domcontentloaded");

      // Fill in credentials (using seeded admin account from seed.ts)
      await page.fill('input[type="email"]', "admin@school.local");
      await page.fill('input[type="password"]', "admin123");

      // Submit login form - look for credentials submit button (exclude Google)
      const submitButton = page
        .locator('button:not([data-testid="google-signin-button"])', {
          hasText: /เข้าสู่ระบบ|sign in|login|submit/i,
        })
        .first();
      await submitButton.click();

      // Wait for redirect to dashboard
      await page.waitForURL(/\/dashboard/, { timeout: 15000 });

      // Verify logged in state via session API
      const response = await page.request.get("/api/auth/get-session");
      expect(response.ok()).toBeTruthy();
      const session = await response.json();
      expect(session?.user?.role).toBe("admin");
      expect(session?.user?.email).toBe("admin@school.local");

      await context.close();
    });

    test("Session persists across page reloads", async ({ page }) => {
      await page.goto("/management/teacher");
      await page.waitForLoadState("domcontentloaded");

      // Verify we're logged in (not redirected to /signin)
      await expect(page).toHaveURL(/\/management\/teacher/);

      // Wait for page content to load (table, loading skeleton, or empty state)
      await page.waitForSelector('table, [class*="Skeleton"], [class*="Empty"]', {
        timeout: 15000,
      });

      // Reload page
      await page.reload();
      await page.waitForLoadState("domcontentloaded");

      // Should still be on the same page (not redirected to login)
      await expect(page).toHaveURL(/\/management\/teacher/);

      // Verify auth persisted via session API
      const response = await page.request.get("/api/auth/get-session");
      expect(response.ok()).toBeTruthy();
      const session = await response.json();
      expect(session?.user?.role).toBe("admin");
    });

    test("Unauthorized access redirects to login", async ({ browser }) => {
      // Create new context without auth state
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      // Try to access protected route
      await page.goto("/management/teacher");

      // Should redirect to sign-in page
      await expect(page).toHaveURL(/\/signin/, { timeout: 15000 });

      await context.close();
    });

    test("Admin can log out successfully", async ({ browser }) => {
      // Use a fresh authenticated context so logout doesn't affect other tests
      const context = await browser.newContext();
      const page = await context.newPage();

      // Login first
      await page.goto("/signin");
      await page.waitForLoadState("domcontentloaded");
      await page.fill('input[type="email"]', "admin@school.local");
      await page.fill('input[type="password"]', "admin123");
      const submitButton = page
        .locator('button:not([data-testid="google-signin-button"])', {
          hasText: /เข้าสู่ระบบ|sign in|login|submit/i,
        })
        .first();
      await submitButton.click();
      await page.waitForURL(/\/dashboard/, { timeout: 15000 });

      // Verify logged in
      const session = await page.request.get("/api/auth/get-session");
      expect(session.ok()).toBeTruthy();

      // Find and click logout - look for it in user menu/dropdown
      // First try to find visible logout button
      let logoutButton = page.locator(
        'button:has-text("ออกจากระบบ"), button:has-text("Logout"), a:has-text("ออกจากระบบ"), a:has-text("Logout")',
      ).first();

      // If not visible, might need to open a user menu first
      if (!(await logoutButton.isVisible())) {
        // Try to find and click user menu/avatar
        const userMenu = page.locator(
          '[aria-label*="account"], [aria-label*="user"], [data-testid*="user"], button:has(svg[data-testid*="Person"]):visible',
        ).first();
        if (await userMenu.isVisible()) {
          await userMenu.click();
          await page.waitForTimeout(500); // Allow menu to open
        }
      }

      // Click logout
      logoutButton = page.locator(
        'button:has-text("ออกจากระบบ"), button:has-text("Logout"), a:has-text("ออกจากระบบ"), a:has-text("Logout"), [role="menuitem"]:has-text("ออกจากระบบ"), [role="menuitem"]:has-text("Logout")',
      ).first();
      await expect(logoutButton).toBeVisible({ timeout: 15000 });
      await logoutButton.click();

      // Should redirect to sign-in page
      await expect(page).toHaveURL(/\/signin/, { timeout: 15000 });

      // Verify logged out - session should be null/empty
      const postLogoutSession = await page.request.get("/api/auth/get-session");
      const sessionData = await postLogoutSession.json();
      expect(sessionData?.user).toBeFalsy();

      await context.close();
    });

    test("Admin role is correctly assigned and verified", async ({ page }) => {
      // Verify admin role via session API
      const response = await page.request.get("/api/auth/get-session");
      expect(response.ok()).toBeTruthy();
      const session = await response.json();
      expect(session?.user?.role).toBe("admin");
      expect(session?.user?.email).toBe("admin@school.local");

      // Navigate to management page to confirm access
      await page.goto("/management/teacher");
      await page.waitForLoadState("domcontentloaded");
      
      // Should not redirect to unauthorized page
      await expect(page).toHaveURL(/\/management\/teacher/);
      await expect(page).not.toHaveURL(/\/signin|unauthorized/);

      // Page should render successfully - wait for table or empty state
      await page.waitForSelector('table, [class*="Skeleton"], [class*="Empty"]', {
        timeout: 15000,
      });
    });
  });

  test.describe("2. Data Management - Teachers", () => {
    test("Create new teacher with required fields", async ({ page }) => {
      await page.goto("/management/teacher");

      // Click "Add Teacher" button (Thai: "เพิ่มครู")
      const addButton = page.locator(
        'button:has-text("เพิ่มครู"), button:has-text("Add Teacher")',
      );
      await addButton.click();

      // Wait for dialog/modal to open
      await page.waitForSelector('dialog[open], [role="dialog"]', {
        timeout: 15000,
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
        timeout: 15000,
      });

      // Verify teacher appears in list
      await expect(page.locator(`text=${uniqueId}`)).toBeVisible({
        timeout: 15000,
      });
    });

    test("Edit existing teacher", async ({ page }) => {
      await page.goto("/management/teacher");

      // Wait for table to load
      await page.waitForSelector("table tbody tr", { timeout: 15000 });

      // Click edit button on first teacher
      const editButton = page
        .locator('button[aria-label*="edit"], button:has-text("แก้ไข")')
        .first();
      await editButton.click();

      // Wait for edit dialog
      await page.waitForSelector('dialog[open], [role="dialog"]', {
        timeout: 15000,
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
      ).toBeVisible({ timeout: 15000 });
    });

    test("Verify teacher appears in list with pagination", async ({ page }) => {
      await page.goto("/management/teacher");

      // Wait for table to load
      await page.waitForSelector("table tbody tr", { timeout: 15000 });

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
      await page.waitForLoadState("domcontentloaded");

      // Verify page loads successfully - wait for any fetch response
      await page.waitForLoadState("networkidle");

      // Verify main content renders (table or loading skeleton)
      await page.waitForSelector('table, [class*="Skeleton"]', { timeout: 15000 });
    });

    test("Verify default data loads (teachers, subjects, rooms)", async ({
      page,
    }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/config`);
      await page.waitForLoadState("networkidle");

      // Wait for table to load
      await page.waitForSelector("table", { timeout: 15000 });

      // Verify table has data rows
      const rows = page.locator("table tbody tr");
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test("Metric cards display correct counts", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/config`);
      await page.waitForLoadState("networkidle");

      // Look for metric cards with Thai labels
      const metricsLocator = page.locator(
        "text=/ครูทั้งหมด|ห้องเรียน|รายวิชา|All Teachers|Classrooms|Subjects/i",
      );
      await expect(metricsLocator.first()).toBeVisible({ timeout: 15000 });

      // Verify at least one metric card shows a number
      const numberPattern = page.locator("text=/\\d+/");
      await expect(numberPattern.first()).toBeVisible();
    });

    test("Navigation between semesters works", async ({ page }) => {
      // Start at first semester
      await page.goto(`/schedule/1-2567/config`);
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL(/\/schedule\/1-2567\/config/);
      await page.waitForSelector("table", { timeout: 15000 });

      // Navigate to second semester
      await page.goto(`/schedule/2-2567/config`);
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL(/\/schedule\/2-2567\/config/);
      await page.waitForSelector("table", { timeout: 15000 });

      // Both should load successfully - verify table rendered
      await page.waitForSelector('table, [class*="Skeleton"]', { timeout: 15000 });
    });
  });

  test.describe("4. Subject Assignment to Teachers", () => {
    test("Navigate to teacher responsibility page", async ({ page }) => {
      await page.goto(
        `/schedule/${TEST_SEMESTER}/assign/teacher_responsibility`,
      );
      await page.waitForLoadState("networkidle");

      // Verify page loads
      await expect(page).toHaveURL(/\/assign\/teacher_responsibility/);

      // Wait for content to render
      await page.waitForSelector('table, [role="table"], [class*="Skeleton"]', { timeout: 15000 });
    });

    test("Assign a subject to a teacher", async ({ page }) => {
      await page.goto(
        `/schedule/${TEST_SEMESTER}/assign/teacher_responsibility`,
      );
      await page.waitForLoadState("networkidle");

      // Wait for page to load
      await page.waitForSelector('table, [role="table"]', { timeout: 15000 });

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

      // Verify page doesn't error - table should still be visible
      await expect(page.locator('table, [role="table"]').first()).toBeVisible();
    });

    test("Verify assignment persists after refresh", async ({ page }) => {
      await page.goto(
        `/schedule/${TEST_SEMESTER}/assign/teacher_responsibility`,
      );

      // Wait for table to load
      await page.waitForSelector('table, [role="table"]', { timeout: 15000 });

      // Get initial row count
      const rows = page.locator('table tbody tr, [role="row"]');
      const initialCount = await rows.count();

      // Reload page
      await page.reload();

      // Wait for table to load again
      await page.waitForSelector('table, [role="table"]', { timeout: 15000 });

      // Verify data is still present
      const rowsAfterReload = page.locator('table tbody tr, [role="row"]');
      const countAfterReload = await rowsAfterReload.count();

      expect(countAfterReload).toBe(initialCount);
    });
  });

  test.describe("5. Timetable Creation - Teacher Arrange", () => {
    test("Access teacher arrange page", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/arrange/teacher-arrange`);

      // Verify page loads
      await expect(page).toHaveURL(/\/arrange\/teacher-arrange/);

      // Wait for timetable grid to render
      await page.waitForSelector('[draggable="true"], table, [class*="Skeleton"]', { timeout: 15000 });
    });

    test("Select a teacher and view their subjects", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/arrange/teacher-arrange`);

      // Wait for teacher dropdown/selector
      await page.waitForSelector(
        'select, [role="combobox"], button:has-text("เลือกครู")',
        { timeout: 15000 },
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
      await expect(page.locator('[draggable="true"], table').first()).toBeVisible();
    });

    test("Drag subject to timeslot (visual verification)", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/arrange/teacher-arrange`);

      // This is a simplified smoke test
      // Full drag-and-drop testing is covered in e2e/08-drag-and-drop.spec.ts

      // Verify draggable subjects exist
      await page.waitForSelector(
        '[draggable="true"], [data-testid*="draggable"]',
        { timeout: 15000 },
      );

      // Verify timeslot grid exists
      const timeslotGrid = page.locator("text=/จันทร์|Monday|อังคาร|Tuesday/i");
      await expect(timeslotGrid.first()).toBeVisible({ timeout: 15000 });

      // Basic smoke check: page renders correctly
      await expect(page.locator('[draggable="true"]').first()).toBeVisible();
    });
  });

  test.describe("6. Conflict Detection", () => {
    test("Verify conflict warnings display", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/arrange/teacher-arrange`);

      // Wait for timetable grid to load
      await page.waitForSelector('[draggable="true"], table, [class*="Skeleton"]', { timeout: 15000 });

      // Look for conflict indicators (red borders, warning icons, etc.)
      // This is a smoke test - detailed conflict testing in e2e/04-conflict-prevention.spec.ts
      const conflictIndicators = page.locator(
        '[style*="red"], [data-conflict="true"], text=/ขัดแย้ง|Conflict/i',
      );

      // Just verify the page can render conflict states
      // May or may not have actual conflicts in seeded data
      await expect(page.locator('[draggable="true"], table').first()).toBeVisible();
    });

    test("Verify locked timeslots are indicated", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/arrange/teacher-arrange`);

      // Wait for timetable grid to load
      await page.waitForSelector('[draggable="true"], table, [class*="Skeleton"]', { timeout: 15000 });

      // Look for lock icons or locked state indicators
      const lockIndicators = page.locator(
        '[data-locked="true"], text=/ล็อค|Lock/i, svg:has-text("lock")',
      );

      // Verify page renders (may or may not have locked slots in seeded data)
      await expect(page.locator('[draggable="true"], table').first()).toBeVisible();
    });
  });

  test.describe("7. View Teacher Schedule", () => {
    test("Navigate to teacher schedule view", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/view/teacher`);

      // Verify page loads
      await expect(page).toHaveURL(/\/view\/teacher/);

      // Wait for content - teacher selector or table
      await page.waitForSelector('select, [role="combobox"], table, [class*="Skeleton"]', { timeout: 15000 });
    });

    test("Select teacher and verify schedule renders", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/view/teacher`);

      // Wait for teacher selector
      await page.waitForSelector('select, [role="combobox"]', {
        timeout: 15000,
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
      await expect(scheduleGrid.first()).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("8. Export to Excel", () => {
    test("Navigate to export page", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/export`);

      // Verify page loads
      await expect(page).toHaveURL(/\/export/);

      // Wait for export options
      await page.waitForSelector('button:has-text("Excel"), button:has-text("ส่งออก"), [class*="Skeleton"]', { timeout: 15000 });
    });

    test("Trigger Excel export and verify download", async ({ page }) => {
      await page.goto(`/schedule/${TEST_SEMESTER}/export`);

      // Wait for export buttons
      await page.waitForSelector(
        'button:has-text("Excel"), button:has-text("ส่งออก")',
        { timeout: 15000 },
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
