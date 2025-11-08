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
  readonly conflictIndicator: Locator;
  readonly saveButton: Locator;
  readonly exportButton: Locator;
  readonly lockButton: (row: number, col: number) => Locator;

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
    
    this.conflictIndicator = page.locator('[data-testid="conflict-indicator"]').or(
      page.locator('[role="alert"]')
    );
    
    this.saveButton = page.locator('[data-testid="save-button"]').or(
      page.locator('button', { hasText: 'บันทึก' })
    );
    
    this.exportButton = page.locator('button', { hasText: 'ส่งออก' }).or(
      page.locator('button[aria-label*="ส่งออก"]')
    );
    
    this.lockButton = (row: number, col: number) => 
      this.timeslotCell(row, col).locator('button[aria-label*="ล็อก"]');
  }

  /**
   * Navigate to arrange page for specific semester/year
   */
  async navigateTo(semester: string, year: string) {
    await this.goto(`/schedule/${semester}-${year}/arrange`);
    await this.waitForPageLoad();
    
    // Wait for semester to sync with global state
    await this.waitForSemesterSync(`${semester}/${year}`);
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

  /**
   * Check if a conflict of specific type is present
   * @param type Type of conflict to check for
   */
  async hasConflict(type: 'teacher' | 'room' | 'locked' | 'break'): Promise<boolean> {
    const message = await this.getConflictMessage();
    if (!message) return false;

    const conflictKeywords = {
      teacher: ['ครูสอนซ้ำซ้อน', 'teacher conflict', 'ครูซ้อน'],
      room: ['ห้องเรียนซ้ำซ้อน', 'room conflict', 'ห้องซ้อน'],
      locked: ['ช่วงเวลาถูกล็อก', 'locked timeslot', 'ล็อก'],
      break: ['พักเที่ยง', 'break time', 'พัก'],
    };

    return conflictKeywords[type].some(keyword =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Get conflict message if visible
   * @returns Conflict message or null if not visible
   */
  async getConflictMessage(): Promise<string | null> {
    try {
      if (await this.conflictIndicator.isVisible({ timeout: 3000 })) {
        return await this.conflictIndicator.textContent();
      }
    } catch {
      return null;
    }
    return null;
  }

  /**
   * Lock a timeslot for school-wide activities
   */
  async lockTimeslot(row: number, col: number) {
    const cell = this.timeslotCell(row, col);
    
    // Right-click to open context menu
    await cell.click({ button: 'right' });
    await this.page.waitForTimeout(300);
    
    // Click lock option
    const lockOption = this.page.locator('text=Lock').or(
      this.page.locator('text=ล็อก')
    );
    await lockOption.first().click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Unlock a previously locked timeslot
   */
  async unlockTimeslot(row: number, col: number) {
    const cell = this.timeslotCell(row, col);
    
    // Right-click to open context menu
    await cell.click({ button: 'right' });
    await this.page.waitForTimeout(300);
    
    // Click unlock option
    const unlockOption = this.page.locator('text=Unlock').or(
      this.page.locator('text=ปลดล็อก')
    );
    await unlockOption.first().click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if a timeslot is locked
   */
  async isTimeslotLocked(row: number, col: number): Promise<boolean> {
    const cell = this.timeslotCell(row, col);
    const lockedChild = cell.locator('[data-locked="true"]');
    return await lockedChild.isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Export schedule to specified format
   */
  async exportSchedule(format: 'excel' | 'pdf') {
    await this.exportButton.click();
    await this.page.waitForTimeout(300);
    
    // Click the format option
    const formatOption = this.page.locator(`text=${format.toUpperCase()}`).or(
      this.page.locator(`button`, { hasText: format === 'excel' ? 'Excel' : 'PDF' })
    );
    await formatOption.first().click();
  }

  /**
   * Get all available subjects in the palette
   * @returns Array of subject codes
   */
  async getAvailableSubjects(): Promise<string[]> {
    const subjects = await this.subjectPalette.locator('[data-testid^="subject-card"]').or(
      this.subjectPalette.locator('[data-subject-code]')
    ).all();
    
    const codes: string[] = [];
    for (const subject of subjects) {
      const code = await subject.getAttribute('data-subject-code');
      if (code) {
        codes.push(code);
      } else {
        // Fallback: extract from text content
        const text = await subject.textContent();
        if (text) {
          // Subject code is typically at the start (e.g., "TH21101 - คณิตศาสตร์")
          const match = text.match(/^([A-Z]{2}\d{5})/);
          if (match) codes.push(match[1]);
        }
      }
    }
    
    return codes;
  }

  /**
   * Remove a subject from a timeslot
   */
  async removeSubjectFromTimeslot(row: number, col: number) {
    const cell = this.timeslotCell(row, col);
    
    // Click the remove/delete button within the timeslot
    const removeButton = cell.locator('button[aria-label*="ลบ"]').or(
      cell.locator('button[aria-label*="remove"]')
    );
    await removeButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Get count of assigned subjects in the timetable
   */
  async getAssignedSubjectCount(): Promise<number> {
    const assignedCells = this.timetableGrid.locator('tbody td').filter({
      has: this.page.locator('[data-testid^="subject-card"], .subject-chip')
    });
    return await assignedCells.count();
  }

  /**
   * Save schedule changes
   */
  async saveSchedule() {
    await this.saveButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to be ready with all data loaded
   */
  async waitForPageReady() {
    await this.waitForPageLoad();
    
    // Wait for key elements to be visible
    await expect(this.subjectPalette).toBeVisible({ timeout: 10000 });
    await expect(this.timetableGrid).toBeVisible({ timeout: 10000 });
  }
}
