/**
 * Admin Fixture for E2E Tests
 *
 * This fixture extends Playwright's test with:
 * - Authenticated admin session
 * - Page Object Models (POMs) for admin features
 * - Reusable test data
 *
 * Usage:
 *   import { test } from './fixtures/admin.fixture';
 *
 *   test('should manage teachers', async ({ authenticatedAdmin, teacherPage }) => {
 *     await teacherPage.goto();
 *     // ... test logic
 *   });
 */

import { test as base, expect, type Page } from "@playwright/test";
import { testAdmin, testSemester } from "./seed-data.fixture";
import { ArrangePage } from "../page-objects/ArrangePage";

/**
 * Fixture types
 */
type AdminFixtures = {
  /**
   * Authenticated admin page with session cookie
   * Automatically signs in before each test
   */
  authenticatedAdmin: {
    page: Page;
    email: string;
    name: string;
  };

  /**
   * Unauthenticated page (no storageState)
   * Use for public pages / auth edge cases.
   */
  guestPage: Page;

  /**
   * Arrange Page Object Model (for teacher/class arrangement)
   * For schedule arrangement tests
   */
  arrangePage: ArrangePage;

  // Pattern for adding new POMs:
  // 1. Create POM class in e2e/page-objects/ extending BasePage
  // 2. Add type to AdminFixtures interface
  // 3. Add fixture factory below using authenticatedAdmin.page
};

/**
 * Extend Playwright test with admin fixtures
 */
export const test = base.extend<AdminFixtures>({
  /**
   * Authenticated Admin Fixture
   *
   * Provides authenticated admin page using storageState from auth.setup.ts.
   * The setup project handles Dev Bypass authentication and saves the state.
   * All tests in the chromium project automatically start authenticated.
   *
   * No manual authentication needed here - storageState handles it all!
   */
  authenticatedAdmin: async ({ page }, use) => {
    // Page is already authenticated via storageState from auth.setup.ts
    // Just verify we're not on the signin page
    // Increased timeout for dev server slow compilation
    await page.goto("/dashboard/1-2567", { timeout: 60000 });
    await page.waitForLoadState("domcontentloaded", { timeout: 30000 });

    // Use the authenticated page
    await use({
      page,
      email: testAdmin.email,
      name: testAdmin.name,
    });
  },

  guestPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  /**
   * Arrange Page Object Model Fixture
   *
   * Provides a pre-configured POM for schedule arrangement tests.
   * Automatically initializes with the authenticated admin page.
   */
  arrangePage: async ({ authenticatedAdmin }, use) => {
    const pageObj = new ArrangePage(authenticatedAdmin.page);
    await use(pageObj);
  },

  /**
   * Pattern for adding new POM fixtures (Issue #110):
   *
   * Example - Teacher Management Page:
   * ```typescript
   * teacherManagementPage: async ({ authenticatedAdmin }, use) => {
   *   const page = new TeacherManagementPage(authenticatedAdmin.page);
   *   await use(page);
   * },
   * ```
   *
   * All POMs automatically inherit authenticated session from authenticatedAdmin fixture.
   * No manual auth needed - handled by auth.setup.ts + storageState.
   */
});

/**
 * Re-export expect for convenience
 */
export { expect };

/**
 * ============================================================================
 * AUTHENTICATION ARCHITECTURE (Issue #110 - CONSOLIDATED)
 * ============================================================================
 *
 * ## How Authentication Works in E2E Tests
 *
 * ### 1. Setup Phase (Automatic)
 * File: `e2e/auth.setup.ts`
 * - Runs ONCE before all tests (configured in playwright.config.ts)
 * - Navigates to /signin and logs in with credentials (admin@school.local / admin123)
 * - Pre-selects semester 1-2567 via URL navigation (/dashboard/1-2567)
 * - Saves authenticated state + localStorage to `playwright/.auth/admin.json`
 * - Total runtime: ~3-5 seconds
 *
 * ### 2. Test Execution (Automatic)
 * All tests in the 'chromium' project automatically:
 * - Load saved auth state from playwright/.auth/admin.json
 * - Start with valid admin session (email: admin@school.local, role: admin)
 * - Have semester 1-2567 pre-selected in localStorage
 * - NO MANUAL AUTH NEEDED in individual tests
 *
 * ### 3. When to Use Manual Auth
 * ONLY use manual auth flows (page.goto('/signin')) in these cases:
 * - Testing the signin page itself (e.g., admin-auth-flow.spec.ts)
 * - Testing signout functionality
 * - Testing auth error states (invalid credentials, session expiry)
 * - Testing role-based access control (need different user roles)
 *
 * For ALL other tests, authentication is handled automatically via storageState.
 *
 * ### 4. Environment Configuration
 * Required in database seed (prisma/seed.ts):
 * ```
 * Admin user: admin@school.local
 * Password: admin123
 * Role: admin
 * ```
 *
 * ### 5. Troubleshooting
 * If tests fail with auth errors:
 * 1. Check that auth.setup.ts ran successfully (see test output)
 * 2. Verify playwright/.auth/admin.json exists
 * 3. Ensure database is seeded with admin user
 * 4. Delete playwright/.auth/admin.json and re-run tests (will regenerate)
 *
 * ## References
 * - Playwright Auth Guide: https://playwright.dev/docs/auth
 * - Auth.js Testing: https://authjs.dev/guides/testing
 * - Issue #110: E2E fixture consolidation
 * - Phase B: E2E Test Reliability Foundation (Issue #112)
 * ============================================================================
 */

/**
 * Example usage in tests:
 *
 * ```typescript
 * import { test, expect } from './fixtures/admin.fixture';
 * import { testSemester, testTeacher } from './fixtures/seed-data.fixture';
 *
 * test.describe('Schedule Assignment', () => {
 *   test('should assign subject to timeslot', async ({ scheduleAssignmentPage }) => {
 *     // Navigate to schedule page
 *     await scheduleAssignmentPage.goto(testSemester.SemesterAndyear);
 *
 *     // Select teacher
 *     await scheduleAssignmentPage.selectTeacher(testTeacher.TeacherID.toString());
 *
 *     // Drag subject to timeslot
 *     await scheduleAssignmentPage.dragSubjectToTimeslot('TH21101', 'MON', 1);
 *
 *     // Verify assignment
 *     expect(await scheduleAssignmentPage.getTimeslotSubject('MON', 1)).toContain('คณิตศาสตร์');
 *   });
 * });
 * ```
 */
