import { describe, it, expect } from "vitest";
import { programRepository } from "@/features/program/infrastructure/repositories/program.repository";
import prisma from "@/lib/prisma";
import { SubjectCategory } from "@/prisma/generated/client";

// Guard (issue by3/x1b): the editor surfaces inherited CORE, so a save must
// never write it back as owned via assignSubjects' deleteMany+createMany.
// Operates on an existing seeded program by feeding its current owned set back
// plus an injected CORE row — assignSubjects must drop the CORE while keeping
// the owned rows, leaving the program effectively unchanged (natural restore).
// The production seed fills every (Year, Track) slot, so a throwaway program
// can't be created.
describe("assignSubjects never persists inherited CORE as owned (integration)", () => {
  it("drops CORE from the owned write while preserving owned rows + inheritance", async () => {
    const program = await prisma.program.findFirst({
      where: { program_subject: { some: {} } },
      include: { program_subject: true },
    });
    expect(program).not.toBeNull();
    const owned = program!.program_subject;

    const fundamental = await prisma.grade_fundamental.findFirst({
      where: { Year: program!.Year },
    });
    expect(fundamental).not.toBeNull();
    const coreCode = fundamental!.SubjectCode;
    // The seed never owns CORE — it comes from inheritance.
    expect(owned.some((o) => o.SubjectCode === coreCode)).toBe(false);

    await programRepository.assignSubjects({
      ProgramID: program!.ProgramID,
      subjects: [
        ...owned.map((o) => ({
          SubjectCode: o.SubjectCode,
          Category: o.Category,
          IsMandatory: o.IsMandatory,
          MinCredits: o.MinCredits,
          MaxCredits: o.MaxCredits ?? undefined,
          SortOrder: o.SortOrder,
        })),
        {
          SubjectCode: coreCode,
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 1,
          MaxCredits: 1,
          SortOrder: 999,
        },
      ],
    });

    const after = await prisma.program_subject.findMany({
      where: { ProgramID: program!.ProgramID },
    });
    // CORE was not written back as an owned row...
    expect(after.some((o) => o.SubjectCode === coreCode)).toBe(false);
    // ...and the owned rows were preserved.
    const ownedCodes = new Set(owned.map((o) => o.SubjectCode));
    expect(after.length).toBe(owned.length);
    expect(after.every((o) => ownedCodes.has(o.SubjectCode))).toBe(true);

    // The CORE still surfaces through inheritance, not as an owned row.
    const eff = await programRepository.getEffectiveSubjects(program!.ProgramID);
    expect(
      eff.some((e) => e.SubjectCode === coreCode && e.source === "INHERITED"),
    ).toBe(true);
  });
});
