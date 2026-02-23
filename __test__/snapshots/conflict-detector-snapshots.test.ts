/**
 * Snapshot Tests – Conflict Detector Service
 *
 * Inline snapshots for ConflictResult objects returned by each detector.
 * Catches changes to conflict messages, types, or result shapes.
 *
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";

import {
  checkTeacherConflict,
  checkClassConflict,
  checkRoomConflict,
  checkLockedTimeslot,
  checkTeacherAssignment,
  checkAllConflicts,
} from "@/features/schedule-arrangement/domain/services/conflict-detector.service";
import {
  ConflictType,
  type ExistingSchedule,
  type ScheduleArrangementInput,
  type TeacherResponsibility,
} from "@/features/schedule-arrangement/domain/models/conflict.model";

// ---------- Fixtures ----------

const schedules: ExistingSchedule[] = [
  {
    classId: 1,
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
    classId: 2,
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
    classId: 3,
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

const responsibilities: TeacherResponsibility[] = [
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
];

// ---------- Snapshots ----------

describe("Conflict Detector Snapshots", () => {
  describe("checkTeacherConflict", () => {
    it("detected conflict snapshot", () => {
      const input: ScheduleArrangementInput = {
        classId: 99,
        timeslotId: "T1",
        subjectCode: "SCI101",
        roomId: 103,
        gradeId: "M1-2",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };
      const result = checkTeacherConflict(input, schedules);
      // Snapshot the full shape including message text
      expect(result).toMatchSnapshot();
    });

    it("no conflict snapshot", () => {
      const input: ScheduleArrangementInput = {
        classId: 99,
        timeslotId: "T4",
        subjectCode: "SCI101",
        roomId: 103,
        gradeId: "M1-2",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };
      expect(checkTeacherConflict(input, schedules)).toMatchSnapshot();
    });
  });

  describe("checkClassConflict", () => {
    it("detected conflict snapshot", () => {
      const input: ScheduleArrangementInput = {
        classId: 99,
        timeslotId: "T1",
        subjectCode: "ENG101",
        roomId: 103,
        gradeId: "M1-1",
        teacherId: 2,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };
      expect(checkClassConflict(input, schedules)).toMatchSnapshot();
    });

    it("no conflict snapshot", () => {
      const input: ScheduleArrangementInput = {
        classId: 99,
        timeslotId: "T4",
        subjectCode: "ENG101",
        roomId: 103,
        gradeId: "M1-1",
        teacherId: 2,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };
      expect(checkClassConflict(input, schedules)).toMatchSnapshot();
    });
  });

  describe("checkRoomConflict", () => {
    it("detected conflict snapshot", () => {
      const input: ScheduleArrangementInput = {
        classId: 99,
        timeslotId: "T1",
        subjectCode: "ENG101",
        roomId: 101,
        gradeId: "M1-2",
        teacherId: 2,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };
      expect(checkRoomConflict(input, schedules)).toMatchSnapshot();
    });

    it("no room assigned (no conflict)", () => {
      const input: ScheduleArrangementInput = {
        classId: 99,
        timeslotId: "T1",
        subjectCode: "ENG101",
        roomId: undefined,
        gradeId: "M1-2",
        teacherId: 2,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };
      expect(checkRoomConflict(input, schedules)).toMatchSnapshot();
    });
  });

  describe("checkLockedTimeslot", () => {
    it("locked timeslot detected snapshot", () => {
      const input: ScheduleArrangementInput = {
        classId: 99,
        timeslotId: "T3",
        subjectCode: "MATH101",
        roomId: 103,
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };
      expect(checkLockedTimeslot(input, schedules)).toMatchSnapshot();
    });

    it("unlocked timeslot snapshot", () => {
      const input: ScheduleArrangementInput = {
        classId: 99,
        timeslotId: "T1",
        subjectCode: "MATH101",
        roomId: 103,
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };
      expect(checkLockedTimeslot(input, schedules)).toMatchSnapshot();
    });
  });

  describe("checkTeacherAssignment", () => {
    it("valid assignment snapshot", () => {
      const input: ScheduleArrangementInput = {
        classId: 99,
        timeslotId: "T4",
        subjectCode: "MATH101",
        roomId: 103,
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };
      expect(
        checkTeacherAssignment(input, responsibilities),
      ).toMatchSnapshot();
    });

    it("unassigned teacher snapshot", () => {
      const input: ScheduleArrangementInput = {
        classId: 99,
        timeslotId: "T4",
        subjectCode: "PHY101",
        roomId: 103,
        gradeId: "M1-1",
        teacherId: 5,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };
      expect(
        checkTeacherAssignment(input, responsibilities),
      ).toMatchSnapshot();
    });
  });

  describe("checkAllConflicts", () => {
    it("full check with conflicts snapshot", () => {
      const input: ScheduleArrangementInput = {
        classId: 99,
        timeslotId: "T1",
        subjectCode: "SCI101",
        roomId: 101,
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };
      const result = checkAllConflicts(
        input,
        schedules,
        responsibilities,
      );
      expect(result).toMatchSnapshot();
    });

    it("full check without conflicts snapshot", () => {
      const input: ScheduleArrangementInput = {
        classId: 99,
        timeslotId: "T4",
        subjectCode: "MATH101",
        roomId: 200,
        gradeId: "M2-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1",
      };
      const result = checkAllConflicts(
        input,
        schedules,
        responsibilities,
      );
      expect(result).toMatchSnapshot();
    });
  });
});
