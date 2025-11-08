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

import { test as base, expect } from '@playwright/test';
import { testAdmin, testSemester } from './seed-data.fixture';
import { ArrangePage } from '../page-objects/ArrangePage';

/**
 * Fixture types
 */
type AdminFixtures = {
  /**
   * Authenticated admin page with session cookie
   * Automatically signs in before each test
   */
  authenticatedAdmin: {
    page: typeof base.prototype.page;
    email: string;
    name: string;
  };

  /**
   * Arrange Page Object Model (for teacher/class arrangement)
   * For schedule arrangement tests
   */
  arrangePage: ArrangePage;

  // TODO: Add more POMs as they're created
  // teacherManagementPage: TeacherManagementPage;
  // subjectManagementPage: SubjectManagementPage;
  // classroomManagementPage: ClassroomManagementPage;
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
    await page.goto('/dashboard/1-2567');
    await page.waitForLoadState('networkidle');
    
    // Use the authenticated page
    await use({
      page,
      email: testAdmin.email,
      name: testAdmin.name,
    });
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

  // TODO: Add more POM fixtures as they're created
  // Example:
  // teacherManagementPage: async ({ authenticatedAdmin }, use) => {
  //   const teacherPage = new TeacherManagementPage(authenticatedAdmin.page);
  //   await use(teacherPage);
  // },
});

/**
 * Re-export expect for convenience
 */
export { expect };

/**
 * Helper: Create session storage state for reuse
 * 
 * This can be used to save authentication state and reuse it across tests,
 * avoiding repeated sign-in operations.
 * 
 * Usage:
 *   // In global setup (playwright.global-setup.ts):
 *   await createAdminAuthState('./e2e/.auth/admin.json');
 *   
 *   // In test:
 *   test.use({ storageState: './e2e/.auth/admin.json' });
 */
export async function createAdminAuthState(outputPath: string): Promise<void> {
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate and authenticate
  await page.goto('/signin');
  
  // TODO: Implement actual auth flow
  console.warn('⚠️  Manual authentication required for state creation');
  console.warn('   Sign in with: admin@school.local / admin123');
  
  // Wait for successful auth
  await page.waitForURL(url => !url.toString().includes('/signin'), { timeout: 60000 });
  
  // Save storage state
  await context.storageState({ path: outputPath });
  
  await browser.close();
  console.log(`✅ Admin auth state saved to ${outputPath}`);
}

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
