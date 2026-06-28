# Lock-Before-Arrange Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder the scheduling wizard so locking fixed slots comes before auto-arrange: `config → curriculum → assign → lock → generate → review → publish`, splitting the combined final step into a `lock` step (early) and a `publish` step (last).

**Architecture:** The wizard is data-driven from one `WIZARD_STEPS` array + 3 state flags (`hasGrid`, `hasResponsibilities`, `hasPlacements`); the stepper and landing redirect recompute from it. The change is: edit that array (add `lock`, repoint `publish` to a new segment), fix `hasPlacements` to ignore locked rows, move the publish UI out of the lock page into a new `publish/` route, and update the two affected test files. The auto-arrange solver already treats locked rows as occupied — untouched.

**Tech Stack:** Next.js 16 App Router (parallel/segment routes), MUI, Prisma, Vitest, Playwright (e2e).

## Global Constraints

- Package manager: **pnpm only**; single unit test via `pnpm exec vitest run <path>` (quote paths containing `[` `]`).
- Final step order (keys): `config, curriculum, assign, lock, generate, review, publish`.
- Step predicates (exact): `config` → `() => true`; `curriculum` → `hasGrid`; `assign` → `hasGrid`; `lock` → `hasGrid`; `generate` → `hasGrid && hasResponsibilities`; `review` → `hasGrid && hasResponsibilities`; `publish` → `hasGrid && hasResponsibilities && hasPlacements`.
- Labels/segments: `lock` → label `ล็อก`, segment `lock`; `publish` → label `เผยแพร่`, segment `publish`.
- `hasPlacements` counts only `class_schedule` rows with `IsLocked: false`.
- Do NOT change the auto-arrange solver, the lock engine, the arrange grid, or `LockSchedule`/`PublishReadinessCard` internals.
- Commit trailers (verbatim):
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FAk7DfkGKDcUKHkc5tUPT3
  ```

## File Structure

**Modify**
- `src/features/schedule-wizard/domain/wizard-steps.ts` — `WizardStepKey` union + `WIZARD_STEPS` array (add `lock`, repoint `publish`).
- `src/features/schedule-wizard/domain/__tests__/wizard-steps.test.ts` — update for 7 steps / new gating.
- `src/features/schedule-wizard/application/services/wizard-state.service.ts` — `hasPlacements` adds `IsLocked: false`.
- `src/app/schedule/[academicYear]/[semester]/lock/page.tsx` — remove the publish section.
- `e2e/23-wizard-flow.spec.ts` — update step order/label/count assertions.

**Create**
- `src/app/schedule/[academicYear]/[semester]/publish/page.tsx` — the moved publish UI.
- `src/app/schedule/[academicYear]/[semester]/publish/loading.tsx`
- `src/app/schedule/[academicYear]/[semester]/publish/error.tsx`

**Unchanged (verified):** `WizardStepper.tsx` and landing `page.tsx` render from `WIZARD_STEPS` (segment resolved via `segmentForKey`) — they auto-adapt. Auto-arrange action/solver untouched.

---

### Task 1: Reorder wizard steps (add `lock`, repoint `publish`)

**Files:**
- Modify: `src/features/schedule-wizard/domain/wizard-steps.ts`
- Test: `src/features/schedule-wizard/domain/__tests__/wizard-steps.test.ts`

**Interfaces:**
- Produces: `WizardStepKey = "config" | "curriculum" | "assign" | "lock" | "generate" | "review" | "publish"`; `WIZARD_STEPS` in that order with the predicates from Global Constraints; `lock` has `segment: "lock"`, `publish` has `segment: "publish"`.

- [ ] **Step 1: Update the test to the new 7-step contract**

Replace the `WIZARD_STEPS` "defines the six ordered steps" test and the gating tests with:

```ts
describe("WIZARD_STEPS", () => {
  it("defines the seven ordered steps", () => {
    expect(WIZARD_STEPS.map((s) => s.key)).toEqual([
      "config", "curriculum", "assign", "lock", "generate", "review", "publish",
    ]);
  });

  it("lock comes before generate and review", () => {
    const keys = WIZARD_STEPS.map((s) => s.key);
    expect(keys.indexOf("lock")).toBeLessThan(keys.indexOf("generate"));
    expect(keys.indexOf("lock")).toBeLessThan(keys.indexOf("review"));
  });

  it("lock uses the lock segment, publish uses the publish segment", () => {
    expect(WIZARD_STEPS.find((s) => s.key === "lock")?.segment).toBe("lock");
    expect(WIZARD_STEPS.find((s) => s.key === "publish")?.segment).toBe("publish");
  });
});
```

In `resolveStepAccess`:
- "a grid unlocks curriculum and assign but not generate" → expect `["config", "curriculum", "assign", "lock"]` (grid now also unlocks `lock`).
- "grid + responsibilities unlock generate and review" → expect `["config", "curriculum", "assign", "lock", "generate", "review"]`.
- "placements unlock the publish step" → unchanged (`every reachable`).
- "does not unlock generate when responsibilities exist but no grid" → unchanged (`["config"]`).

In `furthestReachableStep`:
- "is assign once a grid exists" → change to **"is lock once a grid exists"**: `expect(furthestReachableStep(makeState({ hasGrid: true }))).toBe("lock")`.
- "is publish when everything is in place" → unchanged.

`isStepReachable` tests: unchanged.

- [ ] **Step 2: Run the test, verify it FAILS**

Run: `pnpm exec vitest run "src/features/schedule-wizard/domain/__tests__/wizard-steps.test.ts"`
Expected: FAIL — current array has 6 keys, no `lock`, `furthest(hasGrid)` is `assign`.

- [ ] **Step 3: Implement the new step array**

In `wizard-steps.ts`, change the union:

```ts
export type WizardStepKey =
  | "config"
  | "curriculum"
  | "assign"
  | "lock"
  | "generate"
  | "review"
  | "publish";
```

Replace `WIZARD_STEPS` with (note: insert `lock` after `assign`; the old `publish` entry's `segment` changes from `"lock"` to `"publish"` and its label from `"ล็อกและเผยแพร่"` to `"เผยแพร่"`):

```ts
export const WIZARD_STEPS: readonly WizardStepDef[] = [
  { key: "config",     label: "ตั้งค่าคาบเรียน",      segment: "config",     requires: () => true },
  { key: "curriculum", label: "ตรวจหลักสูตร",        segment: "curriculum", requires: (s) => s.hasGrid },
  { key: "assign",     label: "มอบหมายครู",          segment: "assign",     requires: (s) => s.hasGrid },
  { key: "lock",       label: "ล็อก",                segment: "lock",       requires: (s) => s.hasGrid },
  { key: "generate",   label: "สร้างตารางอัตโนมัติ",  segment: "generate",   requires: (s) => s.hasGrid && s.hasResponsibilities },
  { key: "review",     label: "ตรวจและปรับ",         segment: "arrange",    requires: (s) => s.hasGrid && s.hasResponsibilities },
  { key: "publish",    label: "เผยแพร่",             segment: "publish",    requires: (s) => s.hasGrid && s.hasResponsibilities && s.hasPlacements },
] as const;
```

Leave `FIRST_STEP`, `resolveStepAccess`, `isStepReachable`, `furthestReachableStep` unchanged (they iterate the array).

- [ ] **Step 4: Run the test, verify it PASSES**

Run: `pnpm exec vitest run "src/features/schedule-wizard/domain/__tests__/wizard-steps.test.ts"`
Expected: PASS.

- [ ] **Step 5: Typecheck the union change** (the `WizardStepKey` widening can surface exhaustive switches elsewhere)

Run: `pnpm typecheck 2>&1 | grep -E "wizard|WizardStepKey|schedule-wizard"`
Expected: no output. If a `switch (key)` on `WizardStepKey` errors, add a `lock`/`publish` branch mirroring the neighbor's behavior.

- [ ] **Step 6: Commit**

```bash
git add "src/features/schedule-wizard/domain/wizard-steps.ts" "src/features/schedule-wizard/domain/__tests__/wizard-steps.test.ts"
git commit -m "feat(wizard): add lock step before generate; publish becomes its own step"
```

---

### Task 2: `hasPlacements` ignores locked rows

**Files:**
- Modify: `src/features/schedule-wizard/application/services/wizard-state.service.ts`
- Test: `src/features/schedule-wizard/application/services/__tests__/wizard-state.service.test.ts` (create)

**Interfaces:**
- Consumes: `getWizardState(academicYear, semester)` → `WizardState`.
- Produces: `hasPlacements` is true only when a NON-locked `class_schedule` row exists for the term.

- [ ] **Step 1: Write the failing test** (mock prisma; assert the `where` passed to the placement count)

Create `src/features/schedule-wizard/application/services/__tests__/wizard-state.service.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it, verify it FAILS**

Run: `pnpm exec vitest run "src/features/schedule-wizard/application/services/__tests__/wizard-state.service.test.ts"`
Expected: FAIL — current `where` has no `IsLocked` key (`lastPlacementArgs.where.IsLocked` is `undefined`).

- [ ] **Step 3: Implement** — add `IsLocked: false` to the placement count `where`:

```ts
      prisma.class_schedule.count({
        where: {
          IsLocked: false,
          timeslot: { AcademicYear: academicYear, Semester: semesterEnum },
        },
      }),
```

- [ ] **Step 4: Run it, verify it PASSES** (same command).

- [ ] **Step 5: Commit**

```bash
git add "src/features/schedule-wizard/application/services/wizard-state.service.ts" "src/features/schedule-wizard/application/services/__tests__/wizard-state.service.test.ts"
git commit -m "fix(wizard): hasPlacements counts only non-locked rows so locking doesn't unlock publish"
```

---

### Task 3: New `publish/` route; strip publish UI from `lock/`

**Files:**
- Create: `src/app/schedule/[academicYear]/[semester]/publish/page.tsx`
- Create: `src/app/schedule/[academicYear]/[semester]/publish/loading.tsx`
- Create: `src/app/schedule/[academicYear]/[semester]/publish/error.tsx`
- Modify: `src/app/schedule/[academicYear]/[semester]/lock/page.tsx`

**Interfaces:**
- Consumes: `PublishReadinessCard` from `@/features/config/presentation/components/PublishReadinessCard` (prop `configId: string`); the wizard `publish` step (segment `publish`) from Task 1.

- [ ] **Step 1: Create the publish page** — `src/app/schedule/[academicYear]/[semester]/publish/page.tsx`:

```tsx
import React from "react";
import { Box, Typography } from "@mui/material";
import { PublishReadinessCard } from "@/features/config/presentation/components/PublishReadinessCard";

type Props = {
  params: Promise<{ academicYear: string; semester: string }>;
};

export default async function PublishPage({ params }: Props) {
  const { academicYear: academicYearStr, semester: semesterStr } = await params;
  const semester = parseInt(semesterStr, 10);
  const academicYear = parseInt(academicYearStr, 10);
  const configId = `${semester}-${academicYear}`;

  return (
    <Box sx={{ my: 5 }}>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        เผยแพร่ตาราง
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        ตรวจความพร้อมก่อนเผยแพร่ — ทุกระดับชั้นต้องจัดครบและผ่านเกณฑ์ ศธ.
      </Typography>
      <PublishReadinessCard configId={configId} />
    </Box>
  );
}
```

- [ ] **Step 2: Create the publish loading skeleton** — `publish/loading.tsx`:

```tsx
export default function PublishLoading() {
  return (
    <div className="flex flex-col gap-4 p-6 animate-pulse">
      <div className="h-7 w-48 bg-gray-200 rounded" />
      <div className="h-4 w-80 bg-gray-100 rounded" />
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="h-5 w-40 bg-gray-200 rounded mb-3" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-2/3 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create the publish error boundary** — `publish/error.tsx`:

```tsx
"use client";
import RouteErrorFallback from "@/components/error/RouteErrorFallback";

export default function PublishError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorFallback error={error} reset={reset} context="เผยแพร่ตาราง" />
  );
}
```

- [ ] **Step 4: Remove the publish section from the lock page** — in `src/app/schedule/[academicYear]/[semester]/lock/page.tsx`:
  - Delete the imports `Box`, `Divider`, `Typography` from `@mui/material` (no longer used) and the `PublishReadinessCard` import.
  - Replace the returned JSX so only the `LockSchedule` block remains:

```tsx
  return (
    <div className="flex flex-col gap-3 my-5">
      <LockSchedule
        initialData={initialData}
        semester={semester}
        academicYear={academicYear}
      />
    </div>
  );
```

  (Keep everything above the `return` — param parsing, `getLockedSchedulesAction`, `initialData`. The `configId` local is now unused there; remove it.)

- [ ] **Step 5: Typecheck both routes**

Run: `pnpm typecheck 2>&1 | grep -E "schedule/.*(lock|publish)/page|publish/(loading|error)"`
Expected: no output (no unused-import errors, publish page resolves `PublishReadinessCard`).

- [ ] **Step 6: Commit**

```bash
git add "src/app/schedule/[academicYear]/[semester]/publish" "src/app/schedule/[academicYear]/[semester]/lock/page.tsx"
git commit -m "feat(wizard): move publish UI to its own /publish route; lock page is lock-only"
```

---

### Task 4: Update the e2e wizard-flow spec

**Files:**
- Modify: `e2e/23-wizard-flow.spec.ts`

**Interfaces:**
- Consumes: the new 7-step order, labels (`ล็อก`, `เผยแพร่`), and segments (`lock`, `publish`) from Tasks 1 & 3.

- [ ] **Step 1: Read `e2e/23-wizard-flow.spec.ts`** and locate every assertion encoding the old wizard: a 6-step count, the combined `ล็อกและเผยแพร่` label, the order `generate → review → publish`, or navigation expecting the publish UI under the `lock` segment.

- [ ] **Step 2: Update those assertions** to the new contract:
  - step count 6 → 7;
  - label `ล็อกและเผยแพร่` → two labels `ล็อก` and `เผยแพร่`;
  - order places `ล็อก` between `มอบหมายครู` and `สร้างตารางอัตโนมัติ`; `เผยแพร่` last;
  - any URL/segment assertion: publish content now lives at `…/publish`, lock content stays at `…/lock`.
  Match the spec's existing assertion style (selectors/helpers already in the file); do not introduce new patterns.

- [ ] **Step 3: Typecheck the e2e spec** (per the project's e2e type-check gate)

Run: `pnpm typecheck 2>&1 | grep -E "23-wizard-flow"`
Expected: no output. (Do NOT run the e2e suite locally — CI is the source of truth for e2e.)

- [ ] **Step 4: Commit**

```bash
git add e2e/23-wizard-flow.spec.ts
git commit -m "test(e2e): update wizard-flow for lock-before-arrange step order"
```

---

### Task 5: Wire-up verification (browser)

**Files:** none (verification only)

- [ ] **Step 1:** Dev server + seeded DB up, logged in. Open `/schedule/2568/1/config` (or the wizard landing). Confirm the stepper shows, in order: ตั้งค่าคาบเรียน → ตรวจหลักสูตร → มอบหมายครู → **ล็อก** → สร้างตารางอัตโนมัติ → ตรวจและปรับ → **เผยแพร่** (7 steps).
- [ ] **Step 2:** Click **ล็อก** → lands on `…/lock`, shows the lock UI only (no "เผยแพร่ตาราง" section). Click **เผยแพร่** → lands on `…/publish`, shows the publish readiness card.
- [ ] **Step 3:** Gating — on a term with a grid + responsibilities but with placements consisting only of locked rows, confirm `เผยแพร่` is not reachable (gated) while `ล็อก`/`สร้างตารางอัตโนมัติ`/`ตรวจและปรับ` are. (Use the seeded published term to confirm the reachable case too.)
- [ ] **Step 4:** Check console: no new errors on `/lock` and `/publish` (pre-existing Navbar hydration-dot mismatch is out of scope).
- [ ] **Step 5:** `pnpm typecheck 2>&1 | grep -cE "^src/"` → 0. Run the wizard unit tests: `pnpm exec vitest run "src/features/schedule-wizard"`.
- [ ] **Step 6:** No commit (verification).

---

## Self-Review

**Spec coverage:** step reorder + new `lock` step (T1); `hasPlacements` non-locked fix (T2); route split — new `publish/` route + strip lock page (T3); consumer test updates — wizard-steps (T1), wizard-state (T2), e2e (T4); browser verify (T5). `WizardStepper`/landing auto-adapt (noted, no task). Auto-arrange unchanged (Non-goal). All spec sections mapped.

**Placeholder scan:** T1–T3 carry full code; T4 is an existing-spec edit that requires reading the file first (its assertion style is project-specific) — each change is concretely enumerated (count 6→7, label split, order, segment), not deferred.

**Type consistency:** `WizardStepKey` (T1) adds `lock`/`publish`; `WIZARD_STEPS` segments `lock`/`publish` (T1) match the routes created in T3; `hasPlacements` (T2) is the flag the `publish` predicate (T1) reads; `PublishReadinessCard` prop `configId: string` used consistently in T3.
