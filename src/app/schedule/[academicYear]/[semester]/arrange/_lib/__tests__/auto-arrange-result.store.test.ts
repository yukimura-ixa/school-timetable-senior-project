import { describe, it, expect, beforeEach } from "vitest";
import { useAutoArrangeResult } from "../auto-arrange-result.store";

describe("auto-arrange-result store", () => {
  beforeEach(() => {
    useAutoArrangeResult.getState().clear();
  });

  it("starts empty", () => {
    expect(useAutoArrangeResult.getState().failures).toEqual([]);
  });

  it("stores failures and stats", () => {
    useAutoArrangeResult.getState().setResult({
      failures: [{ subjectCode: "ค21101", reason: "ไม่มีคาบว่าง" }],
      stats: { successfullyPlaced: 5, failed: 1 },
    });
    expect(useAutoArrangeResult.getState().failures).toHaveLength(1);
    expect(useAutoArrangeResult.getState().stats?.failed).toBe(1);
  });

  it("clear resets to empty", () => {
    useAutoArrangeResult.getState().setResult({
      failures: [{ subjectCode: "x", reason: "y" }],
      stats: null,
    });
    useAutoArrangeResult.getState().clear();
    expect(useAutoArrangeResult.getState().failures).toEqual([]);
    expect(useAutoArrangeResult.getState().stats).toBeNull();
  });
});
