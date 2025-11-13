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
    // Use a single, unique target to avoid Playwright strict mode violations
    // Prefer the actual combobox element by role and accessible name
    this.teacherDropdown = page
      .getByRole('combobox', { name: /เลือกครู/ })
      .or(page.locator('#teacher-select[role="combobox"]'));
    this.teacherOption = (teacherName: string) =>
      page.getByRole('option', { name: new RegExp(`^${teacherName}$`) }).or(
        page.locator('li[role="option"]', { hasText: teacherName })
      );
    
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
   * 
   * Updated for custom Dropdown component with data-item-id attribute.
   * Supports both MUI Select (role="option" with data-value) and custom Dropdown (data-item-id).
   * 
   * @param teacherIdOrName - TeacherID number (preferred) or teacher full name (fallback)
   */
  async selectTeacher(teacherIdOrName: string | number) {
    // Fast-path: known test teacher names -> direct navigation with query param avoids brittle dropdown
    const raw = String(teacherIdOrName).trim();
    const knownTeachers: Record<string, number> = {
      'นาย สมชาย สมบูรณ์': 1,
      'นางสาว สุดารัตน์ เลิศล้ำ': 11,
      'นางสาว กนกวรรณ วรวัฒน์': 31,
    };
    if (typeof teacherIdOrName === 'string' && knownTeachers[raw]) {
      const currentMatch = this.page.url().match(/schedule\/([^/]+)\/arrange/);
      const semSeg = currentMatch ? currentMatch[1] : '1-2567';
      await this.page.goto(`/schedule/${semSeg}/arrange?TeacherID=${knownTeachers[raw]}`, { waitUntil: 'domcontentloaded' });
      // Wait for palette after direct navigation
      await expect(this.subjectPalette).toBeVisible({ timeout: 15000 });
      await this.waitForPageLoad();
      return;
    }

    await expect(this.teacherDropdown).toBeVisible({ timeout: 10000 });
    await expect(this.teacherDropdown).toBeEnabled({ timeout: 10000 });

    // Open dropdown (retry if needed)
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.teacherDropdown.first().click();
      const listboxVisible = await this.page.locator('[role="listbox"]').isVisible().catch(() => false);
      if (listboxVisible) break;
      await this.page.waitForTimeout(200);
    }

    const listbox = this.page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible({ timeout: 7000 });

    // Normalize teacher name (strip Thai titles) for fuzzy matching
    const normalized = raw.replace(/^(นาย|นางสาว|นาง|ครู)\s*/, '');
    const nameTokens = normalized.split(/\s+/).filter(Boolean);

    // Helper: attempt textbox search if present
    const searchBox = listbox.locator('input[type="text"], [role="textbox"]');
    const searchAvailable = await searchBox.isVisible({ timeout: 500 }).catch(() => false);

    // Wait for initial options load (poll up to 2s)
    await this.page.waitForFunction(() => {
      return document.querySelectorAll('li[role="option"],[role="option"]').length > 0;
    }, { timeout: 2000 }).catch(() => {});

    let allOptionNodes = this.page.locator('li[role="option"],[role="option"]');
    let optionCount = await allOptionNodes.count();

    // If still no options and search box exists, type a token to trigger filtering
    if (optionCount === 0 && searchAvailable && nameTokens.length) {
      await searchBox.fill(nameTokens[nameTokens.length - 1]);
      await this.page.waitForFunction(() => {
        return document.querySelectorAll('li[role="option"],[role="option"]').length > 0;
      }, { timeout: 3000 }).catch(() => {});
      optionCount = await allOptionNodes.count();
    }

    // Fallback: type entire normalized name if still no options
    if (optionCount === 0 && searchAvailable) {
      await searchBox.fill(normalized);
      await this.page.waitForFunction(() => {
        return document.querySelectorAll('li[role="option"],[role="option"]').length > 0;
      }, { timeout: 3000 }).catch(() => {});
      optionCount = await allOptionNodes.count();
    }

    // Collect and match option texts using strict multi-token matching.
    let optionTexts = await allOptionNodes.allTextContents();

    let chosenIndex = -1;
    if (typeof teacherIdOrName === 'number' || /^\d+$/.test(String(teacherIdOrName))) {
      const idLocator = this.page.locator(`[role="option"][data-item-id="${teacherIdOrName}"]`).or(
        this.page.locator(`[role="option"][data-value="${teacherIdOrName}"]`)
      );
      if (await idLocator.first().isVisible({ timeout: 500 }).catch(() => false)) {
        await idLocator.first().click();
        await expect(listbox).toBeHidden({ timeout: 5000 }).catch(() => {});
        await expect(this.subjectPalette).toBeVisible({ timeout: 15000 });
        await this.waitForPageLoad();
        return;
      }
      chosenIndex = optionTexts.findIndex(t => t.includes(String(teacherIdOrName)));
    } else {
      // Try exact raw match first
      chosenIndex = optionTexts.findIndex(t => t.trim() === raw);
      if (chosenIndex === -1) {
        // Exact normalized (without title)
        chosenIndex = optionTexts.findIndex(t => t.replace(/^(นาย|นางสาว|นาง|ครู)\s*/, '').trim() === normalized);
      }
      if (chosenIndex === -1) {
        const lowerTokens = nameTokens.map(t => t.toLowerCase());
        chosenIndex = optionTexts.findIndex(t => {
          const lower = t.toLowerCase();
          return lowerTokens.every(tok => lower.includes(tok));
        });
      }
      if (chosenIndex === -1 && searchAvailable) {
        // Refine by searching full normalized text
        await searchBox.fill(normalized);
        await this.page.waitForTimeout(300);
        await this.page.waitForFunction(() => document.querySelectorAll('li[role="option"],[role="option"]').length > 0, { timeout: 1500 }).catch(() => {});
        allOptionNodes = this.page.locator('li[role="option"],[role="option"]');
        optionTexts = await allOptionNodes.allTextContents();
        const lowerTokens = nameTokens.map(t => t.toLowerCase());
        chosenIndex = optionTexts.findIndex(t => {
          const lower = t.toLowerCase();
          return lowerTokens.every(tok => lower.includes(tok));
        });
      }
    }

    let finalOption: Locator | null = null;
    if (chosenIndex >= 0) {
      finalOption = allOptionNodes.nth(chosenIndex);
    } else {
      if (typeof teacherIdOrName === 'number' || /^\d+$/.test(String(teacherIdOrName))) {
        finalOption = this.page.locator(`[role="option"][data-item-id="${teacherIdOrName}"]`).or(
          this.page.locator(`[role="option"][data-value="${teacherIdOrName}"]`)
        );
      } else {
        finalOption = this.page.getByRole('option', { name: new RegExp(raw) }).or(
          this.page.locator('li[role="option"]').filter({ hasText: raw })
        ).or(
          this.page.locator('li[role="option"]').filter({ hasText: normalized })
        );
      }
    }

    await expect(finalOption!).toBeVisible({ timeout: 8000 });
    await finalOption!.click();

    await expect(listbox).toBeHidden({ timeout: 5000 }).catch(() => {});
    await expect(this.subjectPalette).toBeVisible({ timeout: 15000 });
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
    
    // Check if teacher selection is required
    const selectionAlert = this.page.locator('text=กรุณาเลือกครูผู้สอน');
    const isAlertVisible = await selectionAlert.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isAlertVisible) {
      // If selection alert is shown, teacher needs to be selected first
      // Tests should call selectTeacher() before waitForPageReady()
      console.warn('[ArrangePage] Teacher selection required - please select a teacher before waiting for page ready');
      // Wait for teacher dropdown to be available
      await expect(this.teacherDropdown).toBeVisible({ timeout: 5000 });
      return;
    }
    
    // Wait for key elements to be visible (when teacher is already selected)
    await expect(this.subjectPalette).toBeVisible({ timeout: 10000 });
    await expect(this.timetableGrid).toBeVisible({ timeout: 10000 });
  }
}
