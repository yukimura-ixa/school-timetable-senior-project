import { describe, it, expect } from "vitest";
import { computeCarryOver } from "./carry-over";

describe("computeCarryOver", () => {
  const sectionSubjects = {
    "M1-1": ["ค21102", "ท21102"], // S2 codes available for this section
  };

  it("maps a core subject to its S2 code, keeping the teacher as a suggestion", () => {
    const { mapped, exceptions } = computeCarryOver(
      [{ GradeID: "M1-1", SubjectCode: "ค21101", TeacherID: 4 }],
      sectionSubjects,
    );
    expect(mapped).toEqual([{ GradeID: "M1-1", SubjectCode: "ค21102", TeacherID: 4 }]);
    expect(exceptions).toHaveLength(0);
  });

  it("flags an exception when the code has no S2 mapping", () => {
    const { mapped, exceptions } = computeCarryOver(
      [{ GradeID: "M1-1", SubjectCode: "ว30294", TeacherID: 7 }],
      sectionSubjects,
    );
    expect(mapped).toHaveLength(0);
    expect(exceptions).toEqual([
      { GradeID: "M1-1", SubjectCode: "ว30294", TeacherID: 7, reason: "no-mapping" },
    ]);
  });

  it("flags an exception when the mapped code is not in the section's program", () => {
    const { mapped, exceptions } = computeCarryOver(
      [{ GradeID: "M1-1", SubjectCode: "พ21101", TeacherID: 14 }], // maps to พ21102, absent
      sectionSubjects,
    );
    expect(mapped).toHaveLength(0);
    expect(exceptions[0]).toMatchObject({ SubjectCode: "พ21101", reason: "not-in-program" });
  });
});
