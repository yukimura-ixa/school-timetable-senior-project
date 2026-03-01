"use server";

/**
 * Semester Server Actions
 * Handle semester CRUD operations with validation
 */

import * as v from "valibot";
import { createAction, type ActionResult } from "@/shared/lib/action-wrapper";
import { semesterRepository } from "../../infrastructure/repositories/semester.repository";
import { Prisma } from "@/prisma/generated/client";
import type {
  semester,
  table_config,
  timeslot,
} from "@/prisma/generated/client";
import { withPrismaTransaction } from "@/lib/prisma-transaction";
import {
  type SemesterFilter,
  SemesterFilterSchema,
  type CreateSemester,
  CreateSemesterSchema,
  type UpdateSemesterStatus,
  UpdateSemesterStatusSchema,
  type PinSemester,
  PinSemesterSchema,
  type TrackSemesterAccess,
  TrackSemesterAccessSchema,
  type CopySemester,
  CopySemesterSchema,
  type SemesterDTO,
} from "../schemas/semester.schemas";
import type { CreateTimeslotsInput } from "@/features/timeslot/application/schemas/timeslot.schemas";
import { generateTimeslots } from "@/features/timeslot/domain/services/timeslot.service";
import { createLogger } from "@/lib/logger";
import { invalidatePublicCache } from "@/lib/cache-invalidation";

const log = createLogger("SemesterActions");

/**
 * Helper to enrich semester with statistics
 */
async function enrichSemester(semester: table_config): Promise<SemesterDTO> {
  const stats = await semesterRepository.getStatistics(semester.ConfigID);
  return {
    configId: semester.ConfigID,
    academicYear: semester.AcademicYear,
    semester: semester.Semester === "SEMESTER_1" ? 1 : 2,
    status: semester.status,
    isPinned: semester.isPinned,
    configCompleteness: semester.configCompleteness,
    lastAccessedAt: semester.lastAccessedAt ?? undefined,
    publishedAt: semester.publishedAt ?? undefined,
    createdAt: semester.createdAt,
    updatedAt: semester.updatedAt,
    classCount: stats?.classCount || 0,
    teacherCount: stats?.teacherCount || 0,
    roomCount: stats?.roomCount || 0,
    subjectCount: stats?.subjectCount || 0,
  };
}

/**
 * Get all semesters with filtering
 */
export const getSemestersAction = createAction(
  SemesterFilterSchema,
  async (filter: SemesterFilter) => {
    const semesters = await semesterRepository.findMany(filter);
    return await Promise.all(semesters.map(enrichSemester));
  },
);

/**
 * Get recent semesters
 */
const getRecentSemestersSchema = v.object({
  limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(10)), 2),
});

export const getRecentSemestersAction = createAction(
  getRecentSemestersSchema,
  async (input: { limit?: number }) => {
    const semesters = await semesterRepository.findRecent(input.limit ?? 2);
    return await Promise.all(semesters.map(enrichSemester));
  },
);

/**
 * Get pinned semesters
 */
export const getPinnedSemestersAction = createAction(v.object({}), async () => {
  const semesters = await semesterRepository.findPinned();
  return await Promise.all(semesters.map(enrichSemester));
});

/**
 * Create a new semester
 */
export const createSemesterAction = createAction(
  CreateSemesterSchema,
  async (input: CreateSemester) => {
    // Check if semester already exists
    const existing = await semesterRepository.findByYearAndSemester(
      input.academicYear,
      input.semester,
    );

    if (existing) {
      throw new Error(
        `ภาคเรียนที่ ${input.semester}/${input.academicYear} มีอยู่ในระบบแล้ว`,
      );
    }

    // Copy config from source if requested
    let configData: Prisma.InputJsonValue | undefined;
    if (input.copyFromConfigId && input.copyConfig) {
      const source = await semesterRepository.findById(input.copyFromConfigId);
      if (source) {
        configData = (source.Config ?? undefined) as
          | Prisma.InputJsonValue
          | undefined;
      }
    }

    // Create new semester
    const newSemester = await semesterRepository.create({
      academicYear: input.academicYear,
      semester: input.semester,
      config: configData,
    });

    // If copying from previous semester, copy timeslots
    if (input.copyFromConfigId) {
      const source = await semesterRepository.findById(input.copyFromConfigId);
      if (source) {
        const sourceYear = source.AcademicYear;
        const sourceSemester = source.Semester;
        const sourceSemesterNum = sourceSemester === "SEMESTER_1" ? 1 : 2;
        const targetSemesterNum = input.semester;
        const targetSemesterEnum =
          input.semester === 1 ? "SEMESTER_1" : "SEMESTER_2";

        // Copy timeslots using repository method
        await semesterRepository.copyTimeslots(
          sourceYear,
          sourceSemester,
          input.academicYear,
          targetSemesterEnum as semester,
          sourceSemesterNum,
          targetSemesterNum,
        );
      }
    }

    await invalidatePublicCache(["static_data"]);
    return await enrichSemester(newSemester);
  },
);

/**
 * Create semester with timeslots in one atomic transaction
 * Combines semester creation and timeslot generation
 *
 * @param input - Semester data + optional timeslot configuration
 * @returns Created semester with statistics
 *
 * @example
 * ```tsx
 * const result = await createSemesterWithTimeslotsAction({
 *   academicYear: 2567,
 *   semester: 1,
 *   timeslotConfig: {
 *     Days: ["MON", "TUE", "WED", "THU", "FRI"],
 *     StartTime: "08:00",
 *     Duration: 50,
 *     // ... other config
 *   },
 * });
 * ```
 */
export async function createSemesterWithTimeslotsAction(input: {
  academicYear: number;
  semester: number;
  copyFromConfigId?: string;
  copyConfig?: boolean;
  timeslotConfig?: CreateTimeslotsInput;
}): Promise<ActionResult<SemesterDTO>> {
  try {
    // Validate semester number
    if (input.semester !== 1 && input.semester !== 2) {
      return {
        success: false,
        error: {
          message: "ภาคเรียนต้องเป็น 1 หรือ 2 เท่านั้น",
          code: "VALIDATION_ERROR",
        },
      };
    }

    // Check if semester already exists
    const existing = await semesterRepository.findByYearAndSemester(
      input.academicYear,
      input.semester,
    );

    if (existing) {
      return {
        success: false,
        error: {
          message: `ภาคเรียนที่ ${input.semester}/${input.academicYear} มีอยู่ในระบบแล้ว`,
          code: "CONFLICT",
        },
      };
    }

    // Prepare semester enum
    const semesterEnum = input.semester === 1 ? "SEMESTER_1" : "SEMESTER_2";

    // Use transaction for atomicity
    const newSemester = await withPrismaTransaction(async (tx) => {
      // 1. Copy config from source if requested
      let configData: Prisma.InputJsonValue | undefined;
      if (input.copyFromConfigId && input.copyConfig) {
        const source = await tx.table_config.findUnique({
          where: { ConfigID: input.copyFromConfigId },
        });
        if (source) {
          configData = source.Config ?? undefined;
        }
      }

      const normalizedConfig: Prisma.InputJsonValue = configData ?? {};

      // 2. Create new semester
      const semester = await tx.table_config.create({
        data: {
          ConfigID: `${input.semester}-${input.academicYear}`,
          AcademicYear: input.academicYear,
          Semester: semesterEnum,
          Config: normalizedConfig,
          status: "DRAFT",
          isPinned: false,
          configCompleteness: 0,
        },
      });

      // 3. Create timeslots if config provided
      if (input.timeslotConfig) {
        // Validate no existing timeslots (should never happen in transaction)
        const existingTimeslots = await tx.timeslot.findFirst({
          where: {
            AcademicYear: input.academicYear,
            Semester: semesterEnum,
          },
        });

        if (existingTimeslots) {
          throw new Error("มีตารางเวลาสำหรับภาคเรียนนี้อยู่แล้ว");
        }

        // Generate and create timeslots
        const timeslots = generateTimeslots({
          ...input.timeslotConfig,
          AcademicYear: input.academicYear,
          Semester: semesterEnum,
        });

        await tx.timeslot.createMany({
          data: timeslots,
        });

        // Update config completeness (timeslots configured)
        await tx.table_config.update({
          where: { ConfigID: semester.ConfigID },
          data: { configCompleteness: 25 }, // 25% complete after timeslots
        });
      }

      // 4. Copy timeslots from source if requested (and no new config)
      if (input.copyFromConfigId && !input.timeslotConfig) {
        const source = await tx.table_config.findUnique({
          where: { ConfigID: input.copyFromConfigId },
        });

        if (source) {
          const sourceYear = source.AcademicYear;
          const sourceSemester = source.Semester;

          const timeslots = await tx.timeslot.findMany({
            where: {
              AcademicYear: sourceYear,
              Semester: sourceSemester,
            },
          });

          if (timeslots.length > 0) {
            const sourceSemesterNum = sourceSemester === "SEMESTER_1" ? 1 : 2;
            const targetSemesterNum = input.semester;

            await tx.timeslot.createMany({
              data: timeslots.map((ts: timeslot) => ({
                TimeslotID: ts.TimeslotID.replace(
                  `${sourceSemesterNum}-${sourceYear}`,
                  `${targetSemesterNum}-${input.academicYear}`,
                ),
                AcademicYear: input.academicYear,
                Semester: semesterEnum,
                StartTime: ts.StartTime,
                EndTime: ts.EndTime,
                Breaktime: ts.Breaktime,
                DayOfWeek: ts.DayOfWeek,
              })),
              skipDuplicates: true,
            });

            // Update config completeness
            await tx.table_config.update({
              where: { ConfigID: semester.ConfigID },
              data: { configCompleteness: 25 },
            });
          }
        }
      }

      return semester;
    });

    // 5. Get statistics
    const stats = await semesterRepository.getStatistics(newSemester.ConfigID);

    await invalidatePublicCache(["static_data"]);
    return {
      success: true,
      data: {
        configId: newSemester.ConfigID,
        academicYear: newSemester.AcademicYear,
        semester: newSemester.Semester === "SEMESTER_1" ? 1 : 2,
        status: newSemester.status,
        isPinned: newSemester.isPinned,
        configCompleteness: newSemester.configCompleteness,
        lastAccessedAt: newSemester.lastAccessedAt,
        publishedAt: newSemester.publishedAt,
        createdAt: newSemester.createdAt,
        updatedAt: newSemester.updatedAt,
        classCount: stats?.classCount || 0,
        teacherCount: stats?.teacherCount || 0,
        roomCount: 0,
        subjectCount: stats?.subjectCount || 0,
      } as SemesterDTO,
    };
  } catch (err: unknown) {
    log.logError(err, { action: "createSemesterWithTimeslots" });
    const message =
      err instanceof Error
        ? err.message
        : "Failed to create semester with timeslots";
    return {
      success: false,
      error: {
        message,
        code: "INTERNAL_ERROR",
      },
    };
  }
}

/**
 * Update semester status
 */
export const updateSemesterStatusAction = createAction(
  UpdateSemesterStatusSchema,
  async (input: UpdateSemesterStatus) => {
    await semesterRepository.updateStatus(input.configId, input.status);
    await invalidatePublicCache(["static_data"]);
    return { success: true };
  },
);

/**
 * Toggle pin status
 */
export const pinSemesterAction = createAction(
  PinSemesterSchema,
  async (input: PinSemester) => {
    await semesterRepository.togglePin(input.configId, input.isPinned);
    await invalidatePublicCache(["static_data"]);
    return { success: true };
  },
);

/**
 * Track semester access
 */
export const trackSemesterAccessAction = createAction(
  TrackSemesterAccessSchema,
  async (input: TrackSemesterAccess) => {
    await semesterRepository.trackAccess(input.configId);
    await invalidatePublicCache(["static_data"]);
    return { success: true };
  },
);

/**
 * Copy semester (duplicate with new year/semester)
 */
export const copySemesterAction = createAction(
  CopySemesterSchema,
  async (input: CopySemester) => {
    // Check if target already exists
    const existing = await semesterRepository.findByYearAndSemester(
      input.targetAcademicYear,
      input.targetSemester,
    );

    if (existing) {
      throw new Error(
        `ภาคเรียนที่ ${input.targetSemester}/${input.targetAcademicYear} มีอยู่ในระบบแล้ว`,
      );
    }

    // Get source semester
    const source = await semesterRepository.findById(input.sourceConfigId);
    if (!source) {
      throw new Error("ไม่พบภาคเรียนต้นทาง");
    }

    // Create new semester with copied data
    const newSemester = await semesterRepository.create({
      academicYear: input.targetAcademicYear,
      semester: input.targetSemester,
      config: input.copyConfig
        ? (source.Config as Prisma.InputJsonValue)
        : ({} as Prisma.InputJsonValue),
    });

    // Copy timeslots if requested
    if (input.copyTimeslots) {
      const sourceSemesterEnum = source.Semester;
      const targetSemesterEnum =
        input.targetSemester === 1 ? "SEMESTER_1" : "SEMESTER_2";

      await semesterRepository.copyTimeslots(
        source.AcademicYear,
        sourceSemesterEnum,
        input.targetAcademicYear,
        targetSemesterEnum as semester,
        source.Semester === "SEMESTER_1" ? 1 : 2,
        input.targetSemester,
      );
    }

    await invalidatePublicCache(["static_data"]);
    return await enrichSemester(newSemester);
  },
);
