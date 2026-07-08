import { describe, it, expect } from "vitest";
import { FUNDAMENTALS } from "@/prisma/data/fundamentals";

describe("FUNDAMENTALS template data", () => {
  it("covers years 1..6", () => {
    const years = new Set(FUNDAMENTALS.map((f) => f.Year));
    expect([...years].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("has a unique (Year, SubjectCode) key", () => {
    const keys = FUNDAMENTALS.map((f) => `${f.Year}:${f.SubjectCode}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("matches the M1 CORE set from seed.ts (10 subjects, Thai codes)", () => {
    const m1 = FUNDAMENTALS.filter((f) => f.Year === 1).map((f) => f.SubjectCode);
    expect(m1.sort()).toEqual(
      ["ท21101", "ค21101", "ว21101", "ส21101", "ส21102", "ส21103", "พ21101", "ศ21101", "ง21101", "อ21101"].sort(),
    );
  });

  it("matches the M4 CORE set from seed.ts (8 subjects)", () => {
    const m4 = FUNDAMENTALS.filter((f) => f.Year === 4).map((f) => f.SubjectCode);
    expect(m4.sort()).toEqual(
      ["ท31101", "ค31101", "ว31101", "ส31101", "พ31101", "ศ31101", "ง31101", "อ31101"].sort(),
    );
  });

  it("uses 1.5 credits for junior Thai/Math/Science, 0.5 for history/civics and senior arts/career, 1.0 otherwise", () => {
    const find = (y: number, c: string) =>
      FUNDAMENTALS.find((f) => f.Year === y && f.SubjectCode === c);
    expect(find(1, "ท21101")!.MinCredits).toBe(1.5);
    expect(find(1, "ส21101")!.MinCredits).toBe(1.0);
    expect(find(1, "ส21102")!.MinCredits).toBe(0.5);
    expect(find(1, "ส21103")!.MinCredits).toBe(0.5);
    expect(find(4, "ท31101")!.MinCredits).toBe(1.0);
    expect(find(4, "ศ31101")!.MinCredits).toBe(0.5);
    expect(find(4, "ง31101")!.MinCredits).toBe(0.5);
  });

  it("sets MaxCredits null and 1-based SortOrder per year", () => {
    const m4 = FUNDAMENTALS.filter((f) => f.Year === 4);
    expect(m4.every((f) => f.MaxCredits === null)).toBe(true);
    expect(m4.map((f) => f.SortOrder)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
