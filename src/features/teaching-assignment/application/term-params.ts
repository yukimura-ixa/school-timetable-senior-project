import type { semester } from "@/prisma/generated/client";

type SearchParamsLike = { get: (key: string) => string | null } | null;

export interface ResolvedTermParams {
  academicYear: number | null;
  semester: semester | null;
  gradeId: string | null;
}

const EMPTY: ResolvedTermParams = {
  academicYear: null,
  semester: null,
  gradeId: null,
};

function parseYear(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function parseSemester(raw: string | null): semester | null {
  if (raw === "1") return "SEMESTER_1";
  if (raw === "2") return "SEMESTER_2";
  return null;
}

function parseGradeId(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Seeds the consolidated assignment page's term filters from the URL so legacy
 * redirects (which carry year/semester) land on the right context. Mirrors the
 * sibling resolvers `resolveAssignmentMode` and `resolveTeacherIdFromParams`.
 */
export function resolveTermFromParams(
  searchParams: SearchParamsLike,
): ResolvedTermParams {
  if (!searchParams) return EMPTY;
  return {
    academicYear: parseYear(searchParams.get("year")),
    semester: parseSemester(searchParams.get("semester")),
    gradeId: parseGradeId(searchParams.get("gradeId")),
  };
}
