import "server-only";
import { notFound } from "next/navigation";
import type { semester } from "@/prisma/generated/client";
import { publicDataRepository } from "@/lib/infrastructure/repositories/public-data.repository";
import { breakGroupRepository } from "@/features/timeslot/infrastructure/repositories/break-group.repository";
import { toBreakGroups } from "@/features/timeslot/domain/services/break-context";
import { findByTerm as findConfigByTerm } from "@/features/config/infrastructure/repositories/config.repository";
import { parseConfigData } from "@/features/config/domain/types/config-data.types";
import type { SlotConfig, BreakGroup } from "@/features/timeslot/domain/models/break.types";
import type { ScheduleCell } from "@/components/schedule/TimeslotGrid";

export type TeacherScheduleView = {
  teacher: NonNullable<Awaited<ReturnType<typeof publicDataRepository.findPublicTeacherById>>>;
  academicYear: number;
  semNum: number;
  timeslots: Awaited<ReturnType<typeof publicDataRepository.findTimeslotsByTerm>>;
  slots: SlotConfig[];
  breakGroups: BreakGroup[];
  cellsByTimeslotId: Map<string, ScheduleCell>;
};

type ResponsibilityWithSchedules = Awaited<
  ReturnType<typeof publicDataRepository.findTeacherResponsibilities>
>[number];

type PublicScheduleEntry = NonNullable<
  ResponsibilityWithSchedules["class_schedule"]
>[number];

export async function loadTeacherScheduleView(
  teacherId: number,
  academicYear: number,
  semNum: number,
): Promise<TeacherScheduleView> {
  const semesterEnum = semNum === 1 ? "SEMESTER_1" : semNum === 2 ? "SEMESTER_2" : null;
  if (!semesterEnum || isNaN(academicYear) || isNaN(teacherId)) notFound();

  const semesterValue: semester = semesterEnum;

  // Never expose unpublished (DRAFT) terms (issue 5ka).
  if (!(await publicDataRepository.isTermPublished(academicYear, semesterValue))) {
    notFound();
  }

  const teacher = await publicDataRepository.findPublicTeacherById(
    teacherId,
    academicYear,
    semesterValue,
  );
  if (!teacher) notFound();

  const responsibilities = await publicDataRepository.findTeacherResponsibilities(
    teacherId,
    academicYear,
    semesterValue,
  );
  const schedules: PublicScheduleEntry[] = responsibilities.flatMap(
    (resp) => resp.class_schedule ?? [],
  );

  const configId = `${semNum}-${academicYear}`;
  const [timeslots, termConfig, breakGroupRows] = await Promise.all([
    publicDataRepository.findTimeslotsByTerm(academicYear, semesterValue),
    findConfigByTerm(academicYear, semesterValue),
    breakGroupRepository.findByConfigId(configId),
  ]);

  let slots: SlotConfig[] = [];
  try {
    slots = termConfig?.Config ? parseConfigData(termConfig.Config).slots : [];
  } catch {
    slots = [];
  }

  const breakGroups: BreakGroup[] = toBreakGroups(breakGroupRows);

  const cellsByTimeslotId = new Map<string, ScheduleCell>();
  for (const s of schedules) {
    cellsByTimeslotId.set(s.timeslot.TimeslotID, {
      timeslotId: s.timeslot.TimeslotID,
      subjectCode: s.subject.SubjectCode,
      subjectName: s.subject.SubjectName,
      gradeLabel: `ม.${s.gradelevel.Year}/${s.gradelevel.Number}`,
      roomLabel: s.room?.RoomName ?? undefined,
    });
  }

  return {
    teacher,
    academicYear,
    semNum,
    timeslots,
    slots,
    breakGroups,
    cellsByTimeslotId,
  };
}
