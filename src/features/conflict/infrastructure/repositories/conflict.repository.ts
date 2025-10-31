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
 * - [x] Import from `@/libs/prisma` (not `@/lib/prisma`)
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

import prisma from "@/libs/prisma";
import { Prisma, semester } from "@/prisma/generated";

/**
 * Type: Class schedule with full relations for conflict detection
 */
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

// Export interfaces that match what tests expect
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
   * Detects four types of conflicts:
   * 1. Teacher conflicts - Same teacher scheduled in multiple classes at same time
   * 2. Room conflicts - Same room assigned to multiple classes at same time
   * 3. Class conflicts - Same class scheduled for multiple subjects at same time
   * 4. Unassigned - Schedules missing teacher or room assignments
   */
  async findAllConflicts(
    academicYear: number,
    semesterValue: string
  ): Promise<ConflictSummary> {
    // Fetch all schedules for the term
    const schedules = await prisma.class_schedule.findMany({
      where: {
        timeslot: {
          AcademicYear: academicYear,
          Semester: semesterValue as semester,
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
      orderBy: [
        { timeslot: { DayOfWeek: 'asc' } },
        { timeslot: { StartTime: 'asc' } },
      ],
    }) as unknown as ScheduleWithRelations[];

    // Initialize conflict collections
    const teacherConflicts: TeacherConflict[] = [];
    const roomConflicts: RoomConflict[] = [];
    const classConflicts: ClassConflict[] = [];
    const unassignedSchedules: UnassignedSchedule[] = [];

    // Group schedules by timeslot + resource
    const teacherGroups = new Map<string, ScheduleWithRelations[]>();
    const roomGroups = new Map<string, ScheduleWithRelations[]>();
    const classGroups = new Map<string, ScheduleWithRelations[]>();

    // Build groups and detect unassigned
    for (const schedule of schedules) {
      const timeslotId = schedule.TimeslotID;
      const hasTeacher = schedule.teachers_responsibility.length > 0;
      const hasRoom = schedule.RoomID !== null;

      // Check for unassigned resources
      if (!hasTeacher || !hasRoom) {
        const gradeName = `${schedule.gradelevel.Year}/${schedule.gradelevel.Number}`;
        // Extract period number from TimeslotID (format: "SEMESTER-YEAR-DAYPERIOD")
        const timeslotParts = timeslotId.split('-');
        const dayAndPeriod = timeslotParts[timeslotParts.length - 1]; // e.g., "MON1"
        const periodMatch = dayAndPeriod.match(/\d+$/);
        const periodStart = periodMatch ? parseInt(periodMatch[0]) : 0;
        
        unassignedSchedules.push({
          type: 'UNASSIGNED',
          scheduleId: schedule.ClassID,
          gradeId: schedule.GradeID,
          gradeName,
          subjectCode: schedule.SubjectCode,
          subjectName: schedule.subject.SubjectName,
          timeslotId,
          day: schedule.timeslot.DayOfWeek,
          periodStart,
          missingResource: !hasTeacher && !hasRoom ? 'BOTH' : (!hasTeacher ? 'TEACHER' : 'ROOM'),
        });
      }

      // Group by teacher + timeslot
      if (hasTeacher) {
        for (const responsibility of schedule.teachers_responsibility) {
          const key = `${responsibility.TeacherID}_${timeslotId}`;
          if (!teacherGroups.has(key)) {
            teacherGroups.set(key, []);
          }
          const group = teacherGroups.get(key);
          if (group) group.push(schedule);
        }
      }

      // Group by room + timeslot
      if (hasRoom) {
        const key = `${schedule.RoomID}_${timeslotId}`;
        if (!roomGroups.has(key)) {
          roomGroups.set(key, []);
        }
        const group = roomGroups.get(key);
        if (group) group.push(schedule);
      }

      // Group by class + timeslot
      const classKey = `${schedule.GradeID}_${timeslotId}`;
      if (!classGroups.has(classKey)) {
        classGroups.set(classKey, []);
      }
      const group = classGroups.get(classKey);
      if (group) group.push(schedule);
    }

    // Detect teacher conflicts (same teacher, same time, multiple classes)
    for (const [key, group] of teacherGroups.entries()) {
      if (group.length > 1) {
        const firstSchedule = group[0];
        const teacherId = parseInt(key.split('_')[0]);
        const responsibility = firstSchedule.teachers_responsibility.find(
          r => r.TeacherID === teacherId
        );
        
        if (responsibility && responsibility.teacher) {
          const teacher = responsibility.teacher;
          const teacherName = `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`;
          
          // Extract period number from TimeslotID
          const timeslotParts = firstSchedule.TimeslotID.split('-');
          const dayAndPeriod = timeslotParts[timeslotParts.length - 1];
          const periodMatch = dayAndPeriod.match(/\d+$/);
          const periodStart = periodMatch ? parseInt(periodMatch[0]) : 0;
          
          teacherConflicts.push({
            type: 'TEACHER_CONFLICT',
            teacherId,
            teacherName,
            timeslotId: firstSchedule.TimeslotID,
            day: firstSchedule.timeslot.DayOfWeek,
            periodStart,
            conflicts: group.map(s => {
              const gradeName = `${s.gradelevel.Year}/${s.gradelevel.Number}`;
              return {
                scheduleId: s.ClassID,
                gradeId: s.GradeID,
                gradeName,
                subjectCode: s.SubjectCode,
                subjectName: s.subject.SubjectName,
                roomId: s.RoomID || 0,
                roomName: s.room?.RoomName || 'ไม่ระบุ',
              };
            }),
          });
        }
      }
    }

    // Detect room conflicts (same room, same time, multiple classes)
    for (const [key, group] of roomGroups.entries()) {
      if (group.length > 1) {
        const firstSchedule = group[0];
        const roomId = parseInt(key.split('_')[0]);
        
        // Extract period number from TimeslotID
        const timeslotParts = firstSchedule.TimeslotID.split('-');
        const dayAndPeriod = timeslotParts[timeslotParts.length - 1];
        const periodMatch = dayAndPeriod.match(/\d+$/);
        const periodStart = periodMatch ? parseInt(periodMatch[0]) : 0;
        
        roomConflicts.push({
          type: 'ROOM_CONFLICT',
          roomId,
          roomName: firstSchedule.room?.RoomName || 'ไม่ระบุ',
          timeslotId: firstSchedule.TimeslotID,
          day: firstSchedule.timeslot.DayOfWeek,
          periodStart,
          conflicts: group.map(s => {
            const gradeName = `${s.gradelevel.Year}/${s.gradelevel.Number}`;
            const firstResp = s.teachers_responsibility[0];
            const teacher = firstResp?.teacher;
            const teacherId = teacher?.TeacherID || 0;
            const teacherName = teacher 
              ? `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`
              : 'ไม่ระบุ';
            
            return {
              scheduleId: s.ClassID,
              gradeId: s.GradeID,
              gradeName,
              subjectCode: s.SubjectCode,
              subjectName: s.subject.SubjectName,
              teacherId,
              teacherName,
            };
          }),
        });
      }
    }

    // Detect class conflicts (same class, same time, multiple subjects)
    for (const [, group] of classGroups.entries()) {
      if (group.length > 1) {
        const firstSchedule = group[0];
        const gradeName = `${firstSchedule.gradelevel.Year}/${firstSchedule.gradelevel.Number}`;
        
        // Extract period number from TimeslotID
        const timeslotParts = firstSchedule.TimeslotID.split('-');
        const dayAndPeriod = timeslotParts[timeslotParts.length - 1];
        const periodMatch = dayAndPeriod.match(/\d+$/);
        const periodStart = periodMatch ? parseInt(periodMatch[0]) : 0;
        
        classConflicts.push({
          type: 'CLASS_CONFLICT',
          gradeId: firstSchedule.GradeID,
          gradeName,
          timeslotId: firstSchedule.TimeslotID,
          day: firstSchedule.timeslot.DayOfWeek,
          periodStart,
          conflicts: group.map(s => {
            const firstResp = s.teachers_responsibility[0];
            const teacher = firstResp?.teacher;
            const teacherId = teacher?.TeacherID || 0;
            const teacherName = teacher 
              ? `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`
              : 'ไม่ระบุ';
            
            return {
              scheduleId: s.ClassID,
              subjectCode: s.SubjectCode,
              subjectName: s.subject.SubjectName,
              teacherId,
              teacherName,
              roomId: s.RoomID || 0,
              roomName: s.room?.RoomName || 'ไม่ระบุ',
            };
          }),
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
