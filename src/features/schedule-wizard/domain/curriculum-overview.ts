/**
 * Curriculum Overview Builder
 *
 * Turns the term's active programs into a per-program MOE-compliance view for
 * wizard step 2. Pure delegation: MOE math comes from validateProgramMOECredits;
 * this module only maps to display shape and aggregates the all-valid flag.
 */
import {
  validateProgramMOECredits,
  getLearningAreaNameThai,
} from "@/features/program/domain/services/moe-validation.service";
import type { FullConfigData } from "@/features/config/types/config-types";
import type { ProgramTrack } from "@/prisma/generated/client";

type ProgramWithSubjects = FullConfigData["programs"][number];

const TRACK_LABELS_THAI: Record<ProgramTrack, string> = {
  SCIENCE_MATH: "แผนวิทย์-คณิต",
  LANGUAGE_MATH: "แผนศิลป์-คำนวณ",
  LANGUAGE_ARTS: "แผนศิลป์-ภาษา",
  GENERAL: "แผนทั่วไป",
  DUAL_VOCATIONAL: "แผนทวิศึกษา",
};

export interface LearningAreaView {
  label: string;
  required: number;
  current: number;
  isMet: boolean;
  deficit: number;
}

export interface ProgramMOEView {
  programId: number;
  programName: string;
  year: number;
  trackLabel: string;
  isValid: boolean;
  totalCredits: number;
  requiredCredits: number;
  learningAreas: LearningAreaView[];
  errors: string[];
  warnings: string[];
}

export interface CurriculumOverview {
  programs: ProgramMOEView[];
  allValid: boolean;
}

function trackLabel(track: ProgramTrack | null | undefined): string {
  return track ? TRACK_LABELS_THAI[track] : TRACK_LABELS_THAI.GENERAL;
}

export function buildCurriculumOverview(
  programs: ProgramWithSubjects[],
): CurriculumOverview {
  const views: ProgramMOEView[] = programs.map((program) => {
    const result = validateProgramMOECredits(
      program.Year,
      program.program_subject,
      program.Track ?? undefined,
    );

    return {
      programId: program.ProgramID,
      programName: program.ProgramName,
      year: program.Year,
      trackLabel: trackLabel(program.Track),
      isValid: result.isValid,
      totalCredits: result.totalCredits,
      requiredCredits: result.requiredCredits,
      learningAreas: result.learningAreas.map((la) => ({
        label: getLearningAreaNameThai(la.learningArea),
        required: la.required,
        current: la.current,
        isMet: la.isMet,
        deficit: la.deficit,
      })),
      errors: result.errors,
      warnings: result.warnings,
    };
  });

  return {
    programs: views,
    allValid: views.every((v) => v.isValid),
  };
}
