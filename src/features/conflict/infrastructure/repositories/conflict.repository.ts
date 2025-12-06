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
 * ⚠️ TEMPORARILY DISABLED - Returns empty results until schema migration is complete
 */
export const conflictRepository = {
  /**
   * Find all scheduling conflicts for a given term
   *
   * @todo Implement with new schema:
   * 1. Query: `where: { timeslot: { AcademicYear, Semester } }`
   * 2. Include: `teachers_responsibility: { include: { teacher: true } }`
   * 3. Teacher conflicts: Loop through responsibility array
   * 4. Room conflicts: Handle null rooms, update field names
   * 5. Class conflicts: Use array access for teachers
   * 6. Unassigned: Check `teachers_responsibility.length === 0`
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
      console.error("Error checking teacher conflict:", error);
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
      console.error("Error checking room conflict:", error);
      return null;
    }
  },
};
