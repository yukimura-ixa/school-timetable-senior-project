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

vi.mock("@/lib/cache-invalidation", () => ({
  invalidatePublicCache: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    $transaction: vi.fn(
      async (cb: (tx: unknown) => Promise<unknown>) =>
        cb({
          class_schedule: {
            update: vi.fn(() => Promise.resolve({ ClassID: 42 })),
            create: vi.fn(() => Promise.resolve({ ClassID: 999 })),
          },
        }),
    ),
  },
}));

import {
  suggestResolutionAction,
  applySwapAction,
} from "./conflict-resolution.actions";
import { checkAllConflicts } from "@/features/schedule-arrangement/domain/services/conflict-detector.service";
import { suggestResolutions } from "@/features/schedule-arrangement/domain/services/conflict-resolver.service";
import { conflictRepository } from "@/features/conflict/infrastructure/repositories/conflict.repository";
import { timeslotRepository } from "@/features/timeslot/infrastructure/repositories/timeslot.repository";
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

describe("applySwapAction", () => {
  /* eslint-disable @typescript-eslint/unbound-method */
  const mockFindSchedules =
    conflictRepository.findSchedulesForSemester as ReturnType<typeof vi.fn>;
  const mockFindResps =
    conflictRepository.findResponsibilitiesForTerm as ReturnType<typeof vi.fn>;
  const mockFindByTerm = timeslotRepository.findByTerm as ReturnType<
    typeof vi.fn
  >;
  /* eslint-enable @typescript-eslint/unbound-method */

  const swapInput = {
    AcademicYear: 2567,
    Semester: "SEMESTER_1" as const,
    counterpart: { classId: 42, targetTimeslotId: "1-2567-MON-2" },
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

  const blocker = {
    classId: 42,
    timeslotId: "1-2567-MON-1",
    subjectCode: "ENG101",
    subjectName: "English",
    roomId: 99,
    roomName: "R-99",
    gradeId: "M1-2",
    isLocked: false,
    teacherId: 1,
    teacherName: "T-1",
  };

  const attemptResp = {
    respId: 1,
    teacherId: 1,
    gradeId: "M1-1",
    subjectCode: "MATH101",
    academicYear: 2567,
    semester: "SEMESTER_1",
    teachHour: 2,
  };
  const blockerResp = {
    respId: 2,
    teacherId: 1,
    gradeId: "M1-2",
    subjectCode: "ENG101",
    academicYear: 2567,
    semester: "SEMESTER_1",
    teachHour: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      user: { id: "u1", email: "a@x", role: "admin" },
    });
    mockFindSchedules.mockResolvedValue([blocker]);
    mockFindResps.mockResolvedValue([attemptResp, blockerResp]);
    mockFindByTerm.mockResolvedValue([
      { TimeslotID: "1-2567-MON-1" },
      { TimeslotID: "1-2567-MON-2" },
    ]);
  });

  it("rejects when a provided timeslot does not belong to the term", async () => {
    mockFindByTerm.mockResolvedValueOnce([
      { TimeslotID: "1-2567-MON-1" },
      // MON-2 missing from term
    ]);
    const result = await applySwapAction(swapInput);
    expect(result.success).toBe(false);
  });

  it("rejects when counterpart schedule not found", async () => {
    mockFindSchedules.mockResolvedValueOnce([]);
    const result = await applySwapAction(swapInput);
    expect(result.success).toBe(false);
  });

  it("rejects when counterpart is locked", async () => {
    mockFindSchedules.mockResolvedValueOnce([{ ...blocker, isLocked: true }]);
    const result = await applySwapAction(swapInput);
    expect(result.success).toBe(false);
  });

  it("returns applied=false when simulated counterpart move still conflicts", async () => {
    // First call validates counterpart at new slot → make it conflict.
    mockCheck.mockReturnValueOnce({
      hasConflict: true,
      conflictType: "TEACHER_CONFLICT",
      message: "Counterpart conflict",
    });
    const result = await applySwapAction(swapInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        applied: false,
        failedOn: "counterpart",
      });
    }
  });

  it("returns applied=false when attempt at freed slot still conflicts", async () => {
    mockCheck
      .mockReturnValueOnce({
        hasConflict: false,
        conflictType: "NONE",
        message: "",
      })
      .mockReturnValueOnce({
        hasConflict: true,
        conflictType: "CLASS_CONFLICT",
        message: "Attempt conflict",
      });
    const result = await applySwapAction(swapInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        applied: false,
        failedOn: "attempt",
      });
    }
  });

  it("commits both writes in a transaction when checks pass", async () => {
    mockCheck
      .mockReturnValueOnce({
        hasConflict: false,
        conflictType: "NONE",
        message: "",
      })
      .mockReturnValueOnce({
        hasConflict: false,
        conflictType: "NONE",
        message: "",
      });
    const result = await applySwapAction(swapInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        applied: true,
        counterpartClassId: 42,
        attemptClassId: 999,
      });
    }
  });
});
