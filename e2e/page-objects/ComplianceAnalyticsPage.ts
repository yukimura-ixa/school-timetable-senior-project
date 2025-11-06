/**
 * ComplianceAnalyticsPage - Page Object for Compliance Analytics (Issue #86)
 * 
 * Tests subject name display in compliance reports
 * URL: /dashboard/[semesterAndyear]/analytics
 * 
 * @module page-objects/ComplianceAnalyticsPage
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ComplianceAnalyticsPage extends BasePage {
  // Page elements
  readonly complianceSection: Locator;
  readonly missingSubjectsSection: Locator;
  readonly subjectNameCells: Locator;
  readonly subjectCodeCells: Locator;
  readonly complianceChart: Locator;

  constructor(page: Page) {
    super(page);

    // Locators
    this.complianceSection = page.locator('[data-testid="compliance-section"]').or(
      page.locator('section, div').filter({ hasText: 'การปฏิบัติตามหลักสูตร' })
    );
    this.missingSubjectsSection = page.locator('[data-testid="missing-subjects"]').or(
      page.locator('section, div').filter({ hasText: 'วิชาบังคับที่ยังไม่ได้จัด' })
    );
    this.subjectNameCells = page.locator('td, div').filter({ hasText: /^[ก-๙]+/ }); // Thai characters
    this.subjectCodeCells = page.locator('td, div').filter({ hasText: /^[A-Z]{2}\d{3}/ }); // Subject codes
    this.complianceChart = page.locator('[role="img"], canvas, svg').first();
  }

  /**
   * Navigate to compliance analytics for specific semester/year
   */
  async navigateTo(semester: string, year: string) {
    await this.goto(`/dashboard/${semester}-${year}/analytics`);
    await this.waitForPageLoad();
  }

  /**
   * Get all displayed subject names
   */
  async getSubjectNames(): Promise<string[]> {
    const cells = await this.subjectNameCells.all();
    const names: string[] = [];
    
    for (const cell of cells) {
      const text = await cell.textContent();
      if (text && text.trim() && text.match(/[ก-๙]/)) {
        names.push(text.trim());
      }
    }
    
    return names;
  }

  /**
   * Assert subject names are in Thai (not codes)
   */
  async assertSubjectNamesInThai() {
    const subjectNames = await this.getSubjectNames();
    
    // Should have at least some subject names
    expect(subjectNames.length).toBeGreaterThan(0);
    
    // Each name should contain Thai characters, not just codes
    for (const name of subjectNames) {
      expect(name).toMatch(/[ก-๙]/); // Contains Thai characters
      // Should NOT be just a subject code (e.g., TH101)
      expect(name).not.toMatch(/^[A-Z]{2}\d{3}$/);
    }
  }

  /**
   * Assert compliance section is visible
   */
  async assertComplianceSectionVisible() {
    await expect(this.complianceSection).toBeVisible();
  }

  /**
   * Assert missing subjects section exists
   */
  async assertMissingSubjectsSectionVisible() {
    await expect(this.missingSubjectsSection).toBeVisible();
  }

  /**
   * Check if specific subject name is displayed
   */
  async isSubjectNameDisplayed(subjectName: string): Promise<boolean> {
    const locator = this.page.locator(`td, div`, { hasText: subjectName });
    return await locator.isVisible({ timeout: 2000 }).catch(() => false);
  }
}
