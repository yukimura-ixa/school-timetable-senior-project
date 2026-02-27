/**
 * Maps Prisma SubjectCategory enum to validation category strings
 *
 * Prisma schema defines: CORE, ADDITIONAL, ACTIVITY
 * Validation code expects: CORE, ELECTIVE, ACTIVITY
 *
 * This mapper bridges the gap between database enum and validation logic.
 *
 * @module utils/moe-category-mapper
 */

import type { SubjectCategory } from "@/prisma/generated/client";

/**
 * Map Prisma SubjectCategory to validation code category
 *
 * @param prismaCategory - Category from Prisma database
 * @returns Validation category string
 */
export function mapSubjectCategory(
  prismaCategory: SubjectCategory,
): "CORE" | "ELECTIVE" | "ACTIVITY" {
  switch (prismaCategory) {
    case "CORE":
      return "CORE";
    case "ADDITIONAL":
      return "ELECTIVE"; // Prisma ADDITIONAL = validation ELECTIVE
    case "ACTIVITY":
      return "ACTIVITY";
    default: {
      const _exhaustive: never = prismaCategory;
      return _exhaustive;
    }
  }
}

/**
 * Check if a Prisma category is an elective (ADDITIONAL in DB)
 */
export function isElectiveCategory(category: SubjectCategory): boolean {
  return mapSubjectCategory(category) === "ELECTIVE";
}

/**
 * Check if a Prisma category is core
 */
export function isCoreCategory(category: SubjectCategory): boolean {
  return mapSubjectCategory(category) === "CORE";
}

/**
 * Check if a Prisma category is an activity
 */
export function isActivityCategory(category: SubjectCategory): boolean {
  return mapSubjectCategory(category) === "ACTIVITY";
}
