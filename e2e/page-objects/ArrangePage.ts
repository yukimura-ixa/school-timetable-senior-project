/**
 * ArrangePage - Page Object for Schedule Arrangement (Issues #83-85, #89)
 * 
 * Tests drag-drop room selection flow and schedule deletion
 * URL: /schedule/[semesterAndyear]/arrange
 * 
 * Features tested:
 * - Issue #83: Room selection dialog logic
 * - Issue #84: Subject placement validation
 * - Issue #85: Lock data integration
 * - Issue #89: Schedule deletion with cache revalidation
 * 
 * @module page-objects/ArrangePage
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ArrangePage extends BasePage {
  // Page elements
  readonly teacherDropdown: Locator;
  readonly teacherOption: (teacherName: string) => Locator;
  readonly subjectPalette: Locator;
  readonly subjectCard: (subjectCode: string) => Locator;
  readonly timetableGrid: Locator;
  readonly timeslotCell: (row: number, col: number) => Locator;
  readonly roomSelectionDialog: Locator;
  readonly roomOption: (roomName: string) => Locator;
  readonly confirmRoomButton: Locator;
  readonly cancelRoomButton: Locator;
  readonly deleteButton: Locator;
  readonly confirmDeleteButton: Locator;
  readonly lockedIndicator: Locator;

  constructor(page: Page) {
    super(page);

    // Locators
    this.teacherDropdown = page.locator('[role="button"]', { hasText: 'เลือกครู' });
    this.teacherOption = (teacherName: string) => 
      page.locator('[role="option"]', { hasText: teacherName });
    
    this.subjectPalette = page.locator('[data-testid="subject-palette"]').or(
      page.locator('div').filter({ hasText: 'รายวิชาที่สามารถจัด' })
    );
    this.subjectCard = (subjectCode: string) => 
      page.locator('[data-testid^="subject-card"]', { hasText: subjectCode });
    
    this.timetableGrid = page.locator('[data-testid="timetable-grid"]').or(
      page.locator('table').filter({ has: page.locator('th:has-text("จันทร์")') })
    );
    this.timeslotCell = (row: number, col: number) => 
      this.timetableGrid.locator(`tbody tr:nth-child(${row}) td:nth-child(${col})`);
    
    this.roomSelectionDialog = page.locator('[role="dialog"]', { hasText: 'เลือกห้องเรียน' });
    this.roomOption = (roomName: string) => 
      this.roomSelectionDialog.locator('[role="option"], li', { hasText: roomName });
    this.confirmRoomButton = this.roomSelectionDialog.locator('button', { hasText: 'ยืนยัน' });
    this.cancelRoomButton = this.roomSelectionDialog.locator('button', { hasText: 'ยกเลิก' });
    
    this.deleteButton = page.locator('button[aria-label="ลบตาราง"]').or(
      page.locator('button', { hasText: 'ลบตาราง' })
    );
    this.confirmDeleteButton = page.locator('button', { hasText: 'ยืนยันการลบ' });
    
    this.lockedIndicator = page.locator('[data-locked="true"]').or(
      page.locator('[aria-label*="ล็อก"]')
    );
  }

  /**
   * Navigate to arrange page for specific semester/year
   */
  async navigateTo(semester: string, year: string) {
    await this.goto(`/schedule/${semester}-${year}/arrange`);
    await this.waitForPageLoad();
  }

  /**
   * Select a teacher from dropdown
   */
  async selectTeacher(teacherName: string) {
    await this.teacherDropdown.click();
    await this.teacherOption(teacherName).click();
    await this.waitForPageLoad();
  }

  /**
   * Drag subject card to timeslot cell (Issue #83)
   */
  async dragSubjectToTimeslot(subjectCode: string, row: number, col: number) {
    const subject = this.subjectCard(subjectCode);
    const target = this.timeslotCell(row, col);
    
    // Get bounding boxes for precise drag
    const subjectBox = await subject.boundingBox();
    const targetBox = await target.boundingBox();
    
    if (!subjectBox || !targetBox) {
      throw new Error(`Cannot drag: subject or target not visible`);
    }
    
    // Perform drag and drop
    await subject.hover();
    await this.page.mouse.down();
    await this.page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height / 2,
      { steps: 10 }
    );
    await this.page.mouse.up();
    
    // Wait for any animation/transition
    await this.page.waitForTimeout(500);
  }

  /**
   * Select room from dialog (Issue #83)
   */
  async selectRoom(roomName: string) {
    await expect(this.roomSelectionDialog).toBeVisible({ timeout: 5000 });
    await this.roomOption(roomName).click();
    await this.confirmRoomButton.click();
    await expect(this.roomSelectionDialog).toBeHidden({ timeout: 3000 });
  }

  /**
   * Cancel room selection
   */
  async cancelRoomSelection() {
    await expect(this.roomSelectionDialog).toBeVisible({ timeout: 5000 });
    await this.cancelRoomButton.click();
    await expect(this.roomSelectionDialog).toBeHidden({ timeout: 3000 });
  }

  /**
   * Assert room dialog appears after drag (Issue #83)
   */
  async assertRoomDialogVisible() {
    await expect(this.roomSelectionDialog).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert room dialog does NOT appear (for invalid placements)
   */
  async assertRoomDialogNotVisible() {
    await expect(this.roomSelectionDialog).not.toBeVisible({ timeout: 2000 });
  }

  /**
   * Assert subject is placed in timeslot
   */
  async assertSubjectPlaced(row: number, col: number, subjectCode: string) {
    const cell = this.timeslotCell(row, col);
    await expect(cell).toContainText(subjectCode);
  }

  /**
   * Assert timeslot is locked (Issue #85)
   */
  async assertTimeslotLocked(row: number, col: number) {
    const cell = this.timeslotCell(row, col);
    const lockedChild = cell.locator('[data-locked="true"]');
    await expect(lockedChild).toBeVisible();
  }

  /**
   * Assert timeslot is NOT locked
   */
  async assertTimeslotNotLocked(row: number, col: number) {
    const cell = this.timeslotCell(row, col);
    const lockedChild = cell.locator('[data-locked="true"]');
    await expect(lockedChild).not.toBeVisible();
  }

  /**
   * Delete schedule (Issue #89)
   */
  async deleteSchedule() {
    await this.deleteButton.click();
    await expect(this.confirmDeleteButton).toBeVisible({ timeout: 3000 });
    await this.confirmDeleteButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Assert schedule is empty after deletion
   */
  async assertScheduleEmpty() {
    // Check that all timeslot cells are empty (no subject cards)
    const cells = this.timetableGrid.locator('tbody td[data-has-subject="true"]');
    await expect(cells).toHaveCount(0);
  }

  /**
   * Count subjects in palette
   */
  async getSubjectPaletteCount(): Promise<number> {
    const cards = this.subjectPalette.locator('[data-testid^="subject-card"]');
    return await cards.count();
  }

  /**
   * Check if subject exists in palette
   */
  async isSubjectInPalette(subjectCode: string): Promise<boolean> {
    const card = this.subjectCard(subjectCode);
    return await card.isVisible({ timeout: 2000 }).catch(() => false);
  }
}
