/**
 * ArrangePage - Page Object for Schedule Arrangement (Issues #83-85, #89)
 *
 * Tests drag-drop room selection flow and schedule deletion
 * URL: /schedule/[academicYear]/[semester]/arrange
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
      .getByRole("combobox", { name: /เลือกครู/ })
      .or(page.getByTestId("teacher-select"));

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

    this.timetableGrid = page.getByTestId("timetable-grid");

    // Locate a timeslot card by (period row, day column).
    // Supports both:
    // - New: HTML table structure with data-testid="timeslot-card"
    // - Legacy: MUI Grid with Cards
    this.timeslotCell = (row: number, col: number) => {
      // New table structure: row is 1-indexed (period), col is 1-indexed (day: 1=MON, 2=TUE, etc.)
      // The table has header row at tbody position 0, so data rows start at nth(row-1)
      // Each row has period column + 5 day columns, so day columns start at nth(col) (1-indexed)
      const tableRow = this.timetableGrid.locator('tbody > tr').nth(row - 1);
      const tableCell = tableRow.locator('td').nth(col); // col 0 is period label, col 1-5 are MON-FRI
      const newCell = tableCell.locator('[data-testid="timeslot-card"]');
      
      // Legacy MUI Grid structure (fallback)
      const rowChip = this.timetableGrid
        .locator(".MuiChip-root")
        .filter({ hasText: new RegExp(`^${row}$`) })
        .first();
      const rowContainer = rowChip.locator(
        'xpath=ancestor::div[contains(@class,\"MuiGrid-container\")]',
      );
      const legacyCell = rowContainer.locator(".MuiCard-root").nth(Math.max(0, col - 1));
      
      return newCell.or(legacyCell);
    };

    this.roomSelectionDialog = page
      .getByTestId("room-selection-dialog")
      .or(page.locator('[role="dialog"]', { hasText: "เลือกห้องเรียน" }));
    this.roomOption = (roomName: string) =>
      roomName
        ? this.roomSelectionDialog
            .locator(`[data-room-name="${roomName}"]`)
            .first()
        : this.roomSelectionDialog
            .locator(
              '[data-testid^="room-option-"]:not([aria-disabled="true"])',
            )
            .first();
    this.confirmRoomButton = this.roomSelectionDialog
      .getByTestId("room-confirm")
      .or(this.roomSelectionDialog.locator("button", { hasText: "ยืนยัน" }));
    this.cancelRoomButton = this.roomSelectionDialog
      .getByTestId("room-cancel")
      .or(this.roomSelectionDialog.locator("button", { hasText: "ยกเลิก" }));

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
      .getByTestId("save-button")
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
    await this.goto(`/schedule/${year}/${semester}/arrange`);
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
    // Wait for DOM ready instead of networkidle to avoid hanging on non-essential requests
    await this.page.waitForLoadState("domcontentloaded", { timeout: 45000 });

    // Ensure key page elements are present before checking for overlays
    await expect(this.teacherDropdown)
      .toBeVisible({ timeout: 30000 })
      .catch(() => {});

    // Wait for global loading overlay (using BasePage logic)
    if (await this.globalLoadingOverlay.isVisible().catch(() => false)) {
      await this.globalLoadingOverlay
        .waitFor({ state: "hidden", timeout: 30_000 })
        .catch(() => {});
    }

    // Wait for MUI skeleton loaders to disappear (indicates data loaded)
    const skeleton = this.page.locator('[class*="MuiSkeleton"]').first();
    if (await skeleton.isVisible().catch(() => false)) {
      await skeleton.waitFor({ state: "hidden", timeout: 30000 });
    }

    // Wait for the timetable grid to be visible and stable (event-driven)
    await expect(this.timetableGrid).toBeVisible({ timeout: 15000 });
  }

  /**
   * Select a teacher from dropdown using the stable #teacher-select element.
   * Retries the open/select flow and waits for the listbox visibility state
   * before and after selection to reduce flaky clicks.
   */
  async selectTeacher(teacherIdOrName: string | number) {
    const dropdownByRole = this.page
      .getByRole("combobox", { name: /เลือกครู/ })
      .first();
    const dropdown = await dropdownByRole
      .isVisible()
      .then((visible) =>
        visible ? dropdownByRole : this.page.getByTestId("teacher-select"),
      )
      .catch(() => this.page.getByTestId("teacher-select"));

    await expect(dropdown).toBeVisible({ timeout: 15000 });
    await expect(dropdown).toBeEnabled({ timeout: 15000 });

    const listbox = this.page.getByRole("listbox").last();
    const clickDropdown = async () => {
      await dropdown.click({ timeout: 15000 });
      await expect(listbox).toBeVisible({ timeout: 15000 });
    };

    let opened = false;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await clickDropdown();
        opened = true;
        break;
      } catch {
        // Brief delay before retry - animation time for MUI dropdown
        await this.page.waitForTimeout(150);
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
    const locateByTestId = () =>
      listbox
        .locator('[data-testid^="teacher-option-"]')
        .filter({ hasText: normalized })
        .first();
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
      option = locateByTestId();
    }
    if (!option || !(await option.isVisible().catch(() => false))) {
      option = locateByName();
    }

    await expect(option!).toBeVisible({ timeout: 15000 });
    await option!.click({ timeout: 15000 });
    await expect(listbox).toBeHidden({ timeout: 15000 });

    // Ensure the selected value is reflected in the combobox.
    // Use toHaveValue (not toContainText) because <input> textContent is always "".
    if (!teacherIdRegex.test(raw)) {
      await expect(dropdownByRole).toHaveValue(
        new RegExp(escapeRegex(normalized), "i"),
        {
          timeout: 15000,
        },
      );
    }
    await expect(this.subjectPalette).toBeVisible({ timeout: 15000 });

    // START FIX: Wait for at least one subject card/item relative to the teacher
    // This stabilizes the "Display available subjects" test which was failing because
    // the palette appeared but was empty or loading.
    const subjectItem = this.subjectPalette
      .locator('[data-testid="subject-item"]')
      .first();

    // Attempt to wait for at least one item, but proceed if empty (teacher might have no subjects)
    await subjectItem
      .waitFor({ state: "visible", timeout: 10000 })
      .catch(() => {});
    // Also wait for global overlay again, as teacher selection triggers SWR revalidation
    if (await this.globalLoadingOverlay.isVisible().catch(() => false)) {
      await this.globalLoadingOverlay
        .waitFor({ state: "hidden", timeout: 15_000 })
        .catch(() => {});
    }

    // Teacher selection triggers data reload (subjects + schedule grid).
    await this.waitForPageLoad();
    await this.waitForDataLoad();

    // Explicitly wait for subjects to be populated if any exist for this teacher
    // (We assume the test selects a teacher meaningful for the test context)
    // We don't strict assert count > 0 here to allow selecting teachers with no subjects test cases,
    // but we ensure the loading state is settled.

    await expect(this.timetableGrid).toBeVisible({ timeout: 45_000 });
    await expect(
      this.timetableGrid.getByTestId("timeslot-card").first(),
    ).toBeVisible({ timeout: 45_000 });
  }

  /**
   * Drag subject card to timeslot cell (Issue #83)
   */
  async dragSubjectToTimeslot(subjectCode: string, row: number, col: number) {
    const subject = this.subjectCard(subjectCode);
    const target = this.timeslotCell(row, col);

    // Get bounding boxes for precise drag
    await subject.scrollIntoViewIfNeeded().catch(() => {});
    await target.scrollIntoViewIfNeeded().catch(() => {});
    await expect(subject).toBeVisible({ timeout: 15000 });
    await expect(target).toBeVisible({ timeout: 15000 });

    // Prefer Playwright's built-in drag sequence first.
    const dragged = await subject
      .dragTo(target, { timeout: 10000 })
      .then(() => true)
      .catch(() => false);
    if (dragged) {
      // Wait for drop animation to complete (CSS transition ~200ms)
      await this.page.waitForTimeout(200);
      return;
    }
    const subjectBox = await subject.boundingBox();
    const targetBox = await target.boundingBox();

    if (!subjectBox || !targetBox) {
      throw new Error(`Cannot drag: subject or target not visible`);
    }

    // Perform drag and drop
    await this.page.mouse.move(
      subjectBox.x + subjectBox.width / 2,
      subjectBox.y + subjectBox.height / 2,
    );
    await this.page.mouse.down();
    // Activation constraint requires movement distance.
    await this.page.mouse.move(
      subjectBox.x + subjectBox.width / 2 + 12,
      subjectBox.y + subjectBox.height / 2 + 12,
      { steps: 3 },
    );
    await this.page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height / 2,
      { steps: 12 },
    );
    // Give dnd-kit time to register "over" before dropping (minimal delay for drag activation).
    await this.page.waitForTimeout(80);
    await this.page.mouse.up();
  }

  /**
   * Select room from dialog (Issue #83)
   * 
   * Supports both legacy (with confirm button) and new parallel route modal
   * (clicking room directly creates schedule and closes dialog)
   */
  async selectRoom(roomName: string) {
    const dialogVisible = await this.roomSelectionDialog
      .waitFor({ state: "visible", timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    // Some arrange flows no longer require explicit room selection.
    if (!dialogVisible) return;

    // New parallel route modal uses a list of room options - clicking directly creates schedule
    const availableRoomsList = this.roomSelectionDialog.locator('[data-testid="available-rooms-list"]');
    const isNewModal = await availableRoomsList.isVisible().catch(() => false);
    
    const enabledRoomOptions = this.roomSelectionDialog.locator(
      '[data-testid^="room-option-"]:not([aria-disabled="true"]):not([disabled])',
    );
    const optionCount = await enabledRoomOptions.count();

    // Prefer a specific room if requested; otherwise pick the first enabled room.
    const candidates: Locator[] = [];
    if (roomName) {
      candidates.push(this.roomOption(roomName));
    }
    // Limit fallback candidates to first 3 to avoid long timeouts
    const fallbackCandidates = Array.from({ length: optionCount }, (_, i) =>
      enabledRoomOptions.nth(i),
    );
    candidates.push(...fallbackCandidates.slice(0, 3));

    for (const option of candidates) {
      const visible = await option.isVisible().catch(() => false);
      if (!visible) continue;

      await option.scrollIntoViewIfNeeded().catch(() => undefined);
      
      if (isNewModal) {
        // New modal: clicking room directly triggers server action and closes dialog
        const [response] = await Promise.all([
          this.page
            .waitForResponse(
              (resp) =>
                (resp.url().includes("/api/") || resp.url().includes("_rsc")) &&
                resp.request().method() === "POST" &&
                resp.status() >= 200 &&
                resp.status() < 400,
              { timeout: 15000 },
            )
            .catch(() => null),
          option.click({ timeout: 5000 }),
        ]);

        const closed = await this.roomSelectionDialog
          .waitFor({ state: "hidden", timeout: 8000 })
          .then(() => true)
          .catch(() => false);

        if (closed) {
          // Wait for page refresh after router.refresh()
          await this.page.waitForLoadState("domcontentloaded", { timeout: 5000 }).catch(() => {});
          // Trigger focus event as fallback for SWR revalidateOnFocus
          await this.page.evaluate(() => window.dispatchEvent(new Event('focus'))).catch(() => {});
          return;
        }
      } else {
        // Legacy flow: select room, then confirm
        await option.click({ timeout: 5000 });

        // Wait for validation/state update
        await expect(this.confirmRoomButton).toBeEnabled({ timeout: 5000 });

        // Use waitForResponse to wait for API completion instead of unreliable snackbar
        const [response] = await Promise.all([
          this.page
            .waitForResponse(
              (resp) =>
                resp.url().includes("/api/") &&
                resp.request().method() === "POST" &&
                resp.status() >= 200 &&
                resp.status() < 400,
              { timeout: 15000 },
            )
            .catch(() => null),
          this.confirmRoomButton.click({ timeout: 5000 }),
        ]);

        const closed = await this.roomSelectionDialog
          .waitFor({ state: "hidden", timeout: 5000 })
          .then(() => true)
          .catch(() => false);

        // Room conflict keeps dialog open; retry another enabled room.
        if (closed) {
          // If we got an API response, wait briefly for SWR cache + React to update
          if (response) {
            // Use expect.poll to verify DOM updated (Context7: retry assertions)
            await expect
              .poll(
                async () => {
                  return await this.page
                    .locator('[data-testid="timeslot-remove"]')
                    .count();
                },
                { timeout: 5000, intervals: [100, 250, 500, 1000] },
              )
              .toBeGreaterThan(0)
              .catch(() => {}); // Non-blocking - just helps stabilize
          }
          return;
        }
      }
    }

    // If we got here, room selection couldn't be completed (all rooms conflicted/disabled).
    await expect(this.roomSelectionDialog).toBeVisible({ timeout: 1000 });
  }

  async assertTimeslotEmpty(row: number, col: number) {
    const cell = this.timeslotCell(row, col);
    await expect(cell).not.toHaveAttribute("data-subject-code", /.+/, {
      timeout: 15_000,
    });
    await expect(cell.getByTestId("timeslot-remove")).toHaveCount(0);
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
    await expect(cell).toHaveAttribute("data-subject-code", subjectCode, {
      timeout: 15_000,
    });
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
    
    // Wait for context menu to appear (MUI uses a Popover)
    const lockOption = this.page
      .locator("text=Lock")
      .or(this.page.locator("text=ล็อก"));
    await expect(lockOption.first()).toBeVisible({ timeout: 5000 });
    
    // Click lock option
    await lockOption.first().click();
    
    // Wait for lock indicator to appear (confirms action completed)
    await expect(cell.locator('[data-locked="true"]')).toBeVisible({ timeout: 5000 }).catch(() => {});
  }

  /**
   * Unlock a previously locked timeslot
   */
  async unlockTimeslot(row: number, col: number) {
    const cell = this.timeslotCell(row, col);

    // Right-click to open context menu
    await cell.click({ button: "right" });
    
    // Wait for context menu to appear
    const unlockOption = this.page
      .locator("text=Unlock")
      .or(this.page.locator("text=ปลดล็อก"));
    await expect(unlockOption.first()).toBeVisible({ timeout: 5000 });
    
    // Click unlock option
    await unlockOption.first().click();
    
    // Wait for lock indicator to disappear (confirms action completed)
    await expect(cell.locator('[data-locked="true"]')).toBeHidden({ timeout: 5000 }).catch(() => {});
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
    
    // Wait for export menu to appear
    const formatOption = this.page.locator(`text=${format.toUpperCase()}`).or(
      this.page.locator(`button`, {
        hasText: format === "excel" ? "Excel" : "PDF",
      }),
    );
    await expect(formatOption.first()).toBeVisible({ timeout: 5000 });
    
    // Click the format option
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
    if (
      !(await subjectCards
        .first()
        .isVisible()
        .catch(() => false))
    ) {
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
          : this.subjectPalette
              .locator("button")
              .filter({ hasText: label })
              .first();
        if (!(await yearButton.isVisible().catch(() => false))) continue;

        await yearButton.click().catch(() => {});
        await this.page
          .waitForLoadState("networkidle", { timeout: 15000 })
          .catch(() => {});

        if (
          await subjectCards
            .first()
            .isVisible()
            .catch(() => false)
        )
          break;
      }
    }

    const subjects = await subjectCards.all();

    const codes: string[] = [];
    for (const subject of subjects) {
      const code = await subject.getAttribute("data-subject-code");
      if (code) {
        codes.push(code);
        continue;
      }

      const sortableId =
        (await subject.getAttribute("data-sortable-id")) ||
        (await subject.getAttribute("data-sortable"));
      if (sortableId) {
        const parsed = sortableId.split("-Grade-")[0] ?? "";
        const normalized = parsed.replace(/^subject-/, "");
        if (normalized) {
          codes.push(normalized);
          continue;
        }
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
      .getByTestId("timeslot-remove")
      .or(cell.locator('button[aria-label*="ลบ"]'))
      .or(cell.locator('button[aria-label*="remove"]'));
    await removeButton.click();
    
    // Wait for the subject to be removed from the cell (event-driven)
    await expect(removeButton).toBeHidden({ timeout: 5000 }).catch(() => {});
  }

  /**
   * Get count of assigned subjects in the timetable
   */
  async getAssignedSubjectCount(): Promise<number> {
    return await this.timetableGrid
      .locator('[data-testid="timeslot-remove"]')
      .count();
  }

  /**
   * Save schedule changes
   */
  async saveSchedule() {
    await expect(this.saveButton).toBeEnabled({ timeout: 15000 });
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
