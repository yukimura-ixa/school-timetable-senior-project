import { describe, it, expect, beforeAll } from "vitest";
import { programRepository } from "@/features/program/infrastructure/repositories/program.repository";
import prisma from "@/lib/prisma";

// Assumes the test DB is seeded (pnpm test runs against the seeded test DB in CI).
describe("programRepository.getEffectiveSubjects (integration)", () => {
  let m4SciId: number;
  beforeAll(async () => {
    const p = await prisma.program.findUnique({ where: { ProgramCode: "M4-SCI" } });
    m4SciId = p!.ProgramID;
  });

  it("returns inherited CORE + owned non-CORE for a seeded program", async () => {
    const eff = await programRepository.getEffectiveSubjects(m4SciId);
    const inherited = eff.filter((e) => e.source === "INHERITED");
    const owned = eff.filter((e) => e.source === "OWNED");
    expect(inherited.every((e) => e.Category === "CORE")).toBe(true);
    expect(inherited.map((e) => e.SubjectCode)).toEqual(
      expect.arrayContaining(["ท31101", "ค31101", "ว31101", "ส31101", "พ31101", "อ31101"]),
    );
    expect(owned.some((e) => e.Category === "ACTIVITY")).toBe(true);
  });

  it("validation adapter keeps inherited CORE values and drops the source tag", async () => {
    const rows = await programRepository.getEffectiveSubjectsForValidation(m4SciId);
    const core = rows.find((r) => r.SubjectCode === "ท31101");
    expect(core).toBeDefined();
    // Inherited CORE is always mandatory and carries its real subject relation.
    expect(core!.IsMandatory).toBe(true);
    expect(core!.subject.SubjectName).toBeTruthy();
    // The validation shape strips the EffectiveSubject `source` discriminator.
    expect(core).not.toHaveProperty("source");
  });
});
