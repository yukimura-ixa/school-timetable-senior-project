import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
  cookies: vi.fn(() => Promise.resolve({ get: vi.fn(), set: vi.fn() })),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() =>
        Promise.resolve({
          user: { id: "test-user", email: "admin@test.com", role: "admin" },
        }),
      ),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/cache-invalidation", () => ({
  invalidatePublicCache: vi.fn(),
}));

vi.mock(
  "@/features/gradelevel/infrastructure/repositories/gradelevel.repository",
  () => ({
    gradeLevelRepository: { findAll: vi.fn() },
  }),
);
vi.mock(
  "@/features/subject/infrastructure/repositories/subject.repository",
  () => ({
    subjectRepository: { findByGrade: vi.fn() },
  }),
);
vi.mock(
  "@/features/assign/infrastructure/repositories/assign.repository",
  () => ({
    assignRepository: {
      findByTeacherAndTerm: vi.fn(),
      create: vi.fn(),
      deleteById: vi.fn(),
      findByTermGrades: vi.fn().mockResolvedValue([]),
    },
  }),
);

import { getGradeMatrixAction } from "./teaching-assignment.actions";
import { gradeLevelRepository } from "@/features/gradelevel/infrastructure/repositories/gradelevel.repository";
import { subjectRepository } from "@/features/subject/infrastructure/repositories/subject.repository";

describe("getGradeMatrixAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns sections (filtered to the grade year) with their subject codes and the deduped union", async () => {
    (gradeLevelRepository.findAll as ReturnType<typeof vi.fn>).mockResolvedValue(
      [
        { GradeID: "M1-1", Year: 1, Number: 1, ProgramID: 10 },
        { GradeID: "M1-2", Year: 1, Number: 2, ProgramID: 10 },
        { GradeID: "M2-1", Year: 2, Number: 1, ProgramID: 20 },
      ],
    );
    (
      subjectRepository.findByGrade as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      {
        SubjectCode: "ค21101",
        SubjectName: "คณิต",
        Credit: "CREDIT_10",
        LearningArea: "MATH",
      },
    ]);

    const res = await getGradeMatrixAction({
      gradeYear: 1,
      academicYear: 2568,
      semester: "SEMESTER_1",
    });
    expect(res.success).toBe(true);
    expect(res.data!.sections.map((s) => s.GradeID)).toEqual(["M1-1", "M1-2"]);
    expect(res.data!.subjects).toEqual([
      {
        SubjectCode: "ค21101",
        SubjectName: "คณิต",
        Credit: "CREDIT_10",
        LearningArea: "MATH",
      },
    ]);
  });
});
