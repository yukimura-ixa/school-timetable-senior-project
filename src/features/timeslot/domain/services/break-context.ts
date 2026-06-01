import type { BreakGroup } from "@/features/timeslot/domain/models/break.types";

type BreakGroupRow = {
  Name: string;
  Label: string;
  Color: string;
  grades: { GradeID: string }[];
};

/** Pure mapper: break_group DB rows (with included grades) → domain BreakGroup[]. */
export function toBreakGroups(rows: BreakGroupRow[]): BreakGroup[] {
  return rows.map((r) => ({
    name: r.Name,
    label: r.Label,
    color: r.Color,
    gradeIds: r.grades.map((g) => g.GradeID),
  }));
}
