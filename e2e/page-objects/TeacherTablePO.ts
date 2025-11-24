import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for Teacher Table page
 *
 * This page displays teacher schedules with export functionality:
 * - View all teacher schedules
 * - Select specific teachers via checkboxes
 * - Export selected teachers to Excel or PDF
 * - Open PDF customization dialog
 */
export class TeacherTablePO extends BasePage {
  // Page elements
  readonly pageTitle: Locator;
  readonly teacherCheckboxes: Locator;
  readonly selectAllCheckbox: Locator;

  // Export menu
  readonly exportButton: Locator;
  readonly exportMenu: Locator;
  readonly exportExcelOption: Locator;
  readonly exportPdfOption: Locator;
  readonly exportCustomPdfOption: Locator;

  // Table elements
  readonly teacherTable: Locator;
  readonly teacherRows: Locator;

  constructor(page: Page, baseUrl: string = "http://localhost:3000") {
    super(page, baseUrl);

    // Page title
    this.pageTitle = page
      .locator("h1, h2, h4")
      .filter({ hasText: /ตารางสอน.*ครู/ });

    // Teacher selection
    this.teacherCheckboxes = page.locator(
      'input[type="checkbox"][name^="teacher-"]',
    );
    this.selectAllCheckbox = page.locator(
      'input[type="checkbox"][aria-label="Select all"]',
    );

    // Export button and menu
    this.exportButton = page.locator(
      '[data-testid="teacher-export-menu-button"]',
    );
    this.exportMenu = page.locator('[data-testid="teacher-export-menu"]');
    this.exportExcelOption = page.locator(
      '[data-testid="export-excel-option"]',
    );
    this.exportPdfOption = page.locator('[data-testid="export-print-option"]');
    this.exportCustomPdfOption = page.locator(
      '[data-testid="export-custom-pdf-option"]',
    );

    // Table
    this.teacherTable = page.locator("table").first();
    this.teacherRows = this.teacherTable.locator("tbody tr");
  }

  /**
   * Navigate to teacher table for specific semester
   */
  async goto(semesterAndYear: string) {
    await super.goto(`/dashboard/${semesterAndYear}/teacher-table`);
    await this.waitForPageLoad();

    // Wait for semester to sync with global store
    // Convert "1-2567" to "1/2567" for display format
    const [semester, year] = semesterAndYear.split("-");
    await this.waitForSemesterSync(`${semester}/${year}`);
  }

  /**
   * Assert page loaded successfully
   */
  async assertPageLoaded() {
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }

  /**
   * Select teacher by index (0-based)
   */
  async selectTeacher(index: number) {
    const checkbox = this.teacherCheckboxes.nth(index);
    await checkbox.check();
  }

  /**
   * Select multiple teachers by indices
   */
  async selectTeachers(indices: number[]) {
    for (const index of indices) {
      await this.selectTeacher(index);
    }
  }

  /**
   * Select all teachers
   */
  async selectAllTeachers() {
    if (await this.selectAllCheckbox.isVisible()) {
      await this.selectAllCheckbox.check();
    }
  }

  /**
   * Deselect all teachers
   */
  async deselectAllTeachers() {
    if (await this.selectAllCheckbox.isVisible()) {
      await this.selectAllCheckbox.uncheck();
    }
  }

  /**
   * Get number of teachers displayed
   */
  async getTeacherCount(): Promise<number> {
    return await this.teacherRows.count();
  }

  /**
   * Open export menu
   */
  async openExportMenu() {
    await this.exportButton.click();
    await expect(this.exportMenu).toBeVisible({ timeout: 5000 });
  }

  /**
   * Click Excel export option
   */
  async clickExcelExport() {
    await this.openExportMenu();
    await this.exportExcelOption.click();
  }

  /**
   * Click standard PDF export option
   */
  async clickPdfExport() {
    await this.openExportMenu();
    await this.exportPdfOption.click();
  }

  /**
   * Click custom PDF export option (opens customization dialog)
   */
  async clickCustomPdfExport() {
    await this.openExportMenu();
    await this.exportCustomPdfOption.click();
  }

  /**
   * Assert export menu is visible
   */
  async assertExportMenuVisible() {
    await expect(this.exportMenu).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert at least one teacher is selected
   */
  async assertTeachersSelected() {
    const checkboxes = await this.teacherCheckboxes.all();
    const checkedCount = await Promise.all(
      checkboxes.map((cb) => cb.isChecked()),
    ).then((results) => results.filter(Boolean).length);
    expect(checkedCount).toBeGreaterThan(0);
  }

  /**
   * Complete workflow: select teachers and open custom PDF dialog
   */
  async selectTeachersAndOpenCustomPdf(teacherIndices: number[]) {
    await this.assertPageLoaded();
    await this.selectTeachers(teacherIndices);
    await this.assertTeachersSelected();
    await this.clickCustomPdfExport();
  }
}
