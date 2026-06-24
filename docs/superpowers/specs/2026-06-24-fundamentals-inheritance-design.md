# Design — Fundamental-subject reference-inheritance

**Beads:** `school-timetable-senior-project-0e5`
**Date:** 2026-06-24
**Status:** Approved (design); implementation deferred to a later session.

## Problem

วิชาพื้นฐาน (CORE fundamentals) are **grade-determined, not program-determined**: every program in a
given grade carries the same national core (ม.4 basic is identical across วิทย์-คณิต / ทั่วไป /
ทวิศึกษา — see `docs/agents/THAI_MOE_CURRICULUM_RULES.md` §8.2). Today each program stores its own
copy of those CORE rows in `program_subject`, so the same ~13–14 subjects are duplicated across every
program of a grade. That duplication causes drift and edit fan-out when the curriculum is re-baselined.

**Goal:** model fundamentals once per grade and have programs **inherit by reference** (with
per-program exclude/override), instead of copying them into every program.

## Key finding (shapes the whole design)

`program` and `program_subject` are **semester-agnostic** — semester (`AcademicYear` + `Semester`)
lives only on `class_schedule`, `teachers_responsibility`, `table_config`, `timeslot`. A program
(`Year` + `Track`) already holds **both** semesters' subjects as separate rows (e.g. ท31101 sem-1 and
ท31102 sem-2). Therefore the template is **per-year (M1–M6)**, not per-(year×semester); the
"semester" is merely which subject codes, not a program dimension. This collapses the issue's
"3 grades × 2 semesters" to **6 per-year templates**.

## Decisions

- **Override storage:** a dedicated `program_fundamental_override` table (not a flag on
  `program_subject`) — keeps `program_subject` for genuinely program-owned rows and makes
  "inherited but tweaked" explicit.
- **Backfill:** behavior-preserving — after migration, every existing program's *effective* subject
  set is byte-for-byte identical to before.
- **v1 scope:** one global template per year (no per-`AcademicYear` versioning — deferred). Vocational
  (ทวิศึกษา) programs opt out of the academic-core template (ties to `-rne`).

## Data model (Prisma)

### New: `grade_fundamental` (the per-year CORE template)

```prisma
model grade_fundamental {
  GradeFundamentalID Int     @id @default(autoincrement())
  Year               Int     // 1..6 (ม.1..ม.6)
  SubjectCode        String
  MinCredits         Float
  MaxCredits         Float?
  SortOrder          Int     @default(0)
  subject            subject @relation(fields: [SubjectCode], references: [SubjectCode], onDelete: Cascade)

  @@unique([Year, SubjectCode])
  @@index([Year])
}
```

Rows are implicitly `CORE`. Seeded for M1–M6 from the canonical fundamentals; editable (re-baseline).

### New: `program_fundamental_override` (per-program deltas on inherited fundamentals)

```prisma
model program_fundamental_override {
  ProgramFundamentalOverrideID Int     @id @default(autoincrement())
  ProgramID                    Int
  SubjectCode                  String
  Excluded                     Boolean @default(false)
  MinCredits                   Float?  // null = inherit template value
  MaxCredits                   Float?
  program                      program @relation(fields: [ProgramID], references: [ProgramID], onDelete: Cascade)
  subject                      subject @relation(fields: [SubjectCode], references: [SubjectCode], onDelete: Cascade)

  @@unique([ProgramID, SubjectCode])
  @@index([ProgramID])
}
```

### Changed: `program_subject` semantics

Narrows to program-**owned** rows — ADDITIONAL (electives) + ACTIVITY. It *may* still hold CORE for
genuine per-program exceptions (a CORE subject not in the grade template); those are not deduped away.

## The seam — one composition function

All readers must compute a program's subjects through a single pure function instead of reading
`program_subject` directly.

```ts
type EffectiveSubjectSource = "INHERITED" | "OWNED";

interface EffectiveSubject {
  subjectCode: string;
  source: EffectiveSubjectSource;          // INHERITED = from template; OWNED = program_subject
  category: SubjectCategory;               // CORE for template rows; owned rows keep their own
  minCredits: number;
  maxCredits: number | null;
  overridden: boolean;                     // inherited row with a credit override applied
  subject: subject;                        // joined subject (LearningArea, ActivityType, names…)
}

function getEffectiveProgramSubjects(input: {
  year: number;
  template: grade_fundamental[];                       // rows for `year`
  overrides: program_fundamental_override[];           // rows for the program
  programSubjects: Array<program_subject & { subject: subject }>;
}): EffectiveSubject[];
```

Composition:
1. For each template row of `year`: skip if an override marks it `Excluded`; else emit `INHERITED`
   `CORE` with `minCredits = override.MinCredits ?? template.MinCredits` (same for max),
   `overridden = override has a non-null credit`.
2. Emit each `programSubjects` row as `OWNED` with its own category/credits.
3. Dedupe by `subjectCode`: if a code appears in both, the `OWNED` row wins and the inherited is
   suppressed (manual program rows override the template). Backfill guarantees no overlap; this rule
   is defensive for runtime edits.

A repository method (e.g. `program.repository.getEffectiveSubjects(programId)`) loads the three
inputs and returns `EffectiveSubject[]`. Provide an adapter to the
`program_subject & { subject }` shape that `moe-validation.service` already consumes, so the validator
needs no signature change.

### Consumers to reroute (~15 files reading `program_subject`)

`program` (repository/actions/types, hooks `useProgramSubjects`/`useSubjectAssignment`),
`moe-validation.service`, `schedule-wizard` (`curriculum-overview`), `teaching-assignment`
(repository/types), `config` (repository, `publish-readiness.service`, types),
`subject.repository`, `analytics/compliance.repository`. Each must switch from raw `program_subject`
reads to the seam (directly or via the adapter). This breadth is the bulk of the implementation and
the main risk — the plan must enumerate each call site.

## Migration + behavior-preserving backfill

1. Create the two tables (additive migration).
2. Seed `grade_fundamental` for M1–M6 from the canonical fundamentals (config/seed source).
3. Backfill, per existing program P (Year Y):
   - For each `program_subject` CORE row whose `SubjectCode` is in `template(Y)`: **delete it**
     (now inherited). If its credits differ from the template, first insert a
     `program_fundamental_override(P, code, MinCredits, MaxCredits)`.
   - For each `template(Y)` subject **absent** from P's CORE rows: insert
     `program_fundamental_override(P, code, Excluded=true)`.
   - Leave ADDITIONAL/ACTIVITY rows and any non-template CORE rows untouched.
4. **Verification step (required):** a script that computes each program's effective set before and
   after migration and asserts equality. Migration is not "done" until this passes.

## Seed

`grade_fundamental` seeded from an editable config module (re-baselinable per academic year in a
future version). `seed-moe.ts` stops inserting CORE `program_subject` rows for programs and instead
relies on inheritance (it continues to insert ADDITIONAL/ACTIVITY owned rows).

## UI

Program-subject assignment screen shows two sections:
- **Inherited fundamentals** (from the template) — each row has *exclude* and *override-credits*
  controls (writing `program_fundamental_override`); visually marked as inherited.
- **Owned subjects** (ADDITIONAL/ACTIVITY) — managed as today via `program_subject`.

A small admin screen edits `grade_fundamental` per year (re-baseline), warning that changes affect all
programs of that grade.

## Validation impact

`validateProgramMOECredits` / `validateActivityCoverage` / `validateTrackElectives` must validate the
**effective** subjects (template + overrides + owned), not raw `program_subject`. Routing them through
the adapter preserves their current logic.

## Out of scope (v1)

- Per-`AcademicYear` template versioning (single global template for now).
- ทวิศึกษา / vocational opt-out mechanics beyond "don't auto-apply the academic template" (see `-rne`).
- No change to scheduling (`class_schedule`) — fundamentals still produce the same subject rows.

## Risks

- **Reroute breadth (~15 consumers)** — highest risk; one missed reader silently bypasses inheritance.
  Mitigate: the plan enumerates every call site; consider a lint/grep gate that flags direct
  `program_subject` reads outside the repository/seam.
- **Backfill correctness** — mitigated by the pre/post effective-set equality check.
- **Caching** — effective-subject reads should adopt the existing `cacheStrategy` pattern used by
  `public-data.repository`.

## Testing strategy

- Unit: `getEffectiveProgramSubjects` (inherit, exclude, credit-override, owned-wins dedupe, empty
  template, year out of range).
- Migration: the pre/post equality verification script on seeded data.
- Integration: validation services produce identical results via the seam vs the pre-migration raw
  reads for representative programs.
- CI is the test source of truth.
