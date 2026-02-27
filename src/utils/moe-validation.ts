/**
 * MOE Standards Validation Utilities
 *
 * Provides validation functions for program/timetable compliance
 * with Thai Ministry of Education standards
 */

import {
  type YearKey,
  type ProgramTrack,
  getMOEStandards,
  validateTotalLessons,
  getMinCoreLessons,
  getTrackElectives,
} from "@/config/moe-standards";

/**
 * Subject assignment for validation
 */
export interface SubjectAssignment {
  subjectCode: string;
  subjectName: string;
  weeklyLessons: number;
  category: "CORE" | "ELECTIVE" | "ACTIVITY";
  group: string;
}

/**
 * Program validation input
 */
export interface ProgramValidationInput {
  year: YearKey;
  track?: ProgramTrack;
  subjects: SubjectAssignment[];
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalLessons: number;
    coreLessons: number;
    electiveLessons: number;
    activityLessons: number;
    missingCoreSubjects: string[];
    minRequired: number;
    maxAllowed: number;
  };
}

/**
 * Validate program against MOE standards
 */
export function validateProgramStandards(
  input: ProgramValidationInput,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const standard = getMOEStandards(input.year);

  // Calculate totals
  const totalLessons = input.subjects.reduce(
    (sum, s) => sum + s.weeklyLessons,
    0,
  );
  const coreLessons = input.subjects
    .filter((s) => s.category === "CORE")
    .reduce((sum, s) => sum + s.weeklyLessons, 0);
  const electiveLessons = input.subjects
    .filter((s) => s.category === "ELECTIVE")
    .reduce((sum, s) => sum + s.weeklyLessons, 0);
  const activityLessons = input.subjects
    .filter((s) => s.category === "ACTIVITY")
    .reduce((sum, s) => sum + s.weeklyLessons, 0);

  // Check total lessons
  const totalValidation = validateTotalLessons(input.year, totalLessons);
  if (!totalValidation.valid && totalValidation.message) {
    errors.push(totalValidation.message);
  }

  // Check core subjects
  const assignedCoreSubjects = new Set(
    input.subjects
      .filter((s) => s.category === "CORE")
      .map((s) => s.subjectCode),
  );

  const missingCoreSubjects: string[] = [];
  for (const coreSubject of standard.coreSubjects) {
    if (!assignedCoreSubjects.has(coreSubject.subjectCode)) {
      missingCoreSubjects.push(coreSubject.subjectNameTh);
    }
  }

  if (missingCoreSubjects.length > 0) {
    errors.push(`ขาดวิชาแกนหลักที่จำเป็น: ${missingCoreSubjects.join(", ")}`);
  }

  // Validate each core subject's lesson count
  for (const assignment of input.subjects.filter(
    (s) => s.category === "CORE",
  )) {
    const standardSubject = standard.coreSubjects.find(
      (s) => s.subjectCode === assignment.subjectCode,
    );

    if (standardSubject) {
      if (assignment.weeklyLessons < standardSubject.minWeeklyLessons) {
        warnings.push(
          `${assignment.subjectName}: จำนวนคาบน้อยกว่ามาตรฐาน (${assignment.weeklyLessons}/${standardSubject.minWeeklyLessons} คาบ/สัปดาห์)`,
        );
      }

      if (assignment.weeklyLessons > standardSubject.maxWeeklyLessons) {
        warnings.push(
          `${assignment.subjectName}: จำนวนคาบเกินมาตรฐาน (${assignment.weeklyLessons}/${standardSubject.maxWeeklyLessons} คาบ/สัปดาห์)`,
        );
      }
    }
  }

  // Check minimum core lessons
  const minCore = getMinCoreLessons(input.year);
  if (coreLessons < minCore) {
    errors.push(
      `วิชาแกนหลักต้องมีอย่างน้อย ${minCore} คาบ/สัปดาห์ (ปัจจุบัน ${coreLessons} คาบ)`,
    );
  }

  // Check activities
  const hasHomeroom = input.subjects.some(
    (s) => s.category === "ACTIVITY" && s.subjectCode === "HR",
  );
  if (!hasHomeroom) {
    warnings.push("ควรมีคาบชั้นเรียน (Homeroom) อย่างน้อย 1 คาบ/สัปดาห์");
  }

  // Check track-specific electives for upper secondary
  if (input.track && isUpperSecondary(input.year) && input.track !== "GENERAL") {
    const trackElectives = getTrackElectives(input.year, input.track);
    const trackElectiveGroups = new Set<string>();

    trackElectives.forEach((e) => {
      trackElectiveGroups.add(e.group);
    });

    const studentElectiveGroups = new Set(
      input.subjects
        .filter((s) => s.category === "ELECTIVE")
        .map((s) => s.group),
    );

    const minimumRequired = input.track === "SCIENCE_MATH" ? 3 : 2;
    const coveredCount = Array.from(studentElectiveGroups).filter((g) =>
      trackElectiveGroups.has(g),
    ).length;

    if (coveredCount < minimumRequired) {
      errors.push(
        `${getTrackNameThai(input.track)}: ขาดวิชาเพิ่มเติมตามแผนการเรียน`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalLessons,
      coreLessons,
      electiveLessons,
      activityLessons,
      missingCoreSubjects,
      minRequired: standard.minTotalLessons,
      maxAllowed: standard.maxTotalLessons,
    },
  };
}

/**
 * Convert numeric year (1-6) to YearKey (M1-M6)
 */
export function numericYearToKey(year: number): YearKey {
  if (year < 1 || year > 6) {
    throw new Error(`Invalid year: ${year}. Must be between 1 and 6.`);
  }
  return `M${year}` as YearKey;
}

/**
 * Convert YearKey (M1-M6) to numeric year (1-6)
 */
export function yearKeyToNumeric(yearKey: YearKey): number {
  return parseInt(yearKey.substring(1));
}

/**
 * Check if a year is lower secondary (M1-M3)
 */
export function isLowerSecondary(year: YearKey | number): boolean {
  const numericYear = typeof year === "number" ? year : yearKeyToNumeric(year);
  return numericYear >= 1 && numericYear <= 3;
}

/**
 * Check if a year is upper secondary (M4-M6)
 */
export function isUpperSecondary(year: YearKey | number): boolean {
  const numericYear = typeof year === "number" ? year : yearKeyToNumeric(year);
  return numericYear >= 4 && numericYear <= 6;
}

/**
 * Get Thai year description
 */
export function getYearDescription(year: YearKey | number): string {
  const yearKey = typeof year === "number" ? numericYearToKey(year) : year;
  const standard = getMOEStandards(yearKey);
  return standard.description;
}

/**
 * Format validation result for display
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  lines.push("=== ผลการตรวจสอบมาตรฐาน กพฐ. ===");
  lines.push("");
  lines.push("สรุป:");
  lines.push(`  • รวมทั้งหมด: ${result.summary.totalLessons} คาบ/สัปดาห์`);
  lines.push(`  • วิชาแกนหลัก: ${result.summary.coreLessons} คาบ`);
  lines.push(`  • วิชาเพิ่มเติม: ${result.summary.electiveLessons} คาบ`);
  lines.push(`  • กิจกรรม: ${result.summary.activityLessons} คาบ`);
  lines.push(
    `  • ช่วงที่อนุญาต: ${result.summary.minRequired}-${result.summary.maxAllowed} คาบ/สัปดาห์`,
  );
  lines.push("");

  if (result.errors.length > 0) {
    lines.push("❌ ข้อผิดพลาด:");
    result.errors.forEach((err) => lines.push(`  • ${err}`));
    lines.push("");
  }

  if (result.warnings.length > 0) {
    lines.push("⚠️  คำเตือน:");
    result.warnings.forEach((warn) => lines.push(`  • ${warn}`));
    lines.push("");
  }

  if (result.valid) {
    lines.push("✅ ผ่านมาตรฐาน กพฐ.");
  } else {
    lines.push("❌ ไม่ผ่านมาตรฐาน กพฐ.");
  }

  return lines.join("\n");
}

/**
 * Get Thai name for program track
 */
function getTrackNameThai(track: ProgramTrack): string {
  const names: Record<ProgramTrack, string> = {
    SCIENCE_MATH: "แผนวิทย์-คณิต",
    LANGUAGE_MATH: "แผนศิลป์-คำนวณ",
    LANGUAGE_ARTS: "แผนศิลป์-ภาษา",
    GENERAL: "แผนทั่วไป",
  };
  return names[track];
}
