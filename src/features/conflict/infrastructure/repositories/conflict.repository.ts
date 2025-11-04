/**
 * Conflict Detection Repository
 * 
 * ⚠️ **SCHEMA MIGRATION REQUIRED** ⚠️
 * 
 * This repository needs comprehensive updates to work with the current database schema.
 * A partial refactoring was attempted but left incomplete (~60% done).
 * 
 * ## What Changed in the Schema:
 * 
 * ### 1. Teacher Relationship (BREAKING CHANGE):
 * - **OLD**: Direct `TeacherID` foreign key on `class_schedule`
 * - **NEW**: Many-to-many via `teachers_responsibility` junction table
 * - **Impact**: A schedule can now have MULTIPLE teachers
 * 
 * ### 2. Academic Term Location (BREAKING CHANGE):
 * - **OLD**: `AcademicYear` and `Semester` on `class_schedule` table
 * - **NEW**: Moved to `timeslot` table
 * - **Impact**: Query filter must use nested relation
 * 
 * ### 3. Field Renames:
 * | Old Field | New Field | Notes |
 * |-----------|-----------|-------|
 * | `ScheduleID` | `ClassID` | Primary key renamed |
 * | `subject.SubjectID` | `SubjectCode` | Changed from ID to code |
 * | `subject.Name_TH` | `SubjectName` | Simplified name |
 * | `teacher.Name` | `teacher.Firstname` | Split into parts |
 * | `teacher.Surname` | `teacher.Lastname` | With Prefix added |
 * | `room.Name` | `room.RoomName` | More specific |
 * | `timeslot.Day` | `timeslot.DayOfWeek` | Clarified |
 * | `timeslot.PeriodStart` | `timeslot.StartTime` | Changed to time |
 * 
 * ## Refactoring Checklist:
 * 
 * ### Phase 1: Foundation (~20% complete)
 * - [x] Import from `@/lib/prisma` (not `@/lib/prisma`)
 * - [x] Import Prisma types: `Prisma`, `semester`
 * - [x] Create `ScheduleWithRelations` type helper
 * - [x] Update query filter: `where: { timeslot: { AcademicYear, Semester } }`
 * - [x] Add `teachers_responsibility` to includes
 * 
 * ### Phase 2: Teacher Conflicts (~40% complete - PARTIAL)
 * - [x] Loop through `teachers_responsibility` array
 * - [x] Build teacher groups map
 * - [x] Extract teacher info from responsibility
 * - [x] Update field names in conflict objects
 * 
 * ### Phase 3: Room Conflicts (~30% complete - PARTIAL)
 * - [x] Add null checks for roomId
 * - [x] Update `room.RoomName`
 * - [x] Access teacher via `teachers_responsibility[0]`
 * - [x] Update field names
 * 
 * ### Phase 4: Class Conflicts (NOT STARTED)
 * - [ ] Keep old field references (needs update)
 * - [ ] Access teacher via array
 * - [ ] Construct `gradeName` from `Year`/`Number` if needed
 * - [ ] Update all field mappings
 * 
 * ### Phase 5: Unassigned Detection (NOT STARTED)
 * - [ ] Change from `!schedule.TeacherID` to `schedule.teachers_responsibility.length === 0`
 * - [ ] Update all field names
 * - [ ] Handle Date type for `StartTime`
 * 
 * ### Phase 6: Testing
 * - [ ] Update mock data in `conflict.repository.test.ts`
 * - [ ] Fix all 8 unit tests
 * - [ ] Fix 15 E2E tests
 * 
 * ## Query Pattern Reference:
 * 
 * ```typescript
 * // OLD Query:
 * await prisma.classschedule.findMany({
 *   where: { AcademicYear, Semester },
 *   include: { teacher: true }
 * });
 * const teacher = schedule.teacher;  // Direct access
 * 
 * // NEW Query:
 * await prisma.class_schedule.findMany({
 *   where: { timeslot: { AcademicYear, Semester } },
 *   include: { teachers_responsibility: { include: { teacher: true } } }
 * });
 * const teachers = schedule.teachers_responsibility.map(r => r.teacher);  // Array
 * ```
 * 
 * ## Working Examples:
 * - `src/features/schedule/infrastructure/repositories/schedule.repository.ts`
 * - `src/features/class/infrastructure/repositories/class.repository.ts`
 * 
 * ## Resources:
 * - Schema: `prisma/schema.prisma`
 * - Migration notes: See conversation history (October 31, 2025)
 * 
 * @todo Complete schema migration (estimate: 2-3 hours)
 * @see https://github.com/yukimura-ixa/school-timetable-senior-project/issues/TBD
 */

import prisma from "@/lib/prisma";
import { Prisma, semester } from "@/prisma/generated";

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
  type: 'TEACHER_CONFLICT';
  teacherId: number;
  teacherName: string;
  timeslotId: string;
  day: string;
  periodStart: number;
  conflicts: Array<{
    scheduleId: string;
    gradeId: string;
    gradeName: string;
    subjectCode: string;
    subjectName: string;
    roomId: number;
    roomName: string;
  }>;
}

export interface RoomConflict {
  type: 'ROOM_CONFLICT';
  roomId: number;
  roomName: string;
  timeslotId: string;
  day: string;
  periodStart: number;
  conflicts: Array<{
    scheduleId: string;
    gradeId: string;
    gradeName: string;
    subjectCode: string;
    subjectName: string;
    teacherId: number;
    teacherName: string;
  }>;
}

export interface ClassConflict {
  type: 'CLASS_CONFLICT';
  gradeId: string;
  gradeName: string;
  timeslotId: string;
  day: string;
  periodStart: number;
  conflicts: Array<{
    scheduleId: string;
    subjectCode: string;
    subjectName: string;
    teacherId: number;
    teacherName: string;
    roomId: number;
    roomName: string;
  }>;
}

export interface UnassignedSchedule {
  type: 'UNASSIGNED';
  scheduleId: string;
  gradeId: string;
  gradeName: string;
  subjectCode: string;
  subjectName: string;
  timeslotId: string;
  day: string;
  periodStart: number;
  missingResource: 'TEACHER' | 'ROOM' | 'BOTH';
}

export type Conflict = TeacherConflict | RoomConflict | ClassConflict | UnassignedSchedule;

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
    semester: string
  ): Promise<ConflictSummary> {
    // Convert string semester to enum value
    const semesterEnum = semester === "1" ? "SEMESTER_1" : "SEMESTER_2";
    
    // Query class schedules with all necessary relations
    const schedules = await prisma.class_schedule.findMany({
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
    }) as unknown as ScheduleWithRelations[];

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
          const firstTeacher = teacherSchedules[0]?.teachers_responsibility?.find(
            r => r.TeacherID === teacherId
          )?.teacher;
          
          if (firstTeacher) {
            // Extract period from TimeslotID (e.g., "1-2567-MON1" → 1)
            const periodMatch = timeslotId.match(/\d+$/);
            const periodStart = periodMatch ? parseInt(periodMatch[0]) : 0;

            teacherConflicts.push({
              type: 'TEACHER_CONFLICT',
              teacherId,
              teacherName: `${firstTeacher.Prefix}${firstTeacher.Firstname} ${firstTeacher.Lastname}`,
              timeslotId,
              day: teacherSchedules[0]?.timeslot?.DayOfWeek || 'MON',
              periodStart,
              conflicts: teacherSchedules.map(s => ({
                scheduleId: s.ClassID,
                gradeId: s.GradeID,
                gradeName: `${s.gradelevel?.Year || ''}/${s.gradelevel?.Number || ''}`,
                subjectCode: s.SubjectCode,
                subjectName: s.subject?.SubjectName || 'ไม่ระบุ',
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
              type: 'ROOM_CONFLICT',
              roomId,
              roomName: room.RoomName,
              timeslotId,
              day: roomSchedules[0]?.timeslot?.DayOfWeek || 'MON',
              periodStart,
              conflicts: roomSchedules.map(s => {
                const firstTeacher = s.teachers_responsibility[0];
                return {
                  scheduleId: s.ClassID,
                  gradeId: s.GradeID,
                  gradeName: `${s.gradelevel?.Year || ''}/${s.gradelevel?.Number || ''}`,
                  subjectCode: s.SubjectCode,
                  subjectName: s.subject?.SubjectName || 'ไม่ระบุ',
                  teacherId: firstTeacher?.TeacherID || 0,
                  teacherName: firstTeacher 
                    ? `${firstTeacher.teacher?.Prefix || ''}${firstTeacher.teacher?.Firstname || ''} ${firstTeacher.teacher?.Lastname || ''}`
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
            type: 'CLASS_CONFLICT',
            gradeId,
            gradeName: `${gradeSchedules[0]?.gradelevel?.Year || ''}/${gradeSchedules[0]?.gradelevel?.Number || ''}`,
            timeslotId,
            day: gradeSchedules[0]?.timeslot?.DayOfWeek || 'MON',
            periodStart,
            conflicts: gradeSchedules.map(s => {
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
          type: 'UNASSIGNED',
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
};
