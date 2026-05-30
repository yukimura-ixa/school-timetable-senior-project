import { describe, it, expect, beforeEach } from "vitest";
import { useAutoArrangeResult } from "../auto-arrange-result.store";

describe("auto-arrange-result store", () => {
  beforeEach(() => {
    useAutoArrangeResult.getState().clear();
  });

  it("starts empty", () => {
    expect(useAutoArrangeResult.getState().failures).toEqual([]);
  });

  it("stores failures", () => {
    useAutoArrangeResult
      .getState()
      .setResult([{ subjectCode: "ค21101", reason: "ไม่มีคาบว่าง" }]);
    expect(useAutoArrangeResult.getState().failures).toHaveLength(1);
  });

  it("clear resets to empty", () => {
    useAutoArrangeResult.getState().setResult([{ subjectCode: "x", reason: "y" }]);
    useAutoArrangeResult.getState().clear();
    expect(useAutoArrangeResult.getState().failures).toEqual([]);
  });
});
