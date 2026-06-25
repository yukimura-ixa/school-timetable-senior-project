import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { programRepository } from "@/features/program/infrastructure/repositories/program.repository";
import prisma from "@/lib/prisma";

// program_fundamental_override seam (issue x1b Task 10): the inherited-section
// controls exclude a CORE fundamental or override its credits per program.
// Exercised at the repository seam on a throwaway program; CI runs against the
// seeded DB. cacheStrategy() is a no-op without Accelerate, so read-after-write
// is deterministic here.
describe("fundamental override seam (integration)", () => {
  let programId: number;
  let coreCode: string;

  beforeAll(async () => {
    const base = await prisma.program.findFirst();
    const fundamental = await prisma.grade_fundamental.findFirst({
      where: { Year: base!.Year },
      orderBy: { SortOrder: "asc" },
    });
    coreCode = fundamental!.SubjectCode;

    const program = await prisma.program.create({
      data: {
        ProgramCode: `TEST-OVERRIDE-${Date.now()}`,
        ProgramName: "override test",
        Year: base!.Year,
        Track: base!.Track,
        MinTotalCredits: base!.MinTotalCredits,
        Description: base!.Description,
        IsActive: true,
      },
    });
    programId = program.ProgramID;
  });

  afterAll(async () => {
    await prisma.program
      .delete({ where: { ProgramID: programId } })
      .catch(() => {});
  });

  it("baseline: inherits the CORE template subject", async () => {
    const eff = await programRepository.getEffectiveSubjects(programId);
    expect(
      eff.some((e) => e.SubjectCode === coreCode && e.source === "INHERITED"),
    ).toBe(true);
  });

  it("exclude drops the inherited subject; clear restores it", async () => {
    await programRepository.setFundamentalOverride(programId, coreCode, {
      Excluded: true,
    });
    let eff = await programRepository.getEffectiveSubjects(programId);
    expect(eff.some((e) => e.SubjectCode === coreCode)).toBe(false);

    await programRepository.clearFundamentalOverride(programId, coreCode);
    eff = await programRepository.getEffectiveSubjects(programId);
    expect(
      eff.some((e) => e.SubjectCode === coreCode && e.source === "INHERITED"),
    ).toBe(true);
  });

  it("credit override changes MinCredits and marks the row overridden", async () => {
    await programRepository.setFundamentalOverride(programId, coreCode, {
      Excluded: false,
      MinCredits: 0.5,
    });
    const eff = await programRepository.getEffectiveSubjects(programId);
    const row = eff.find((e) => e.SubjectCode === coreCode);
    expect(row?.MinCredits).toBe(0.5);
    expect(row?.overridden).toBe(true);

    await programRepository.clearFundamentalOverride(programId, coreCode);
  });
});
