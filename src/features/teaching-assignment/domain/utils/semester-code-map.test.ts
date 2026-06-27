import { describe, it, expect } from "vitest";
import { mapSemesterCode } from "./semester-code-map";

describe("mapSemesterCode", () => {
  it("flips the trailing semester digit 1 -> 2 for MOE codes", () => {
    expect(mapSemesterCode("ค21101")).toBe("ค21102");
    expect(mapSemesterCode("ท31101")).toBe("ท31102");
  });

  it("returns null for codes that do not end in 1", () => {
    expect(mapSemesterCode("ว30294")).toBeNull();
    expect(mapSemesterCode("ค21102")).toBeNull();
  });

  it("returns null for non-MOE codes (ปวช, activities)", () => {
    expect(mapSemesterCode("219101-2001")).toBeNull();
    expect(mapSemesterCode("ACT-GUIDE")).toBeNull();
    expect(mapSemesterCode("20001-1005")).toBeNull();
  });
});
