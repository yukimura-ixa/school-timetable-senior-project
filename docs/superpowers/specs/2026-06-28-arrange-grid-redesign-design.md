# Arrange Grid UX Redesign

Date: 2026-06-28
Status: Approved (design); pending implementation plan
Area: `/schedule/[academicYear]/[semester]/arrange` (Journey "Configure timetable schedule" → step 5 "ตรวจและปรับ")

## Problem

The arrange grid works (drag-drop via `ArrangeDndProvider`, auto-arrange solver, conflict detection) but the UX has concrete defects, found by running it:

1. **Hidden + covering palette.** The unplaced-subjects palette is a `position: fixed` card pinned bottom-center, collapsed to a 60px strip, expanding to 72vh on hover (`arrange/layout.tsx:121-143`). You must hover to see unplaced subjects, and expanding then covers the grid you're dragging onto — you can never see the full list and the target grid at once. Also causes visual overlap with grid content.
2. **Noisy empty state.** With no teacher selected, the grid shows a 55-cell sea of "คาบว่าง" behind **three** redundant "เลือกครู" prompts.
3. **Header shows start time only.** Period headers read `1 08:30`; no end time.
4. **No lunch break.** The timeslot data has only a 10-min morning break (slot 3, `Breaktime=BREAK`); periods otherwise run continuously. The grid renders any `Breaktime != NOT_BREAK` as `พัก`, so lunch is absent purely because the config/seed never defines it.
5. **Locked cells unhandled.** `getCellState` (`arrange/_lib/grid-format.ts:25`) returns only `break | drop-target | placed | empty` — there is **no `locked` kind**, so a locked/published class is indistinguishable from a normal placed one and isn't protected in the UI.

The wizard stepper also consumes enough vertical space to push the grid below the fold.

## Goals

- Make the unplaced palette and the grid visible at the same time.
- Header shows `HH:MM–HH:MM`.
- A unified, protected representation for immovable cells (breaks **and** locked classes).
- A real lunch break that appears in the grid.
- One clean empty state.

## Non-goals

- The drag engine (`ArrangeDndProvider`), the auto-arrange solver, and the conflict detector/resolver internals are unchanged — only layout, cell model, and rendering change.

## Decisions

- **Side-rail palette** (chosen over floating/docked-tray): a persistent left rail of unplaced-subject cards beside the grid. Trade-off accepted: grid loses ~240px width in exchange for the palette always being visible next to the grid.
- **Breaks are treated as locked cells.** Breaks and locked classes are the same interactionally — an immovable occupied slot — so they share one `locked` cell state (render-level unification; no fake `class_schedule` rows).
- **Lunch break is ensured to exist** in the seed/timeslot generation (config crosses into Journey 1).

## Design

### Layout (inside `ArrangeDndProvider`)

- **Top bar (tightened):** term title + compact stepper + ย้อนกลับ/ถัดไป, then one control row — view toggle (มุมมองครู / มุมมองชั้นเรียน), the teacher/class selector, the จัดอัตโนมัติ button. Reclaim the stepper's vertical space so the grid sits above the fold.
- **Left palette rail (~240px, persistent):** heading "ยังไม่วาง"; unplaced subject cards for the selected teacher (teacher view) or class (class view). Each card: subject name + code + class + remaining periods. Drag source. On `xs/sm`, collapses to an accordion above the grid (not a fixed sidebar).
- **Grid (fills remaining width):** the drop target. **Inspector stays below the grid**, unchanged.
- The floating `@palette` slot is removed from `layout.tsx`; the palette renders as a normal flex sibling of the grid — which removes the overlap and `position: fixed` rendering artifacts.

### Empty state

When no teacher/class is selected: a **single** centered prompt ("เลือกครูเพื่อเริ่มจัดตาราง" / class equivalent) in place of the grid — not a populated empty grid behind three banners. Remove the duplicate alerts (`@grid` + `@inspector` + `@palette` each emitting a prompt).

### Grid header (times)

Each period column header renders the period number and `formatPeriodTime(StartTime)–formatPeriodTime(EndTime)` → e.g. `08:30–09:20`. `formatPeriodTime` already exists and renders Bangkok local time correctly; add the `EndTime` half.

### Unified cell state (`getCellState`)

Extend `CellKind` to include `locked`. A cell is `locked` when **either** `timeslot.Breaktime !== "NOT_BREAK"` **or** `entry?.IsLocked` is true. Carry a discriminator so the renderer picks label + icon:

| lock source | condition | label | icon |
|---|---|---|---|
| break | `timeslot.Breaktime != NOT_BREAK` | `พัก` (or `พักกลางวัน` for the lunch slot) | break/coffee icon |
| locked class | `entry?.IsLocked` | the subject's label | 🔒 |

Remaining kinds: `drop-target` (when `isOver` and not locked), `placed` (entry, not locked), `empty`.

Behavior for `locked` cells: **not draggable, not a drop target**, distinct muted style. A locked cell that also has an entry still shows the subject (locked-class case); a break locked cell shows the break label.

### Drop validation

`validate-drop.action` / `arrange-validation.service`: a single guard — reject a drop whose target cell is `locked` (covers breaks and locked classes with one rule), in addition to the existing teacher/room/conflict checks. The renderer now communicates the rejection (locked styling) rather than failing silently.

### Lunch break

The seeded/generated timeslots for a term must include a midday lunch break: one `Breaktime=BREAK` timeslot at the lunch position (≈12:00, longer than the 10-min morning break), labeled `พักกลางวัน` in the grid (the grid derives the lunch label from the slot being the midday break). If the step-1 timeslot config wizard already supports defining break periods, no config-UI change is needed beyond confirming lunch can be set; otherwise note the gap. The concrete deliverable is: the demo seed produces a lunch break that renders as a locked `พักกลางวัน` cell.

## Touch points

- `arrange/_lib/grid-format.ts` — `CellKind`, `getCellState` (unify `locked`), `formatPeriodTime` usage for end time, `LABELS`.
- `arrange/@grid/...` — render `locked` cells (break vs locked-class label/icon), header start–end, single empty state.
- `arrange/@palette/...` — render as the left-rail content (cards), drag source; remove floating-strip assumptions.
- `arrange/@inspector/...` — drop its duplicate "เลือกครู" prompt.
- `arrange/@header/...` — top-bar control row (selector already fixed for the Autocomplete label bug).
- `arrange/layout.tsx` — replace the fixed bottom `@palette` box with the left-rail + grid flex layout; responsive accordion.
- `validate-drop.action` / `arrange-validation.service` — single "target locked?" rejection.
- Seed / timeslot generation (`prisma/seed.ts` or the timeslot generator) — add the lunch break.

## Testing

- Unit: `getCellState` returns `locked` for a break timeslot and for an `IsLocked` entry, with the correct discriminator; `empty`/`placed`/`drop-target` unchanged. Header time formatting (start–end). Palette unplaced-list derivation.
- Unit: `validate-drop` rejects a locked target (break and locked-class).
- Seed: the term's timeslots include exactly one lunch `BREAK` at the midday position.
- Browser: side-rail + grid visible together; drag a card → cell; locked/break cells reject drops and render distinctly; header shows ranges; lunch renders.

## Out of scope

Auto-arrange algorithm changes, conflict-resolver internals, the drag engine, and the by-class read-only specifics beyond layout parity.

## Risks

- Narrow viewports: the side rail + 11-column grid needs the accordion fallback to stay usable.
- The lunch-break seed change shifts existing seeded period times if inserted mid-day; the generator must slot lunch without breaking the `…1` timeslot IDs other data references — prefer adding lunch as its own break slot rather than renumbering.
