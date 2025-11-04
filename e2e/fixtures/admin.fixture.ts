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
import { ScheduleAssignmentPage } from '../pages/admin/ScheduleAssignmentPage';

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
   * Schedule Assignment Page Object Model
   * For teacher schedule arrangement tests
   */
  scheduleAssignmentPage: ScheduleAssignmentPage;

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
   * Sets up admin session before each test using Auth.js session.
   * 
   * Auth.js Session Strategy:
   * 1. Uses Auth.js database sessions (not JWT)
   * 2. Session stored in database with 30-day expiry
   * 3. Session cookie name: next-auth.session-token (development)
   * 
   * NOTE: This is a simplified approach. For production E2E tests, consider:
   * - Using Auth.js test mode with mocked providers
   * - Setting up test-specific OAuth credentials
   * - Using Playwright's storageState to cache auth across tests
   */
  authenticatedAdmin: async ({ page }, use) => {
    // Option 1: Direct session cookie approach (current implementation)
    // This assumes the seed has created the admin user
    
    // Navigate to sign-in page
    await page.goto('/signin');
    
    // TODO: Implement actual authentication flow
    // For now, we'll check if already authenticated
    // In a real implementation, you would:
    // 1. POST to /api/auth/signin with credentials
    // 2. Handle Auth.js callback
    // 3. Store session cookie
    
    // Temporary: Check if we need to sign in
    const currentUrl = page.url();
    if (currentUrl.includes('/signin')) {
      // For development: Manual sign-in required
      // For CI: Need to implement headless auth flow
      console.warn('⚠️  Authentication required. Please sign in manually for now.');
      console.warn('   Admin credentials: email=admin@school.local, password=admin123');
      console.warn('   TODO: Implement automated Auth.js authentication');
      
      // Wait for navigation away from sign-in (manual intervention)
      await page.waitForURL(url => !url.toString().includes('/signin'), { timeout: 60000 });
    }
    
    // Verify authentication
    const isAuthenticated = !page.url().includes('/signin');
    if (!isAuthenticated) {
      throw new Error('Failed to authenticate admin user');
    }
    
    // Use the authenticated page
    await use({
      page,
      email: testAdmin.email,
      name: testAdmin.name,
    });
    
    // Cleanup: Sign out after test (optional)
    // await page.goto('/api/auth/signout');
  },

  /**
   * Schedule Assignment Page Object Model Fixture
   * 
   * Provides a pre-configured POM for schedule assignment tests.
   * Automatically initializes with the authenticated admin page.
   */
  scheduleAssignmentPage: async ({ authenticatedAdmin }, use) => {
    const schedulePage = new ScheduleAssignmentPage(authenticatedAdmin.page);
    await use(schedulePage);
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
