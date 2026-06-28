# Arrange Move — Follow-ups (apply-suggestion-as-move + move-mode polish)

Date: 2026-06-28
Status: Approved (design); pending implementation plan
Area: `/schedule/[academicYear]/[semester]/arrange` — `ArrangeDndProvider`, `RoomSelectionContent`
Tracks: bd `school-timetable-senior-project-8hw` (P3) + two deferred move-mode minors

## Problem

The grid→grid move feature shipped with a safe stopgap and two cosmetic gaps:

1. **bd 8hw — conflict suggestions suppressed for a move.** When a placement-move lands on an occupied cell, `eb0ff059` dropped `fetchFor(attempt)` so the conflict modal shows only the message (no apply-able MOVE/RE_ROOM suggestions). That avoided a duplicate-create bug, but the user loses the "resolve by moving to a suggested slot" affordance the palette flow has.
2. **Move-mode room modal cosmetics.** When the room modal opens in move mode (`moveClassId` set): the "ตั้งเป็นห้องเริ่มต้น" (set-default-room) checkbox still renders though it's ignored (only the create path passes `SetAsDefaultRoom`), and the success toast says "จัดตารางสอนสำเร็จ" rather than a move-specific message.
3. **Wasted self-drop validation.** The placement branch calls `validateDropAction` even when the target equals the source timeslot; `planPlacementMove` then returns `"noop"` — one needless server roundtrip per same-cell drop.

## Goal

Restore apply-able suggestions for move conflicts, routed to `updateClassScheduleAction` (move) not `createClassScheduleAction` (create); polish the move-mode modal; skip the self-drop validation.

## Non-goals

- SWAP suggestions remain the existing "ลบรายวิชาปลายทางก่อน" warning (no auto-swap), same as today for the create flow.
- No change to `planPlacementMove`, the solver, `validateDropAction`, or the conflict-detector internals.

## Design

### 1. Apply-suggestion-as-move (bd 8hw) — `ArrangeDndProvider.tsx`

- `conflictModal` state gains `moveClassId?: number`:
  ```ts
  const [conflictModal, setConflictModal] = useState<{
    conflict: ConflictResult;
    attempt: ScheduleArrangementInput;
    respId?: number;
    moveClassId?: number;
  } | null>(null);
  ```
- In the placement branch's `plan === "conflict"` sub-branch: set `conflictModal` with `moveClassId` and **restore** the suggestion fetch:
  ```ts
  setConflictModal({ conflict, attempt, moveClassId: dragData.ClassID });
  void fetchFor(attempt);
  return;
  ```
  (Replaces the `eb0ff059` comment + suppressed fetch. Safe now because apply routes to move — see below.)
- `handleApplySuggestion`: when `conflictModal.moveClassId` is set, thread it into the `setRoomModal` calls so `RoomSelectionContent` takes the update (move) path:
  - **MOVE** suggestion → `setRoomModal({ timeslot: s.targetTimeslotId, subject: attempt.subjectCode, grade: attempt.gradeId, teacher, moveClassId: conflictModal.moveClassId })` (relocate the dragged class to the suggested slot). When `moveClassId` is absent (palette flow) the call is unchanged (carries `resp` as today).
  - **RE_ROOM** suggestion → `setRoomModal({ timeslot: attempt.timeslotId, …, moveClassId: conflictModal.moveClassId })` for a move; unchanged (carries `resp`) for the create flow.
  - **SWAP** → unchanged warning + `closeConflictModal()`.
  The existing `resp` field stays for the create flow (`respId` from `conflictModal`); for a move, `moveClassId` is passed instead and `resp` is omitted (the update path does not consume `resp`).

### 2. Move-mode room modal cosmetics — `RoomSelectionContent.tsx`

When `moveClassId` is set:
- Do not render the set-default-room `FormControlLabel`/`Checkbox` (gate the existing `{resp && selectedRoom && (...)}` block additionally on `!moveClassId`).
- Success toast: `enqueueSnackbar("ย้ายรายวิชาสำเร็จ", { variant: "success" })` in the move branch; the create branch keeps "✅ จัดตารางสอนสำเร็จ". (The shared success block currently emits one message; split the success toast text by `moveClassId`.)

### 3. Skip self-drop validation — `ArrangeDndProvider.tsx`

In the placement branch, before the `await validateDropAction(...)`, return early when the drop is on the source cell:
```ts
if (timeslotId === dragData.FromTimeslotID) return; // self-drop: nothing to do
```
`planPlacementMove`'s `"noop"` precedence still covers the case defensively; this just avoids the needless server call.

## Touch points

- `ArrangeDndProvider.tsx` — `conflictModal` state `moveClassId`; placement-conflict branch restores `fetchFor` + sets `moveClassId`; `handleApplySuggestion` threads `moveClassId` into MOVE/RE_ROOM `setRoomModal`; self-drop early return.
- `RoomSelectionContent.tsx` — hide set-default in move mode; move-specific success toast.
- Consumes existing `updateClassScheduleAction`, `RoomModalState.moveClassId` (already added), `useConflictResolution` — no signature changes.

## Testing

- Browser: drop a placed class on an occupied cell → conflict modal now shows MOVE suggestion(s) → apply one → the dragged class **relocates** to the suggested slot (single row moved, no duplicate; DB shows the same ClassID at the new timeslot); the original source cell is vacated. Move-mode room modal hides the set-default checkbox and shows "ย้ายรายวิชาสำเร็จ". Self-drop (same cell) → no network validate call (verify via devtools/network or no-op behavior), no change.
- Regression: palette→grid create-on-conflict apply still creates (unchanged); SWAP still warns.

## Risks

- **Duplicate regression** if `moveClassId` isn't threaded through every apply path — the whole point of bd 8hw. The plan must cover MOVE and RE_ROOM; SWAP doesn't write so it's safe.
- `handleApplySuggestion` reads `conflictModal` — ensure it reads the current `moveClassId` (it already destructures `conflictModal`), not a stale closure.
