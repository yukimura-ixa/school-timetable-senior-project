/**
 * Assign Feature - Validation Service (Domain Layer)
 *
 * Pure functions for teacher assignment business logic and validation.
 * No side effects, no database access - only business rules.
 */

import { teachers_responsibility, semester, SubjectCategory, subject_credit } from "@/prisma/generated/client"; // Added imports
import { ResponsibilityOutput } from "../../application/schemas/assign.schemas";

type ExpandedSlot = {
  AcademicYear: number;
  GradeID: string;
  RespID: number;
  Semester: semester;
  SubjectCode: string;
  TeachHour: number;
  TeacherID: number;
  subject: {
    SubjectName: string;
    Credit: subject_credit;
    Category: SubjectCategory;
  };
  gradelevel?: {
    Year: number;
    Number: number;
  };
  SubjectName: string;
  itemID: number;
};

/**
 * Credit to teaching hours mapping
 * TeachHour = Credit × 2
 */
export const CREDIT_TO_TEACH_HOUR: Record<string, number> = {
  "0.5": 1, // 0.5 × 2 = 1
  "1.0": 2, // 1.0 × 2 = 2
  "1.5": 3, // 1.5 × 2 = 3
  "2.0": 4, // 2.0 × 2 = 4
  "2.5": 5, // 2.5 × 2 = 5
  "3.0": 6, // 3.0 × 2 = 6
};

/**
 * Calculate teaching hours from credit value
 *
 * @param credit - Credit value as string (e.g., "1.0", "1.5")
 * @returns Teaching hours (Credit × 2)
 *
 * @example
 * calculateTeachHour("1.5") // returns 3
 * calculateTeachHour("2.0") // returns 4
 */
export function calculateTeachHour(credit: string): number {
  const teachHour = CREDIT_TO_TEACH_HOUR[credit];

  if (teachHour === undefined) {
    throw new Error(`Invalid credit value: ${credit}`);
  }

  return teachHour;
}

/**
 * Validate responsibility input fields
 *
 * @param input - Responsibility input to validate
 * @returns Validation result with error messages
 */
export function validateResponsibilityInput(input: ResponsibilityOutput): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate SubjectCode
  if (!input.SubjectCode || input.SubjectCode.trim().length === 0) {
    errors.push("SubjectCode is required");
  }
  if (input.SubjectCode.length > 20) {
    errors.push("SubjectCode must be at most 20 characters");
  }

  // Validate GradeID format (canonical: "M{year}-{section}", e.g., "M1-1")
  const gradeIdPattern = /^M\d+-\d+$/;
  if (!gradeIdPattern.test(input.GradeID)) {
    errors.push('GradeID must be in format "M{year}-{section}" (e.g., "M1-1")');
  }

  // Validate Credit - input.Credit is string from picklist
  const creditStr = String(input.Credit);
  if (!CREDIT_TO_TEACH_HOUR[creditStr]) {
    errors.push(
      `Invalid credit value: ${creditStr}. Must be one of: ${Object.keys(CREDIT_TO_TEACH_HOUR).join(", ")}`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Compute difference between existing and incoming responsibilities
 * Returns which responsibilities to create and which to delete
 *
 * @param existing - Current responsibilities in database
 * @param incoming - New responsibilities from input
 * @returns Object with toCreate and toDelete arrays
 */
export function computeResponsibilitiesDiff(
  existing: teachers_responsibility[],
  incoming: ResponsibilityOutput[],
): {
  toCreate: ResponsibilityOutput[];
  toDelete: teachers_responsibility[];
} {
  // Find responsibilities to create (incoming without RespID)
  const toCreate = incoming.filter((resp) => !resp.RespID);

  // Find responsibilities to delete (existing not in incoming)
  const incomingIds = new Set(
    incoming.filter((resp) => resp.RespID).map((resp) => resp.RespID!),
  );
  const toDelete = existing.filter((resp) => !incomingIds.has(resp.RespID));

  return { toCreate, toDelete };
}

/**
 * Expand responsibilities into available slot items
 * Each responsibility is expanded by (TeachHour - assigned_count)
 *
 * @param responsibilities - Responsibilities with class_schedule relation
 * @returns Array of expanded slots with itemID
 *
 * @example
 * // If TeachHour = 4 and assigned = 2, creates 2 available slots
 * expandAvailableSlots([{ TeachHour: 4, class_schedule: [{}, {}], ... }])
 */
export function expandAvailableSlots<
  T extends {
    TeachHour: number;
    class_schedule: unknown[];
    subject: { SubjectName: string; Credit: subject_credit; Category: SubjectCategory };
    AcademicYear: number;
    GradeID: string;
    RespID: number;
    Semester: semester;
    SubjectCode: string;
    TeacherID: number;
    gradelevel?: { Year: number; Number: number };
  },
>(responsibilities: T[]): ExpandedSlot[] { // Changed return type here
  const slots: ExpandedSlot[] = []; // Changed type here

  for (const resp of responsibilities) {
    const availableSlots = resp.TeachHour - resp.class_schedule.length;

    // Expand this responsibility into N available slots
    for (let i = 0; i < availableSlots; i++) {
      // Explicitly construct ExpandedSlot
      slots.push({
        AcademicYear: resp.AcademicYear,
        GradeID: resp.GradeID,
        RespID: resp.RespID,
        Semester: resp.Semester,
        SubjectCode: resp.SubjectCode,
        TeachHour: resp.TeachHour,
        TeacherID: resp.TeacherID,
        subject: {
          SubjectName: resp.subject.SubjectName,
          Credit: resp.subject.Credit,
          Category: resp.subject.Category,
        },
        gradelevel: resp.gradelevel ? {
          Year: resp.gradelevel.Year,
          Number: resp.gradelevel.Number
        } : undefined,
        SubjectName: resp.subject.SubjectName,
        itemID: slots.length + 1, // 1-based index
      });
    }
  }

  return slots;
}

/**
 * Validate semester value
 *
 * @param semester - Semester string to validate
 * @returns True if valid, false otherwise
 */
export function validateSemester(semester: string): boolean {
  return semester === "SEMESTER_1" || semester === "SEMESTER_2";
}

/**
 * Check if responsibility has conflicts with existing assignments
 * (e.g., same teacher + subject + grade)
 *
 * @param input - New responsibility input
 * @param existing - Existing responsibilities
 * @returns True if conflict exists, false otherwise
 */
export function hasResponsibilityConflict(
  input: ResponsibilityOutput,
  existing: teachers_responsibility[],
): boolean {
  return existing.some(
    (resp) =>
      resp.SubjectCode === input.SubjectCode &&
      resp.GradeID === input.GradeID &&
      resp.RespID !== input.RespID, // Not the same record
  );
}

/**
 * Calculate total teaching hours for a set of responsibilities
 *
 * @param responsibilities - Array of responsibilities
 * @returns Total teaching hours
 */
export function calculateTotalTeachHours(
  responsibilities: { TeachHour: number }[],
): number {
  return responsibilities.reduce((sum, resp) => sum + resp.TeachHour, 0);
}

/**
 * Calculate total assigned slots for a set of responsibilities
 *
 * @param responsibilities - Responsibilities with class_schedule
 * @returns Total assigned slots
 */
export function calculateTotalAssignedSlots(
  responsibilities: { class_schedule: unknown[] }[],
): number {
  return responsibilities.reduce(
    (sum, resp) => sum + resp.class_schedule.length,
    0,
  );
}
