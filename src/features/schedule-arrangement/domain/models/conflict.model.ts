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
  classId?: number;

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
  /** Unique identifier for the class period (auto-generated for new schedules) */
  classId?: number;

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
 * Existing schedule data for conflict checking (manual arrangement).
 * This represents schedules already in the database.
 *
 * NOTE: A separate `ExistingSchedule` interface exists in
 * `arrange/domain/auto-arrange/types.ts` for the auto-arrange solver.
 * That version omits display fields and has required teacherId.
 * The two are NOT interchangeable.
 */
export interface ExistingSchedule {
  classId: number;
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

/**
 * Kinds of resolution suggestions the resolver can produce.
 */
export type ResolutionKind = "MOVE" | "RE_ROOM" | "SWAP";

export interface MoveSuggestion {
  kind: "MOVE";
  /** Target timeslot (same subject, same class, same room). */
  targetTimeslotId: string;
  rationale: string;
  confidence: number; // 0..1
}

export interface ReRoomSuggestion {
  kind: "RE_ROOM";
  /** Keep original slot, switch to this room. */
  targetRoomId: number;
  targetRoomName: string;
  rationale: string;
  confidence: number;
}

export interface SwapSuggestion {
  kind: "SWAP";
  /** Target timeslot the counterpart will be moved to, freeing up the contested slot. */
  counterpartTargetTimeslotId: string;
  /** ClassID of the schedule that will be displaced by the swap. */
  counterpartClassId: number;
  /** Subject code of the displaced schedule — for UI display. */
  counterpartSubjectCode: string;
  rationale: string;
  confidence: number;
}

export type ResolutionSuggestion =
  | MoveSuggestion
  | ReRoomSuggestion
  | SwapSuggestion;

/**
 * Lightweight room projection used by the resolver.
 */
export interface RoomOption {
  roomId: number;
  roomName: string;
}

/**
 * Lightweight timeslot projection used by the resolver.
 * Only fields the resolver actually uses are required.
 */
export interface TimeslotOption {
  timeslotId: string;
  dayOfWeek: string;
  /** Arbitrary ordering within a day; resolver uses it for distance weighting. */
  slotNumber: number;
  /** Breaks and lunches are excluded from MOVE candidates. */
  isBreaktime?: boolean;
}

/**
 * All the data the pure resolver needs. Built by the server action from
 * repository queries; the resolver itself is deterministic and I/O-free.
 */
export interface ResolutionContext {
  conflict: ConflictResult;
  attempt: ScheduleArrangementInput;
  existingSchedules: ExistingSchedule[];
  responsibilities: TeacherResponsibility[];
  availableRooms: RoomOption[];
  allTimeslots: TimeslotOption[];
}
