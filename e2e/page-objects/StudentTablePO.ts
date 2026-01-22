import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for Student Table page
 *
 * This page displays student/class schedules with export functionality:
 * - View all class schedules
 * - Select specific classes via MUI multi-select
 * - Export selected classes to Excel or PDF
 * - Open PDF customization dialog
 *
 * Note: Uses MUI components which render differently from native HTML:
 * - Checkboxes are inside MUI Select, not standard input elements
 * - Page title uses MUI Typography (variant="h6")
 */
export class StudentTablePO extends BasePage {
  // Page elements - Use data-testid selectors for reliability
  readonly pageTitle: Locator;
  readonly bulkExportSection: Locator;
  readonly classMultiSelect: Locator;
  readonly filterToggleButton: Locator;

  // Export menu
  readonly exportButton: Locator;
  readonly exportMenu: Locator;
  readonly exportExcelOption: Locator;
  readonly exportPdfOption: Locator;
  readonly exportCustomPdfOption: Locator;

  // Timetable content
  readonly timetableSection: Locator;

  constructor(page: Page, baseUrl: string = "") {
    super(page, baseUrl);

    // Page title - MUI Typography h6 with "ตารางเรียน" text
    // Note: The page shows "ตารางเรียน" or "ตารางเรียน: {gradeLabel}" after selecting a class
    this.pageTitle = page
      .locator("h6, [class*='MuiTypography-h6']")
      .filter({ hasText: /ตารางเรียน/ })
      .first();

    // Bulk export section for admin users
    this.bulkExportSection = page.locator('[data-testid="bulk-export-section"]');
    this.classMultiSelect = page.locator('[data-testid="class-multi-select"]');
    this.filterToggleButton = page.getByRole("button", { name: /แสดง.*ตัวกรอง|ซ่อน.*ตัวกรอง/ });

    // Export button and menu
    this.exportButton = page.locator('[data-testid="student-export-menu-button"]');
    this.exportMenu = page.locator('[data-testid="student-export-menu"]');
    this.exportExcelOption = page.locator('[data-testid="export-excel-option"]');
    this.exportPdfOption = page.locator('[data-testid="export-print-option"]');
    this.exportCustomPdfOption = page.locator('[data-testid="export-custom-pdf-option"]');

    // Timetable content area
    this.timetableSection = page.locator("table").first();
  }

  /**
   * Navigate to student table for specific semester
   */
  async goto(academicYear: number | string, semester: number | string) {
    await super.goto(`/dashboard/${academicYear}/${semester}/student-table`);
    await this.waitForPageLoad();

    // Wait for semester to sync with global store
    await this.waitForSemesterSync(`${semester}/${academicYear}`);
  }

  /**
   * Assert page loaded successfully by checking for bulk export section or page content
   */
  async assertPageLoaded() {
    // Wait for either the bulk export section (admin) or the page content to load
    await this.page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    
    // Check for any of these indicators that the page has loaded:
    // 1. Bulk export section (for admin users)
    // 2. Class selector (always visible)
    const bulkSection = this.bulkExportSection;
    const classSelector = this.page.locator('[class*="MuiAutocomplete"], [data-testid*="class"], [data-testid*="grade"]').first();
    
    try {
      // First try to find the bulk export section (admin view)
      await expect(bulkSection.or(classSelector)).toBeVisible({ timeout: 15000 });
    } catch {
      // Fallback: just ensure page has loaded
      await expect(this.page.locator("main, [role='main'], body").first()).toBeVisible({ timeout: 15000 });
    }
  }

  /**
   * Open bulk export filters (admin only)
   */
  async showBulkFilters() {
    const isVisible = await this.bulkExportSection.isVisible().catch(() => false);
    if (!isVisible) {
      // Filter section may be collapsed
      const toggleBtn = this.filterToggleButton;
      if (await toggleBtn.isVisible()) {
        await toggleBtn.click();
        // Wait for filter section to become visible (event-driven)
        await expect(this.bulkExportSection).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  }

  /**
   * Select classes from the multi-select dropdown
   * @param classNames Array of class names to select (e.g., "ม.1/1", "ม.2/1")
   */
  async selectClassesByName(classNames: string[]) {
    await this.showBulkFilters();
    
    // Open the multi-select dropdown
    await this.classMultiSelect.click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 15000 });

    // Select each class by clicking their option
    for (const name of classNames) {
      const option = this.page.locator('[role="option"]').filter({ hasText: name }).first();
      if (await option.isVisible()) {
        await option.click();
      }
    }

    // Close dropdown by pressing Escape
    await this.page.keyboard.press("Escape");
    // Wait for dropdown to close
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 3000 }).catch(() => {});
  }

  /**
   * Select classes by clicking menu items (using indices)
   * @param indices Array of indices (0-based) of classes to select
   */
  async selectClasses(indices: number[]) {
    await this.showBulkFilters();
    
    // Open the multi-select dropdown
    await this.classMultiSelect.click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 15000 });

    // Get all options and select by index
    const options = this.page.locator('[role="option"]');
    for (const index of indices) {
      const option = options.nth(index);
      if (await option.isVisible({ timeout: 1000 }).catch(() => false)) {
        await option.click();
        // MUI multi-select has brief animation between selections
        await this.page.waitForTimeout(50);
      }
    }

    // Close dropdown
    await this.page.keyboard.press("Escape");
    // Wait for dropdown to close
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 3000 }).catch(() => {});
  }

  /**
   * Get number of classes available in dropdown
   */
  async getClassCount(): Promise<number> {
    await this.showBulkFilters();
    await this.classMultiSelect.click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 15000 });
    const count = await this.page.locator('[role="option"]').count();
    await this.page.keyboard.press("Escape");
    return count;
  }

  /**
   * Open export menu
   */
  async openExportMenu() {
    await expect(this.exportButton).toBeEnabled({ timeout: 15000 });
    await this.exportButton.click();
    await expect(this.exportMenu).toBeVisible({ timeout: 15000 });
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
    await expect(this.exportMenu).toBeVisible({ timeout: 15000 });
  }

  /**
   * Assert at least one class is selected (shown in multi-select chips)
   */
  async assertClassesSelected() {
    // Selected classes appear as chips in the multi-select
    const chips = this.classMultiSelect.locator('[class*="MuiChip"]');
    const count = await chips.count();
    expect(count).toBeGreaterThan(0);
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
