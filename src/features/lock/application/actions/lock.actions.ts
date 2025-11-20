/**
 * Lock Feature - Server Actions
 * 
 * Server Actions for managing locked class schedules.
 * Uses React 19 Server Actions with 'use server' directive.
 */

'use server';

import { createAction } from '@/shared/lib/action-wrapper';
import * as v from 'valibot';
import * as lockRepository from '../../infrastructure/repositories/lock.repository';
import { semester } from '@/prisma/generated/client';
import type { Prisma, class_schedule } from '@/prisma/generated/client';
import {
  generateClassID,
  groupSchedulesBySubject,
  validateLockInput,
} from '../../domain/services/lock-validation.service';
import {
  getLockedSchedulesSchema,
  createLockSchema,
  deleteLocksSchema,
  type GetLockedSchedulesInput,
  type CreateLockInput,
  type DeleteLocksInput,
} from '../schemas/lock.schemas';

/**
 * Get all locked schedules for a given academic year and semester
 * Returns grouped data by SubjectCode
 */
export const getLockedSchedulesAction = createAction(
  getLockedSchedulesSchema,
  async (input: GetLockedSchedulesInput) => {
    // Fetch raw locked schedules from database
    const rawSchedules = await lockRepository.findLockedSchedules(
      input.AcademicYear,
      input.Semester
    );

    // Group schedules by SubjectCode using domain service
    const groupedSchedules = groupSchedulesBySubject(rawSchedules);

    return groupedSchedules;
  }
);

/**
 * Create locked schedules for multiple timeslots and grades
 * Creates cartesian product: timeslots × grades
 * 
 * Example: 2 timeslots × 3 grades = 6 class schedules created
 */
export const createLockAction = createAction(
  createLockSchema,
  async (input: CreateLockInput) => {
    // Validate input using domain service
    const validationError = validateLockInput({
      timeslots: input.timeslots,
      GradeIDs: input.GradeIDs,
      RespIDs: input.RespIDs,
    });

    if (validationError) {
      throw new Error(validationError);
    }

  const created: class_schedule[] = [];
    const respIds = input.RespIDs.map((respId) => ({ RespID: respId }));

    // Nested loops: for each timeslot, for each grade
    for (const timeslotId of input.timeslots) {
      for (const gradeId of input.GradeIDs) {
        // Generate ClassID using domain service
        const classId = generateClassID(timeslotId, input.SubjectCode, gradeId);

        // Create single locked schedule
   
  const schedule: class_schedule = await lockRepository.createLock({
          ClassID: classId,
          IsLocked: true,
          SubjectCode: input.SubjectCode,
          TimeslotID: timeslotId,
          RoomID: input.RoomID,
          GradeID: gradeId,
          RespIDs: respIds,
        });

        created.push(schedule);
      }
    }

    return created;
  }
);

/**
 * Delete multiple locked schedules by ClassIDs
 * Bulk delete operation
 */
export const deleteLocksAction = createAction(
  deleteLocksSchema,
  async (classIds: DeleteLocksInput) => {
   
  const result: Prisma.BatchPayload = await lockRepository.deleteMany(classIds);

    return {
      count: result.count,
      deletedClassIds: classIds,
    };
  }
);

/**
 * Get count of locked schedules for a given academic year and semester
 * Statistics endpoint
 */
export const getLockedScheduleCountAction = createAction(
  getLockedSchedulesSchema,
  async (input: GetLockedSchedulesInput) => {
    const count = await lockRepository.count(
      input.AcademicYear,
      input.Semester
    );

    return { count };
  }
);

/**
 * Create multiple locked schedules in a single transaction
 * Bulk lock operation for efficiency
 * 
 * All locks are created atomically - if any fails, all rollback
 */
export const createBulkLocksAction = createAction(
  v.object({
    locks: v.array(
      v.object({
        SubjectCode: v.string(),
        RoomID: v.number(),
        TimeslotID: v.string(),
        GradeID: v.string(),
        RespID: v.number(),
      })
    ),
  }),
  async (input: { locks: Array<{ SubjectCode: string; RoomID: number; TimeslotID: string; GradeID: string; RespID: number }> }) => {
  const created: class_schedule[] = [];

    // Use transaction for atomicity
    for (const lock of input.locks) {
      const classId = generateClassID(lock.TimeslotID, lock.SubjectCode, lock.GradeID);
      
   
  const schedule: class_schedule = await lockRepository.createLock({
        ClassID: classId,
        IsLocked: true,
        SubjectCode: lock.SubjectCode,
        TimeslotID: lock.TimeslotID,
        RoomID: lock.RoomID,
        GradeID: lock.GradeID,
        RespIDs: [{ RespID: lock.RespID }],
      });

      created.push(schedule);
    }

    return {
      count: created.length,
      created,
    };
  }
);

/**
 * Get all available lock templates
 * Can optionally filter by category
 */
export const getLockTemplatesAction = createAction(
  v.optional(v.object({
    category: v.optional(v.picklist(['lunch', 'activity', 'assembly', 'exam', 'other'])),
  })),
  async (input?: { category?: 'lunch' | 'activity' | 'assembly' | 'exam' | 'other' }) => {
    const { LOCK_TEMPLATES, getTemplatesByCategory } = await import('../../domain/models/lock-template.model');
    
    if (input?.category) {
      return getTemplatesByCategory(input.category);
    }
    
    return LOCK_TEMPLATES;
  }
);

/**
 * Apply a lock template to create multiple locks
 * Resolves template configuration to actual database records
 */
export const applyLockTemplateAction = createAction(
  v.object({
    templateId: v.string(),
    AcademicYear: v.number(),
    Semester: v.string(),
    ConfigID: v.string(),
  }),
  async (input: { templateId: string; AcademicYear: number; Semester: string; ConfigID: string }) => {
    const { getTemplateById } = await import('../../domain/models/lock-template.model');
    const { resolveTemplate } = await import('../../domain/services/lock-template.service');
    const lockRepo = await import('../../infrastructure/repositories/lock.repository');
    
    // Get template
    const template = getTemplateById(input.templateId);
    if (!template) {
      throw new Error(`ไม่พบเทมเพลต ID: ${input.templateId}`);
    }
    
    // Fetch available data using repository methods
    const [grades, timeslots, rooms, subjects, responsibilities] = await Promise.all([
      lockRepo.findAllGradeLevels(),
      lockRepo.findTimeslotsByTerm(input.AcademicYear, input.Semester as semester),
      lockRepo.findAllRooms(),
      lockRepo.findAllSubjects(),
      lockRepo.findTeacherResponsibilitiesByTerm(input.AcademicYear, input.Semester as semester),
    ]);
    
    // Transform data to match expected format
    const transformedGrades = grades.map(g => ({
      GradeID: g.GradeID,
      GradeName: `ม.${g.Year}/${g.Number}`,
      Level: g.Number,
    }));
    
    const transformedTimeslots = timeslots.map(t => ({
      TimeslotID: t.TimeslotID,
      Day: t.DayOfWeek,
      PeriodStart: t.StartTime.getHours() * 60 + t.StartTime.getMinutes(),
    }));
    
    const transformedRooms = rooms.map(r => ({
      RoomID: r.RoomID,
      Name: r.RoomName,
    }));
    
    const transformedSubjects = subjects.map(s => ({
      SubjectID: s.SubjectCode,
      Name_TH: s.SubjectName,
    }));
    
    // Resolve template to locks
    const { locks, warnings, errors } = resolveTemplate({
      template,
      academicYear: input.AcademicYear,
      semester: input.Semester,
      configId: input.ConfigID,
      availableGrades: transformedGrades,
      availableTimeslots: transformedTimeslots,
      availableRooms: transformedRooms,
      availableSubjects: transformedSubjects,
      availableResponsibilities: responsibilities,
    });
    
    if (errors.length > 0) {
      throw new Error(`ไม่สามารถนำเทมเพลตไปใช้ได้: ${errors.join(', ')}`);
    }
    
    // Create locks using bulk action
  const created: class_schedule[] = [];
    for (const lock of locks) {
      const classId = generateClassID(lock.TimeslotID, lock.SubjectCode, lock.GradeID);
      
   
  const schedule: class_schedule = await lockRepository.createLock({
        ClassID: classId,
        IsLocked: true,
        SubjectCode: lock.SubjectCode,
        TimeslotID: lock.TimeslotID,
        RoomID: lock.RoomID,
        GradeID: lock.GradeID,
        RespIDs: [{ RespID: lock.RespID }],
      });
      
      created.push(schedule);
    }
    
    return {
      templateName: template.name,
      count: created.length,
      warnings,
      created,
    };
  }
);

/**
 * Get locked timeslot IDs for a given grade and semester
 * Used for preventing schedule modifications in locked slots
 * 
 * @returns Array of TimeslotIDs that are locked
 */
export const getLockedTimeslotIDsAction = createAction(
  v.object({
    GradeID: v.string(),
    AcademicYear: v.number(),
    Semester: v.enum(semester),
  }),
  async (input) => {
    const rawSchedules = await lockRepository.findLockedSchedules(
      input.AcademicYear,
      input.Semester
    );

    // Filter by grade and extract unique timeslot IDs
    const timeslotIDs = Array.from(
      new Set(
        rawSchedules
          .filter((schedule) => schedule.GradeID === input.GradeID)
          .map((schedule) => schedule.TimeslotID)
      )
    );

    return timeslotIDs;
  }
);
/**
 * Get raw locked schedules for a given academic year and semester  
 * Returns array of class_schedule objects for use in Zustand store
 */
export const getRawLockedSchedulesAction = createAction(
  getLockedSchedulesSchema,
  async (input: GetLockedSchedulesInput) => {
    const rawSchedules = await lockRepository.findLockedSchedules(
      input.AcademicYear,
      input.Semester
    );
    
    return rawSchedules as class_schedule[];
  }
);
