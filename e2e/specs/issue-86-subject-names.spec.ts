/**
 * Issue #86 - Subject Name Display in Compliance Analytics
 *
 * Tests that subject names (Thai) are displayed instead of subject codes
 * in the compliance analytics dashboard.
 *
 * Test scenarios:
 * 1. Navigate to analytics page
 * 2. Verify subject names are in Thai (not codes like TH101)
 * 3. Verify compliance section is visible
 * 4. Verify missing subjects section exists
 * 5. Verify specific subject names are displayed
 *
 * @see Issue: https://github.com/yukimura-ixa/school-timetable-senior-project/issues/86
 */

import { test, expect } from "../fixtures/test";

test.describe("Issue #86 - Subject Names in Compliance Analytics", () => {
  test.beforeEach(async ({ complianceAnalyticsPage }) => {
    // Navigate to test semester (1-2567)
    await complianceAnalyticsPage.navigateTo("1", "2567");
  });

  test("should display subject names in Thai instead of codes", async ({
    complianceAnalyticsPage,
  }) => {
    // Wait for page to load
    await complianceAnalyticsPage.waitForPageLoad();

    // Assert subject names are in Thai
    await complianceAnalyticsPage.assertSubjectNamesInThai();

    // Get subject names
    const subjectNames = await complianceAnalyticsPage.getSubjectNames();

    // Verify we have subject names
    expect(subjectNames.length).toBeGreaterThan(0);

    // Each name should be Thai text, not codes
    for (const name of subjectNames) {
      expect(name).toMatch(/[ก-๙]/); // Contains Thai
      expect(name).not.toMatch(/^[A-Z]{2}\d{3}$/); // Not a code like TH101
    }
  });

  test("should show compliance section with subject data", async ({
    complianceAnalyticsPage,
  }) => {
    // Assert compliance section is visible
    await complianceAnalyticsPage.assertComplianceSectionVisible();

    // Verify subject names are displayed
    const subjectNames = await complianceAnalyticsPage.getSubjectNames();
    expect(subjectNames.length).toBeGreaterThan(0);
  });

  test("should show missing subjects section", async ({
    complianceAnalyticsPage,
  }) => {
    // Assert missing subjects section exists
    await complianceAnalyticsPage.assertMissingSubjectsSectionVisible();
  });

  test("should display specific subject names correctly", async ({
    complianceAnalyticsPage,
  }) => {
    // Wait for data to load
    await complianceAnalyticsPage.waitForPageLoad();

    // Get all subject names
    const subjectNames = await complianceAnalyticsPage.getSubjectNames();

    // Should have multiple subjects
    expect(subjectNames.length).toBeGreaterThan(5);

    // Each should be proper Thai name
    for (const name of subjectNames) {
      expect(name.length).toBeGreaterThan(3); // Not just abbreviation
      expect(name).toMatch(/[\u0E00-\u0E7F]/); // Thai characters
    }
  });

  test("should not show subject codes in place of names", async ({
    complianceAnalyticsPage,
  }) => {
    // Get all subject names
    const subjectNames = await complianceAnalyticsPage.getSubjectNames();

    // Filter for any that look like codes
    const codesAsNames = subjectNames.filter((name) =>
      name.match(/^[A-Z]{2}\d{3}$/),
    );

    // Should have ZERO subject codes displayed as names
    expect(codesAsNames.length).toBe(0);
  });
});
