import { subjectCreditToNumber } from "../../domain/utils/subject-credit";
import type { SubjectOption } from "./AddSubjectModal";
import type { AssignmentWithRelations } from "./TeacherCentricEditor";

// GradeID → the subjects the teacher is responsible for in that room.
export type EditState = Record<string, SubjectOption[]>;

export interface RespInput {
  GradeID: string;
  SubjectCode: string;
  Credit: string;
}

export function assignmentsToEditState(
  assignments: AssignmentWithRelations[],
): EditState {
  const state: EditState = {};
  for (const a of assignments) {
    (state[a.GradeID] ??= []).push({
      SubjectCode: a.SubjectCode,
      SubjectName: a.SubjectName,
      Credit: a.Credit,
    });
  }
  return state;
}

// The sync schema accepts numeric-string credits ("1.0"), not the prisma enum.
export function toNumericCredit(credit: string): string {
  return subjectCreditToNumber(credit).toFixed(1);
}

export function buildSyncResp(state: EditState): RespInput[] {
  return Object.entries(state).flatMap(([gradeId, subjects]) =>
    subjects.map((s) => ({
      GradeID: gradeId,
      SubjectCode: s.SubjectCode,
      Credit: toNumericCredit(s.Credit),
    })),
  );
}

export function findEmptyRooms(state: EditState): string[] {
  return Object.entries(state)
    .filter(([, subjects]) => subjects.length === 0)
    .map(([gradeId]) => gradeId);
}
