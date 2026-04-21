import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: vi.fn(() => ({})) }));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
  cookies: vi.fn(() => Promise.resolve({ get: vi.fn(), set: vi.fn() })),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() =>
        Promise.resolve({
          user: { id: "u1", email: "a@x", role: "admin" },
        }),
      ),
    },
  },
}));

vi.mock(
  "@/features/schedule-arrangement/domain/services/conflict-detector.service",
  () => ({
    checkAllConflicts: vi.fn(() => ({
      hasConflict: false,
      conflictType: "NONE",
      message: "",
    })),
  }),
);

vi.mock(
  "@/features/schedule-arrangement/domain/services/conflict-resolver.service",
  () => ({
    suggestResolutions: vi.fn(() => []),
  }),
);

vi.mock("@/features/room/infrastructure/repositories/room.repository", () => ({
  roomRepository: { findAll: vi.fn(() => Promise.resolve([])) },
}));

vi.mock("@/features/timeslot/infrastructure/repositories/timeslot.repository", () => ({
  timeslotRepository: { findByTerm: vi.fn(() => Promise.resolve([])) },
}));

vi.mock("@/features/conflict/infrastructure/repositories/conflict.repository", () => ({
  conflictRepository: {
    findSchedulesForSemester: vi.fn(() => Promise.resolve([])),
    findResponsibilitiesForTerm: vi.fn(() => Promise.resolve([])),
  },
}));

import { suggestResolutionAction } from "./conflict-resolution.actions";
import { checkAllConflicts } from "@/features/schedule-arrangement/domain/services/conflict-detector.service";
import { suggestResolutions } from "@/features/schedule-arrangement/domain/services/conflict-resolver.service";
import { auth } from "@/lib/auth";

const mockCheck = checkAllConflicts as ReturnType<typeof vi.fn>;
const mockSuggest = suggestResolutions as ReturnType<typeof vi.fn>;
const mockGetSession = auth.api.getSession as unknown as ReturnType<typeof vi.fn>;

const validInput = {
  AcademicYear: 2567,
  Semester: "SEMESTER_1" as const,
  attempt: {
    timeslotId: "1-2567-MON-1",
    subjectCode: "MATH101",
    gradeId: "M1-1",
    teacherId: 1,
    roomId: 10,
    academicYear: 2567,
    semester: "SEMESTER_1" as const,
  },
};

describe("suggestResolutionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      user: { id: "u1", email: "a@x", role: "admin" },
    });
  });

  it("rejects non-admin sessions", async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: "u2", email: "s@x", role: "student" },
    });

    const result = await suggestResolutionAction(validInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.code).toBe("FORBIDDEN");
    }
  });

  it("rejects malformed input (empty timeslotId)", async () => {
    const bad = {
      ...validInput,
      attempt: { ...validInput.attempt, timeslotId: "" },
    };
    const result = await suggestResolutionAction(bad);
    expect(result.success).toBe(false);
  });

  it("returns empty data when checkAllConflicts reports no conflict", async () => {
    mockCheck.mockReturnValueOnce({
      hasConflict: false,
      conflictType: "NONE",
      message: "",
    });
    const result = await suggestResolutionAction(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
    expect(mockSuggest).not.toHaveBeenCalled();
  });

  it("delegates to suggestResolutions when a conflict is detected", async () => {
    mockCheck.mockReturnValueOnce({
      hasConflict: true,
      conflictType: "TEACHER_CONFLICT",
      message: "Teacher busy",
    });
    mockSuggest.mockReturnValueOnce([
      {
        kind: "MOVE",
        targetTimeslotId: "1-2567-MON-2",
        rationale: "",
        confidence: 0.8,
      },
    ]);
    const result = await suggestResolutionAction(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
    }
    expect(mockSuggest).toHaveBeenCalledTimes(1);
  });
});
