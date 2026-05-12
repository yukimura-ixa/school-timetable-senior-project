import { describe, it, expect } from "vitest";
import { resolveTeacherIdFromParams } from "./teacher-id-param";

describe("resolveTeacherIdFromParams", () => {
  it("returns null when param missing", () => {
    expect(resolveTeacherIdFromParams(new URLSearchParams(""))).toBeNull();
  });

  it("returns null when searchParams is null", () => {
    expect(resolveTeacherIdFromParams(null)).toBeNull();
  });

  it("parses integer teacherId", () => {
    expect(
      resolveTeacherIdFromParams(new URLSearchParams("teacherId=7")),
    ).toBe(7);
  });

  it("returns null for non-numeric value", () => {
    expect(
      resolveTeacherIdFromParams(new URLSearchParams("teacherId=abc")),
    ).toBeNull();
  });

  it("returns null for zero or negative", () => {
    expect(
      resolveTeacherIdFromParams(new URLSearchParams("teacherId=0")),
    ).toBeNull();
    expect(
      resolveTeacherIdFromParams(new URLSearchParams("teacherId=-5")),
    ).toBeNull();
  });

  it("returns null for empty value", () => {
    expect(
      resolveTeacherIdFromParams(new URLSearchParams("teacherId=")),
    ).toBeNull();
  });
});
