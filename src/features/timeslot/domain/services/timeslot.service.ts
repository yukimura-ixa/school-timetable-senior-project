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
 * Determine breaktime enum based on slot number and break configuration
 */
export function calculateBreaktime(
  slotNumber: number,
  breakConfig: { Junior: number; Senior: number },
): breaktime {
  const isJuniorBreak = breakConfig.Junior === slotNumber;
  const isSeniorBreak = breakConfig.Senior === slotNumber;

  if (isJuniorBreak && isSeniorBreak) {
    return breaktimeEnum.BREAK_BOTH;
  } else if (isSeniorBreak) {
    return breaktimeEnum.BREAK_SENIOR;
  } else if (isJuniorBreak) {
    return breaktimeEnum.BREAK_JUNIOR;
  } else {
    return breaktimeEnum.NOT_BREAK;
  }
}

/**
 * Generate all timeslots based on configuration
 * Complex algorithm that calculates StartTime and EndTime for each slot
 * Handles mini breaks and regular breaks
 *
 * Note: Times are stored as local time (no UTC conversion) to match
 * how seed data works and ensure consistent display in Thailand timezone.
 */
export function generateTimeslots(config: CreateTimeslotsInput): timeslot[] {
  const timeslots: timeslot[] = [];

  for (const day of config.Days) {
    // Start time for the day (local time, no "Z" suffix)
    // Using 2024-01-01 as reference date for consistency with seed data
    let slotStart = new Date(`2024-01-01T${config.StartTime}:00`);

    for (let index = 0; index < config.TimeslotPerDay; index++) {
      const currentSlotNumber = index + 1;

      // Apply mini break if configured
      if (
        config.HasMinibreak &&
        config.MiniBreak.SlotNumber === currentSlotNumber
      ) {
        slotStart.setMinutes(slotStart.getMinutes() + config.MiniBreak.Duration);
      }

      // Determine if this slot is a break period
      const isBreak = calculateBreaktime(
        currentSlotNumber,
        config.BreakTimeslots,
      );

      // Calculate end time based on break status
      const endTime = new Date(slotStart);
      if (isBreak !== breaktimeEnum.NOT_BREAK) {
        endTime.setMinutes(endTime.getMinutes() + config.BreakDuration);
      } else {
        endTime.setMinutes(endTime.getMinutes() + config.Duration);
      }

      // Create timeslot record
      const newSlot: timeslot = {
        TimeslotID: generateTimeslotId(
          config.Semester,
          config.AcademicYear,
          day,
          currentSlotNumber,
        ),
        DayOfWeek: day,
        AcademicYear: config.AcademicYear,
        Semester: config.Semester,
        StartTime: slotStart,
        EndTime: endTime,
        Breaktime: isBreak,
      };

      timeslots.push(newSlot);

      // Next slot starts when this one ends
      slotStart = new Date(endTime);
    }
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
