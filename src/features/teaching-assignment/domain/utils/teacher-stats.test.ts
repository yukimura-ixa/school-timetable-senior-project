import { describe, it, expect } from "vitest";
import { computeTeacherStats } from "./teacher-stats";

describe("computeTeacherStats", () => {
  it("returns zeros for empty input", () => {
    expect(computeTeacherStats([])).toEqual({
      teachHour: 0,
      subjectCount: 0,
      classCount: 0,
    });
  });

  it("sums TeachHour across rows", () => {
    const result = computeTeacherStats([
      { GradeID: "M1/1", TeachHour: 3 },
      { GradeID: "M1/1", TeachHour: 4 },
      { GradeID: "M2/1", TeachHour: 2 },
    ]);
    expect(result.teachHour).toBe(9);
  });

  it("counts subjectCount as total row count", () => {
    const result = computeTeacherStats([
      { GradeID: "M1/1", TeachHour: 3 },
      { GradeID: "M1/1", TeachHour: 4 },
      { GradeID: "M2/1", TeachHour: 2 },
    ]);
    expect(result.subjectCount).toBe(3);
  });

  it("counts classCount as unique GradeID count", () => {
    const result = computeTeacherStats([
      { GradeID: "M1/1", TeachHour: 3 },
      { GradeID: "M1/1", TeachHour: 4 },
      { GradeID: "M2/1", TeachHour: 2 },
    ]);
    expect(result.classCount).toBe(2);
  });

  it("treats missing TeachHour as zero", () => {
    const result = computeTeacherStats([
      { GradeID: "M1/1" },
      { GradeID: "M1/1", TeachHour: 3 },
    ]);
    expect(result.teachHour).toBe(3);
    expect(result.subjectCount).toBe(2);
    expect(result.classCount).toBe(1);
  });
});
