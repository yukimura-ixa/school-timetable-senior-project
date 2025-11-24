/**
 * Domain Model: Conflict Detection
 *
 * Pure TypeScript types for conflict detection in schedule arrangement.
 * These models are independent of infrastructure (Prisma, database).
 */

/**
 * Types of conflicts that can occur when arranging schedules
 */
export enum ConflictType {
  /** Teacher is already scheduled in another class at this time */
  TEACHER_CONFLICT = "TEACHER_CONFLICT",

  /** Class (grade) already has another subject at this time */
  CLASS_CONFLICT = "CLASS_CONFLICT",

  /** Room is already occupied by another class at this time */
  ROOM_CONFLICT = "ROOM_CONFLICT",

  /** Timeslot is locked and cannot be modified */
  LOCKED_TIMESLOT = "LOCKED_TIMESLOT",

  /** Teacher is not assigned to teach this subject for this class */
  TEACHER_NOT_ASSIGNED = "TEACHER_NOT_ASSIGNED",

  /** No conflicts detected */
  NONE = "NONE",
}

/**
 * Result of a conflict check
 */
export interface ConflictResult {
  /** Whether conflicts were detected */
  hasConflict: boolean;

  /** Type of conflict (NONE if no conflict) */
  conflictType: ConflictType;

  /** Human-readable message describing the conflict */
  message: string;

  /** Optional details about the conflicting schedule */
  conflictingSchedule?: ConflictingScheduleDetails;
}

/**
 * Details about a schedule that conflicts with the proposed arrangement
 */
export interface ConflictingScheduleDetails {
  /** The class ID of the conflicting schedule */
  classId?: string;

  /** The subject code of the conflicting schedule */
  subjectCode?: string;

  /** The subject name of the conflicting schedule */
  subjectName?: string;

  /** The room ID of the conflicting schedule */
  roomId?: number;

  /** The room name of the conflicting schedule */
  roomName?: string;

  /** The grade ID of the conflicting class */
  gradeId?: string;

  /** The teacher ID of the conflicting teacher */
  teacherId?: number;

  /** The teacher name of the conflicting teacher */
  teacherName?: string;

  /** The timeslot ID */
  timeslotId?: string;
}

/**
 * Input data for checking a schedule arrangement
 * This represents what the user wants to schedule
 */
export interface ScheduleArrangementInput {
  /** Unique identifier for the class period */
  classId: string;

  /** The timeslot to schedule in */
  timeslotId: string;

  /** The subject being taught */
  subjectCode: string;

  /** The room where the class will be held (optional) */
  roomId?: number | null;

  /** The class/grade level */
  gradeId: string;

  /** The teacher who will teach (from teachers_responsibility) */
  teacherId?: number;

  /** Academic year */
  academicYear: number;

  /** Semester */
  semester: string; // SEMESTER_1 or SEMESTER_2
}

/**
 * Existing schedule data for conflict checking
 * This represents schedules already in the database
 */
export interface ExistingSchedule {
  classId: string;
  timeslotId: string;
  subjectCode: string;
  subjectName: string;
  roomId: number | null;
  roomName?: string;
  gradeId: string;
  isLocked: boolean;
  teacherId?: number;
  teacherName?: string;
}

/**
 * Teacher responsibility data
 * Represents which teachers are assigned to teach which subjects for which grades
 */
export interface TeacherResponsibility {
  respId: number;
  teacherId: number;
  gradeId: string;
  subjectCode: string;
  academicYear: number;
  semester: string;
  teachHour: number;
}
