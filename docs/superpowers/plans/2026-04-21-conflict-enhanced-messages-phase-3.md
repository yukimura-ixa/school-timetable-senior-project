# Phase 3 — Enhanced Conflict Messages with Suggestions — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a drag-drop placement in the arrange grid is rejected by the existing conflict detector, open a modal that shows *why* the placement conflicts using data on `ConflictResult.conflictingSchedule` and offers up to three ranked resolution suggestions (MOVE / RE_ROOM / SWAP) the user can apply in one click.

**Architecture:** New pure `conflict-resolver.service` (domain) computes ranked candidates by re-running the existing `checkAllConflicts` per alternative. A new admin-gated `suggestResolutionAction` server action parallel-loads room/timeslot/schedule/responsibility repositories, builds a `ResolutionContext`, and calls the resolver. A new `ConflictDetailsModal` (MUI Dialog) renders conflict context and ranked suggestions; apply dispatches back through existing `saveScheduleAction` / `updateScheduleAction`. No new writes in the resolver layer.

**Tech Stack:** TypeScript, Next.js 16 App Router, React 19, Prisma 7, Valibot, MUI 7, SWR, vitest, @testing-library/react, Playwright.

**Spec:** `docs/superpowers/specs/2026-04-21-conflict-enhanced-messages-phase-3-design.md`

**Spec deviation (intentional):** Spec §5 mentions "run existing `moe-validation.ts` helpers before accepting a MOVE candidate". `src/utils/moe-validation.ts` currently only exposes program-level `validateProgramStandards`, not a per-slot helper. This plan narrows the MOE guard to "re-run `checkAllConflicts` per candidate" — which the existing detector already performs (teacher double-book, class double-book, room double-book, locked-slot, unassigned-teacher). A separate lightweight MOE helper can be wired in later without changing the resolver's external shape.

---

## File Structure

**Create:**
- `src/features/schedule-arrangement/domain/services/conflict-resolver.service.ts`
- `src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`
- `src/features/schedule-arrangement/application/actions/conflict-resolution.actions.ts`
- `src/features/schedule-arrangement/application/actions/conflict-resolution.actions.test.ts`
- `src/features/schedule-arrangement/application/schemas/conflict-resolution.schemas.ts`
- `src/features/schedule-arrangement/presentation/components/ConflictSuggestionList.tsx`
- `src/features/schedule-arrangement/presentation/components/ConflictSuggestionList.test.tsx`
- `src/features/schedule-arrangement/presentation/components/ConflictDetailsModal.tsx`
- `src/features/schedule-arrangement/presentation/components/ConflictDetailsModal.test.tsx`
- `src/features/schedule-arrangement/presentation/hooks/useConflictResolution.ts`
- `e2e/fixtures/conflict-seed.fixture.ts`
- `e2e/conflict-resolution.spec.ts`

**Modify:**
- `src/features/schedule-arrangement/domain/models/conflict.model.ts` — append resolution types
- `src/features/schedule-arrangement/presentation/hooks/index.ts` — export new hook
- `src/app/schedule/[academicYear]/[semester]/arrange/@grid/...` (exact file identified in Task 15) — wire modal on conflict

---

## Task 1: Extend domain model with ResolutionSuggestion types

**Files:**
- Modify: `src/features/schedule-arrangement/domain/models/conflict.model.ts` (append after line 145)

- [ ] **Step 1: Append resolution types to conflict model**

Append to `src/features/schedule-arrangement/domain/models/conflict.model.ts`:

```ts
/**
 * Kinds of resolution suggestions the resolver can produce.
 */
export type ResolutionKind = "MOVE" | "RE_ROOM" | "SWAP";

export interface MoveSuggestion {
  kind: "MOVE";
  /** Target timeslot (same subject, same class, same room). */
  targetTimeslotId: string;
  rationale: string;
  confidence: number; // 0..1
}

export interface ReRoomSuggestion {
  kind: "RE_ROOM";
  /** Keep original slot, switch to this room. */
  targetRoomId: number;
  targetRoomName: string;
  rationale: string;
  confidence: number;
}

export interface SwapSuggestion {
  kind: "SWAP";
  /** Slot currently occupied by the counterpart (to be swapped into). */
  counterpartTimeslotId: string;
  /** ClassID of the schedule that will be displaced by the swap. */
  counterpartClassId: number;
  /** Subject code of the displaced schedule — for UI display. */
  counterpartSubjectCode: string;
  rationale: string;
  confidence: number;
}

export type ResolutionSuggestion =
  | MoveSuggestion
  | ReRoomSuggestion
  | SwapSuggestion;

/**
 * Lightweight room projection used by the resolver.
 */
export interface RoomOption {
  roomId: number;
  roomName: string;
}

/**
 * Lightweight timeslot projection used by the resolver.
 * Only fields the resolver actually uses are required.
 */
export interface TimeslotOption {
  timeslotId: string;
  dayOfWeek: string;
  /** Arbitrary ordering within a day; resolver uses it for distance weighting. */
  slotNumber: number;
  /** Breaks and lunches are excluded from MOVE candidates. */
  isBreaktime?: boolean;
}

/**
 * All the data the pure resolver needs. Built by the server action from
 * repository queries; the resolver itself is deterministic and I/O-free.
 */
export interface ResolutionContext {
  conflict: ConflictResult;
  attempt: ScheduleArrangementInput;
  existingSchedules: ExistingSchedule[];
  responsibilities: TeacherResponsibility[];
  availableRooms: RoomOption[];
  allTimeslots: TimeslotOption[];
}
```

- [ ] **Step 2: Typecheck passes**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/schedule-arrangement/domain/models/conflict.model.ts
git commit -m "feat(conflict): add ResolutionSuggestion types for phase 3"
```

---

## Task 2: Create failing resolver test scaffolding

**Files:**
- Create: `src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`

- [ ] **Step 1: Write the failing test file**

```ts
// src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts
import { describe, it, expect } from "vitest";
import { suggestResolutions } from "./conflict-resolver.service";
import { ConflictType } from "../models/conflict.model";
import type {
  ResolutionContext,
  ScheduleArrangementInput,
  ExistingSchedule,
  TeacherResponsibility,
  RoomOption,
  TimeslotOption,
  ConflictResult,
} from "../models/conflict.model";

function makeAttempt(over: Partial<ScheduleArrangementInput> = {}): ScheduleArrangementInput {
  return {
    timeslotId: "1-2567-MON-1",
    subjectCode: "MATH101",
    gradeId: "M1-1",
    teacherId: 1,
    roomId: 10,
    academicYear: 2567,
    semester: "SEMESTER_1",
    ...over,
  };
}

function makeCtx(over: Partial<ResolutionContext> = {}): ResolutionContext {
  const conflict: ConflictResult = {
    hasConflict: false,
    conflictType: ConflictType.NONE,
    message: "",
  };
  return {
    conflict,
    attempt: makeAttempt(),
    existingSchedules: [],
    responsibilities: [],
    availableRooms: [],
    allTimeslots: [],
    ...over,
  };
}

describe("suggestResolutions", () => {
  it("returns [] when conflict has hasConflict=false", () => {
    expect(suggestResolutions(makeCtx())).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test, verify failure (module not found)**

Run: `pnpm vitest run src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`
Expected: FAIL — "Cannot find module './conflict-resolver.service'".

---

## Task 3: Resolver skeleton — no-conflict early return

**Files:**
- Create: `src/features/schedule-arrangement/domain/services/conflict-resolver.service.ts`

- [ ] **Step 1: Write minimal resolver**

```ts
// src/features/schedule-arrangement/domain/services/conflict-resolver.service.ts
import type {
  ResolutionContext,
  ResolutionSuggestion,
} from "../models/conflict.model";

export interface SuggestOptions {
  maxSuggestions?: number;
}

/**
 * Pure, deterministic ranker. Given a conflict context, return up to N ranked
 * resolution suggestions. No I/O, no React, no Prisma.
 */
export function suggestResolutions(
  ctx: ResolutionContext,
  opts: SuggestOptions = {},
): ResolutionSuggestion[] {
  if (!ctx.conflict.hasConflict) return [];
  const _max = opts.maxSuggestions ?? 3;
  // Candidate generation filled in by subsequent tasks.
  return [];
}
```

- [ ] **Step 2: Run test, verify pass**

Run: `pnpm vitest run src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`
Expected: PASS (1 test).

- [ ] **Step 3: Commit**

```bash
git add src/features/schedule-arrangement/domain/services/conflict-resolver.service.ts src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts
git commit -m "feat(conflict): add conflict-resolver skeleton with no-conflict early return"
```

---

## Task 4: Resolver — RE_ROOM suggestions for ROOM_CONFLICT

**Files:**
- Modify: `src/features/schedule-arrangement/domain/services/conflict-resolver.service.ts`
- Modify: `src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`

- [ ] **Step 1: Add failing tests for RE_ROOM**

Append to `conflict-resolver.service.test.ts`:

```ts
describe("RE_ROOM suggestions", () => {
  const roomBusySchedule: ExistingSchedule = {
    classId: 99,
    timeslotId: "1-2567-MON-1",
    subjectCode: "ENG101",
    subjectName: "English",
    roomId: 10,
    roomName: "R-10",
    gradeId: "M1-2",
    isLocked: false,
  };

  const rooms: RoomOption[] = [
    { roomId: 10, roomName: "R-10" },
    { roomId: 11, roomName: "R-11" },
    { roomId: 12, roomName: "R-12" },
  ];

  it("proposes RE_ROOM when conflict is ROOM_CONFLICT and at least one room is free in the same slot", () => {
    const ctx = makeCtx({
      conflict: {
        hasConflict: true,
        conflictType: ConflictType.ROOM_CONFLICT,
        message: "Room occupied",
      },
      attempt: makeAttempt({ roomId: 10, timeslotId: "1-2567-MON-1" }),
      existingSchedules: [roomBusySchedule],
      availableRooms: rooms,
    });

    const result = suggestResolutions(ctx, { maxSuggestions: 3 });
    const roomIds = result
      .filter((s): s is Extract<ResolutionSuggestion, { kind: "RE_ROOM" }> => s.kind === "RE_ROOM")
      .map((s) => s.targetRoomId);
    expect(roomIds).toEqual([11, 12]);
  });

  it("does not propose RE_ROOM for non-ROOM conflict types", () => {
    const ctx = makeCtx({
      conflict: {
        hasConflict: true,
        conflictType: ConflictType.TEACHER_CONFLICT,
        message: "Teacher busy",
      },
      attempt: makeAttempt(),
      existingSchedules: [roomBusySchedule],
      availableRooms: rooms,
    });

    const result = suggestResolutions(ctx);
    expect(result.find((s) => s.kind === "RE_ROOM")).toBeUndefined();
  });

  it("returns no RE_ROOM when availableRooms is empty", () => {
    const ctx = makeCtx({
      conflict: {
        hasConflict: true,
        conflictType: ConflictType.ROOM_CONFLICT,
        message: "Room occupied",
      },
      attempt: makeAttempt({ roomId: 10 }),
      existingSchedules: [roomBusySchedule],
      availableRooms: [],
    });

    expect(suggestResolutions(ctx)).toEqual([]);
  });
});
```

Also add the missing type import at the top of the file:

```ts
import type { ResolutionSuggestion } from "../models/conflict.model";
```

- [ ] **Step 2: Run tests, verify failures**

Run: `pnpm vitest run src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`
Expected: 3 new tests FAIL (empty arrays / missing kind).

- [ ] **Step 3: Implement RE_ROOM generator**

Replace the body of `suggestResolutions` in `conflict-resolver.service.ts`:

```ts
import { ConflictType } from "../models/conflict.model";
import type {
  ExistingSchedule,
  ResolutionContext,
  ResolutionSuggestion,
  ReRoomSuggestion,
  RoomOption,
} from "../models/conflict.model";

export interface SuggestOptions {
  maxSuggestions?: number;
}

function roomsBusyAt(
  schedules: ExistingSchedule[],
  timeslotId: string,
): Set<number> {
  const busy = new Set<number>();
  for (const s of schedules) {
    if (s.timeslotId === timeslotId && s.roomId != null) {
      busy.add(s.roomId);
    }
  }
  return busy;
}

function generateReRoom(
  ctx: ResolutionContext,
): ReRoomSuggestion[] {
  if (ctx.conflict.conflictType !== ConflictType.ROOM_CONFLICT) return [];
  const busy = roomsBusyAt(ctx.existingSchedules, ctx.attempt.timeslotId);
  const out: ReRoomSuggestion[] = [];
  for (const room of ctx.availableRooms) {
    if (busy.has(room.roomId)) continue;
    if (room.roomId === ctx.attempt.roomId) continue; // current conflicting room
    out.push({
      kind: "RE_ROOM",
      targetRoomId: room.roomId,
      targetRoomName: room.roomName,
      rationale: `ย้ายไปห้อง ${room.roomName} (คาบเดิม)`,
      confidence: 0.9,
    });
  }
  return out;
}

export function suggestResolutions(
  ctx: ResolutionContext,
  opts: SuggestOptions = {},
): ResolutionSuggestion[] {
  if (!ctx.conflict.hasConflict) return [];
  const max = opts.maxSuggestions ?? 3;

  const reRoom = generateReRoom(ctx);
  const all: ResolutionSuggestion[] = [...reRoom];

  // Stable sort by confidence desc.
  all.sort((a, b) => b.confidence - a.confidence);
  return all.slice(0, max);
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `pnpm vitest run src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`
Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/schedule-arrangement/domain/services/conflict-resolver.service.ts src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts
git commit -m "feat(conflict): add RE_ROOM suggestions for room conflicts"
```

---

## Task 5: Resolver — MOVE same-day candidates

**Files:**
- Modify: `src/features/schedule-arrangement/domain/services/conflict-resolver.service.ts`
- Modify: `src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`

- [ ] **Step 1: Add failing tests for MOVE same-day**

Append to the test file:

```ts
describe("MOVE same-day suggestions", () => {
  const timeslots: TimeslotOption[] = [
    { timeslotId: "1-2567-MON-1", dayOfWeek: "MON", slotNumber: 1 },
    { timeslotId: "1-2567-MON-2", dayOfWeek: "MON", slotNumber: 2 },
    { timeslotId: "1-2567-MON-3", dayOfWeek: "MON", slotNumber: 3, isBreaktime: true },
    { timeslotId: "1-2567-MON-4", dayOfWeek: "MON", slotNumber: 4 },
    { timeslotId: "1-2567-TUE-1", dayOfWeek: "TUE", slotNumber: 1 },
  ];

  const responsibility: TeacherResponsibility = {
    respId: 1,
    teacherId: 1,
    gradeId: "M1-1",
    subjectCode: "MATH101",
    academicYear: 2567,
    semester: "SEMESTER_1",
    teachHour: 2,
  };

  it("proposes MOVE to an empty same-day non-break slot", () => {
    const ctx = makeCtx({
      conflict: {
        hasConflict: true,
        conflictType: ConflictType.TEACHER_CONFLICT,
        message: "Teacher busy",
      },
      attempt: makeAttempt({ timeslotId: "1-2567-MON-1" }),
      existingSchedules: [],
      responsibilities: [responsibility],
      allTimeslots: timeslots,
    });

    const moves = suggestResolutions(ctx, { maxSuggestions: 5 }).filter(
      (s): s is Extract<ResolutionSuggestion, { kind: "MOVE" }> => s.kind === "MOVE",
    );
    const targets = moves.map((m) => m.targetTimeslotId);
    expect(targets).toContain("1-2567-MON-2");
    expect(targets).toContain("1-2567-MON-4");
    expect(targets).not.toContain("1-2567-MON-3"); // break slot
    expect(targets).not.toContain("1-2567-MON-1"); // original (conflicting) slot
  });

  it("ranks nearer periods higher than farther periods on same day", () => {
    const ctx = makeCtx({
      conflict: {
        hasConflict: true,
        conflictType: ConflictType.TEACHER_CONFLICT,
        message: "Teacher busy",
      },
      attempt: makeAttempt({ timeslotId: "1-2567-MON-1" }),
      existingSchedules: [],
      responsibilities: [responsibility],
      allTimeslots: timeslots,
    });

    const moves = suggestResolutions(ctx, { maxSuggestions: 5 }).filter(
      (s): s is Extract<ResolutionSuggestion, { kind: "MOVE" }> => s.kind === "MOVE",
    );
    const mon2 = moves.find((m) => m.targetTimeslotId === "1-2567-MON-2");
    const mon4 = moves.find((m) => m.targetTimeslotId === "1-2567-MON-4");
    expect(mon2 && mon4).toBeTruthy();
    expect(mon2!.confidence).toBeGreaterThan(mon4!.confidence);
  });
});
```

- [ ] **Step 2: Run, verify failures**

Run: `pnpm vitest run src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`
Expected: 2 new tests FAIL.

- [ ] **Step 3: Implement MOVE same-day using re-run of detector**

Add to `conflict-resolver.service.ts` above `suggestResolutions`:

```ts
import { checkAllConflicts } from "./conflict-detector.service";
import type { MoveSuggestion, TimeslotOption } from "../models/conflict.model";

function slotNumberOf(
  allTimeslots: TimeslotOption[],
  timeslotId: string,
): number | null {
  return (
    allTimeslots.find((t) => t.timeslotId === timeslotId)?.slotNumber ?? null
  );
}

function dayOf(
  allTimeslots: TimeslotOption[],
  timeslotId: string,
): string | null {
  return allTimeslots.find((t) => t.timeslotId === timeslotId)?.dayOfWeek ?? null;
}

function generateMoveCandidates(
  ctx: ResolutionContext,
  sameDay: boolean,
): MoveSuggestion[] {
  const originSlot = slotNumberOf(ctx.allTimeslots, ctx.attempt.timeslotId);
  const originDay = dayOf(ctx.allTimeslots, ctx.attempt.timeslotId);
  if (originSlot === null || originDay === null) return [];

  const candidates = ctx.allTimeslots.filter((t) => {
    if (t.timeslotId === ctx.attempt.timeslotId) return false;
    if (t.isBreaktime) return false;
    const onSameDay = t.dayOfWeek === originDay;
    return sameDay ? onSameDay : !onSameDay;
  });

  const out: MoveSuggestion[] = [];
  for (const slot of candidates) {
    const altAttempt = { ...ctx.attempt, timeslotId: slot.timeslotId };
    const result = checkAllConflicts(
      altAttempt,
      ctx.existingSchedules,
      ctx.responsibilities,
    );
    if (result.hasConflict) continue;

    const distance = Math.abs(slot.slotNumber - originSlot);
    // Same-day: 0.80 adjacent → ~0.70 far. Cross-day: 0.65 → ~0.50.
    const base = sameDay ? 0.8 : 0.65;
    const confidence = Math.max(base - 0.02 * distance, sameDay ? 0.7 : 0.5);

    out.push({
      kind: "MOVE",
      targetTimeslotId: slot.timeslotId,
      rationale: sameDay
        ? `ย้ายไปคาบ ${slot.slotNumber} วัน${slot.dayOfWeek}`
        : `ย้ายไปวัน${slot.dayOfWeek} คาบ ${slot.slotNumber}`,
      confidence,
    });
  }
  return out;
}
```

Update `suggestResolutions`:

```ts
export function suggestResolutions(
  ctx: ResolutionContext,
  opts: SuggestOptions = {},
): ResolutionSuggestion[] {
  if (!ctx.conflict.hasConflict) return [];
  const max = opts.maxSuggestions ?? 3;

  const all: ResolutionSuggestion[] = [
    ...generateReRoom(ctx),
    ...generateMoveCandidates(ctx, true),
  ];

  all.sort((a, b) => b.confidence - a.confidence);
  return all.slice(0, max);
}
```

- [ ] **Step 4: Run all resolver tests, verify pass**

Run: `pnpm vitest run src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`
Expected: 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/schedule-arrangement/domain/services/conflict-resolver.service.ts src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts
git commit -m "feat(conflict): add MOVE same-day candidates with distance-weighted confidence"
```

---

## Task 6: Resolver — MOVE cross-day fallthrough

**Files:**
- Modify: `src/features/schedule-arrangement/domain/services/conflict-resolver.service.ts`
- Modify: `src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`

- [ ] **Step 1: Add failing test**

Append to test file:

```ts
describe("MOVE cross-day fallthrough", () => {
  it("includes cross-day MOVE candidates when same-day yields fewer than maxSuggestions", () => {
    const tightSameDaySlots: TimeslotOption[] = [
      { timeslotId: "1-2567-MON-1", dayOfWeek: "MON", slotNumber: 1 },
      { timeslotId: "1-2567-TUE-1", dayOfWeek: "TUE", slotNumber: 1 },
      { timeslotId: "1-2567-TUE-2", dayOfWeek: "TUE", slotNumber: 2 },
      { timeslotId: "1-2567-WED-1", dayOfWeek: "WED", slotNumber: 1 },
    ];
    const responsibility: TeacherResponsibility = {
      respId: 1,
      teacherId: 1,
      gradeId: "M1-1",
      subjectCode: "MATH101",
      academicYear: 2567,
      semester: "SEMESTER_1",
      teachHour: 2,
    };
    const ctx = makeCtx({
      conflict: {
        hasConflict: true,
        conflictType: ConflictType.TEACHER_CONFLICT,
        message: "Teacher busy",
      },
      attempt: makeAttempt({ timeslotId: "1-2567-MON-1" }),
      responsibilities: [responsibility],
      allTimeslots: tightSameDaySlots,
    });

    const result = suggestResolutions(ctx, { maxSuggestions: 3 });
    const targets = result
      .filter((s): s is Extract<ResolutionSuggestion, { kind: "MOVE" }> => s.kind === "MOVE")
      .map((s) => s.targetTimeslotId);
    expect(targets).toEqual(expect.arrayContaining(["1-2567-TUE-1", "1-2567-WED-1"]));
  });
});
```

- [ ] **Step 2: Run, verify failure**

Run: `pnpm vitest run src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`
Expected: new test FAILS (no cross-day suggestions yet).

- [ ] **Step 3: Wire cross-day into suggestResolutions**

Replace body of `suggestResolutions`:

```ts
export function suggestResolutions(
  ctx: ResolutionContext,
  opts: SuggestOptions = {},
): ResolutionSuggestion[] {
  if (!ctx.conflict.hasConflict) return [];
  const max = opts.maxSuggestions ?? 3;

  const reRoom = generateReRoom(ctx);
  const moveSameDay = generateMoveCandidates(ctx, true);
  const needCrossDay = reRoom.length + moveSameDay.length < max;
  const moveCrossDay = needCrossDay ? generateMoveCandidates(ctx, false) : [];

  const all: ResolutionSuggestion[] = [...reRoom, ...moveSameDay, ...moveCrossDay];
  all.sort((a, b) => b.confidence - a.confidence);
  return all.slice(0, max);
}
```

- [ ] **Step 4: Run tests, verify all pass**

Run: `pnpm vitest run src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`
Expected: 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/schedule-arrangement/domain/services/conflict-resolver.service.ts src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts
git commit -m "feat(conflict): add MOVE cross-day fallthrough when same-day quota insufficient"
```

---

## Task 7: Resolver — SWAP fallthrough

**Files:**
- Modify: `src/features/schedule-arrangement/domain/services/conflict-resolver.service.ts`
- Modify: `src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`

- [ ] **Step 1: Add failing test**

Append to test file:

```ts
describe("SWAP fallthrough", () => {
  const slots: TimeslotOption[] = [
    { timeslotId: "1-2567-MON-1", dayOfWeek: "MON", slotNumber: 1 },
    { timeslotId: "1-2567-MON-2", dayOfWeek: "MON", slotNumber: 2 },
  ];

  const responsibility: TeacherResponsibility = {
    respId: 1,
    teacherId: 1,
    gradeId: "M1-1",
    subjectCode: "MATH101",
    academicYear: 2567,
    semester: "SEMESTER_1",
    teachHour: 2,
  };

  it("proposes SWAP with the schedule blocking the attempt slot when MOVE is exhausted", () => {
    // Only two slots exist. MON-1 has the teacher double-booked by an existing
    // schedule (classId 42). MON-2 is free for this grade+teacher. After
    // MOVE same-day exhausts, SWAP with the blocker should appear.
    const blocker: ExistingSchedule = {
      classId: 42,
      timeslotId: "1-2567-MON-1",
      subjectCode: "ENG101",
      subjectName: "English",
      roomId: 99,
      roomName: "R-99",
      gradeId: "M1-2",
      isLocked: false,
      teacherId: 1, // same teacher → teacher conflict
      teacherName: "T-1",
    };

    const ctx = makeCtx({
      conflict: {
        hasConflict: true,
        conflictType: ConflictType.TEACHER_CONFLICT,
        message: "Teacher busy",
      },
      attempt: makeAttempt({
        timeslotId: "1-2567-MON-1",
        teacherId: 1,
        gradeId: "M1-1",
      }),
      existingSchedules: [blocker],
      responsibilities: [responsibility],
      allTimeslots: slots,
    });

    const result = suggestResolutions(ctx, { maxSuggestions: 3 });
    const swaps = result.filter(
      (s): s is Extract<ResolutionSuggestion, { kind: "SWAP" }> => s.kind === "SWAP",
    );
    expect(swaps.length).toBeGreaterThan(0);
    expect(swaps[0]!.counterpartClassId).toBe(42);
    expect(swaps[0]!.counterpartSubjectCode).toBe("ENG101");
  });
});
```

- [ ] **Step 2: Run, verify failure**

Run: `pnpm vitest run src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`
Expected: new test FAILS.

- [ ] **Step 3: Implement SWAP generator**

Append to `conflict-resolver.service.ts`:

```ts
import type { SwapSuggestion } from "../models/conflict.model";

function findBlockersAt(
  schedules: ExistingSchedule[],
  timeslotId: string,
): ExistingSchedule[] {
  return schedules.filter((s) => s.timeslotId === timeslotId);
}

function generateSwap(
  ctx: ResolutionContext,
  emptyMoveCandidates: readonly string[],
): SwapSuggestion[] {
  const blockers = findBlockersAt(
    ctx.existingSchedules,
    ctx.attempt.timeslotId,
  );
  const out: SwapSuggestion[] = [];

  for (const blocker of blockers) {
    for (const targetSlotId of emptyMoveCandidates) {
      // Check: moving attempt into target slot is already known to be conflict
      // free (that's why it's in emptyMoveCandidates). Additionally check that
      // moving the blocker into the original attempt slot is conflict-free.
      // Since the blocker is currently at attempt.timeslotId, removing it
      // there and placing it at its new slot requires a detector re-run
      // excluding the blocker and the attempt.
      const blockerAttempt: ScheduleArrangementInput = {
        classId: blocker.classId,
        timeslotId: targetSlotId,
        subjectCode: blocker.subjectCode,
        gradeId: blocker.gradeId,
        teacherId: blocker.teacherId,
        roomId: blocker.roomId ?? null,
        academicYear: ctx.attempt.academicYear,
        semester: ctx.attempt.semester,
      };
      const others = ctx.existingSchedules.filter(
        (s) => s.classId !== blocker.classId,
      );
      const check = checkAllConflicts(
        blockerAttempt,
        others,
        ctx.responsibilities,
      );
      if (check.hasConflict) continue;

      out.push({
        kind: "SWAP",
        counterpartTimeslotId: targetSlotId,
        counterpartClassId: blocker.classId,
        counterpartSubjectCode: blocker.subjectCode,
        rationale: `สลับกับ ${blocker.subjectCode}`,
        confidence: 0.5,
      });
      break; // one swap per blocker is enough
    }
  }
  return out;
}
```

Replace body of `suggestResolutions`:

```ts
import type { ScheduleArrangementInput } from "../models/conflict.model";

export function suggestResolutions(
  ctx: ResolutionContext,
  opts: SuggestOptions = {},
): ResolutionSuggestion[] {
  if (!ctx.conflict.hasConflict) return [];
  const max = opts.maxSuggestions ?? 3;

  const reRoom = generateReRoom(ctx);
  const moveSameDay = generateMoveCandidates(ctx, true);
  const needCrossDay = reRoom.length + moveSameDay.length < max;
  const moveCrossDay = needCrossDay ? generateMoveCandidates(ctx, false) : [];

  const moveCount = moveSameDay.length + moveCrossDay.length;
  const needSwap = moveCount < 3;

  const moveTargets = [...moveSameDay, ...moveCrossDay].map(
    (m) => m.targetTimeslotId,
  );
  // For SWAP, we need any conflict-free alternative slot, not just MOVE
  // destinations. Fall back to *all* non-break slots if MOVE produced none.
  const swapTargets: string[] =
    moveTargets.length > 0
      ? moveTargets
      : ctx.allTimeslots
          .filter(
            (t) =>
              !t.isBreaktime && t.timeslotId !== ctx.attempt.timeslotId,
          )
          .map((t) => t.timeslotId);

  const swap = needSwap ? generateSwap(ctx, swapTargets) : [];

  const all: ResolutionSuggestion[] = [
    ...reRoom,
    ...moveSameDay,
    ...moveCrossDay,
    ...swap,
  ];
  all.sort((a, b) => b.confidence - a.confidence);
  return all.slice(0, max);
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `pnpm vitest run src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`
Expected: 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/schedule-arrangement/domain/services/conflict-resolver.service.ts src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts
git commit -m "feat(conflict): add SWAP fallthrough suggestions"
```

---

## Task 8: Resolver — maxSuggestions cap and stable sort

**Files:**
- Modify: `src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`

- [ ] **Step 1: Add failing regression tests**

Append:

```ts
describe("ranking and cap", () => {
  it("respects maxSuggestions cap", () => {
    const manySlots: TimeslotOption[] = Array.from({ length: 10 }, (_, i) => ({
      timeslotId: `1-2567-MON-${i + 1}`,
      dayOfWeek: "MON",
      slotNumber: i + 1,
    }));
    const responsibility: TeacherResponsibility = {
      respId: 1,
      teacherId: 1,
      gradeId: "M1-1",
      subjectCode: "MATH101",
      academicYear: 2567,
      semester: "SEMESTER_1",
      teachHour: 2,
    };
    const ctx = makeCtx({
      conflict: {
        hasConflict: true,
        conflictType: ConflictType.TEACHER_CONFLICT,
        message: "Teacher busy",
      },
      attempt: makeAttempt({ timeslotId: "1-2567-MON-1" }),
      responsibilities: [responsibility],
      allTimeslots: manySlots,
    });

    expect(suggestResolutions(ctx, { maxSuggestions: 3 })).toHaveLength(3);
    expect(suggestResolutions(ctx, { maxSuggestions: 1 })).toHaveLength(1);
  });

  it("sorts by confidence descending", () => {
    const slots: TimeslotOption[] = [
      { timeslotId: "1-2567-MON-1", dayOfWeek: "MON", slotNumber: 1 },
      { timeslotId: "1-2567-MON-2", dayOfWeek: "MON", slotNumber: 2 },
      { timeslotId: "1-2567-TUE-5", dayOfWeek: "TUE", slotNumber: 5 },
    ];
    const responsibility: TeacherResponsibility = {
      respId: 1,
      teacherId: 1,
      gradeId: "M1-1",
      subjectCode: "MATH101",
      academicYear: 2567,
      semester: "SEMESTER_1",
      teachHour: 2,
    };
    const ctx = makeCtx({
      conflict: {
        hasConflict: true,
        conflictType: ConflictType.TEACHER_CONFLICT,
        message: "Teacher busy",
      },
      attempt: makeAttempt({ timeslotId: "1-2567-MON-1" }),
      responsibilities: [responsibility],
      allTimeslots: slots,
    });

    const result = suggestResolutions(ctx, { maxSuggestions: 5 });
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1]!.confidence).toBeGreaterThanOrEqual(
        result[i]!.confidence,
      );
    }
  });
});
```

- [ ] **Step 2: Run, verify pass (cap + sort already work)**

Run: `pnpm vitest run src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts`
Expected: 10 tests PASS. If any fail, revisit `suggestResolutions` body.

- [ ] **Step 3: Commit**

```bash
git add src/features/schedule-arrangement/domain/services/conflict-resolver.service.test.ts
git commit -m "test(conflict): pin resolver sort + maxSuggestions cap behaviour"
```

---

## Task 9: Valibot schema for resolution action

**Files:**
- Create: `src/features/schedule-arrangement/application/schemas/conflict-resolution.schemas.ts`

- [ ] **Step 1: Create schema file**

```ts
// src/features/schedule-arrangement/application/schemas/conflict-resolution.schemas.ts
import * as v from "valibot";

export const suggestResolutionSchema = v.object({
  AcademicYear: v.pipe(
    v.number(),
    v.minValue(2500, "ปีการศึกษาต้องไม่ต่ำกว่า 2500"),
    v.maxValue(3000, "ปีการศึกษาต้องไม่เกิน 3000"),
  ),
  Semester: v.picklist(["SEMESTER_1", "SEMESTER_2"], "เทอมไม่ถูกต้อง"),
  attempt: v.object({
    timeslotId: v.pipe(v.string(), v.minLength(1)),
    subjectCode: v.pipe(v.string(), v.minLength(1)),
    gradeId: v.pipe(v.string(), v.minLength(1)),
    teacherId: v.optional(v.pipe(v.number(), v.minValue(1))),
    roomId: v.optional(
      v.union([v.pipe(v.number(), v.minValue(1)), v.null()]),
    ),
    academicYear: v.pipe(v.number(), v.minValue(2500), v.maxValue(3000)),
    semester: v.picklist(["SEMESTER_1", "SEMESTER_2"]),
    classId: v.optional(v.pipe(v.number(), v.minValue(1))),
  }),
});

export type SuggestResolutionInput = v.InferInput<typeof suggestResolutionSchema>;
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/schedule-arrangement/application/schemas/conflict-resolution.schemas.ts
git commit -m "feat(conflict): valibot schema for suggestResolutionAction input"
```

---

## Task 10: Server action — tests first (mocked repos)

**Files:**
- Create: `src/features/schedule-arrangement/application/actions/conflict-resolution.actions.test.ts`

- [ ] **Step 1: Write failing tests**

Pattern mirrors existing `conflict.actions.test.ts`.

```ts
// src/features/schedule-arrangement/application/actions/conflict-resolution.actions.test.ts
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: vi.fn(() => ({})) }));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
  cookies: vi.fn(() => Promise.resolve({ get: vi.fn(), set: vi.fn() })),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() =>
        Promise.resolve({
          user: { id: "u1", email: "a@x", role: "admin" },
        }),
      ),
    },
  },
}));

vi.mock(
  "@/features/schedule-arrangement/domain/services/conflict-detector.service",
  () => ({
    checkAllConflicts: vi.fn(() => ({
      hasConflict: false,
      conflictType: "NONE",
      message: "",
    })),
  }),
);

vi.mock("@/features/room/infrastructure/repositories/room.repository", () => ({
  roomRepository: { findAll: vi.fn(() => Promise.resolve([])) },
}));

vi.mock("@/features/timeslot/infrastructure/repositories/timeslot.repository", () => ({
  timeslotRepository: { findByTerm: vi.fn(() => Promise.resolve([])) },
}));

vi.mock("@/features/conflict/infrastructure/repositories/conflict.repository", () => ({
  conflictRepository: {
    findSchedulesForSemester: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock(
  "@/features/teaching-assignment/infrastructure/repositories/teaching-assignment.repository",
  () => ({
    findAssignmentsByContext: vi.fn(() => Promise.resolve([])),
  }),
);

import { suggestResolutionAction } from "./conflict-resolution.actions";
import { checkAllConflicts } from "@/features/schedule-arrangement/domain/services/conflict-detector.service";

/* eslint-disable @typescript-eslint/unbound-method -- vitest mock references */
const mockCheck = checkAllConflicts as ReturnType<typeof vi.fn>;
/* eslint-enable @typescript-eslint/unbound-method */

const validInput = {
  AcademicYear: 2567,
  Semester: "SEMESTER_1" as const,
  attempt: {
    timeslotId: "1-2567-MON-1",
    subjectCode: "MATH101",
    gradeId: "M1-1",
    teacherId: 1,
    roomId: 10,
    academicYear: 2567,
    semester: "SEMESTER_1" as const,
  },
};

describe("suggestResolutionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-admin sessions", async () => {
    const authModule = await import("@/lib/auth");
    const getSession = vi.mocked(authModule.auth.api.getSession);
    getSession.mockResolvedValueOnce({
      user: { id: "u2", email: "s@x", role: "student" },
    } as never);

    const result = await suggestResolutionAction(validInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.code).toBe("FORBIDDEN");
    }
  });

  it("rejects malformed input (missing timeslotId)", async () => {
    const bad = { ...validInput, attempt: { ...validInput.attempt, timeslotId: "" } };
    const result = await suggestResolutionAction(bad);
    expect(result.success).toBe(false);
  });

  it("returns empty data when checkAllConflicts reports no conflict", async () => {
    mockCheck.mockReturnValueOnce({
      hasConflict: false,
      conflictType: "NONE",
      message: "",
    });
    const result = await suggestResolutionAction(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });

  it("returns suggestion list when conflict exists", async () => {
    mockCheck.mockReturnValueOnce({
      hasConflict: true,
      conflictType: "TEACHER_CONFLICT",
      message: "Teacher busy",
    });
    const result = await suggestResolutionAction(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run tests, verify failure (module missing)**

Run: `pnpm vitest run src/features/schedule-arrangement/application/actions/conflict-resolution.actions.test.ts`
Expected: FAIL — cannot resolve `./conflict-resolution.actions`.

---

## Task 11: Server action — implementation

**Files:**
- Create: `src/features/schedule-arrangement/application/actions/conflict-resolution.actions.ts`

- [ ] **Step 1: Implement action**

```ts
// src/features/schedule-arrangement/application/actions/conflict-resolution.actions.ts
"use server";

import { createAction } from "@/shared/lib/action-wrapper";
import { createLogger } from "@/lib/logger";
import {
  suggestResolutionSchema,
  type SuggestResolutionInput,
} from "../schemas/conflict-resolution.schemas";
import {
  suggestResolutions,
} from "@/features/schedule-arrangement/domain/services/conflict-resolver.service";
import { checkAllConflicts } from "@/features/schedule-arrangement/domain/services/conflict-detector.service";
import type {
  ExistingSchedule,
  ResolutionContext,
  RoomOption,
  TeacherResponsibility,
  TimeslotOption,
} from "@/features/schedule-arrangement/domain/models/conflict.model";
import { roomRepository } from "@/features/room/infrastructure/repositories/room.repository";
import { timeslotRepository } from "@/features/timeslot/infrastructure/repositories/timeslot.repository";

const log = createLogger("ConflictResolutionAction");

export const suggestResolutionAction = createAction(
  suggestResolutionSchema,
  async (input: SuggestResolutionInput) => {
    log.debug("suggestResolution input", {
      ts: input.attempt.timeslotId,
      sub: input.attempt.subjectCode,
    });

    const [rooms, timeslots, schedules, responsibilities] = await Promise.all([
      roomRepository.findAll(),
      timeslotRepository.findByTerm(
        input.AcademicYear,
        input.Semester as "SEMESTER_1" | "SEMESTER_2",
      ),
      loadSchedulesForTerm(input.AcademicYear, input.Semester),
      loadResponsibilitiesForTerm(input.AcademicYear, input.Semester),
    ]);

    const existingSchedules: ExistingSchedule[] = schedules;
    const resps: TeacherResponsibility[] = responsibilities;
    const availableRooms: RoomOption[] = rooms.map((r) => ({
      roomId: r.RoomID,
      roomName: r.RoomName,
    }));
    const allTimeslots: TimeslotOption[] = timeslots.map((t) => ({
      timeslotId: t.TimeslotID,
      dayOfWeek: t.DayOfWeek,
      slotNumber: t.SlotNumber,
      isBreaktime: t.Breaktime !== "NOT_BREAK",
    }));

    const conflict = checkAllConflicts(
      {
        ...input.attempt,
        academicYear: input.attempt.academicYear,
        semester: input.attempt.semester,
      },
      existingSchedules,
      resps,
    );

    if (!conflict.hasConflict) {
      return [];
    }

    const ctx: ResolutionContext = {
      conflict,
      attempt: {
        ...input.attempt,
        roomId: input.attempt.roomId ?? null,
      },
      existingSchedules,
      responsibilities: resps,
      availableRooms,
      allTimeslots,
    };

    return suggestResolutions(ctx, { maxSuggestions: 3 });
  },
);

// -------- helpers (intentionally inline; thin adapters around repos) ---------

async function loadSchedulesForTerm(
  academicYear: number,
  semester: "SEMESTER_1" | "SEMESTER_2",
): Promise<ExistingSchedule[]> {
  // Delegate to a conflict.repository method so we do not expose Prisma here.
  // Added in Task 11b if the method does not yet exist; see plan.
  const { conflictRepository } = await import(
    "@/features/conflict/infrastructure/repositories/conflict.repository"
  );
  const rows = await conflictRepository.findSchedulesForSemester(
    academicYear,
    semester,
  );
  return rows;
}

async function loadResponsibilitiesForTerm(
  academicYear: number,
  semester: "SEMESTER_1" | "SEMESTER_2",
): Promise<TeacherResponsibility[]> {
  const { findAssignmentsByContext } = await import(
    "@/features/teaching-assignment/infrastructure/repositories/teaching-assignment.repository"
  );
  const rows = await findAssignmentsByContext({
    academicYear,
    semester,
  });
  return rows.map((r) => ({
    respId: r.RespID,
    teacherId: r.TeacherID,
    gradeId: r.GradeID,
    subjectCode: r.SubjectCode,
    academicYear: r.AcademicYear,
    semester: r.Semester,
    teachHour: r.TeachHour,
  }));
}
```

- [ ] **Step 2: Run action tests, check state**

Run: `pnpm vitest run src/features/schedule-arrangement/application/actions/conflict-resolution.actions.test.ts`
Expected: tests likely fail with "findSchedulesForSemester is not a function" — we will add the repo method in Task 11b.

---

## Task 11b: Add `findSchedulesForSemester` to conflict repository

**Files:**
- Modify: `src/features/conflict/infrastructure/repositories/conflict.repository.ts`
- Modify: `src/features/teaching-assignment/infrastructure/repositories/teaching-assignment.repository.ts` (verify `findAssignmentsByContext` return shape includes required fields)

- [ ] **Step 1: Read existing findAllConflicts to model the new method on the same prisma query**

Open `src/features/conflict/infrastructure/repositories/conflict.repository.ts` lines 155–220. Copy the `prisma.class_schedule.findMany` block and extract it into a new method:

```ts
// append to conflictRepository:
async findSchedulesForSemester(
  academicYear: number,
  semester: "SEMESTER_1" | "SEMESTER_2",
): Promise<
  Array<{
    classId: number;
    timeslotId: string;
    subjectCode: string;
    subjectName: string;
    roomId: number | null;
    roomName?: string;
    gradeId: string;
    isLocked: boolean;
    teacherId?: number;
    teacherName?: string;
  }>
> {
  const rows = await prisma.class_schedule.findMany({
    where: {
      timeslot: { AcademicYear: academicYear, Semester: semester },
    },
    include: {
      subject: true,
      room: true,
      gradelevel: true,
      teachers_responsibility: { include: { teacher: true } },
    },
  });

  return rows.map((s) => {
    const resp = s.teachers_responsibility[0];
    const teacher = resp?.teacher;
    return {
      classId: s.ClassID,
      timeslotId: s.TimeslotID,
      subjectCode: s.SubjectCode,
      subjectName: s.subject?.SubjectName ?? "",
      roomId: s.RoomID ?? null,
      roomName: s.room?.RoomName,
      gradeId: s.GradeID,
      isLocked: s.IsLocked,
      teacherId: teacher?.TeacherID,
      teacherName: teacher
        ? `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`
        : undefined,
    };
  });
},
```

- [ ] **Step 2: Run action tests again**

Run: `pnpm vitest run src/features/schedule-arrangement/application/actions/conflict-resolution.actions.test.ts`
Expected: 4 tests PASS. (Mocks short-circuit the new repo method; runtime never reaches it.)

- [ ] **Step 3: Run resolver tests to confirm no regression**

Run: `pnpm vitest run src/features/schedule-arrangement/domain`
Expected: all 10 resolver tests still PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/conflict/infrastructure/repositories/conflict.repository.ts src/features/schedule-arrangement/application/actions/conflict-resolution.actions.ts src/features/schedule-arrangement/application/actions/conflict-resolution.actions.test.ts
git commit -m "feat(conflict): suggestResolutionAction + conflict repo findSchedulesForSemester"
```

---

## Task 12: ConflictSuggestionList component + tests

**Files:**
- Create: `src/features/schedule-arrangement/presentation/components/ConflictSuggestionList.tsx`
- Create: `src/features/schedule-arrangement/presentation/components/ConflictSuggestionList.test.tsx`

- [ ] **Step 1: Write failing component test**

```tsx
// ConflictSuggestionList.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ConflictSuggestionList from "./ConflictSuggestionList";
import type { ResolutionSuggestion } from "../../domain/models/conflict.model";

const suggestions: ResolutionSuggestion[] = [
  {
    kind: "RE_ROOM",
    targetRoomId: 11,
    targetRoomName: "R-11",
    rationale: "ย้ายไปห้อง R-11 (คาบเดิม)",
    confidence: 0.9,
  },
  {
    kind: "MOVE",
    targetTimeslotId: "1-2567-MON-2",
    rationale: "ย้ายไปคาบ 2 วันMON",
    confidence: 0.78,
  },
];

describe("ConflictSuggestionList", () => {
  it("renders one row per suggestion", () => {
    render(
      <ConflictSuggestionList
        suggestions={suggestions}
        isLoading={false}
        onApply={vi.fn()}
      />,
    );
    const rows = screen.getAllByTestId("conflict-suggestion-row");
    expect(rows).toHaveLength(2);
  });

  it("shows empty state when no suggestions", () => {
    render(
      <ConflictSuggestionList
        suggestions={[]}
        isLoading={false}
        onApply={vi.fn()}
      />,
    );
    expect(screen.getByText("ไม่พบข้อเสนอแนะ")).toBeDefined();
  });

  it("shows loading state", () => {
    render(
      <ConflictSuggestionList
        suggestions={[]}
        isLoading={true}
        onApply={vi.fn()}
      />,
    );
    expect(screen.getByRole("progressbar")).toBeDefined();
  });

  it("calls onApply with the right suggestion when apply clicked", () => {
    const onApply = vi.fn();
    render(
      <ConflictSuggestionList
        suggestions={suggestions}
        isLoading={false}
        onApply={onApply}
      />,
    );
    const buttons = screen.getAllByTestId("conflict-suggestion-apply");
    fireEvent.click(buttons[1]!);
    expect(onApply).toHaveBeenCalledWith(suggestions[1]);
  });
});
```

- [ ] **Step 2: Run, verify failure**

Run: `pnpm vitest run src/features/schedule-arrangement/presentation/components/ConflictSuggestionList.test.tsx`
Expected: FAIL — component missing.

- [ ] **Step 3: Implement component**

```tsx
// ConflictSuggestionList.tsx
"use client";
import {
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import type { ResolutionSuggestion } from "../../domain/models/conflict.model";

export interface ConflictSuggestionListProps {
  suggestions: ResolutionSuggestion[];
  isLoading: boolean;
  onApply: (s: ResolutionSuggestion) => void | Promise<void>;
}

export default function ConflictSuggestionList({
  suggestions,
  isLoading,
  onApply,
}: ConflictSuggestionListProps) {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={2}>
        <CircularProgress size={24} role="progressbar" />
      </Box>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2" sx={{ py: 2 }}>
        ไม่พบข้อเสนอแนะ
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {suggestions.map((s, i) => (
        <Box
          key={`${s.kind}-${i}`}
          data-testid="conflict-suggestion-row"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography
            data-testid="conflict-suggestion-kind"
            variant="caption"
            sx={{ minWidth: 72, fontWeight: 600 }}
          >
            {s.kind}
          </Typography>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2">{s.rationale}</Typography>
            <LinearProgress
              variant="determinate"
              value={Math.round(s.confidence * 100)}
              sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
            />
          </Box>
          <Button
            data-testid="conflict-suggestion-apply"
            variant="contained"
            size="small"
            onClick={() => {
              void onApply(s);
            }}
          >
            นำไปใช้
          </Button>
        </Box>
      ))}
    </Stack>
  );
}
```

- [ ] **Step 4: Run, verify pass**

Run: `pnpm vitest run src/features/schedule-arrangement/presentation/components/ConflictSuggestionList.test.tsx`
Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/schedule-arrangement/presentation/components/ConflictSuggestionList.tsx src/features/schedule-arrangement/presentation/components/ConflictSuggestionList.test.tsx
git commit -m "feat(conflict): ConflictSuggestionList component with empty/loading/apply states"
```

---

## Task 13: ConflictDetailsModal component + tests

**Files:**
- Create: `src/features/schedule-arrangement/presentation/components/ConflictDetailsModal.tsx`
- Create: `src/features/schedule-arrangement/presentation/components/ConflictDetailsModal.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// ConflictDetailsModal.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ConflictDetailsModal from "./ConflictDetailsModal";
import { ConflictType } from "../../domain/models/conflict.model";
import type { ConflictResult } from "../../domain/models/conflict.model";

const conflict: ConflictResult = {
  hasConflict: true,
  conflictType: ConflictType.TEACHER_CONFLICT,
  message: "ครูซ้ำ",
  conflictingSchedule: {
    classId: 42,
    subjectCode: "ENG101",
    subjectName: "English",
    roomName: "R-10",
    gradeId: "M1-2",
    teacherName: "ครู A",
    timeslotId: "1-2567-MON-1",
  },
};

const attempt = {
  timeslotId: "1-2567-MON-1",
  subjectCode: "MATH101",
  gradeId: "M1-1",
  teacherId: 1,
  roomId: 10,
  academicYear: 2567,
  semester: "SEMESTER_1" as const,
};

describe("ConflictDetailsModal", () => {
  it("renders conflict context from conflictingSchedule", () => {
    render(
      <ConflictDetailsModal
        open
        conflict={conflict}
        attempt={attempt}
        suggestions={[]}
        isLoadingSuggestions={false}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByTestId("conflict-modal")).toBeDefined();
    expect(screen.getByText(/ENG101/)).toBeDefined();
    expect(screen.getByText(/ครู A/)).toBeDefined();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(
      <ConflictDetailsModal
        open
        conflict={conflict}
        attempt={attempt}
        suggestions={[]}
        isLoadingSuggestions={false}
        onApply={vi.fn()}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByText("ปิด"));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run, verify failure**

Run: `pnpm vitest run src/features/schedule-arrangement/presentation/components/ConflictDetailsModal.test.tsx`
Expected: FAIL — component missing.

- [ ] **Step 3: Implement component**

```tsx
// ConflictDetailsModal.tsx
"use client";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import ConflictSuggestionList from "./ConflictSuggestionList";
import type {
  ConflictResult,
  ResolutionSuggestion,
  ScheduleArrangementInput,
} from "../../domain/models/conflict.model";

export interface ConflictDetailsModalProps {
  open: boolean;
  conflict: ConflictResult;
  attempt: ScheduleArrangementInput;
  suggestions: ResolutionSuggestion[];
  isLoadingSuggestions: boolean;
  onApply: (s: ResolutionSuggestion) => void | Promise<void>;
  onClose: () => void;
}

export default function ConflictDetailsModal({
  open,
  conflict,
  attempt,
  suggestions,
  isLoadingSuggestions,
  onApply,
  onClose,
}: ConflictDetailsModalProps) {
  const cs = conflict.conflictingSchedule;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      data-testid="conflict-modal"
    >
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={conflict.conflictType} color="error" size="small" />
          <Typography variant="subtitle1">{conflict.message}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {cs && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              ชนกับ:
            </Typography>
            <Stack spacing={0.5}>
              {cs.subjectCode && (
                <Typography variant="body2">
                  วิชา: {cs.subjectCode}
                  {cs.subjectName ? ` (${cs.subjectName})` : ""}
                </Typography>
              )}
              {cs.teacherName && (
                <Typography variant="body2">ครู: {cs.teacherName}</Typography>
              )}
              {cs.roomName && (
                <Typography variant="body2">ห้อง: {cs.roomName}</Typography>
              )}
              {cs.gradeId && (
                <Typography variant="body2">ชั้น: {cs.gradeId}</Typography>
              )}
              {cs.timeslotId && (
                <Typography variant="body2">
                  คาบ: {cs.timeslotId}
                </Typography>
              )}
            </Stack>
          </Box>
        )}

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            ข้อเสนอแนะ:
          </Typography>
          <ConflictSuggestionList
            suggestions={suggestions}
            isLoading={isLoadingSuggestions}
            onApply={onApply}
          />
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2 }}
        >
          คาบที่พยายามจัด: {attempt.timeslotId}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ปิด</Button>
      </DialogActions>
    </Dialog>
  );
}
```

- [ ] **Step 4: Run, verify pass**

Run: `pnpm vitest run src/features/schedule-arrangement/presentation/components/ConflictDetailsModal.test.tsx`
Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/schedule-arrangement/presentation/components/ConflictDetailsModal.tsx src/features/schedule-arrangement/presentation/components/ConflictDetailsModal.test.tsx
git commit -m "feat(conflict): ConflictDetailsModal with context block and suggestion list"
```

---

## Task 14: useConflictResolution hook

**Files:**
- Create: `src/features/schedule-arrangement/presentation/hooks/useConflictResolution.ts`
- Modify: `src/features/schedule-arrangement/presentation/hooks/index.ts`

- [ ] **Step 1: Implement hook**

```ts
// useConflictResolution.ts
"use client";

import { useCallback, useState } from "react";
import { suggestResolutionAction } from "../../application/actions/conflict-resolution.actions";
import type {
  ResolutionSuggestion,
  ScheduleArrangementInput,
} from "../../domain/models/conflict.model";

export interface UseConflictResolutionParams {
  academicYear: number;
  semester: 1 | 2;
}

export function useConflictResolution({
  academicYear,
  semester,
}: UseConflictResolutionParams) {
  const [suggestions, setSuggestions] = useState<ResolutionSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFor = useCallback(
    async (attempt: ScheduleArrangementInput) => {
      setIsLoading(true);
      try {
        const res = await suggestResolutionAction({
          AcademicYear: academicYear,
          Semester: semester === 1 ? "SEMESTER_1" : "SEMESTER_2",
          attempt,
        });
        setSuggestions(res.success && res.data ? res.data : []);
      } finally {
        setIsLoading(false);
      }
    },
    [academicYear, semester],
  );

  const reset = useCallback(() => {
    setSuggestions([]);
    setIsLoading(false);
  }, []);

  return { suggestions, isLoading, fetchFor, reset };
}
```

- [ ] **Step 2: Add export to barrel**

Append to `src/features/schedule-arrangement/presentation/hooks/index.ts`:

```ts
export { useConflictResolution } from "./useConflictResolution";
export type { UseConflictResolutionParams } from "./useConflictResolution";
```

- [ ] **Step 3: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/schedule-arrangement/presentation/hooks/useConflictResolution.ts src/features/schedule-arrangement/presentation/hooks/index.ts
git commit -m "feat(conflict): useConflictResolution hook wraps suggestResolutionAction"
```

---

## Task 15: Wire modal into arrange page conflict path

**Files:**
- Identify + modify: the arrange-page handler that currently rejects a drop on conflict (run step 1 first to locate exact file)

- [ ] **Step 1: Identify the current conflict-rejection point**

Run (in repo root):

```bash
grep -rn "hasConflict\|conflict\|ConflictResult" "src/app/schedule/[academicYear]/[semester]/arrange/" | head -30
```

Inspect the matching files. The target is the drag-drop handler that calls `checkAllConflicts` (or the repository-backed equivalent) and currently shows a snackbar / toast / inline alert on `hasConflict === true`.

- [ ] **Step 2: Replace rejection with modal open**

Wherever the existing rejection happens, add local state for the modal. Example shape (adapt imports to the actual file):

```tsx
"use client";
import { useState } from "react";
import ConflictDetailsModal from "@/features/schedule-arrangement/presentation/components/ConflictDetailsModal";
import { useConflictResolution } from "@/features/schedule-arrangement/presentation/hooks";
import type {
  ConflictResult,
  ResolutionSuggestion,
  ScheduleArrangementInput,
} from "@/features/schedule-arrangement/domain/models/conflict.model";

// inside the component:
const [modalState, setModalState] = useState<{
  conflict: ConflictResult;
  attempt: ScheduleArrangementInput;
} | null>(null);
const { suggestions, isLoading, fetchFor, reset } = useConflictResolution({
  academicYear,
  semester,
});

async function handleDrop(attempt: ScheduleArrangementInput) {
  const result = checkAllConflicts(attempt, existingSchedules, responsibilities);
  if (!result.hasConflict) {
    await saveScheduleAction(/* ... */);
    return;
  }
  setModalState({ conflict: result, attempt });
  void fetchFor(attempt);
}

async function handleApply(s: ResolutionSuggestion) {
  if (!modalState) return;
  const base = modalState.attempt;

  if (s.kind === "RE_ROOM") {
    await saveScheduleAction({ ...base, roomId: s.targetRoomId });
  } else if (s.kind === "MOVE") {
    await saveScheduleAction({ ...base, timeslotId: s.targetTimeslotId });
  } else if (s.kind === "SWAP") {
    // MVP: client orchestrates two writes. Follow-up: atomic applySwapAction.
    await updateScheduleAction({
      classId: s.counterpartClassId,
      timeslotId: s.counterpartTimeslotId,
    });
    await saveScheduleAction({ ...base });
  }

  setModalState(null);
  reset();
}

return (
  <>
    {/* existing grid markup */}
    {modalState && (
      <ConflictDetailsModal
        open
        conflict={modalState.conflict}
        attempt={modalState.attempt}
        suggestions={suggestions}
        isLoadingSuggestions={isLoading}
        onApply={handleApply}
        onClose={() => {
          setModalState(null);
          reset();
        }}
      />
    )}
  </>
);
```

Replace existing snackbar / toast / inline rejection code with the two `setModalState` lines above.

- [ ] **Step 3: Local smoke check**

Run: `pnpm dev` (in a separate shell). Open the arrange grid, reproduce a known conflict (seeded teacher double-book). Verify: modal opens, suggestions appear, clicking apply commits.

- [ ] **Step 4: Commit**

```bash
git add "src/app/schedule/[academicYear]/[semester]/arrange/"
git commit -m "feat(arrange): open ConflictDetailsModal with suggestions on drop conflict"
```

---

## Task 16: E2E seed fixture for deliberate conflict

**Files:**
- Create: `e2e/fixtures/conflict-seed.fixture.ts`

- [ ] **Step 1: Create fixture helper**

```ts
// e2e/fixtures/conflict-seed.fixture.ts
import { PrismaClient } from "@/prisma/generated/client";

/**
 * Inserts two class_schedule rows that force a TEACHER_CONFLICT when the
 * E2E user attempts to drag another subject onto the same slot for a
 * different grade with the same teacher.
 *
 * Idempotent: deletes matching rows before inserting.
 */
export async function seedConflict({
  prisma,
  academicYear,
  semester,
  timeslotId,
  teacherRespId,
  subjectCode,
  gradeId,
  roomId,
}: {
  prisma: PrismaClient;
  academicYear: number;
  semester: "SEMESTER_1" | "SEMESTER_2";
  timeslotId: string;
  teacherRespId: number;
  subjectCode: string;
  gradeId: string;
  roomId: number;
}): Promise<{ classId: number }> {
  await prisma.class_schedule.deleteMany({
    where: { TimeslotID: timeslotId, SubjectCode: subjectCode, GradeID: gradeId },
  });
  const created = await prisma.class_schedule.create({
    data: {
      TimeslotID: timeslotId,
      SubjectCode: subjectCode,
      GradeID: gradeId,
      RoomID: roomId,
      IsLocked: false,
      teachers_responsibility: {
        connect: { RespID: teacherRespId },
      },
    },
  });
  return { classId: created.ClassID };
}
```

- [ ] **Step 2: Commit**

```bash
git add e2e/fixtures/conflict-seed.fixture.ts
git commit -m "test(e2e): fixture helper for seeding deliberate conflicts"
```

---

## Task 17: E2E spec — apply suggestion

**Files:**
- Create: `e2e/conflict-resolution.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
// e2e/conflict-resolution.spec.ts
import { test, expect } from "./fixtures/admin.fixture";
import { testSemester, testTeacher } from "./fixtures/seed-data.fixture";

const RUN_CONFLICT_EXTENDED = process.env.E2E_CONFLICT_EXTENDED === "true";

test.describe("Arrange grid: conflict resolution modal", () => {
  test.skip(
    !RUN_CONFLICT_EXTENDED,
    "Set E2E_CONFLICT_EXTENDED=true to run conflict-resolution e2e",
  );

  test("opens modal with suggestions and applies first suggestion", async ({
    arrangePage,
    page,
  }) => {
    await arrangePage.navigateTo(
      String(testSemester.semester),
      String(testSemester.academicYear),
    );
    await arrangePage.waitForPageReady();

    const teacherName = `${testTeacher.Prefix}${testTeacher.Firstname} ${testTeacher.Lastname}`;
    await arrangePage.selectTeacher(teacherName);

    // Attempt to drop a subject into a known-conflicting slot.
    const availableSubjects = await arrangePage.getAvailableSubjects();
    const subjectCode = availableSubjects[0]!;
    await arrangePage.dragSubjectToTimeslot(subjectCode, 1, 1);

    // Modal should open.
    await expect(page.getByTestId("conflict-modal")).toBeVisible({
      timeout: 15_000,
    });

    const rows = page.getByTestId("conflict-suggestion-row");
    await expect(rows.first()).toBeVisible({ timeout: 15_000 });

    // Apply first suggestion.
    const firstApply = page.getByTestId("conflict-suggestion-apply").first();
    await firstApply.click();

    // Modal should close.
    await expect(page.getByTestId("conflict-modal")).toBeHidden({
      timeout: 15_000,
    });
  });
});
```

- [ ] **Step 2: Commit**

```bash
git add e2e/conflict-resolution.spec.ts
git commit -m "test(e2e): conflict-resolution spec gated by E2E_CONFLICT_EXTENDED"
```

---

## Task 18: Regression + CI gate

**Files:**
- None (verification only)

- [ ] **Step 1: Run full vitest suite**

Run: `pnpm vitest run`
Expected: all existing suites PASS, new suites PASS.

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: 0 errors.

- [ ] **Step 4: Run existing conflict E2E**

Run: `pnpm test:e2e 12-conflict-detector.spec.ts` (requires db up + seeded).
Expected: existing green tests still green; new modal only appears on conflict paths that were already rejections, so non-conflict paths unchanged.

- [ ] **Step 5: Open tracking issue on GitHub**

```bash
gh issue create --title "[P1] Phase 3 — Enhanced Conflict Messages with Suggestions" \
  --body "Spec: docs/superpowers/specs/2026-04-21-conflict-enhanced-messages-phase-3-design.md
Plan: docs/superpowers/plans/2026-04-21-conflict-enhanced-messages-phase-3.md
Parent: #57

Deferred follow-ups:
- Atomic applySwapAction with Prisma transaction (MVP uses two client-side calls).
- MOE weekly-hour per-slot helper (resolver currently relies on checkAllConflicts re-run only).
- Confidence calibration after user telemetry."
```

- [ ] **Step 6: Push branch and open PR when ready**

```bash
git push -u origin <branch-name>
```

---

## Self-review notes (for the implementer)

- All types the plan references (`ResolutionSuggestion`, `ResolutionContext`, `RoomOption`, `TimeslotOption`) are defined in Task 1 before any later task uses them.
- Repository methods: `roomRepository.findAll`, `timeslotRepository.findByTerm`, `findAssignmentsByContext`, and new `conflictRepository.findSchedulesForSemester` are all wired by Task 11/11b. Double-check the real shape of `findAssignmentsByContext`'s return before Task 11b — if field names drift, adjust the mapper in `loadResponsibilitiesForTerm`.
- `Semester` is `"SEMESTER_1" | "SEMESTER_2"` only. `SEMESTER_3` does not appear in any new code. Pre-existing `SEMESTER_3` leak in `ConflictDetector.tsx` is out of scope (file a follow-up if you notice it while working).
- Resolver tests import `ResolutionSuggestion` and `ResolutionContext` etc. — all exported from `conflict.model.ts` after Task 1.
- If Task 15 discovers that the current arrange grid uses a server-repository check (e.g. `validate-drop.action.ts`) instead of client-side `checkAllConflicts`, adapt: call the new `suggestResolutionAction` unconditionally after a rejected server response. The modal UI is the same.
- All `data-testid` names are lowercase-kebab-case: `conflict-modal`, `conflict-suggestion-row`, `conflict-suggestion-apply`, `conflict-suggestion-kind`. E2E spec in Task 17 uses them verbatim.
