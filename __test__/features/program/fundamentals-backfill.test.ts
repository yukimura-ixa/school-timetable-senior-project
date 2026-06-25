// __test__/features/program/fundamentals-backfill.test.ts
import { describe, it, expect } from "vitest";
import { planProgramBackfill } from "@/prisma/migration-backfill-fundamentals";

const template = [
  { SubjectCode: "ท31101", MinCredits: 1.0, MaxCredits: null },
  { SubjectCode: "ค31101", MinCredits: 1.0, MaxCredits: null },
  { SubjectCode: "ว31101", MinCredits: 1.0, MaxCredits: null },
];

describe("planProgramBackfill", () => {
  it("deletes CORE rows that match the template exactly (no override)", () => {
    const plan = planProgramBackfill({
      template,
      coreProgramSubjects: [
        { SubjectCode: "ท31101", MinCredits: 1.0, MaxCredits: null },
        { SubjectCode: "ค31101", MinCredits: 1.0, MaxCredits: null },
        { SubjectCode: "ว31101", MinCredits: 1.0, MaxCredits: null },
      ],
    });
    expect(plan.deletes.sort()).toEqual(["ค31101", "ท31101", "ว31101"]);
    expect(plan.overrides).toEqual([]);
  });

  it("emits a credit override when a CORE row's credits differ from template", () => {
    const plan = planProgramBackfill({
      template,
      coreProgramSubjects: [
        { SubjectCode: "ท31101", MinCredits: 0.5, MaxCredits: null }, // differs
        { SubjectCode: "ค31101", MinCredits: 1.0, MaxCredits: null },
        { SubjectCode: "ว31101", MinCredits: 1.0, MaxCredits: null },
      ],
    });
    expect(plan.deletes.sort()).toEqual(["ค31101", "ท31101", "ว31101"]);
    expect(plan.overrides).toContainEqual({
      SubjectCode: "ท31101",
      Excluded: false,
      MinCredits: 0.5,
      MaxCredits: null,
    });
  });

  it("emits an Excluded override when a template subject is absent from the program", () => {
    const plan = planProgramBackfill({
      template,
      coreProgramSubjects: [
        { SubjectCode: "ท31101", MinCredits: 1.0, MaxCredits: null },
        { SubjectCode: "ค31101", MinCredits: 1.0, MaxCredits: null },
        // ว31101 missing
      ],
    });
    expect(plan.deletes.sort()).toEqual(["ค31101", "ท31101"]);
    expect(plan.overrides).toContainEqual({
      SubjectCode: "ว31101",
      Excluded: true,
      MinCredits: null,
      MaxCredits: null,
    });
  });

  it("leaves a non-template CORE row untouched (not deleted, no override)", () => {
    const plan = planProgramBackfill({
      template,
      coreProgramSubjects: [
        { SubjectCode: "ท31101", MinCredits: 1.0, MaxCredits: null },
        { SubjectCode: "ค31101", MinCredits: 1.0, MaxCredits: null },
        { SubjectCode: "ว31101", MinCredits: 1.0, MaxCredits: null },
        { SubjectCode: "ส30999", MinCredits: 1.0, MaxCredits: null }, // not in template
      ],
    });
    expect(plan.deletes).not.toContain("ส30999");
    expect(plan.overrides.find((o) => o.SubjectCode === "ส30999")).toBeUndefined();
  });
});
