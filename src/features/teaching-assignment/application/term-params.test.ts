import { describe, it, expect } from "vitest";
import { resolveTermFromParams } from "./term-params";

describe("resolveTermFromParams", () => {
  it("returns all-null when searchParams is null", () => {
    expect(resolveTermFromParams(null)).toEqual({
      academicYear: null,
      semester: null,
      gradeId: null,
    });
  });

  it("returns all-null when params are empty", () => {
    expect(resolveTermFromParams(new URLSearchParams(""))).toEqual({
      academicYear: null,
      semester: null,
      gradeId: null,
    });
  });

  it("parses year into an integer", () => {
    expect(resolveTermFromParams(new URLSearchParams("year=2567")).academicYear).toBe(
      2567,
    );
  });

  it("rejects non-positive or non-integer year", () => {
    expect(resolveTermFromParams(new URLSearchParams("year=0")).academicYear).toBeNull();
    expect(
      resolveTermFromParams(new URLSearchParams("year=-5")).academicYear,
    ).toBeNull();
    expect(
      resolveTermFromParams(new URLSearchParams("year=20.5")).academicYear,
    ).toBeNull();
    expect(
      resolveTermFromParams(new URLSearchParams("year=abc")).academicYear,
    ).toBeNull();
  });

  it("maps numeric semester to the prisma enum", () => {
    expect(resolveTermFromParams(new URLSearchParams("semester=1")).semester).toBe(
      "SEMESTER_1",
    );
    expect(resolveTermFromParams(new URLSearchParams("semester=2")).semester).toBe(
      "SEMESTER_2",
    );
  });

  it("returns null for unknown semester values", () => {
    expect(
      resolveTermFromParams(new URLSearchParams("semester=3")).semester,
    ).toBeNull();
    expect(
      resolveTermFromParams(new URLSearchParams("semester=SEMESTER_1")).semester,
    ).toBeNull();
  });

  it("passes through a non-empty gradeId, trimming whitespace", () => {
    expect(resolveTermFromParams(new URLSearchParams("gradeId=101")).gradeId).toBe(
      "101",
    );
    expect(
      resolveTermFromParams(new URLSearchParams("gradeId=%20%20")).gradeId,
    ).toBeNull();
  });

  it("accepts a ReadonlyURLSearchParams-like get() interface", () => {
    const fake = {
      get: (k: string) =>
        ({ year: "2568", semester: "2", gradeId: "203" })[k] ?? null,
    };
    expect(resolveTermFromParams(fake)).toEqual({
      academicYear: 2568,
      semester: "SEMESTER_2",
      gradeId: "203",
    });
  });
});
