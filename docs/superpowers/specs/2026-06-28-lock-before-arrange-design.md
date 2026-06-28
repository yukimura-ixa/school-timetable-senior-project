# Split Lock (early) from Publish (last)

Date: 2026-06-28
Status: Approved (design); pending implementation plan
Area: scheduling wizard — `/schedule/[academicYear]/[semester]/{lock,publish}` + `src/features/schedule-wizard`

## Problem

The scheduling wizard forces the wrong order. Steps today:

`config → curriculum → assign → generate → review → publish`

where the final step (`publish`, label "ล็อกและเผยแพร่", route segment `lock`) bundles **both** locking fixed slots **and** publishing, gated behind `hasPlacements`. So a user must arrange subjects first, then lock — backwards. Locking fixed activities (assembly, club, exam, lunch) should come **before** arranging so the auto-arrange solver and manual placement work around the locks.

The engine already supports this: `auto-arrange.action.ts` loads all existing `class_schedule` rows including locked ones (`isLocked: s.IsLocked`) and feeds them to the solver as occupied. Only the wizard ordering and the bundled step are wrong.

## Goal

Lock fixed slots **before** auto-arrange; keep publish as the final step:

`config → curriculum → assign → lock → generate → review → publish`

## Non-goals

- No change to the auto-arrange solver, the lock engine, or the arrange grid.
- No new lock/publish capabilities — only split the existing combined step into two and reorder.

## Decisions

- **Split, lock early, publish last** (chosen over relaxing gating only): a dedicated `lock` step before `generate`, and `publish` as its own final step + route.
- `hasPlacements` must count only **non-locked** placements, so locking-first does not prematurely satisfy the publish gate.

## Design

### Wizard steps (`src/features/schedule-wizard/domain/wizard-steps.ts`)

`WizardStepKey` becomes: `config | curriculum | assign | lock | generate | review | publish` (7 keys).

`WIZARD_STEPS` array order and predicates:

| key | label | segment | requires |
|---|---|---|---|
| config | ตั้งค่าคาบเรียน | config | `() => true` |
| curriculum | ตรวจหลักสูตร | curriculum | `hasGrid` |
| assign | มอบหมายครู | assign | `hasGrid` |
| **lock** | **ล็อก** | **lock** | **`hasGrid`** |
| generate | สร้างตารางอัตโนมัติ | generate | `hasGrid && hasResponsibilities` |
| review | ตรวจและปรับ | arrange | `hasGrid && hasResponsibilities` |
| **publish** | **เผยแพร่** | **publish** | `hasGrid && hasResponsibilities && hasPlacements` |

The current single `publish` step (segment `lock`, label "ล็อกและเผยแพร่") is replaced by the new `lock` step (segment `lock`) plus the `publish` step (new segment `publish`). `lock` requires only `hasGrid` — locking fixed activities does not need teacher assignments; forward-gating still allows revisiting and blocks only forward skips.

### Routes

- **`/schedule/[year]/[semester]/lock/page.tsx`** — keep `LockSchedule` (+ its server fetch `getLockedSchedulesAction`). **Remove** the `<Divider/>` + "เผยแพร่ตาราง" `<Box>` + `PublishReadinessCard` block.
- **`/schedule/[year]/[semester]/publish/page.tsx`** (new) — the moved "เผยแพร่ตาราง" heading/description + `<PublishReadinessCard configId={configId} />`. Mirror the existing `lock/` route's param parsing and `configId = "${semester}-${academicYear}"`. The `lock/` route has `loading.tsx` and `error.tsx`; add matching siblings under `publish/`.

### Gating state (`src/features/schedule-wizard/application/services/wizard-state.service.ts`)

`hasPlacements` query gains `IsLocked: false`:

```ts
prisma.class_schedule.count({
  where: {
    IsLocked: false,
    timeslot: { AcademicYear: academicYear, Semester: semesterEnum },
  },
}),
```

So locked rows (created in the `lock` step) do not count as placements; only arranged classes flip `hasPlacements`, keeping the `publish` gate correct.

### Consumers (auto-adapt, verify only)

- `WizardStepper.tsx` and the landing `page.tsx` (`furthestReachableStep`) render from `WIZARD_STEPS` — no logic change; they pick up the new step/order automatically.
- `wizard-steps.test.ts` — update for 7 steps, new keys/order, and `lock` reachability (`hasGrid`).
- e2e `23-wizard-flow.spec.ts` — update step-count/order/label assertions.

## Testing

- Unit (`wizard-steps.test.ts`): 7 steps in the new order; `lock` reachable when `hasGrid`; `generate`/`review` reachable when `hasGrid && hasResponsibilities`; `publish` reachable only when `hasGrid && hasResponsibilities && hasPlacements`; `furthestReachableStep` returns `lock` for a grid-only term.
- Unit (`wizard-state.service` — add test if none exists): `hasPlacements` is false when only locked rows exist, true when a non-locked row exists.
- Browser: with a fresh grid + responsibilities, the stepper shows ล็อก before สร้างตารางอัตโนมัติ; locking an activity then running auto-arrange places subjects around the lock; publish step stays gated until a real class is arranged.
- e2e: `23-wizard-flow.spec.ts` green.

## Risks

- **Premature publish gate** — mitigated by the `IsLocked: false` count.
- **e2e/visual assertions** on step order/labels — update `23-wizard-flow.spec.ts`; confirm green in CI (CI is source of truth).
- **Existing in-progress terms** — none persisted; gating is computed each load, so reordering is safe for existing data.
