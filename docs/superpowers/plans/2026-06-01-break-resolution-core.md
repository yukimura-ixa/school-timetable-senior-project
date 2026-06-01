# Break Resolution Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make break detection resolve a grade's break group(s) from the real `break_group_grade` DB assignments instead of hardcoded junior/senior grade-level math, and make the DB tables the single source of truth (removing the duplicate `breakGroups` store in Config JSON).

**Architecture:** A pure resolver `buildGradeGroupIndex(BreakGroup[]) → Map<gradeId, Set<groupName>>` feeds a rewritten `isBreakForGrade(slotNumber, gradeId, defs, index)`. The DB join lives in a server action (`getBreakContext`); the domain utils stay Prisma-free and take plain data. `breakGroups` is removed from `table_config.Config` JSON; the wizard and summary read groups from the `break_group` tables.

**Tech Stack:** Next.js 16 (App Router, RSC + server actions), Prisma, Valibot, MUI, **Vitest** (these modules import `vitest`, not jest).

**Spec:** `docs/superpowers/specs/2026-06-01-break-resolution-core-design.md`

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `src/features/timeslot/domain/models/break.types.ts` | `BreakDefinition` + new `BreakGroup` type | Modify |
| `src/utils/break-utils.ts` | Pure resolver + detection (`buildGradeGroupIndex`, `isBreakForGrade`, `isBreakForTeacher`, `isBreakSlot`) | Modify |
| `src/utils/break-utils.test.ts` | Resolver + detection unit tests | Modify |
| `src/lib/ui/break-rows.ts` | `buildGridRows` + `ViewMode` (class mode → `groupNames`) | Modify |
| `src/lib/ui/break-rows.test.ts` | Grid-row builder tests | Modify |
| `src/features/timeslot/infrastructure/repositories/break-group.repository.ts` | DB access (already has `findByConfigId`) | Read-only ref |
| `src/features/timeslot/application/actions/timeslot.actions.ts` | New `getBreakContextAction` | Modify |
| `src/features/timeslot/domain/services/break-context.ts` | New: pure `toBreakGroups(rows)` mapper | Create |
| `src/features/timeslot/domain/services/break-context.test.ts` | Mapper test | Create |
| `src/app/dashboard/.../student-table/component/Timeslot.tsx` | Per-grade break render | Modify |
| `src/app/dashboard/.../student-table/page.tsx` | Pass `breakGroups` to Timeslot | Modify |
| `src/app/dashboard/.../teacher-table/component/Timeslot.tsx` | `"*"`-only render (type only) | Modify |
| `src/app/(public)/classes/[gradeId]/[academicYear]/[semester]/page.tsx` | Per-grade public view | Modify |
| `src/components/schedule/TimeslotGrid.tsx` | Shared grid (uses `ViewMode`) | Modify |
| `src/features/timeslot/domain/services/timeslot.service.ts` | `generateTimeslots` — drop `breakGroups` param | Modify |
| `src/features/config/application/actions/config.actions.ts` | Drop `breakGroups` from generate call | Modify |
| `src/features/config/domain/types/config-data.types.ts` | Drop `breakGroups` field | Modify |
| `src/features/config/domain/constants/config.constants.ts` | Drop `breakGroups` field | Modify |
| `src/features/config/application/schemas/config-validation.schemas.ts` | Drop `breakGroups` field | Modify |
| `src/app/dashboard/_components/TimeslotConfigurationStep.tsx` | Load groups from DB action | Modify |
| `src/app/schedule/.../config/_components/ConfigSummaryClient.tsx` | Group count from DB | Modify |
| `prisma/migration-backfill-break-groups.ts` | One-time backfill guard | Create |

**Type contract used across tasks:**

```typescript
// break.types.ts
export type BreakGroup = {
  name: string;       // break_group.Name — referenced by BreakDefinition.groups
  label: string;      // break_group.Label
  color: string;      // break_group.Color
  gradeIds: string[]; // break_group_grade.GradeID[]
};
```

```typescript
// break-utils.ts signatures (final)
export function buildGradeGroupIndex(groups: BreakGroup[]): Map<string, Set<string>>;
export function isBreakForGrade(
  slotNumber: number,
  gradeId: string,
  defs: BreakDefinition[],
  index: Map<string, Set<string>>,
): boolean;
```

---

## Task 1: `BreakGroup` type + `buildGradeGroupIndex` resolver

**Files:**
- Modify: `src/features/timeslot/domain/models/break.types.ts`
- Modify: `src/utils/break-utils.ts`
- Test: `src/utils/break-utils.test.ts`

- [ ] **Step 1: Add the `BreakGroup` type**

In `src/features/timeslot/domain/models/break.types.ts`, after the existing `BreakDefinition` type, add:

```typescript
export type BreakGroup = {
  name: string;       // break_group.Name — referenced by BreakDefinition.groups
  label: string;      // break_group.Label
  color: string;      // break_group.Color
  gradeIds: string[]; // break_group_grade.GradeID[]
};
```

- [ ] **Step 2: Write the failing test for `buildGradeGroupIndex`**

In `src/utils/break-utils.test.ts`, add at the top imports:

```typescript
import { buildGradeGroupIndex } from "./break-utils";
import type { BreakGroup } from "@/features/timeslot/domain/models/break.types";
```

Add this describe block:

```typescript
describe("buildGradeGroupIndex", () => {
  const junior: BreakGroup = { name: "junior", label: "ม.ต้น", color: "#4CAF50", gradeIds: ["M1-1", "M2-1"] };
  const senior: BreakGroup = { name: "senior", label: "ม.ปลาย", color: "#2196F3", gradeIds: ["M5-1"] };
  const custom: BreakGroup = { name: "band", label: "วงโยธวาทิต", color: "#9C27B0", gradeIds: ["M2-1"] };

  it("maps each grade to the set of groups it belongs to", () => {
    const index = buildGradeGroupIndex([junior, senior]);
    expect([...(index.get("M1-1") ?? [])]).toEqual(["junior"]);
    expect([...(index.get("M5-1") ?? [])]).toEqual(["senior"]);
  });

  it("allows a grade to belong to multiple groups", () => {
    const index = buildGradeGroupIndex([junior, custom]);
    expect(index.get("M2-1")).toEqual(new Set(["junior", "band"]));
  });

  it("returns undefined for a grade in no group", () => {
    const index = buildGradeGroupIndex([junior]);
    expect(index.get("M6-9")).toBeUndefined();
  });

  it("handles an empty group list", () => {
    expect(buildGradeGroupIndex([]).size).toBe(0);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm test src/utils/break-utils.test.ts`
Expected: FAIL — `buildGradeGroupIndex is not a function` / not exported.

- [ ] **Step 4: Implement `buildGradeGroupIndex`**

In `src/utils/break-utils.ts`, update the import line and add the function at the top of the file (after imports):

```typescript
import type { BreakDefinition, BreakGroup } from "@/features/timeslot/domain/models/break.types";

export function buildGradeGroupIndex(groups: BreakGroup[]): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const g of groups) {
    for (const gradeId of g.gradeIds) {
      const set = index.get(gradeId) ?? new Set<string>();
      set.add(g.name);
      index.set(gradeId, set);
    }
  }
  return index;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm test src/utils/break-utils.test.ts`
Expected: PASS (the new `buildGradeGroupIndex` block; existing `isBreakSlot` tests still pass).

- [ ] **Step 6: Commit**

```bash
git add src/features/timeslot/domain/models/break.types.ts src/utils/break-utils.ts src/utils/break-utils.test.ts
git commit -m "feat(break): add BreakGroup type and buildGradeGroupIndex resolver"
```

---

## Task 2: Rewrite `isBreakForGrade` to index-based detection

**Files:**
- Modify: `src/utils/break-utils.ts:8-33` (current `isBreakForGrade`)
- Test: `src/utils/break-utils.test.ts`

- [ ] **Step 1: Write the failing test (includes the custom-group regression lock)**

In `src/utils/break-utils.test.ts`, add:

```typescript
import { isBreakForGrade } from "./break-utils";

describe("isBreakForGrade", () => {
  const defs: BreakDefinition[] = [
    { id: "lunch-junior", label: "พักเที่ยง ม.ต้น", slotNumber: 4, duration: 50, color: "#4CAF50", groups: ["junior"] },
    { id: "lunch-senior", label: "พักเที่ยง ม.ปลาย", slotNumber: 5, duration: 50, color: "#2196F3", groups: ["senior"] },
    { id: "morning", label: "พักเช้า", slotNumber: 3, duration: 10, color: "#FF9800", groups: ["*"] },
    { id: "band-break", label: "พักวง", slotNumber: 6, duration: 20, color: "#9C27B0", groups: ["band"] },
  ];
  const index = buildGradeGroupIndex([
    { name: "junior", label: "ม.ต้น", color: "#4CAF50", gradeIds: ["M1-1"] },
    { name: "senior", label: "ม.ปลาย", color: "#2196F3", gradeIds: ["M5-1"] },
    { name: "band", label: "วง", color: "#9C27B0", gradeIds: ["M1-1"] }, // M1-1 is junior AND band
  ]);

  it("matches a group break for a grade in that group", () => {
    expect(isBreakForGrade(4, "M1-1", defs, index)).toBe(true);  // junior lunch
    expect(isBreakForGrade(5, "M5-1", defs, index)).toBe(true);  // senior lunch
  });

  it("does not match a group break for a grade outside the group", () => {
    expect(isBreakForGrade(4, "M5-1", defs, index)).toBe(false); // senior is not junior
    expect(isBreakForGrade(5, "M1-1", defs, index)).toBe(false);
  });

  it("matches a universal (*) break for any grade", () => {
    expect(isBreakForGrade(3, "M1-1", defs, index)).toBe(true);
    expect(isBreakForGrade(3, "M5-1", defs, index)).toBe(true);
  });

  it("REGRESSION: resolves arbitrary custom groups, not just junior/senior", () => {
    // M1-1 belongs to the custom 'band' group → its slot-6 break must render.
    expect(isBreakForGrade(6, "M1-1", defs, index)).toBe(true);
    // M5-1 is not in 'band' → no slot-6 break.
    expect(isBreakForGrade(6, "M5-1", defs, index)).toBe(false);
  });

  it("returns false for a grade in no group at a non-universal slot", () => {
    expect(isBreakForGrade(4, "M9-9", defs, index)).toBe(false);
    expect(isBreakForGrade(3, "M9-9", defs, index)).toBe(true); // universal still applies
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/utils/break-utils.test.ts`
Expected: FAIL — current `isBreakForGrade` has signature `(breaktime, gradeLevel, slotNumber, breakDefinitions?, gradeId?)`, so calls with the new 4-arg shape fail type/behaviour.

- [ ] **Step 3: Replace `isBreakForGrade` body**

In `src/utils/break-utils.ts`, replace the entire current `isBreakForGrade` function (the V1 junior/senior version) with:

```typescript
/**
 * Whether a break definition applies to a specific grade at a slot.
 * Membership comes from the resolved grade→group index (built from the
 * break_group_grade DB assignments), NOT hardcoded grade-level tiers.
 * A definition applies when its groups include "*" or intersect the grade's groups.
 */
export function isBreakForGrade(
  slotNumber: number,
  gradeId: string,
  defs: BreakDefinition[],
  index: Map<string, Set<string>>,
): boolean {
  const groups = index.get(gradeId);
  return defs.some(
    (d) =>
      d.slotNumber === slotNumber &&
      (d.groups.includes("*") ||
        (!!groups && d.groups.some((name) => groups.has(name)))),
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/utils/break-utils.test.ts`
Expected: PASS (all `isBreakForGrade` + `buildGradeGroupIndex` + `isBreakSlot` blocks).

- [ ] **Step 5: Commit**

```bash
git add src/utils/break-utils.ts src/utils/break-utils.test.ts
git commit -m "feat(break): rewrite isBreakForGrade to index-based group resolution"
```

---

## Task 3: Rewrite `buildGridRows` class mode + `ViewMode`

**Files:**
- Modify: `src/lib/ui/break-rows.ts`
- Test: `src/lib/ui/break-rows.test.ts`

- [ ] **Step 1: Update the failing class-mode tests**

In `src/lib/ui/break-rows.test.ts`, replace the two class-view tests (`class view ม.1` and `class view ม.5`) and the legacy-fallback test's `view` arg so they pass `groupNames` instead of `gradeLevel`, and add a custom-group test:

```typescript
it("class view junior group: shows junior break, hides senior break", () => {
  const rows = buildGridRows(slots, [junior, senior], {
    mode: "class",
    gradeId: "M1-1",
    groupNames: ["junior"],
  });
  const labels = rows
    .filter((r) => r.kind === "break")
    .flatMap((r) => (r as any).defs.map((d: BreakDefinition) => d.id));
  expect(labels).toEqual(["lunch-junior"]);
});

it("class view senior group: shows senior break, hides junior break", () => {
  const rows = buildGridRows(slots, [junior, senior], {
    mode: "class",
    gradeId: "M5-1",
    groupNames: ["senior"],
  });
  const labels = rows
    .filter((r) => r.kind === "break")
    .flatMap((r) => (r as any).defs.map((d: BreakDefinition) => d.id));
  expect(labels).toEqual(["lunch-senior"]);
});

it("class view custom group: shows a break for an arbitrary (non-tier) group", () => {
  const band: BreakDefinition = {
    id: "band-break", label: "พักวง", slotNumber: 5, duration: 20, color: "#9C27B0", groups: ["band"],
  };
  const rows = buildGridRows(slots, [junior, band], {
    mode: "class",
    gradeId: "M1-1",
    groupNames: ["junior", "band"],
  });
  const labels = rows
    .filter((r) => r.kind === "break")
    .flatMap((r) => (r as any).defs.map((d: BreakDefinition) => d.id));
  expect(labels).toEqual(["lunch-junior", "band-break"]);
});
```

In the legacy-fallback test (`legacy fallback: no breakDefinitions...`), change the `view` arg from `{ mode: "class", gradeId: "M1-1", gradeLevel: 1 }` to `{ mode: "class", gradeId: "M1-1", groupNames: [] }`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/lib/ui/break-rows.test.ts`
Expected: FAIL — `ViewMode` class variant still requires `gradeLevel`; `groupNames` is not a valid property.

- [ ] **Step 3: Update `ViewMode` and `pickApplicable`**

In `src/lib/ui/break-rows.ts`:

Replace the `ViewMode` union:

```typescript
export type ViewMode =
  | { mode: "teacher" }
  | { mode: "class"; gradeId: string; groupNames: string[] }
  | { mode: "all" };
```

Replace the `pickApplicable` function with:

```typescript
function pickApplicable(defs: BreakDefinition[], view: ViewMode): BreakDefinition[] {
  if (view.mode === "all") return defs;
  if (view.mode === "teacher") {
    return defs.filter((d) => isBreakForTeacher("BREAK", d.slotNumber, [d]));
  }
  const grade = view.gradeId;
  const index = buildGradeGroupIndex([
    { name: "__view__", label: "", color: "", gradeIds: view.groupNames.length ? [grade] : [] },
  ]);
  // Build an index where `grade` maps to its known group names directly.
  const direct = new Map<string, Set<string>>([[grade, new Set(view.groupNames)]]);
  void index;
  return defs.filter((d) => isBreakForGrade(d.slotNumber, grade, [d], direct));
}
```

Update the imports at the top of `break-rows.ts`:

```typescript
import { isBreakForGrade, isBreakForTeacher, buildGradeGroupIndex } from "@/utils/break-utils";
```

> NOTE: The `index`/`void index` scaffold above is dead — remove it. The clean version is:
> ```typescript
> function pickApplicable(defs: BreakDefinition[], view: ViewMode): BreakDefinition[] {
>   if (view.mode === "all") return defs;
>   if (view.mode === "teacher") {
>     return defs.filter((d) => isBreakForTeacher("BREAK", d.slotNumber, [d]));
>   }
>   const index = new Map<string, Set<string>>([[view.gradeId, new Set(view.groupNames)]]);
>   return defs.filter((d) => isBreakForGrade(d.slotNumber, view.gradeId, [d], index));
> }
> ```
> Use the clean version. Drop the `buildGradeGroupIndex` import if unused here.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/lib/ui/break-rows.test.ts`
Expected: PASS (all class/teacher/all/legacy blocks).

- [ ] **Step 5: Commit**

```bash
git add src/lib/ui/break-rows.ts src/lib/ui/break-rows.test.ts
git commit -m "feat(break): buildGridRows class mode resolves via groupNames not gradeLevel"
```

---

## Task 4: `toBreakGroups` mapper + `getBreakContextAction`

**Files:**
- Create: `src/features/timeslot/domain/services/break-context.ts`
- Create: `src/features/timeslot/domain/services/break-context.test.ts`
- Modify: `src/features/timeslot/application/actions/timeslot.actions.ts`

- [ ] **Step 1: Write the failing test for `toBreakGroups`**

Create `src/features/timeslot/domain/services/break-context.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { toBreakGroups } from "./break-context";

describe("toBreakGroups", () => {
  it("maps break_group rows (with grades) to BreakGroup[]", () => {
    const rows = [
      {
        BreakGroupID: 1, Name: "junior", Label: "ม.ต้น", Color: "#4CAF50", ConfigID: "1-2567",
        grades: [
          { BreakGroupGradeID: 1, BreakGroupID: 1, GradeID: "M1-1" },
          { BreakGroupGradeID: 2, BreakGroupID: 1, GradeID: "M2-1" },
        ],
      },
    ];
    expect(toBreakGroups(rows as any)).toEqual([
      { name: "junior", label: "ม.ต้น", color: "#4CAF50", gradeIds: ["M1-1", "M2-1"] },
    ]);
  });

  it("handles a group with no grades", () => {
    const rows = [
      { BreakGroupID: 9, Name: "empty", Label: "ว่าง", Color: "#000000", ConfigID: "1-2567", grades: [] },
    ];
    expect(toBreakGroups(rows as any)).toEqual([
      { name: "empty", label: "ว่าง", color: "#000000", gradeIds: [] },
    ]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/features/timeslot/domain/services/break-context.test.ts`
Expected: FAIL — `toBreakGroups` module/function does not exist.

- [ ] **Step 3: Implement `toBreakGroups`**

Create `src/features/timeslot/domain/services/break-context.ts`:

```typescript
import type { BreakGroup } from "@/features/timeslot/domain/models/break.types";

type BreakGroupRow = {
  Name: string;
  Label: string;
  Color: string;
  grades: { GradeID: string }[];
};

/** Pure mapper: break_group DB rows (with included grades) → domain BreakGroup[]. */
export function toBreakGroups(rows: BreakGroupRow[]): BreakGroup[] {
  return rows.map((r) => ({
    name: r.Name,
    label: r.Label,
    color: r.Color,
    gradeIds: r.grades.map((g) => g.GradeID),
  }));
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/features/timeslot/domain/services/break-context.test.ts`
Expected: PASS.

- [ ] **Step 5: Add `getBreakContextAction`**

In `src/features/timeslot/application/actions/timeslot.actions.ts`, after the existing `getBreakGroupsByTermAction` (ends ~line 84), add:

```typescript
/**
 * Resolve the break context for a term: the universal/grouped break definitions
 * (from config JSON) plus the DB-authoritative break groups mapped to BreakGroup[].
 * Call sites build the grade→group index from `groups` at point of use.
 */
export const getBreakContextAction = createAction(
  getTimeslotsByTermSchema,
  async (input: GetTimeslotsByTermInput) => {
    const semesterNum =
      input.Semester === "SEMESTER_1" ? "1" : input.Semester === "SEMESTER_2" ? "2" : "3";
    const configId = `${semesterNum}-${input.AcademicYear}`;
    const rows = await breakGroupRepository.findByConfigId(configId);
    return { groups: toBreakGroups(rows) };
  },
);
```

Add the import at the top of `timeslot.actions.ts`:

```typescript
import { toBreakGroups } from "../../domain/services/break-context";
```

> `breakDefinitions` already reach pages via `configData?.data?.breakDefinitions`; this action only adds the DB-sourced `groups`. Keep them as separate props — do not duplicate the config read here.

- [ ] **Step 6: Run typecheck and commit**

Run: `pnpm typecheck`
Expected: PASS (no break-context type errors).

```bash
git add src/features/timeslot/domain/services/break-context.ts src/features/timeslot/domain/services/break-context.test.ts src/features/timeslot/application/actions/timeslot.actions.ts
git commit -m "feat(break): add toBreakGroups mapper and getBreakContextAction"
```

---

## Task 5: Wire per-grade call sites to the new detection

**Files:**
- Modify: `src/app/dashboard/[academicYear]/[semester]/student-table/component/Timeslot.tsx`
- Modify: `src/app/dashboard/[academicYear]/[semester]/student-table/page.tsx`
- Modify: `src/app/(public)/classes/[gradeId]/[academicYear]/[semester]/page.tsx`

> This task changes UI render wiring. There is no unit test for the React components; verify with `pnpm typecheck` + the browser step at the end. The pure logic is already covered by Tasks 1–3.

- [ ] **Step 1: Update `student-table/component/Timeslot.tsx` props and call**

Replace the `Props` type (lines ~18-23):

```typescript
import type { BreakDefinition, BreakGroup } from "@/features/timeslot/domain/models/break.types";
import { isBreakForGrade, buildGradeGroupIndex } from "@/utils/break-utils";

type Props = {
  timeSlotData: TimeSlotTableData;
  searchGradeID: string | null;
  breakDefinitions?: BreakDefinition[];
  breakGroups?: BreakGroup[];
};
```

Destructure `breakGroups` in the component params (line ~38) and remove the now-unused `getGradeLevel`/`gradeLevel`:

```typescript
export default function TimeSlot({
  timeSlotData,
  searchGradeID,
  breakDefinitions = [],
  breakGroups = [],
}: Props) {
  const theme = useTheme();
  const breakIndex = buildGradeGroupIndex(breakGroups);
```

Delete the `getGradeLevel` helper (lines ~27-31) and the `const gradeLevel = getGradeLevel(searchGradeID);` line.

Replace the `isBreakForGrade(...)` call (lines ~265-271) with:

```typescript
const showBreak =
  isBreak ||
  (data && searchGradeID
    ? isBreakForGrade(slotNumber, searchGradeID, breakDefinitions, breakIndex)
    : false);
```

- [ ] **Step 2: Update `student-table/page.tsx` to load + pass `breakGroups`**

In `src/app/dashboard/[academicYear]/[semester]/student-table/page.tsx`, locate where `configData` is loaded. Add a call to `getBreakContextAction({ AcademicYear, Semester })` (it returns `{ success, data: { groups } }`). At both `<TimeSlot ... />` usages (lines ~729 and ~747) add the `breakGroups` prop alongside the existing `breakDefinitions`:

```tsx
breakDefinitions={configData?.data?.breakDefinitions}
breakGroups={breakContext?.data?.groups}
```

Where `breakContext` is the awaited result of `getBreakContextAction`. Match the existing data-loading pattern in this file (the same way `configData` is fetched).

- [ ] **Step 3: Update the public class page**

In `src/app/(public)/classes/[gradeId]/[academicYear]/[semester]/page.tsx`, find the break-detection / `TimeslotGrid` usage. If it renders via `TimeslotGrid` with `view: { mode: "class", ... }`, change the view to supply `groupNames` resolved from `getBreakContextAction`:

```tsx
const breakContext = await getBreakContextAction({ AcademicYear, Semester });
const groupNames = [
  ...buildGradeGroupIndex(breakContext.data?.groups ?? []).get(gradeId) ?? [],
];
// ...
<TimeslotGrid
  timeslots={timeslots}
  breakDefs={breakDefinitions}
  view={{ mode: "class", gradeId, groupNames }}
  cellsByTimeslotId={cells}
/>
```

Import `buildGradeGroupIndex` from `@/utils/break-utils` and `getBreakContextAction` from the timeslot actions. If this page instead calls `isBreakForGrade` directly, pass `(slotNumber, gradeId, breakDefinitions, buildGradeGroupIndex(groups))`.

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck`
Expected: PASS. Fix any remaining references to the old `isBreakForGrade(breaktime, gradeLevel, ...)` shape or `gradeLevel` on the class `ViewMode`.

- [ ] **Step 5: Commit**

```bash
git add "src/app/dashboard/[academicYear]/[semester]/student-table/component/Timeslot.tsx" "src/app/dashboard/[academicYear]/[semester]/student-table/page.tsx" "src/app/(public)/classes/[gradeId]/[academicYear]/[semester]/page.tsx"
git commit -m "feat(break): wire per-grade views to index-based break detection"
```

---

## Task 6: Tighten typing on `"*"`-only call sites

**Files:**
- Modify: `src/app/dashboard/[academicYear]/[semester]/teacher-table/component/Timeslot.tsx`
- Modify: `src/app/dashboard/[academicYear]/[semester]/all-timeslot/AllTimeslotClient.tsx`
- Modify: `src/app/(public)/teachers/[id]/[academicYear]/[semester]/page.tsx`

> These views only consider universal (`"*"`) breaks (`isBreakForTeacher` / `isBreakSlot`), whose signatures are unchanged. This task is type-only: replace `any[]` with `BreakDefinition[]`.

- [ ] **Step 1: Replace `any[]` break types**

In each file, change any `breakDefinitions?: any[]` / `breakGroups?: any[]` declarations to:

```typescript
import type { BreakDefinition } from "@/features/timeslot/domain/models/break.types";
// ...
breakDefinitions?: BreakDefinition[];
```

Remove any `breakGroups?: any[]` prop on these `"*"`-only views (they don't need group resolution). If `AllTimeslotClient.tsx` references `breakGroups`, drop it.

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add "src/app/dashboard/[academicYear]/[semester]/teacher-table/component/Timeslot.tsx" "src/app/dashboard/[academicYear]/[semester]/all-timeslot/AllTimeslotClient.tsx" "src/app/(public)/teachers/[id]/[academicYear]/[semester]/page.tsx"
git commit -m "refactor(break): type *-only break views with BreakDefinition[]"
```

---

## Task 7: Remove `breakGroups` from Config JSON (write path + types)

**Files:**
- Modify: `src/features/timeslot/domain/services/timeslot.service.ts:54`
- Modify: `src/features/config/application/actions/config.actions.ts:284`
- Modify: `src/features/config/domain/types/config-data.types.ts:59`
- Modify: `src/features/config/domain/constants/config.constants.ts:102`
- Modify: `src/features/config/application/schemas/config-validation.schemas.ts:48`

> Groups remain persisted to the `break_group` tables via `timeslot.actions.ts` `createWithGrades` (unchanged). This task removes the redundant JSON copy that no consumer reads anymore after Tasks 5–6.

- [ ] **Step 1: Drop `breakGroups` from `generateTimeslots`**

In `src/features/timeslot/domain/services/timeslot.service.ts`, remove the `breakGroups?: any[];` field (line ~54) from the `generateTimeslots` config param type. Confirm the function body does not reference `breakGroups` (it sequences breaks by `breakDefinitions[].slotNumber` only). If it does, remove those references.

- [ ] **Step 2: Drop `breakGroups` from the generate call**

In `src/features/config/application/actions/config.actions.ts`, remove line ~284 `breakGroups: configData.breakGroups ?? [],` from the `generateTimeslots({ ... })` call.

- [ ] **Step 3: Drop `breakGroups` from config types/constants/schema**

- `config-data.types.ts:59` — remove `breakGroups: v.optional(v.array(v.any())),`
- `config.constants.ts:102` — remove `breakGroups?: any[]; // For type safety in JSON`
- `config-validation.schemas.ts:48` — remove `breakGroups: v.optional(v.array(v.any())),`

If any default config object spreads a `breakGroups: []` literal, remove it there too.

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck`
Expected: PASS. Any remaining error points to a consumer still reading `Config.breakGroups` — convert it to read from the DB (`getBreakGroupsByTermAction` / `getBreakContextAction`).

- [ ] **Step 5: Commit**

```bash
git add src/features/timeslot/domain/services/timeslot.service.ts src/features/config/application/actions/config.actions.ts src/features/config/domain/types/config-data.types.ts src/features/config/domain/constants/config.constants.ts src/features/config/application/schemas/config-validation.schemas.ts
git commit -m "refactor(break): remove redundant breakGroups from Config JSON write path"
```

---

## Task 8: Wizard + ConfigSummary read groups from DB

**Files:**
- Modify: `src/app/dashboard/_components/TimeslotConfigurationStep.tsx`
- Modify: `src/app/schedule/[academicYear]/[semester]/config/_components/ConfigSummaryClient.tsx`

> UI wiring — verify with `pnpm typecheck` + browser step in Task 10.

- [ ] **Step 1: Wizard loads groups from DB instead of `initialConfig.breakGroups`**

In `src/app/dashboard/_components/TimeslotConfigurationStep.tsx`, the `breakGroups` state (line ~84) currently seeds from `initialConfig?.breakGroups`. Change it to seed from a `breakGroups` prop sourced by the parent via `getBreakGroupsByTermAction` (DB), falling back to the default preset when empty:

```typescript
const [breakGroups, setBreakGroups] = useState<BreakGroup[]>(
  initialBreakGroups.length > 0 ? initialBreakGroups : DEFAULT_BREAK_GROUPS,
);
```

Where `initialBreakGroups` is a new prop (typed `BreakGroup[]`) passed by the parent component. Remove the `breakGroups` field from whatever config object is submitted (line ~129/135) since groups now persist via the DB path only — the wizard's save already routes groups through `timeslot.actions` `createWithGrades`; confirm that path receives `breakGroups` state and keep it.

- [ ] **Step 2: ConfigSummary group count from DB**

In `src/app/schedule/[academicYear]/[semester]/config/_components/ConfigSummaryClient.tsx` (lines ~191-194), replace `parsed.breakGroups` with a `breakGroups` value loaded from `getBreakGroupsByTermAction` (DB) passed in as a prop. Display `{breakGroups.length} กลุ่ม`.

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/_components/TimeslotConfigurationStep.tsx "src/app/schedule/[academicYear]/[semester]/config/_components/ConfigSummaryClient.tsx"
git commit -m "feat(break): wizard and config summary read break groups from DB"
```

---

## Task 9: Backfill guard for break groups

**Files:**
- Create: `prisma/migration-backfill-break-groups.ts`

> Ensures every config has a `break_group` row per group name referenced by its `breakDefinitions`, so the flip to DB-authoritative resolution never drops a break. Idempotent.

- [ ] **Step 1: Write the backfill script**

Create `prisma/migration-backfill-break-groups.ts`:

```typescript
import { PrismaClient } from "@/prisma/generated/client";

const prisma = new PrismaClient();

const DEFAULT_GROUPS = [
  { name: "junior", label: "ม.ต้น", color: "#4CAF50", gradePrefixes: ["M1", "M2", "M3"] },
  { name: "senior", label: "ม.ปลาย", color: "#2196F3", gradePrefixes: ["M4", "M5", "M6"] },
];

async function main() {
  const configs = await prisma.table_config.findMany({
    select: { ConfigID: true, Config: true, break_groups: { select: { Name: true } } },
  });

  for (const cfg of configs) {
    const existing = new Set(cfg.break_groups.map((g) => g.Name));
    const json = (cfg.Config ?? {}) as Record<string, unknown>;
    const defs = (json.breakDefinitions ?? []) as { groups?: string[] }[];
    const referenced = new Set<string>();
    for (const d of defs) for (const g of d.groups ?? []) if (g !== "*") referenced.add(g);

    const grades = await prisma.gradelevel.findMany({ select: { GradeID: true } });

    for (const name of referenced) {
      if (existing.has(name)) continue;
      const preset = DEFAULT_GROUPS.find((p) => p.name === name);
      const gradeIds = preset
        ? grades.filter((g) => preset.gradePrefixes.some((p) => g.GradeID.startsWith(p))).map((g) => g.GradeID)
        : [];
      await prisma.break_group.create({
        data: {
          Name: name,
          Label: preset?.label ?? name,
          Color: preset?.color ?? "#9E9E9E",
          ConfigID: cfg.ConfigID,
          grades: { create: gradeIds.map((gid) => ({ GradeID: gid })) },
        },
      });
      console.log(`Backfilled group "${name}" for config ${cfg.ConfigID} (${gradeIds.length} grades)`);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

- [ ] **Step 2: Dry-run review (no DB write yet)**

Run: `pnpm typecheck`
Expected: PASS. Confirm the `table_config` relation is named `break_groups` and `gradelevel.GradeID` exists (per `prisma/schema.prisma`). Adjust field names to match the generated client if typecheck flags them.

- [ ] **Step 3: Execute backfill against the dev DB**

Run: `pnpm tsx prisma/migration-backfill-break-groups.ts`
Expected: prints `Backfilled group ...` lines for any config missing rows, or nothing if all configs already have them (the common case — the wizard writes groups on save).

- [ ] **Step 4: Commit**

```bash
git add prisma/migration-backfill-break-groups.ts
git commit -m "chore(break): backfill break_group rows referenced by breakDefinitions"
```

---

## Task 10: Full quality gates + browser verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full unit suite**

Run: `pnpm test`
Expected: PASS, including `break-utils.test.ts`, `break-rows.test.ts`, `break-context.test.ts`.

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS, no `any` left on break props, no references to removed `Config.breakGroups`.

- [ ] **Step 3: Browser verification (per CLAUDE.md — use `browser_eval`, not curl)**

Start dev server (`pnpm dev`), then with the `browser_eval` MCP tool:
1. Open a class/student timetable for a **junior** grade → confirm the junior lunch break row renders, senior lunch does not.
2. Open a **senior** grade → confirm senior lunch renders, junior does not.
3. If a custom break group exists in seed data, open a grade in it → confirm its break renders (the bug this phase fixes). If no custom group is seeded, add one via the config wizard, save, reopen the grade, and confirm.
4. Open a teacher timetable → confirm only universal (`"*"`) breaks render.

Expected: breaks render by real group membership; no console hydration/runtime errors.

- [ ] **Step 4: Final commit (if any verification fixes were needed)**

```bash
git add -A
git commit -m "test(break): verify index-based break resolution end to end"
```

---

## Self-Review

**Spec coverage:**
- §1 resolution model → Tasks 1–3 (`buildGradeGroupIndex`, `isBreakForGrade`, `buildGridRows`).
- §2 components/types → Task 1 (`BreakGroup`), Task 4 (`getBreakContext` as `getBreakContextAction` + `toBreakGroups`). Note: action returns `{ groups }` only; `breakDefinitions` keep flowing from config JSON as before — recorded in Task 4 Step 5.
- §3 call-site plumbing → Tasks 5 (per-grade) + 6 (`"*"`-only). Write path → Task 7. Wizard/summary → Task 8. Backfill → Task 9.
- §4 testing → Tasks 1–4 unit tests + Task 10 suite + browser.

**Placeholder scan:** Task 3 Step 3 deliberately shows a wrong scaffold then a NOTE with the clean version — the clean `pickApplicable` is the one to use. No other TODO/TBD.

**Type consistency:** `BreakGroup` (`name/label/color/gradeIds`) consistent across Tasks 1, 4, 5, 8. `isBreakForGrade(slotNumber, gradeId, defs, index)` consistent in Tasks 2, 3, 5. `ViewMode` class `groupNames: string[]` consistent in Tasks 3, 5.

**Deviation from spec (intentional):** `getBreakContext` returns `groups: BreakGroup[]` (plain, serializable) rather than a prebuilt `Map` — a `Map` does not cross the server-action boundary reliably; the index is built at point of use via `buildGradeGroupIndex`. Noted in the plan header.
