/**
 * Type Transformation Utilities
 *
 * Transforms legacy PascalCase types to new camelCase strict types.
 * Used at API boundaries to ensure type safety throughout the application.
 *
 * @module type-transformers
 */

import { SubjectData, SubjectCategory } from "@/types/schedule.types";

// Legacy types (for transformation only - DO NOT use elsewhere)
interface LegacySubjectData {
  Year?: number;
  Number?: number;
  SubjectCode?: string;
  SubjectName?: string;
  GradeID?: string;
  TeacherID?: number;
  Category?: string;
  Credit?: number;
  TeachHour?: number;
  RoomID?: number;
  RoomName?: string;
  [key: string]: unknown;
}

/**
 * Transform legacy PascalCase subject data to new camelCase format
 *
 * @param legacy - Data from API/DB with PascalCase properties
 * @returns Strictly typed SubjectData or null if incomplete
 *
 * @example
 * const apiData = { SubjectCode: 'CS101', SubjectName: 'Computer Science', ... };
 * const subject = transformLegacySubject(apiData);
 * if (subject) {
 *   // TypeScript knows all required fields exist
 *   console.log(subject.subjectCode); // ✅ Type-safe
 * }
 */
export function transformLegacySubject(
  legacy: LegacySubjectData | null | undefined,
): SubjectData | null {
  if (!legacy) return null;

  // Validate required fields exist
  if (
    !legacy.SubjectCode ||
    !legacy.SubjectName ||
    !legacy.GradeID ||
    typeof legacy.TeacherID !== "number" ||
    !legacy.Category ||
    typeof legacy.Credit !== "number" ||
    typeof legacy.TeachHour !== "number"
  ) {
    console.warn("[Type Transformer] Incomplete legacy subject data:", {
      hasSubjectCode: !!legacy.SubjectCode,
      hasSubjectName: !!legacy.SubjectName,
      hasGradeID: !!legacy.GradeID,
      hasTeacherID: typeof legacy.TeacherID === "number",
      hasCategory: !!legacy.Category,
      hasCredit: typeof legacy.Credit === "number",
      hasTeachHour: typeof legacy.TeachHour === "number",
    });
    return null;
  }

  // Validate category is a valid SubjectCategory
  const validCategories: SubjectCategory[] = ["CORE", "ADDITIONAL", "ACTIVITY"];
  const category = legacy.Category as SubjectCategory;
  if (!validCategories.includes(category)) {
    console.warn("[Type Transformer] Invalid category:", legacy.Category);
    return null;
  }

  return {
    itemID: (legacy.itemID as number | undefined) ?? 0, // Will be assigned during save
    subjectCode: legacy.SubjectCode,
    subjectName: legacy.SubjectName,
    gradeID: legacy.GradeID,
    teacherID: legacy.TeacherID,
    category, // Already validated above
    credit: legacy.Credit,
    teachHour: legacy.TeachHour,
    roomID: legacy.RoomID ?? null,
    roomName: legacy.RoomName ?? null,
    gradelevel:
      legacy.Year !== undefined && legacy.Number !== undefined
        ? { year: legacy.Year, number: legacy.Number }
        : undefined,
  };
}

/**
 * Transform array of legacy subjects, filtering out incomplete data
 *
 * @param legacyArray - Array of legacy subject data
 * @returns Array of strictly typed SubjectData (incomplete items excluded)
 *
 * @example
 * const apiSubjects = [
 *   { SubjectCode: 'CS101', ... }, // Complete
 *   { SubjectCode: 'MATH', ... },  // Complete
 *   { SubjectCode: 'PHY' },        // Incomplete - will be filtered out
 * ];
 * const subjects = transformLegacySubjects(apiSubjects);
 * // subjects.length === 2 (only complete items)
 */
export function transformLegacySubjects(
  legacyArray: LegacySubjectData[],
): SubjectData[] {
  return legacyArray
    .map(transformLegacySubject)
    .filter((s): s is SubjectData => s !== null);
}

/**
 * Transform grade level from PascalCase to camelCase
 *
 * @param legacy - Grade level with PascalCase properties
 * @returns Grade level with camelCase properties
 *
 * @example
 * const apiGrade = { Year: 1, Number: 2 };
 * const grade = transformGradeLevel(apiGrade);
 * // grade === { year: 1, number: 2 }
 */
export function transformGradeLevel(legacy: {
  Year?: number;
  Number?: number;
}): { year: number; number: number } {
  return {
    year: legacy.Year ?? 0,
    number: legacy.Number ?? 0,
  };
}

/**
 * Transform grade level from camelCase to PascalCase
 * (for API requests that expect PascalCase)
 *
 * @param modern - Grade level with camelCase properties
 * @returns Grade level with PascalCase properties
 *
 * @example
 * const grade = { year: 1, number: 2 };
 * const apiPayload = toLegacyGradeLevel(grade);
 * // apiPayload === { Year: 1, Number: 2 }
 */
export function toLegacyGradeLevel(modern: { year: number; number: number }): {
  Year: number;
  Number: number;
} {
  return {
    Year: modern.year,
    Number: modern.number,
  };
}

/**
 * Batch transform for API responses with nested subject arrays
 *
 * @param response - API response with subjects array
 * @returns Transformed response with strict types
 *
 * @example
 * const apiResponse = {
 *   success: true,
 *   data: [
 *     { SubjectCode: 'CS101', ... },
 *     { SubjectCode: 'MATH', ... },
 *   ]
 * };
 * const { success, data } = transformAPIResponse(apiResponse);
 * // data is SubjectData[] (strictly typed)
 */
export function transformAPIResponse<T extends { data?: LegacySubjectData[] }>(
  response: T,
): Omit<T, "data"> & { data: SubjectData[] } {
  return {
    ...response,
    data: response.data ? transformLegacySubjects(response.data) : [],
  };
}

/**
 * Type guard to check if legacy data is complete enough to transform
 * (useful for conditional rendering before transformation)
 *
 * @param legacy - Legacy subject data to check
 * @returns true if all required fields exist
 */
export function isCompleteLegacyData(
  legacy: LegacySubjectData | null | undefined,
): legacy is Required<
  Pick<
    LegacySubjectData,
    | "SubjectCode"
    | "SubjectName"
    | "GradeID"
    | "TeacherID"
    | "Category"
    | "Credit"
    | "TeachHour"
  >
> {
  return !!(
    legacy &&
    legacy.SubjectCode &&
    legacy.SubjectName &&
    legacy.GradeID &&
    typeof legacy.TeacherID === "number" &&
    legacy.Category &&
    typeof legacy.Credit === "number" &&
    typeof legacy.TeachHour === "number"
  );
}
