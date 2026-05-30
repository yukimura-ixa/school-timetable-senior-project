import { describe, it, expect } from "vitest";
import { computeProgress, computeRemaining } from "../arrange-progress";

describe("computeProgress", () => {
  it("computes placed/required and percent", () => {
    expect(computeProgress(18, 25)).toEqual({ placed: 18, required: 25, percent: 72 });
  });
  it("clamps percent to 100 and guards divide-by-zero", () => {
    expect(computeProgress(30, 25).percent).toBe(100);
    expect(computeProgress(0, 0)).toEqual({ placed: 0, required: 0, percent: 0 });
  });
});

describe("computeRemaining", () => {
  it("subtracts placed-per-subject from required-per-subject, floored at 0", () => {
    const required = [
      { SubjectCode: "ค21101", SubjectName: "คณิตศาสตร์", requiredHours: 3 },
      { SubjectCode: "ว21101", SubjectName: "วิทยาศาสตร์", requiredHours: 2 },
    ];
    const placedBySubject = { "ค21101": 1 };
    expect(computeRemaining(required, placedBySubject)).toEqual([
      { SubjectCode: "ค21101", SubjectName: "คณิตศาสตร์", remaining: 2 },
      { SubjectCode: "ว21101", SubjectName: "วิทยาศาสตร์", remaining: 2 },
    ]);
  });
  it("omits subjects with zero remaining", () => {
    const required = [{ SubjectCode: "ค21101", SubjectName: "คณิตศาสตร์", requiredHours: 2 }];
    expect(computeRemaining(required, { "ค21101": 2 })).toEqual([]);
  });
});
