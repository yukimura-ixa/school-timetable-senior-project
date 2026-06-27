# Arrange Grid UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hidden/covering floating palette with a persistent side-rail beside the grid, show start–end times in the header, render breaks and locked classes as one unified immovable "locked" cell, and ensure a midday lunch break appears.

**Architecture:** The cell model (`grid-format.ts`) and the `ScheduleEntry` type are the testable core — extended first with TDD. The four parallel-route slots (`@grid`/`@palette`/`@inspector`/`@header`) and `layout.tsx` then consume the new model: palette becomes left-rail content, grid renders the new `locked` kind + time ranges + a single empty state. The drag engine, auto-arrange solver, and conflict detector are untouched; `validateDropAction` already blocks breaks + occupied slots, so it needs no change.

**Tech Stack:** Next.js 16 App Router (parallel routes), MUI, SWR, `@dnd-kit` via `ArrangeDndProvider`, Vitest.

## Global Constraints

- Package manager: **pnpm only**; single test file via `pnpm exec vitest run <path>`.
- Times are stored as zone-naive datetimes; render with **local** getters (`formatPeriodTime` already does this) — never `getUTC*`.
- Breaks come from `timeslot.Breaktime !== "NOT_BREAK"`; locks from `class_schedule.IsLocked`. No fake `class_schedule` rows for breaks.
- A `locked` cell is **never draggable and never a drop target**; breaks and locked classes share that behavior, differing only in label/icon.
- Do NOT change the drag engine, auto-arrange solver, conflict detector, or `validateDropAction` logic.
- Commit trailers (verbatim):
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FAk7DfkGKDcUKHkc5tUPT3
  ```

## File Structure

**Modify**
- `src/app/schedule/[academicYear]/[semester]/arrange/_lib/teacher-schedule.ts` — add `IsLocked` to `ScheduleEntry`.
- `src/app/schedule/[academicYear]/[semester]/arrange/_lib/grid-format.ts` — `CellKind` += `locked`; `CellState` += `lockReason`; `getCellState` unification; add `formatPeriodRange`.
- `src/app/schedule/[academicYear]/[semester]/arrange/_lib/__tests__/grid-format.test.ts` — cover the new states + range.
- `src/app/api/schedule/teacher/[id]/route.ts` and `src/app/api/schedule/class/[gradeId]/route.ts` — select `IsLocked` in the schedule query.
- `src/app/schedule/[academicYear]/[semester]/arrange/@grid/_components/*` (the grid client/cell) — render `locked` (break vs locked-class), header range, single empty state.
- `src/app/schedule/[academicYear]/[semester]/arrange/@palette/_components/PaletteClient.tsx` — left-rail card list (no floating-strip assumptions).
- `src/app/schedule/[academicYear]/[semester]/arrange/@inspector/_components/InspectorClient.tsx` — remove duplicate "เลือกครู" prompt.
- `src/app/schedule/[academicYear]/[semester]/arrange/layout.tsx` — left-rail + grid flex; remove fixed `@palette` box; responsive accordion.
- `prisma/seed.ts` (timeslot generation) — add a midday lunch `BREAK` slot.

**Unchanged (verified):** `validate-drop.action.ts` (already rejects breaks + occupied), `ArrangeDndProvider`, auto-arrange solver, conflict services.

---

### Task 1: Cell model — unify breaks + locked classes; add `IsLocked`

**Files:**
- Modify: `arrange/_lib/teacher-schedule.ts` (ScheduleEntry)
- Modify: `arrange/_lib/grid-format.ts` (CellKind, CellState, LABELS, getCellState)
- Test: `arrange/_lib/__tests__/grid-format.test.ts`

**Interfaces:**
- Produces:
  - `ScheduleEntry` gains `IsLocked?: boolean`.
  - `type CellKind = "locked" | "drop-target" | "placed" | "empty"` (replaces `"break"`).
  - `type CellState = { kind: CellKind; label: string; lockReason?: "break" | "locked-class" }`.
  - `getCellState(timeslot, entry, isOver)` returns `kind: "locked"` with `lockReason: "break"` when `timeslot.Breaktime !== "NOT_BREAK"`, or `lockReason: "locked-class"` when `entry?.IsLocked`; otherwise `drop-target` / `placed` / `empty` as before.

- [ ] **Step 1: Add `IsLocked` to `ScheduleEntry`**

In `teacher-schedule.ts`, add to the `ScheduleEntry` type (after `RoomID`):
```typescript
  IsLocked?: boolean;
```

- [ ] **Step 2: Write the failing test** (append to `grid-format.test.ts`)

```typescript
import { describe, it, expect } from "vitest";
import { getCellState } from "../grid-format";
import type { Timeslot, ScheduleEntry } from "../teacher-schedule";

const slot = (over: Partial<Timeslot> = {}): Timeslot => ({
  TimeslotID: "1-2568-MON1", DayOfWeek: "MON", Period: 1,
  StartTime: "2568-01-01T08:30:00", EndTime: "2568-01-01T09:20:00",
  Breaktime: "NOT_BREAK", ...over,
});
const entry = (over: Partial<ScheduleEntry> = {}): ScheduleEntry => ({
  ClassID: 1, TimeslotID: "1-2568-MON1", SubjectCode: "ค21101", GradeID: "M1-1",
  RoomID: 1, subject: { SubjectName: "คณิต" }, gradelevel: { GradeName: "ม.1/1" },
  room: null, ...over,
});

describe("getCellState — unified locked model", () => {
  it("marks a break timeslot as locked (reason break)", () => {
    expect(getCellState(slot({ Breaktime: "BREAK" }), undefined, false))
      .toMatchObject({ kind: "locked", lockReason: "break" });
  });
  it("marks a locked entry as locked (reason locked-class)", () => {
    expect(getCellState(slot(), entry({ IsLocked: true }), false))
      .toMatchObject({ kind: "locked", lockReason: "locked-class" });
  });
  it("break takes precedence over an entry", () => {
    expect(getCellState(slot({ Breaktime: "BREAK" }), entry({ IsLocked: true }), false))
      .toMatchObject({ kind: "locked", lockReason: "break" });
  });
  it("unlocked entry is placed; empty is empty; isOver is drop-target", () => {
    expect(getCellState(slot(), entry(), false)).toMatchObject({ kind: "placed" });
    expect(getCellState(slot(), undefined, false)).toMatchObject({ kind: "empty" });
    expect(getCellState(slot(), undefined, true)).toMatchObject({ kind: "drop-target" });
  });
});
```

- [ ] **Step 3: Run it, confirm RED**

Run: `pnpm exec vitest run "src/app/schedule/[academicYear]/[semester]/arrange/_lib/__tests__/grid-format.test.ts"`
Expected: FAIL — current `getCellState` returns `kind: "break"`, has no `lockReason`, ignores `IsLocked`.

- [ ] **Step 4: Implement** in `grid-format.ts`

```typescript
export type CellKind = "locked" | "drop-target" | "placed" | "empty";

export type CellState = {
  kind: CellKind;
  label: string;
  lockReason?: "break" | "locked-class";
};

const LABELS: Record<CellKind, string> = {
  locked: "", // label comes from lockReason at render time
  "drop-target": "วางที่นี่",
  placed: "",
  empty: "คาบว่าง",
};

export function getCellState(
  timeslot: Timeslot,
  entry: ScheduleEntry | undefined,
  isOver: boolean,
): CellState {
  if (timeslot.Breaktime !== "NOT_BREAK") {
    return { kind: "locked", label: "พัก", lockReason: "break" };
  }
  if (entry?.IsLocked) {
    return { kind: "locked", label: "", lockReason: "locked-class" };
  }
  if (isOver) return { kind: "drop-target", label: LABELS["drop-target"] };
  if (entry) return { kind: "placed", label: LABELS.placed };
  return { kind: "empty", label: LABELS.empty };
}
```

- [ ] **Step 5: Run it, confirm GREEN** (same command). Also run the existing grid-format tests in the file — update any that asserted `kind: "break"` to `kind: "locked"`.

- [ ] **Step 6: Commit**

```bash
git add "src/app/schedule/[academicYear]/[semester]/arrange/_lib/teacher-schedule.ts" "src/app/schedule/[academicYear]/[semester]/arrange/_lib/grid-format.ts" "src/app/schedule/[academicYear]/[semester]/arrange/_lib/__tests__/grid-format.test.ts"
git commit -m "feat(arrange): unify breaks + locked classes into one locked cell state"
```

---

### Task 2: `formatPeriodRange` for the header

**Files:**
- Modify: `arrange/_lib/grid-format.ts`
- Test: `arrange/_lib/__tests__/grid-format.test.ts`

**Interfaces:**
- Consumes: `formatPeriodTime` (existing).
- Produces: `formatPeriodRange(start, end): string` → `"08:30–09:20"`; if either side is empty, returns the non-empty one or `""`.

- [ ] **Step 1: Write the failing test**

```typescript
import { formatPeriodRange } from "../grid-format";

describe("formatPeriodRange", () => {
  it("joins start and end with an en dash", () => {
    expect(formatPeriodRange("2568-01-01T08:30:00", "2568-01-01T09:20:00")).toBe("08:30–09:20");
  });
  it("returns start alone if end is missing", () => {
    expect(formatPeriodRange("2568-01-01T08:30:00", undefined)).toBe("08:30");
  });
  it("returns empty string when both missing", () => {
    expect(formatPeriodRange(undefined, undefined)).toBe("");
  });
});
```

- [ ] **Step 2: Run it, confirm RED** (`formatPeriodRange is not a function`).

- [ ] **Step 3: Implement** in `grid-format.ts`

```typescript
export function formatPeriodRange(
  start: string | Date | undefined,
  end: string | Date | undefined,
): string {
  const s = formatPeriodTime(start);
  const e = formatPeriodTime(end);
  if (s && e) return `${s}–${e}`;
  return s || e || "";
}
```

- [ ] **Step 4: Run it, confirm GREEN.**

- [ ] **Step 5: Commit**

```bash
git add "src/app/schedule/[academicYear]/[semester]/arrange/_lib/grid-format.ts" "src/app/schedule/[academicYear]/[semester]/arrange/_lib/__tests__/grid-format.test.ts"
git commit -m "feat(arrange): formatPeriodRange for start–end header times"
```

---

### Task 3: Surface `IsLocked` from the schedule APIs

**Files:**
- Modify: `src/app/api/schedule/teacher/[id]/route.ts`
- Modify: `src/app/api/schedule/class/[gradeId]/route.ts`

**Interfaces:**
- Produces: each schedule entry returned by these routes includes `IsLocked: boolean` (mapped from `class_schedule.IsLocked`), so the grid's `ScheduleEntry` carries it.

- [ ] **Step 1: Read both routes** to find the `class_schedule` query and the response mapping. Each selects fields for `ScheduleEntry`.

- [ ] **Step 2: Add `IsLocked` to the Prisma `select` (or confirm it's already returned)** and to the mapped response object. Example (match the file's existing shape):

```typescript
// in the prisma.class_schedule.findMany({ select: { ... } })
IsLocked: true,
// in the response map
IsLocked: row.IsLocked,
```

- [ ] **Step 3: Verify** — `pnpm typecheck 2>&1 | grep -E "api/schedule"` prints nothing. If the routes have tests, run them; otherwise verify in Task 7's browser pass that a locked entry renders as locked.

- [ ] **Step 4: Commit**

```bash
git add "src/app/api/schedule/teacher/[id]/route.ts" "src/app/api/schedule/class/[gradeId]/route.ts"
git commit -m "feat(arrange): include IsLocked in schedule API responses"
```

---

### Task 4: Grid rendering — locked cells, time ranges, single empty state

**Files:**
- Modify: the grid client under `arrange/@grid/_components/` (and `@grid/page.tsx` if it holds rendering)
- Modify: `arrange/@inspector/_components/InspectorClient.tsx` (remove its duplicate prompt)

**Interfaces:**
- Consumes: `getCellState` (returns `locked` + `lockReason`), `formatPeriodRange`, `DAY_FULL_LABEL`.

- [ ] **Step 1: Read the `@grid` client** to find where it calls `getCellState` and renders each cell + the header row + the empty-state alert.

- [ ] **Step 2: Render the `locked` kind.** Where the cell switches on `state.kind`:
  - `locked` + `lockReason === "break"`: muted background, a break/coffee icon, label `state.label` (`พัก`, or `พักกลางวัน` for the midday slot — see Task 6 for how the slot is identified), NOT a `useDroppable` target, no draggable child.
  - `locked` + `lockReason === "locked-class"`: muted background, 🔒 icon, the entry's `subject.SubjectName`, not droppable/draggable.
  - `placed`/`drop-target`/`empty`: unchanged behavior.
  Ensure the cell does not register as a drop target when `kind === "locked"` (guard the `useDroppable`/`isOver` wiring).

- [ ] **Step 3: Header time range.** In the column header, replace the start-only time with `formatPeriodRange(timeslot.StartTime, timeslot.EndTime)` alongside the period number.

- [ ] **Step 4: Single empty state.** When no teacher/class is selected, render ONE centered prompt instead of the populated empty grid. Remove the duplicate "เลือกครู" alert in `InspectorClient.tsx` (and the `@palette` one in Task 5) so only the grid's prompt shows.

- [ ] **Step 5: Verify** — `pnpm typecheck 2>&1 | grep -E "@grid|InspectorClient"` prints nothing. Browser check deferred to Task 7.

- [ ] **Step 6: Commit**

```bash
git add "src/app/schedule/[academicYear]/[semester]/arrange/@grid" "src/app/schedule/[academicYear]/[semester]/arrange/@inspector/_components/InspectorClient.tsx"
git commit -m "feat(arrange): render locked cells (break/lock), header time ranges, single empty state"
```

---

### Task 5: Side-rail layout + palette as rail content

**Files:**
- Modify: `arrange/layout.tsx`
- Modify: `arrange/@palette/_components/PaletteClient.tsx`

**Interfaces:**
- Consumes: the `@palette` slot content (unplaced cards), `ArrangeDndProvider`.

- [ ] **Step 1: Restructure `layout.tsx`.** Keep the empty-state gate (no responsibilities) and `ArrangeDndProvider`. Replace the fixed-position `@palette` box with a flex row: a left rail (`flex: "0 0 240px"`, the `palette` slot) and the grid (`flex: 1, minWidth: 0`, the `grid` slot); inspector stays below. On `xs`/`sm`, stack the palette above the grid (e.g. `flexDirection: { xs: "column", md: "row" }`) so it becomes an accordion/section rather than a fixed sidebar. Remove `position: fixed`, `bottom`, `transform`, hover `maxHeight`, `zIndex` from the palette box.

```tsx
<ArrangeDndProvider>
  <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, alignItems: "flex-start" }}>
    <Box data-slot="palette" sx={{ flex: { md: "0 0 240px" }, width: { xs: "100%", md: 240 }, position: "sticky", top: 16, alignSelf: "stretch" }}>
      {palette}
    </Box>
    <Box data-slot="grid" sx={{ flex: 1, minWidth: 0, width: "100%" }}>
      {grid}
      <Box data-slot="inspector" sx={{ mt: 2 }}>{inspector}</Box>
    </Box>
  </Box>
</ArrangeDndProvider>
```

- [ ] **Step 2: Adapt `PaletteClient.tsx`** to render as a vertical card list with a "ยังไม่วาง" heading: each unplaced subject as a draggable card (subject name + code + class + remaining periods). Remove any collapsed-strip / hover-expand styling that assumed the floating dock. Keep the existing `useDraggable`/drag wiring. Remove its duplicate "เลือกครู" prompt (the grid owns the empty state now).

- [ ] **Step 3: Verify** — `pnpm typecheck 2>&1 | grep -E "layout|PaletteClient"` prints nothing. Browser check in Task 7.

- [ ] **Step 4: Commit**

```bash
git add "src/app/schedule/[academicYear]/[semester]/arrange/layout.tsx" "src/app/schedule/[academicYear]/[semester]/arrange/@palette/_components/PaletteClient.tsx"
git commit -m "feat(arrange): side-rail palette + grid layout (remove floating dock)"
```

---

### Task 6: Seed a midday lunch break

**Files:**
- Modify: `prisma/seed.ts` (the timeslot generation for a term)
- Verify via DB query (no unit harness for the seed)

**Interfaces:**
- Produces: each seeded term's timeslots include exactly one lunch `BREAK` slot at the midday position, distinct from the 10-min morning break.

- [ ] **Step 1: Read the timeslot-generation block** in `prisma/seed.ts` (search for `Breaktime` / `BREAK` / the slot loop). Identify how slot IDs (`{sem}-{year}-{DAY}{n}`) and StartTime/EndTime are produced and where the single morning `BREAK` is set.

- [ ] **Step 2: Add a lunch break.** Insert a midday `Breaktime: "BREAK"` slot (≈12:00, longer than the 10-min morning break) per day, WITHOUT renumbering existing slot IDs that other seed data references (add it as its own slot in the sequence; if slots are positional, append the lunch at the correct time and let the loop number it, ensuring no existing `…1` ID that a responsibility/schedule references is reused for a different time). Keep the morning break.

- [ ] **Step 3: Re-seed and verify**

```bash
pnpm db:seed:demo
docker exec timetable-test-db psql -U test_user -d timetable_dev -tAc "SELECT to_char(\"StartTime\",'HH24:MI'), to_char(\"EndTime\",'HH24:MI'), \"Breaktime\" FROM timeslot WHERE \"AcademicYear\"=2568 AND \"Semester\"='SEMESTER_1' AND \"DayOfWeek\"='MON' AND \"Breaktime\"='BREAK' ORDER BY \"StartTime\";"
```
Expected: two BREAK rows — the morning break and a midday (~12:00 Bangkok) lunch break.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat(seed): add midday lunch break to term timeslots"
```

---

### Task 7: Wire-up verification (browser)

**Files:** none (verification only)

- [ ] **Step 1:** With dev server + seeded DB up, open `/schedule/2568/1/arrange`, select a teacher.
- [ ] **Step 2:** Confirm: palette rail is on the left and visible alongside the grid (no floating dock, no overlap); header shows `HH:MM–HH:MM`; the morning + lunch breaks render as locked `พัก`/`พักกลางวัน` cells; a locked class (lock a cell via the lock step, or set `IsLocked` in DB) renders with 🔒 and rejects a drop; empty state (deselect teacher) shows ONE prompt.
- [ ] **Step 3:** `pnpm typecheck 2>&1 | grep -cE "^src/"` → 0. Run the arrange `_lib` tests: `pnpm exec vitest run "src/app/schedule/[academicYear]/[semester]/arrange/_lib"`.
- [ ] **Step 4:** No commit (verification). File any deferred issues in beads.

---

## Self-Review

**Spec coverage:** side-rail layout (T5), header start–end (T2+T4), unified locked cell breaks+locks (T1+T4), `IsLocked` plumbing (T1 type, T3 API), lunch break (T6), single empty state (T4+T5), floating palette removed (T5). validate-drop intentionally unchanged (already rejects breaks + occupied — noted in Architecture). All spec sections map to a task.

**Placeholder scan:** Tasks 1–2 carry complete code + tests. Tasks 3–6 are existing-file edits that require reading the target file first (the routes/grid client/seed are project-specific shapes); each names the exact file, the exact field/JSX to add, and a concrete verify command — the "read first" steps are inherent to editing unfamiliar existing files, not deferred work.

**Type consistency:** `CellKind`/`CellState`/`lockReason` defined in T1 are consumed unchanged in T4; `ScheduleEntry.IsLocked` defined in T1 is populated in T3 and read in T1/T4; `formatPeriodRange` defined in T2 is used in T4.
