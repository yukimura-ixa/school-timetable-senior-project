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

describe("syncGradeMatrixAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
