import { test, expect } from '@/e2e/fixtures/admin.fixture';
import { testSemester, testTeacher, testSubject } from '@/e2e/fixtures/seed-data.fixture';

/**
 * E2E Tests for Admin Schedule Assignment Flow
 * 
 * Tests cover:
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

test.describe('Admin: Schedule Assignment - Basic Operations', () => {
  test.beforeEach(async ({ scheduleAssignmentPage }) => {
    await scheduleAssignmentPage.goto(testSemester.SemesterAndyear);
    await scheduleAssignmentPage.waitForPageReady();
  });

  test('should successfully assign subject to empty timeslot', async ({ scheduleAssignmentPage }) => {
    // Arrange
    await scheduleAssignmentPage.selectTeacher(testTeacher.TeacherID.toString());

    // Act
    await scheduleAssignmentPage.dragSubjectToTimeslot(testSubject.SubjectCode, 'MON', 1);

    // Assert
    const conflict = await scheduleAssignmentPage.getConflictMessage();
    expect(conflict).toBeNull();

    const assignedCount = await scheduleAssignmentPage.getAssignedSubjectCount();
    expect(assignedCount).toBeGreaterThan(0);
  });

  test('should display available subjects for selected teacher', async ({ scheduleAssignmentPage }) => {
    // Arrange & Act
    await scheduleAssignmentPage.selectTeacher(testTeacher.TeacherID.toString());

    // Assert
    const subjects = await scheduleAssignmentPage.getAvailableSubjects();
    expect(subjects.length).toBeGreaterThan(0);
    expect(subjects).toContain(testSubject.SubjectCode);
  });

  test('should allow removing subject from timeslot', async ({ scheduleAssignmentPage }) => {
    // Arrange
    await scheduleAssignmentPage.selectTeacher(testTeacher.TeacherID.toString());
    await scheduleAssignmentPage.dragSubjectToTimeslot(testSubject.SubjectCode, 'MON', 1);

    // Act
    await scheduleAssignmentPage.removeSubjectFromTimeslot('MON', 1);

    // Assert
    const assignedCount = await scheduleAssignmentPage.getAssignedSubjectCount();
    expect(assignedCount).toBe(0);
  });

  test('should save schedule changes successfully', async ({ scheduleAssignmentPage }) => {
    // Arrange
    await scheduleAssignmentPage.selectTeacher(testTeacher.TeacherID.toString());
    await scheduleAssignmentPage.dragSubjectToTimeslot(testSubject.SubjectCode, 'MON', 1);

    // Act
    await scheduleAssignmentPage.saveSchedule();

    // Assert - page should not show error indicator
    const conflict = await scheduleAssignmentPage.getConflictMessage();
    expect(conflict).not.toContain('ล้มเหลว'); // Thai: Failed
  });
});

test.describe('Admin: Schedule Assignment - Conflict Detection', () => {
  test.beforeEach(async ({ scheduleAssignmentPage }) => {
    await scheduleAssignmentPage.goto(testSemester.SemesterAndyear);
    await scheduleAssignmentPage.waitForPageReady();
  });

  test('should detect teacher double-booking conflict', async ({ scheduleAssignmentPage }) => {
    // Arrange
    await scheduleAssignmentPage.selectTeacher(testTeacher.TeacherID.toString());

    // Act - Assign two subjects to same timeslot
    await scheduleAssignmentPage.dragSubjectToTimeslot(testSubject.SubjectCode, 'MON', 1);
    await scheduleAssignmentPage.dragSubjectToTimeslot('TH21102', 'MON', 1); // Conflict!

    // Assert
    const hasTeacherConflict = await scheduleAssignmentPage.hasConflict('teacher');
    expect(hasTeacherConflict).toBe(true);

    const message = await scheduleAssignmentPage.getConflictMessage();
    expect(message).toContain('ครูสอนซ้ำซ้อน'); // Thai: Teacher conflict
  });

  test('should detect room double-booking conflict', async () => {
    // Arrange
    await schedulePage.selectTeacher('TCH001');
    await schedulePage.dragSubjectToTimeslot('TH101', 'MON', 1);

    // Act - Different teacher, same room, same time
    await schedulePage.selectTeacher('TCH002');
    await schedulePage.dragSubjectToTimeslot('MA201', 'MON', 1); // Same room

    // Assert
    const hasRoomConflict = await schedulePage.hasConflict('room');
    expect(hasRoomConflict).toBe(true);

    const message = await schedulePage.getConflictMessage();
    expect(message).toContain('ห้องเรียนซ้ำซ้อน'); // Thai: Room conflict
  });

  test('should prevent assignment to locked timeslot', async () => {
    // Arrange
    await schedulePage.lockTimeslot('MON', 1);

    // Act
    await schedulePage.selectTeacher('TCH001');
    await schedulePage.dragSubjectToTimeslot('TH101', 'MON', 1);

    // Assert
    const hasLockedConflict = await schedulePage.hasConflict('locked');
    expect(hasLockedConflict).toBe(true);

    const message = await schedulePage.getConflictMessage();
    expect(message).toContain('ช่วงเวลาถูกล็อก'); // Thai: Locked timeslot
  });

  test('should prevent assignment during break time', async ({ page }) => {
    // Arrange
    await schedulePage.selectTeacher('TCH001');

    // Act - Try to assign to period 4 (lunch break)
    await schedulePage.dragSubjectToTimeslot('TH101', 'MON', 4);

    // Assert
    const hasBreakConflict = await schedulePage.hasConflict('break');
    expect(hasBreakConflict).toBe(true);

    const message = await schedulePage.getConflictMessage();
    expect(message).toContain('พัก'); // Thai: Break time
  });
});

test.describe('Admin: Schedule Assignment - Timeslot Locking', () => {
  let schedulePage: ScheduleAssignmentPage;

  test.beforeEach(async ({ page }) => {
    schedulePage = new ScheduleAssignmentPage(page);
    await schedulePage.goto('1-2567');
    await schedulePage.waitForPageReady();
  });

  test('should lock timeslot for school-wide activity', async () => {
    // Act
    await schedulePage.lockTimeslot('MON', 1);

    // Assert
    const isLocked = await schedulePage.isTimeslotLocked('MON', 1);
    expect(isLocked).toBe(true);
  });

  test('should unlock previously locked timeslot', async () => {
    // Arrange
    await schedulePage.lockTimeslot('MON', 1);

    // Act
    await schedulePage.unlockTimeslot('MON', 1);

    // Assert
    const isLocked = await schedulePage.isTimeslotLocked('MON', 1);
    expect(isLocked).toBe(false);
  });

  test('should allow assignment after unlocking timeslot', async () => {
    // Arrange
    await schedulePage.lockTimeslot('MON', 1);
    await schedulePage.unlockTimeslot('MON', 1);

    // Act
    await schedulePage.selectTeacher('TCH001');
    await schedulePage.dragSubjectToTimeslot('TH101', 'MON', 1);

    // Assert
    const conflict = await schedulePage.getConflictMessage();
    expect(conflict).toBeNull();
  });
});

test.describe('Admin: Schedule Assignment - Export Functionality', () => {
  let schedulePage: ScheduleAssignmentPage;

  test.beforeEach(async ({ page }) => {
    schedulePage = new ScheduleAssignmentPage(page);
    await schedulePage.goto('1-2567');
    await schedulePage.waitForPageReady();
  });

  test('should export schedule to Excel', async ({ page }) => {
    // Arrange
    await schedulePage.selectTeacher('TCH001');
    await schedulePage.dragSubjectToTimeslot('TH101', 'MON', 1);

    // Act
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      schedulePage.exportSchedule('excel'),
    ]);

    // Assert
    expect(download.suggestedFilename()).toMatch(/.*\.xlsx$/i);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
  });

  test('should export schedule to PDF', async ({ page }) => {
    // Arrange
    await schedulePage.selectTeacher('TCH001');
    await schedulePage.dragSubjectToTimeslot('TH101', 'MON', 1);

    // Act
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      schedulePage.exportSchedule('pdf'),
    ]);

    // Assert
    expect(download.suggestedFilename()).toMatch(/.*\.pdf$/i);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
  });

  test('should export schedule with multiple assignments', async ({ page }) => {
    // Arrange - Create a complete schedule
    await schedulePage.selectTeacher('TCH001');
    await schedulePage.dragSubjectToTimeslot('TH101', 'MON', 1);
    await schedulePage.dragSubjectToTimeslot('TH102', 'TUE', 2);
    await schedulePage.dragSubjectToTimeslot('TH103', 'WED', 3);

    // Act
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      schedulePage.exportSchedule('excel'),
    ]);

    // Assert
    expect(download.suggestedFilename()).toMatch(/.*\.xlsx$/i);

    // Optional: Could add file size check or content validation
    const assignedCount = await schedulePage.getAssignedSubjectCount();
    expect(assignedCount).toBe(3);
  });
});

test.describe('Admin: Schedule Assignment - Cross-Semester Navigation', () => {
  let schedulePage: ScheduleAssignmentPage;

  test.beforeEach(async ({ page }) => {
    schedulePage = new ScheduleAssignmentPage(page);
  });

  test('should navigate between semesters', async () => {
    // Semester 1
    await schedulePage.goto('1-2567');
    await schedulePage.waitForPageReady();

    let currentSemester = await schedulePage.getCurrentSemester();
    expect(currentSemester).toBe('1-2567');

    // Semester 2
    await schedulePage.goto('2-2567');
    await schedulePage.waitForPageReady();

    currentSemester = await schedulePage.getCurrentSemester();
    expect(currentSemester).toBe('2-2567');
  });

  test('should maintain schedule data per semester', async () => {
    // Arrange - Assign subject in semester 1
    await schedulePage.goto('1-2567');
    await schedulePage.waitForPageReady();
    await schedulePage.selectTeacher('TCH001');
    await schedulePage.dragSubjectToTimeslot('TH101', 'MON', 1);
    await schedulePage.saveSchedule();

    const sem1Count = await schedulePage.getAssignedSubjectCount();

    // Act - Switch to semester 2
    await schedulePage.goto('2-2567');
    await schedulePage.waitForPageReady();
    await schedulePage.selectTeacher('TCH001');

    const sem2Count = await schedulePage.getAssignedSubjectCount();

    // Assert - Schedules should be independent
    expect(sem2Count).not.toBe(sem1Count);
  });
});

/**
 * Performance tests for schedule assignment operations
 * 
 * These tests ensure that the UI remains responsive even with
 * complex schedules and multiple assignments.
 */
test.describe('Admin: Schedule Assignment - Performance', () => {
  let schedulePage: ScheduleAssignmentPage;

  test.beforeEach(async ({ page }) => {
    schedulePage = new ScheduleAssignmentPage(page);
    await schedulePage.goto('1-2567');
    await schedulePage.waitForPageReady();
  });

  test('should handle multiple rapid assignments efficiently', async () => {
    await schedulePage.selectTeacher('TCH001');

    // Measure time for 5 assignments
    const startTime = Date.now();

    await schedulePage.dragSubjectToTimeslot('TH101', 'MON', 1);
    await schedulePage.dragSubjectToTimeslot('TH102', 'MON', 2);
    await schedulePage.dragSubjectToTimeslot('TH103', 'TUE', 1);
    await schedulePage.dragSubjectToTimeslot('TH104', 'TUE', 2);
    await schedulePage.dragSubjectToTimeslot('TH105', 'WED', 1);

    const duration = Date.now() - startTime;

    // Should complete within 15 seconds (3 seconds per assignment)
    expect(duration).toBeLessThan(15000);

    const assignedCount = await schedulePage.getAssignedSubjectCount();
    expect(assignedCount).toBe(5);
  });

  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    const newSchedulePage = new ScheduleAssignmentPage(page);
    await newSchedulePage.goto('1-2567');
    await newSchedulePage.waitForPageReady();

    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
