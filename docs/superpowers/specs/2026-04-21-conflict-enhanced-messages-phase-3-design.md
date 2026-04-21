# Phase 3 — Enhanced Conflict Messages with Suggestions

**Date:** 2026-04-21
**Tracks:** #57 (parent, Conflict Detection UI Improvements), Phase 3

## 1. Goal

When a user attempts to place a subject on the arrange grid and the existing
`conflict-detector.service` rejects the placement, show a modal that (a) explains
*why* it conflicts using the details already on `ConflictResult.conflictingSchedule`,
and (b) offers up to three ranked resolution suggestions the user can apply in
one click. Phase 2 dashboard summary and Phase 1 grid indicators are out of scope.

## 2. Non-goals

- Auto-resolve wizard (issue Phase 5).
- Diff viewer (issue Phase 4).
- Conflict severity prioritization beyond existing priority order.
- Rewriting `conflict-detector.service` or `conflict.repository` — resolver is
  a consumer, not a replacement.

## 3. Architecture

New and touched files:

```
src/features/schedule-arrangement/
  domain/
    models/
      conflict.model.ts                     (extend: ResolutionSuggestion types)
    services/
      conflict-resolver.service.ts          [NEW]   pure ranker
      conflict-resolver.service.test.ts     [NEW]
  application/
    actions/
      conflict-resolution.actions.ts        [NEW]   server action
      conflict-resolution.actions.test.ts   [NEW]
  presentation/
    components/
      ConflictDetailsModal.tsx              [NEW]
      ConflictSuggestionList.tsx            [NEW]
      ConflictDetailsModal.test.tsx         [NEW]
    hooks/
      useConflictResolution.ts              [NEW]
src/app/schedule/[academicYear]/[semester]/arrange/
  @grid or drag-drop handler                (wire modal on conflict)
e2e/
  conflict-resolution.spec.ts               [NEW]
  fixtures/conflict-seed.fixture.ts         [NEW]
```

Layer rules stay:

- Domain pure, no React/Prisma imports.
- Application owns auth + input validation + repository orchestration.
- Presentation owns modal + hook + data-testid selectors.

## 4. Domain types

Append to `src/features/schedule-arrangement/domain/models/conflict.model.ts`:

```ts
export type ResolutionKind = "MOVE" | "RE_ROOM" | "SWAP";

export interface MoveSuggestion {
  kind: "MOVE";
  targetTimeslotID: string;
  rationale: string;
  confidence: number; // 0..1
}

export interface ReRoomSuggestion {
  kind: "RE_ROOM";
  targetRoomID: number;
  targetRoomName: string;
  rationale: string;
  confidence: number;
}

export interface SwapSuggestion {
  kind: "SWAP";
  counterpartTimeslotID: string;
  counterpartClassID: number;
  counterpartSubjectCode: string;
  rationale: string;
  confidence: number;
}

export type ResolutionSuggestion =
  | MoveSuggestion
  | ReRoomSuggestion
  | SwapSuggestion;

export interface ResolutionContext {
  conflict: ConflictResult;
  attempt: ScheduleArrangementInput;
  existingSchedules: ExistingSchedule[];
  responsibilities: TeacherResponsibility[];
  availableRooms: Array<{ RoomID: number; RoomName: string }>;
  allTimeslots: Array<{
    TimeslotID: string;
    DayOfWeek: string;
    // other fields needed by ranker
  }>;
}
```

`ConflictResult` is not broken: these types are purely additive. The existing
`checkAllConflicts` return shape stays.

## 5. Resolver (domain)

```ts
export function suggestResolutions(
  ctx: ResolutionContext,
  opts?: { maxSuggestions?: number }, // default 3
): ResolutionSuggestion[];
```

Candidate generation, priority order:

1. **RE_ROOM** — only when `ctx.conflict.conflictType === ROOM_CONFLICT`.
   Iterate `availableRooms` minus rooms busy in `attempt.timeslotID`.
   Confidence: 0.9 (original slot kept = minimum disruption).
2. **MOVE same-day** — iterate timeslots with the same day-of-week and same
   period shape as `attempt.timeslotID`. For each candidate, re-run
   `checkAllConflicts` with `input.timeslotID = candidate`. Clean results
   become MOVE suggestions. Confidence 0.7–0.8, distance-weighted
   (adjacent period scores higher).
3. **MOVE cross-day** — same query on other days. Confidence 0.5–0.65.
4. **SWAP** — only if MOVE yielded fewer than three candidates. Pick the
   schedule currently occupying `attempt.timeslotID`; verify swapping its
   slot with an empty slot is conflict-free on both sides. Confidence
   0.4–0.6.

Rank by `confidence` descending, stable sort, return top `maxSuggestions`.

Rationale text (Thai, shown in UI):

- RE_ROOM: `ย้ายไปห้อง {RoomName} (คาบเดิม)`
- MOVE same-day: `ย้ายไปคาบ {period} วัน{day}`
- MOVE cross-day: `ย้ายไปวัน{day} คาบ {period}`
- SWAP: `สลับกับ {SubjectCode} ที่ {day}/{period}`

**MOE guard:** before accepting a MOVE candidate, run the existing
`moe-validation.ts` helpers (`validateWeeklyHours`, learning-area caps) against
the candidate slot. Reject candidates that would violate MOE limits. This is
the single non-obvious invariant this phase introduces.

Resolver is pure and deterministic. No I/O. No React. Side-effect free.

## 6. Server action

```ts
// src/features/schedule-arrangement/application/actions/conflict-resolution.actions.ts
"use server";

export async function suggestResolutionAction(input: {
  AcademicYear: number;
  Semester: "SEMESTER_1" | "SEMESTER_2";
  attempt: ScheduleArrangementInput;
}): Promise<
  | { success: true; data: ResolutionSuggestion[] }
  | { success: false; error: string }
>;
```

Body:

1. `actionWrapper` — valibot-validate + `requireAdmin` (existing wrapper;
   arrangement is admin-only).
2. Parallel load via existing repositories:
   - `conflict.repository` → existing schedules for config.
   - Teaching-assignment repository → responsibilities for semester.
   - Room repository → `findAll`.
   - Timeslot repository → `findAllForConfig`.
3. Call `checkAllConflicts(attempt, schedules, resps)` from the existing
   detector. If `hasConflict === false`, return `{ success: true, data: [] }`.
4. Build `ResolutionContext`, call `suggestResolutions(ctx, { maxSuggestions: 3 })`.
5. Return `{ success: true, data }`.

The resolver does **not** mutate anything. On apply, the client re-uses
existing `saveScheduleAction` / `updateScheduleAction`. For `SWAP`, MVP issues
two client-side calls; if partial-apply corruption appears in the wild, add an
`applySwapAction` with a Prisma transaction (deferred; tracked as Phase 3
follow-up). No new repository writes in this PR.

Semester union is `"SEMESTER_1" | "SEMESTER_2"` only — `SEMESTER_3` is not a
valid value anywhere in the codebase contract.

## 7. Presentation

```tsx
interface ConflictDetailsModalProps {
  open: boolean;
  conflict: ConflictResult;
  attempt: ScheduleArrangementInput;
  suggestions: ResolutionSuggestion[];
  isLoadingSuggestions: boolean;
  onApply: (s: ResolutionSuggestion) => Promise<void>;
  onClose: () => void;
}
```

Layout (MUI `Dialog`):

- **Header:** conflict-kind chip + Thai message from `ConflictResult.message`.
- **Context block:** "ชนกับ:" list built from `ConflictResult.conflictingSchedule`
  (class / subject / teacher / room / timeslot).
- **Suggestions block:** `<ConflictSuggestionList>` rows, one per suggestion:
  kind icon, rationale, MUI `LinearProgress` as confidence bar, `"นำไปใช้"`
  button. Empty state: `"ไม่พบข้อเสนอแนะ"`.
- **Footer:** `"ปิด"`.

`data-testid` additions (align with #116):

- `conflict-modal`
- `conflict-suggestion-row`
- `conflict-suggestion-apply`
- `conflict-suggestion-kind`

Hook:

```ts
// useConflictResolution.ts
export function useConflictResolution(params: {
  academicYear: number;
  semester: 1 | 2;
}) {
  // SWR keyed on a stable hash of the attempt; de-dupes repeated opens.
  // Exposes: suggestions, isLoading, fetchFor(attempt), apply(suggestion, attempt).
}
```

The hook owns the round-trip to `suggestResolutionAction`, converts the chosen
suggestion into the right `saveScheduleAction` / `updateScheduleAction` input,
and invalidates SWR caches the arrange page already consumes. Nothing in the
hook touches Prisma.

Integration point: wherever the arrange grid currently rejects a drop on
conflict (today surfaces through the snackbar / placeholder inspector), replace
that rejection with a call to `arrangement-ui.store.openConflictModal(conflict, attempt)`
which renders this modal. The `@inspector` slot placeholder ("กำลังพัฒนา...")
stays or gets repurposed later (out of scope for this PR).

## 8. Testing strategy

**Unit — vitest, domain:**

- `conflict-resolver.service.test.ts` — pure function. Minimum cases:
  - RE_ROOM: room filter correct when room busy in attempt slot.
  - RE_ROOM: not proposed when conflictType is not ROOM_CONFLICT.
  - MOVE same-day: nearer period scores higher than far period.
  - MOVE cross-day: only appears when same-day produces < maxSuggestions.
  - SWAP: only appears when MOVE produces < 3.
  - SWAP: rejects when the candidate's counter-slot is itself conflicted.
  - Returns `[]` on `hasConflict === false`.
  - Respects `maxSuggestions` cap.
  - Stable sort on equal confidence.
  - MOE guard: MOVE candidate that would violate weekly-hour cap is filtered.
  - Empty `availableRooms` → no RE_ROOM.
  - Empty `allTimeslots` → no MOVE.

**Unit — vitest, application:**

- `conflict-resolution.actions.test.ts`:
  - Non-admin session → `{ success: false, error: ... }`.
  - Valibot rejects malformed `attempt`.
  - Repos called in parallel (`Promise.all` shape).
  - Returns `[]` when `checkAllConflicts.hasConflict === false`.
  - Maps resolver output to action response unchanged.

**Component — vitest + @testing-library/react:**

- `ConflictDetailsModal.test.tsx`:
  - Renders conflict context text from `conflictingSchedule` fields.
  - Renders one suggestion row per suggestion.
  - Empty suggestions → empty-state text visible.
  - `isLoadingSuggestions === true` → skeleton visible, no rows.
  - Clicking apply calls `onApply` with the correct suggestion object.
  - Clicking close calls `onClose`.

**E2E — playwright:**

- New spec `conflict-resolution.spec.ts` (or extend `12-conflict-detector.spec.ts`):
  - Seed one deliberate overlap via `conflict-seed.fixture.ts`.
  - User drags subject onto a teacher-conflicting slot → `[data-testid="conflict-modal"]`
    visible.
  - Assert ≥ 1 `[data-testid="conflict-suggestion-row"]`.
  - Click `[data-testid="conflict-suggestion-apply"]` on first row.
  - Assert schedule now present in the suggested slot; original slot unchanged.
  - Skip extended scenarios under `E2E_CONFLICT_EXTENDED=true` flag, matching
    the project convention used in `schedule-assignment.spec.ts`.

Existing `12-conflict-detector.spec.ts` must stay green; new modal is additive
and only appears on conflict, so the existing no-conflict paths do not change.

## 9. Acceptance criteria

- [ ] Resolver pure vitest suite green (≥10 cases listed above).
- [ ] Resolver enforces MOE weekly-hour / learning-area caps before MOVE.
- [ ] `suggestResolutionAction` admin-gated, parallel-loads repos, returns
      `ResolutionSuggestion[]` shape exactly.
- [ ] `ConflictDetailsModal` renders context + suggestions + empty/loading
      states; all interactions tested.
- [ ] New E2E spec green locally (extended flag ok for CI gate).
- [ ] `12-conflict-detector.spec.ts` still green.
- [ ] `pnpm typecheck` and `pnpm lint` report 0 errors.
- [ ] All new interactive elements carry `data-testid` per §7.
- [ ] No `SEMESTER_3` leaks into new code. (Pre-existing references in
      `ConflictDetector.tsx` will be tracked separately — not this PR.)

## 10. Rollout

- Single PR, no feature flag. Behaviour is purely additive — the modal only
  renders when `hasConflict === true`, which already produces a user-facing
  rejection today.
- Tracking issue: `[P1] Phase 3 — Enhanced Conflict Messages with Suggestions`,
  links to #57.
- Deferred as follow-up (new issue on merge):
  - Atomic `applySwapAction` with Prisma txn.
  - "Impact analysis" text ("affects N classes") — nice-to-have, Phase 3 spec.
  - Confidence calibration (revisit numbers after user telemetry).

## 11. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Resolver runtime on busy semesters (O(rooms × timeslots)) | Max ~40 rooms × 120 timeslots = 4800 checks; each check is a pure array scan. Acceptable. If telemetry shows hot spots, memoize by `attempt.timeslotID`. |
| MOVE candidate violates MOE rule silently | §5 MOE guard runs before accepting candidate. Unit-tested. |
| SWAP partial apply (first save OK, second fails) | Document known limitation; add follow-up issue for `applySwapAction` with Prisma transaction. |
| Stale data between suggestion fetch and apply | SWR key on semester; apply path re-runs `checkAllConflicts` server-side and surfaces a new conflict via the same modal. |
| Thai translations drift | Rationale strings centralised in `conflict-resolver.service.ts` as constants; no UI-side string templates. |

## 12. Open questions

None at write time. Any surprise discovered during implementation should be
surfaced via the `ck:backprop` skill against this spec and §V of `SPEC.md`.
