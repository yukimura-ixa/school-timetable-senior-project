/**
 * Tests for Conflict Detection Service
 *
 * Table-driven tests for all conflict detection scenarios.
 * Target: 100% coverage for critical business logic.
 */

import {
  checkTeacherConflict,
  checkClassConflict,
  checkRoomConflict,
  checkLockedTimeslot,
  checkTeacherAssignment,
  checkAllConflicts,
} from "../services/conflict-detector.service";
import {
  ConflictType,
  ExistingSchedule,
  ScheduleArrangementInput,
  TeacherResponsibility,
} from "../models/conflict.model";

describe("Conflict Detection Service", () => {
  // Test data fixtures
  const mockExistingSchedules: ExistingSchedule[] = [
    {
      classId: "C1",
      timeslotId: "T1",
      subjectCode: "MATH101",
      subjectName: "Mathematics 101",
      roomId: 101,
      roomName: "Room 101",
      gradeId: "M1-1",
      isLocked: false,
      teacherId: 1,
      teacherName: "John Doe",
    },
    {
      classId: "C2",
      timeslotId: "T2",
      subjectCode: "ENG101",
      subjectName: "English 101",
      roomId: 102,
      roomName: "Room 102",
      gradeId: "M1-2",
      isLocked: false,
      teacherId: 2,
      teacherName: "Jane Smith",
    },
    {
      classId: "C3",
      timeslotId: "T3",
      subjectCode: "ASSEMBLY",
      subjectName: "School Assembly",
      roomId: null,
      gradeId: "M1-1",
      isLocked: true,
      teacherId: undefined,
      teacherName: undefined,
    },
  ];

  const mockResponsibilities: TeacherResponsibility[] = [
    {
      respId: 1,
      teacherId: 1,
      gradeId: "M1-1",
      subjectCode: "MATH101",
      academicYear: 2566,
      semester: "SEMESTER_1",
      teachHour: 4,
    },
    {
      respId: 2,
      teacherId: 2,
      gradeId: "M1-2",
      subjectCode: "ENG101",
      academicYear: 2566,
      semester: "SEMESTER_1",
      teachHour: 3,
    },
    {
      respId: 3,
      teacherId: 1,
      gradeId: "M1-2",
      subjectCode: "MATH101",
      academicYear: 2566,
      semester: "SEMESTER_1",
      teachHour: 4,
    },
  ];

  describe("checkTeacherConflict", () => {
    it("should detect teacher conflict when teacher is already scheduled", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T1", // Same time as C1
        subjectCode: "MATH101",
        roomId: 103,
        gradeId: "M1-2",
        teacherId: 1, // Same teacher as C1
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkTeacherConflict(input, mockExistingSchedules);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe(ConflictType.TEACHER_CONFLICT);
      expect(result.message).toContain("John Doe");
      expect(result.message).toContain("Mathematics 101");
      expect(result.conflictingSchedule?.teacherId).toBe(1);
    });

    it("should allow scheduling when teacher is not conflicted", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T4", // Different time
        subjectCode: "MATH101",
        roomId: 103,
        gradeId: "M1-2",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkTeacherConflict(input, mockExistingSchedules);

      expect(result.hasConflict).toBe(false);
      expect(result.conflictType).toBe(ConflictType.NONE);
    });

    it("should allow updating same schedule (same classId)", () => {
      const input: ScheduleArrangementInput = {
        classId: "C1", // Same classId - updating existing schedule
        timeslotId: "T1",
        subjectCode: "MATH101",
        roomId: 103,
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkTeacherConflict(input, mockExistingSchedules);

      expect(result.hasConflict).toBe(false);
      expect(result.conflictType).toBe(ConflictType.NONE);
    });

    it("should return no conflict when no teacher is assigned", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T1",
        subjectCode: "MATH101",
        roomId: 103,
        gradeId: "M1-2",
        teacherId: undefined, // No teacher
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkTeacherConflict(input, mockExistingSchedules);

      expect(result.hasConflict).toBe(false);
      expect(result.message).toBe("No teacher assigned");
    });
  });

  describe("checkClassConflict", () => {
    it("should detect class conflict when class already has another subject", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T1", // Same time as C1
        subjectCode: "ENG101",
        roomId: 103,
        gradeId: "M1-1", // Same grade as C1
        teacherId: 2,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkClassConflict(input, mockExistingSchedules);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe(ConflictType.CLASS_CONFLICT);
      expect(result.message).toContain("M1-1");
      expect(result.message).toContain("Mathematics 101");
      expect(result.conflictingSchedule?.gradeId).toBe("M1-1");
    });

    it("should allow scheduling when class is not conflicted", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T4", // Different time
        subjectCode: "ENG101",
        roomId: 103,
        gradeId: "M1-1",
        teacherId: 2,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkClassConflict(input, mockExistingSchedules);

      expect(result.hasConflict).toBe(false);
      expect(result.conflictType).toBe(ConflictType.NONE);
    });

    it("should allow updating same schedule", () => {
      const input: ScheduleArrangementInput = {
        classId: "C1", // Same classId
        timeslotId: "T1",
        subjectCode: "MATH101",
        roomId: 101,
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkClassConflict(input, mockExistingSchedules);

      expect(result.hasConflict).toBe(false);
    });
  });

  describe("checkRoomConflict", () => {
    it("should detect room conflict when room is already occupied", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T1", // Same time as C1
        subjectCode: "ENG101",
        roomId: 101, // Same room as C1
        gradeId: "M1-2",
        teacherId: 2,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkRoomConflict(input, mockExistingSchedules);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe(ConflictType.ROOM_CONFLICT);
      expect(result.message).toContain("Room 101");
      expect(result.message).toContain("M1-1");
      expect(result.conflictingSchedule?.roomId).toBe(101);
    });

    it("should allow scheduling when room is not conflicted", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T1",
        subjectCode: "ENG101",
        roomId: 999, // Different room
        gradeId: "M1-2",
        teacherId: 2,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkRoomConflict(input, mockExistingSchedules);

      expect(result.hasConflict).toBe(false);
      expect(result.conflictType).toBe(ConflictType.NONE);
    });

    it("should return no conflict when no room is assigned", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T1",
        subjectCode: "ENG101",
        roomId: null, // No room
        gradeId: "M1-2",
        teacherId: 2,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkRoomConflict(input, mockExistingSchedules);

      expect(result.hasConflict).toBe(false);
      expect(result.message).toBe("No room assigned");
    });

    it("should allow updating same schedule", () => {
      const input: ScheduleArrangementInput = {
        classId: "C1", // Same classId
        timeslotId: "T1",
        subjectCode: "MATH101",
        roomId: 101,
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkRoomConflict(input, mockExistingSchedules);

      expect(result.hasConflict).toBe(false);
    });
  });

  describe("checkLockedTimeslot", () => {
    it("should detect locked timeslot conflict", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T3", // Locked timeslot
        subjectCode: "MATH101",
        roomId: 101,
        gradeId: "M1-1", // Same grade as locked schedule
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkLockedTimeslot(input, mockExistingSchedules);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe(ConflictType.LOCKED_TIMESLOT);
      expect(result.message).toContain("locked");
      expect(result.message).toContain("M1-1");
      expect(result.conflictingSchedule?.subjectName).toBe("School Assembly");
    });

    it("should allow scheduling when timeslot is not locked", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T1", // Not locked
        subjectCode: "MATH101",
        roomId: 103,
        gradeId: "M1-2",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkLockedTimeslot(input, mockExistingSchedules);

      expect(result.hasConflict).toBe(false);
    });

    it("should allow updating same locked schedule", () => {
      const input: ScheduleArrangementInput = {
        classId: "C3", // Same locked schedule
        timeslotId: "T3",
        subjectCode: "ASSEMBLY",
        roomId: null,
        gradeId: "M1-1",
        teacherId: undefined,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkLockedTimeslot(input, mockExistingSchedules);

      expect(result.hasConflict).toBe(false);
    });
  });

  describe("checkTeacherAssignment", () => {
    it("should detect when teacher is not assigned to subject/grade", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T4",
        subjectCode: "SCIENCE101", // Not assigned
        roomId: 103,
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkTeacherAssignment(input, mockResponsibilities);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe(ConflictType.TEACHER_NOT_ASSIGNED);
      expect(result.message).toContain("not assigned");
      expect(result.message).toContain("SCIENCE101");
    });

    it("should allow when teacher is properly assigned", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T4",
        subjectCode: "MATH101", // Teacher 1 is assigned to this
        roomId: 103,
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkTeacherAssignment(input, mockResponsibilities);

      expect(result.hasConflict).toBe(false);
      expect(result.conflictType).toBe(ConflictType.NONE);
    });

    it("should return no conflict when no teacher is assigned", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T4",
        subjectCode: "MATH101",
        roomId: 103,
        gradeId: "M1-1",
        teacherId: undefined,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkTeacherAssignment(input, mockResponsibilities);

      expect(result.hasConflict).toBe(false);
      expect(result.message).toBe("No teacher assigned");
    });

    it("should check academic year and semester match", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T4",
        subjectCode: "MATH101",
        roomId: 103,
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2567, // Different year
        semester: "SEMESTER_1",
      };

      const result = checkTeacherAssignment(input, mockResponsibilities);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe(ConflictType.TEACHER_NOT_ASSIGNED);
    });
  });

  describe("checkAllConflicts", () => {
    it("should return first conflict in priority order: locked timeslot", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T3", // Locked
        subjectCode: "MATH101",
        roomId: 101, // Would also conflict
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkAllConflicts(
        input,
        mockExistingSchedules,
        mockResponsibilities,
      );

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe(ConflictType.LOCKED_TIMESLOT);
    });

    it("should return teacher not assigned if no locked conflict", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T4",
        subjectCode: "SCIENCE101", // Not assigned
        roomId: 103,
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkAllConflicts(
        input,
        mockExistingSchedules,
        mockResponsibilities,
      );

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe(ConflictType.TEACHER_NOT_ASSIGNED);
    });

    it("should return class conflict if higher priority checks pass", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T1", // M1-1 already has MATH101
        subjectCode: "MATH101",
        roomId: 103,
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkAllConflicts(
        input,
        mockExistingSchedules,
        mockResponsibilities,
      );

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe(ConflictType.CLASS_CONFLICT);
    });

    it("should return teacher conflict if class check passes", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T1", // Teacher 1 teaching M1-1
        subjectCode: "MATH101",
        roomId: 103,
        gradeId: "M1-2", // Different grade (no class conflict)
        teacherId: 1, // Same teacher (teacher conflict)
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkAllConflicts(
        input,
        mockExistingSchedules,
        mockResponsibilities,
      );

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe(ConflictType.TEACHER_CONFLICT);
    });

    it("should return room conflict as lowest priority", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T2", // Teacher 2 teaching M1-2 in Room 102
        subjectCode: "MATH101",
        roomId: 102, // Room conflict only
        gradeId: "M1-1", // Different grade
        teacherId: 1, // Different teacher, but assigned to MATH101/M1-1
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkAllConflicts(
        input,
        mockExistingSchedules,
        mockResponsibilities,
      );

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe(ConflictType.ROOM_CONFLICT);
    });

    it("should return no conflict when all checks pass", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T4", // Empty timeslot
        subjectCode: "MATH101",
        roomId: 999, // Empty room
        gradeId: "M1-2",
        teacherId: 1, // Assigned to MATH101/M1-2
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkAllConflicts(
        input,
        mockExistingSchedules,
        mockResponsibilities,
      );

      expect(result.hasConflict).toBe(false);
      expect(result.conflictType).toBe(ConflictType.NONE);
      expect(result.message).toContain("No conflicts");
    });

    it("should allow scheduling without teacher or room", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T4",
        subjectCode: "MATH101",
        roomId: undefined,
        gradeId: "M1-3", // New class
        teacherId: undefined,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkAllConflicts(
        input,
        mockExistingSchedules,
        mockResponsibilities,
      );

      expect(result.hasConflict).toBe(false);
    });
  });

  // Edge cases
  describe("Edge Cases", () => {
    it("should handle empty existing schedules - still checks teacher assignment", () => {
      const input: ScheduleArrangementInput = {
        classId: "C1",
        timeslotId: "T1",
        subjectCode: "MATH101",
        roomId: 101,
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkAllConflicts(input, [], mockResponsibilities);

      // No existing schedules = no conflicts, teacher IS assigned in mockResponsibilities
      expect(result.hasConflict).toBe(false);
      expect(result.conflictType).toBe(ConflictType.NONE);
    });

    it("should handle empty responsibilities", () => {
      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T4",
        subjectCode: "MATH101",
        roomId: 103,
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkAllConflicts(input, mockExistingSchedules, []);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe(ConflictType.TEACHER_NOT_ASSIGNED);
    });

    it("should handle schedule with null roomId and undefined teacherId", () => {
      const schedules: ExistingSchedule[] = [
        {
          classId: "C1",
          timeslotId: "T1",
          subjectCode: "ASSEMBLY",
          subjectName: "Assembly",
          roomId: null,
          gradeId: "M1-1",
          isLocked: false,
          teacherId: undefined,
        },
      ];

      const input: ScheduleArrangementInput = {
        classId: "C_NEW",
        timeslotId: "T1",
        subjectCode: "MATH101",
        roomId: null,
        gradeId: "M1-1",
        teacherId: undefined,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };

      const result = checkAllConflicts(input, schedules, []);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe(ConflictType.CLASS_CONFLICT);
    });
  });
});
