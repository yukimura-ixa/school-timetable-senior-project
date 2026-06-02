# Phase 2A — Per-Slot Durations + Breaks as Real Slots — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make breaks real, occupying timeslots (not elastic gaps) with per-slot durations, so staggered lunches free real teaching time for other grades — driven by a unified `slots[]` config, with existing schedules migrated by remapping `class_schedule.TimeslotID`.

**Architecture:** `config.slots: { duration, breakGroups? }[]` replaces global `Duration` + `TimeslotPerDay` + `breakDefinitions`. `generateTimeslots` emits one real timeslot per slot (cumulative clock, per-slot duration); a slot is a per-grade break via Phase 1's `break_group` resolution (now read from `slots[]`). The arrange solver/validation skip a grade's break slots. A migration regenerates timeslots and remaps existing `class_schedule.TimeslotID` old→new so placements survive.

**Tech Stack:** Next.js 16, Prisma 7 (pg adapter), Valibot, Vitest, React (reactCompiler).

**Spec:** `docs/superpowers/specs/2026-06-01-phase2a-per-slot-breaks-design.md`

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `src/features/timeslot/domain/models/break.types.ts` | `BreakGroup`, new `SlotConfig` type | Modify |
| `src/features/config/domain/types/config-data.types.ts` | `ConfigData`: `slots[]` replaces `Duration`/`TimeslotPerDay`/`breakDefinitions` | Modify |
| `src/features/config/application/schemas/config-validation.schemas.ts` | Valibot for `slots[]` | Modify |
| `src/features/config/domain/constants/config.constants.ts` | `ConfigData` shape + `DEFAULT_CONFIG` | Modify |
| `src/utils/break-utils.ts` | `isBreakForGrade`/`isBreakForTeacher`/`isBreakSlot` read `SlotConfig[]` | Modify |
| `src/utils/break-utils.test.ts` | detection tests over `slots[]` | Modify |
| `src/features/timeslot/domain/services/timeslot.service.ts` | `generateTimeslots` rewrite (every slot a real timeslot) | Modify |
| `src/features/timeslot/domain/services/timeslot.service.test.ts` | generation tests | Modify |
| `src/lib/ui/break-rows.ts` + `.test.ts` | `buildGridRows` sources breaks from `slots[]` | Modify |
| `src/features/timeslot/domain/services/slot-migration.ts` | NEW: pure `configToSlots()` + `remapTimeslotId()` | Create |
| `src/features/timeslot/domain/services/slot-migration.test.ts` | NEW: migration mapper tests | Create |
| `prisma/migration-slots-realbreaks.ts` | NEW: regenerate timeslots + remap class_schedule (idempotent, dry-run) | Create |
| `src/features/arrange/application/actions/validate-drop.action.ts` | reject drop on a grade's break slot | Modify |
| `src/features/arrange/application/actions/auto-arrange.action.ts` + `src/features/arrange/domain/auto-arrange/*` | exclude grade break slots from placement | Modify |
| render call sites (student-table `component/Timeslot.tsx` + `page.tsx`, public `classes`/`teachers` pages, `components/schedule/TimeslotGrid.tsx`) | pass `slots[]` instead of `breakDefinitions` | Modify |
| `src/features/config/application/actions/config.actions.ts`, `src/features/timeslot/application/actions/timeslot.actions.ts` | generate from `slots[]` | Modify |
| `prisma/seed.ts` | emit `slots[]` configs | Modify |
| `src/app/dashboard/_components/TimeslotConfigurationStep.tsx` | minimal: produce `slots[]` on create (default-fill teaching length + break slots); full UX is 2C | Modify |

**Shared types (used across tasks):**

```typescript
// break.types.ts
export type SlotConfig = {
  duration: number;          // minutes
  breakGroups?: string[];    // break_group.Name refs; ["*"] = universal; absent/[] = teaching
};
```

```typescript
// config-data.types.ts (ConfigData)
type ConfigData = {
  Days: DayOfWeek[];
  StartTime: string;         // "HH:MM"
  slots: SlotConfig[];
};
```

---

## Task 1: `SlotConfig` type + config schema/types

**Files:**
- Modify: `src/features/timeslot/domain/models/break.types.ts`
- Modify: `src/features/config/domain/types/config-data.types.ts`
- Modify: `src/features/config/application/schemas/config-validation.schemas.ts`
- Modify: `src/features/config/domain/constants/config.constants.ts`

- [ ] **Step 1: Add `SlotConfig` type**

In `break.types.ts`, after `BreakGroup`, add:

```typescript
export type SlotConfig = {
  duration: number;          // minutes (per-slot)
  breakGroups?: string[];    // break_group.Name refs that break here; ["*"] = universal recess; absent/[] = teaching slot
};
```

- [ ] **Step 2: Replace config fields with `slots[]`**

In `config-data.types.ts`, in `ConfigDataSchema`: remove `Duration`, `TimeslotPerDay`, `breakDefinitions`; add:

```typescript
slots: v.array(
  v.object({
    duration: v.pipe(v.number(), v.integer(), v.minValue(1)),
    breakGroups: v.optional(v.array(v.string())),
  }),
),
```

Keep `Days`, `StartTime`. Update the JSDoc example to use `slots`.

In `config-validation.schemas.ts` and `config.constants.ts`: mirror the same change (remove the three fields, add `slots`). In `config.constants.ts` `DEFAULT_CONFIG`, replace the old duration/timeslot/break defaults with a `slots` array, e.g.:

```typescript
slots: [
  { duration: 50 }, { duration: 50 }, { duration: 10, breakGroups: ["*"] },
  { duration: 50 }, { duration: 50, breakGroups: ["junior"] },
  { duration: 50, breakGroups: ["senior"] }, { duration: 50 }, { duration: 50 },
],
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck 2>&1 | head -30`
Expected: errors ONLY in downstream consumers still referencing `Duration`/`TimeslotPerDay`/`breakDefinitions` (fixed in later tasks). No errors in the four files edited here.

- [ ] **Step 4: Commit**

```bash
git add src/features/timeslot/domain/models/break.types.ts src/features/config/domain/types/config-data.types.ts src/features/config/application/schemas/config-validation.schemas.ts src/features/config/domain/constants/config.constants.ts
git commit -m "feat(config): SlotConfig + slots[] replaces Duration/TimeslotPerDay/breakDefinitions"
```

---

## Task 2: Detection reads `SlotConfig[]`

**Files:**
- Modify: `src/utils/break-utils.ts`
- Test: `src/utils/break-utils.test.ts`

The break info now lives in `slots[i].breakGroups` (slot index `i`, 1-based `slotNumber = i+1`). Detection helpers switch from `BreakDefinition[]` to `SlotConfig[]`.

- [ ] **Step 1: Write failing tests**

In `break-utils.test.ts`, add:

```typescript
import { isBreakForGrade, isBreakSlot } from "./break-utils";
import type { SlotConfig } from "@/features/timeslot/domain/models/break.types";

describe("isBreakForGrade over slots", () => {
  const slots: SlotConfig[] = [
    { duration: 50 },                              // slot 1 teaching
    { duration: 50 },                              // slot 2 teaching
    { duration: 10, breakGroups: ["*"] },          // slot 3 universal recess
    { duration: 50, breakGroups: ["junior"] },     // slot 4 junior lunch
    { duration: 50, breakGroups: ["senior"] },     // slot 5 senior lunch
    { duration: 50 },                              // slot 6 teaching
  ];
  const index = buildGradeGroupIndex([
    { name: "junior", label: "ม.ต้น", color: "#4CAF50", gradeIds: ["M1-1"] },
    { name: "senior", label: "ม.ปลาย", color: "#2196F3", gradeIds: ["M5-1"] },
  ]);

  it("universal slot is a break for any grade", () => {
    expect(isBreakForGrade(3, "M1-1", slots, index)).toBe(true);
    expect(isBreakForGrade(3, "M5-1", slots, index)).toBe(true);
  });
  it("group slot only breaks for that group's grades", () => {
    expect(isBreakForGrade(4, "M1-1", slots, index)).toBe(true);   // junior lunch
    expect(isBreakForGrade(4, "M5-1", slots, index)).toBe(false);  // senior not junior
    expect(isBreakForGrade(5, "M5-1", slots, index)).toBe(true);   // senior lunch
    expect(isBreakForGrade(5, "M1-1", slots, index)).toBe(false);
  });
  it("teaching slot is never a break", () => {
    expect(isBreakForGrade(1, "M1-1", slots, index)).toBe(false);
  });
});

describe("isBreakSlot over slots", () => {
  const slots: SlotConfig[] = [
    { duration: 50 }, { duration: 10, breakGroups: ["*"] }, { duration: 50, breakGroups: ["junior"] },
  ];
  it("true for any slot with breakGroups (universal or group)", () => {
    expect(isBreakSlot(2, slots)).toBe(true);
    expect(isBreakSlot(3, slots)).toBe(true);
  });
  it("false for a pure teaching slot", () => {
    expect(isBreakSlot(1, slots)).toBe(false);
  });
});
```

- [ ] **Step 2: Run, confirm FAIL**

Run: `pnpm test src/utils/break-utils.test.ts`
Expected: FAIL (old signatures take `BreakDefinition[]`/`breaktime`).

- [ ] **Step 3: Rewrite the three helpers**

In `break-utils.ts`, replace `isBreakForGrade`, `isBreakForTeacher`, `isBreakSlot` with:

```typescript
import type { SlotConfig, BreakGroup } from "@/features/timeslot/domain/models/break.types";

/** A slot (1-based slotNumber) is a break for a grade when its breakGroups include "*" or a group the grade belongs to. */
export function isBreakForGrade(
  slotNumber: number,
  gradeId: string,
  slots: SlotConfig[],
  index: Map<string, Set<string>>,
): boolean {
  const bg = slots[slotNumber - 1]?.breakGroups;
  if (!bg || bg.length === 0) return false;
  if (bg.includes("*")) return true;
  const groups = index.get(gradeId);
  return !!groups && bg.some((name) => groups.has(name));
}

/** Teachers see only universal ("*") breaks. */
export function isBreakForTeacher(slotNumber: number, slots: SlotConfig[]): boolean {
  const bg = slots[slotNumber - 1]?.breakGroups;
  return !!bg && bg.includes("*");
}

/** Aggregate: is this slot a break of any kind (universal or group)? */
export function isBreakSlot(slotNumber: number, slots: SlotConfig[]): boolean {
  const bg = slots[slotNumber - 1]?.breakGroups;
  return !!bg && bg.length > 0;
}
```

Keep `buildGradeGroupIndex` unchanged. Update the `BreakDefinition` import to `SlotConfig`.

- [ ] **Step 4: Run, confirm PASS**

Run: `pnpm test src/utils/break-utils.test.ts`
Expected: PASS. (Old `isBreakForGrade`/`isBreakSlot` tests that used `BreakDefinition[]` must be rewritten to the new signature in this step — delete the Phase-1 `BreakDefinition`-based cases that no longer compile.)

- [ ] **Step 5: Commit**

```bash
git add src/utils/break-utils.ts src/utils/break-utils.test.ts
git commit -m "feat(break): detection helpers read SlotConfig[] not BreakDefinition[]"
```

---

## Task 3: `generateTimeslots` — every slot a real timeslot

**Files:**
- Modify: `src/features/timeslot/domain/services/timeslot.service.ts`
- Test: `src/features/timeslot/domain/services/timeslot.service.test.ts`

- [ ] **Step 1: Write failing test**

In `timeslot.service.test.ts`, add:

```typescript
import { generateTimeslots } from "./timeslot.service";

describe("generateTimeslots over slots", () => {
  const base = {
    AcademicYear: 2568,
    Semester: "SEMESTER_1" as const,
    Days: ["MON"] as const,
    StartTime: "08:30",
    slots: [
      { duration: 50 },                          // 08:30-09:20
      { duration: 10, breakGroups: ["*"] },      // 09:20-09:30 universal
      { duration: 50, breakGroups: ["junior"] }, // 09:30-10:20 junior break, teaching-capable
    ],
  };
  it("emits one real timeslot per slot with cumulative per-slot times", () => {
    const ts = generateTimeslots(base as any);
    expect(ts).toHaveLength(3);
    expect(ts[0].TimeslotID).toBe("1-2568-MON1");
    expect(ts[1].TimeslotID).toBe("1-2568-MON2");
    expect(ts[2].TimeslotID).toBe("1-2568-MON3");
    const hhmm = (d: Date) => d.toISOString().slice(11, 16);
    expect(hhmm(ts[0].StartTime)).toBe("08:30");
    expect(hhmm(ts[0].EndTime)).toBe("09:20");
    expect(hhmm(ts[1].EndTime)).toBe("09:30");  // +10 universal
    expect(hhmm(ts[2].EndTime)).toBe("10:20");  // +50
  });
  it("Breaktime=BREAK only for universal slots", () => {
    const ts = generateTimeslots(base as any);
    expect(ts[0].Breaktime).toBe("NOT_BREAK"); // teaching
    expect(ts[1].Breaktime).toBe("BREAK");      // universal
    expect(ts[2].Breaktime).toBe("NOT_BREAK"); // group break is per-grade, slot teaching-capable
  });
});
```

(Note: the `hhmm` expectations assume `StartTime` is constructed in UTC as today — verify against the existing `new Date('2024-01-01T${StartTime}:00')` pattern and adjust the expected strings to match the existing tests' timezone handling.)

- [ ] **Step 2: Run, confirm FAIL**

Run: `pnpm test src/features/timeslot/domain/services/timeslot.service.test.ts`
Expected: FAIL (current `TimeslotsConfig` has `Duration`/`TimeslotPerDay`/`breakDefinitions`).

- [ ] **Step 3: Rewrite `TimeslotsConfig` + `generateTimeslots`**

In `timeslot.service.ts`, replace the `TimeslotsConfig` type and `generateTimeslots` body:

```typescript
import type { SlotConfig } from "../models/break.types";

type TimeslotsConfig = {
  AcademicYear: number;
  Semester: semester;
  Days: day_of_week[];
  StartTime: string;
  slots: SlotConfig[];
};

export function generateTimeslots(config: TimeslotsConfig): timeslot[] {
  const timeslots: timeslot[] = [];
  for (const day of config.Days) {
    let slotStart = new Date(`2024-01-01T${config.StartTime}:00`);
    config.slots.forEach((slot, i) => {
      const endTime = new Date(slotStart);
      endTime.setMinutes(endTime.getMinutes() + slot.duration);
      const isUniversal = slot.breakGroups?.includes("*") ?? false;
      timeslots.push({
        TimeslotID: generateTimeslotId(config.Semester, config.AcademicYear, day, i + 1),
        DayOfWeek: day,
        AcademicYear: config.AcademicYear,
        Semester: config.Semester,
        StartTime: slotStart,
        EndTime: endTime,
        Breaktime: (isUniversal ? "BREAK" : breaktimeEnum.NOT_BREAK) as breaktime,
      });
      slotStart = new Date(endTime);
    });
  }
  return timeslots;
}
```

Remove the now-unused `BreakDefinition` import if nothing else uses it. Drop `TimeslotPerDay`/`Duration`/`breakDefinitions` references.

- [ ] **Step 4: Run, confirm PASS**

Run: `pnpm test src/features/timeslot/domain/services/timeslot.service.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/timeslot/domain/services/timeslot.service.ts src/features/timeslot/domain/services/timeslot.service.test.ts
git commit -m "feat(timeslot): generateTimeslots emits a real timeslot per slot with per-slot durations"
```

---

## Task 4: `buildGridRows` sources breaks from `slots[]`

**Files:**
- Modify: `src/lib/ui/break-rows.ts`
- Test: `src/lib/ui/break-rows.test.ts`

`buildGridRows` currently takes `breakDefs: BreakDefinition[]`. Switch it to derive break rows from `slots[]` + the per-grade `groupNames` (class mode) / `"*"` (teacher) using the new `isBreakForGrade`/`isBreakForTeacher`.

- [ ] **Step 1: Update tests** — replace the `BreakDefinition[]` fixtures with `SlotConfig[]`; class mode still asserts the grade sees only its group's + universal breaks; teacher sees only universal. (Mirror the Task 2 fixtures: slots with `breakGroups`.) Adjust `RenderedRow`/`defs` assertions to the new shape (a break row now corresponds to a slot index with `breakGroups`; carry `{ slotNumber, label?, color? }` — derive a display label from the group, or a generic "พัก" when only universal). Keep the legacy empty-`slots` fallback removed (no longer needed — breaks are explicit slots).

- [ ] **Step 2: Run, confirm FAIL.** `pnpm test src/lib/ui/break-rows.test.ts`

- [ ] **Step 3: Rewrite `buildGridRows`/`pickApplicable`** to walk `slots[]`: a slot is a teaching row unless it's a break for the view (class: `isBreakForGrade(i+1, gradeId, slots, index)`; teacher: `isBreakForTeacher(i+1, slots)`; all: any `breakGroups`). Build the single-grade `index` inline from `groupNames` as in Phase 1. Teaching period numbers count only non-break slots (existing `teachingPeriod++` logic), per view.

- [ ] **Step 4: Run, confirm PASS.**

- [ ] **Step 5: Commit**

```bash
git add src/lib/ui/break-rows.ts src/lib/ui/break-rows.test.ts
git commit -m "feat(break): buildGridRows derives break rows from slots[]"
```

---

## Task 5: Migration mapper (pure) — `configToSlots` + `remapTimeslotId`

**Files:**
- Create: `src/features/timeslot/domain/services/slot-migration.ts`
- Create: `src/features/timeslot/domain/services/slot-migration.test.ts`

This is the load-bearing migration logic. Keep it pure and fully tested before the DB script (Task 9) uses it.

- [ ] **Step 1: Write failing tests**

Create `slot-migration.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { configToSlots, remapTimeslotId } from "./slot-migration";

describe("configToSlots", () => {
  it("interleaves teaching periods (global Duration) with break slots from breakDefinitions", () => {
    const old = {
      Duration: 50,
      TimeslotPerDay: 6,
      breakDefinitions: [
        { id: "m", label: "พักสาย", slotNumber: 3, duration: 10, color: "#x", groups: ["*"] },
        { id: "j", label: "lunch jr", slotNumber: 4, duration: 50, color: "#y", groups: ["junior"] },
        { id: "s", label: "lunch sr", slotNumber: 5, duration: 50, color: "#z", groups: ["senior"] },
      ],
    };
    // teaching 1,2 | break@3 | teaching 3 | break@4 | break@5 | teaching 4,5,6
    expect(configToSlots(old as any)).toEqual([
      { duration: 50 }, { duration: 50 },
      { duration: 10, breakGroups: ["*"] },
      { duration: 50 },
      { duration: 50, breakGroups: ["junior"] },
      { duration: 50, breakGroups: ["senior"] },
      { duration: 50 }, { duration: 50 }, { duration: 50 },
    ]);
  });
});

describe("remapTimeslotId", () => {
  // old teaching period P -> new index = P + (count of breakDefinitions with slotNumber <= P)
  const breakSlotNumbers = [3, 4, 5]; // from old breakDefinitions
  it("shifts teaching period by the number of breaks at/before it", () => {
    expect(remapTimeslotId("1-2568-MON1", breakSlotNumbers)).toBe("1-2568-MON1"); // 0 breaks <=1
    expect(remapTimeslotId("1-2568-MON3", breakSlotNumbers)).toBe("1-2568-MON4"); // 1 break <=3
    expect(remapTimeslotId("1-2568-MON5", breakSlotNumbers)).toBe("1-2568-MON8"); // 3 breaks <=5
  });
});
```

- [ ] **Step 2: Run, confirm FAIL.** `pnpm test src/features/timeslot/domain/services/slot-migration.test.ts`

- [ ] **Step 3: Implement**

Create `slot-migration.ts`:

```typescript
import type { SlotConfig } from "../models/break.types";

type OldConfig = {
  Duration: number;
  TimeslotPerDay: number;
  breakDefinitions?: { slotNumber: number; duration: number; groups: string[] }[];
};

/** Convert legacy { Duration, TimeslotPerDay, breakDefinitions } to slots[]. Break slots inserted before their teaching slotNumber. */
export function configToSlots(old: OldConfig): SlotConfig[] {
  const breaksBySlot = new Map<number, { duration: number; groups: string[] }[]>();
  for (const b of old.breakDefinitions ?? []) {
    const arr = breaksBySlot.get(b.slotNumber) ?? [];
    arr.push({ duration: b.duration, groups: b.groups });
    breaksBySlot.set(b.slotNumber, arr);
  }
  const slots: SlotConfig[] = [];
  for (let period = 1; period <= old.TimeslotPerDay; period++) {
    for (const brk of breaksBySlot.get(period) ?? []) {
      slots.push({ duration: brk.duration, breakGroups: brk.groups });
    }
    slots.push({ duration: old.Duration });
  }
  return slots;
}

/** Remap an old teaching-period TimeslotID to its new slot index, given the old break slotNumbers. */
export function remapTimeslotId(oldId: string, breakSlotNumbers: number[]): string {
  const m = oldId.match(/^(.*?(?:MON|TUE|WED|THU|FRI|SAT|SUN))(\d+)$/);
  if (!m) return oldId;
  const period = Number(m[2]);
  const shift = breakSlotNumbers.filter((s) => s <= period).length;
  return `${m[1]}${period + shift}`;
}
```

- [ ] **Step 4: Run, confirm PASS.**

- [ ] **Step 5: Commit**

```bash
git add src/features/timeslot/domain/services/slot-migration.ts src/features/timeslot/domain/services/slot-migration.test.ts
git commit -m "feat(timeslot): pure configToSlots + remapTimeslotId migration mappers"
```

---

## Task 6: Solver guard — skip a grade's break slots

**Files:**
- Modify: `src/features/arrange/application/actions/validate-drop.action.ts`
- Modify: `src/features/arrange/application/actions/auto-arrange.action.ts` + `src/features/arrange/domain/auto-arrange/*`

> Read these files first with Serena. Determine where a (grade, timeslot) placement is validated / where candidate cells are enumerated. They must consult `isBreakForGrade(slotNumber, gradeId, slots, index)` and treat a break slot as not placeable for that grade. `slotNumber` is parsed from `TimeslotID` (the `…DAY<number>` suffix). `slots` + break groups come from the term config (load via the same path the arrange page already uses for config/break data).

- [ ] **Step 1: Failing test (validate-drop)** — add a unit/integration test asserting a drop of a class onto a timeslot where the target grade breaks is rejected, while a staggered slot (grade NOT in the breaking group) is allowed. Use the Task 2 `slots` fixture shape. (If validate-drop is heavily DB-coupled, extract the pure check into a helper `isPlaceable(gradeId, slotNumber, slots, index)` and unit-test that.)
- [ ] **Step 2: Run, confirm FAIL.**
- [ ] **Step 3: Implement** the guard in both `validate-drop` and the auto-arrange candidate enumeration, using `isBreakForGrade`. Keep it minimal — do NOT add conflict-detector/lock integration (that is 2B).
- [ ] **Step 4: Run, confirm PASS** + `pnpm typecheck`.
- [ ] **Step 5: Commit** `fix(arrange): solver and drag-validation skip a grade's break slots`.

---

## Task 7: Wire render call sites + generate path to `slots[]`

**Files (read each with Serena, replace `breakDefinitions` plumbing with `slots`):**
- `src/app/dashboard/[academicYear]/[semester]/student-table/component/Timeslot.tsx` + `page.tsx`
- `src/app/(public)/classes/[gradeId]/[academicYear]/[semester]/page.tsx`, `src/app/(public)/teachers/[id]/[academicYear]/[semester]/page.tsx`
- `src/components/schedule/TimeslotGrid.tsx`
- `src/features/config/application/actions/config.actions.ts`, `src/features/timeslot/application/actions/timeslot.actions.ts`

- [ ] **Step 1:** Render call sites: replace the `breakDefinitions={configData?.data?.breakDefinitions}` props with `slots={configData?.data?.slots}`; update `isBreakForGrade`/`buildGridRows` calls to the new signatures (pass `slots`). The break-group index still comes from `getBreakContextAction` (Phase 1), unchanged.
- [ ] **Step 2:** Generate path: `config.actions.ts` / `timeslot.actions.ts` pass `slots: configData.slots` into `generateTimeslots` instead of `Duration`/`TimeslotPerDay`/`breakDefinitions`.
- [ ] **Step 3:** `pnpm typecheck` → ZERO errors across the app (all `Duration`/`breakDefinitions`/`TimeslotPerDay` readers converted).
- [ ] **Step 4:** `pnpm test src/utils/break-utils.test.ts src/lib/ui/break-rows.test.ts` green.
- [ ] **Step 5: Commit** `feat(break): wire render + generate paths to slots[]`.

---

## Task 8: Seed emits `slots[]`

**Files:** `prisma/seed.ts`

- [ ] **Step 1:** Replace the config template's `Duration`/`TimeslotPerDay`/`breakDefinitions` with a `slots[]` array equivalent to today's seed (teaching 50-min periods + universal recess + junior/senior lunch slots). Keep `break_group`/`break_group_grade` creation (Phase 1) unchanged — `slots[].breakGroups` reference those names.
- [ ] **Step 2:** `pnpm typecheck`; then re-seed local: `pnpm db:seed:clean` and confirm it completes.
- [ ] **Step 3:** Sanity-query the DB: timeslots now include break slots as real rows; `class_schedule` references them. (Local timetable_dev only.)
- [ ] **Step 4: Commit** `feat(seed): emit slots[] configs with real break slots`.

---

## Task 9: Migration script — regenerate timeslots + remap class_schedule

**Files:** Create `prisma/migration-slots-realbreaks.ts`

Mirror `prisma/seed.ts` for PrismaClient construction (adapter/Accelerate branch). Use Task 5's `configToSlots` + `remapTimeslotId`.

- [ ] **Step 1:** Write the script:
  - For each `table_config`: read old `Config` JSON; if it already has `slots`, skip (idempotent). Else compute `slots = configToSlots(old)` and the `breakSlotNumbers` (old `breakDefinitions[].slotNumber`).
  - Within a transaction per config: write new `Config` (`{ Days, StartTime, slots }`); **delete** old timeslots and `createMany` new ones via `generateTimeslots`; **remap** every `class_schedule.TimeslotID` (and any other `TimeslotID` FK — locks, etc.) using `remapTimeslotId(oldId, breakSlotNumbers)`. Order matters: insert new timeslots BEFORE repointing FKs; or remap onto pre-created new IDs. Avoid FK violations (new IDs must exist before class_schedule points at them).
  - `--dry` flag (default): log planned config→slots, old→new ID map, and counts; write nothing.
- [ ] **Step 2:** `pnpm typecheck` clean; field names match schema (`class_schedule.TimeslotID`, `table_config.Config`).
- [ ] **Step 3:** Dry-run against local DB: `pnpm dotenv -e .env -- tsx prisma/migration-slots-realbreaks.ts` → review the planned remap; confirm no `class_schedule` row maps to a non-existent new ID.
- [ ] **Step 4:** Apply with a flag (e.g. `--apply`) against local; verify `class_schedule` count unchanged and every row points to an existing timeslot.
- [ ] **Step 5: Commit** `chore(timeslot): migration to regenerate timeslots + remap class_schedule for real break slots`.

---

## Task 10: Wizard minimal `slots[]` create flow

**Files:** `src/app/dashboard/_components/TimeslotConfigurationStep.tsx` (+ `ConfigureTimeslotsDialog.tsx` if needed)

> Minimal only — full UX is 2C. The wizard must no longer write the OLD config shape.

- [ ] **Step 1:** Read with Serena. Change the submit to produce `{ Days, StartTime, slots }`: default-fill teaching slots with one period length the admin sets, insert break slots from the existing break-group/break editor (each break → a slot with `duration` + `breakGroups`). Keep break-group editing (Phase 1) as-is.
- [ ] **Step 2:** `pnpm typecheck` clean.
- [ ] **Step 3:** Verify (browser, prod build per the project's `browser_eval`/Playwright pattern) that creating a config for an unconfigured semester writes `slots[]` and generates real break-slot timeslots. (Local prod build on local DB, as in prior verification.)
- [ ] **Step 4: Commit** `feat(config): wizard writes slots[] on create (minimal; full UX in 2C)`.

---

## Task 11: Full quality gates + end-to-end verification

- [ ] **Step 1:** `pnpm test` — all green (break-utils, break-rows, timeslot.service, slot-migration, plus existing suites).
- [ ] **Step 2:** `pnpm typecheck && pnpm lint` — no NEW issues (pre-existing lint on main excepted).
- [ ] **Step 3:** Browser (local prod build on local DB, admin + public): confirm a staggered slot renders as a break for the breaking grade AND is placeable/visible as a class slot for the non-breaking grade (the core 2A win); a universal recess shows for everyone; no error boundaries / console errors.
- [ ] **Step 4: Commit** any verification fixes; push branch; open PR.

---

## Self-Review

**Spec coverage:** §1 slot model → Task 1; §2 generation → Task 3; resolution → Task 2; render → Tasks 4/7; §3 solver guard → Task 6; §4 TimeslotID numbering → Tasks 3/5; §5 migration → Tasks 5 (pure) + 9 (script); §6 consumers → Tasks 7/8/10; §7 testing → per-task + Task 11.

**Placeholder scan:** Tasks 4, 6, 7, 8, 10 use prose-spec steps (not full code) because they are wiring/UI/DB-coupled with many call sites the implementer must discover via Serena — each names exact files, the exact transform, and a verification gate. Tasks 1–3, 5 (the pure logic + migration mappers) carry complete code + TDD. No "TBD/handle edge cases" placeholders.

**Type consistency:** `SlotConfig { duration; breakGroups? }`, `isBreakForGrade(slotNumber, gradeId, slots, index)`, `isBreakForTeacher(slotNumber, slots)`, `isBreakSlot(slotNumber, slots)`, `configToSlots`, `remapTimeslotId(oldId, breakSlotNumbers)` — consistent across Tasks 1–9.

**Risks flagged:** Task 9 ordering (new timeslots must exist before remapping FKs) and the `remapTimeslotId` formula (period + breaks-at-or-before) are the load-bearing pieces — both unit-tested in Task 5 before the DB script runs, and dry-run-first in Task 9.
