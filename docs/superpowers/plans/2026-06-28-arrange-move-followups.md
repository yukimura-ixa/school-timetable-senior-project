# Arrange Move Follow-ups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore apply-able conflict suggestions for a grid→grid move (routed through `updateClassScheduleAction`, not create), polish the move-mode room modal, and skip the wasted self-drop validation.

**Architecture:** Thread a `moveClassId` through the conflict modal's state into `handleApplySuggestion`, so applying a MOVE/RE_ROOM suggestion opens the room modal in move mode (which already calls `updateClassScheduleAction`). Restore `fetchFor` for the placement-conflict branch (safe once apply routes to move). Two small `RoomSelectionContent` tweaks gated on `moveClassId`, and one self-drop early return.

**Tech Stack:** Next.js 16, MUI, `@dnd-kit/core`, Vitest.

## Global Constraints

- Package manager: **pnpm only**.
- A move MUST route through `updateClassScheduleAction` (move), never `createClassScheduleAction` (create) — no duplicate rows. This is the whole point of bd 8hw.
- SWAP suggestions stay the existing "ฟังก์ชันสลับอัตโนมัติยังไม่รองรับ…" warning (no auto-swap).
- Do NOT change `planPlacementMove`, the solver, `validateDropAction`, or the conflict-detector internals.
- The existing palette→create flow (conflict apply → create) must stay unchanged (no `moveClassId` → create path).
- Commit trailers (verbatim):
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FAk7DfkGKDcUKHkc5tUPT3
  ```

## File Structure

**Modify**
- `arrange/_components/ArrangeDndProvider.tsx` — `conflictModal` state gains `moveClassId?`; placement-conflict branch restores `fetchFor` + sets `moveClassId`; `handleApplySuggestion` threads `moveClassId` into MOVE/RE_ROOM `setRoomModal`; self-drop early return.
- `arrange/_components/RoomSelectionContent.tsx` — hide set-default checkbox + move-specific success toast when `moveClassId` set.

**Unchanged (verified):** `RoomModalState.moveClassId` already exists; `updateClassScheduleAction`; `useConflictResolution`.

This is one cohesive change to the move-conflict apply path plus two co-located polish tweaks — a single task with one reviewable deliverable, then a browser-verification task.

---

### Task 1: Apply-suggestion-as-move + move-mode polish + self-drop skip

**Files:**
- Modify: `arrange/_components/ArrangeDndProvider.tsx`
- Modify: `arrange/_components/RoomSelectionContent.tsx`

**Interfaces:**
- Consumes: `RoomModalState` (already has `moveClassId?: number`), `updateClassScheduleAction`, `useConflictResolution` (`fetchFor`).
- Produces: `conflictModal` state shape gains `moveClassId?: number`; `handleApplySuggestion` opens the room modal in move mode when `conflictModal.moveClassId` is set.

- [ ] **Step 1: Add `moveClassId` to the `conflictModal` state type** — in `ArrangeDndProvider.tsx`, the `useState` at ~line 73:

```tsx
  const [conflictModal, setConflictModal] = useState<{
    conflict: ConflictResult;
    attempt: ScheduleArrangementInput;
    respId?: number;
    moveClassId?: number;
  } | null>(null);
```

- [ ] **Step 2: Self-drop early return** — in `handleDragEnd`, the placement branch (`if (dragData?.kind === "placement") {`), immediately inside the `try {` and BEFORE `const validate = await validateDropAction(...)` (~line 128), add:

```tsx
        if (timeslotId === dragData.FromTimeslotID) return; // self-drop: nothing to do
```

- [ ] **Step 3: Restore suggestions + set `moveClassId` in the placement-conflict branch** — replace the current `eb0ff059` block (the 3 comment lines + `setConflictModal({ conflict, attempt }); return;`, ~lines 173-177) with:

```tsx
          setConflictModal({
            conflict,
            attempt,
            moveClassId: dragData.ClassID,
          });
          void fetchFor(attempt);
          return;
```

- [ ] **Step 4: Thread `moveClassId` through `handleApplySuggestion`** — replace the function body (~lines 302-335) so MOVE and RE_ROOM carry `moveClassId` for a move (and keep `resp` for the create flow). When `moveClassId` is set, omit `resp` (the update path ignores it):

```tsx
  const handleApplySuggestion = (s: ResolutionSuggestion) => {
    if (!conflictModal || !teacher) return;
    const { attempt, respId, moveClassId } = conflictModal;

    if (s.kind === "MOVE") {
      setRoomModal({
        timeslot: s.targetTimeslotId,
        subject: attempt.subjectCode,
        grade: attempt.gradeId,
        teacher,
        ...(moveClassId
          ? { moveClassId }
          : respId
            ? { resp: String(respId) }
            : {}),
      });
      closeConflictModal();
      return;
    }

    if (s.kind === "RE_ROOM") {
      setRoomModal({
        timeslot: attempt.timeslotId,
        subject: attempt.subjectCode,
        grade: attempt.gradeId,
        teacher,
        ...(moveClassId
          ? { moveClassId }
          : respId
            ? { resp: String(respId) }
            : {}),
      });
      closeConflictModal();
      return;
    }

    enqueueSnackbar(
      "ฟังก์ชันสลับอัตโนมัติยังไม่รองรับ โปรดลบรายวิชาปลายทางก่อนแล้วจัดใหม่",
      { variant: "warning" },
    );
    closeConflictModal();
  };
```

- [ ] **Step 5: Move-mode polish in `RoomSelectionContent.tsx`** — two gated tweaks:
  - Hide the set-default checkbox in move mode: change the block guard from `{resp && selectedRoom && (` to `{!moveClassId && resp && selectedRoom && (`.
  - Move-specific success toast: in `handleConfirm`'s success branch, replace the single success `enqueueSnackbar("✅ จัดตารางสอนสำเร็จ", ...)` with:

```tsx
        enqueueSnackbar(
          moveClassId ? "ย้ายรายวิชาสำเร็จ" : "✅ จัดตารางสอนสำเร็จ",
          { variant: "success" },
        );
```

  (`moveClassId` is already a destructured prop from Task 2 of the prior move plan; confirm it's in scope. The update-vs-create action branch in `handleConfirm` is already correct — do not change it.)

- [ ] **Step 6: Typecheck**

Run: `pnpm typecheck 2>&1 | grep -E "ArrangeDndProvider|RoomSelectionContent"`
Expected: no output. (`moveClassId` in the spread is `number`; `RoomModalState.moveClassId?: number` already exists.)

- [ ] **Step 7: Commit**

```bash
git add "src/app/schedule/[academicYear]/[semester]/arrange/_components/ArrangeDndProvider.tsx" "src/app/schedule/[academicYear]/[semester]/arrange/_components/RoomSelectionContent.tsx"
git commit -m "feat(arrange): apply conflict suggestion as a move; move-mode modal polish (bd 8hw)"
```

---

### Task 2: Wire-up verification (browser)

**Files:** none (verification only)

Pre-req: re-seed first (the demo DB was mutated by the prior move verification) — `pnpm db:seed:demo`.

- [ ] **Step 1:** Dev server + seeded DB up, logged in. Open `/schedule/2568/1/arrange?teacher=14` (fully placed → has placed classes + occupied cells).
- [ ] **Step 2:** Drag a placed class onto an OCCUPIED cell (where the grade already has a class) → conflict modal appears AND now shows MOVE suggestion(s) (not just the message).
- [ ] **Step 3:** Click a MOVE suggestion's apply → the dragged class **relocates** to the suggested slot. Verify NO duplicate: the dragged class's ClassID is at the suggested timeslot and NOT at its original cell. Confirm via DB:
  ```bash
  docker exec timetable-test-db psql -U test_user -d timetable_dev -tAc "SELECT \"ClassID\",\"TimeslotID\",\"SubjectCode\" FROM class_schedule WHERE \"ClassID\"=<moved id>;"
  ```
  (Get `<moved id>` from the dnd-kit live-region `[role=status]` text `placement-<ClassID>-...`.) Expect exactly one row, at the new timeslot.
- [ ] **Step 4:** When the move-mode room modal opens (drop where the kept room is taken, or via RE_ROOM): the "ตั้งเป็นห้องเริ่มต้น" checkbox is HIDDEN, and confirming shows "ย้ายรายวิชาสำเร็จ".
- [ ] **Step 5:** Regression — drag a PALETTE subject onto an occupied cell → conflict modal → apply a suggestion → still CREATES (the room modal shows the set-default checkbox; success says "จัดตารางสอนสำเร็จ"). SWAP suggestion → warning unchanged.
- [ ] **Step 6:** Self-drop (drag a placed class onto its own cell) → nothing happens, no network call to validate-drop (check the Network panel shows no validateDropAction request), no toast.
- [ ] **Step 7:** Console: no new errors. `pnpm typecheck 2>&1 | grep -cE "^src/"` → 0. Run `pnpm exec vitest run "src/app/schedule/[academicYear]/[semester]/arrange/_lib"`.
- [ ] **Step 8:** No commit (verification).

---

## Self-Review

**Spec coverage:** apply-suggestion-as-move via `moveClassId` through conflictModal → handleApplySuggestion → setRoomModal (T1 steps 1,3,4); restore `fetchFor` for move conflict (T1 step 3); MOVE + RE_ROOM both carry `moveClassId`, SWAP unchanged (T1 step 4); move-mode hide set-default + success toast (T1 step 5); self-drop skip validate (T1 step 2); create flow unchanged (T1 step 4 keeps the `respId` branch when no `moveClassId`). Browser verification incl. no-duplicate DB check + create-flow regression (T2). All spec sections mapped.

**Placeholder scan:** T1 carries the exact replacement code for every edit with precise anchor lines. T2 is verification with concrete steps + a DB query. No "TBD"/"handle edge cases".

**Type consistency:** `moveClassId: number` flows from `dragData.ClassID` (placement data) → `conflictModal.moveClassId` (T1 s1) → `handleApplySuggestion` destructure (T1 s4) → `setRoomModal({ moveClassId })` (`RoomModalState.moveClassId?: number`, pre-existing) → `RoomSelectionContent` prop (pre-existing). The success-toast and checkbox gates read the same `moveClassId` prop.
