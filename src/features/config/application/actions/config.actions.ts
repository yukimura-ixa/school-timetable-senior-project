/**
 * Config Feature - Server Actions
 * 
 * Server Actions for managing table_config (timetable configuration).
 * Includes complex copy operation for cloning entire term configurations.
 * Uses React 19 Server Actions with 'use server' directive.
 */

'use server';

import { createAction } from '@/shared/lib/action-wrapper';
import type { table_config, timeslot, teachers_responsibility } from '@/prisma/generated';
import { Prisma } from '@/prisma/generated';
import * as v from 'valibot';
import * as configRepository from '../../infrastructure/repositories/config.repository';
import { withPrismaTransaction } from '@/lib/prisma-transaction';
import {
  validateConfigExists,
  validateNoDuplicateConfig,
  validateCopyInput,
  parseConfigID,
  replaceConfigIDInString,
  parseSemesterEnum,
} from '../../domain/services/config-validation.service';
import type { ConfigData } from '../../domain/types/config-data.types';
import {
  getConfigByTermSchema,
  createConfigSchema,
  updateConfigSchema,
  deleteConfigSchema,
  copyConfigSchema,
  type GetConfigByTermInput,
  type CreateConfigInput,
  type UpdateConfigInput,
  type DeleteConfigInput,
  type CopyConfigInput,
} from '../schemas/config.schemas';

/**
 * Get all configs ordered by ConfigID
 */
export const getAllConfigsAction = createAction(
  v.object({}),
  async () => {
    const configs = await configRepository.findAll();
    return configs;
  }
);

/**
 * Get config by academic year and semester
 */
export const getConfigByTermAction = createAction(
  getConfigByTermSchema,
  async (input: GetConfigByTermInput) => {
    const config = await configRepository.findByTerm(
      input.AcademicYear,
      input.Semester
    );

    if (!config) {
      throw new Error('ไม่พบการตั้งค่าสำหรับปีการศึกษาและภาคเรียนนี้');
    }

    return config;
  }
);

/**
 * Create a new config
 */
export const createConfigAction = createAction(
  createConfigSchema,
  async (input: CreateConfigInput) => {
    // Validate no duplicate by term
    const duplicateError = await validateNoDuplicateConfig(
      input.AcademicYear,
      input.Semester
    );

    if (duplicateError) {
      throw new Error(duplicateError);
    }

    const config = await configRepository.create({
      ConfigID: input.ConfigID,
      AcademicYear: input.AcademicYear,
      Semester: input.Semester,
      Config: input.Config as ConfigData,
    });

    return config;
  }
);

/**
 * Update an existing config
 */
export const updateConfigAction = createAction(
  updateConfigSchema,
  async (input: UpdateConfigInput) => {
    // Validate config exists
    const existsError = await validateConfigExists(input.ConfigID);
    if (existsError) {
      throw new Error(existsError);
    }

    // If updating AcademicYear or Semester, check for duplicates
    if (input.AcademicYear !== undefined || input.Semester !== undefined) {
      const existing = await configRepository.findByConfigId(input.ConfigID);
      if (existing) {
        const newYear = input.AcademicYear ?? existing.AcademicYear;
        const newSemester = input.Semester ?? existing.Semester;

        const duplicateError = await validateNoDuplicateConfig(
          newYear,
          newSemester,
          input.ConfigID
        );

        if (duplicateError) {
          throw new Error(duplicateError);
        }
      }
    }

    const config = await configRepository.update(input.ConfigID, {
      AcademicYear: input.AcademicYear,
      Semester: input.Semester,
      Config: input.Config as ConfigData,
    });

    return config;
  }
);

/**
 * Delete a config by ConfigID
 */
export const deleteConfigAction = createAction(
  deleteConfigSchema,
  async (configId: DeleteConfigInput) => {
    // Validate config exists
    const existsError = await validateConfigExists(configId);
    if (existsError) {
      throw new Error(existsError);
    }

    const config = await configRepository.deleteById(configId);

    return config;
  }
);

/**
 * Copy config from one term to another
 * Complex operation that copies:
 * 1. table_config (Config JSON)
 * 2. timeslots (with ID replacement)
 * 3. Optionally: teachers_responsibility (assign flag)
 * 4. Optionally: locked class_schedule (lock flag)
 * 5. Optionally: non-locked class_schedule (timetable flag)
 * 
 * Uses Prisma transaction for atomicity
 */
export const copyConfigAction = createAction(
  copyConfigSchema,
  async (input: CopyConfigInput) => {
    // Validate copy input
    const copyError = await validateCopyInput(input.from, input.to);
    if (copyError) {
      throw new Error(copyError);
    }

    // Parse ConfigIDs
    const fromParsed = parseConfigID(input.from);
    const toParsed = parseConfigID(input.to);

    const fromSemester = parseSemesterEnum(fromParsed.semester);
    const toSemester = parseSemesterEnum(toParsed.semester);

    // Execute copy operation in transaction
    const result = await withPrismaTransaction(async (tx) => {
      // 1. Copy table_config
      const fromConfig: table_config | null = await tx.table_config.findUnique({
        where: { ConfigID: input.from },
      });

      if (!fromConfig) {
        throw new Error(`ไม่พบการตั้งค่าต้นทาง (${input.from})`);
      }

      const newConfig: table_config = await tx.table_config.create({
        data: {
          ConfigID: input.to,
          Semester: toSemester,
          AcademicYear: toParsed.academicYear,
          Config: (fromConfig.Config ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        },
      });

      // 2. Copy timeslots
      const fromSlots: timeslot[] = await tx.timeslot.findMany({
        where: {
          AcademicYear: fromParsed.academicYear,
          Semester: fromSemester,
        },
      });

      const toSlots = fromSlots.map((slot) => ({
        TimeslotID: replaceConfigIDInString(slot.TimeslotID, input.from, input.to),
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

      let copiedAssignments = 0;
      let copiedLocks = 0;
      let copiedTimetables = 0;

      // 3. Copy teachers_responsibility (if assign flag is true)
      if (input.assign) {
        const fromResp: teachers_responsibility[] = await tx.teachers_responsibility.findMany({
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

        // Use skipDuplicates instead of manual checking - idempotent operation
        const created = await tx.teachers_responsibility.createMany({
          data: toResp,
          skipDuplicates: true,
        });

        copiedAssignments = created.count;

        // Get new responsibilities for class_schedule connections
        const newResp: teachers_responsibility[] = await tx.teachers_responsibility.findMany({
          where: {
            AcademicYear: toParsed.academicYear,
            Semester: toSemester,
          },
        });

        // 4. Copy locked class_schedule (if lock flag is true)
        if (input.lock) {
          const fromLock: Array<{
            ClassID: string;
            TimeslotID: string;
            SubjectCode: string;
            RoomID: number | null;
            GradeID: string;
            IsLocked: boolean;
            teachers_responsibility: teachers_responsibility[];
          }> = await tx.class_schedule.findMany({
            where: {
              IsLocked: true,
              timeslot: {
                AcademicYear: fromParsed.academicYear,
                Semester: fromSemester,
              },
            },
            include: {
              teachers_responsibility: true,
            },
          });

          // Build responsibility lookup map for O(1) access
          const respLookupMap = new Map<string, number[]>();
          for (const resp of newResp) {
            if (resp.Semester === toSemester) {
              const key = `${resp.GradeID}|${resp.SubjectCode}`;
              if (!respLookupMap.has(key)) {
                respLookupMap.set(key, []);
              }
              respLookupMap.get(key)!.push(resp.RespID);
            }
          }

          // Parallel creates for better performance
          const lockCreatePromises = fromLock.map(async (lock) => {
            const newTimeslotID = replaceConfigIDInString(
              lock.TimeslotID,
              input.from,
              input.to
            );
            const newClassID = replaceConfigIDInString(
              lock.ClassID,
              input.from,
              input.to
            );

            // Use lookup map instead of filtering
            const key = `${lock.GradeID}|${lock.SubjectCode}`;
            const newRespIDs = respLookupMap.get(key) || [];

            try {
              await tx.class_schedule.create({
                data: {
                  ClassID: newClassID,
                  TimeslotID: newTimeslotID,
                  SubjectCode: lock.SubjectCode,
                  RoomID: lock.RoomID,
                  GradeID: lock.GradeID,
                  IsLocked: true,
                  teachers_responsibility: {
                    connect: newRespIDs.map((id) => ({ RespID: id })),
                  },
                },
              });
              return true;
            } catch (error) {
              // Skip if already exists or error (idempotent)
              console.error('Error copying locked schedule:', error);
              return false;
            }
          });

          const lockResults = await Promise.all(lockCreatePromises);
          copiedLocks = lockResults.filter(Boolean).length;
        }

        // 5. Copy non-locked class_schedule (if timetable flag is true)
        if (input.timetable) {
          const fromTimetable: Array<{
            ClassID: string;
            TimeslotID: string;
            SubjectCode: string;
            RoomID: number | null;
            GradeID: string;
            IsLocked: boolean;
            teachers_responsibility: teachers_responsibility[];
          }> = await tx.class_schedule.findMany({
            where: {
              IsLocked: false,
              timeslot: {
                AcademicYear: fromParsed.academicYear,
                Semester: fromSemester,
              },
            },
            include: {
              teachers_responsibility: true,
            },
          });

          // Build responsibility lookup map for O(1) access (reuse if lock was copied)
          const respLookupMap = new Map<string, number[]>();
          for (const resp of newResp) {
            if (resp.Semester === toSemester) {
              const key = `${resp.GradeID}|${resp.SubjectCode}`;
              if (!respLookupMap.has(key)) {
                respLookupMap.set(key, []);
              }
              respLookupMap.get(key)!.push(resp.RespID);
            }
          }

          // Parallel creates for better performance
          const timetableCreatePromises = fromTimetable.map(async (schedule) => {
            const newTimeslotID = replaceConfigIDInString(
              schedule.TimeslotID,
              input.from,
              input.to
            );
            const newClassID = replaceConfigIDInString(
              schedule.ClassID,
              input.from,
              input.to
            );

            // Use lookup map instead of filtering
            const key = `${schedule.GradeID}|${schedule.SubjectCode}`;
            const newRespIDs = respLookupMap.get(key) || [];

            try {
              await tx.class_schedule.create({
                data: {
                  ClassID: newClassID,
                  TimeslotID: newTimeslotID,
                  SubjectCode: schedule.SubjectCode,
                  RoomID: schedule.RoomID,
                  GradeID: schedule.GradeID,
                  IsLocked: false,
                  teachers_responsibility: {
                    connect: newRespIDs.map((id) => ({ RespID: id })),
                  },
                },
              });
              return true;
            } catch (error) {
              // Skip if already exists or error (idempotent)
              console.error('Error copying timetable schedule:', error);
              return false;
            }
          });

          const timetableResults = await Promise.all(timetableCreatePromises);
          copiedTimetables = timetableResults.filter(Boolean).length;
        }
      }

      return {
        config: newConfig,
        timeslots: toSlots.length,
        assignments: copiedAssignments,
        locks: copiedLocks,
        timetables: copiedTimetables,
      };
    });

    return result;
  }
);

/**
 * Get count of all configs
 */
export const getConfigCountAction = createAction(
  v.object({}),
  async () => {
    const count = await configRepository.count();
    return { count };
  }
);

/**
 * Update config and regenerate timeslots
 * 
 * This action updates the table_config and regenerates all timeslots.
 * Use when configuration changes require new timeslot generation.
 * 
 * Steps:
 * 1. Validate config exists
 * 2. Delete existing timeslots and teacher responsibilities
 * 3. Update config
 * 4. Regenerate timeslots with new configuration
 * 
 * @param input - UpdateConfigInput with Config data
 * @returns Updated config with timeslot count
 * 
 * @example
 * ```tsx
 * const result = await updateConfigWithTimeslotsAction({
 *   ConfigID: "1-2567",
 *   Config: {
 *     Days: ["MON", "TUE", "WED", "THU", "FRI"],
 *     StartTime: "08:30",
 *     Duration: 50,
 *     TimeslotPerDay: 9, // Changed from 8 to 9
 *     // ... rest of config
 *   }
 * });
 * ```
 */
export const updateConfigWithTimeslotsAction = createAction(
  updateConfigSchema,
  async (input: UpdateConfigInput) => {
    // Validate config exists
    const existsError = await validateConfigExists(input.ConfigID);
    if (existsError) {
      throw new Error(existsError);
    }

    // Import timeslot service for regeneration
    const { generateTimeslots } = await import(
      '../../../timeslot/domain/services/timeslot.service'
    );

    // Get existing config to extract AcademicYear and Semester
    const existingConfig = await configRepository.findByConfigId(input.ConfigID);
    if (!existingConfig) {
      throw new Error('ไม่พบการตั้งค่า');
    }

    // Use transaction to ensure atomicity
    const result = await withPrismaTransaction(async (tx) => {
      // Step 1: Delete existing teacher responsibilities
      await tx.teachers_responsibility.deleteMany({
        where: {
          AcademicYear: existingConfig.AcademicYear,
          Semester: existingConfig.Semester,
        },
      });

      // Step 2: Delete existing timeslots
      await tx.timeslot.deleteMany({
        where: {
          AcademicYear: existingConfig.AcademicYear,
          Semester: existingConfig.Semester,
        },
      });

      // Step 3: Update config
      const updatedConfig: table_config = await tx.table_config.update({
        where: { ConfigID: input.ConfigID },
        data: {
          Config: input.Config as ConfigData,
        },
      });

      // Step 4: Generate new timeslots
      const configData = input.Config as ConfigData;
      const newTimeslots = generateTimeslots({
        AcademicYear: existingConfig.AcademicYear,
        Semester: existingConfig.Semester,
        Days: configData.Days,
        StartTime: configData.StartTime,
        Duration: configData.Duration,
        BreakDuration: configData.BreakDuration,
        TimeslotPerDay: configData.TimeslotPerDay,
        HasMinibreak: configData.HasMinibreak,
        MiniBreak: configData.MiniBreak ?? { SlotNumber: 0, Duration: 0 },
        BreakTimeslots: configData.BreakTimeslots,
      });

      // Step 5: Create new timeslots
      await tx.timeslot.createMany({
        data: newTimeslots,
      });

      return {
        config: updatedConfig,
        timeslotCount: newTimeslots.length,
      };
    });

    return result;
  }
);
