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

import { auth } from "@/lib/auth";
import { requireAdminAccess } from "@/lib/auth-guard";

const mockedAuth = vi.mocked(auth);

describe("requireAdminAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns Unauthorized when there is no session", async () => {
    mockedAuth.api.getSession.mockResolvedValue(null as never);
    expect(await requireAdminAccess()).toEqual({
      success: false,
      error: "Unauthorized",
    });
  });

  it("returns Forbidden when authenticated but not admin", async () => {
    mockedAuth.api.getSession.mockResolvedValue({
      user: { id: "u1", role: "teacher" },
    } as never);
    expect(await requireAdminAccess()).toEqual({
      success: false,
      error: "Forbidden",
    });
  });

  it("returns Forbidden when the session user has no role", async () => {
    mockedAuth.api.getSession.mockResolvedValue({
      user: { id: "u1" },
    } as never);
    expect(await requireAdminAccess()).toEqual({
      success: false,
      error: "Forbidden",
    });
  });

  it("returns null (access granted) for an admin session", async () => {
    mockedAuth.api.getSession.mockResolvedValue({
      user: { id: "admin-1", role: "admin" },
    } as never);
    expect(await requireAdminAccess()).toBeNull();
  });
});
