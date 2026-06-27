import { computeResponsibilitiesDiff } from "@/features/assign/domain/services/assign-validation.service";
import type { teachers_responsibility } from "@/prisma/generated/client";

export interface MatrixAssignment {
  RespID?: number;
  TeacherID: number;
  GradeID: string;
  SubjectCode: string;
  Credit: string;
}
export interface TeacherDiff {
  TeacherID: number;
  toCreate: { GradeID: string; SubjectCode: string; Credit: string }[];
  toDeleteRespIds: number[];
}

export function groupMatrixDiffByTeacher(
  existing: MatrixAssignment[],
  desired: MatrixAssignment[],
): TeacherDiff[] {
  const teacherIds = new Set<number>();
  for (const a of existing) teacherIds.add(a.TeacherID);
  for (const a of desired) teacherIds.add(a.TeacherID);

  const diffs: TeacherDiff[] = [];
  for (const TeacherID of teacherIds) {
    const ex = existing.filter((a) => a.TeacherID === TeacherID);
    const incoming = desired
      .filter((a) => a.TeacherID === TeacherID)
      .map((a) => ({
        ...(a.RespID !== undefined ? { RespID: a.RespID } : {}),
        GradeID: a.GradeID,
        SubjectCode: a.SubjectCode,
        Credit: a.Credit,
      }));
    const { toCreate, toDelete } = computeResponsibilitiesDiff(
      ex as unknown as teachers_responsibility[],
      incoming,
    );
    diffs.push({
      TeacherID,
      toCreate: toCreate.map((c) => ({ GradeID: c.GradeID, SubjectCode: c.SubjectCode, Credit: String(c.Credit) })),
      toDeleteRespIds: toDelete.map((d) => d.RespID),
    });
  }
  return diffs;
}
