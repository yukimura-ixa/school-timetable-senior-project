/**
 * Wizard State Query
 *
 * Gathers the three observable flags that drive the scheduling wizard's
 * forward gating (see domain/wizard-steps.ts). Server-only.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import type { WizardState } from "../../domain/wizard-steps";

export async function getWizardState(
  academicYear: number,
  semester: 1 | 2,
): Promise<WizardState> {
  const semesterEnum = semester === 1 ? "SEMESTER_1" : "SEMESTER_2";

  const [timeslotCount, responsibilityCount, placementCount] =
    await Promise.all([
      prisma.timeslot.count({
        where: { AcademicYear: academicYear, Semester: semesterEnum },
      }),
      prisma.teachers_responsibility.count({
        where: { AcademicYear: academicYear, Semester: semesterEnum },
      }),
      prisma.class_schedule.count({
        where: {
          IsLocked: false,
          timeslot: { AcademicYear: academicYear, Semester: semesterEnum },
        },
      }),
    ]);

  return {
    hasGrid: timeslotCount > 0,
    hasResponsibilities: responsibilityCount > 0,
    hasPlacements: placementCount > 0,
  };
}
