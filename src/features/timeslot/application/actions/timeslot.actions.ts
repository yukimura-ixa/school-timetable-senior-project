/**
 * Application Layer: Timeslot Server Actions
 *
 * Server Actions for timeslot management feature.
 * Handles complex timeslot generation and cascade deletion.
 *
 * @module timeslot.actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { createAction } from "@/shared/lib/action-wrapper";
import { timeslotRepository } from "../../infrastructure/repositories/timeslot.repository";
import { withPrismaTransaction } from "@/lib/prisma-transaction";
import {
  generateTimeslots,
  sortTimeslots,
  validateNoExistingTimeslots,
  validateTimeslotsExist,
} from "../../domain/services/timeslot.service";
import {
  createTimeslotsSchema,
  getTimeslotsByTermSchema,
  deleteTimeslotsByTermSchema,
  getTimeslotByIdSchema,
  type CreateTimeslotsInput,
  type GetTimeslotsByTermInput,
  type DeleteTimeslotsByTermInput,
  type GetTimeslotByIdInput,
} from "../schemas/timeslot.schemas";
import { invalidatePublicCache } from "@/lib/cache-invalidation";

/**
 * Get timeslots for a specific academic year and semester
 * Returns sorted timeslots (by day and slot number)
 *
 * @param input - AcademicYear and Semester
 * @returns Sorted array of timeslots
 *
 * @example
 * ```tsx
 * const result = await getTimeslotsByTermAction({
 *   AcademicYear: 2567,
 *   Semester: "SEMESTER_1",
 * });
 * if (result.success) {
 *   console.log(result.data); // timeslot[] sorted by day and slot
 * }
 * ```
 */
export const getTimeslotsByTermAction = createAction(
  getTimeslotsByTermSchema,
  async (input: GetTimeslotsByTermInput) => {
    const timeslots = await timeslotRepository.findByTerm(
      input.AcademicYear,
      input.Semester,
    );

    // Apply custom sorting
    const sorted = sortTimeslots(timeslots);

    return sorted;
  },
);

/**
 * Get a single timeslot by ID
 *
 * @param input - TimeslotID
 * @returns Single timeslot or null
 *
 * @example
 * ```tsx
 * const result = await getTimeslotByIdAction({ TimeslotID: "1/2567-MON1" });
 * if (result.success) {
 *   console.log(result.data); // timeslot | null
 * }
 * ```
 */
export const getTimeslotByIdAction = createAction(
  getTimeslotByIdSchema,
  async (input: GetTimeslotByIdInput) => {
    const timeslot = await timeslotRepository.findById(input.TimeslotID);
    return timeslot;
  },
);

/**
 * Create timeslots for a term based on configuration
 * Generates multiple timeslots, creates table_config, and uses transaction for atomicity
 *
 * Complex logic:
 * - Validates no existing timeslots for the term
 * - Generates timeslots from configuration (calculates start/end times, breaks)
 * - Creates table_config record
 * - Creates all timeslots
 * - Uses Prisma transaction for atomicity
 *
 * @param input - Configuration for timeslot generation
 * @returns Success message with count
 *
 * @example
 * ```tsx
 * const result = await createTimeslotsAction({
 *   AcademicYear: 2567,
 *   Semester: "SEMESTER_1",
 *   Days: ["MON", "TUE", "WED", "THU", "FRI"],
 *   StartTime: "08:00",
 *   Duration: 50,
 *   BreakDuration: 15,
 *   TimeslotPerDay: 8,
 *   HasMinibreak: true,
 *   MiniBreak: { SlotNumber: 3, Duration: 10 },
 *   BreakTimeslots: { Junior: 4, Senior: 5 },
 * });
 * ```
 */
export const createTimeslotsAction = createAction(
  createTimeslotsSchema,
  async (input: CreateTimeslotsInput) => {
    // Validate no existing timeslots
    const existingError = await validateNoExistingTimeslots(
      input.AcademicYear,
      input.Semester,
    );
    if (existingError) {
      throw new Error(existingError);
    }

    // Generate timeslots from configuration
    const timeslots = generateTimeslots(input);

    // Use transaction to create table_config and timeslots atomically
    const semesterNum =
      input.Semester === "SEMESTER_1"
        ? "1"
        : input.Semester === "SEMESTER_2"
          ? "2"
          : "3";
    const configId = `${semesterNum}-${input.AcademicYear}`;

    await withPrismaTransaction(async (tx) => {
      // Create or update table config with canonical ConfigID format
      await tx.table_config.upsert({
        where: {
          ConfigID: configId,
        },
        create: {
          ConfigID: configId,
          AcademicYear: input.AcademicYear,
          Semester: input.Semester,
          Config: input,
          configCompleteness: 25, // 25% complete after timeslots configured
        },
        update: {
          Config: input,
          configCompleteness: 25, // Update to 25% when reconfiguring timeslots
        },
      });

      // Create all timeslots
      await tx.timeslot.createMany({
        data: timeslots,
      });
    });

    // Revalidate paths to ensure UI sees fresh data (Next.js 16 cache invalidation)
    revalidatePath("/dashboard");
    revalidatePath(`/schedule/${input.AcademicYear}/${semesterNum}`);

    await invalidatePublicCache(["static_data"]);
    return {
      message: "สร้างตารางเวลาสำเร็จ",
      count: timeslots.length,
    };
  },
);

/**
 * Delete timeslots for a term with cascade cleanup
 * Deletes table_config, timeslots, and teacher responsibilities
 *
 * Uses transaction to ensure all deletes succeed or all fail
 *
 * @param input - AcademicYear and Semester
 * @returns Success message
 *
 * @example
 * ```tsx
 * const result = await deleteTimeslotsByTermAction({
 *   AcademicYear: 2567,
 *   Semester: "SEMESTER_1",
 * });
 * ```
 */
export const deleteTimeslotsByTermAction = createAction(
  deleteTimeslotsByTermSchema,
  async (input: DeleteTimeslotsByTermInput) => {
    // Validate timeslots exist
    const existsError = await validateTimeslotsExist(
      input.AcademicYear,
      input.Semester,
    );
    if (existsError) {
      throw new Error(existsError);
    }

    // Use transaction for cascade deletion
    await withPrismaTransaction(async (tx) => {
      // Delete table config with canonical ConfigID format
      const semesterNum =
        input.Semester === "SEMESTER_1"
          ? "1"
          : input.Semester === "SEMESTER_2"
            ? "2"
            : "3";
      const configId = `${semesterNum}-${input.AcademicYear}`;
      await tx.table_config.delete({
        where: {
          ConfigID: configId,
        },
      });

      // Delete all timeslots
      await tx.timeslot.deleteMany({
        where: {
          AcademicYear: input.AcademicYear,
          Semester: input.Semester,
        },
      });

      // Delete all teacher responsibilities for this term
      await tx.teachers_responsibility.deleteMany({
        where: {
          AcademicYear: input.AcademicYear,
          Semester: input.Semester,
        },
      });
    });

    await invalidatePublicCache(["static_data"]);
    return {
      message: "ลบตารางเวลาสำเร็จ",
    };
  },
);

/**
 * Get total timeslot count (statistics)
 *
 * @returns Total count of all timeslots
 *
 * @example
 * ```tsx
 * const result = await getTimeslotCountAction();
 * if (result.success) {
 *   console.log(`Total: ${result.data.count}`);
 * }
 * ```
 */
export async function getTimeslotCountAction() {
  try {
    const count = await timeslotRepository.count();
    return { success: true as const, data: { count } };
  } catch {
    return {
      success: false as const,
      error: "ไม่สามารถนับจำนวนช่วงเวลาได้",
    };
  }
}

/**
 * Get timeslot count for a specific term (statistics)
 *
 * @param input - AcademicYear and Semester
 * @returns Count of timeslots for the term
 *
 * @example
 * ```tsx
 * const result = await getTimeslotCountByTermAction({
 *   AcademicYear: 2567,
 *   Semester: "SEMESTER_1",
 * });
 * ```
 */
export const getTimeslotCountByTermAction = createAction(
  getTimeslotsByTermSchema,
  async (input: GetTimeslotsByTermInput) => {
    const count = await timeslotRepository.countByTerm(
      input.AcademicYear,
      input.Semester,
    );
    return { count };
  },
);
