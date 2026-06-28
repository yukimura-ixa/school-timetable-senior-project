# Grid→Grid Drag-to-Move (relocate a placed class)

Date: 2026-06-28
Status: Approved (design); pending implementation plan
Area: `/schedule/[academicYear]/[semester]/arrange` — `@grid` cell + `ArrangeDndProvider`

## Problem

In the arrange grid, only the palette is a drag *source*; grid cells are drop *targets* only. A placed class (`DroppableCell` `placed` branch, `@grid/page.tsx:118`) renders its name, chips, and a remove (✕) button but has no `useDraggable`. So a class cannot be moved cell-to-cell — to relocate it you must remove it (✕) and re-drag from the "ยังไม่วาง" palette. Users perceive this as "dnd not working / cannot move card inside the table." Palette→grid DnD itself works (verified end-to-end).

## Goal

Drag a placed class from its cell to another free cell to relocate it, keeping its room when possible.

## Non-goals

- Swapping two placed classes (drop onto an occupied cell). Occupied target → the existing conflict modal, no auto-swap.
- Changing the palette→grid create flow, the auto-arrange solver, conflict detection internals, or `validateDropAction` logic.
- Moving locked/break cells (they stay non-draggable and non-droppable).

## Decisions

- **Move via `updateClassScheduleAction`** (`{ ClassID, TimeslotID: target }`) — preserves ClassID, room, and teacher-responsibility links. Not delete+create.
- **Room on move: keep current room; re-pick only if it's taken at the destination.** Same room free at target → silent keep. Room busy at target → reuse the existing room modal to pick a free one.
- A placed cell is **both** a drag source and a drop target; dropping a cell on itself is a no-op.

## Design

### Placed cell as a drag source (`@grid/page.tsx`, `DroppableCell`)

The `placed` branch (non-locked, has `entry`) wraps its rendered content with `useDraggable`:
- id: `placement-${entry.ClassID}`
- data (`active.data.current`):
  ```ts
  {
    kind: "placement",
    ClassID: entry.ClassID,
    SubjectCode: entry.SubjectCode,
    GradeID: entry.GradeID,
    RoomID: entry.RoomID,
    SubjectName: entry.subject.SubjectName,
    GradeName: entry.gradelevel.GradeName,
  }
  ```
- Spread `{...attributes} {...listeners}` and set the draggable ref on the placed content wrapper. The cell's existing `useDroppable` ref stays on the outer `Box` (an element can host both; use separate child node for the draggable so the droppable rect is unaffected).
- The ✕ remove `IconButton` keeps `onClick={() => onRemove(...)}`; the PointerSensor's 10px activation distance already separates a click from a drag, and the button is a child so its click does not start a drag. No `stopPropagation` needed, but the remove button must remain clickable (it is — pointerdown→up without 10px move = click, not drag).
- Locked cells (`state.kind === "locked"`) render the existing non-draggable branch — unchanged.
- `readOnly` (class view): no draggable (and no remove) — guard the `useDraggable` usage so class view stays read-only. Because hooks can't be conditional, call `useDraggable` unconditionally and apply `{...listeners}` only when `!readOnly && state.kind === "placed"` (or pass `disabled` via not spreading listeners). Keep it hook-safe.

### Palette draggable data gains a discriminator

`PaletteClient` `DraggableSubject` data currently is the raw `subject`. Add `kind: "subject"` to its `useDraggable` data so `handleDragEnd` can branch unambiguously:
```ts
useDraggable({ id: `subject-${subject.RespID}`, data: { kind: "subject", ...subject } });
```
(Existing consumers read `SubjectCode`/`GradeID`/`RespID`/`DefaultRoomID` — unchanged; only an extra `kind` field is added.)

### `handleDragEnd` branches on `kind` (`ArrangeDndProvider.tsx`)

```
const data = active.data.current;
if (!over || !teacher) return;
const target = over.id as string;

if (data?.kind === "placement") {
  // MOVE path (new)
  if (target === <source timeslot of this placement>) return; // no-op self-drop
  // validateDropAction(target, data.SubjectCode, data.GradeID, teacher)
  //   not allowed → existing conflict modal (reuse current mapping)
  //   allowed:
  //     data.RoomID in result.rooms.available
  //       → updateClassScheduleAction({ ClassID: data.ClassID, TimeslotID: target })
  //         success toast, dispatch "schedule-updated", router.refresh()
  //     else (room taken at target)
  //       → open room modal (mode: move) → on confirm:
  //         updateClassScheduleAction({ ClassID: data.ClassID, TimeslotID: target, RoomID: chosen })
  return;
}

// else: existing palette→create path (unchanged)
```

**Source-timeslot for the self-drop guard:** the placement's current timeslot isn't in the drag data above; add `FromTimeslotID: timeslot.TimeslotID` to the placement drag data so `handleDragEnd` can compare `target === data.FromTimeslotID`.

**Room modal "move" mode:** `RoomSelectionContent` currently creates a new schedule. For a move it must instead call `updateClassScheduleAction` with the new timeslot+room. Add an optional `moveClassId?: number` prop to `RoomModalState`/`RoomSelectionContent`: when present, the confirm calls `updateClassScheduleAction({ ClassID: moveClassId, TimeslotID, RoomID })`; when absent, the existing create path runs. Keep the change minimal and behind that prop.

### Drag overlay

`DragOverlay` reads `activeSubject.SubjectName`/`GradeName`. The placement drag data carries `SubjectName`/`GradeName`, so the overlay shows the moving class with no change to the overlay component.

## Touch points

- `@grid/page.tsx` — `DroppableCell`: add `useDraggable` to the placed branch (hook-safe, gated by `!readOnly`), placement drag data incl. `FromTimeslotID`.
- `@palette/_components/PaletteClient.tsx` — add `kind: "subject"` to draggable data.
- `_components/ArrangeDndProvider.tsx` — `handleDragEnd` move branch; `RoomModalState` gains optional `moveClassId`.
- `_components/RoomSelectionContent.tsx` — optional `moveClassId` → `updateClassScheduleAction` on confirm.
- Consumes existing `updateClassScheduleAction` (`@/features/class/...`), `validateDropAction` — no change to those.

## Testing

- Unit (extract the branch decision to a pure helper, e.g. `resolveDropKind(activeData)` / a `planMove(...)` that returns `"noop" | "move-keep-room" | "move-pick-room" | "conflict"` given target, source timeslot, validateResult, current RoomID): assert self-drop → noop; free target + room available → move-keep-room; free target + room taken → move-pick-room; not allowed → conflict.
- Browser: drag a placed card to a free cell (keeps room, success toast, source empties); to a cell where its room is busy (room modal opens, pick room, moves); to an occupied cell (conflict modal); onto its own cell (no-op); onto a break/locked cell (rejected — droppable disabled); ✕ remove still works (click not swallowed by drag).

## Risks

- **Hook safety:** `useDraggable` must be called unconditionally in `DroppableCell` (already calls `useDroppable` unconditionally). Gate behavior via `listeners`/`disabled`, not by conditionally calling the hook.
- **Click vs drag on the ✕ button:** relies on PointerSensor `distance: 10` so a click isn't a drag; verify the remove button still fires in the browser test.
- **Self-conflict:** the move targets a different timeslot; `validateDropAction` checks only the target timeslot, so the source row never self-conflicts. The self-drop (same timeslot) is guarded explicitly via `FromTimeslotID`.
