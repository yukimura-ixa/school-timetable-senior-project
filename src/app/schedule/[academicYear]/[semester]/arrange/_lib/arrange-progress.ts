export type RequiredSubject = {
  SubjectCode: string;
  SubjectName: string;
  requiredHours: number;
};

export type RemainingSubject = {
  SubjectCode: string;
  SubjectName: string;
  remaining: number;
};

export function computeProgress(placed: number, required: number) {
  const percent =
    required <= 0 ? 0 : Math.min(100, Math.round((placed / required) * 100));
  return { placed, required, percent };
}

export function computeRemaining(
  required: RequiredSubject[],
  placedBySubject: Record<string, number>,
): RemainingSubject[] {
  return required
    .map((r) => ({
      SubjectCode: r.SubjectCode,
      SubjectName: r.SubjectName,
      remaining: Math.max(0, r.requiredHours - (placedBySubject[r.SubjectCode] ?? 0)),
    }))
    .filter((r) => r.remaining > 0);
}
