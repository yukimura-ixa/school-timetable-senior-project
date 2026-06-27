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

// not used by this action (syncGradeMatrixAction uses withPrismaTransaction directly)
vi.mock(
  "@/features/assign/infrastructure/repositories/assign.repository",
  () => ({
    assignRepository: {
      create: vi.fn(),
      deleteById: vi.fn(),
      findByTermGrades: vi.fn(),
    },
  }),
);

// Program subjects per grade — used for server-side defense-in-depth validation.
vi.mock("@/features/subject/infrastructure/repositories/subject.repository", () => ({
  subjectRepository: { findByGrade: vi.fn() },
}));

const txCreate = vi.fn();
const txDelete = vi.fn();
vi.mock("@/lib/prisma-transaction", () => ({
  withPrismaTransaction: (fn: any) =>
    fn({
      teachers_responsibility: {
        create: (...a: any[]) => txCreate(...a),
        delete: (...a: any[]) => txDelete(...a),
      },
    }),
}));

import { syncGradeMatrixAction } from "./teaching-assignment.actions";
import { subjectRepository } from "@/features/subject/infrastructure/repositories/subject.repository";

describe("syncGradeMatrixAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: every queried grade's program contains the codes used by the happy path.
    (subjectRepository.findByGrade as any).mockResolvedValue([
      { SubjectCode: "ค21101" },
      { SubjectCode: "ว21101" },
    ]);
  });

  it("creates new cells and deletes removed ones, preserving untouched RespIDs", async () => {
    const res = await syncGradeMatrixAction({
      academicYear: 2568,
      semester: "SEMESTER_1",
      existing: [
        { RespID: 5, TeacherID: 4, GradeID: "M1-1", SubjectCode: "ค21101", Credit: "1.0" },
        { RespID: 6, TeacherID: 4, GradeID: "M1-2", SubjectCode: "ค21101", Credit: "1.0" },
      ],
      desired: [
        { RespID: 5, TeacherID: 4, GradeID: "M1-1", SubjectCode: "ค21101", Credit: "1.0" },
        { TeacherID: 7, GradeID: "M1-3", SubjectCode: "ว21101", Credit: "1.5" },
      ],
    });

    expect(res.data).toEqual({ created: 1, deleted: 1 });
    expect(txDelete).toHaveBeenCalledWith({ where: { RespID: 6 } });
    expect(txCreate).toHaveBeenCalledTimes(1);
    expect(txCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ TeacherID: 7, GradeID: "M1-3", SubjectCode: "ว21101" }),
    });
  });

  it("rejects a created cell whose subject is not in the grade's program and writes nothing", async () => {
    (subjectRepository.findByGrade as any).mockResolvedValue([
      { SubjectCode: "ค21101" }, // M1-1's program does NOT contain ว99999
    ]);
    const res = await syncGradeMatrixAction({
      academicYear: 2568,
      semester: "SEMESTER_1",
      existing: [],
      desired: [
        { TeacherID: 9, GradeID: "M1-1", SubjectCode: "ว99999", Credit: "1.0" },
      ],
    });
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe("VALIDATION_ERROR");
    expect(txCreate).not.toHaveBeenCalled();
    expect(txDelete).not.toHaveBeenCalled();
  });
});
