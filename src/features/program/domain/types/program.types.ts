/**
 * Program Domain Types (Prisma-derived with Relations)
 *
 * These types use Prisma's `GetPayload` utility to create strongly-typed
 * representations of program entities with their relations. This eliminates
 * the need for `as unknown as` casts throughout the codebase.
 *
 * @module program.types
 */

import type { Prisma } from "@/prisma/generated/client";

/**
 * Program with gradelevel and program_subject relations (includes subject details)
 * Matches the return shape of programRepository.findById, .findAll, .assignSubjects
 */
export type ProgramWithRelations = Prisma.programGetPayload<{
  include: {
    gradelevel: true;
    program_subject: {
      include: {
        subject: true;
      };
    };
  };
}>;

/**
 * Program subject entry with full subject details
 * Represents a single program_subject row with its related subject
 */
export type ProgramSubjectWithSubject =
  ProgramWithRelations["program_subject"][number];

/**
 * Subject extracted from program_subject relation
 */
export type ProgramSubject = ProgramSubjectWithSubject["subject"];
