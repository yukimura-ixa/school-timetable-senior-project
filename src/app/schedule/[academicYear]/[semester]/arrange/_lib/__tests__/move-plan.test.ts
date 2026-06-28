import { describe, it, expect } from "vitest";
import { planPlacementMove } from "../move-plan";

const base = {
  fromTimeslot: "1-2568-MON1",
  targetTimeslot: "1-2568-MON4",
  allowed: true,
  currentRoomId: 5,
  availableRoomIds: [5, 6, 7],
};

describe("planPlacementMove", () => {
  it("dropping on the source cell is a no-op", () => {
    expect(planPlacementMove({ ...base, targetTimeslot: base.fromTimeslot })).toBe("noop");
  });
  it("not allowed (occupied/conflict) → conflict", () => {
    expect(planPlacementMove({ ...base, allowed: false })).toBe("conflict");
  });
  it("allowed and current room free at target → keep room", () => {
    expect(planPlacementMove(base)).toBe("move-keep-room");
  });
  it("allowed but current room taken at target → pick room", () => {
    expect(planPlacementMove({ ...base, availableRoomIds: [6, 7] })).toBe("move-pick-room");
  });
  it("no-op takes precedence over a (stale) not-allowed result on the same cell", () => {
    expect(planPlacementMove({ ...base, targetTimeslot: base.fromTimeslot, allowed: false })).toBe("noop");
  });
});
