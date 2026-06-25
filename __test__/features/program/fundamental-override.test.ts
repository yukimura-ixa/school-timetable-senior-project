import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { programRepository } from "@/features/program/infrastructure/repositories/program.repository";
import prisma from "@/lib/prisma";

// program_fundamental_override seam (issue x1b Task 10). Operates on an existing
// seeded program: overrides are reversible (cleared per test + in afterAll), so
// no throwaway program is needed — and the production seed fills every
// (Year, Track) slot, so one couldn't be created anyway. cacheStrategy() is a
// no-op without Accelerate, so read-after-write is deterministic here.
describe("fundamental override seam (integration)", () => {
  let programId: number;
  let coreCode: string;

  beforeAll(async () => {
    const program = await prisma.program.findFirst({
      orderBy: { ProgramID: "asc" },
    });
    const fundamental = await prisma.grade_fundamental.findFirst({
      where: { Year: program!.Year },
      orderBy: { SortOrder: "asc" },
    });
    programId = program!.ProgramID;
    coreCode = fundamental!.SubjectCode;
  });

  afterAll(async () => {
    // Leave the shared program exactly as found.
    await programRepository
      .clearFundamentalOverride(programId, coreCode)
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
