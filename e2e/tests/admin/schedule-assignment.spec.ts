import { test, expect } from "../../fixtures/admin.fixture";
import { testSemester, testTeacher } from "../../fixtures/seed-data.fixture";
import { getE2ETeacherId } from "../../helpers/teacher-id";
import { getGradeFreeTimeslot } from "../../helpers/grade-slot";

const RUN_SCHEDULE_ASSIGNMENT_EXTENDED =
  process.env.E2E_SCHEDULE_ASSIGNMENT_EXTENDED === "true";

/**
 * E2E Tests for Admin Schedule Assignment Flow
 *
 * Rewritten to use ArrangePage POM (Issue #70 follow-up)
 *
 * Test coverage:
 * - Subject assignment to timeslots
 * - Conflict detection (teacher, room, locked slots)
 * - Timeslot locking/unlocking
 * - Schedule export functionality
 *
 * Prerequisites:
 * - Database seeded with test data (pnpm db:seed with SEED_FOR_TESTS=true)
 * - Admin authenticated (handled by admin.fixture)
 *
 * Note: These tests use real seed data from seed-data.fixture.ts
 */

// ============================================================================
// Helper Utilities for Test Data Mapping
// ============================================================================

/**
 * Convert day name + period to timeslot grid coordinates
 * @param day Day of week ('MON', 'TUE', 'WED', 'THU', 'FRI')
 * @param period Period number (1-8)
 * @returns Grid coordinates { row, col }
 */
function getTimeslotCoords(
  day: string,
  period: number,
): { row: number; col: number } {
  const dayIndex = ["MON", "TUE", "WED", "THU", "FRI"].indexOf(day);
  if (dayIndex === -1) {
    throw new Error(`Invalid day: ${day}. Must be MON, TUE, WED, THU, or FRI`);
  }
  return {
    row: period, // Period 1 = row 1, Period 2 = row 2, etc.
    col: dayIndex + 1, // MON = col 1, TUE = col 2, etc.
  };
}

/**
 * Get teacher full name from test data
 * @param teacherId Teacher ID number
 * @returns Full teacher name (e.g., "นาย สมชาย สมบูรณ์")
 */
function getTeacherName(teacherId: number): string {
  // Map known test teacher IDs to names
  const teacherMap: Record<number, string> = {
    1: "นาย สมชาย สมบูรณ์", // Math teacher
    11: "นางสาว สุดารัตน์ เลิศล้ำ", // Science teacher
    31: "นางสาว กนกวรรณ วรวัฒน์", // English teacher
  };

  return teacherMap[teacherId] || `Teacher #${teacherId}`;
}

// ============================================================================
// Test Suites
// ============================================================================

// Re-enabled after implementing waitForResponse pattern (Context7 Playwright best practices)
// See: ArrangePage.selectRoom() now uses page.waitForResponse() + expect.poll()
test.describe.serial("Admin: Schedule Assignment - Basic Operations", () => {
  // Cleanup after each test to ensure fresh state
  test.afterEach(async ({ arrangePage }) => {
    try {
      // Only attempt delete if button is visible (schedule exists)
      if (await arrangePage.deleteButton.isVisible({ timeout: 2000 })) {
        await arrangePage.deleteSchedule();
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  test.beforeEach(async ({ arrangePage }) => {
    // Navigate to arrange page for semester 1/2568
    await arrangePage.navigateTo("1", "2568");
    // Don't wait for page ready yet - tests will select teacher first
  });

  // Flaky in CI due to drag-drop timing + SWR revalidation - runs locally for UX validation
  test("should successfully assign subject to empty timeslot", async ({
    arrangePage,
  }) => {
    test.skip(
      !!process.env.CI,
      "Drag-drop timing flaky in CI - run locally for UX testing",
    );
    // Arrange
    const teacherName = `${testTeacher.Prefix}${testTeacher.Firstname} ${testTeacher.Lastname}`;
    await arrangePage.selectTeacher(teacherName);

    const availableSubjects = await arrangePage.getAvailableSubjects();
    expect(availableSubjects.length).toBeGreaterThan(0);
    const subjectCode = availableSubjects[0]!;

    // Act - Drag subject to Monday, Period 1
    const { row, col } = getTimeslotCoords("MON", 1);
    await arrangePage.dragSubjectToTimeslot(subjectCode, row, col);

    // Handle room selection dialog (now uses waitForResponse internally)
    await arrangePage.selectRoom("");

    // Assert - Use expect.poll for reliable retry (Context7 best practice)
    await expect
      .poll(async () => await arrangePage.getAssignedSubjectCount(), {
        timeout: 10_000,
        intervals: [500, 1000, 2000],
      })
      .toBeGreaterThan(0);
  });

  test("should display available subjects for selected teacher", async ({
    arrangePage,
  }) => {
    // Arrange & Act — use full display format including department
    const teacherName = `${testTeacher.Prefix}${testTeacher.Firstname} ${testTeacher.Lastname}`;
    await arrangePage.selectTeacher(teacherName);

    // Assert
    const subjects = await arrangePage.getAvailableSubjects();
    expect(subjects.length).toBeGreaterThan(0);
    // MOE subject code format: Thai letter + 5 digits (e.g., ท21101)
    expect(subjects.some((code) => /^[ทควสพศงอ]\d{5}$/.test(code))).toBe(true);
  });

  test("should allow removing subject from timeslot", async ({
    arrangePage,
  }) => {
    const page = arrangePage.page;
    const teacherName = `${testTeacher.Prefix}${testTeacher.Firstname} ${testTeacher.Lastname}`;
    await arrangePage.selectTeacher(teacherName);
    await expect(page.getByTestId("timetable-grid")).toBeVisible({
      timeout: 30_000,
    });

    const teacherId = new URL(page.url()).searchParams.get("teacher");
    expect(teacherId).toBeTruthy();

    // Place deterministically via the room-select URL (drag is flaky in CI),
    // into a slot guaranteed empty for this grade so the create succeeds and the
    // grid renders a removable placed cell.
    const semester = `${testSemester.Year}/${testSemester.Semester}`;
    const subjectCode = testTeacher.SubjectCode; // ค21201
    const gradeId = testTeacher.GradeID; // M1-1
    const timeslotId = await getGradeFreeTimeslot(
      page,
      gradeId,
      testSemester.Year,
      testSemester.Semester,
    );

    const subjectItem = page.locator(
      `[data-testid="subject-item"][data-subject-code="${subjectCode}"]`,
    );
    await expect(subjectItem.first()).toBeVisible({ timeout: 15_000 });
    const respId = await subjectItem.first().getAttribute("data-resp-id");

    const params = new URLSearchParams({
      timeslot: timeslotId,
      subject: subjectCode,
      grade: gradeId,
      teacher: String(teacherId),
      ...(respId ? { resp: respId } : {}),
    });
    await page.goto(`/schedule/${semester}/arrange/room-select?${params}`);
    await page.waitForLoadState("domcontentloaded");
    const roomOptions = page.locator(
      '[data-testid^="room-option-"]:not([disabled])',
    );
    await expect(roomOptions.first()).toBeVisible({ timeout: 15_000 });
    await Promise.all([
      page
        .waitForResponse(
          (r) => r.request().method() === "POST" && r.status() < 400,
          { timeout: 15_000 },
        )
        .catch(() => null),
      roomOptions.first().click({ timeout: 5_000 }),
    ]);
    await page
      .getByText(/จัดตารางสอนสำเร็จ/)
      .waitFor({ state: "visible", timeout: 15_000 })
      .catch(() => {});

    // Back to the arrange grid; the placement renders with a remove button.
    await page.goto(
      `/schedule/${semester}/arrange?teacher=${teacherId}&tab=teacher`,
    );
    await expect(page.getByTestId("timetable-grid")).toBeVisible({
      timeout: 30_000,
    });
    const card = page.locator(
      `[data-testid="timeslot-card"][data-timeslot-id="${timeslotId}"]`,
    );
    await expect(card).toHaveAttribute("data-subject-code", /.+/, {
      timeout: 15_000,
    });

    // Act — remove the placed subject
    await card.getByTestId("timeslot-remove").click();

    // Assert — timeslot is empty again
    await expect(card).not.toHaveAttribute("data-subject-code", /.+/, {
      timeout: 15_000,
    });
  });

  test("should save schedule changes successfully", async ({ arrangePage }) => {
    // This test verifies that creating a schedule entry via room selection
    // persists correctly and shows up in the timetable grid.
    //
    // Instead of drag-and-drop (which is flaky in headless CI due to
    // @dnd-kit activation constraints), we navigate directly to the
    // room-select URL — the same approach used by the passing AR-ROOM test
    // in 21-arrangement-flow.spec.ts.

    const page = arrangePage.page;
    const semester = `${testSemester.Year}/${testSemester.Semester}`;
    const subjectCode = testTeacher.SubjectCode; // ค21201
    const gradeId = testTeacher.GradeID; // M1-1
    // Resolve the real teacher id (fixture pins by email only) and a slot
    // guaranteed empty for this grade so the create actually persists.
    const teacherId = await getE2ETeacherId(page);
    const timeslotId = await getGradeFreeTimeslot(
      page,
      gradeId,
      testSemester.Year,
      testSemester.Semester,
    );

    // Step 1: Navigate to arrange page with teacher pre-selected
    await page.goto(
      `/schedule/${semester}/arrange?teacher=${teacherId}&tab=teacher`,
    );
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByTestId("timetable-grid")).toBeVisible({ timeout: 30_000 });

    // Step 2: Extract RespID from palette (needed to link schedule to teacher)
    const subjectItem = page.locator(
      `[data-testid="subject-item"][data-subject-code="${subjectCode}"]`,
    );
    await expect(subjectItem.first()).toBeVisible({ timeout: 15_000 });
    const respId = await subjectItem.first().getAttribute("data-resp-id");

    // Step 3: Navigate directly to room-select URL (bypasses flaky drag-and-drop)
    const params = new URLSearchParams({
      timeslot: timeslotId,
      subject: subjectCode,
      grade: gradeId,
      teacher: String(teacherId),
      ...(respId ? { resp: respId } : {}),
    });
    const roomSelectUrl = `/schedule/${semester}/arrange/room-select?${params}`;
    await page.goto(roomSelectUrl);
    await page.waitForLoadState("domcontentloaded");

    // Step 4: Wait for room dialog/page and select first available room
    const roomOptions = page.locator(
      '[data-testid^="room-option-"]:not([disabled])',
    );
    await expect(roomOptions.first()).toBeVisible({ timeout: 15_000 });

    // Click the first room — server action creates the schedule entry
    await Promise.all([
      page.waitForResponse(
        (resp) => resp.request().method() === "POST" && resp.status() < 400,
        { timeout: 15_000 },
      ).catch(() => null),
      roomOptions.first().click({ timeout: 5_000 }),
    ]);

    // Wait for success feedback (snackbar) before navigating
    await page
      .getByText(/จัดตารางสอนสำเร็จ/)
      .waitFor({ state: "visible", timeout: 10_000 })
      .catch(() => {}); // Non-blocking — some flows navigate immediately

    // Step 5: Navigate back to arrange page with same teacher
    await page.goto(
      `/schedule/${semester}/arrange?teacher=${teacherId}&tab=teacher`,
    );
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByTestId("timetable-grid")).toBeVisible({ timeout: 30_000 });

    // Step 6: Assert the schedule entry appears in the grid
    const card = page.locator(
      `[data-testid="timeslot-card"][data-timeslot-id="${timeslotId}"]`,
    );
    await expect(card).toHaveAttribute("data-subject-code", subjectCode, {
      timeout: 15_000,
    });
  });
});

test.describe("Admin: Schedule Assignment - Cross-Semester Navigation", () => {
  test.skip(
    !RUN_SCHEDULE_ASSIGNMENT_EXTENDED,
    "Set E2E_SCHEDULE_ASSIGNMENT_EXTENDED=true to run extended schedule assignment tests",
  );
    test.beforeEach(async ({ arrangePage }) => {
      await arrangePage.navigateTo("1", "2568");
      // Don't wait for page ready yet - tests will select teacher first
    });

    test("should detect teacher double-booking conflict", async ({
      arrangePage,
    }) => {
      // Arrange
      const teacherName = getTeacherName(testTeacher.TeacherID);
      await arrangePage.selectTeacher(teacherName);

      // Get first available subject
      const availableSubjects = await arrangePage.getAvailableSubjects();
      expect(availableSubjects.length).toBeGreaterThan(0);
      const subjectCode = availableSubjects[0]!;

      // Act - Assign first subject to Monday Period 1
      const { row, col } = getTimeslotCoords("MON", 1);
      await arrangePage.dragSubjectToTimeslot(subjectCode, row, col);
      await arrangePage.selectRoom("ห้อง 101");

      // Try to assign another subject to the same timeslot (teacher conflict!)
      await arrangePage.dragSubjectToTimeslot("TH21102", row, col);

      // Assert
      const hasTeacherConflict = await arrangePage.hasConflict("teacher");
      expect(hasTeacherConflict).toBe(true);

      const message = await arrangePage.getConflictMessage();
      expect(message).toContain("ครูสอนซ้ำซ้อน"); // Thai: Teacher conflict
    });

    test("should detect room double-booking conflict", async ({
      arrangePage,
    }) => {
      // Arrange - Assign first teacher's subject
      const teacher1Name = getTeacherName(1);
      await arrangePage.selectTeacher(teacher1Name);

      const { row, col } = getTimeslotCoords("MON", 1);
      await arrangePage.dragSubjectToTimeslot("TH101", row, col);
      await arrangePage.selectRoom("ห้อง 101");

      // Act - Different teacher, same room, same time
      const teacher2Name = getTeacherName(11);
      await arrangePage.selectTeacher(teacher2Name);
      await arrangePage.dragSubjectToTimeslot("MA201", row, col);
      await arrangePage.selectRoom("ห้อง 101"); // Same room!

      // Assert
      const hasRoomConflict = await arrangePage.hasConflict("room");
      expect(hasRoomConflict).toBe(true);

      const message = await arrangePage.getConflictMessage();
      expect(message).toContain("ห้องเรียนซ้ำซ้อน"); // Thai: Room conflict
    });

    test("should prevent assignment to locked timeslot", async ({
      arrangePage,
    }) => {
      // Arrange - Lock a timeslot first
      const { row, col } = getTimeslotCoords("MON", 1);
      await arrangePage.lockTimeslot(row, col);

      // Act - Try to assign to locked slot
      const teacherName = getTeacherName(1);
      await arrangePage.selectTeacher(teacherName);
      await arrangePage.dragSubjectToTimeslot("TH101", row, col);

      // Assert
      const hasLockedConflict = await arrangePage.hasConflict("locked");
      expect(hasLockedConflict).toBe(true);

      const message = await arrangePage.getConflictMessage();
      expect(message).toContain("ช่วงเวลาถูกล็อก"); // Thai: Locked timeslot
    });

    test("should prevent assignment during break time", async ({
      arrangePage,
    }) => {
      // Arrange
      const teacherName = getTeacherName(1);
      await arrangePage.selectTeacher(teacherName);

      // Act - Try to assign to period 4 (lunch break)
      const { row, col } = getTimeslotCoords("MON", 4);
      await arrangePage.dragSubjectToTimeslot("TH101", row, col);

      // Assert
      const hasBreakConflict = await arrangePage.hasConflict("break");
      expect(hasBreakConflict).toBe(true);

      const message = await arrangePage.getConflictMessage();
      expect(message).toContain("พัก"); // Thai: Break time
    });
  },
);

test.describe("Admin: Schedule Assignment - Timeslot Locking", () => {
  test.skip(
    !RUN_SCHEDULE_ASSIGNMENT_EXTENDED,
    "Set E2E_SCHEDULE_ASSIGNMENT_EXTENDED=true to run extended schedule assignment tests",
  );
  test.beforeEach(async ({ arrangePage }) => {
    await arrangePage.navigateTo("1", "2568");
    // Don't wait for page ready yet - tests will select teacher first
  });

  test("should lock timeslot for school-wide activity", async ({
    arrangePage,
  }) => {
    // Act
    const { row, col } = getTimeslotCoords("MON", 1);
    await arrangePage.lockTimeslot(row, col);

    // Assert
    const isLocked = await arrangePage.isTimeslotLocked(row, col);
    expect(isLocked).toBe(true);
  });

  test("should unlock previously locked timeslot", async ({ arrangePage }) => {
    // Arrange
    const { row, col } = getTimeslotCoords("MON", 1);
    await arrangePage.lockTimeslot(row, col);

    // Act
    await arrangePage.unlockTimeslot(row, col);

    // Assert
    const isLocked = await arrangePage.isTimeslotLocked(row, col);
    expect(isLocked).toBe(false);
  });

  test("should allow assignment after unlocking timeslot", async ({
    arrangePage,
  }) => {
    // Arrange
    const { row, col } = getTimeslotCoords("MON", 1);
    await arrangePage.lockTimeslot(row, col);
    await arrangePage.unlockTimeslot(row, col);

    // Act
    const teacherName = getTeacherName(1);
    await arrangePage.selectTeacher(teacherName);
    await arrangePage.dragSubjectToTimeslot("TH101", row, col);
    await arrangePage.selectRoom("ห้อง 101");

    // Assert
    const conflict = await arrangePage.getConflictMessage();
    expect(conflict).toBeNull();
  });
});

test.describe("Admin: Schedule Assignment - Export Functionality", () => {
  test.skip(
    !RUN_SCHEDULE_ASSIGNMENT_EXTENDED,
    "Set E2E_SCHEDULE_ASSIGNMENT_EXTENDED=true to run extended schedule assignment tests",
  );
  test.beforeEach(async ({ arrangePage }) => {
    await arrangePage.navigateTo("1", "2568");
    // Don't wait for page ready yet - tests will select teacher first
  });

  test("should export schedule to Excel", async ({ arrangePage, page }) => {
    // Arrange
    const teacherName = getTeacherName(1);
    await arrangePage.selectTeacher(teacherName);

    const { row, col } = getTimeslotCoords("MON", 1);
    await arrangePage.dragSubjectToTimeslot("TH101", row, col);
    await arrangePage.selectRoom("ห้อง 101");

    // Act
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      arrangePage.exportSchedule("excel"),
    ]);

    // Assert
    expect(download.suggestedFilename()).toMatch(/.*\.xlsx$/i);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
  });

  test("should export schedule to PDF", async ({ arrangePage, page }) => {
    // Arrange
    const teacherName = getTeacherName(1);
    await arrangePage.selectTeacher(teacherName);

    const { row, col } = getTimeslotCoords("MON", 1);
    await arrangePage.dragSubjectToTimeslot("TH101", row, col);
    await arrangePage.selectRoom("ห้อง 101");

    // Act
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      arrangePage.exportSchedule("pdf"),
    ]);

    // Assert
    expect(download.suggestedFilename()).toMatch(/.*\.pdf$/i);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
  });

  test("should export schedule with multiple assignments", async ({
    arrangePage,
    page,
  }) => {
    // Arrange - Create a complete schedule
    const teacherName = getTeacherName(1);
    await arrangePage.selectTeacher(teacherName);

    const coords1 = getTimeslotCoords("MON", 1);
    await arrangePage.dragSubjectToTimeslot("TH101", coords1.row, coords1.col);
    await arrangePage.selectRoom("ห้อง 101");

    const coords2 = getTimeslotCoords("TUE", 2);
    await arrangePage.dragSubjectToTimeslot("TH102", coords2.row, coords2.col);
    await arrangePage.selectRoom("ห้อง 102");

    const coords3 = getTimeslotCoords("WED", 3);
    await arrangePage.dragSubjectToTimeslot("TH103", coords3.row, coords3.col);
    await arrangePage.selectRoom("ห้อง 103");

    // Act
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      arrangePage.exportSchedule("excel"),
    ]);

    // Assert
    expect(download.suggestedFilename()).toMatch(/.*\.xlsx$/i);

    // Optional: Could add file size check or content validation
    const assignedCount = await arrangePage.getAssignedSubjectCount();
    expect(assignedCount).toBe(3);
  });
});

test.describe(
  "Admin: Schedule Assignment - Cross-Semester Navigation (advanced)",
  () => {
    test.skip(
      !RUN_SCHEDULE_ASSIGNMENT_EXTENDED,
      "Set E2E_SCHEDULE_ASSIGNMENT_EXTENDED=true to run extended schedule assignment tests",
    );
    test("should navigate between semesters", async ({ arrangePage }) => {
      // Semester 1
      await arrangePage.navigateTo("1", "2568");
      await arrangePage.waitForPageReady();

      // Verify we're on semester 1 by checking the page URL
      expect(arrangePage.page.url()).toContain("2568/1");

      // Semester 2
      await arrangePage.navigateTo("2", "2568");
      await arrangePage.waitForPageReady();

      // Verify we're on semester 2
      expect(arrangePage.page.url()).toContain("2568/2");
    });

    test("should maintain schedule data per semester", async ({
      arrangePage,
    }) => {
      // Arrange - Assign subject in semester 1
      await arrangePage.navigateTo("1", "2568");
      await arrangePage.waitForPageReady();

      const teacherName = getTeacherName(1);
      await arrangePage.selectTeacher(teacherName);

      const { row, col } = getTimeslotCoords("MON", 1);
      await arrangePage.dragSubjectToTimeslot("TH101", row, col);
      await arrangePage.selectRoom("ห้อง 101");
      await arrangePage.saveSchedule();

      const sem1Count = await arrangePage.getAssignedSubjectCount();

      // Act - Switch to semester 2
      await arrangePage.navigateTo("2", "2568");
      await arrangePage.waitForPageReady();
      await arrangePage.selectTeacher(teacherName);

      const sem2Count = await arrangePage.getAssignedSubjectCount();

      // Assert - Schedules should be independent
      expect(sem2Count).not.toBe(sem1Count);
    });
  },
);

/**
 * Performance tests for schedule assignment operations
 *
 * These tests ensure that the UI remains responsive even with
 * complex schedules and multiple assignments.
 */
test.describe("Admin: Schedule Assignment - Performance", () => {
  test.skip(
    !RUN_SCHEDULE_ASSIGNMENT_EXTENDED,
    "Set E2E_SCHEDULE_ASSIGNMENT_EXTENDED=true to run extended schedule assignment tests",
  );
  test.beforeEach(async ({ arrangePage }) => {
    await arrangePage.navigateTo("1", "2568");
    // Don't wait for page ready yet - tests will select teacher first
  });

  test("should handle multiple rapid assignments efficiently", async ({
    arrangePage,
  }) => {
    const teacherName = getTeacherName(1);
    await arrangePage.selectTeacher(teacherName);

    // Measure time for 5 assignments
    const startTime = Date.now();

    const coords1 = getTimeslotCoords("MON", 1);
    await arrangePage.dragSubjectToTimeslot("TH101", coords1.row, coords1.col);
    await arrangePage.selectRoom("ห้อง 101");

    const coords2 = getTimeslotCoords("MON", 2);
    await arrangePage.dragSubjectToTimeslot("TH102", coords2.row, coords2.col);
    await arrangePage.selectRoom("ห้อง 102");

    const coords3 = getTimeslotCoords("TUE", 1);
    await arrangePage.dragSubjectToTimeslot("TH103", coords3.row, coords3.col);
    await arrangePage.selectRoom("ห้อง 103");

    const coords4 = getTimeslotCoords("TUE", 2);
    await arrangePage.dragSubjectToTimeslot("TH104", coords4.row, coords4.col);
    await arrangePage.selectRoom("ห้อง 104");

    const coords5 = getTimeslotCoords("WED", 1);
    await arrangePage.dragSubjectToTimeslot("TH105", coords5.row, coords5.col);
    await arrangePage.selectRoom("ห้อง 105");

    const duration = Date.now() - startTime;

    // Should complete within 30 seconds (6 seconds per assignment with room selection)
    expect(duration).toBeLessThan(30000);

    const assignedCount = await arrangePage.getAssignedSubjectCount();
    expect(assignedCount).toBe(5);
  });

  test("should load page within acceptable time", async ({ arrangePage }) => {
    const startTime = Date.now();

    await arrangePage.navigateTo("1", "2568");
    await arrangePage.waitForPageReady();

    const loadTime = Date.now() - startTime;

    // Page should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });
});
