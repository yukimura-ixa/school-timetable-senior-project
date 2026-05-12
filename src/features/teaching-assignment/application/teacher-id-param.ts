type SearchParamsLike = { get: (key: string) => string | null } | null;

export function resolveTeacherIdFromParams(
  searchParams: SearchParamsLike,
): number | null {
  if (!searchParams) return null;
  const raw = searchParams.get("teacherId");
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}
