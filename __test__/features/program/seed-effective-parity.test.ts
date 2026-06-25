import { describe, it, expect } from "vitest";
import { programRepository } from "@/features/program/infrastructure/repositories/program.repository";
import { FUNDAMENTALS } from "@/prisma/data/fundamentals";
import prisma from "@/lib/prisma";

// Authoritative credit source — same map as seed.ts:665-666. The fresh-seed path
// creates NO overrides, so effective CORE credits come straight from FUNDAMENTALS.
// This test pins them to subject.Credit so a FUNDAMENTALS heuristic drift fails here.
const creditToNum = (c: string): number =>
  (({ CREDIT_05: 0.5, CREDIT_10: 1.0, CREDIT_15: 1.5, CREDIT_20: 2.0 } as Record<string, number>)[c] ?? 1.0);

describe("seed effective-subject parity", () => {
  it("every program's effective CORE equals its year's template (codes)", async () => {
    const programs = await prisma.program.findMany();
    for (const p of programs) {
      const eff = await programRepository.getEffectiveSubjects(p.ProgramID);
      const inheritedCore = eff
        .filter((e) => e.source === "INHERITED")
        .map((e) => e.SubjectCode)
        .sort();
      const expected = FUNDAMENTALS.filter((f) => f.Year === p.Year)
        .map((f) => f.SubjectCode)
        .sort();
      expect(inheritedCore).toEqual(expected);
    }
  });

  it("inherited CORE credits match subject.Credit (behavior-preserving guarantee)", async () => {
    const programs = await prisma.program.findMany();
    for (const p of programs) {
      const eff = await programRepository.getEffectiveSubjects(p.ProgramID);
      for (const row of eff.filter((e) => e.source === "INHERITED")) {
        // subject is joined onto the effective row; Credit is the catalog enum.
        expect(row.MinCredits, `${p.ProgramCode} ${row.SubjectCode}`).toBe(
          creditToNum(row.subject.Credit),
        );
        expect(row.MaxCredits).toBeNull();
      }
    }
  });
});
