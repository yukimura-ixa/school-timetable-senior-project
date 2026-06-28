/**
 * Scheduling Wizard — Step Definitions & Gating
 *
 * Pure domain logic for the guided, forward-gated scheduling workflow that
 * replaces the old free-navigation tab hub at /schedule/[year]/[semester].
 *
 * A step is reachable only when its prerequisite state holds, but every
 * already-reachable step stays navigable — only forward skips are blocked,
 * revisiting completed steps is always allowed. No DB access here; the server
 * layout gathers the three state flags and the UI consumes the result.
 */

export type WizardStepKey =
  | "config"
  | "curriculum"
  | "assign"
  | "lock"
  | "generate"
  | "review"
  | "publish";

/** Observable state of the term, gathered server-side, that drives gating. */
export interface WizardState {
  /** A valid timeslot grid exists (table_config with timeslots). */
  hasGrid: boolean;
  /** At least one teaching responsibility is assigned for the term. */
  hasResponsibilities: boolean;
  /** At least one class is placed in the grid for the term. */
  hasPlacements: boolean;
}

export interface WizardStepDef {
  key: WizardStepKey;
  /** Thai label shown in the stepper. */
  label: string;
  /** Route segment under /schedule/[year]/[semester] (null = external/in-page). */
  segment: string | null;
  /** Prerequisite predicate — true when this step may be entered. */
  requires: (state: WizardState) => boolean;
}

export const WIZARD_STEPS: readonly WizardStepDef[] = [
  { key: "config",     label: "ตั้งค่าคาบเรียน",      segment: "config",     requires: () => true },
  { key: "curriculum", label: "ตรวจหลักสูตร",        segment: "curriculum", requires: (s) => s.hasGrid },
  { key: "assign",     label: "มอบหมายครู",          segment: "assign",     requires: (s) => s.hasGrid },
  { key: "lock",       label: "ล็อก",                segment: "lock",       requires: (s) => s.hasGrid },
  { key: "generate",   label: "สร้างตารางอัตโนมัติ",  segment: "generate",   requires: (s) => s.hasGrid && s.hasResponsibilities },
  { key: "review",     label: "ตรวจและปรับ",         segment: "arrange",    requires: (s) => s.hasGrid && s.hasResponsibilities },
  { key: "publish",    label: "เผยแพร่",             segment: "publish",    requires: (s) => s.hasGrid && s.hasResponsibilities && s.hasPlacements },
] as const;

export interface StepAccess {
  key: WizardStepKey;
  reachable: boolean;
}

export function resolveStepAccess(state: WizardState): StepAccess[] {
  return WIZARD_STEPS.map((step) => ({
    key: step.key,
    reachable: step.requires(state),
  }));
}

export function isStepReachable(
  key: string,
  state: WizardState,
): boolean {
  const step = WIZARD_STEPS.find((s) => s.key === key);
  return step ? step.requires(state) : false;
}

/** First step is always reachable (requires: () => true) — safe default. */
export const FIRST_STEP: WizardStepKey = "config";

/** The furthest step the user can currently reach — the default landing step. */
export function furthestReachableStep(state: WizardState): WizardStepKey {
  let furthest: WizardStepKey = FIRST_STEP;
  for (const step of WIZARD_STEPS) {
    if (step.requires(state)) {
      furthest = step.key;
    }
  }
  return furthest;
}
