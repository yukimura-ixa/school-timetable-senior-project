/**
 * Domain Layer: MOE Credit Validation Service
 *
 * Validates programs against Thai Ministry of Education curriculum requirements.
 * Based on Basic Education Core Curriculum B.E. 2551 (2008).
 *
 * @module moe-validation.service
 */

import { LearningArea, SubjectCategory } from "@/prisma/generated/client";
import type { program_subject, subject } from "@/prisma/generated/client";
import {
  getTrackElectives,
  type ProgramTrack,
  type YearKey,
} from "@/config/moe-standards";

/**
 * MOE minimum credit requirements per learning area (hours per week)
 * Based on พ.ศ. 2551 standards
 */
export const MOE_MIN_CREDITS: Record<
  LearningArea,
  { junior: number; senior: number }
> = {
  THAI: { junior: 5, senior: 3 }, // ม.1-3: 200 hrs/yr = 5 hrs/wk, ม.4-6: 120 hrs/yr = 3 hrs/wk
  MATHEMATICS: { junior: 5, senior: 3 },
  SCIENCE: { junior: 5, senior: 3 },
  SOCIAL: { junior: 4, senior: 2 }, // 160 hrs/yr = 4 hrs/wk junior, 80 hrs/yr = 2 hrs/wk senior
  HEALTH_PE: { junior: 2, senior: 2 }, // 80 hrs/yr = 2 hrs/wk
  ARTS: { junior: 2, senior: 1 }, // 80 hrs/yr = 2 hrs/wk junior, 40 hrs/yr = 1 hr/wk senior
  CAREER: { junior: 2, senior: 1 },
  FOREIGN_LANGUAGE: { junior: 3, senior: 2 }, // 120 hrs/yr = 3 hrs/wk junior, 80 hrs/yr = 2 hrs/wk senior
};

/**
 * Credit validation result per learning area
 */
export type LearningAreaCreditStatus = {
  learningArea: LearningArea;
  required: number;
  current: number;
  isMet: boolean;
  deficit: number;
};

/**
 * Overall program validation result
 */
export type ProgramValidationResult = {
  isValid: boolean;
  totalCredits: number;
  requiredCredits: number;
  learningAreas: LearningAreaCreditStatus[];
  errors: string[];
  warnings: string[];
};

/**
 * Test helper / factory for ProgramValidationResult
 * Provides sane defaults and allows targeted overrides in mocks.
 */
export function createMOEValidationResult(
  overrides: Partial<ProgramValidationResult> = {},
): ProgramValidationResult {
  return {
    isValid: overrides.isValid ?? true,
    totalCredits: overrides.totalCredits ?? 0,
    requiredCredits: overrides.requiredCredits ?? 0,
    learningAreas: overrides.learningAreas ?? [],
    errors: overrides.errors ?? [],
    warnings: overrides.warnings ?? [],
  };
}

/**
 * Calculate total credits for a learning area from program subjects
 */
export function calculateLearningAreaCredits(
  programSubjects: Array<program_subject & { subject: subject }>,
  learningArea: LearningArea,
): number {
  return programSubjects
    .filter(
      (ps) =>
        ps.subject.LearningArea === learningArea &&
        ps.Category !== SubjectCategory.ACTIVITY,
    )
    .reduce((sum, ps) => sum + ps.MinCredits, 0);
}

/**
 * Validate program against MOE minimum credit requirements
 *
 * @param year - Grade year (1-6)
 * @param programSubjects - Program subjects with subject details
 * @returns Validation result with detailed breakdown
 *
 * @example
 * ```ts
 * const result = validateProgramMOECredits(1, programSubjects);
 * if (!result.isValid) {
 *   console.log(result.errors); // ["ภาษาไทย: ต้องการ 5 หน่วยกิต แต่มีเพียง 3"]
 * }
 * ```
 */
export function validateProgramMOECredits(
  year: number,
  programSubjects: Array<program_subject & { subject: subject }>,
  track?: ProgramTrack,
): ProgramValidationResult {
  const isJunior = year >= 1 && year <= 3;
  const isSenior = year >= 4 && year <= 6;

  if (!isJunior && !isSenior) {
    return {
      isValid: false,
      totalCredits: 0,
      requiredCredits: 0,
      learningAreas: [],
      errors: ["ปีต้องอยู่ระหว่าง 1-6"],
      warnings: [],
    };
  }

  const learningAreaStatuses: LearningAreaCreditStatus[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check each learning area
  for (const [learningArea, requirements] of Object.entries(MOE_MIN_CREDITS)) {
    const required = isJunior ? requirements.junior : requirements.senior;
    const current = calculateLearningAreaCredits(
      programSubjects,
      learningArea as LearningArea,
    );
    const isMet = current >= required;
    const deficit = Math.max(0, required - current);

    learningAreaStatuses.push({
      learningArea: learningArea as LearningArea,
      required,
      current,
      isMet,
      deficit,
    });

    if (!isMet) {
      const areaNameThai = getLearningAreaNameThai(
        learningArea as LearningArea,
      );
      errors.push(
        `${areaNameThai}: ต้องการขั้นต่ำ ${required} หน่วยกิต แต่มีเพียง ${current} (ขาด ${deficit})`,
      );
    }
  }

  // Calculate totals
  const totalRequired = learningAreaStatuses.reduce(
    (sum, la) => sum + la.required,
    0,
  );
  const totalCurrent = programSubjects
    .filter((ps) => ps.Category !== SubjectCategory.ACTIVITY)
    .reduce((sum, ps) => sum + ps.MinCredits, 0);

  // Check for activities
  const hasActivities = programSubjects.some(
    (ps) => ps.Category === SubjectCategory.ACTIVITY,
  );
  if (!hasActivities) {
    warnings.push("ไม่พบกิจกรรมพัฒนาผู้เรียน (ชุมนุม, แนะแนว, ลูกเสือ)");
  }

  // Check total credits
  if (totalCurrent < totalRequired) {
    errors.push(
      `หน่วยกิตรวมไม่ครบตามเกณฑ์ ศธ.: ต้องการ ${totalRequired} แต่มี ${totalCurrent}`,
    );
  }

  // Check track-specific electives for upper secondary
  if (track && isSenior && track !== "GENERAL") {
    const trackResult = validateTrackElectives(track, year, programSubjects);
    errors.push(...trackResult.errors);
    warnings.push(...trackResult.warnings);
  }

  return {
    isValid: errors.length === 0,
    totalCredits: totalCurrent,
    requiredCredits: totalRequired,
    learningAreas: learningAreaStatuses,
    errors,
    warnings,
  };
}

/**
 * Get Thai name for learning area
 */
export function getLearningAreaNameThai(learningArea: LearningArea): string {
  const names: Record<LearningArea, string> = {
    THAI: "ภาษาไทย",
    MATHEMATICS: "คณิตศาสตร์",
    SCIENCE: "วิทยาศาสตร์",
    SOCIAL: "สังคมศึกษา ศาสนา และวัฒนธรรม",
    HEALTH_PE: "สุขศึกษาและพลศึกษา",
    ARTS: "ศิลปะ",
    CAREER: "การงานอาชีพ",
    FOREIGN_LANGUAGE: "ภาษาต่างประเทศ",
  };
  return names[learningArea];
}

/**
 * Check if all mandatory subjects are included in program
 */
export function validateMandatorySubjects(
  programSubjects: Array<program_subject>,
): { isValid: boolean; errors: string[] } {
  const mandatorySubjects = programSubjects.filter((ps) => ps.IsMandatory);
  const coreSubjects = mandatorySubjects.filter(
    (ps) => ps.Category === SubjectCategory.CORE,
  );

  const errors: string[] = [];

  if (coreSubjects.length === 0) {
    errors.push("โปรแกรมต้องมีวิชาพื้นฐาน (CORE) อย่างน้อย 1 วิชา");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Map subject group name to LearningArea for matching track electives
 */
function mapGroupToLearningArea(group: string): LearningArea {
  const mapping: Record<string, LearningArea> = {
    "คณิตศาสตร์": LearningArea.MATHEMATICS,
    "วิทยาศาสตร์": LearningArea.SCIENCE,
    "ภาษาอังกฤษ": LearningArea.FOREIGN_LANGUAGE,
    "ภาษาต่างประเทศ": LearningArea.FOREIGN_LANGUAGE,
    "สังคมศึกษา": LearningArea.SOCIAL,
    "ศิลปะ": LearningArea.ARTS,
  };
  return mapping[group] || LearningArea.SCIENCE;
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

/**
 * Validate track-specific elective requirements for upper secondary
 *
 * Rules per Thai MOE 2551:
 * - SCIENCE_MATH: Must have ≥3 of (Math Adv, Physics, Chemistry, Biology) learning area groups
 * - LANGUAGE_MATH: Must have ≥2 of (Math, Foreign Language, Science) learning area groups
 * - LANGUAGE_ARTS: Must have ≥2 of (Social, Foreign Language, Arts) learning area groups
 * - GENERAL: No specific requirement
 */
export function validateTrackElectives(
  track: ProgramTrack,
  year: number,
  programSubjects: Array<program_subject & { subject: subject }>,
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (track === "GENERAL") {
    return { errors, warnings }; // No track-specific requirements
  }

  // Convert numeric year to YearKey
  const yearKey = `M${year}` as YearKey;

  // Get required elective groups for this track
  const trackElectives = getTrackElectives(yearKey, track);

  // Collect unique required learning areas from track electives
  const requiredLearningAreas = new Set<LearningArea>();
  trackElectives.forEach((e) => {
    requiredLearningAreas.add(mapGroupToLearningArea(e.group));
  });

  // Check which required learning areas are covered by student electives
  const studentElectives = programSubjects.filter(
    (ps) => ps.Category === SubjectCategory.ADDITIONAL,
  );

  const coveredLearningAreas = new Set<LearningArea>();
  for (const studentElective of studentElectives) {
    const la = studentElective.subject.LearningArea;
    if (requiredLearningAreas.has(la)) {
      coveredLearningAreas.add(la);
    }
  }

  // Enforce: student must cover ALL unique learning areas from track config
  const totalRequired = requiredLearningAreas.size;
  const minimumRequired = totalRequired;
  const trackNameThai = getTrackNameThai(track);

  if (coveredLearningAreas.size < minimumRequired) {
    if (coveredLearningAreas.size === 0) {
      errors.push(
        `${trackNameThai}: ขาดวิชาเพิ่มเติมตามแผนการเรียน (ต้องมีอย่างน้อย ${minimumRequired}/${totalRequired} กลุ่มสาระ)`,
      );
    } else {
      warnings.push(
        `${trackNameThai}: มีวิชาเพิ่มเติมตามแผนเพียง ${coveredLearningAreas.size}/${totalRequired} กลุ่มสาระ (แนะนำอย่างน้อย ${minimumRequired})`,
      );
    }
  }

  return { errors, warnings };
}

/**
 * Generate MOE compliance report for a program
 */
export function generateMOEComplianceReport(
  programName: string,
  year: number,
  programSubjects: Array<program_subject & { subject: subject }>,
): string {
  const validation = validateProgramMOECredits(year, programSubjects);
  const mandatory = validateMandatorySubjects(programSubjects);

  let report = `📋 รายงานความสอดคล้อง: ${programName} (ม.${year})\n\n`;

  report += `📊 หน่วยกิตรวม: ${validation.totalCredits} / ${validation.requiredCredits} (ตามเกณฑ์ ศธ.)\n\n`;

  report += `📚 สถานะตามกลุ่มสาระการเรียนรู้:\n`;
  for (const la of validation.learningAreas) {
    const icon = la.isMet ? "✅" : "❌";
    const areaName = getLearningAreaNameThai(la.learningArea);
    report += `${icon} ${areaName}: ${la.current} / ${la.required} หน่วยกิต`;
    if (!la.isMet) {
      report += ` (ขาด ${la.deficit})`;
    }
    report += `\n`;
  }

  if (validation.errors.length > 0) {
    report += `\n❌ ข้อผิดพลาด:\n`;
    validation.errors.forEach((err) => {
      report += `   - ${err}\n`;
    });
  }

  if (validation.warnings.length > 0) {
    report += `\n⚠️ คำเตือน:\n`;
    validation.warnings.forEach((warn) => {
      report += `   - ${warn}\n`;
    });
  }

  if (!mandatory.isValid) {
    report += `\n❌ ข้อผิดพลาด:\n`;
    mandatory.errors.forEach((err) => {
      report += `   - ${err}\n`;
    });
  }

  if (validation.isValid && mandatory.isValid) {
    report += `\n✅ สอดคล้องตามเกณฑ์หลักสูตร พ.ศ. 2551`;
  } else {
    report += `\n❌ ไม่สอดคล้องตามเกณฑ์หลักสูตร พ.ศ. 2551`;
  }

  return report;
}
