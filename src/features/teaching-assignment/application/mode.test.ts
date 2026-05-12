import { describe, it, expect } from "vitest";
import { resolveAssignmentMode } from "./mode";

describe("resolveAssignmentMode", () => {
  it("defaults to by-grade when no mode param", () => {
    expect(resolveAssignmentMode(new URLSearchParams(""))).toBe("by-grade");
  });

  it("returns by-teacher when ?mode=by-teacher", () => {
    expect(resolveAssignmentMode(new URLSearchParams("mode=by-teacher"))).toBe(
      "by-teacher",
    );
  });

  it("returns by-grade when ?mode=by-grade explicit", () => {
    expect(resolveAssignmentMode(new URLSearchParams("mode=by-grade"))).toBe(
      "by-grade",
    );
  });

  it("defaults to by-grade for unknown mode value", () => {
    expect(resolveAssignmentMode(new URLSearchParams("mode=wat"))).toBe(
      "by-grade",
    );
  });

  it("defaults to by-grade when searchParams is null", () => {
    expect(resolveAssignmentMode(null)).toBe("by-grade");
  });

  it("accepts ReadonlyURLSearchParams-like get() interface", () => {
    const fake = { get: (k: string) => (k === "mode" ? "by-teacher" : null) };
    expect(resolveAssignmentMode(fake)).toBe("by-teacher");
  });
});
