/**
 * Copy Config Service
 *
 * Domain service for copying timetable configurations between academic terms.
 * Contains the business logic for deep-copying all related entities:
 * - table_config (configuration JSON)
 * - timeslots
 * - teachers_responsibility (optional)
 * - class_schedule - locked and non-locked (optional)
 *
 * This service is used by copyConfigAction but extracted here for:
 * - Testability without mocking server actions
 * - Reusability across different copy scenarios
 * - Clear separation of validation (action) vs business logic (service)
 */

import { Prisma, semester } from "@/prisma/generated/client";
import type {
  table_config,
  timeslot,
  teachers_responsibility,
} from "@/prisma/generated/client";
import type { TransactionClient } from "@/lib/prisma-transaction";
import {
  parseConfigID,
  replaceConfigIDInString,
  parseSemesterEnum,
} from "./config-validation.service";

// ============================================================================
// Types
// ============================================================================

/**
 * Options for controlling which entities to copy
 */
export interface CopyConfigOptions {
  /** Copy teachers_responsibility records */
  assign: boolean;
  /** Copy locked class_schedule records (requires assign=true) */
  lock: boolean;
  /** Copy non-locked class_schedule records (requires assign=true) */
  timetable: boolean;
}

/**
 * Result of the copy operation
 */
export interface CopyConfigResult {
  /** The newly created config */
  config: table_config;
  /** Number of timeslots copied */
  timeslots: number;
  /** Number of teacher assignments copied */
  assignments: number;
  /** Number of locked schedule entries copied */
  locks: number;
  /** Number of non-locked schedule entries copied */
  timetables: number;
}

/**
 * Class schedule with responsibility relationship
 */
interface ClassScheduleWithResponsibility {
  ClassID: number;
  TimeslotID: string;
  SubjectCode: string;
  RoomID: number | null;
  GradeID: string;
  IsLocked: boolean;
  teachers_responsibility: teachers_responsibility[];
}

// ============================================================================
// Main Copy Function
// ============================================================================

/**
 * Copy an entire timetable configuration from one term to another.
 *
 * @param from - Source ConfigID (e.g., "1-2567")
 * @param to - Target ConfigID (e.g., "2-2567")
 * @param options - What to copy (assign, lock, timetable flags)
 * @param tx - Prisma transaction client
 * @returns Copy operation result with counts
 * @throws Error if source config doesn't exist
 */
export async function copyConfig(
  from: string,
  to: string,
  options: CopyConfigOptions,
  tx: TransactionClient,
): Promise<CopyConfigResult> {
  const fromParsed = parseConfigID(from);
  const toParsed = parseConfigID(to);

  const fromSemester = parseSemesterEnum(fromParsed.semester);
  const toSemester = parseSemesterEnum(toParsed.semester);

  // 1. Copy table_config
  const newConfig = await copyTableConfig(from, to, toParsed, toSemester, tx);

  // 2. Copy timeslots
  const copiedTimeslots = await copyTimeslots(
    from,
    to,
    fromParsed,
    toParsed,
    fromSemester,
    toSemester,
    tx,
  );

  let copiedAssignments = 0;
  let copiedLocks = 0;
  let copiedTimetables = 0;

  // 3. Copy teachers_responsibility (if assign flag is true)
  if (options.assign) {
    const { count, newResponsibilities } = await copyResponsibilities(
      fromParsed,
      toParsed,
      fromSemester,
      toSemester,
      tx,
    );
    copiedAssignments = count;

    // Build responsibility lookup map for schedule copying
    const respLookupMap = buildResponsibilityLookupMap(
      newResponsibilities,
      toSemester,
    );

    // 4. Copy locked class_schedule (if lock flag is true)
    if (options.lock) {
      copiedLocks = await copySchedules(
        from,
        to,
        fromParsed,
        fromSemester,
        true, // isLocked
        respLookupMap,
        tx,
      );
    }

    // 5. Copy non-locked class_schedule (if timetable flag is true)
    if (options.timetable) {
      copiedTimetables = await copySchedules(
        from,
        to,
        fromParsed,
        fromSemester,
        false, // isLocked
        respLookupMap,
        tx,
      );
    }
  }

  return {
    config: newConfig,
    timeslots: copiedTimeslots,
    assignments: copiedAssignments,
    locks: copiedLocks,
    timetables: copiedTimetables,
  };
}

// ============================================================================
// Copy Functions
// ============================================================================

/**
 * Copy the table_config record
 */
async function copyTableConfig(
  from: string,
  to: string,
  toParsed: { academicYear: number; semester: string },
  toSemester: semester,
  tx: TransactionClient,
): Promise<table_config> {
  const fromConfig: table_config | null = await tx.table_config.findUnique({
    where: { ConfigID: from },
  });

  if (!fromConfig) {
    throw new Error(`ไม่พบการตั้งค่าต้นทาง (${from})`);
  }

  const newConfig: table_config = await tx.table_config.create({
    data: {
      ConfigID: to,
      Semester: toSemester,
      AcademicYear: toParsed.academicYear,
      Config: (fromConfig.Config ?? Prisma.JsonNull) as Prisma.InputJsonValue,
    },
  });

  return newConfig;
}

/**
 * Copy all timeslots from source to target term
 */
async function copyTimeslots(
  from: string,
  to: string,
  fromParsed: { academicYear: number; semester: string },
  toParsed: { academicYear: number; semester: string },
  fromSemester: semester,
  toSemester: semester,
  tx: TransactionClient,
): Promise<number> {
  const fromSlots: timeslot[] = await tx.timeslot.findMany({
    where: {
      AcademicYear: fromParsed.academicYear,
      Semester: fromSemester,
    },
  });

  const toSlots = fromSlots.map((slot) => ({
    TimeslotID: replaceConfigIDInString(slot.TimeslotID, from, to),
    DayOfWeek: slot.DayOfWeek,
    AcademicYear: toParsed.academicYear,
    Semester: toSemester,
    StartTime: slot.StartTime,
    EndTime: slot.EndTime,
    Breaktime: slot.Breaktime,
  }));

  await tx.timeslot.createMany({
    data: toSlots,
    skipDuplicates: true,
  });

  return toSlots.length;
}

/**
 * Copy teacher responsibilities from source to target term
 */
async function copyResponsibilities(
  fromParsed: { academicYear: number; semester: string },
  toParsed: { academicYear: number; semester: string },
  fromSemester: semester,
  toSemester: semester,
  tx: TransactionClient,
): Promise<{ count: number; newResponsibilities: teachers_responsibility[] }> {
  const fromResp: teachers_responsibility[] =
    await tx.teachers_responsibility.findMany({
      where: {
        AcademicYear: fromParsed.academicYear,
        Semester: fromSemester,
      },
    });

  const toResp = fromResp.map((resp) => ({
    TeacherID: resp.TeacherID,
    GradeID: resp.GradeID,
    SubjectCode: resp.SubjectCode,
    TeachHour: resp.TeachHour,
    AcademicYear: toParsed.academicYear,
    Semester: toSemester,
  }));

  // Use skipDuplicates for idempotent operation
  const created = await tx.teachers_responsibility.createMany({
    data: toResp,
    skipDuplicates: true,
  });

  // Fetch new responsibilities for class_schedule connections
  const newResponsibilities: teachers_responsibility[] =
    await tx.teachers_responsibility.findMany({
      where: {
        AcademicYear: toParsed.academicYear,
        Semester: toSemester,
      },
    });

  return {
    count: created.count,
    newResponsibilities,
  };
}

/**
 * Copy class schedules (locked or non-locked) from source to target term
 */
async function copySchedules(
  from: string,
  to: string,
  fromParsed: { academicYear: number; semester: string },
  fromSemester: semester,
  isLocked: boolean,
  respLookupMap: Map<string, number[]>,
  tx: TransactionClient,
): Promise<number> {
  const fromSchedules: ClassScheduleWithResponsibility[] =
    await tx.class_schedule.findMany({
      where: {
        IsLocked: isLocked,
        timeslot: {
          AcademicYear: fromParsed.academicYear,
          Semester: fromSemester,
        },
      },
      include: {
        teachers_responsibility: true,
      },
    });

  // Parallel creates for better performance
  const createPromises = fromSchedules.map((schedule) =>
    createScheduleEntry(from, to, schedule, respLookupMap, isLocked, tx),
  );

  const results = await Promise.all(createPromises);
  return results.filter(Boolean).length;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build a lookup map for fast responsibility ID resolution
 * Maps "gradeId|subjectCode" -> [RespID, RespID, ...]
 */
export function buildResponsibilityLookupMap(
  responsibilities: teachers_responsibility[],
  targetSemester: semester,
): Map<string, number[]> {
  const lookupMap = new Map<string, number[]>();

  for (const resp of responsibilities) {
    if (resp.Semester === targetSemester) {
      const key = `${resp.GradeID}|${resp.SubjectCode}`;
      if (!lookupMap.has(key)) {
        lookupMap.set(key, []);
      }
      lookupMap.get(key)!.push(resp.RespID);
    }
  }

  return lookupMap;
}

/**
 * Create a single schedule entry with error handling
 */
async function createScheduleEntry(
  from: string,
  to: string,
  schedule: ClassScheduleWithResponsibility,
  respLookupMap: Map<string, number[]>,
  isLocked: boolean,
  tx: TransactionClient,
): Promise<boolean> {
  const newTimeslotID = replaceConfigIDInString(schedule.TimeslotID, from, to);
  // ClassID is now autoincrement - will be auto-generated, don't set manually

  // Use lookup map for O(1) access
  const key = `${schedule.GradeID}|${schedule.SubjectCode}`;
  const newRespIDs = respLookupMap.get(key) || [];

  try {
    await tx.class_schedule.create({
      data: {
        // ClassID removed - autoincrement field cannot be set manually
        TimeslotID: newTimeslotID,
        SubjectCode: schedule.SubjectCode,
        RoomID: schedule.RoomID,
        GradeID: schedule.GradeID,
        IsLocked: isLocked,
        teachers_responsibility: {
          connect: newRespIDs.map((id) => ({ RespID: id })),
        },
      },
    });
    return true;
  } catch (error) {
    // Skip if already exists or error (idempotent)
    console.error(
      `Error copying ${isLocked ? "locked" : "timetable"} schedule:`,
      error,
    );
    return false;
  }
}
