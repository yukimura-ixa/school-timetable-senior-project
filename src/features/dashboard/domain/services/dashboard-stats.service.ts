/**
 * Dashboard Statistics Service
 * Pure functions for calculating dashboard metrics and aggregations
 *
 * @module dashboard-stats.service
 */

import type {
  class_schedule,
  teacher,
  gradelevel,
} from "@/prisma/generated/client";

/**
 * Dashboard statistics data structure
 */
export interface DashboardStats {
  totalTeachers: number;
  totalClasses: number;
  totalScheduledHours: number;
  totalTimeslots: number;
  completionRate: number;
  conflictCount: number;
  teachersWithSchedules: number;
  teachersWithoutSchedules: number;
  classesWithFullSchedules: number;
  classesWithPartialSchedules: number;
}

/**
 * Teacher workload data for charts
 */
export interface TeacherWorkload {
  teacherId: number;
  teacherName: string;
  department: string;
  scheduledHours: number;
  classCount: number;
  utilizationRate: number;
}

/**
 * Subject distribution data for charts
 */
export interface SubjectDistribution {
  subjectCode: string;
  subjectName: string;
  totalHours: number;
  classCount: number;
  percentage: number;
}

/**
 * Grade completion data for health indicators
 */
export interface GradeCompletion {
  gradeId: string;
  gradeName: string;
  requiredHours: number;
  scheduledHours: number;
  completionRate: number;
  missingSubjects: string[];
}

/**
 * Calculate total scheduled hours from schedules
 * Each schedule entry represents one class period
 */
export function calculateTotalScheduledHours(
  schedules: class_schedule[],
): number {
  return schedules.length;
}

/**
 * Calculate completion rate based on expected vs actual schedules
 * Expected = totalClasses * totalTimeslots
 * Actual = schedules.length
 */
export function calculateCompletionRate(
  schedules: class_schedule[],
  totalClasses: number,
  totalTimeslots: number,
): number {
  if (totalClasses === 0 || totalTimeslots === 0) return 0;

  const expectedSchedules = totalClasses * totalTimeslots;
  const actualSchedules = schedules.length;
  const rate = (actualSchedules / expectedSchedules) * 100;

  return Math.min(Math.round(rate * 10) / 10, 100); // Round to 1 decimal, max 100%
}

/**
 * Count teachers who have at least one schedule assigned
 * Schedules relate to teachers through teachers_responsibility
 */
export function countTeachersWithSchedules(
  schedules: ScheduleWithTeachers[], // Schedules with teachers_responsibility included
  allTeachers: teacher[],
): { withSchedules: number; withoutSchedules: number } {
  const teacherIds = new Set<number>();

  // Extract teacher IDs from teachers_responsibility relation
  schedules.forEach((schedule) => {
    if (
      schedule.teachers_responsibility &&
      Array.isArray(schedule.teachers_responsibility)
    ) {
      schedule.teachers_responsibility.forEach(
        (resp: { TeacherID: number }) => {
          if (resp.TeacherID) {
            teacherIds.add(resp.TeacherID);
          }
        },
      );
    }
  });

  const withSchedules = teacherIds.size;
  const withoutSchedules = allTeachers.length - withSchedules;

  return { withSchedules, withoutSchedules };
}

/**
 * Count classes with full vs partial schedules
 * Full = has schedules for all timeslots
 * Partial = has some but not all schedules
 */
export function countClassCompletion(
  schedules: class_schedule[],
  allGrades: gradelevel[],
  totalTimeslots: number,
): { full: number; partial: number; none: number } {
  const gradeScheduleCounts = new Map<string, number>();

  // Count schedules per grade
  schedules.forEach((schedule) => {
    const currentCount = gradeScheduleCounts.get(schedule.GradeID) || 0;
    gradeScheduleCounts.set(schedule.GradeID, currentCount + 1);
  });

  let full = 0;
  let partial = 0;
  let none = 0;

  allGrades.forEach((grade) => {
    const count = gradeScheduleCounts.get(grade.GradeID) || 0;

    if (count === 0) {
      none++;
    } else if (count >= totalTimeslots) {
      full++;
    } else {
      partial++;
    }
  });

  return { full, partial, none };
}

/**
 * Calculate teacher workload for charts and analysis
 * Schedules relate to teachers through teachers_responsibility
 */
export function calculateTeacherWorkload(
  schedules: ScheduleWithTeachers[], // Schedules with teachers_responsibility included
  teachers: teacher[],
): TeacherWorkload[] {
  const workloadMap = new Map<
    number,
    { hours: number; classes: Set<string> }
  >();

  // Count hours and unique classes per teacher through teachers_responsibility
  schedules.forEach((schedule) => {
    if (
      schedule.teachers_responsibility &&
      Array.isArray(schedule.teachers_responsibility)
    ) {
      schedule.teachers_responsibility.forEach(
        (resp: { TeacherID: number }) => {
          const teacherId = resp.TeacherID;

          if (!workloadMap.has(teacherId)) {
            workloadMap.set(teacherId, {
              hours: 0,
              classes: new Set(),
            });
          }

          const workload = workloadMap.get(teacherId)!;
          workload.hours++;
          workload.classes.add(schedule.GradeID);
        },
      );
    }
  });

  // Calculate utilization rate (assuming 25 hours/week is 100%)
  const standardHours = 25;

  return teachers
    .map((teacher) => {
      const workload = workloadMap.get(teacher.TeacherID);
      const scheduledHours = workload?.hours || 0;
      const classCount = workload?.classes.size || 0;
      const utilizationRate = Math.min(
        (scheduledHours / standardHours) * 100,
        100,
      );

      return {
        teacherId: teacher.TeacherID,
        teacherName: `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`,
        department: teacher.Department,
        scheduledHours,
        classCount,
        utilizationRate: Math.round(utilizationRate * 10) / 10,
      };
    })
    .sort((a, b) => b.scheduledHours - a.scheduledHours); // Sort by hours desc
}

/**
 * Calculate subject distribution for charts
 */
export function calculateSubjectDistribution(
  schedules: class_schedule[],
  subjects: { SubjectCode: string; SubjectName: string }[],
): SubjectDistribution[] {
  const subjectMap = new Map<string, { hours: number; classes: Set<string> }>();

  // Count hours and classes per subject
  schedules.forEach((schedule) => {
    if (!subjectMap.has(schedule.SubjectCode)) {
      subjectMap.set(schedule.SubjectCode, {
        hours: 0,
        classes: new Set(),
      });
    }

    const dist = subjectMap.get(schedule.SubjectCode)!;
    dist.hours++;
    dist.classes.add(schedule.GradeID);
  });

  const totalHours = schedules.length;

  // Build distribution array
  const distribution = Array.from(subjectMap.entries()).map(([code, data]) => {
    const subject = subjects.find((s) => s.SubjectCode === code);

    return {
      subjectCode: code,
      subjectName: subject?.SubjectName || code,
      totalHours: data.hours,
      classCount: data.classes.size,
      percentage: Math.round((data.hours / totalHours) * 1000) / 10, // Round to 1 decimal
    };
  });

  return distribution.sort((a, b) => b.totalHours - a.totalHours); // Sort by hours desc
}

/**
 * Identify grades with incomplete schedules
 */
export function findIncompletGrades(
  schedules: class_schedule[],
  grades: gradelevel[],
  totalTimeslots: number,
  requiredSubjects: Map<string, string[]>, // gradeId -> subjectCodes
): GradeCompletion[] {
  const gradeSchedules = new Map<string, class_schedule[]>();

  // Group schedules by grade
  schedules.forEach((schedule) => {
    if (!gradeSchedules.has(schedule.GradeID)) {
      gradeSchedules.set(schedule.GradeID, []);
    }
    gradeSchedules.get(schedule.GradeID)!.push(schedule);
  });

  return grades
    .map((grade) => {
      const gradeScheds = gradeSchedules.get(grade.GradeID) || [];
      const scheduledHours = gradeScheds.length;
      const requiredHours = totalTimeslots;
      const completionRate =
        requiredHours > 0
          ? Math.round((scheduledHours / requiredHours) * 1000) / 10
          : 0;

      // Find missing subjects
      const required = requiredSubjects.get(grade.GradeID) || [];
      const scheduled = new Set(gradeScheds.map((s) => s.SubjectCode));
      const missingSubjects = required.filter((code) => !scheduled.has(code));

      return {
        gradeId: grade.GradeID,
        gradeName: `${grade.Year}/${grade.Number}`,
        requiredHours,
        scheduledHours,
        completionRate,
        missingSubjects,
      };
    })
    .filter((g) => g.completionRate < 100); // Only incomplete grades
}

/**
 * Type for class_schedule with teachers_responsibility relation
 * Used for conflict detection which needs teacher information
 */
type ScheduleWithTeachers = class_schedule & {
  teachers_responsibility?: Array<{ TeacherID: number }>;
};

/**
 * Detect potential scheduling conflicts
 * Note: This is a simplified version. The actual conflict detection
 * is done at the database level during schedule creation.
 */
export function detectConflicts(schedules: ScheduleWithTeachers[]): {
  teacherConflicts: number;
  classConflicts: number;
  roomConflicts: number;
} {
  const timeslotTeachers = new Map<string, Set<number>>();
  const timeslotClasses = new Map<string, Set<string>>();
  const timeslotRooms = new Map<string, Set<number>>();

  let teacherConflicts = 0;
  let classConflicts = 0;
  let roomConflicts = 0;

  schedules.forEach((schedule) => {
    const timeslot = schedule.TimeslotID;

    // Check teacher conflicts (via teachers_responsibility relation)
    if (schedule.teachers_responsibility) {
      schedule.teachers_responsibility.forEach((resp) => {
        if (!timeslotTeachers.has(timeslot)) {
          timeslotTeachers.set(timeslot, new Set());
        }
        if (timeslotTeachers.get(timeslot)!.has(resp.TeacherID)) {
          teacherConflicts++;
        }
        timeslotTeachers.get(timeslot)!.add(resp.TeacherID);
      });
    }

    // Check class conflicts
    if (!timeslotClasses.has(timeslot)) {
      timeslotClasses.set(timeslot, new Set());
    }
    if (timeslotClasses.get(timeslot)!.has(schedule.GradeID)) {
      classConflicts++;
    }
    timeslotClasses.get(timeslot)!.add(schedule.GradeID);

    // Check room conflicts (if room is assigned)
    if (schedule.RoomID) {
      if (!timeslotRooms.has(timeslot)) {
        timeslotRooms.set(timeslot, new Set());
      }
      if (timeslotRooms.get(timeslot)!.has(schedule.RoomID)) {
        roomConflicts++;
      }
      timeslotRooms.get(timeslot)!.add(schedule.RoomID);
    }
  });

  return { teacherConflicts, classConflicts, roomConflicts };
}
