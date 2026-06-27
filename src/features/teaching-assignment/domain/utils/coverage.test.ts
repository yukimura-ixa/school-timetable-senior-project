import { describe, it, expect } from "vitest";
import { computeCoverage } from "./coverage";

describe("computeCoverage", () => {
  it("counts only required slots that are assigned", () => {
    const result = computeCoverage([
      { requiredCodes: ["ค21101", "ท21101"], assignedCodes: ["ค21101"] },
      { requiredCodes: ["ค21101"], assignedCodes: ["ค21101"] },
    ]);
    expect(result).toEqual({ filled: 2, required: 3 });
  });

  it("ignores assignments outside the section's required list", () => {
    const result = computeCoverage([
      { requiredCodes: ["ค21101"], assignedCodes: ["ค21101", "ว30294"] },
    ]);
    expect(result).toEqual({ filled: 1, required: 1 });
  });
});
