import { describe, it, expect, afterAll } from "vitest";
import { programRepository } from "@/features/program/infrastructure/repositories/program.repository";
import prisma from "@/lib/prisma";
import { SubjectCategory } from "@/prisma/generated/client";

// Guard (issue by3/x1b): once findById feeds the effective set into the editor,
// inherited CORE renders as "selected" and a save would re-duplicate it into
// program_subject via assignSubjects' deleteMany+createMany — silently killing
// inheritance. assignSubjects must never persist CORE as owned. Integration
// test on a throwaway program so it stays isolated; CI runs against seeded DB.
describe("assignSubjects never persists inherited CORE as owned (integration)", () => {
  let programId: number | null = null;

  afterAll(async () => {
    if (programId !== null) {
      await prisma.program
        .delete({ where: { ProgramID: programId } })
        .catch(() => {});
    }
  });

  it("drops CORE rows from the owned write, keeps inheritance intact", async () => {
    const base = await prisma.program.findFirst();
    expect(base).not.toBeNull();

    const fundamental = await prisma.grade_fundamental.findFirst({
      where: { Year: base!.Year },
    });
    expect(fundamental, "seed must provide a grade_fundamental for the year").not.toBeNull();
    const coreCode = fundamental!.SubjectCode;

    const additional = await prisma.subject.findFirst({
      where: { Category: SubjectCategory.ADDITIONAL },
    });
    expect(additional).not.toBeNull();

    const program = await prisma.program.create({
      data: {
        ProgramCode: `TEST-GUARD-${Date.now()}`,
        ProgramName: "assignSubjects guard test",
        Year: base!.Year,
        Track: base!.Track,
        MinTotalCredits: base!.MinTotalCredits,
        Description: base!.Description,
        IsActive: true,
      },
    });
    programId = program.ProgramID;

    await programRepository.assignSubjects({
      ProgramID: program.ProgramID,
      subjects: [
        {
          SubjectCode: coreCode,
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 1,
          MaxCredits: 1,
          SortOrder: 1,
        },
        {
          SubjectCode: additional!.SubjectCode,
          Category: SubjectCategory.ADDITIONAL,
          IsMandatory: false,
          MinCredits: 1,
          MaxCredits: 1,
          SortOrder: 2,
        },
      ],
    });

    const owned = await prisma.program_subject.findMany({
      where: { ProgramID: program.ProgramID },
    });
    // CORE was NOT written back as an owned row...
    expect(owned.some((o) => o.SubjectCode === coreCode)).toBe(false);
    // ...but the owned ADDITIONAL was.
    expect(owned.some((o) => o.SubjectCode === additional!.SubjectCode)).toBe(
      true,
    );

    // The CORE still surfaces through inheritance, not as an owned row.
    const eff = await programRepository.getEffectiveSubjects(program.ProgramID);
    const inheritedCore = eff.find(
      (e) => e.SubjectCode === coreCode && e.source === "INHERITED",
    );
    expect(inheritedCore).toBeDefined();
  });
});
