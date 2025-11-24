/**
 * ProgramViewPage - Page Object for Program View (Issue #87)
 *
 * Tests teacher data display in program view dashboard
 * URL: /dashboard/[semesterAndyear]/all-program
 *
 * @module page-objects/ProgramViewPage
 */

import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ProgramViewPage extends BasePage {
  // Page elements
  readonly gradeDropdown: Locator;
  readonly gradeDropdownOption: (gradeText: string) => Locator;
  readonly exportButton: Locator;
  readonly programTable: Locator;
  readonly tableHeaders: Locator;
  readonly subjectRows: Locator;
  readonly teacherColumn: Locator;

  constructor(page: Page) {
    super(page);

    // Locators
    // Grade dropdown: Look for clickable element containing the text, not by role
    this.gradeDropdown = page.getByText("เลือกชั้นเรียน").first();
    this.gradeDropdownOption = (gradeText: string) =>
      page.getByText(gradeText, { exact: true });
    this.exportButton = page.locator("button", { hasText: "นำออกเป็น Excel" });
    this.programTable = page.locator("table");
    this.tableHeaders = this.programTable.locator("th");
    this.subjectRows = this.programTable.locator("tbody tr");
    this.teacherColumn = this.programTable.locator("td:nth-child(5)"); // 5th column = teacher
  }

  /**
   * Navigate to program view for specific semester/year
   */
  async navigateTo(semester: string, year: string) {
    await this.goto(`/dashboard/${semester}-${year}/all-program`);
    await this.waitForPageLoad();

    // Wait for semester to sync with global state
    await this.waitForSemesterSync(`${semester}/${year}`);
  }

  /**
   * Select a grade level from dropdown
   */
  async selectGrade(gradeText: string) {
    await this.gradeDropdown.click();
    // Dropdown has CSS animation with scale-y-0 initially - wait for it to expand
    await this.page.waitForTimeout(800);
    // Find the paragraph containing the grade text (inside listitem)
    // Using locator with paragraph inside list to match the actual structure
    const gradeOption = this.page
      .locator(`li p:has-text("${gradeText}")`)
      .first();
    // Use dispatchEvent to click through CSS transform issues
    await gradeOption.evaluate((el) => el.click());
    await this.waitForPageLoad();
  }

  /**
   * Get all teacher names from the table
   */
  async getTeacherNames(): Promise<string[]> {
    const teacherCells = await this.teacherColumn.all();
    const names: string[] = [];

    for (const cell of teacherCells) {
      const text = await cell.textContent();
      if (text && text.trim()) {
        names.push(text.trim());
      }
    }

    return names;
  }

  /**
   * Assert teacher data is displayed (not empty)
   */
  async assertTeacherDataVisible() {
    const teacherNames = await this.getTeacherNames();
    expect(teacherNames.length).toBeGreaterThan(0);
    expect(teacherNames.some((name) => name.length > 0)).toBeTruthy();
  }

  /**
   * Assert teacher name format is correct (Thai format: คำนำหน้าชื่อ นามสกุล)
   */
  async assertTeacherNameFormat() {
    const teacherNames = await this.getTeacherNames();
    const nonEmptyNames = teacherNames.filter((name) => name.length > 0);

    // Should have at least one teacher name
    expect(nonEmptyNames.length).toBeGreaterThan(0);

    // Check format (should have Thai characters and space)
    for (const name of nonEmptyNames) {
      // Thai name should have prefix + first name + last name
      expect(name).toMatch(/[\u0E00-\u0E7F]+/); // Contains Thai characters
      expect(name.includes(" ")).toBeTruthy(); // Has space separator
    }
  }

  /**
   * Get subject count in the table
   */
  async getSubjectCount(): Promise<number> {
    return await this.subjectRows.count();
  }

  /**
   * Assert export button is enabled
   */
  async assertExportButtonEnabled() {
    await expect(this.exportButton).toBeEnabled();
  }
}
