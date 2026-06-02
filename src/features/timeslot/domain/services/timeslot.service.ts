/**
 * Domain Layer: Timeslot Service
 *
 * Pure business logic for timeslot generation and management.
 * Complex algorithm for calculating timeslot times and break periods.
 *
 * @module timeslot.service
 */

import type {
  timeslot,
  day_of_week,
  breaktime,
  semester,
} from "@/prisma/generated/client";
import { breaktime as breaktimeEnum } from "@/prisma/generated/client";
import { timeslotRepository } from "../../infrastructure/repositories/timeslot.repository";
import type { CreateTimeslotsInput } from "../../application/schemas/timeslot.schemas";
import type { SlotConfig } from "../models/break.types";

// Helper: convert Prisma semester enum to number string
const toSemesterNum = (sem: semester): string => {
  const match = String(sem).match(/_(\d)$/);
  return match?.[1] || "1";
};

/**
 * Generate TimeslotID following the canonical pattern: SEMESTER-YEAR-DAYPERIOD
 * Example: "1-2567-MON1"
 */
export function generateTimeslotId(
  semester: semester,
  academicYear: number,
  dayOfWeek: day_of_week,
  slotNumber: number,
): string {
  const semesterNum = toSemesterNum(semester);
  return `${semesterNum}-${academicYear}-${dayOfWeek}${slotNumber}`;
}

/**
 * Generate all timeslots based on configuration using BreakDefinition[] for configurable N-group breaks.
 * Break gaps are inserted before the targeted slot (slotNumber),
 * and the preceding teaching slot is marked with BREAK enum.
 */
type TimeslotsConfig = {
  AcademicYear: number;
  Semester: semester;
  Days: day_of_week[];
  StartTime: string;
  slots: SlotConfig[];
};

export function generateTimeslots(config: TimeslotsConfig): timeslot[] {
  const timeslots: timeslot[] = [];
  for (const day of config.Days) {
    let slotStart = new Date(`2024-01-01T${config.StartTime}:00`);
    config.slots.forEach((slot, i) => {
      const endTime = new Date(slotStart);
      endTime.setMinutes(endTime.getMinutes() + slot.duration);
      const isUniversal = slot.breakGroups?.includes("*") ?? false;
      timeslots.push({
        TimeslotID: generateTimeslotId(config.Semester, config.AcademicYear, day, i + 1),
        DayOfWeek: day,
        AcademicYear: config.AcademicYear,
        Semester: config.Semester,
        StartTime: slotStart,
        EndTime: endTime,
        Breaktime: (isUniversal ? "BREAK" : breaktimeEnum.NOT_BREAK) as breaktime,
      });
      slotStart = new Date(endTime);
    });
  }
  return timeslots;
}



/**
 * Sort timeslots by day of week and slot number
 * Custom sorting logic: MON < TUE < ... < SUN, then by slot number
 */
export function sortTimeslots(timeslots: timeslot[]): timeslot[] {
  const dayOrder = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return timeslots.sort((a, b) => {
    const dayA = dayOrder.indexOf(a.DayOfWeek);
    const dayB = dayOrder.indexOf(b.DayOfWeek);

    // Extract slot number from TimeslotID (format: "1-2567-MON1")
    const slotA = parseInt(a.TimeslotID.split("-")[2]?.substring(3) || "0");
    const slotB = parseInt(b.TimeslotID.split("-")[2]?.substring(3) || "0");

    // Sort by day first, then by slot number
    if (dayA === dayB) {
      return slotA - slotB;
    }
    return dayA - dayB;
  });
}

/**
 * Validate that timeslots don't already exist for the term
 */
export async function validateNoExistingTimeslots(
  academicYear: number,
  semester: semester,
): Promise<string | null> {
  const existing = await timeslotRepository.findFirst(academicYear, semester);

  if (existing) {
    return "มีตารางเวลาสำหรับภาคเรียนนี้อยู่แล้ว กรุณาลบตารางเดิมก่อนสร้างใหม่";
  }

  return null;
}

/**
 * Validate that timeslots exist for deletion
 */
export async function validateTimeslotsExist(
  academicYear: number,
  semester: semester,
): Promise<string | null> {
  const count = await timeslotRepository.countByTerm(academicYear, semester);

  if (count === 0) {
    return "ไม่พบตารางเวลาสำหรับภาคเรียนที่ระบุ";
  }

  return null;
}
