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

vi.mock("@/features/subject/infrastructure/repositories/subject.repository", () => ({
  subjectRepository: { findByGrade: vi.fn() },
}));
vi.mock("@/features/gradelevel/infrastructure/repositories/gradelevel.repository", () => ({
  gradeLevelRepository: { findAll: vi.fn() },
}));
vi.mock("@/features/assign/infrastructure/repositories/assign.repository", () => ({
  assignRepository: { findByTermGrades: vi.fn(), create: vi.fn(), deleteById: vi.fn() },
}));

import { previewCarryOverAction } from "./teaching-assignment.actions";
import { gradeLevelRepository } from "@/features/gradelevel/infrastructure/repositories/gradelevel.repository";
import { subjectRepository } from "@/features/subject/infrastructure/repositories/subject.repository";
import { assignRepository } from "@/features/assign/infrastructure/repositories/assign.repository";

describe("previewCarryOverAction", () => {
  beforeEach(() => vi.clearAllMocks());
  it("maps prev-term S1 assignments into S2 suggestions", async () => {
    (gradeLevelRepository.findAll as any).mockResolvedValue([{ GradeID: "M1-1", Year: 1, Number: 1, ProgramID: 10 }]);
    (subjectRepository.findByGrade as any).mockResolvedValue([{ SubjectCode: "ค21102" }]);
    (assignRepository.findByTermGrades as any).mockResolvedValue([
      { GradeID: "M1-1", SubjectCode: "ค21101", TeacherID: 4, subject: { Credit: "CREDIT_10" } },
    ]);
    const res = await previewCarryOverAction({ gradeYear: 1, academicYear: 2568, semester: "SEMESTER_2" });
    expect(res.data!.mapped).toEqual([{ GradeID: "M1-1", SubjectCode: "ค21102", TeacherID: 4 }]);
    expect(res.data!.exceptions).toHaveLength(0);
  });
});
