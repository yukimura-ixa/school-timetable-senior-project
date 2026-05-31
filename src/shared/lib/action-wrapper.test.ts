import { describe, it, expect, vi } from "vitest";
import * as v from "valibot";

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

import { createAction, ActionErrorCode } from "./action-wrapper";

describe("createAction error mapping", () => {
  it("maps a Prisma P2002 unique-constraint error to CONFLICT", async () => {
    const action = createAction(v.unknown(), async () => {
      throw Object.assign(
        new Error(
          "Unique constraint failed on the fields: (`TimeslotID`, `GradeID`)",
        ),
        { code: "P2002" },
      );
    });

    const result = await action({});

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(ActionErrorCode.CONFLICT);
    expect(result.error?.message).toMatch(/ซ้ำ/);
  });

  it("still sanitizes a generic internal error to INTERNAL_ERROR", async () => {
    const action = createAction(v.unknown(), async () => {
      throw new Error("some unexpected internal failure");
    });

    const result = await action({});

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe(ActionErrorCode.INTERNAL_ERROR);
  });
});
