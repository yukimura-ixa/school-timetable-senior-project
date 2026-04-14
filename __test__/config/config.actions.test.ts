import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/features/config/infrastructure/repositories/config.repository", () => ({
  findByTerm: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { getConfigByTermAction } from "@/features/config/application/actions/config.actions";
import * as configRepository from "@/features/config/infrastructure/repositories/config.repository";

const mockedAuth = vi.mocked(auth);
const mockedFindByTerm = vi.mocked(configRepository.findByTerm);

describe("getConfigByTermAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.api.getSession.mockResolvedValue({
      user: { id: "admin-1", role: "admin" },
    } as never);
  });

  it("returns success with null data when no config exists for the term", async () => {
    mockedFindByTerm.mockResolvedValue(null);

    const result = await getConfigByTermAction({
      AcademicYear: 2567,
      Semester: "SEMESTER_1",
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });
});
