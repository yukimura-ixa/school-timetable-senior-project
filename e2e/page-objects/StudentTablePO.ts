import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for Student Table page
 * 
 * This page displays student/class schedules with export functionality:
 * - View all class schedules
 * - Select specific classes via checkboxes
 * - Export selected classes to Excel or PDF
 * - Open PDF customization dialog
 */
export class StudentTablePO extends BasePage {
  // Page elements
  readonly pageTitle: Locator;
  readonly classCheckboxes: Locator;
  readonly selectAllCheckbox: Locator;
  
  // Export menu
  readonly exportButton: Locator;
  readonly exportMenu: Locator;
  readonly exportExcelOption: Locator;
  readonly exportPdfOption: Locator;
  readonly exportCustomPdfOption: Locator;

  // Table elements
  readonly classTable: Locator;
  readonly classRows: Locator;

  constructor(page: Page, baseUrl: string = 'http://localhost:3000') {
    super(page, baseUrl);
    
    // Page title
    this.pageTitle = page.locator('h1, h2, h4').filter({ hasText: /ตารางเรียน.*นักเรียน/ });

    // Class selection
    this.classCheckboxes = page.locator('input[type="checkbox"][name^="class-"]');
    this.selectAllCheckbox = page.locator('input[type="checkbox"][aria-label="Select all"]');

    // Export button and menu
    this.exportButton = page.locator('[data-testid="student-export-menu-button"]');
    this.exportMenu = page.locator('[data-testid="student-export-menu"]');
    this.exportExcelOption = page.locator('[data-testid="export-excel-option"]');
    this.exportPdfOption = page.locator('[data-testid="export-print-option"]');
    this.exportCustomPdfOption = page.locator('[data-testid="export-custom-pdf-option"]');

    // Table
    this.classTable = page.locator('table').first();
    this.classRows = this.classTable.locator('tbody tr');
  }

  /**
   * Navigate to student table for specific semester
   */
  async goto(semesterAndYear: string) {
    await super.goto(`/dashboard/${semesterAndYear}/student-table`);
    await this.waitForPageLoad();
  }

  /**
   * Assert page loaded successfully
   */
  async assertPageLoaded() {
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }

  /**
   * Select class by index (0-based)
   */
  async selectClass(index: number) {
    const checkbox = this.classCheckboxes.nth(index);
    await checkbox.check();
  }

  /**
   * Select multiple classes by indices
   */
  async selectClasses(indices: number[]) {
    for (const index of indices) {
      await this.selectClass(index);
    }
  }

  /**
   * Select all classes
   */
  async selectAllClasses() {
    if (await this.selectAllCheckbox.isVisible()) {
      await this.selectAllCheckbox.check();
    }
  }

  /**
   * Deselect all classes
   */
  async deselectAllClasses() {
    if (await this.selectAllCheckbox.isVisible()) {
      await this.selectAllCheckbox.uncheck();
    }
  }

  /**
   * Get number of classes displayed
   */
  async getClassCount(): Promise<number> {
    return await this.classRows.count();
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
   * Assert at least one class is selected
   */
  async assertClassesSelected() {
    const checkboxes = await this.classCheckboxes.all();
    const checkedCount = await Promise.all(
      checkboxes.map(cb => cb.isChecked())
    ).then(results => results.filter(Boolean).length);
    expect(checkedCount).toBeGreaterThan(0);
  }

  /**
   * Complete workflow: select classes and open custom PDF dialog
   */
  async selectClassesAndOpenCustomPdf(classIndices: number[]) {
    await this.assertPageLoaded();
    await this.selectClasses(classIndices);
    await this.assertClassesSelected();
    await this.clickCustomPdfExport();
  }
}
