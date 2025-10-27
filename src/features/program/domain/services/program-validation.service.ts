/**
 * Domain Layer: Program Validation Service
 * 
 * Pure business logic and validation rules for programs.
 * No external dependencies - can be tested independently.
 * 
 * @module program-validation.service
 */

import { programRepository } from '../../infrastructure/repositories/program.repository';

/**
 * Validate that a program with the same combination doesn't exist
 * Checks unique constraint: ProgramName + Semester + AcademicYear
 * Returns error message in Thai if duplicate found, null otherwise
 */
export async function validateNoDuplicateProgram(
  programName: string,
  semester: string,
  academicYear: number
): Promise<string | null> {
  const existing = await programRepository.findByNameAndTerm(programName, semester, academicYear);
  
  if (existing) {
    return 'มีชื่อหลักสูตรนี้สำหรับภาคเรียนและปีการศึกษาที่ระบุแล้ว กรุณาตรวจสอบอีกครั้ง';
  }
  
  return null;
}

/**
 * Validate that a program with the same combination doesn't exist (excluding current program)
 * Used during update to allow keeping the same name/term combination
 */
export async function validateNoDuplicateProgramForUpdate(
  programId: number,
  programName: string,
  semester: string,
  academicYear: number
): Promise<string | null> {
  const existing = await programRepository.findByNameAndTerm(programName, semester, academicYear);
  
  // Allow if it's the same program or no duplicate
  if (!existing || existing.ProgramID === programId) {
    return null;
  }
  
  return 'มีชื่อหลักสูตรนี้สำหรับภาคเรียนและปีการศึกษาที่ระบุแล้ว กรุณาตรวจสอบอีกครั้ง';
}

/**
 * Validate that a program exists
 * Returns error message in Thai if not found, null otherwise
 */
export async function validateProgramExists(
  programId: number
): Promise<string | null> {
  const program = await programRepository.findById(programId);
  
  if (!program) {
    return 'ไม่พบหลักสูตรที่ระบุ';
  }
  
  return null;
}
