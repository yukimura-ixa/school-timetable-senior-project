# Design — MOE activity-pillar validation + `OTHER` activity type

**Beads:** `school-timetable-senior-project-9vz`
**Date:** 2026-06-24
**Status:** Approved (design)

## Problem

The 2551 Core Curriculum has two mandatory pillars: the 8 learning areas **and**
กิจกรรมพัฒนาผู้เรียน (Learner Development Activities). The live MOE validator
(`src/features/program/domain/services/moe-validation.service.ts`) validates the first pillar
(credits per `LearningArea` + track electives) but only checks activities coarsely: a single
warning when a program has **zero** `ACTIVITY` subjects. It never checks that the three official
activity categories are covered.

Separately, an older config layer (`COMMON_ACTIVITIES` in `src/config/moe-standards.ts`, and the
whole of `src/utils/moe-validation.ts`) is **dead** — unconsumed by the live validator — and
models activities as only Homeroom + Club, contradicting the live model.

## Existing groundwork (no work needed)

- Prisma `ActivityType` enum `{ CLUB, SCOUT, GUIDANCE, SOCIAL_SERVICE }` + nullable
  `subject.ActivityType` + index already exist.
- Subject CRUD UI (`ActivityModal`, `AddSubjectDialog`, `SubjectTable`, …) already exposes
  `ActivityType`; dropdowns render `Object.values(ActivityType)`.
- `seed-moe.ts` already seeds all categories (ชุมนุม=CLUB, ลูกเสือ M1–M6=SCOUT, แนะแนว=GUIDANCE,
  เพื่อสังคมฯ=SOCIAL_SERVICE).
- `validateProgramMOECredits(year, programSubjects: Array<program_subject & { subject }>, track?)`
  already receives the joined `subject`, so `ps.subject.ActivityType` is available.

## Category mapping (MOE 3 ลักษณะ → enum)

1. กิจกรรมแนะแนว (Guidance) → `GUIDANCE`
2. กิจกรรมนักเรียน (Student): uniformed ลูกเสือ/เนตรนารี/ยุวกาชาด/นศท. → `SCOUT`; ชุมนุม/ชมรม → `CLUB`
3. กิจกรรมเพื่อสังคมและสาธารณประโยชน์ → `SOCIAL_SERVICE`
4. (new) catch-all (โฮมรูม/ชั้นเรียน, ลดเวลาเรียน, misc.) → `OTHER`

## Decisions

- **Scope:** validation + cleanup. Schema/UI/seed already exist; no migration needed *except*
  the additive `OTHER` enum value.
- **Severity:** warnings only. `isValid` is unaffected (activities are ผ/มผ; schools schedule
  flexibly). Consistent with the existing homeroom-warning philosophy.
- **Coverage varies by grade** (per `docs/agents/THAI_MOE_CURRICULUM_RULES.md` §6, §8.4).

## Changes

### A. Add `OTHER` to `ActivityType`

- `prisma/schema.prisma`: add `OTHER` to the `ActivityType` enum → `pnpm db:migrate`
  (additive, non-breaking).
- `src/features/program/domain/types/enums.ts`: add `OTHER = "OTHER"` to the hand-mirrored
  client-safe enum.
- Valibot (`subject.schemas.ts`, `v.enum(ActivityType)`) and `Object.values(...)` dropdowns
  propagate automatically — no edits.
- `typecheck` must pass: catches any exhaustive `switch`/`never` on `ActivityType` that needs an
  `OTHER` branch.

### B. Activity-pillar validation

New pure function in `moe-validation.service.ts`:

```ts
function validateActivityCoverage(
  year: number,
  programSubjects: Array<program_subject & { subject: subject }>,
): { warnings: string[] }
```

- Collect `ps.subject.ActivityType` for `ps.Category === ACTIVITY` (ignore null).
- Grade-aware **required** sets (warn per missing type):
  - Junior **M1–M3**: `GUIDANCE`, `SCOUT`, `CLUB` (ม.ต้น runs both ลูกเสือ and ชุมนุม)
  - Senior **M4–M6**: `GUIDANCE`, `CLUB` (uniformed `SCOUT`/นศท. optional)
- Optional (satisfy no requirement, allowed): `SOCIAL_SERVICE` — embedded in the 120-hr budget and
  commonly folded into clubs (§6.2) — `OTHER`, and at senior `SCOUT`.
- Thai warnings per missing category, e.g. `ขาดกิจกรรมแนะแนว (GUIDANCE)`.
- Wire into `validateProgramMOECredits`, **replacing** the coarse `hasActivities` warning block.
  Keep a "no activities at all" message when the program has zero `ACTIVITY` subjects.

### C. Cleanup — DEFERRED to `school-timetable-senior-project-bbn`

The legacy layer (`COMMON_ACTIVITIES`/`YearStandard.activities`/`getMOEStandards` in
`src/config/moe-standards.ts` + all of `src/utils/moe-validation.ts`) is unconsumed by the live
app, **but** `__test__/moe-standards/moe-standards.test.ts` and `moe-property-based.test.ts` test
*only* that layer — so any edit cascades into rewriting both test files. That removal is orthogonal
to this feature and is split into its own issue (`-bbn`). `-9vz` is now **purely additive** (A, B,
D below); no legacy files are touched.

### D. Tests (TDD)

Add `validateActivityCoverage` cases to `__test__/features/program/moe-validation.service.test.ts`:
- Junior with GUIDANCE+SCOUT+CLUB → no warning (SOCIAL_SERVICE not required).
- Junior missing CLUB → warns missing CLUB.
- Junior missing SCOUT → warns missing SCOUT.
- Senior with GUIDANCE+CLUB → no warning (SCOUT + SOCIAL_SERVICE optional).
- Senior with SCOUT only → warns missing GUIDANCE + CLUB (SCOUT alone counts for nothing).
- Program with only `OTHER` or only `SOCIAL_SERVICE` → warns the full required set for its band.
- Program with zero ACTIVITY subjects → "no activities at all" message.

CI is the test source of truth — suites are not run locally.

## Out of scope

- No Thai label map for `ActivityType` in the UI (dropdowns still show raw enum values, matching
  current behavior).
- No change to `ProgramTrack` / ทวิศึกษา modeling (tracked separately: `-rne`).
- Activities remain non-credit-bearing; no scheduling/timetable changes.
