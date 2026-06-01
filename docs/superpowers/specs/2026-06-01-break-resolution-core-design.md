# Break Resolution Core — Design (Phase 1)

**Date**: 2026-06-01
**Author**: Napat Phobutdee
**Status**: Draft
**Predecessor**: `2026-05-03-break-system-rework-design.md` (this completes that rework's unfinished read path)

---

## Overview

The break-system rework (2026-05-03) migrated the **write** path to V2 — arbitrary
named `break_group`s with per-grade assignments (`break_group_grade`) plus a `BREAK`
enum value. The **read** path was never finished: runtime break detection
(`isBreakForGrade`, `buildGridRows` class mode) still resolves a grade's break group
by **hardcoded tier math** — `gradeLevel <= 3` = "junior", `gradeLevel >= 4` = "senior",
plus `"*"`. Any custom group (e.g. `"กลุ่ม-ก"` assigned to a handful of grades) is
invisible to detection: its breaks silently fail to render for those grades.

Break groups are also stored **twice** — in the `break_group`/`break_group_grade` DB
tables *and* as a `breakGroups` array inside `table_config.Config` JSON — with the
render path consuming neither (it only receives `gradeLevel`/`gradeId`).

**This phase** makes the DB tables the single source of truth, rewrites detection to
resolve a grade's groups from the real assignment map, deletes the hardcoded tier math,
removes the duplicate JSON store, and replaces the `any[]` typing around break groups.

### Scope boundary

- **In scope:** group resolution (DB-authoritative), detection rewrite, JSON
  `breakGroups` removal, typing, backfill, tests.
- **Out of scope (explicit):**
  - Legacy `breaktime` enum values (`BREAK_JUNIOR/SENIOR/BOTH`) — a separate DB data
    migration, cleaner on its own.
  - Per-day / staggered / varied break shapes — **Phase 2**.
  - Config UX rework — **Phase 3**.
  - "Break as subject" model — parked as the lead Phase 2 candidate.

### Phase 2 forward-note (not built here)

If Phase 2 adopts "break as subject", `table_config` must move from a single global
`Duration` to **per-slot editable duration** (each period its own length). That field
makes short recess breaks viable as real slots. Phase 1 leaves `Duration` untouched and
is duration-agnostic, so it does not block this. Recorded here so the decision is not
lost.

---

## Section 1 — Architecture: the resolution model

One **pure resolver** turns DB break groups into a lookup; all detection consumes the
lookup instead of grade-level math.

```
break_group (+ grades)  ──►  buildGradeGroupIndex()  ──►  Map<gradeId, Set<groupName>>
                                                              │
breakDefinitions[] (Config JSON) ─────────────────────────────┤
                                                              ▼
                                  isBreakForGrade(slotNumber, gradeId, defs, index)
```

**Detection rule** (replaces all tier math):

> A break definition applies to a grade's slot when `def.groups` includes `"*"`
> **or** `def.groups` intersects `index.get(gradeId)`.

`"junior"`/`"senior"` stop being magic strings — they become ordinary `break_group.Name`
values whose membership is whatever `break_group_grade` records. A custom group resolves
through the identical path.

**Why pure:** the DB join lives at the page/action boundary; the resolver and
`isBreakForGrade` take plain data (`BreakGroup[]`, `Map`) and never import Prisma or
React. Trivially unit-testable.

---

## Section 2 — Components & types

Five units, each one responsibility:

| Unit | File | Responsibility |
|---|---|---|
| `BreakGroup` type | `src/features/timeslot/domain/models/break.types.ts` | `{ name: string; label: string; color: string; gradeIds: string[] }` — replaces every `breakGroups?: any[]` |
| `buildGradeGroupIndex` | `src/utils/break-utils.ts` | Pure `BreakGroup[] → Map<gradeId, Set<groupName>>`. Sole place membership is computed. |
| `isBreakForGrade` (rewrite) | `src/utils/break-utils.ts` | `(slotNumber: number, gradeId: string, defs: BreakDefinition[], index: Map<string, Set<string>>) → boolean`. Drops `breaktime` and `gradeLevel` params. |
| `buildGridRows` class branch (rewrite) | `src/lib/ui/break-rows.ts` | `pickApplicable` class mode filters defs via resolved `groupNames` instead of `gradeLevel`. |
| `getBreakContext(configId)` | new server action (`src/features/timeslot/application/actions/`) | Returns `{ breakDefinitions: BreakDefinition[]; groups: BreakGroup[]; index: Map<string, Set<string>> }` — one call per page instead of join + parse. |

`isBreakForTeacher` and `isBreakSlot` keep their behavior (teacher/all views only care
about `"*"`) but lose their `any` edges.

**`ViewMode` change** (`break-rows.ts`): class variant swaps
`{ mode: "class"; gradeId; gradeLevel }` → `{ mode: "class"; gradeId; groupNames: string[] }`.

**Resolver signature**

```typescript
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
      (d.groups.includes("*") || (!!groups && d.groups.some((name) => groups.has(name)))),
  );
}
```

**Performance:** index is built once per page render and passed down, not recomputed
per cell (current tier math runs in every `isBreakForGrade` call across the grid).

---

## Section 3 — Call-site plumbing, write path, migration

### Call sites

| Need the index (per-grade) | `"*"`-only (no index) |
|---|---|
| `student-table/.../component/Timeslot.tsx` | `teacher-table/.../component/Timeslot.tsx` |
| `(public)/classes/[gradeId]/[academicYear]/[semester]/page.tsx` | `(public)/teachers/[id]/[academicYear]/[semester]/page.tsx` |
| `components/schedule/TimeslotGrid.tsx` class mode (`buildGridRows`) | `all-timeslot/AllTimeslotClient.tsx` |

Per-grade sites call `getBreakContext(configId)` upstream and pass resolved `groupNames`
(or the index) down. `"*"`-only sites change type only, not logic.

### Write path — collapse JSON `breakGroups` to DB-only

- `timeslot.actions.ts` already writes groups to DB (`createWithGrades`) — keep.
- Stop persisting `breakGroups` into Config JSON, remove the field from:
  - `config.actions.ts:284` (drop from `generateTimeslots` call)
  - `timeslot.service.ts:54` (`generateTimeslots` signature — generation needs only def
    `slotNumber`, not groups)
  - `config-data.types.ts:59`
  - `config.constants.ts:102`
  - `config-validation.schemas.ts:48`
- Wizard `TimeslotConfigurationStep.tsx:84` and `ConfigSummaryClient.tsx:191` read groups
  from DB (`getBreakGroups`) instead of `initialConfig?.breakGroups` / `parsed.breakGroups`.

### Migration / backfill

**Risk:** a break def referencing group `"junior"` with no `break_group` row resolves to
an empty set → its breaks silently vanish for those grades.

**Backfill step (runs before/with JSON field removal):** for each config, ensure a
`break_group` row exists per group name referenced by its `breakDefinitions`; seed from
the JSON `breakGroups` copy where present, else the default junior/senior preset. Most
configs already have DB rows (the timeslot wizard writes them on save), so this is a
reconciliation guard, not a mass rewrite. Reconcile *before* deleting the JSON field so
any disagreement surfaces at backfill time, not at render time.

---

## Section 4 — Testing

- `src/utils/break-utils.test.ts`: rewrite for index-based `isBreakForGrade`. **Add the
  custom-group case** (arbitrary group assigned to specific grades renders its breaks) —
  the regression lock for the bug this phase fixes.
- `src/lib/ui/break-rows.test.ts`: class-mode fixtures (currently lines ~59/71/120 use
  `gradeLevel`) switch to `groupNames`. Legacy empty-defs `"พัก"` fallback row stays.
- New `buildGradeGroupIndex` unit tests: overlapping grades across groups, empty groups,
  a grade belonging to no group (returns `undefined` → no break).

---

## Spec self-review

- ✅ No placeholders or TBDs.
- ✅ Single source of truth: DB tables authoritative; JSON `breakGroups` removed in same
  phase. No derived cache reintroduced.
- ✅ Detection signature drops dead params (`breaktime`, `gradeLevel`); domain stays pure
  (no Prisma/React import in resolver or detector).
- ✅ Backward compatible behavior for default junior/senior: same group names, membership
  now sourced from `break_group_grade` instead of tier math — identical result when the
  default preset's grade assignments match the old tiers.
- ✅ Backfill reconciles the two stores before the JSON field is deleted.
- ✅ Scope boundaries explicit: enum cleanup, per-day shapes, UX, and break-as-subject all
  deferred with named phases.
- ⚠️ `table_config.Config` JSON still has no DB-level validation for `breakDefinitions` —
  application-layer Valibot remains the enforcement mechanism (unchanged from predecessor
  spec; consistent with how Config JSON is already used).
