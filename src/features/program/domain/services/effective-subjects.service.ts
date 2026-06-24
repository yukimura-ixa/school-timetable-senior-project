import { SubjectCategory } from "@/prisma/generated/client";
import type {
  grade_fundamental,
  program_fundamental_override,
  program_subject,
  subject,
} from "@/prisma/generated/client";

export type EffectiveSubjectSource = "INHERITED" | "OWNED";

/** Superset of `program_subject` plus inheritance metadata. */
export interface EffectiveSubject {
  ProgramSubjectID: number; // synthetic-negative for INHERITED rows
  ProgramID: number;
  SubjectCode: string;
  Category: SubjectCategory;
  IsMandatory: boolean;
  MinCredits: number;
  MaxCredits: number | null;
  SortOrder: number;
  source: EffectiveSubjectSource;
  overridden: boolean;
  subject: subject;
}

export interface EffectiveSubjectInput {
  programId: number;
  year: number;
  template: Array<grade_fundamental & { subject: subject }>;
  overrides: program_fundamental_override[];
  programSubjects: Array<program_subject & { subject: subject }>;
}

export function getEffectiveProgramSubjects(
  input: EffectiveSubjectInput,
): EffectiveSubject[] {
  const { programId, template, overrides, programSubjects } = input;

  const overrideByCode = new Map(overrides.map((o) => [o.SubjectCode, o]));
  const ownedCodes = new Set(programSubjects.map((ps) => ps.SubjectCode));

  const inherited: EffectiveSubject[] = [];
  for (const t of [...template].sort((a, b) => a.SortOrder - b.SortOrder)) {
    if (ownedCodes.has(t.SubjectCode)) continue; // OWNED wins the dedupe
    const ov = overrideByCode.get(t.SubjectCode);
    if (ov?.Excluded) continue;
    const hasCreditOverride =
      ov != null && (ov.MinCredits != null || ov.MaxCredits != null);
    inherited.push({
      ProgramSubjectID: -t.GradeFundamentalID,
      ProgramID: programId,
      SubjectCode: t.SubjectCode,
      Category: SubjectCategory.CORE,
      IsMandatory: true,
      MinCredits: ov?.MinCredits ?? t.MinCredits,
      MaxCredits: ov?.MaxCredits ?? t.MaxCredits,
      SortOrder: t.SortOrder,
      source: "INHERITED",
      overridden: hasCreditOverride,
      subject: t.subject,
    });
  }

  const ownedEffective: EffectiveSubject[] = [...programSubjects]
    .sort((a, b) => a.SortOrder - b.SortOrder)
    .map((ps) => ({
      ProgramSubjectID: ps.ProgramSubjectID,
      ProgramID: ps.ProgramID,
      SubjectCode: ps.SubjectCode,
      Category: ps.Category,
      IsMandatory: ps.IsMandatory,
      MinCredits: ps.MinCredits,
      MaxCredits: ps.MaxCredits,
      SortOrder: ps.SortOrder,
      source: "OWNED" as const,
      overridden: false,
      subject: ps.subject,
    }));

  return [...inherited, ...ownedEffective];
}

export function toProgramSubjectShape(
  rows: EffectiveSubject[],
): Array<program_subject & { subject: subject }> {
  return rows.map((r) => ({
    ProgramSubjectID: r.ProgramSubjectID,
    ProgramID: r.ProgramID,
    SubjectCode: r.SubjectCode,
    Category: r.Category,
    IsMandatory: r.IsMandatory,
    MinCredits: r.MinCredits,
    MaxCredits: r.MaxCredits,
    SortOrder: r.SortOrder,
    subject: r.subject,
  })) as Array<program_subject & { subject: subject }>;
}
