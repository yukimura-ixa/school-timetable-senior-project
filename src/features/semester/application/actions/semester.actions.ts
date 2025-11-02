"use server";

/**
 * Semester Server Actions
 * Handle semester CRUD operations with validation
 */

import * as v from "valibot";
import { semesterRepository } from "../../infrastructure/repositories/semester.repository";
import type { semester } from "@/prisma/generated";
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

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Get all semesters with filtering
 */
export async function getSemestersAction(
  filter?: SemesterFilter
): Promise<ActionResult<SemesterDTO[]>> {
  try {
    // Validate filter
    if (filter) {
      v.parse(SemesterFilterSchema, filter);
    }

    const semesters = await semesterRepository.findMany(filter);

    // Enrich with statistics
    const enrichedSemesters = await Promise.all(
      semesters.map(async (semester) => {
        const stats = await semesterRepository.getStatistics(semester.ConfigID);
        return {
          configId: semester.ConfigID,
          academicYear: semester.AcademicYear,
          semester: semester.Semester === "SEMESTER_1" ? 1 : 2,
          status: semester.status,
          isPinned: semester.isPinned,
          configCompleteness: semester.configCompleteness,
          lastAccessedAt: semester.lastAccessedAt,
          publishedAt: semester.publishedAt,
          createdAt: semester.createdAt,
          updatedAt: semester.updatedAt,
          classCount: stats?.classCount || 0,
          teacherCount: stats?.teacherCount || 0,
          roomCount: stats?.roomCount || 0,
          subjectCount: stats?.subjectCount || 0,
        } as SemesterDTO;
      })
    );

    return { success: true, data: enrichedSemesters };
  } catch (err: unknown) {
    console.error("[getSemestersAction] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch semesters";
    return { success: false, error: message };
  }
}

/**
 * Get recent semesters
 */
export async function getRecentSemestersAction(
  limit = 2
): Promise<ActionResult<SemesterDTO[]>> {
  try {
    const semesters = await semesterRepository.findRecent(limit);

    const enrichedSemesters = await Promise.all(
      semesters.map(async (semester) => {
        const stats = await semesterRepository.getStatistics(semester.ConfigID);
        return {
          configId: semester.ConfigID,
          academicYear: semester.AcademicYear,
          semester: semester.Semester === "SEMESTER_1" ? 1 : 2,
          status: semester.status,
          isPinned: semester.isPinned,
          configCompleteness: semester.configCompleteness,
          lastAccessedAt: semester.lastAccessedAt,
          publishedAt: semester.publishedAt,
          createdAt: semester.createdAt,
          updatedAt: semester.updatedAt,
          classCount: stats?.classCount || 0,
          teacherCount: stats?.teacherCount || 0,
          roomCount: 0,
          subjectCount: stats?.subjectCount || 0,
        } as SemesterDTO;
      })
    );

    return { success: true, data: enrichedSemesters };
  } catch (err: unknown) {
    console.error("[getRecentSemestersAction] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch recent semesters";
    return { success: false, error: message };
  }
}

/**
 * Get pinned semesters
 */
export async function getPinnedSemestersAction(): Promise<ActionResult<SemesterDTO[]>> {
  try {
    const semesters = await semesterRepository.findPinned();

    const enrichedSemesters = await Promise.all(
      semesters.map(async (semester) => {
        const stats = await semesterRepository.getStatistics(semester.ConfigID);
        return {
          configId: semester.ConfigID,
          academicYear: semester.AcademicYear,
          semester: semester.Semester === "SEMESTER_1" ? 1 : 2,
          status: semester.status,
          isPinned: semester.isPinned,
          configCompleteness: semester.configCompleteness,
          lastAccessedAt: semester.lastAccessedAt,
          publishedAt: semester.publishedAt,
          createdAt: semester.createdAt,
          updatedAt: semester.updatedAt,
          classCount: stats?.classCount || 0,
          teacherCount: stats?.teacherCount || 0,
          roomCount: 0,
          subjectCount: stats?.subjectCount || 0,
        } as SemesterDTO;
      })
    );

    return { success: true, data: enrichedSemesters };
  } catch (err: unknown) {
    console.error("[getPinnedSemestersAction] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch pinned semesters";
    return { success: false, error: message };
  }
}

/**
 * Create a new semester
 */
export async function createSemesterAction(
  input: CreateSemester
): Promise<ActionResult<SemesterDTO>> {
  try {
    // Validate input
    v.parse(CreateSemesterSchema, input);

    // Check if semester already exists
    const existing = await semesterRepository.findByYearAndSemester(
      input.academicYear,
      input.semester
    );

    if (existing) {
      return {
        success: false,
        error: `ภาคเรียนที่ ${input.semester}/${input.academicYear} มีอยู่ในระบบแล้ว`,
      };
    }

    // Copy config from source if requested
    let configData = {};
    if (input.copyFromConfigId && input.copyConfig) {
      const source = await semesterRepository.findById(input.copyFromConfigId);
      if (source) {
        configData = source.Config;
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
        const targetSemesterEnum = input.semester === 1 ? "SEMESTER_1" : "SEMESTER_2";

        // Copy timeslots using repository method
        await semesterRepository.copyTimeslots(
          sourceYear,
          sourceSemester,
          input.academicYear,
          targetSemesterEnum as semester,
          sourceSemesterNum,
          targetSemesterNum
        );
      }
    }

    const stats = await semesterRepository.getStatistics(newSemester.ConfigID);

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
    console.error("[createSemesterAction] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to create semester";
    return { success: false, error: message };
  }
}

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
        error: "ภาคเรียนต้องเป็น 1 หรือ 2 เท่านั้น",
      };
    }

    // Check if semester already exists
    const existing = await semesterRepository.findByYearAndSemester(
      input.academicYear,
      input.semester
    );

    if (existing) {
      return {
        success: false,
        error: `ภาคเรียนที่ ${input.semester}/${input.academicYear} มีอยู่ในระบบแล้ว`,
      };
    }

    // Prepare semester enum
    const semesterEnum = input.semester === 1 ? "SEMESTER_1" : "SEMESTER_2";

    // Use transaction for atomicity
    const newSemester = await semesterRepository.transaction(async (tx) => {
      // 1. Copy config from source if requested
      let configData = {};
      if (input.copyFromConfigId && input.copyConfig) {
        const source = await tx.table_config.findUnique({
          where: { ConfigID: input.copyFromConfigId },
        });
        if (source) {
          configData = source.Config;
        }
      }

      // 2. Create new semester
      const semester = await tx.table_config.create({
        data: {
          ConfigID: `${input.semester}-${input.academicYear}`,
          AcademicYear: input.academicYear,
          Semester: semesterEnum,
          Config: configData,
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
              data: timeslots.map((ts) => ({
                TimeslotID: ts.TimeslotID.replace(
                  `${sourceSemesterNum}-${sourceYear}`,
                  `${targetSemesterNum}-${input.academicYear}`
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
    console.error("[createSemesterWithTimeslotsAction] Error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to create semester with timeslots";
    return { success: false, error: message };
  }
}

/**
 * Update semester status
 */
export async function updateSemesterStatusAction(
  input: UpdateSemesterStatus
): Promise<ActionResult> {
  try {
    v.parse(UpdateSemesterStatusSchema, input);

    await semesterRepository.updateStatus(input.configId, input.status);

    return { success: true };
  } catch (err: unknown) {
    console.error("[updateSemesterStatusAction] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to update semester status";
    return { success: false, error: message };
  }
}

/**
 * Toggle pin status
 */
export async function pinSemesterAction(input: PinSemester): Promise<ActionResult> {
  try {
    v.parse(PinSemesterSchema, input);

    await semesterRepository.togglePin(input.configId, input.isPinned);

    return { success: true };
  } catch (err: unknown) {
    console.error("[pinSemesterAction] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to pin semester";
    return { success: false, error: message };
  }
}

/**
 * Track semester access
 */
export async function trackSemesterAccessAction(
  input: TrackSemesterAccess
): Promise<ActionResult> {
  try {
    v.parse(TrackSemesterAccessSchema, input);

    await semesterRepository.trackAccess(input.configId);

    return { success: true };
  } catch (err: unknown) {
    console.error("[trackSemesterAccessAction] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to track semester access";
    return { success: false, error: message };
  }
}

/**
 * Copy semester (duplicate with new year/semester)
 */
export async function copySemesterAction(
  input: CopySemester
): Promise<ActionResult<SemesterDTO>> {
  try {
    v.parse(CopySemesterSchema, input);

    // Check if target already exists
    const existing = await semesterRepository.findByYearAndSemester(
      input.targetAcademicYear,
      input.targetSemester
    );

    if (existing) {
      return {
        success: false,
        error: `ภาคเรียนที่ ${input.targetSemester}/${input.targetAcademicYear} มีอยู่ในระบบแล้ว`,
      };
    }

    // Get source semester
    const source = await semesterRepository.findById(input.sourceConfigId);
    if (!source) {
      return { success: false, error: "ไม่พบภาคเรียนต้นทาง" };
    }

    // Create new semester with copied data
    const newSemester = await semesterRepository.create({
      academicYear: input.targetAcademicYear,
      semester: input.targetSemester,
      config: input.copyConfig ? source.Config : {},
    });

    // Copy timeslots if requested
    if (input.copyTimeslots) {
      const sourceSemesterEnum = source.Semester;
      const targetSemesterEnum = input.targetSemester === 1 ? "SEMESTER_1" : "SEMESTER_2";
      
      await semesterRepository.copyTimeslots(
        source.AcademicYear,
        sourceSemesterEnum,
        input.targetAcademicYear,
        targetSemesterEnum as semester,
        source.Semester === "SEMESTER_1" ? 1 : 2,
        input.targetSemester
      );
    }

    const stats = await semesterRepository.getStatistics(newSemester.ConfigID);

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
    console.error("[copySemesterAction] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to copy semester";
    return { success: false, error: message };
  }
}


