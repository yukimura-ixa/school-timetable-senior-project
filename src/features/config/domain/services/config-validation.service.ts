/**
 * Config Feature - Domain Service Layer
 *
 * Contains business logic and validation rules for table_config.
 * Pure functions for ConfigID generation, parsing, and validation.
 */

import * as configRepository from "../../infrastructure/repositories/config.repository";
import { semester } from "@/prisma/generated/client";

/**
 * Type for parsed ConfigID
 */
export type ParsedConfigID = {
  semester: string;
  academicYear: number;
};

/**
 * Generate ConfigID from semester number and academic year
 * Format: "SEMESTER-YEAR" (e.g., "1-2567", "2-2568")
 * Pure function for deterministic ConfigID generation
 */
export function generateConfigID(
  semesterNum: string,
  academicYear: number,
): string {
  return `${semesterNum}-${academicYear}`;
}

/**
 * Parse ConfigID into semester and academic year
 * Pure function for extracting components
 *
 * @throws Error if format is invalid
 */
export function parseConfigID(configId: string): ParsedConfigID {
  const parts = configId.split("-");

  if (parts.length !== 2) {
    throw new Error('รูปแบบ ConfigID ไม่ถูกต้อง ต้องเป็น "SEMESTER-YEAR"');
  }

  const semester = parts[0] || "";
  const academicYear = parseInt(parts[1] || "0", 10);

  if (isNaN(academicYear)) {
    throw new Error("ปีการศึกษาต้องเป็นตัวเลข");
  }

  return { semester, academicYear };
}

/**
 * Validate ConfigID format
 * Returns error message if invalid, null if valid
 */
export function validateConfigIDFormat(configId: string): string | null {
  const regex = /^[1-3]-\d{4}$/;

  if (!regex.test(configId)) {
    return 'รูปแบบ ConfigID ไม่ถูกต้อง ต้องเป็น "SEMESTER-YEAR" (เช่น "1-2567")';
  }

  try {
    parseConfigID(configId);
    return null;
  } catch (error) {
    return error instanceof Error
      ? error.message
      : "รูปแบบ ConfigID ไม่ถูกต้อง";
  }
}

/**
 * Check if config exists by ConfigID
 * Returns error message if not found, null if exists
 */
export async function validateConfigExists(
  configId: string,
): Promise<string | null> {
  const existing = await configRepository.findByConfigId(configId);

  if (!existing) {
    return "ไม่พบการตั้งค่านี้ กรุณาตรวจสอบอีกครั้ง";
  }

  return null;
}

/**
 * Check if config already exists for the given academic year and semester
 * Returns error message if duplicate exists, null if unique
 */
export async function validateNoDuplicateConfig(
  academicYear: number,
  semester: semester,
  excludeConfigId?: string,
): Promise<string | null> {
  const existing = await configRepository.findByTerm(academicYear, semester);

  if (existing && existing.ConfigID !== excludeConfigId) {
    return "มีการตั้งค่าสำหรับปีการศึกษาและภาคเรียนนี้อยู่แล้ว";
  }

  return null;
}

/**
 * Replace ConfigID pattern in a string
 * Pure function for ID replacement in copy operations
 *
 * Example: replaceConfigIDInString("MON-1/2566-1", "1/2566", "2/2567")
 *          => "MON-2/2567-1"
 */
export function replaceConfigIDInString(
  str: string,
  fromConfigId: string,
  toConfigId: string,
): string {
  return str.replace(fromConfigId, toConfigId);
}

/**
 * Convert semester enum to semester number string
 * SEMESTER_1 => "1"
 * SEMESTER_2 => "2"
 */
export function getSemesterNumber(sem: semester): string {
  return sem === semester.SEMESTER_1 ? "1" : "2";
}

/**
 * Convert semester number string to semester enum
 * "1" => SEMESTER_1
 * "2" => SEMESTER_2
 */
export function parseSemesterEnum(semesterNum: string): semester {
  if (semesterNum === "1") {
    return semester.SEMESTER_1;
  } else if (semesterNum === "2") {
    return semester.SEMESTER_2;
  } else {
    throw new Error("ภาคเรียนต้องเป็น 1 หรือ 2");
  }
}

/**
 * Validate copy operation input
 * Business rules:
 * - from and to must be different
 * - from must exist
 * - to must not exist
 */
export async function validateCopyInput(
  fromConfigId: string,
  toConfigId: string,
): Promise<string | null> {
  // Check same config
  if (fromConfigId === toConfigId) {
    return "ไม่สามารถคัดลอกไปยังภาคเรียนเดียวกันได้";
  }

  // Check from exists
  const fromExists = await configRepository.findByConfigId(fromConfigId);
  if (!fromExists) {
    return `ไม่พบการตั้งค่าต้นทาง (${fromConfigId})`;
  }

  // Check to doesn't exist
  const toExists = await configRepository.findByConfigId(toConfigId);
  if (toExists) {
    return `มีการตั้งค่าปลายทางอยู่แล้ว (${toConfigId}) กรุณาลบก่อนคัดลอก`;
  }

  return null;
}
