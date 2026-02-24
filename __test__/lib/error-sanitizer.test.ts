import { describe, it, expect, vi, afterEach } from "vitest";
import { sanitizeErrorMessage } from "@/shared/lib/error-sanitizer";

describe("sanitizeErrorMessage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns generic Thai message for non-Error values", () => {
    expect(sanitizeErrorMessage("string error")).toBe(
      "เกิดข้อผิดพลาดที่ไม่คาดคิด",
    );
    expect(sanitizeErrorMessage(null)).toBe("เกิดข้อผิดพลาดที่ไม่คาดคิด");
    expect(sanitizeErrorMessage(42)).toBe("เกิดข้อผิดพลาดที่ไม่คาดคิด");
  });

  it("forwards business logic errors containing safe patterns", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(sanitizeErrorMessage(new Error("Teacher not found"))).toBe(
      "Teacher not found",
    );
    expect(sanitizeErrorMessage(new Error("Schedule conflict detected"))).toBe(
      "Schedule conflict detected",
    );
    expect(sanitizeErrorMessage(new Error("Record already exists"))).toBe(
      "Record already exists",
    );
    expect(sanitizeErrorMessage(new Error("Access forbidden"))).toBe(
      "Access forbidden",
    );
    expect(sanitizeErrorMessage(new Error("Timeslot is locked"))).toBe(
      "Timeslot is locked",
    );
    expect(sanitizeErrorMessage(new Error("Validation failed"))).toBe(
      "Validation failed",
    );
    expect(sanitizeErrorMessage(new Error("Invalid input: missing name"))).toBe(
      "Invalid input: missing name",
    );
  });

  it("forwards Thai business logic errors", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(sanitizeErrorMessage(new Error("ไม่พบข้อมูล"))).toBe("ไม่พบข้อมูล");
    expect(sanitizeErrorMessage(new Error("ข้อมูลซ้ำ"))).toBe("ข้อมูลซ้ำ");
  });

  it("sanitizes Prisma-like errors in non-development mode", () => {
    // Test environment is "test" which should behave like production
    // (sanitize errors unless NODE_ENV === "development")
    expect(
      sanitizeErrorMessage(
        new Error(
          "Invalid `prisma.class_schedule.findMany()` invocation: Unknown column `Foo`",
        ),
      ),
    ).toBe("เกิดข้อผิดพลาดภายในระบบ");

    expect(
      sanitizeErrorMessage(
        new Error("connect ECONNREFUSED 127.0.0.1:5432"),
      ),
    ).toBe("เกิดข้อผิดพลาดภายในระบบ");
  });

  it("forwards all errors in development mode", () => {
    vi.stubEnv("NODE_ENV", "development");

    const prismaError =
      "Invalid `prisma.teacher.create()` invocation: Unique constraint failed";
    expect(sanitizeErrorMessage(new Error(prismaError))).toBe(prismaError);
  });
});
