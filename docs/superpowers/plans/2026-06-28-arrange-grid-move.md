# Grid→Grid Drag-to-Move Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a user drag an already-placed class from one grid cell to another free cell to relocate it (keeping its room when possible), in addition to the existing palette→grid placement.

**Architecture:** A pure decision helper (`planPlacementMove`) computes the move outcome and is TDD'd first. `handleDragEnd` in `ArrangeDndProvider` branches on a `kind` discriminator in the drag data: `"placement"` → move via `updateClassScheduleAction` (keeps ClassID/room/responsibilities); `"subject"` → the unchanged create path. The move handling lands while no cell is draggable yet (dormant), then the placed cell is made a drag source to activate it. The room modal gains a `moveClassId` prop so the "room taken at destination" case reuses the existing picker.

**Tech Stack:** Next.js 16 App Router, MUI, `@dnd-kit/core`, Vitest.

## Global Constraints

- Package manager: **pnpm only**; single test via `pnpm exec vitest run "<path>"` (quote paths containing `[` `]`).
- Move uses `updateClassScheduleAction({ ClassID, TimeslotID, RoomID? })` — NOT delete+create. Preserves ClassID, room, responsibilities.
- Room on move: keep current room; re-pick (room modal) ONLY if that room is taken at the destination.
- Occupied target (teacher/grade conflict) → existing conflict modal. No auto-swap.
- Locked/break cells stay non-draggable AND non-droppable (already disabled). Class view (`readOnly`) stays non-draggable.
- Hooks must be called unconditionally (no conditional `useDraggable`/`useDroppable`); gate behavior via `disabled`/withholding `listeners`.
- Do NOT change the auto-arrange solver, `validateDropAction`, or conflict-detector internals.
- Commit trailers (verbatim):
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FAk7DfkGKDcUKHkc5tUPT3
  ```

## File Structure

**Create**
- `src/app/schedule/[academicYear]/[semester]/arrange/_lib/move-plan.ts` — pure `planPlacementMove`.
- `src/app/schedule/[academicYear]/[semester]/arrange/_lib/__tests__/move-plan.test.ts`

**Modify**
- `arrange/@palette/_components/PaletteClient.tsx` — add `kind: "subject"` to draggable data.
- `arrange/_components/ArrangeDndProvider.tsx` — `handleDragEnd` placement branch (uses `planPlacementMove`); `RoomModalState` gains optional `moveClassId`.
- `arrange/_components/RoomSelectionContent.tsx` — optional `moveClassId` → `updateClassScheduleAction` on confirm.
- `arrange/@grid/page.tsx` — `DroppableCell`: placed branch becomes a drag source (`useDraggable`, hook-safe, gated by `!readOnly`).

**Unchanged (verified):** `updateClassScheduleAction` (`updateClassScheduleSchema` accepts `ClassID` + optional `TimeslotID`/`RoomID`), `validateDropAction`, the solver.

---

### Task 1: Pure `planPlacementMove` helper

**Files:**
- Create: `arrange/_lib/move-plan.ts`
- Test: `arrange/_lib/__tests__/move-plan.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type MovePlan = "noop" | "conflict" | "move-keep-room" | "move-pick-room";
  export function planPlacementMove(args: {
    fromTimeslot: string;
    targetTimeslot: string;
    allowed: boolean;
    currentRoomId: number;
    availableRoomIds: number[];
  }): MovePlan;
  ```

- [ ] **Step 1: Write the failing test** — `arrange/_lib/__tests__/move-plan.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { planPlacementMove } from "../move-plan";

const base = {
  fromTimeslot: "1-2568-MON1",
  targetTimeslot: "1-2568-MON4",
  allowed: true,
  currentRoomId: 5,
  availableRoomIds: [5, 6, 7],
};

describe("planPlacementMove", () => {
  it("dropping on the source cell is a no-op", () => {
    expect(planPlacementMove({ ...base, targetTimeslot: base.fromTimeslot })).toBe("noop");
  });
  it("not allowed (occupied/conflict) → conflict", () => {
    expect(planPlacementMove({ ...base, allowed: false })).toBe("conflict");
  });
  it("allowed and current room free at target → keep room", () => {
    expect(planPlacementMove(base)).toBe("move-keep-room");
  });
  it("allowed but current room taken at target → pick room", () => {
    expect(planPlacementMove({ ...base, availableRoomIds: [6, 7] })).toBe("move-pick-room");
  });
  it("no-op takes precedence over a (stale) not-allowed result on the same cell", () => {
    expect(planPlacementMove({ ...base, targetTimeslot: base.fromTimeslot, allowed: false })).toBe("noop");
  });
});
```

- [ ] **Step 2: Run it, confirm RED**

Run: `pnpm exec vitest run "src/app/schedule/[academicYear]/[semester]/arrange/_lib/__tests__/move-plan.test.ts"`
Expected: FAIL — `planPlacementMove` not found.

- [ ] **Step 3: Implement** — `arrange/_lib/move-plan.ts`

```ts
export type MovePlan = "noop" | "conflict" | "move-keep-room" | "move-pick-room";

/**
 * Decide what dropping a placed class onto a target timeslot should do.
 * Pure: the caller supplies validateDropAction's verdict + available room ids.
 */
export function planPlacementMove(args: {
  fromTimeslot: string;
  targetTimeslot: string;
  allowed: boolean;
  currentRoomId: number;
  availableRoomIds: number[];
}): MovePlan {
  if (args.targetTimeslot === args.fromTimeslot) return "noop";
  if (!args.allowed) return "conflict";
  return args.availableRoomIds.includes(args.currentRoomId)
    ? "move-keep-room"
    : "move-pick-room";
}
```

- [ ] **Step 4: Run it, confirm GREEN** (same command).

- [ ] **Step 5: Commit**

```bash
git add "src/app/schedule/[academicYear]/[semester]/arrange/_lib/move-plan.ts" "src/app/schedule/[academicYear]/[semester]/arrange/_lib/__tests__/move-plan.test.ts"
git commit -m "feat(arrange): planPlacementMove decision helper for grid→grid move"
```

---

### Task 2: Move handling in `handleDragEnd` + palette discriminator + room-modal move mode

**Files:**
- Modify: `arrange/@palette/_components/PaletteClient.tsx`
- Modify: `arrange/_components/ArrangeDndProvider.tsx`
- Modify: `arrange/_components/RoomSelectionContent.tsx`

**Interfaces:**
- Consumes: `planPlacementMove` (Task 1); `updateClassScheduleAction` from `@/features/class/application/actions/class.actions`; `validateDropAction`.
- Produces: `handleDragEnd` treats `active.data.current.kind === "placement"` as a move; placement drag data shape (consumed in Task 3):
  ```ts
  { kind: "placement", ClassID: number, SubjectCode: string, GradeID: string,
    RoomID: number, FromTimeslotID: string, SubjectName: string, GradeName: string }
  ```
  `RoomModalState` gains optional `moveClassId?: number`; `RoomSelectionContent` gains optional `moveClassId?: number` prop.

This task adds the move logic while no grid cell is draggable yet (Task 3 activates it). It is therefore dormant — no behavior change — but wired and type-correct.

- [ ] **Step 1: Add the `kind: "subject"` discriminator to the palette draggable** — in `PaletteClient.tsx`, `DraggableSubject`:

```tsx
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `subject-${subject.RespID}`,
    data: { kind: "subject", ...subject },
  });
```

- [ ] **Step 2: Teach `RoomSelectionContent` a move mode** — in `RoomSelectionContent.tsx`:
  - Import the update action alongside the create one:
    ```tsx
    import {
      createClassScheduleAction,
      updateClassScheduleAction,
    } from "@/features/class/application/actions/class.actions";
    ```
  - Add `moveClassId?: number;` to `Props` (after `onClose?`).
  - Destructure it in the component signature: `}: Props)` → include `moveClassId`.
  - In `handleConfirm`, branch the action (replace the single `createClassScheduleAction(...)` call that assigns `result`):
    ```tsx
      const result = moveClassId
        ? await updateClassScheduleAction({
            ClassID: moveClassId,
            TimeslotID: timeslot,
            RoomID: selectedRoom.RoomID,
          })
        : await createClassScheduleAction({
            TimeslotID: timeslot,
            SubjectCode: subject,
            GradeID: grade,
            RoomID: selectedRoom.RoomID,
            IsLocked: false,
            ResponsibilityIDs: resp ? [parseInt(resp, 10)] : [],
            SetAsDefaultRoom: setAsDefault,
          });
    ```
    (The success/error handling below is shared and unchanged. `updateClassScheduleAction` returns the schedule object on success — wrap is via `createAction`, so `result.success` check still applies.)

- [ ] **Step 3: Add `moveClassId` to `RoomModalState` and pass it through** — in `ArrangeDndProvider.tsx`:
  - Extend the type:
    ```tsx
    type RoomModalState = {
      timeslot: string;
      subject: string;
      grade: string;
      teacher: string;
      resp?: string;
      moveClassId?: number;
    };
    ```
  - Pass it to the modal content (in the `<RoomSelectionContent .../>` JSX):
    ```tsx
              <RoomSelectionContent
                timeslot={roomModal.timeslot}
                subject={roomModal.subject}
                grade={roomModal.grade}
                teacher={roomModal.teacher}
                resp={roomModal.resp ?? ""}
                moveClassId={roomModal.moveClassId}
                onClose={() => setRoomModal(null)}
              />
    ```

- [ ] **Step 4: Add the placement branch to `handleDragEnd`** — in `ArrangeDndProvider.tsx`, add the `SubjectDragData`/placement types and branch. At the top of `handleDragEnd`, after `setActiveSubject(null)` and the `if (!over || !teacher) return;` guard, insert the placement branch BEFORE the existing `subjectData` logic:

```tsx
    const timeslotId = over.id as string;
    const dragData = active.data.current as
      | (SubjectDragData & { kind?: "subject" })
      | {
          kind: "placement";
          ClassID: number;
          SubjectCode: string;
          GradeID: string;
          RoomID: number;
          FromTimeslotID: string;
        }
      | undefined;

    if (dragData?.kind === "placement") {
      try {
        const validate = await validateDropAction({
          timeslot: timeslotId,
          subject: dragData.SubjectCode,
          grade: dragData.GradeID,
          teacher,
        });
        const plan = planPlacementMove({
          fromTimeslot: dragData.FromTimeslotID,
          targetTimeslot: timeslotId,
          allowed: validate.allowed,
          currentRoomId: dragData.RoomID,
          availableRoomIds: validate.allowed
            ? validate.rooms.available.map((r) => r.RoomID)
            : [],
        });

        if (plan === "noop") return;

        if (plan === "conflict") {
          const attempt: ScheduleArrangementInput = {
            timeslotId,
            subjectCode: dragData.SubjectCode,
            gradeId: dragData.GradeID,
            teacherId: parseInt(teacher, 10) || undefined,
            roomId: null,
            academicYear: yearInt,
            semester: semInt === 1 ? "SEMESTER_1" : "SEMESTER_2",
          };
          const reasonToConflictType: Record<string, ConflictType> = {
            teacher_conflict: ConflictType.TEACHER_CONFLICT,
            grade_conflict: ConflictType.CLASS_CONFLICT,
            break_timeslot: ConflictType.LOCKED_TIMESLOT,
            locked_timeslot: ConflictType.LOCKED_TIMESLOT,
          };
          const conflict: ConflictResult = {
            hasConflict: true,
            conflictType:
              (!validate.allowed &&
                reasonToConflictType[validate.reason]) ||
              ConflictType.TEACHER_CONFLICT,
            message:
              (!validate.allowed && validate.message) ||
              "ไม่สามารถจัดตารางได้",
          };
          setConflictModal({ conflict, attempt });
          void fetchFor(attempt);
          return;
        }

        if (plan === "move-keep-room") {
          await updateClassScheduleAction({
            ClassID: dragData.ClassID,
            TimeslotID: timeslotId,
          });
          enqueueSnackbar("ย้ายรายวิชาสำเร็จ", { variant: "success" });
          window.dispatchEvent(new Event("schedule-updated"));
          router.refresh();
          return;
        }

        // plan === "move-pick-room": current room taken at target → pick a new one
        setRoomModal({
          timeslot: timeslotId,
          subject: dragData.SubjectCode,
          grade: dragData.GradeID,
          teacher,
          moveClassId: dragData.ClassID,
        });
      } catch {
        enqueueSnackbar("เกิดข้อผิดพลาดในการย้ายรายวิชา", { variant: "error" });
      }
      return;
    }

    const subjectData = active.data.current as SubjectDragData | undefined;
```

  Add imports at the top of the file:
  ```tsx
  import { planPlacementMove } from "../_lib/move-plan";
  import { updateClassScheduleAction } from "@/features/class/application/actions/class.actions";
  ```
  (`createClassScheduleAction` is already imported.)

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck 2>&1 | grep -E "ArrangeDndProvider|RoomSelectionContent|PaletteClient|move-plan"`
Expected: no output. (If `validate.rooms`/`validate.reason`/`validate.message` access errors because the union narrows only when `allowed` is true/false, keep the guards as written — `validate.allowed ? ... : []` and `!validate.allowed && ...` narrow correctly.)

- [ ] **Step 6: Commit**

```bash
git add "src/app/schedule/[academicYear]/[semester]/arrange/@palette/_components/PaletteClient.tsx" "src/app/schedule/[academicYear]/[semester]/arrange/_components/ArrangeDndProvider.tsx" "src/app/schedule/[academicYear]/[semester]/arrange/_components/RoomSelectionContent.tsx"
git commit -m "feat(arrange): handle placement-move in handleDragEnd (dormant until cells draggable)"
```

---

### Task 3: Make the placed cell a drag source (activates the feature)

**Files:**
- Modify: `arrange/@grid/page.tsx` (`DroppableCell`)

**Interfaces:**
- Produces: the placement drag data (consumed by Task 2's branch): `{ kind: "placement", ClassID, SubjectCode, GradeID, RoomID, FromTimeslotID, SubjectName, GradeName }`.
- Consumes: `useDraggable` from `@dnd-kit/core`.

- [ ] **Step 1: Read `DroppableCell`** (`@grid/page.tsx:38`) to confirm current imports and the placed branch (`state.kind === "placed" && entry`).

- [ ] **Step 2: Import `useDraggable`** — extend the existing dnd-kit import:

```tsx
import { useDroppable, useDraggable } from "@dnd-kit/core";
```

- [ ] **Step 3: Call `useDraggable` unconditionally in `DroppableCell`** — after the `useDroppable` call (hooks must be unconditional). The id must be stable and unique; only enable it for an editable placed cell:

```tsx
  const draggable = useDraggable({
    id: `placement-${entry?.ClassID ?? "none"}-${timeslot.TimeslotID}`,
    data: entry
      ? {
          kind: "placement" as const,
          ClassID: entry.ClassID,
          SubjectCode: entry.SubjectCode,
          GradeID: entry.GradeID,
          RoomID: entry.RoomID,
          FromTimeslotID: timeslot.TimeslotID,
          SubjectName: entry.subject.SubjectName,
          GradeName: entry.gradelevel.GradeName,
        }
      : undefined,
    disabled: readOnly || state.kind !== "placed" || !entry,
  });
```

  (`state` is computed just above from `getCellState`. Place this call after `const state = getCellState(...)`.)

- [ ] **Step 4: Attach the draggable to the placed content** — in the `state.kind === "placed" && entry` branch, spread the draggable onto the inner content `Box` (the one wrapping the subject name + chips), NOT the outer droppable `Box`. Set its ref + attributes + listeners and a grab cursor:

```tsx
      ) : state.kind === "placed" && entry ? (
        <Box
          ref={draggable.setNodeRef}
          {...draggable.attributes}
          {...draggable.listeners}
          sx={{
            cursor: readOnly ? "default" : draggable.isDragging ? "grabbing" : "grab",
            opacity: draggable.isDragging ? 0.5 : 1,
          }}
        >
```

  Keep the inner structure (the flex row with `CheckCircleIcon`, name, and the ✕ `IconButton`, then the chips) unchanged. The ✕ button stays a child; PointerSensor's 10px distance keeps a click from starting a drag, so remove still works.

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck 2>&1 | grep -E "@grid/page"`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add "src/app/schedule/[academicYear]/[semester]/arrange/@grid/page.tsx"
git commit -m "feat(arrange): placed cell is a drag source — enables grid→grid move"
```

---

### Task 4: Wire-up verification (browser)

**Files:** none (verification only)

- [ ] **Step 1:** Dev server + seeded DB up, logged in. Open `/schedule/2568/1/arrange?teacher=14` (a fully-placed teacher) so the grid has placed classes.
- [ ] **Step 2:** Drag a placed class to an empty cell where its room is free → moves with no modal, success toast "ย้ายรายวิชาสำเร็จ", source cell empties, target shows the class with the SAME room. (Verify via the dnd-kit live-region `[role="status"]` announcing dropped-over, and the cell contents swapping.)
- [ ] **Step 3:** Drag a placed class onto an occupied cell → conflict modal (no move). Onto a break/lunch cell → rejected (droppable disabled). Onto its own cell → no-op (nothing changes).
- [ ] **Step 4:** Click the ✕ on a placed cell → still removes (drag did not swallow the click).
- [ ] **Step 5:** Switch to มุมมองชั้นเรียน (class view, `readOnly`) → placed cells are not draggable (no grab cursor, drag does nothing).
- [ ] **Step 6:** Console: no new errors (pre-existing Navbar hydration-dot mismatch is out of scope). `pnpm typecheck 2>&1 | grep -cE "^src/"` → 0. Run `pnpm exec vitest run "src/app/schedule/[academicYear]/[semester]/arrange/_lib"`.
- [ ] **Step 7:** No commit (verification).

---

## Self-Review

**Spec coverage:** placed cell as drag source (T3); `handleDragEnd` branch on `kind` (T2); move via `updateClassScheduleAction` keep-room (T2); room re-pick only when taken — `move-pick-room` → room modal with `moveClassId` (T1 decision + T2 modal + RoomSelectionContent); occupied → conflict modal (T2); self-drop guard via `FromTimeslotID` (T1 `noop` + T3 data); palette `kind:"subject"` discriminator (T2); hook-safety unconditional `useDraggable` + `disabled` (T3); class-view readOnly non-draggable (T3 `disabled`); drag overlay uses SubjectName/GradeName carried in placement data (T3). All spec sections mapped.

**Placeholder scan:** T1 full code+tests. T2/T3 are existing-file edits with the exact code blocks and insertion points (read-first steps are inherent to editing the real files, not deferred work). No "TBD"/"handle edge cases".

**Type consistency:** placement data shape defined in T3 matches what T2's branch reads (`ClassID`, `SubjectCode`, `GradeID`, `RoomID`, `FromTimeslotID`); `planPlacementMove` signature (T1) matches its call in T2; `moveClassId` flows RoomModalState (T2 ArrangeDndProvider) → RoomSelectionContent prop (T2). `updateClassScheduleAction({ ClassID, TimeslotID, RoomID? })` matches `updateClassScheduleSchema`.
