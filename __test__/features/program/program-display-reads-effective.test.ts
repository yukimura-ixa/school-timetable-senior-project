import { describe, it, expect, beforeAll } from "vitest";
import { programRepository } from "@/features/program/infrastructure/repositories/program.repository";
import prisma from "@/lib/prisma";

// Seam-completeness (issue by3): the display reads (findByFilters -> year list,
// findByGrade -> all-program/export) must surface inherited CORE now that the
// seed no longer duplicates CORE into program_subject. Assumes the seeded test DB.
const M4_CORE = ["ท31101", "ค31101", "ว31101", "ส31101", "พ31101", "อ31101"];

describe("program display reads surface inherited CORE (seam-completeness)", () => {
  let m4SciId: number;
  let m4Year: number;
  let gradeId: string;

  beforeAll(async () => {
    const p = await prisma.program.findUnique({
      where: { ProgramCode: "M4-SCI" },
      include: { gradelevel: { orderBy: { Number: "asc" } } },
    });
    m4SciId = p!.ProgramID;
    m4Year = p!.Year;
    gradeId = p!.gradelevel[0]!.GradeID;
  });

  it("findByFilters includes inherited CORE in program_subject", async () => {
    const programs = await programRepository.findByFilters({
      Year: m4Year,
      IsActive: true,
    });
    const sci = programs.find((pr) => pr.ProgramID === m4SciId);
    expect(sci).toBeDefined();
    const codes = sci!.program_subject.map((ps) => ps.SubjectCode);
    expect(codes).toEqual(expect.arrayContaining(M4_CORE));
    const coreRows = sci!.program_subject.filter((ps) =>
      M4_CORE.includes(ps.SubjectCode),
    );
    expect(coreRows.length).toBe(M4_CORE.length);
    expect(coreRows.every((ps) => ps.Category === "CORE")).toBe(true);
  });

  it("findByGrade includes inherited CORE in its subjects array", async () => {
    const program = await programRepository.findByGrade(gradeId);
    expect(program).not.toBeNull();
    const codes = program!.subjects.map((s) => s.SubjectCode);
    expect(codes).toEqual(expect.arrayContaining(M4_CORE));
  });

  it("findByGrade attaches teachers_responsibility to every row, including inherited CORE", async () => {
    const program = await programRepository.findByGrade(
      gradeId,
      "SEMESTER_1",
      m4Year,
    );
    expect(program).not.toBeNull();
    expect(
      program!.subjects.every((s) => Array.isArray(s.teachers_responsibility)),
    ).toBe(true);
    const core = program!.subjects.find((s) => M4_CORE.includes(s.SubjectCode));
    expect(core).toBeDefined();
    expect(Array.isArray(core!.teachers_responsibility)).toBe(true);
  });
});
