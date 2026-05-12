export interface TeacherStatsRow {
  GradeID: string;
  TeachHour?: number;
}

export interface TeacherStats {
  teachHour: number;
  subjectCount: number;
  classCount: number;
}

export function computeTeacherStats(rows: TeacherStatsRow[]): TeacherStats {
  const teachHour = rows.reduce((sum, r) => sum + (r.TeachHour ?? 0), 0);
  const subjectCount = rows.length;
  const classCount = new Set(rows.map((r) => r.GradeID)).size;
  return { teachHour, subjectCount, classCount };
}
