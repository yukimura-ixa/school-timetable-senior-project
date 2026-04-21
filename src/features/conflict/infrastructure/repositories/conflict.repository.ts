/**
 * Conflict Detection Repository
 *
 * Detects scheduling conflicts for teachers, rooms, and classes.
 *
 * ## Implementation Status: ✅ COMPLETE
 *
 * Successfully migrated to new schema with:
 * - Many-to-many teacher relationships via `teachers_responsibility`
 * - Academic term filters via `timeslot` table
 * - Updated field names (ClassID, SubjectCode, RoomName, etc.)
 *
 * ## Cache Components
 *
 * ⚠️ **Removed for Jest compatibility** - Cache Components (`'use cache'`, `cacheTag`, `cacheLife`)
 * were removed to fix CI unit test failures with Next.js 16 + Jest.
 *
 * Manual cache invalidation required where applicable.
 *
 * ## Query Pattern:
 *
 * ```typescript
 * await prisma.class_schedule.findMany({
 *   where: { timeslot: { AcademicYear, Semester } },
 *   include: {
 *     teachers_responsibility: { include: { teacher: true } },
 *     gradelevel: true,
 *     subject: true,
 *     room: true,
 *     timeslot: true
 *   }
 * });
 * ```
 *
 * ## Conflict Types Detected:
 *
 * 1. **Teacher Conflicts**: Same teacher assigned to multiple classes at same timeslot
 * 2. **Room Conflicts**: Same room assigned to multiple classes at same timeslot
 * 3. **Class Conflicts**: Same grade scheduled for multiple subjects at same timeslot
 * 4. **Unassigned Resources**: Schedules missing teacher or room assignments
 *
 * @see schema.prisma for database schema
 */

import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/client";
import { createLogger } from "@/lib/logger";

const log = createLogger("ConflictRepository");

// Type for schedule with all relations
type ScheduleWithRelations = Prisma.class_scheduleGetPayload<{
  include: {
    gradelevel: true;
    subject: true;
    teachers_responsibility: {
      include: {
        teacher: true;
      };
    };
    room: true;
    timeslot: true;
  };
}>;

// Export interfaces that match what tests expect (OLD schema structure)
// These will remain stable even after internal implementation is updated
export interface TeacherConflict {
  type: "TEACHER_CONFLICT";
  teacherId: number;
  teacherName: string;
  timeslotId: string;
  day: string;
  periodStart: number;
  conflicts: Array<{
    scheduleId: number;
    gradeId: string;
    gradeName: string;
    subjectCode: string;
    subjectName: string;
    roomId: number;
    roomName: string;
  }>;
}

export interface RoomConflict {
  type: "ROOM_CONFLICT";
  roomId: number;
  roomName: string;
  timeslotId: string;
  day: string;
  periodStart: number;
  conflicts: Array<{
    scheduleId: number;
    gradeId: string;
    gradeName: string;
    subjectCode: string;
    subjectName: string;
    teacherId: number;
    teacherName: string;
  }>;
}

export interface ClassConflict {
  type: "CLASS_CONFLICT";
  gradeId: string;
  gradeName: string;
  timeslotId: string;
  day: string;
  periodStart: number;
  conflicts: Array<{
    scheduleId: number;
    subjectCode: string;
    subjectName: string;
    teacherId: number;
    teacherName: string;
    roomId: number;
    roomName: string;
  }>;
}

export interface UnassignedSchedule {
  type: "UNASSIGNED";
  scheduleId: number;
  gradeId: string;
  gradeName: string;
  subjectCode: string;
  subjectName: string;
  timeslotId: string;
  day: string;
  periodStart: number;
  missingResource: "TEACHER" | "ROOM" | "BOTH";
}

export type Conflict =
  | TeacherConflict
  | RoomConflict
  | ClassConflict
  | UnassignedSchedule;

export interface ConflictSummary {
  teacherConflicts: TeacherConflict[];
  roomConflicts: RoomConflict[];
  classConflicts: ClassConflict[];
  unassignedSchedules: UnassignedSchedule[];
  totalConflicts: number;
}

/**
 * Conflict Detection Repository
 *
 * Aggregate conflict analysis for dashboard reporting.
 * For real-time validation during scheduling, see conflict-detector.service.ts.
 */
export const conflictRepository = {
  /**
   * Find all scheduling conflicts for a given term
   */
  async findAllConflicts(
    academicYear: number,
    semester: string,
  ): Promise<ConflictSummary> {
    // Convert string semester to enum value
    const semesterEnum = semester === "1" ? "SEMESTER_1" : "SEMESTER_2";

    // Query class schedules with all necessary relations
    const schedules = (await prisma.class_schedule.findMany({
      where: {
        timeslot: {
          AcademicYear: academicYear,
          Semester: semesterEnum,
        },
      },
      include: {
        gradelevel: true,
        subject: true,
        teachers_responsibility: {
          include: {
            teacher: true,
          },
        },
        room: true,
        timeslot: true,
      },
    })) as unknown as ScheduleWithRelations[];

    // Initialize conflict arrays
    const teacherConflicts: TeacherConflict[] = [];
    const roomConflicts: RoomConflict[] = [];
    const classConflicts: ClassConflict[] = [];
    const unassignedSchedules: UnassignedSchedule[] = [];

    // Group schedules by timeslot for conflict detection
    const schedulesByTimeslot = new Map<string, ScheduleWithRelations[]>();
    for (const schedule of schedules) {
      const timeslotId = schedule.TimeslotID;
      if (!schedulesByTimeslot.has(timeslotId)) {
        schedulesByTimeslot.set(timeslotId, []);
      }
      schedulesByTimeslot.get(timeslotId)!.push(schedule);
    }

    // Detect conflicts for each timeslot
    for (const [timeslotId, timeslotSchedules] of schedulesByTimeslot) {
      // Teacher conflicts: group by teacher ID
      const schedulesByTeacher = new Map<number, ScheduleWithRelations[]>();
      for (const schedule of timeslotSchedules) {
        for (const resp of schedule.teachers_responsibility) {
          const teacherId = resp.TeacherID;
          if (!schedulesByTeacher.has(teacherId)) {
            schedulesByTeacher.set(teacherId, []);
          }
          schedulesByTeacher.get(teacherId)!.push(schedule);
        }
      }

      // Add teacher conflicts (more than 1 class for same teacher)
      for (const [teacherId, teacherSchedules] of schedulesByTeacher) {
        if (teacherSchedules.length > 1 && teacherSchedules[0]) {
          const firstTeacher =
            teacherSchedules[0]?.teachers_responsibility?.find(
              (r) => r.TeacherID === teacherId,
            )?.teacher;

          if (firstTeacher) {
            // Extract period from TimeslotID (e.g., "1-2567-MON1" → 1)
            const periodMatch = timeslotId.match(/\d+$/);
            const periodStart = periodMatch ? parseInt(periodMatch[0]) : 0;

            teacherConflicts.push({
              type: "TEACHER_CONFLICT",
              teacherId,
              teacherName: `${firstTeacher.Prefix}${firstTeacher.Firstname} ${firstTeacher.Lastname}`,
              timeslotId,
              day: teacherSchedules[0]?.timeslot?.DayOfWeek || "MON",
              periodStart,
              conflicts: teacherSchedules.map((s) => ({
                scheduleId: s.ClassID,
                gradeId: s.GradeID,
                gradeName: `${s.gradelevel?.Year || ""}/${s.gradelevel?.Number || ""}`,
                subjectCode: s.SubjectCode,
                subjectName: s.subject?.SubjectName || "ไม่ระบุ",
                roomId: s.RoomID || 0,
                roomName: s.room?.RoomName || "ไม่ระบุ",
              })),
            });
          }
        }
      }

      // Room conflicts: group by room ID
      const schedulesByRoom = new Map<number, ScheduleWithRelations[]>();
      for (const schedule of timeslotSchedules) {
        if (schedule.RoomID) {
          if (!schedulesByRoom.has(schedule.RoomID)) {
            schedulesByRoom.set(schedule.RoomID, []);
          }
          schedulesByRoom.get(schedule.RoomID)!.push(schedule);
        }
      }

      // Add room conflicts (more than 1 class in same room)
      for (const [roomId, roomSchedules] of schedulesByRoom) {
        if (roomSchedules.length > 1 && roomSchedules[0]) {
          const room = roomSchedules[0]?.room;
          if (room) {
            // Extract period from TimeslotID
            const periodMatch = timeslotId.match(/\d+$/);
            const periodStart = periodMatch ? parseInt(periodMatch[0]) : 0;

            roomConflicts.push({
              type: "ROOM_CONFLICT",
              roomId,
              roomName: room.RoomName,
              timeslotId,
              day: roomSchedules[0]?.timeslot?.DayOfWeek || "MON",
              periodStart,
              conflicts: roomSchedules.map((s) => {
                const firstTeacher = s.teachers_responsibility[0];
                return {
                  scheduleId: s.ClassID,
                  gradeId: s.GradeID,
                  gradeName: `${s.gradelevel?.Year || ""}/${s.gradelevel?.Number || ""}`,
                  subjectCode: s.SubjectCode,
                  subjectName: s.subject?.SubjectName || "ไม่ระบุ",
                  teacherId: firstTeacher?.TeacherID || 0,
                  teacherName: firstTeacher
                    ? `${firstTeacher.teacher?.Prefix || ""}${firstTeacher.teacher?.Firstname || ""} ${firstTeacher.teacher?.Lastname || ""}`
                    : "ไม่ระบุ",
                };
              }),
            });
          }
        }
      }

      // Class conflicts: group by grade ID
      const schedulesByGrade = new Map<string, ScheduleWithRelations[]>();
      for (const schedule of timeslotSchedules) {
        const gradeId = schedule.GradeID;
        if (!schedulesByGrade.has(gradeId)) {
          schedulesByGrade.set(gradeId, []);
        }
        schedulesByGrade.get(gradeId)!.push(schedule);
      }

      // Add class conflicts (more than 1 subject for same grade)
      for (const [gradeId, gradeSchedules] of schedulesByGrade) {
        if (gradeSchedules.length > 1) {
          // Extract period from TimeslotID
          const periodMatch = timeslotId.match(/\d+$/);
          const periodStart = periodMatch ? parseInt(periodMatch[0]) : 0;

          classConflicts.push({
            type: "CLASS_CONFLICT",
            gradeId,
            gradeName: `${gradeSchedules[0]?.gradelevel?.Year || ""}/${gradeSchedules[0]?.gradelevel?.Number || ""}`,
            timeslotId,
            day: gradeSchedules[0]?.timeslot?.DayOfWeek || "MON",
            periodStart,
            conflicts: gradeSchedules.map((s) => {
              const firstTeacher = s.teachers_responsibility[0];
              return {
                scheduleId: s.ClassID,
                subjectCode: s.SubjectCode,
                subjectName: s.subject.SubjectName,
                teacherId: firstTeacher?.TeacherID || 0,
                teacherName: firstTeacher
                  ? `${firstTeacher.teacher.Prefix}${firstTeacher.teacher.Firstname} ${firstTeacher.teacher.Lastname}`
                  : "ไม่ระบุ",
                roomId: s.RoomID || 0,
                roomName: s.room?.RoomName || "ไม่ระบุ",
              };
            }),
          });
        }
      }
    }

    // Detect unassigned schedules (missing teacher or room)
    for (const schedule of schedules) {
      const hasTeacher = schedule.teachers_responsibility.length > 0;
      const hasRoom = schedule.RoomID !== null;

      if (!hasTeacher || !hasRoom) {
        let missingResource: "TEACHER" | "ROOM" | "BOTH";
        if (!hasTeacher && !hasRoom) {
          missingResource = "BOTH";
        } else if (!hasTeacher) {
          missingResource = "TEACHER";
        } else {
          missingResource = "ROOM";
        }

        // Extract period from TimeslotID
        const periodMatch = schedule.TimeslotID.match(/\d+$/);
        const periodStart = periodMatch ? parseInt(periodMatch[0]) : 0;

        unassignedSchedules.push({
          type: "UNASSIGNED",
          scheduleId: schedule.ClassID,
          gradeId: schedule.GradeID,
          gradeName: `${schedule.gradelevel.Year}/${schedule.gradelevel.Number}`,
          subjectCode: schedule.SubjectCode,
          subjectName: schedule.subject.SubjectName,
          timeslotId: schedule.TimeslotID,
          day: schedule.timeslot.DayOfWeek,
          periodStart,
          missingResource,
        });
      }
    }

    const totalConflicts =
      teacherConflicts.length +
      roomConflicts.length +
      classConflicts.length +
      unassignedSchedules.length;

    return {
      teacherConflicts,
      roomConflicts,
      classConflicts,
      unassignedSchedules,
      totalConflicts,
    };
  },

  /**
   * Check if a teacher has a conflict at a specific timeslot
   *
   * @param teacherId - Teacher ID to check
   * @param timeslotId - Timeslot ID to check
   * @returns Teacher conflict details if conflict exists, null otherwise
   */
  async checkTeacherConflict(
    teacherId: number,
    timeslotId: string,
  ): Promise<{
    hasConflict: boolean;
    conflictingSchedule?: ScheduleWithRelations;
  } | null> {
    try {
      // Find all schedules for this teacher at this timeslot
      const existingSchedules = await prisma.class_schedule.findMany({
        where: {
          TimeslotID: timeslotId,
          teachers_responsibility: {
            some: {
              TeacherID: teacherId,
            },
          },
        },
        include: {
          gradelevel: true,
          subject: true,
          teachers_responsibility: {
            include: {
              teacher: true,
            },
          },
          room: true,
          timeslot: true,
        },
      });

      if (existingSchedules.length === 0) {
        return { hasConflict: false };
      }

      // Return first conflicting schedule
      return {
        hasConflict: true,
        conflictingSchedule:
          existingSchedules[0] as unknown as ScheduleWithRelations,
      };
    } catch (error) {
      log.logError(error, {
        method: "checkTeacherConflict",
        teacherId,
        timeslotId,
      });
      return null;
    }
  },

  /**
   * Check if a room has a conflict at a specific timeslot
   *
   * @param roomId - Room ID to check
   * @param timeslotId - Timeslot ID to check
   * @returns Room conflict details if conflict exists, null otherwise
   */
  async checkRoomConflict(
    roomId: number,
    timeslotId: string,
  ): Promise<{
    hasConflict: boolean;
    conflictingSchedule?: ScheduleWithRelations;
  } | null> {
    try {
      // Find all schedules for this room at this timeslot
      const existingSchedules = await prisma.class_schedule.findMany({
        where: {
          TimeslotID: timeslotId,
          RoomID: roomId,
        },
        include: {
          gradelevel: true,
          subject: true,
          teachers_responsibility: {
            include: {
              teacher: true,
            },
          },
          room: true,
          timeslot: true,
        },
      });

      if (existingSchedules.length === 0) {
        return { hasConflict: false };
      }

      // Return first conflicting schedule
      return {
        hasConflict: true,
        conflictingSchedule:
          existingSchedules[0] as unknown as ScheduleWithRelations,
      };
    } catch (error) {
      log.logError(error, { method: "checkRoomConflict", roomId, timeslotId });
      return null;
    }
  },

  /**
   * Load every class_schedule row for a term, projected into the
   * ExistingSchedule shape used by the domain conflict detector/resolver.
   * Consumed by conflict-resolution server action.
   */
  async findSchedulesForSemester(
    academicYear: number,
    semester: "SEMESTER_1" | "SEMESTER_2",
  ): Promise<
    Array<{
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
    }>
  > {
    const rows = await prisma.class_schedule.findMany({
      where: {
        timeslot: { AcademicYear: academicYear, Semester: semester },
      },
      include: {
        subject: true,
        room: true,
        gradelevel: true,
        teachers_responsibility: { include: { teacher: true } },
      },
    });

    return rows.map((s) => {
      const resp = s.teachers_responsibility[0];
      const teacher = resp?.teacher;
      return {
        classId: s.ClassID,
        timeslotId: s.TimeslotID,
        subjectCode: s.SubjectCode,
        subjectName: s.subject?.SubjectName ?? "",
        roomId: s.RoomID ?? null,
        roomName: s.room?.RoomName,
        gradeId: s.GradeID,
        isLocked: s.IsLocked,
        teacherId: teacher?.TeacherID,
        teacherName: teacher
          ? `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`
          : undefined,
      };
    });
  },

  /**
   * Load every teachers_responsibility row for a term, projected to the
   * domain TeacherResponsibility shape used by the resolver.
   */
  async findResponsibilitiesForTerm(
    academicYear: number,
    semester: "SEMESTER_1" | "SEMESTER_2",
  ): Promise<
    Array<{
      respId: number;
      teacherId: number;
      gradeId: string;
      subjectCode: string;
      academicYear: number;
      semester: string;
      teachHour: number;
    }>
  > {
    const rows = await prisma.teachers_responsibility.findMany({
      where: { AcademicYear: academicYear, Semester: semester },
    });
    return rows.map((r) => ({
      respId: r.RespID,
      teacherId: r.TeacherID,
      gradeId: r.GradeID,
      subjectCode: r.SubjectCode,
      academicYear: r.AcademicYear,
      semester: r.Semester,
      teachHour: r.TeachHour,
    }));
  },
};
