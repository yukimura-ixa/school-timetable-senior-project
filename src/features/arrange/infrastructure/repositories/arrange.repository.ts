/**
 * Arrange Feature - Repository
 * 
 * Data access layer for teacher schedule arrangement.
 * Handles all database operations related to arranging teacher timetables.
 */

import prisma from '@/libs/prisma';
import { semester, type Prisma } from '@prisma/client';

// ============================================================================
// Types
// ============================================================================

/**
 * Teacher schedule with all relations for display
 */
export type TeacherScheduleWithRelations = Prisma.class_scheduleGetPayload<{
  include: {
    teachers_responsibility: true;
    subject: true;
    gradelevel: true;
    timeslot: true;
    room: true;
  };
}>;

/**
 * Basic schedule without relations (for deletion)
 */
export type BasicSchedule = Prisma.class_scheduleGetPayload<{
  select: {
    ClassID: true;
    TimeslotID: true;
  };
}>;

// ============================================================================
// Repository Class
// ============================================================================

export class ArrangeRepository {
  /**
   * Find all schedules for a teacher (for display in arrange UI)
   * 
   * @param teacherId - The teacher's ID
   * @returns Array of schedules with all relations
   */
  async findByTeacher(teacherId: number): Promise<TeacherScheduleWithRelations[]> {
    return prisma.class_schedule.findMany({
      where: {
        teachers_responsibility: {
          some: {
            TeacherID: teacherId,
          },
        },
      },
      include: {
        teachers_responsibility: true,
        subject: true,
        gradelevel: true,
        timeslot: true,
        room: true,
      },
    });
  }

  /**
   * Find existing unlocked schedules for a teacher in a specific term
   * Used for diff calculation in sync operation
   * 
   * @param teacherId - The teacher's ID
   * @param academicYear - Academic year (e.g., 2024)
   * @param semesterValue - Semester enum value (semester.SEMESTER_1 or semester.SEMESTER_2)
   * @returns Array of basic schedules (ClassID + TimeslotID for efficient comparison)
   */
  async findExistingUnlocked(
    teacherId: number,
    academicYear: number,
    semesterValue: semester
  ): Promise<BasicSchedule[]> {
    return prisma.class_schedule.findMany({
      where: {
        IsLocked: false,
        timeslot: {
          AcademicYear: academicYear,
          Semester: semesterValue,
        },
        teachers_responsibility: {
          some: {
            TeacherID: teacherId,
          },
        },
      },
      select: {
        ClassID: true,
        TimeslotID: true,
      },
    });
  }

  /**
   * Create a new class schedule
   * 
   * @param data - Schedule data (ClassID, TimeslotID, SubjectCode, GradeID, RoomID, RespID)
   * @returns The created schedule
   */
  async create(data: {
    ClassID: string;
    TimeslotID: string;
    SubjectCode: string;
    GradeID: string;
    RoomID: number;
    RespID: number;
  }): Promise<Prisma.class_scheduleGetPayload<{}>> {
    return prisma.class_schedule.create({
      data: {
        ClassID: data.ClassID,
        TimeslotID: data.TimeslotID,
        SubjectCode: data.SubjectCode,
        GradeID: data.GradeID,
        RoomID: data.RoomID,
        IsLocked: false,
        teachers_responsibility: {
          connect: {
            RespID: data.RespID,
          },
        },
      },
    });
  }

  /**
   * Delete a schedule by ClassID
   * 
   * @param classId - The ClassID to delete
   * @returns The deleted schedule
   */
  async deleteById(classId: string): Promise<Prisma.class_scheduleGetPayload<{}>> {
    return prisma.class_schedule.delete({
      where: {
        ClassID: classId,
      },
    });
  }

  /**
   * Count schedules by teacher
   * 
   * @param teacherId - The teacher's ID
   * @returns Count of schedules
   */
  async countByTeacher(teacherId: number): Promise<number> {
    return prisma.class_schedule.count({
      where: {
        teachers_responsibility: {
          some: {
            TeacherID: teacherId,
          },
        },
      },
    });
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const arrangeRepository = new ArrangeRepository();
