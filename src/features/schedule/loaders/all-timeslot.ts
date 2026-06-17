import "server-only";
import { notFound } from "next/navigation";
import type { semester, teacher, timeslot } from "@/prisma/generated/client";
import { sortTimeslots } from "@/features/timeslot/domain/services/timeslot.service";
import { timeslotRepository } from "@/features/timeslot/infrastructure/repositories/timeslot.repository";
import {
  findSummary,
  type ClassScheduleWithSummary,
} from "@/features/class/infrastructure/repositories/class.repository";
import { teacherRepository } from "@/features/teacher/infrastructure/repositories/teacher.repository";
import { findByTerm as findConfigByTerm } from "@/features/config/infrastructure/repositories/config.repository";
import { parseConfigData } from "@/features/config/domain/types/config-data.types";
import type { SlotConfig } from "@/features/timeslot/domain/models/break.types";

export type AllTimeslotView = {
  timeslots: timeslot[];
  classSchedules: ClassScheduleWithSummary[];
  teachers: teacher[];
  slots: SlotConfig[];
  academicYear: number;
  semNum: 1 | 2;
};

export async function loadAllTimeslotView(
  academicYear: number,
  semNum: number,
): Promise<AllTimeslotView> {
  const semesterEnum: semester | null =
    semNum === 1 ? "SEMESTER_1" : semNum === 2 ? "SEMESTER_2" : null;
  if (!semesterEnum || isNaN(academicYear)) notFound();

  const [timeslots, classSchedules, teachers, termConfig] = await Promise.all([
    timeslotRepository.findByTerm(academicYear, semesterEnum),
    findSummary(academicYear, semesterEnum),
    teacherRepository.findAll(),
    findConfigByTerm(academicYear, semesterEnum),
  ]);

  let slots: SlotConfig[] = [];
  try {
    slots = termConfig?.Config ? parseConfigData(termConfig.Config).slots : [];
  } catch {
    slots = [];
  }

  return {
    timeslots: sortTimeslots(timeslots),
    classSchedules,
    teachers,
    slots,
    academicYear,
    semNum: semNum as 1 | 2,
  };
}
