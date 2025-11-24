/**
 * Compliance Repository
 * Section 7: Curriculum Compliance
 *
 * Provides data fetching methods for curriculum compliance analysis including program requirements and credit tracking.
 */

import prisma from "@/lib/prisma";
import type {
  ProgramCompliance,
  CategoryCredits,
  MandatorySubjectInfo,
} from "../../domain/types/analytics.types";
import {
  parseConfigId,
  sumCategoryCredits,
} from "../../domain/services/calculation.service";

/**
 * Get program compliance data
 */
async function getProgramCompliance(
  configId: string,
): Promise<ProgramCompliance[]> {
  const config = parseConfigId(configId);

  // Get timeslot IDs for this semester
  const timeslots = await prisma.timeslot.findMany({
    where: {
      AcademicYear: config.academicYear,
      Semester: config.semester,
    },
    select: {
      TimeslotID: true,
    },
  });

  const timeslotIds = timeslots.map((t: any) => t.TimeslotID);

  // Get all programs with their gradelevels
  const programs = await prisma.program.findMany({
    include: {
      gradelevel: {
        where: {
          Year: config.academicYear,
        },
        include: {
          class_schedule: {
            where: {
              TimeslotID: {
                in: timeslotIds,
              },
            },
            include: {
              subject: {
                select: {
                  SubjectCode: true,
                  Category: true,
                  Credit: true,
                },
              },
            },
          },
        },
      },
      program_subject: {
        include: {
          subject: {
            select: {
              SubjectName: true,
            },
          },
        },
      },
    },
  });

  // Transform to compliance data
  return programs.map((program: any) => {
    // Collect all scheduled subjects for this program
    const scheduledSubjects = new Map<
      string,
      { category: string; credits: number }
    >();

    program.gradelevel.forEach((grade: any) => {
      grade.class_schedule.forEach((schedule: any) => {
        if (schedule.subject) {
          if (!scheduledSubjects.has(schedule.subject.SubjectCode)) {
            // Parse credit value
            let creditValue = 0;
            if (schedule.subject.Credit) {
              const creditMatch = schedule.subject.Credit.match(/[\d.]+/);
              creditValue = creditMatch ? parseFloat(creditMatch[0]) : 0;
            }

            scheduledSubjects.set(schedule.subject.SubjectCode, {
              category: schedule.subject.Category,
              credits: creditValue,
            });
          }
        }
      });
    });

    // Build scheduled credits by category
    const scheduledCredits: CategoryCredits = {
      core: 0,
      additional: 0,
      activity: 0,
      elective: 0,
      total: 0,
    };

    scheduledSubjects.forEach((subject) => {
      switch (subject.category) {
        case "CORE":
          scheduledCredits.core += subject.credits;
          break;
        case "ADDITIONAL":
          // ADDITIONAL can be mandatory or elective, treat as additional
          scheduledCredits.additional += subject.credits;
          break;
        case "ACTIVITY":
          scheduledCredits.activity += subject.credits;
          break;
      }
    });
    scheduledCredits.total = sumCategoryCredits(scheduledCredits);

    // Build required credits from program_subject (simplified)
    const requiredCredits: CategoryCredits = {
      core: 0,
      additional: 0,
      activity: 0,
      elective: 0,
      total: program.MinTotalCredits,
    };

    // Calculate required credits per category from program_subject
    program.program_subject.forEach((ps: any) => {
      switch (ps.Category) {
        case "CORE":
          requiredCredits.core += ps.MinCredits;
          break;
        case "ADDITIONAL":
          // Separate mandatory ADDITIONAL from elective ADDITIONAL
          if (ps.IsMandatory) {
            requiredCredits.additional += ps.MinCredits;
          } else {
            requiredCredits.elective += ps.MinCredits;
          }
          break;
        case "ACTIVITY":
          requiredCredits.activity += ps.MinCredits;
          break;
      }
    });

    // Calculate compliance rate
    const complianceRate =
      requiredCredits.total > 0
        ? Math.min((scheduledCredits.total / requiredCredits.total) * 100, 100)
        : 0;

    // Determine compliance status
    let complianceStatus:
      | "non-compliant"
      | "partial"
      | "near-complete"
      | "compliant";
    if (complianceRate >= 95) {
      complianceStatus = "compliant";
    } else if (complianceRate >= 80) {
      complianceStatus = "near-complete";
    } else if (complianceRate >= 50) {
      complianceStatus = "partial";
    } else {
      complianceStatus = "non-compliant";
    }

    // Check for missing mandatory subjects
    const scheduledSubjectCodes = new Set(scheduledSubjects.keys());
    const missingMandatorySubjects: MandatorySubjectInfo[] =
      program.program_subject
        .filter(
          (ps: any) =>
            ps.IsMandatory && !scheduledSubjectCodes.has(ps.SubjectCode),
        )
        .map((ps: any) => ({
          subjectCode: ps.SubjectCode,
          subjectName: ps.subject?.SubjectName || ps.SubjectCode,
          category: ps.Category,
          minCredits: ps.MinCredits,
          maxCredits: ps.MaxCredits,
          reason: "ยังไม่ได้จัดในตาราง",
        }));

    // Find track label
    const trackLabels: Record<string, string> = {
      GENERAL: "ทั่วไป",
      SCIENCE_MATH: "วิทย์-คณิต",
      ARTS_LANG: "ศิลป์-ภาษา",
      ARTS_CALC: "ศิลป์-คำนวณ",
    };

    return {
      programId: program.ProgramID,
      programCode: program.ProgramCode,
      programName: program.ProgramName,
      year: program.Year,
      track: program.Track,
      trackLabel: trackLabels[program.Track] || program.Track,
      minTotalCredits: program.MinTotalCredits,
      scheduledCredits,
      requiredCredits,
      complianceRate: Math.round(complianceRate * 10) / 10,
      complianceStatus,
      missingMandatorySubjects,
      gradeCount: program.gradelevel.length,
    };
  });
}

/**
 * Get compliance data for a specific program
 */
async function getProgramComplianceById(
  configId: string,
  programId: number,
): Promise<ProgramCompliance | null> {
  const compliance = await getProgramCompliance(configId);
  return compliance.find((c) => c.programId === programId) || null;
}

/**
 * Get programs below compliance threshold
 */
async function getProgramsBelowThreshold(
  configId: string,
  threshold = 80,
): Promise<ProgramCompliance[]> {
  const compliance = await getProgramCompliance(configId);
  return compliance.filter((c) => c.complianceRate < threshold);
}

/**
 * Get programs with missing mandatory subjects
 */
async function getProgramsWithMissingSubjects(
  configId: string,
): Promise<ProgramCompliance[]> {
  const compliance = await getProgramCompliance(configId);
  return compliance.filter((c) => c.missingMandatorySubjects.length > 0);
}

export const complianceRepository = {
  getProgramCompliance,
  getProgramComplianceById,
  getProgramsBelowThreshold,
  getProgramsWithMissingSubjects,
};
