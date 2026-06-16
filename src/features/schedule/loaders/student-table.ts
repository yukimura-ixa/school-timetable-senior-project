import "server-only";
import { notFound } from "next/navigation";
import type { semester } from "@/prisma/generated/client";
import { publicDataRepository } from "@/lib/infrastructure/repositories/public-data.repository";
import * as classRepository from "@/features/class/infrastructure/repositories/class.repository";
import { breakGroupRepository } from "@/features/timeslot/infrastructure/repositories/break-group.repository";
import { toBreakGroups } from "@/features/timeslot/domain/services/break-context";
import { findByTerm as findConfigByTerm } from "@/features/config/infrastructure/repositories/config.repository";
import { parseConfigData } from "@/features/config/domain/types/config-data.types";
import type { SlotConfig, BreakGroup } from "@/features/timeslot/domain/models/break.types";
import type { ScheduleCell } from "@/components/schedule/TimeslotGrid";

export type StudentTableView = {
  academicYear: number;
  semNum: number;
  timeslots: Awaited<ReturnType<typeof publicDataRepository.findTimeslotsByTerm>>;
  slots: SlotConfig[];
  breakGroups: BreakGroup[];
  /** Keyed by TimeslotID; contains the first subject assigned to that slot across all grades. */
  cellsByTimeslotId: Map<string, ScheduleCell>;
};

/**
 * Loads the combined student-table (all-grades) schedule view for a given term.
 *
 * Admin-only: the caller MUST have already enforced admin auth before calling
 * this loader, as it bypasses the DRAFT-guard check intentionally so the admin
 * can preview an unreleased term from the print route.
 */
export async function loadStudentTableView(
  academicYear: number,
  semNum: number,
): Promise<StudentTableView> {
  const semesterEnum = semNum === 1 ? "SEMESTER_1" : semNum === 2 ? "SEMESTER_2" : null;
  if (!semesterEnum || isNaN(academicYear)) notFound();

  const semesterValue: semester = semesterEnum;

  const configId = `${semNum}-${academicYear}`;
  const [timeslots, termConfig, breakGroupRows, schedules] = await Promise.all([
    publicDataRepository.findTimeslotsByTerm(academicYear, semesterValue),
    findConfigByTerm(academicYear, semesterValue),
    breakGroupRepository.findByConfigId(configId),
    classRepository.findByTerm(academicYear, semesterValue),
  ]);

  let slots: SlotConfig[] = [];
  try {
    slots = termConfig?.Config ? parseConfigData(termConfig.Config).slots : [];
  } catch {
    slots = [];
  }

  const breakGroups = toBreakGroups(breakGroupRows);

  // Build cells: for the "all" view, each timeslot shows at most one entry.
  // We record the first schedule entry per timeslot (consistent with all-timeslot page).
  const cellsByTimeslotId = new Map<string, ScheduleCell>();
  for (const s of schedules) {
    if (cellsByTimeslotId.has(s.timeslot.TimeslotID)) continue;
    cellsByTimeslotId.set(s.timeslot.TimeslotID, {
      timeslotId: s.timeslot.TimeslotID,
      subjectCode: s.subject.SubjectCode,
      subjectName: s.subject.SubjectName,
      gradeLabel: `ม.${s.gradelevel.Year}/${s.gradelevel.Number}`,
      teacherLabel:
        s.teachers_responsibility
          .map((tr) => `${tr.teacher.Prefix}${tr.teacher.Firstname} ${tr.teacher.Lastname}`)
          .join(", ") || undefined,
      roomLabel: s.room?.RoomName ?? undefined,
    });
  }

  return {
    academicYear,
    semNum,
    timeslots,
    slots,
    breakGroups,
    cellsByTimeslotId,
  };
}
