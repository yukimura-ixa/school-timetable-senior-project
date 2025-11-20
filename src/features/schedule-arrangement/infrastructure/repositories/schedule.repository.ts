/**
 * Infrastructure Layer: Schedule Repository
 * 
 * Data access layer for schedule-related database operations.
 * Uses Prisma ORM to interact with MySQL database.
 * 
 * Responsibilities:
 * - Fetch schedules and related data
 * - Create, update, delete schedules
 * - Transform Prisma types to domain models
 * 
 * @module schedule.repository
 */

import prisma from '@/lib/prisma'
import { semester } from '@/prisma/generated/client'
import type { ExistingSchedule, TeacherResponsibility } from '../../domain/models/conflict.model'

/**
 * Repository for schedule-related database operations
 */
export class ScheduleRepository {
  /**
   * Find all schedules for a specific academic term
   * Includes teacher information for conflict detection
   * 
   * @param academicYear - Academic year (e.g., 2566)
   * @param semester - Semester (SEMESTER_1 or SEMESTER_2)
   * @returns Array of existing schedules with full details
   * 
   * @example
   * ```ts
   * const repo = new ScheduleRepository();
   * const schedules = await repo.findSchedulesByTerm(2566, 'SEMESTER_1');
   * // Returns schedules with teacher names, room names, subject names
   * ```
   */
  async findSchedulesByTerm(
    academicYear: number,
    semesterValue: string
  ): Promise<ExistingSchedule[]> {
    const schedules = await prisma.class_schedule.findMany({
      where: {
        timeslot: {
          AcademicYear: academicYear,
          Semester: semesterValue as semester,
        },
      },
      include: {
        subject: true,
        room: true,
        gradelevel: true,
        timeslot: true,
        teachers_responsibility: {
          include: {
            teacher: true,
          },
        },
      },
    })

    // Transform Prisma types to domain model
    return schedules.map((schedule: any) => {
      // Get the first teacher from teachers_responsibility (if any)
      const firstTeacher = schedule.teachers_responsibility[0]
      const teacher = firstTeacher?.teacher

      return {
        classId: schedule.ClassID,
        timeslotId: schedule.TimeslotID,
        subjectCode: schedule.SubjectCode,
        subjectName: schedule.subject.SubjectName,
        roomId: schedule.RoomID,
        roomName: schedule.room?.RoomName,
        gradeId: schedule.GradeID,
        isLocked: schedule.IsLocked,
        teacherId: teacher?.TeacherID,
        teacherName: teacher
          ? `${teacher.Prefix} ${teacher.Firstname} ${teacher.Lastname}`
          : undefined,
      }
    })
  }

  /**
   * Find all teacher responsibilities for a specific academic term
   * Used for checking if teachers are assigned to teach specific subjects/grades
   * 
   * @param academicYear - Academic year
   * @param semester - Semester
   * @returns Array of teacher responsibilities
   * 
   * @example
   * ```ts
   * const responsibilities = await repo.findResponsibilitiesByTerm(2566, 'SEMESTER_1');
   * // Returns which teachers can teach which subjects for which grades
   * ```
   */
  async findResponsibilitiesByTerm(
    academicYear: number,
    semesterValue: string
  ): Promise<TeacherResponsibility[]> {
    const responsibilities = await prisma.teachers_responsibility.findMany({
      where: {
        AcademicYear: academicYear,
        Semester: semesterValue as semester,
      },
    })

    return responsibilities.map((resp: any) => ({
      respId: resp.RespID,
      teacherId: resp.TeacherID,
      gradeId: resp.GradeID,
      subjectCode: resp.SubjectCode,
      academicYear: resp.AcademicYear,
      semester: resp.Semester,
      teachHour: resp.TeachHour,
    }))
  }

  /**
   * Create a new schedule entry
   * 
   * @param data - Schedule data to create
   * @returns Created schedule
   * 
   * @example
   * ```ts
   * const schedule = await repo.createSchedule({
   *   ClassID: 'C_001',
   *   TimeslotID: 'T1',
   *   SubjectCode: 'MATH101',
   *   RoomID: 101,
   *   GradeID: 'M1-1',
   *   IsLocked: false,
   * });
   * ```
   */
  async createSchedule(data: {
    ClassID: string
    TimeslotID: string
    SubjectCode: string
    RoomID?: number | null
    GradeID: string
    IsLocked?: boolean
  }) {
    return await prisma.class_schedule.create({
      data,
      include: {
        subject: true,
        room: true,
        gradelevel: true,
        timeslot: true,
      },
    })
  }

  /**
   * Update an existing schedule entry
   * 
   * @param classId - Class ID to update
   * @param data - Fields to update
   * @returns Updated schedule
   * 
   * @example
   * ```ts
   * const updated = await repo.updateSchedule('C_001', {
   *   RoomID: 102,
   *   IsLocked: true,
   * });
   * ```
   */
  async updateSchedule(
    classId: string,
    data: {
      TimeslotID?: string
      SubjectCode?: string
      RoomID?: number | null
      GradeID?: string
      IsLocked?: boolean
    }
  ) {
    return await prisma.class_schedule.update({
      where: { ClassID: classId },
      data,
      include: {
        subject: true,
        room: true,
        gradelevel: true,
        timeslot: true,
      },
    })
  }

  /**
   * Delete a schedule entry
   * 
   * @param classId - Class ID to delete
   * @returns Deleted schedule
   * 
   * @example
   * ```ts
   * await repo.deleteSchedule('C_001');
   * ```
   */
  async deleteSchedule(classId: string) {
    return await prisma.class_schedule.delete({
      where: { ClassID: classId },
    })
  }

  /**
   * Find a specific schedule by class ID
   * 
   * @param classId - Class ID to find
   * @returns Schedule or null if not found
   */
  async findScheduleById(classId: string) {
    return await prisma.class_schedule.findUnique({
      where: { ClassID: classId },
      include: {
        subject: true,
        room: true,
        gradelevel: true,
        timeslot: true,
        teachers_responsibility: {
          include: {
            teacher: true,
          },
        },
      },
    })
  }

  /**
   * Link a teacher to a class schedule
   * Creates/updates the many-to-many relationship
   * 
   * @param classId - Class schedule ID
   * @param respId - Teacher responsibility ID
   */
  async linkTeacherToSchedule(classId: string, respId: number) {
    // This updates the many-to-many relation
    return await prisma.teachers_responsibility.update({
      where: { RespID: respId },
      data: {
        class_schedule: {
          connect: { ClassID: classId },
        },
      },
    })
  }

  /**
   * Unlink a teacher from a class schedule
   * 
   * @param classId - Class schedule ID
   * @param respId - Teacher responsibility ID
   */
  async unlinkTeacherFromSchedule(classId: string, respId: number) {
    return await prisma.teachers_responsibility.update({
      where: { RespID: respId },
      data: {
        class_schedule: {
          disconnect: { ClassID: classId },
        },
      },
    })
  }
}

/**
 * Singleton instance for use across the application
 */
export const scheduleRepository = new ScheduleRepository()
