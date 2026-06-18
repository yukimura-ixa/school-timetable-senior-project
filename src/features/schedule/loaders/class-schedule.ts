import "server-only";
import { notFound } from "next/navigation";
import type { semester } from "@/prisma/generated/client";
import { publicDataRepository } from "@/lib/infrastructure/repositories/public-data.repository";
import * as classRepository from "@/features/class/infrastructure/repositories/class.repository";
import { breakGroupRepository } from "@/features/timeslot/infrastructure/repositories/break-group.repository";
import { toBreakGroups } from "@/features/timeslot/domain/services/break-context";
import { buildGradeGroupIndex } from "@/utils/break-utils";
import { findByTerm as findConfigByTerm } from "@/features/config/infrastructure/repositories/config.repository";
import { parseConfigData } from "@/features/config/domain/types/config-data.types";
import type { SlotConfig, BreakGroup } from "@/features/timeslot/domain/models/break.types";
import type { ScheduleCell } from "@/components/schedule/TimeslotGrid";

export type ClassScheduleView = {
  gradeLevel: NonNullable<Awaited<ReturnType<typeof publicDataRepository.findGradeByIdOrNumeric>>>;
  academicYear: number;
  semNum: number;
  timeslots: Awaited<ReturnType<typeof publicDataRepository.findTimeslotsByTerm>>;
  slots: SlotConfig[];
  breakGroups: BreakGroup[];
  groupNames: string[];
  cellsByTimeslotId: Map<string, ScheduleCell>;
};

export async function loadClassScheduleView(
  gradeId: string,
  academicYear: number,
  semNum: number,
  opts: { requirePublished?: boolean } = {},
): Promise<ClassScheduleView> {
  const { requirePublished = true } = opts;
  const semesterEnum = semNum === 1 ? "SEMESTER_1" : semNum === 2 ? "SEMESTER_2" : null;
  if (!semesterEnum || isNaN(academicYear)) notFound();

  const gradeLevel = await publicDataRepository.findGradeByIdOrNumeric(gradeId);
  if (!gradeLevel) notFound();

  const semesterValue: semester = semesterEnum;
  if (requirePublished && !(await publicDataRepository.isTermPublished(academicYear, semesterValue))) {
    notFound();
  }

  const schedules = await classRepository.findByGrade(
    gradeLevel.GradeID,
    academicYear,
    semesterValue,
  );

  const timeslots = await publicDataRepository.findTimeslotsByTerm(academicYear, semesterValue);
  const configId = `${semNum}-${academicYear}`;
  const [termConfig, breakGroupRows] = await Promise.all([
    findConfigByTerm(academicYear, semesterValue),
    breakGroupRepository.findByConfigId(configId),
  ]);

  let slots: SlotConfig[] = [];
  try {
    slots = termConfig?.Config ? parseConfigData(termConfig.Config).slots : [];
  } catch {
    slots = [];
  }

  const breakGroups = toBreakGroups(breakGroupRows);
  const groupNames = [...(buildGradeGroupIndex(breakGroups).get(gradeLevel.GradeID) ?? [])];

  const cellsByTimeslotId = new Map<string, ScheduleCell>();
  for (const s of schedules) {
    cellsByTimeslotId.set(s.timeslot.TimeslotID, {
      timeslotId: s.timeslot.TimeslotID,
      subjectCode: s.subject.SubjectCode,
      subjectName: s.subject.SubjectName,
      teacherLabel:
        s.teachers_responsibility
          .map((tr) => `${tr.teacher.Prefix}${tr.teacher.Firstname} ${tr.teacher.Lastname}`)
          .join(", ") || undefined,
      roomLabel: s.room?.RoomName ?? undefined,
    });
  }

  return {
    gradeLevel,
    academicYear,
    semNum,
    timeslots,
    slots,
    breakGroups,
    groupNames,
    cellsByTimeslotId,
  };
}
