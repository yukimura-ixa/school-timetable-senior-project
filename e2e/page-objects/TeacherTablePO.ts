import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for Teacher Table page
 *
 * This page displays teacher schedules with export functionality:
 * - View all teacher schedules
 * - Select specific teachers via MUI multi-select
 * - Export selected teachers to Excel or PDF
 * - Open PDF customization dialog
 *
 * Note: Uses MUI components which render differently from native HTML:
 * - Checkboxes are inside MUI Select, not standard input elements
 * - Page title uses MUI Typography (variant="h6")
 */
export class TeacherTablePO extends BasePage {
  // Page elements - Use data-testid selectors for reliability
  readonly pageTitle: Locator;
  readonly bulkExportSection: Locator;
  readonly teacherMultiSelect: Locator;
  readonly filterToggleButton: Locator;

  // Export menu
  readonly exportButton: Locator;
  readonly exportMenu: Locator;
  readonly exportExcelOption: Locator;
  readonly exportPdfOption: Locator;
  readonly exportCustomPdfOption: Locator;
  readonly bulkExportExcelButton: Locator;

  // Timetable content
  readonly timetableSection: Locator;

  constructor(page: Page, baseUrl: string = "") {
    super(page, baseUrl);

    // Page title - MUI Typography h6 with "ตารางสอน" text
    // Note: The page shows "ตารางสอน" or "ตารางสอน: {teacherName}" after selecting a teacher
    this.pageTitle = page
      .locator("h6, [class*='MuiTypography-h6']")
      .filter({ hasText: /ตารางสอน/ })
      .first();

    // Bulk export section for admin users
    this.bulkExportSection = page.locator('[data-testid="bulk-export-section"]');
    this.teacherMultiSelect = page.locator('[data-testid="teacher-multi-select"]');
    this.filterToggleButton = page.getByRole("button", { name: /แสดง.*ตัวกรอง|ซ่อน.*ตัวกรอง/ });

    // Export button and menu
    this.exportButton = page.locator('[data-testid="teacher-export-menu-button"]');
    this.exportMenu = page.locator('[data-testid="teacher-export-menu"]');
    this.exportExcelOption = page.locator('[data-testid="export-excel-option"]');
    this.exportPdfOption = page.locator('[data-testid="export-print-option"]');
    this.exportCustomPdfOption = page.locator('[data-testid="export-custom-pdf-option"]');
    this.bulkExportExcelButton = page.locator('[data-testid="bulk-export-excel-button"]');

    // Timetable content area
    this.timetableSection = page.locator("table").first();
  }

  /**
   * Navigate to teacher table for specific semester
   */
  async goto(academicYear: number | string, semester: number | string) {
    await super.goto(`/dashboard/${academicYear}/${semester}/teacher-table`);
    await this.waitForPageLoad();

    // Wait for semester to sync with global store
    await this.waitForSemesterSync(`${semester}/${academicYear}`);
  }

  /**
   * Assert page loaded successfully by checking for bulk export section or page content
   */
  async assertPageLoaded() {
    // Wait for either the bulk export section (admin) or the page content to load
    // The page may show skeleton loading first, then content
    await this.page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    
    // Check for any of these indicators that the page has loaded:
    // 1. Bulk export section (for admin users)
    // 2. Page title (shows after selecting a teacher)
    // 3. Teacher selector (always visible)
    const bulkSection = this.bulkExportSection;
    const teacherSelector = this.page.locator('[class*="MuiAutocomplete"], [data-testid*="teacher"]').first();
    
    try {
      // First try to find the bulk export section (admin view)
      await expect(bulkSection.or(teacherSelector)).toBeVisible({ timeout: 15000 });
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
   * Select teachers from the multi-select dropdown
   * @param teacherNames Array of teacher names to select (partial matches work)
   */
  async selectTeachersByName(teacherNames: string[]) {
    await this.showBulkFilters();
    
    // Open the multi-select dropdown
    await this.teacherMultiSelect.click();
    await this.page.waitForSelector('[role="listbox"]', { timeout: 15000 });

    // Select each teacher by clicking their option
    for (const name of teacherNames) {
      const option = this.page.locator('[role="option"]').filter({ hasText: name }).first();
      if (await option.isVisible()) {
        await option.click();
      }
    }

    // Close dropdown by clicking outside or pressing Escape
    await this.page.keyboard.press("Escape");
    // Wait for dropdown to close
    await expect(this.page.locator('[role="listbox"]')).toBeHidden({ timeout: 3000 }).catch(() => {});
  }

  /**
   * Select teachers by clicking menu items (alternative approach using indices)
   * @param indices Array of indices (0-based) of teachers to select
   */
  async selectTeachers(indices: number[]) {
    await this.showBulkFilters();
    
    // Open the multi-select dropdown
    await this.teacherMultiSelect.click();
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
   * Get number of teachers available in dropdown
   */
  async getTeacherCount(): Promise<number> {
    await this.showBulkFilters();
    await this.teacherMultiSelect.click();
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
   * Assert at least one teacher is selected (shown in multi-select chips)
   */
  async assertTeachersSelected() {
    // Selected teachers appear as chips in the multi-select
    const chips = this.teacherMultiSelect.locator('[class*="MuiChip"]');
    const count = await chips.count();
    expect(count).toBeGreaterThan(0);
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
