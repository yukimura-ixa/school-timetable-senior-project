/**
 * Scheduling Wizard Step-Gating Tests
 *
 * The wizard is forward-gated: a step is reachable only when its prerequisite
 * state holds, but every already-reachable step stays navigable (users may
 * revisit completed steps — only forward skips are blocked).
 */
import { describe, expect, it } from "vitest";

import {
  WIZARD_STEPS,
  resolveStepAccess,
  furthestReachableStep,
  isStepReachable,
  type WizardState,
} from "../wizard-steps";

function makeState(overrides: Partial<WizardState> = {}): WizardState {
  return {
    hasGrid: false,
    hasResponsibilities: false,
    hasPlacements: false,
    ...overrides,
  };
}

describe("WIZARD_STEPS", () => {
  it("defines the six ordered steps", () => {
    expect(WIZARD_STEPS.map((s) => s.key)).toEqual([
      "config",
      "curriculum",
      "assign",
      "generate",
      "review",
      "publish",
    ]);
  });
});

describe("resolveStepAccess", () => {
  it("with empty state only the config step is reachable", () => {
    const access = resolveStepAccess(makeState());
    const reachable = access.filter((a) => a.reachable).map((a) => a.key);
    expect(reachable).toEqual(["config"]);
  });

  it("a grid unlocks curriculum and assign but not generate", () => {
    const access = resolveStepAccess(makeState({ hasGrid: true }));
    const reachable = access.filter((a) => a.reachable).map((a) => a.key);
    expect(reachable).toEqual(["config", "curriculum", "assign"]);
  });

  it("grid + responsibilities unlock generate and review", () => {
    const access = resolveStepAccess(
      makeState({ hasGrid: true, hasResponsibilities: true }),
    );
    const reachable = access.filter((a) => a.reachable).map((a) => a.key);
    expect(reachable).toEqual([
      "config",
      "curriculum",
      "assign",
      "generate",
      "review",
    ]);
  });

  it("placements unlock the publish step", () => {
    const access = resolveStepAccess(
      makeState({
        hasGrid: true,
        hasResponsibilities: true,
        hasPlacements: true,
      }),
    );
    expect(access.every((a) => a.reachable)).toBe(true);
  });

  it("does not unlock generate when responsibilities exist but no grid", () => {
    // Defensive: responsibilities without a grid must not skip the grid gate.
    const access = resolveStepAccess(
      makeState({ hasResponsibilities: true, hasPlacements: true }),
    );
    const reachable = access.filter((a) => a.reachable).map((a) => a.key);
    expect(reachable).toEqual(["config"]);
  });
});

describe("isStepReachable", () => {
  it("blocks a forward skip to publish from an empty state", () => {
    expect(isStepReachable("publish", makeState())).toBe(false);
  });

  it("allows revisiting an earlier completed step", () => {
    const state = makeState({ hasGrid: true, hasResponsibilities: true });
    expect(isStepReachable("config", state)).toBe(true);
  });

  it("returns false for an unknown step key", () => {
    expect(isStepReachable("nope", makeState({ hasGrid: true }))).toBe(false);
  });
});

describe("furthestReachableStep", () => {
  it("is config for an empty state", () => {
    expect(furthestReachableStep(makeState())).toBe("config");
  });

  it("is assign once a grid exists", () => {
    expect(furthestReachableStep(makeState({ hasGrid: true }))).toBe("assign");
  });

  it("is publish when everything is in place", () => {
    expect(
      furthestReachableStep(
        makeState({
          hasGrid: true,
          hasResponsibilities: true,
          hasPlacements: true,
        }),
      ),
    ).toBe("publish");
  });
});
