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

import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ArrangePage extends BasePage {
  // Page elements
  readonly teacherDropdown: Locator;
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
      .locator("#teacher-select")
      .or(page.getByTestId("teacher-select"))
      .or(page.getByRole("combobox", { name: /เลือกครู/ }));

    // Prefer stable test id to avoid strict-mode ambiguity.
    this.subjectPalette = page.getByTestId("subject-palette");
    this.subjectCard = (subjectCode: string) =>
      this.subjectPalette
        .locator('[data-testid="subject-item"]')
        .filter({ hasText: subjectCode })
        .first()
        .or(
          this.subjectPalette
            .locator('[data-testid^="subject-card"]')
            .filter({ hasText: subjectCode })
            .first(),
        )
        .or(
          this.subjectPalette
            .locator("[data-subject-code]")
            .filter({ hasText: subjectCode })
            .first(),
        );

    this.timetableGrid = page
      .locator('[data-testid="timetable-grid"]')
      .or(
        page
          .locator("table")
          .filter({ has: page.locator('th:has-text("จันทร์")') }),
      );
    this.timeslotCell = (row: number, col: number) =>
      this.timetableGrid.locator(
        `tbody tr:nth-child(${row}) td:nth-child(${col})`,
      );

    this.roomSelectionDialog = page.locator('[role="dialog"]', {
      hasText: "เลือกห้องเรียน",
    });
    this.roomOption = (roomName: string) =>
      this.roomSelectionDialog.locator('[role="option"], li', {
        hasText: roomName,
      });
    this.confirmRoomButton = this.roomSelectionDialog.locator("button", {
      hasText: "ยืนยัน",
    });
    this.cancelRoomButton = this.roomSelectionDialog.locator("button", {
      hasText: "ยกเลิก",
    });

    this.deleteButton = page
      .locator('button[aria-label="ลบตาราง"]')
      .or(page.locator("button", { hasText: "ลบตาราง" }));
    this.confirmDeleteButton = page.locator("button", {
      hasText: "ยืนยันการลบ",
    });

    this.lockedIndicator = page
      .locator('[data-locked="true"]')
      .or(page.locator('[aria-label*="ล็อก"]'));

    this.conflictIndicator = page
      .locator('[data-testid="conflict-indicator"]')
      .or(page.locator('[role="alert"]'));

    this.saveButton = page
      .locator('[data-testid="save-button"]')
      .or(page.locator("button", { hasText: "บันทึก" }));

    this.exportButton = page
      .locator("button", { hasText: "ส่งออก" })
      .or(page.locator('button[aria-label*="ส่งออก"]'));

    this.lockButton = (row: number, col: number) =>
      this.timeslotCell(row, col).locator('button[aria-label*="ล็อก"]');
  }

  /**
   * Navigate to arrange page for a specific semester
   */
  async navigateTo(semester: string, year: string) {
    await this.goto(`/schedule/${semester}-${year}/arrange`);
    await this.waitForPageLoad();

    // Wait for semester to sync with global state
    await this.waitForSemesterSync(`${semester}/${year}`);

    // Wait for initial data loading (teachers, timeslots) to complete
    // The page shows skeleton loaders while fetching data
    await this.waitForDataLoad();
  }

  /**
   * Wait for arrange page data to load (teachers, timeslots)
   * Waits for skeleton loaders to disappear, indicating data is ready
   */
  async waitForDataLoad() {
    // Wait for network requests to complete (SWR data fetching)
    await this.page.waitForLoadState("networkidle", { timeout: 45000 });

    // Wait for MUI skeleton loaders to disappear (indicates data loaded)
    const skeleton = this.page.locator('[class*="MuiSkeleton"]').first();
    if (await skeleton.isVisible().catch(() => false)) {
      await skeleton.waitFor({ state: "hidden", timeout: 30000 });
    }

    // Give a small buffer for React to re-render with data
    await this.page.waitForTimeout(500);
  }

  /**
   * Select a teacher from dropdown using the stable #teacher-select element.
   * Retries the open/select flow and waits for the listbox visibility state
   * before and after selection to reduce flaky clicks.
   */
  async selectTeacher(teacherIdOrName: string | number) {
    const dropdown = this.teacherDropdown.first();
    await expect(dropdown).toBeVisible({ timeout: 15000 });
    await expect(dropdown).toBeEnabled({ timeout: 15000 });
    await this.page
      .waitForLoadState("networkidle", { timeout: 15000 })
      .catch(() => {});

    const listbox = this.page.locator('[role="listbox"]').first();
    const clickDropdown = async () => {
      await dropdown.click({ force: true, timeout: 15000 });
      await expect(listbox).toBeVisible({ timeout: 15000 });
    };

    let opened = false;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await clickDropdown();
        opened = true;
        break;
      } catch {
        await this.page.waitForTimeout(300);
      }
    }
    if (!opened) {
      throw new Error("Teacher dropdown listbox did not appear");
    }

    const raw = String(teacherIdOrName).trim();
    const normalized = raw.replace(/^(นาย|นางสาว|นาง|ครู)\s*/, "");
    const teacherIdRegex = /^\d+$/;

    const locateById = () =>
      listbox.locator(`[data-item-id="${raw}"], [data-value="${raw}"]`).first();

    const escapeRegex = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const locateByName = () =>
      this.page
        .getByRole("option", { name: new RegExp(escapeRegex(normalized), "i") })
        .first()
        .or(
          this.page.locator('li[role="option"]').filter({
            hasText: normalized,
          }),
        );

    let option: Locator | null = null;
    if (teacherIdRegex.test(raw)) {
      option = locateById();
    }
    if (!option || !(await option.isVisible().catch(() => false))) {
      option = locateByName();
    }

    await expect(option!).toBeVisible({ timeout: 15000 });
    await option!.click({ force: true, timeout: 15000 });
    await expect(listbox).toBeHidden({ timeout: 15000 });
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
      { steps: 10 },
    );
    await this.page.mouse.up();

    // Wait for any animation/transition
    await this.page.waitForTimeout(500);
  }

  /**
   * Select room from dialog (Issue #83)
   */
  async selectRoom(roomName: string) {
    await expect(this.roomSelectionDialog).toBeVisible({ timeout: 15000 });
    await this.roomOption(roomName).click();
    await this.confirmRoomButton.click();
    await expect(this.roomSelectionDialog).toBeHidden({ timeout: 3000 });
  }

  /**
   * Cancel room selection
   */
  async cancelRoomSelection() {
    await expect(this.roomSelectionDialog).toBeVisible({ timeout: 15000 });
    await this.cancelRoomButton.click();
    await expect(this.roomSelectionDialog).toBeHidden({ timeout: 3000 });
  }

  /**
   * Assert room dialog appears after drag (Issue #83)
   */
  async assertRoomDialogVisible() {
    await expect(this.roomSelectionDialog).toBeVisible({ timeout: 15000 });
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
    const cells = this.timetableGrid.locator(
      'tbody td[data-has-subject="true"]',
    );
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
  async hasConflict(
    type: "teacher" | "room" | "locked" | "break",
  ): Promise<boolean> {
    const message = await this.getConflictMessage();
    if (!message) return false;

    const conflictKeywords = {
      teacher: ["ครูสอนซ้ำซ้อน", "teacher conflict", "ครูซ้อน"],
      room: ["ห้องเรียนซ้ำซ้อน", "room conflict", "ห้องซ้อน"],
      locked: ["ช่วงเวลาถูกล็อก", "locked timeslot", "ล็อก"],
      break: ["พักเที่ยง", "break time", "พัก"],
    };

    return conflictKeywords[type].some((keyword) =>
      message.toLowerCase().includes(keyword.toLowerCase()),
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
    await cell.click({ button: "right" });
    await this.page.waitForTimeout(300);

    // Click lock option
    const lockOption = this.page
      .locator("text=Lock")
      .or(this.page.locator("text=ล็อก"));
    await lockOption.first().click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Unlock a previously locked timeslot
   */
  async unlockTimeslot(row: number, col: number) {
    const cell = this.timeslotCell(row, col);

    // Right-click to open context menu
    await cell.click({ button: "right" });
    await this.page.waitForTimeout(300);

    // Click unlock option
    const unlockOption = this.page
      .locator("text=Unlock")
      .or(this.page.locator("text=ปลดล็อก"));
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
  async exportSchedule(format: "excel" | "pdf") {
    await this.exportButton.click();
    await this.page.waitForTimeout(300);

    // Click the format option
    const formatOption = this.page
      .locator(`text=${format.toUpperCase()}`)
      .or(
        this.page.locator(`button`, {
          hasText: format === "excel" ? "Excel" : "PDF",
        }),
      );
    await formatOption.first().click();
  }

  /**
   * Get all available subjects in the palette
   * @returns Array of subject codes
   */
  async getAvailableSubjects(): Promise<string[]> {
    const subjectCards = this.subjectPalette
      .locator('[data-testid="subject-item"]')
      .or(this.subjectPalette.locator('[data-testid^="subject-card"]'))
      .or(this.subjectPalette.locator("[data-subject-code]"));

    // Some builds require selecting a grade-year filter (ม.1–ม.6) before subjects are shown.
    // Try to enable any year filter if the palette is empty.
    if (!(await subjectCards.first().isVisible().catch(() => false))) {
      const yearLabels = [
        "ม.1",
        "ม.2",
        "ม.3",
        "ม.4",
        "ม.5",
        "ม.6",
        "?.1",
        "?.2",
        "?.3",
        "?.4",
        "?.5",
        "?.6",
      ];
      const yearFilterGroup = this.page
        .getByRole("group", { name: /year filter/i })
        .first();
      for (const label of yearLabels) {
        const yearButton = (await yearFilterGroup
          .isVisible()
          .catch(() => false))
          ? yearFilterGroup.locator("button").filter({ hasText: label }).first()
          : this.subjectPalette.locator("button").filter({ hasText: label }).first();
        if (!(await yearButton.isVisible().catch(() => false))) continue;

        await yearButton.click().catch(() => {});
        await this.page
          .waitForLoadState("networkidle", { timeout: 15000 })
          .catch(() => {});

        if (await subjectCards.first().isVisible().catch(() => false)) break;
      }
    }

    const subjects = await subjectCards.all();

    const codes: string[] = [];
    for (const subject of subjects) {
      const code = await subject.getAttribute("data-subject-code");
      if (code) {
        codes.push(code);
      } else {
        // Fallback: extract from text content
        const text = await subject.textContent();
        if (text) {
          // Subject code: Thai learning area letter or Latin prefix + 5 digits (e.g., "ท21101", "TH21101")
          const match = text.match(/([ทควสพศงอ]\d{5}|[A-Z]{2}\d{5})/);
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
    const removeButton = cell
      .locator('button[aria-label*="ลบ"]')
      .or(cell.locator('button[aria-label*="remove"]'));
    await removeButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Get count of assigned subjects in the timetable
   */
  async getAssignedSubjectCount(): Promise<number> {
    const assignedCells = this.timetableGrid.locator("tbody td").filter({
      has: this.page.locator('[data-testid^="subject-card"], .subject-chip'),
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
    const selectionAlert = this.page.locator("text=กรุณาเลือกครูผู้สอน");
    const isAlertVisible = await selectionAlert
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isAlertVisible) {
      // If selection alert is shown, teacher needs to be selected first
      // Tests should call selectTeacher() before waitForPageReady()
      console.warn(
        "[ArrangePage] Teacher selection required - please select a teacher before waiting for page ready",
      );
      // Wait for teacher dropdown to be available
      await expect(this.teacherDropdown).toBeVisible({ timeout: 15000 });
      return;
    }

    // Wait for key elements to be visible (when teacher is already selected)
    await expect(this.subjectPalette).toBeVisible({ timeout: 15000 });
    await expect(this.timetableGrid).toBeVisible({ timeout: 15000 });
  }
}
