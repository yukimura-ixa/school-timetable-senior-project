export type AssignmentMode = "by-grade" | "by-teacher";

type SearchParamsLike = { get: (key: string) => string | null } | null;

export function resolveAssignmentMode(
  searchParams: SearchParamsLike,
): AssignmentMode {
  if (!searchParams) return "by-grade";
  const raw = searchParams.get("mode");
  return raw === "by-teacher" ? "by-teacher" : "by-grade";
}
