# Phase 2A — Per-Slot Durations + Breaks as Real Slots — Design

**Date**: 2026-06-01
**Author**: Napat Phobutdee
**Status**: Draft
**Predecessor**: `2026-06-01-break-resolution-core-design.md` (Phase 1 — DB-authoritative break group resolution, merged in #265)

---

## Context

Phase 1 made break **detection** DB-authoritative: a grade's break group resolves from `break_group_grade`, and `isBreakForGrade`/`buildGradeGroupIndex` render the right break per grade. But the underlying timetable model is still limited:

- **One global `Duration`** — every period is the same length; no short recess slot, no longer activity period.
- **Breaks are elastic gaps** — a "staggered" lunch is just dead time for everyone; the 50-min junior-lunch gap is **not** a slot senior can use. Staggering is visual-only, not real occupancy.
- Breaks aren't first-class — not in solver occupancy, not lockable.

Phase 2 drivers (selected): **variable period durations**, **breaks as placeable/occupying activities**, **flexible staggered groups**. Decisions made during brainstorming:

- **Shared slot grid** — all grades share one set of slot start/end times; staggering = different groups break in different *slots* of that grid (junior breaks at slot 4 while senior has class there).
- **Config-derived, materialized** — admin configures break rules; the system materializes breaks as first-class occupancy (block solver per-grade, locked, rendered uniformly). No manual per-cell dragging.
- **Unified slot array** — one ordered `slots[]` array is the day's structure.
- **Remap migration** — existing semesters are migrated (timeslots regenerated, `class_schedule` remapped), not left on a dual model.

This is **Phase 2A**: the data-model + generation foundation that makes break slots *real*. It is one of three sub-specs:

- **2A (this spec)** — per-slot durations, breaks-as-real-slots, generation, per-grade resolution from slots, minimal solver guard, migration.
- **2B** — first-class break *integration*: conflict detection, lock-system, occupancy/analytics views, richer staggered-occupancy UX.
- **2C** — flexible-group config wizard UX + fully unified per-grade rendering across the custom dashboard views (absorbs `wgr`).

**Explicitly out of scope for 2A:** per-day different layouts (every day shares `slots[]`); manual break placement; the 2B integration polish; the 2C wizard rework.

---

## Section 1 — Slot model

`config.slots` replaces `Duration`, `TimeslotPerDay`, and `breakDefinitions`:

```typescript
type SlotConfig = {
  duration: number;          // minutes (per-slot)
  breakGroups?: string[];    // break_group.Name refs that break in this slot;
                             // ["*"] = universal (recess); absent/[] = pure teaching slot
};

type ConfigData = {
  Days: DayOfWeek[];
  StartTime: string;         // "HH:MM" — day start; slot clock times = StartTime + cumulative durations
  slots: SlotConfig[];       // ordered; identical structure every day
  // REMOVED: Duration, TimeslotPerDay, breakDefinitions
};
```

- The `break_group` / `break_group_grade` tables (Phase 1) are unchanged — they map group names → grades.
- A grade `g` **breaks at slot `i`** iff `slots[i].breakGroups` includes `"*"` **or** includes a group name whose `break_group_grade` set contains `g`. This is exactly Phase 1's rule, with the source moved from `breakDefinitions[]` to `slots[].breakGroups`.
- `buildGradeGroupIndex(BreakGroup[]) → Map<gradeId, Set<groupName>>` is reused unchanged.

### Duration model: "same by default, overrides allowed"
`slots[].duration` stores each slot's **resolved** length, so the data model is uniform and generation just reads it. But teaching periods are **usually all the same length**, with only occasional exceptions (a short homeroom, a long activity block). So:

- The admin sets **one default period length** (e.g. 50 min). The wizard pre-fills every teaching slot's `duration` with that default; the admin overrides only the exceptional periods.
- **Breaks always carry their own length** (10-min recess, 50-min lunch) — never tied to the teaching default.
- The default-fill + per-slot override controls are **wizard UX (2C)**. 2A's data model only needs `slots[].duration` (resolved) and a sensible default-fill in whatever minimal create flow 2A ships. No separate `defaultDuration` field is stored — the default is a wizard input, not persisted config.

### Validation rules
- `slots.length >= 1`; every `duration >= 1`.
- `breakGroups` entries must be `"*"` or an existing `break_group.Name` for the config.
- At least one teaching slot (a slot with no universal break) — a config that is all-universal-break is rejected.

---

## Section 2 — Generation

`generateTimeslots(config)` rewrite:

```
for each day in Days:
  slotStart = parse(StartTime)
  for i in 0..slots.length-1:
    end = slotStart + slots[i].duration
    push timeslot {
      TimeslotID: generateTimeslotId(semester, year, day, i+1),   // slot index, 1-based, INCLUDES break slots
      DayOfWeek: day,
      StartTime: slotStart,
      EndTime: end,
      Breaktime: slots[i].breakGroups?.includes("*") ? BREAK : NOT_BREAK,
    }
    slotStart = end
```

Key differences from today:
- **Every slot is a real timeslot** (no gaps). Universal-break slots are real timeslots no grade uses.
- **Per-slot duration** — `EndTime` uses `slots[i].duration`, not a global value.
- `Breaktime` is `BREAK` only for **universal** breaks (the aggregate `isBreakSlot` signal). Staggered breaks stay `NOT_BREAK` because their break-ness is per-grade (resolved from `slots[].breakGroups`), and the slot is teaching-capable for non-breaking grades.

### `isBreakForGrade` adaptation
Phase 1 signature `isBreakForGrade(slotNumber, gradeId, defs, index)` becomes
`isBreakForGrade(slotNumber, gradeId, slots, index)` — it checks `slots[slotNumber-1].breakGroups` against `"*"` / the grade's groups. `isBreakForTeacher` and `isBreakSlot` adapt likewise (teacher/aggregate care only about `"*"`). Callers updated to pass `slots` instead of `breakDefinitions`.

---

## Section 3 — Solver guard (correctness-critical → in 2A)

Because break slots are now **real timeslots**, the arrange solver and drag-validation would otherwise treat them as placeable and drop a class into a recess or onto a grade's lunch. 2A adds the minimal guard:

- `validate-drop.action` — reject a drop where the target grade breaks at that slot (`isBreakForGrade` true).
- `auto-arrange` (`auto-arrange.action` + `domain/auto-arrange`) — exclude `(grade, slot)` cells where the grade breaks, from the candidate placement set.

This is the *minimal* "don't place in a break" rule. Richer integration (conflict-detector surfacing breaks, lock templates, occupancy/analytics counting break slots) is **2B**.

---

## Section 4 — TimeslotID & numbering

- `TimeslotID` encodes the **slot index** (1-based, including break slots). So inserting break slots changes the numbering relative to the old teaching-only numbering.
- Display period numbering (teaching periods, breaks excluded) is already computed per-grade by `buildGridRows` (Phase 1) — unchanged; it renumbers teaching slots and skips break rows per grade.
- Consequence: existing `class_schedule.TimeslotID` values (old numbering) must be **remapped** — see Section 5.

---

## Section 5 — Migration (highest risk; remap existing + new)

Existing semesters have: `Config` with `{ Duration, TimeslotPerDay, breakDefinitions }`, generated teaching-only timeslots, and `class_schedule` rows FK'd to those `TimeslotID`s.

**Migration steps (one idempotent script, dry-run first):**

1. **Config → slots:** build `slots[]` by interleaving teaching periods (`duration = Duration`) with break slots derived from `breakDefinitions` (each def → a slot at its position with `duration = def.duration`, `breakGroups = def.groups`), ordered by slot position. Write `slots`; remove `Duration`/`TimeslotPerDay`/`breakDefinitions`.
2. **Compute old→new TimeslotID map:** old teaching period *P* maps to the new slot index that the same teaching period occupies once break slots are inserted (computable from the old break positions).
3. **Regenerate timeslots** under the new model (real break slots).
4. **Remap `class_schedule.TimeslotID`** old→new using the map; remap any other `TimeslotID` FKs (locks, etc.).
5. Idempotent (safe to re-run); dry-run mode logs the planned remap + counts before writing; wrap per-config in a transaction.

**Risk:** this is the Phase-1-backfill-level operation of 2A. The old→new map MUST be exact or class placements shift. Tests: a fixture config with known break positions, asserting every old TimeslotID maps to a new slot whose teaching-period identity is preserved, and that no `class_schedule` row is orphaned.

---

## Section 6 — Consumer impact

| Area | Change |
|---|---|
| `config-data.types.ts`, `config-validation.schemas.ts`, `config.constants.ts` | `slots[]` replaces `Duration`/`TimeslotPerDay`/`breakDefinitions` |
| `timeslot.service.ts` `generateTimeslots` | rewrite per Section 2 |
| `break-utils.ts` (`isBreakForGrade`/`isBreakForTeacher`/`isBreakSlot`) | read `slots[]` instead of `breakDefinitions[]` |
| `break-rows.ts` / `TimeslotGrid` | source breaks from `slots`; otherwise per-grade logic unchanged |
| `validate-drop.action`, `auto-arrange` (+ domain solver) | skip per-grade break slots |
| migration script | new (Section 5) |
| `seed.ts` | emit `slots[]` configs (replace `Duration`/break gap config) |
| Wizard (`TimeslotConfigurationStep`) | **2C** — left on a compatibility shim or minimally adjusted in 2A to read/write `slots` for create; full UX rework is 2C |

`wgr` (dashboard generic break rendering) is **partially** addressed: 2A makes the per-grade data correct from `slots`; the dashboard student-table's custom cell rendering is fully unified in 2C.

---

## Section 7 — Testing

- `generateTimeslots`: per-slot durations produce correct cumulative `StartTime`/`EndTime`; universal-break slot → `Breaktime=BREAK`; staggered slot → `NOT_BREAK`; every slot emitted as a real timeslot.
- `isBreakForGrade`/`isBreakSlot` over `slots[]`: universal, group-specific, multi-wave, grade-in-no-group.
- Solver guard: `validate-drop` rejects a class on a grade's break slot; `auto-arrange` never places on a break slot; staggered slot still placeable for the non-breaking grade.
- Migration: fixture config → exact old→new TimeslotID map; no orphaned `class_schedule`; idempotent re-run is a no-op; dry-run writes nothing.
- Full suite (`pnpm test`) green; `pnpm typecheck` clean.

---

## Spec self-review

- ✅ No placeholders/TBDs.
- ✅ Single source: `slots[]` replaces three fields; break group→grade mapping stays in DB (Phase 1).
- ✅ Shared-grid + config-derived + unified-array + remap decisions all reflected.
- ✅ Solver guard scoped into 2A for correctness (real break slots can't be left placeable); richer integration deferred to 2B with a clear boundary.
- ✅ Migration is the explicit highest risk, with dry-run + idempotency + exact-map tests.
- ⚠️ `TimeslotID` renumbering is the load-bearing migration assumption — if the old→new map is wrong, class placements shift. Mitigation: fixture-based exact-map tests before running on real data (mirrors Phase 1's backfill discipline).
- ⚠️ Wizard (`TimeslotConfigurationStep`) is only minimally touched in 2A (enough to create `slots` configs); the real UX is 2C. 2A must not leave the wizard able to write the *old* shape.
