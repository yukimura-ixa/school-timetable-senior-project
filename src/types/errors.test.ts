import { describe, it, expect } from "vitest";
import { isPrismaUniqueConstraintError } from "./errors";

describe("isPrismaUniqueConstraintError", () => {
  it("returns true for a Prisma P2002 unique-constraint error", () => {
    const err = Object.assign(
      new Error(
        "Unique constraint failed on the fields: (`TimeslotID`, `GradeID`)",
      ),
      { code: "P2002" },
    );
    expect(isPrismaUniqueConstraintError(err)).toBe(true);
  });

  it("returns false for other Prisma error codes", () => {
    const err = Object.assign(new Error("Record not found"), { code: "P2025" });
    expect(isPrismaUniqueConstraintError(err)).toBe(false);
  });

  it("returns false for a plain Error without a code", () => {
    expect(isPrismaUniqueConstraintError(new Error("boom"))).toBe(false);
  });

  it("returns false for null and non-objects", () => {
    expect(isPrismaUniqueConstraintError(null)).toBe(false);
    expect(isPrismaUniqueConstraintError("P2002")).toBe(false);
  });
});
