/**
 * Domain Layer: Program Validation Service
 * 
 * Pure business logic and validation rules for programs.
 * No external dependencies - can be tested independently.
 * 
 * @module program-validation.service
 */

import { programRepository } from '../../infrastructure/repositories/program.repository';
import type { ProgramTrack } from @/prisma/generated/client';

/**
 * Validate that a program with the same Year + Track combination doesn't exist
 * MOE-compliant: Each year can only have one program per track
 * Returns error message in Thai if duplicate found, null otherwise
 */
export async function validateNoDuplicateProgram(
  year: number,
  track: ProgramTrack
): Promise<string | null> {
  const existing = await programRepository.findByYearAndTrack(year, track);
  
  if (existing) {
    return `มีหลักสูตรสำหรับ ม.${year} แผนการเรียน${track} อยู่แล้ว กรุณาตรวจสอบอีกครั้ง`;
  }
  
  return null;
}

/**
 * Validate that a program with the same Year + Track combination doesn't exist (excluding current program)
 * Used during update to allow keeping the same year/track combination
 */
export async function validateNoDuplicateProgramForUpdate(
  programId: number,
  year: number,
  track: ProgramTrack
): Promise<string | null> {
  const existing = await programRepository.findByYearAndTrack(year, track);
  
  // Allow if it is the same program or no duplicate
  if (!existing || existing.ProgramID === programId) {
    return null;
  }
  
  return `มีหลักสูตรสำหรับ ม.${year} แผนการเรียน${track} อยู่แล้ว กรุณาตรวจสอบอีกครั้ง`;
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

/**
 * Validate that a ProgramCode is unique
 * Returns error message in Thai if code already exists, null otherwise
 */
export async function validateUniqueProgramCode(
  programCode: string
): Promise<string | null> {
  const existing = await programRepository.findByCode(programCode);
  
  if (existing) {
    return `รหัสหลักสูตร "${programCode}" ถูกใช้ไปแล้ว กรุณาใช้รหัสอื่น`;
  }
  
  return null;
}

/**
 * Validate that a ProgramCode is unique (excluding current program)
 * Used during update
 */
export async function validateUniqueProgramCodeForUpdate(
  programId: number,
  programCode: string
): Promise<string | null> {
  const existing = await programRepository.findByCode(programCode);
  
  // Allow if it is the same program or no duplicate
  if (!existing || existing.ProgramID === programId) {
    return null;
  }
  
  return `รหัสหลักสูตร "${programCode}" ถูกใช้ไปแล้ว กรุณาใช้รหัสอื่น`;
}
