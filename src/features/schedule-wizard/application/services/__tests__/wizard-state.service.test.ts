import { describe, it, expect, vi, beforeEach } from "vitest";

const counts: number[] = [];
vi.mock("@/lib/prisma", () => ({
  prisma: {
    timeslot: { count: vi.fn(async () => counts[0]) },
    teachers_responsibility: { count: vi.fn(async () => counts[1]) },
    class_schedule: { count: vi.fn(async (args: any) => { lastPlacementArgs = args; return counts[2]; }) },
  },
}));

let lastPlacementArgs: any;
import { getWizardState } from "../wizard-state.service";

beforeEach(() => { lastPlacementArgs = undefined; });

describe("getWizardState — hasPlacements excludes locked rows", () => {
  it("counts placements with IsLocked: false", async () => {
    counts[0] = 60; counts[1] = 5; counts[2] = 0;
    await getWizardState(2568, 1);
    expect(lastPlacementArgs.where.IsLocked).toBe(false);
  });

  it("hasPlacements is false when only locked rows exist (count 0 after filter)", async () => {
    counts[0] = 60; counts[1] = 5; counts[2] = 0;
    const state = await getWizardState(2568, 1);
    expect(state.hasPlacements).toBe(false);
  });

  it("hasPlacements is true when a non-locked row exists", async () => {
    counts[0] = 60; counts[1] = 5; counts[2] = 3;
    const state = await getWizardState(2568, 1);
    expect(state.hasPlacements).toBe(true);
  });
});
