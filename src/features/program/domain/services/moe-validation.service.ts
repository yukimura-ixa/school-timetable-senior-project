/**
 * Domain Layer: MOE Credit Validation Service
 * 
 * Validates programs against Thai Ministry of Education curriculum requirements.
 * Based on Basic Education Core Curriculum B.E. 2551 (2008).
 * 
 * @module moe-validation.service
 */

import { LearningArea, SubjectCategory } from '@/prisma/generated';
import type { program_subject, subject } from '@/prisma/generated';

/**
 * MOE minimum credit requirements per learning area (hours per week)
 * Based on ศธ. 2551 standards
 */
export const MOE_MIN_CREDITS: Record<LearningArea, { junior: number; senior: number }> = {
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
 * Calculate total credits for a learning area from program subjects
 */
export function calculateLearningAreaCredits(
  programSubjects: Array<program_subject & { subject: subject }>,
  learningArea: LearningArea
): number {
  return programSubjects
    .filter(ps => ps.subject.LearningArea === learningArea && ps.Category !== SubjectCategory.ACTIVITY)
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
  programSubjects: Array<program_subject & { subject: subject }>
): ProgramValidationResult {
  const isJunior = year >= 1 && year <= 3;
  const isSenior = year >= 4 && year <= 6;
  
  if (!isJunior && !isSenior) {
    return {
      isValid: false,
      totalCredits: 0,
      requiredCredits: 0,
      learningAreas: [],
      errors: ['ปีต้องอยู่ระหว่าง 1-6'],
      warnings: [],
    };
  }
  
  const learningAreaStatuses: LearningAreaCreditStatus[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check each learning area
  for (const [learningArea, requirements] of Object.entries(MOE_MIN_CREDITS)) {
    const required = isJunior ? requirements.junior : requirements.senior;
    const current = calculateLearningAreaCredits(programSubjects, learningArea as LearningArea);
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
      const areaNameThai = getLearningAreaNameThai(learningArea as LearningArea);
      errors.push(`${areaNameThai}: ต้องการขั้นต่ำ ${required} หน่วยกิต แต่มีเพียง ${current} (ขาด ${deficit})`);
    }
  }
  
  // Calculate totals
  const totalRequired = learningAreaStatuses.reduce((sum, la) => sum + la.required, 0);
  const totalCurrent = programSubjects
    .filter(ps => ps.Category !== SubjectCategory.ACTIVITY)
    .reduce((sum, ps) => sum + ps.MinCredits, 0);
  
  // Check for activities
  const hasActivities = programSubjects.some(ps => ps.Category === SubjectCategory.ACTIVITY);
  if (!hasActivities) {
    warnings.push('หลักสูตรควรมีกิจกรรมพัฒนาผู้เรียน (ชุมนุม, ลูกเสือ, แนะแนว)');
  }
  
  // Check total credits
  if (totalCurrent < totalRequired) {
    errors.push(`หน่วยกิตรวมต่ำกว่าขั้นต่ำของ ศธ.: ต้องการ ${totalRequired} มี ${totalCurrent}`);
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
    THAI: 'ภาษาไทย',
    MATHEMATICS: 'คณิตศาสตร์',
    SCIENCE: 'วิทยาศาสตร์และเทคโนโลยี',
    SOCIAL: 'สังคมศึกษา ศาสนา และวัฒนธรรม',
    HEALTH_PE: 'สุขศึกษาและพลศึกษา',
    ARTS: 'ศิลปะ',
    CAREER: 'การงานอาชีพ',
    FOREIGN_LANGUAGE: 'ภาษาต่างประเทศ',
  };
  return names[learningArea];
}

/**
 * Check if all mandatory subjects are included in program
 */
export function validateMandatorySubjects(
  programSubjects: Array<program_subject>
): { isValid: boolean; errors: string[] } {
  const mandatorySubjects = programSubjects.filter(ps => ps.IsMandatory);
  const coreSubjects = mandatorySubjects.filter(ps => ps.Category === SubjectCategory.CORE);
  
  const errors: string[] = [];
  
  if (coreSubjects.length === 0) {
    errors.push('หลักสูตรต้องมีวิชาพื้นฐาน (CORE) อย่างน้อย 1 วิชา');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate MOE compliance report for a program
 */
export function generateMOEComplianceReport(
  programName: string,
  year: number,
  programSubjects: Array<program_subject & { subject: subject }>
): string {
  const validation = validateProgramMOECredits(year, programSubjects);
  const mandatory = validateMandatorySubjects(programSubjects);
  
  let report = `📊 รายงานการตรวจสอบหลักสูตร: ${programName} (ม.${year})\n\n`;
  
  report += `✅ หน่วยกิตรวม: ${validation.totalCredits} / ${validation.requiredCredits} (ขั้นต่ำ ศธ.)\n\n`;
  
  report += `📚 รายละเอียดตามสาระการเรียนรู้:\n`;
  for (const la of validation.learningAreas) {
    const icon = la.isMet ? '✅' : '❌';
    const areaName = getLearningAreaNameThai(la.learningArea);
    report += `${icon} ${areaName}: ${la.current} / ${la.required} หน่วยกิต`;
    if (!la.isMet) {
      report += ` (ขาด ${la.deficit})`;
    }
    report += `\n`;
  }
  
  if (validation.errors.length > 0) {
    report += `\n❌ ข้อผิดพลาด:\n`;
    validation.errors.forEach(err => {
      report += `   - ${err}\n`;
    });
  }
  
  if (validation.warnings.length > 0) {
    report += `\n⚠️  คำเตือน:\n`;
    validation.warnings.forEach(warn => {
      report += `   - ${warn}\n`;
    });
  }
  
  if (!mandatory.isValid) {
    report += `\n❌ วิชาบังคับ:\n`;
    mandatory.errors.forEach(err => {
      report += `   - ${err}\n`;
    });
  }
  
  if (validation.isValid && mandatory.isValid) {
    report += `\n✅ หลักสูตรสอดคล้องกับมาตรฐาน ศธ. 2551`;
  } else {
    report += `\n❌ หลักสูตรยังไม่สอดคล้องกับมาตรฐาน ศธ. 2551`;
  }
  
  return report;
}
