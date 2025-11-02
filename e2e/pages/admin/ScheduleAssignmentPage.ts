import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Schedule Assignment (Teacher Arrange) page
 * 
 * Represents the main admin interface for assigning teachers to subjects
 * and dragging subjects into timeslot grid.
 * 
 * @example
 * ```typescript
 * const schedulePage = new ScheduleAssignmentPage(page);
 * await schedulePage.goto('1-2567');
 * await schedulePage.selectTeacher('TCH001');
 * await schedulePage.dragSubjectToTimeslot('TH101', 'MON', 1);
 * ```
 */
export class ScheduleAssignmentPage {
  /**
   * Common locators for schedule assignment interface
   */
  private readonly semesterDropdown: Locator;
  private readonly teacherDropdown: Locator;
  private readonly subjectList: Locator;
  private readonly timeslotGrid: Locator;
  private readonly conflictIndicator: Locator;
  private readonly exportButton: Locator;
  private readonly saveButton: Locator;
  private readonly lockButton: Locator;

  constructor(public readonly page: Page) {
    // Initialize locators
    this.semesterDropdown = this.page.locator('[data-testid="semester-selector"]');
    this.teacherDropdown = this.page.locator('[data-testid="teacher-selector"]');
    this.subjectList = this.page.locator('[data-testid="subject-list"]');
    this.timeslotGrid = this.page.locator('[data-testid="timeslot-grid"]');
    this.conflictIndicator = this.page.locator('[data-testid="conflict-indicator"]');
    this.exportButton = this.page.locator('[data-testid="export-button"]');
    this.saveButton = this.page.locator('[data-testid="save-button"]');
    this.lockButton = this.page.locator('[data-testid="lock-button"]');
  }

  /**
   * Navigate to teacher arrangement page for specific semester
   * @param semester Semester in format "1-2567" or "2-2567"
   */
  async goto(semester: string): Promise<void> {
    await this.page.goto(`/schedule/${semester}/arrange/teacher-arrange`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Select a teacher from the dropdown
   * @param teacherId Teacher ID (e.g., "TCH001")
   */
  async selectTeacher(teacherId: string): Promise<void> {
    await this.teacherDropdown.selectOption({ value: teacherId });
    await this.page.waitForTimeout(500); // Wait for UI to update
  }

  /**
   * Select a teacher by visible name
   * @param teacherName Teacher name (e.g., "สมชาย ใจดี")
   */
  async selectTeacherByName(teacherName: string): Promise<void> {
    await this.teacherDropdown.selectOption({ label: teacherName });
    await this.page.waitForTimeout(500);
  }

  /**
   * Drag a subject from the list to a specific timeslot
   * @param subjectCode Subject code (e.g., "TH101")
   * @param day Day of week ("MON", "TUE", "WED", "THU", "FRI")
   * @param period Period number (1-8)
   */
  async dragSubjectToTimeslot(
    subjectCode: string,
    day: string,
    period: number
  ): Promise<void> {
    const subject = this.subjectList.filter({ hasText: subjectCode });
    const timeslot = this.timeslotGrid.locator(
      `[data-day="${day}"][data-period="${period}"]`
    );

    await subject.dragTo(timeslot);
    await this.page.waitForTimeout(1000); // Wait for drag animation
  }

  /**
   * Check if a conflict indicator is visible and return its message
   * @returns Conflict message if visible, null otherwise
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
   * Check if a specific conflict type is detected
   * @param conflictType Type of conflict to check for
   */
  async hasConflict(conflictType: 'teacher' | 'room' | 'locked' | 'break'): Promise<boolean> {
    const message = await this.getConflictMessage();
    if (!message) return false;

    const conflictKeywords = {
      teacher: ['ครูสอนซ้ำซ้อน', 'teacher conflict'],
      room: ['ห้องเรียนซ้ำซ้อน', 'room conflict'],
      locked: ['ช่วงเวลาถูกล็อก', 'locked timeslot'],
      break: ['พักเที่ยง', 'break time', 'พัก'],
    };

    return conflictKeywords[conflictType].some(keyword =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Lock a specific timeslot for school-wide activities
   * @param day Day of week
   * @param period Period number
   */
  async lockTimeslot(day: string, period: number): Promise<void> {
    const timeslot = this.timeslotGrid.locator(
      `[data-day="${day}"][data-period="${period}"]`
    );

    // Right-click to open context menu
    await timeslot.click({ button: 'right' });
    await this.page.waitForTimeout(300);

    // Click lock option
    await this.page.locator('text=Lock', { hasText: /^Lock$/i }).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Unlock a previously locked timeslot
   * @param day Day of week
   * @param period Period number
   */
  async unlockTimeslot(day: string, period: number): Promise<void> {
    const timeslot = this.timeslotGrid.locator(
      `[data-day="${day}"][data-period="${period}"]`
    );

    await timeslot.click({ button: 'right' });
    await this.page.waitForTimeout(300);

    await this.page.locator('text=Unlock', { hasText: /^Unlock$/i }).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Export the current schedule to a file
   * @param format Export format ('excel' or 'pdf')
   */
  async exportSchedule(format: 'excel' | 'pdf'): Promise<void> {
    await this.exportButton.click();
    await this.page.waitForTimeout(300);

    // Click the format option
    await this.page.locator(`text=${format.toUpperCase()}`).click();
  }

  /**
   * Save the current schedule changes
   */
  async saveSchedule(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(1000); // Wait for save operation
  }

  /**
   * Get the count of subjects assigned to the current teacher
   * @returns Number of assigned subjects
   */
  async getAssignedSubjectCount(): Promise<number> {
    const assignedItems = this.timeslotGrid.locator('[data-assigned="true"]');
    return await assignedItems.count();
  }

  /**
   * Get all subjects available in the subject list
   * @returns Array of subject codes
   */
  async getAvailableSubjects(): Promise<string[]> {
    const subjects = await this.subjectList.locator('[data-subject-code]').all();
    const codes: string[] = [];

    for (const subject of subjects) {
      const code = await subject.getAttribute('data-subject-code');
      if (code) codes.push(code);
    }

    return codes;
  }

  /**
   * Check if a specific timeslot is locked
   * @param day Day of week
   * @param period Period number
   * @returns True if locked, false otherwise
   */
  async isTimeslotLocked(day: string, period: number): Promise<boolean> {
    const timeslot = this.timeslotGrid.locator(
      `[data-day="${day}"][data-period="${period}"]`
    );

    const isLocked = await timeslot.getAttribute('data-locked');
    return isLocked === 'true';
  }

  /**
   * Remove a subject from a specific timeslot
   * @param day Day of week
   * @param period Period number
   */
  async removeSubjectFromTimeslot(day: string, period: number): Promise<void> {
    const timeslot = this.timeslotGrid.locator(
      `[data-day="${day}"][data-period="${period}"]`
    );

    // Click the remove/delete button within the timeslot
    const removeButton = timeslot.locator('[data-testid="remove-subject"]');
    await removeButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Get the current semester from the dropdown
   * @returns Currently selected semester
   */
  async getCurrentSemester(): Promise<string> {
    return (await this.semesterDropdown.inputValue()) || '';
  }

  /**
   * Get the currently selected teacher ID
   * @returns Currently selected teacher ID
   */
  async getCurrentTeacher(): Promise<string> {
    return (await this.teacherDropdown.inputValue()) || '';
  }

  /**
   * Wait for the page to be fully loaded and ready
   */
  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('[data-testid="subject-list"]', {
      state: 'visible',
    });
    await this.page.waitForSelector('[data-testid="timeslot-grid"]', {
      state: 'visible',
    });
  }
}
