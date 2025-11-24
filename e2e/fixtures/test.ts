/**
 * Custom Fixtures for E2E Tests
 *
 * Extends Playwright's base test with custom fixtures:
 * - Page Object Models (POM)
 * - Authentication states
 * - Test data setup/teardown
 *
 * @module fixtures/test
 */

import { test as base } from "@playwright/test";
import { ProgramViewPage } from "../page-objects/ProgramViewPage";
import { ComplianceAnalyticsPage } from "../page-objects/ComplianceAnalyticsPage";
import { ArrangePage } from "../page-objects/ArrangePage";

/**
 * Custom fixtures type
 */
type CustomFixtures = {
  programViewPage: ProgramViewPage;
  complianceAnalyticsPage: ComplianceAnalyticsPage;
  arrangePage: ArrangePage;
};

/**
 * Extended test with custom fixtures
 *
 * Usage:
 * ```typescript
 * test('my test', async ({ programViewPage }) => {
 *   await programViewPage.navigateTo('1', '2567');
 *   await programViewPage.assertTeacherDataVisible();
 * });
 * ```
 */
export const test = base.extend<CustomFixtures>({
  /**
   * Program View Page fixture
   */
  programViewPage: async ({ page }, use) => {
    const programViewPage = new ProgramViewPage(page);
    await use(programViewPage);
    // Cleanup if needed
  },

  /**
   * Compliance Analytics Page fixture
   */
  complianceAnalyticsPage: async ({ page }, use) => {
    const complianceAnalyticsPage = new ComplianceAnalyticsPage(page);
    await use(complianceAnalyticsPage);
    // Cleanup if needed
  },

  /**
   * Arrange Page fixture
   */
  arrangePage: async ({ page }, use) => {
    const arrangePage = new ArrangePage(page);
    await use(arrangePage);
    // Cleanup if needed
  },
});

/**
 * Export expect from Playwright for convenience
 */
export { expect } from "@playwright/test";
