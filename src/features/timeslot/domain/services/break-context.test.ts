import { describe, expect, it } from "vitest";
import { toBreakGroups } from "./break-context";

describe("toBreakGroups", () => {
  it("maps break_group rows (with grades) to BreakGroup[]", () => {
    const rows = [
      {
        BreakGroupID: 1, Name: "junior", Label: "ม.ต้น", Color: "#4CAF50", ConfigID: "1-2567",
        grades: [
          { BreakGroupGradeID: 1, BreakGroupID: 1, GradeID: "M1-1" },
          { BreakGroupGradeID: 2, BreakGroupID: 1, GradeID: "M2-1" },
        ],
      },
    ];
    expect(toBreakGroups(rows as any)).toEqual([
      { name: "junior", label: "ม.ต้น", color: "#4CAF50", gradeIds: ["M1-1", "M2-1"] },
    ]);
  });

  it("handles a group with no grades", () => {
    const rows = [
      { BreakGroupID: 9, Name: "empty", Label: "ว่าง", Color: "#000000", ConfigID: "1-2567", grades: [] },
    ];
    expect(toBreakGroups(rows as any)).toEqual([
      { name: "empty", label: "ว่าง", color: "#000000", gradeIds: [] },
    ]);
  });
});
