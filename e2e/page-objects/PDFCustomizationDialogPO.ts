import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for PDF Customization Dialog
 * 
 * This dialog allows users to customize PDF exports with options:
 * - Paper size (A4, A3, Letter, Legal, Tabloid)
 * - Orientation (Portrait, Landscape)
 * - Tables per page (1-10)
 * - Margin (5-20mm)
 * - Quality (1x, 2x, 3x)
 * - Page numbers toggle
 * - Signatures toggle
 */
export class PDFCustomizationDialogPO extends BasePage {
  // Dialog container
  readonly dialog: Locator;
  readonly dialogTitle: Locator;

  // Paper size selection
  readonly paperSizeSelect: Locator;
  readonly paperSizeA4: Locator;
  readonly paperSizeA3: Locator;
  readonly paperSizeLetter: Locator;
  readonly paperSizeLegal: Locator;
  readonly paperSizeTabloid: Locator;

  // Orientation selection
  readonly orientationSelect: Locator;
  readonly orientationPortrait: Locator;
  readonly orientationLandscape: Locator;

  // Sliders
  readonly tablesPerPageSlider: Locator;
  readonly marginSlider: Locator;
  readonly qualitySlider: Locator;

  // Toggle switches
  readonly pageNumbersSwitch: Locator;
  readonly signaturesSwitch: Locator;

  // Action buttons
  readonly exportButton: Locator;
  readonly cancelButton: Locator;
  readonly resetButton: Locator;

  // Preview summary
  readonly previewText: Locator;

  constructor(page: Page, baseUrl: string = 'http://localhost:3000') {
    super(page, baseUrl);
    
    // Dialog
    this.dialog = page.locator('[role="dialog"]');
    this.dialogTitle = this.dialog.locator('h2:has-text("ปรับแต่งการส่งออก PDF")');

    // Paper size - using MUI Select with data-testid
    this.paperSizeSelect = page.locator('[data-testid="paper-size-select"]');
    this.paperSizeA4 = page.locator('[role="option"][data-value="A4"]');
    this.paperSizeA3 = page.locator('[role="option"][data-value="A3"]');
    this.paperSizeLetter = page.locator('[role="option"][data-value="Letter"]');
    this.paperSizeLegal = page.locator('[role="option"][data-value="Legal"]');
    this.paperSizeTabloid = page.locator('[role="option"][data-value="Tabloid"]');

    // Orientation - using MUI Select with data-testid
    this.orientationSelect = page.locator('[data-testid="orientation-select"]');
    this.orientationPortrait = page.locator('[role="option"][data-value="portrait"]');
    this.orientationLandscape = page.locator('[role="option"][data-value="landscape"]');

    // Sliders - using data-testid
    this.tablesPerPageSlider = page.locator('[data-testid="tables-per-page-slider"]');
    this.marginSlider = page.locator('[data-testid="margin-slider"]');
    this.qualitySlider = page.locator('[data-testid="quality-slider"]');

    // Switches - using data-testid
    this.pageNumbersSwitch = page.locator('[data-testid="page-numbers-switch"]');
    this.signaturesSwitch = page.locator('[data-testid="signatures-switch"]');

    // Buttons
    this.exportButton = this.dialog.locator('button:has-text("ส่งออก PDF")');
    this.cancelButton = this.dialog.locator('button:has-text("ยกเลิก")');
    this.resetButton = this.dialog.locator('button:has-text("รีเซ็ต")');

    // Preview
    this.previewText = this.dialog.locator('text=/กระดาษ .* แนว.*/');
  }

  /**
   * Assert dialog is visible
   */
  async assertDialogOpen() {
    await expect(this.dialog).toBeVisible({ timeout: 5000 });
    await expect(this.dialogTitle).toBeVisible();
  }

  /**
   * Assert dialog is closed
   */
  async assertDialogClosed() {
    await expect(this.dialog).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Select paper size
   */
  async selectPaperSize(size: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Tabloid') {
    await this.paperSizeSelect.click();
    
    switch (size) {
      case 'A4':
        await this.paperSizeA4.click();
        break;
      case 'A3':
        await this.paperSizeA3.click();
        break;
      case 'Letter':
        await this.paperSizeLetter.click();
        break;
      case 'Legal':
        await this.paperSizeLegal.click();
        break;
      case 'Tabloid':
        await this.paperSizeTabloid.click();
        break;
    }
  }

  /**
   * Select orientation
   */
  async selectOrientation(orientation: 'portrait' | 'landscape') {
    await this.orientationSelect.click();
    
    if (orientation === 'portrait') {
      await this.orientationPortrait.click();
    } else {
      await this.orientationLandscape.click();
    }
  }

  /**
   * Set tables per page using slider
   * Note: Playwright's fill() works with range inputs
   */
  async setTablesPerPage(value: number) {
    if (value < 1 || value > 10) {
      throw new Error('Tables per page must be between 1 and 10');
    }
    await this.tablesPerPageSlider.fill(value.toString());
  }

  /**
   * Set margin using slider
   */
  async setMargin(value: number) {
    if (value < 5 || value > 20) {
      throw new Error('Margin must be between 5 and 20');
    }
    await this.marginSlider.fill(value.toString());
  }

  /**
   * Set quality using slider
   */
  async setQuality(value: 1 | 2 | 3) {
    await this.qualitySlider.fill(value.toString());
  }

  /**
   * Toggle page numbers switch
   */
  async togglePageNumbers(enabled: boolean) {
    const isChecked = await this.pageNumbersSwitch.isChecked();
    if (isChecked !== enabled) {
      await this.pageNumbersSwitch.click();
    }
  }

  /**
   * Toggle signatures switch
   */
  async toggleSignatures(enabled: boolean) {
    const isChecked = await this.signaturesSwitch.isChecked();
    if (isChecked !== enabled) {
      await this.signaturesSwitch.click();
    }
  }

  /**
   * Click export button
   */
  async clickExport() {
    await this.exportButton.click();
  }

  /**
   * Click cancel button
   */
  async clickCancel() {
    await this.cancelButton.click();
  }

  /**
   * Click reset button
   */
  async clickReset() {
    await this.resetButton.click();
  }

  /**
   * Assert preview text contains expected paper size and orientation
   */
  async assertPreviewContains(paperSize: string, orientation: string) {
    const previewTextContent = await this.previewText.textContent();
    expect(previewTextContent).toContain(paperSize);
    expect(previewTextContent).toContain(orientation);
  }

  /**
   * Assert default values are set
   */
  async assertDefaultValues() {
    // Check paper size select shows A4
    const paperSizeValue = await this.paperSizeSelect.inputValue();
    expect(paperSizeValue).toBe('A4');

    // Check orientation select shows portrait
    const orientationValue = await this.orientationSelect.inputValue();
    expect(orientationValue).toBe('portrait');

    // Check sliders have default values
    const tablesValue = await this.tablesPerPageSlider.inputValue();
    expect(tablesValue).toBe('2');

    const marginValue = await this.marginSlider.inputValue();
    expect(marginValue).toBe('10');

    const qualityValue = await this.qualitySlider.inputValue();
    expect(qualityValue).toBe('2');

    // Check switches are enabled by default
    expect(await this.pageNumbersSwitch.isChecked()).toBe(true);
    expect(await this.signaturesSwitch.isChecked()).toBe(true);
  }

  /**
   * Configure all PDF options at once
   */
  async configurePDF(options: {
    paperSize?: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Tabloid';
    orientation?: 'portrait' | 'landscape';
    tablesPerPage?: number;
    margin?: number;
    quality?: 1 | 2 | 3;
    showPageNumbers?: boolean;
    showSignatures?: boolean;
  }) {
    if (options.paperSize) {
      await this.selectPaperSize(options.paperSize);
    }

    if (options.orientation) {
      await this.selectOrientation(options.orientation);
    }

    if (options.tablesPerPage !== undefined) {
      await this.setTablesPerPage(options.tablesPerPage);
    }

    if (options.margin !== undefined) {
      await this.setMargin(options.margin);
    }

    if (options.quality !== undefined) {
      await this.setQuality(options.quality);
    }

    if (options.showPageNumbers !== undefined) {
      await this.togglePageNumbers(options.showPageNumbers);
    }

    if (options.showSignatures !== undefined) {
      await this.toggleSignatures(options.showSignatures);
    }
  }
}
