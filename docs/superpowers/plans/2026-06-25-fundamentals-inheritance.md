# Fundamental-Subject Reference-Inheritance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Model วิชาพื้นฐาน (CORE fundamentals) once per grade (`grade_fundamental`) and have every program inherit them **by reference** with per-program exclude/credit-override (`program_fundamental_override`), instead of duplicating CORE rows into every program's `program_subject`.

**Architecture:** A single pure composition function (`getEffectiveProgramSubjects`) merges three inputs — the per-year template, the program's overrides, and the program's owned `program_subject` rows — into one `EffectiveSubject[]`. Every reader reaches subjects through a repository seam (`programRepository.getEffectiveSubjects`) that wraps that function, never reading `program_subject` directly. An additive migration plus a behavior-preserving backfill (gated by a pre/post effective-set equality check) converts existing data without changing any program's effective subjects.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Prisma (Dolt-backed MySQL), Vitest (unit/integration), Playwright (e2e), pnpm.

**Beads issue:** `school-timetable-senior-project-0e5`
**Spec:** `docs/superpowers/specs/2026-06-24-fundamentals-inheritance-design.md`

## Global Constraints

Every task's requirements implicitly include this section.

- **Package manager: pnpm only.** Never `npm`/`yarn`.
- **Tooling:** Use Serena symbolic MCP tools (`get_symbols_overview`, `find_symbol`, `replace_symbol_body`, `insert_after_symbol`, `find_referencing_symbols`) for all `.ts`/`.tsx` reads and edits. Built-in Read/Edit only for `.prisma`, `.json`, `.md`, SQL, and after Serena fails on a target.
- **Subject codes are Thai MOE codes** (`ท21101`, `ค31101`, …) — the production seed `prisma/seed.ts` is the single source of truth. Never reintroduce the legacy Latin codes (`TH101`) from `prisma/seed-moe.ts`; that file is not production-wired (`package.json` `db:seed` → `prisma/seed.ts`).
- **Credit mapping (verbatim):** `CREDIT_05 → 0.5, CREDIT_10 → 1.0, CREDIT_15 → 1.5, CREDIT_20 → 2.0` (`prisma/seed.ts:665-666`).
- **Backfill is behavior-preserving.** After migration, every existing program's *effective* subject set must equal its pre-migration `program_subject` set on `{SubjectCode, Category, MinCredits, MaxCredits, IsMandatory}`. The verification script is the definition of done — migration is not complete until it passes.
- **v1 scope:** one global template per year (Year 1..6); NO per-`AcademicYear` versioning. ทวิศึกษา/vocational opt-out beyond "don't auto-apply" is out of scope (no vocational program exists in the seed today).
- **CI is the test source of truth.** Do not run full e2e/visual suites locally; rely on `pnpm typecheck`, `pnpm lint`, and targeted `pnpm test <file>` (Vitest) locally, and let CI run the full matrix. (See memory `ci-is-test-source-of-truth`.)
- **No new `program_subject` direct reads** outside the repository seam. Task 11 enforces this with an automated gate.
- **MOE validator signature is frozen:** `validateProgramMOECredits` / `validateActivityCoverage` / `validateTrackElectives` keep consuming `Array<program_subject & { subject: subject }>`. Reroutes feed them adapter output, not a new shape.

## File Structure

**New files:**
- `prisma/schema.prisma` (modify) — add `grade_fundamental`, `program_fundamental_override` models + back-relations.
- `prisma/data/fundamentals.ts` — canonical per-year CORE template data (the seed/config source of truth for `grade_fundamental`).
- `src/features/program/domain/services/effective-subjects.service.ts` — the pure `getEffectiveProgramSubjects` composition function + adapter + `EffectiveSubject` type.
- `__test__/features/program/effective-subjects.service.test.ts` — unit tests for the composition function + adapter.
- `prisma/migration-backfill-fundamentals.ts` — behavior-preserving backfill + pre/post verification (mirrors existing `prisma/migration-backfill-break-groups.ts`).
- `__test__/features/program/fundamentals-backfill.test.ts` — backfill-logic unit test against fixtures.
- `scripts/check-program-subject-reads.ts` — stray-read gate.
- `__test__/architecture/no-stray-program-subject-reads.test.ts` — gate as a Vitest test.

**Modified (the seam + reroutes):**
- `src/features/program/infrastructure/repositories/program.repository.ts` — add `getEffectiveSubjects` + `getEffectiveSubjectsForValidation`.
- `src/features/program/domain/types/program.types.ts` — export `EffectiveSubject`.
- `src/features/program/application/actions/program.actions.ts`
- `src/features/program/presentation/hooks/useProgramSubjects.ts`, `useSubjectAssignment.ts`
- `src/features/config/infrastructure/repositories/config.repository.ts`, `src/features/config/domain/services/publish-readiness.service.ts`, `src/features/config/types/config-types.ts`
- `src/features/teaching-assignment/infrastructure/repositories/teaching-assignment.repository.ts`, `src/features/teaching-assignment/domain/types/assignment.types.ts`
- `src/features/schedule-wizard/domain/curriculum-overview.ts`
- `src/features/subject/infrastructure/repositories/subject.repository.ts`
- `src/features/analytics/infrastructure/repositories/compliance.repository.ts`
- `src/app/dashboard/[academicYear]/[semester]/all-program/function/ExportAllProgram.ts`
- `prisma/seed.ts` — stop inserting CORE `program_subject`, seed `grade_fundamental` instead.
- UI: program-subject assignment screen (inherited vs owned sections) + new admin `grade_fundamental` editor.

---

## Task 1: Pure composition function `getEffectiveProgramSubjects`

The seam core. No DB, no I/O — a pure function, the cleanest unit to TDD. Everything downstream depends on its types.

**Files:**
- Create: `src/features/program/domain/services/effective-subjects.service.ts`
- Test: `__test__/features/program/effective-subjects.service.test.ts`

**Interfaces:**
- Consumes: Prisma row types `grade_fundamental`, `program_fundamental_override`, `program_subject`, `subject` from `@/prisma/generated/client`, and `SubjectCategory` enum.
- Produces:
  - `type EffectiveSubjectSource = "INHERITED" | "OWNED"`
  - `interface EffectiveSubject` — a **superset of `program_subject`** plus `{ source, overridden, subject }`. Exact fields: `ProgramSubjectID: number` (synthetic-negative for inherited), `ProgramID: number`, `SubjectCode: string`, `Category: SubjectCategory`, `IsMandatory: boolean`, `MinCredits: number`, `MaxCredits: number | null`, `SortOrder: number`, `source: EffectiveSubjectSource`, `overridden: boolean`, `subject: subject`.
  - `function getEffectiveProgramSubjects(input: { programId: number; year: number; template: Array<grade_fundamental & { subject: subject }>; overrides: program_fundamental_override[]; programSubjects: Array<program_subject & { subject: subject }>; }): EffectiveSubject[]`
  - `function toProgramSubjectShape(rows: EffectiveSubject[]): Array<program_subject & { subject: subject }>`

> **Design note (deviation from spec interface, intentional):** the spec's illustrative `EffectiveSubject` omits `IsMandatory`, `ProgramSubjectID`, `ProgramID`, `SortOrder`. The frozen validator `validateMandatorySubjects` reads `IsMandatory`, and the adapter target is `program_subject & { subject }`, so we widen `EffectiveSubject` to a superset of `program_subject`. Inherited rows synthesize: `IsMandatory: true` (CORE is always mandatory), `ProgramSubjectID: -GradeFundamentalID` (negative → never collides with real autoincrement IDs), `SortOrder` from the template row.

- [ ] **Step 1: Write the failing test**

```ts
// __test__/features/program/effective-subjects.service.test.ts
import { describe, it, expect } from "vitest";
import {
  getEffectiveProgramSubjects,
  toProgramSubjectShape,
} from "@/features/program/domain/services/effective-subjects.service";
import type {
  grade_fundamental,
  program_fundamental_override,
  program_subject,
  subject,
} from "@/prisma/generated/client";

const subj = (code: string, category = "CORE"): subject =>
  ({
    SubjectCode: code,
    SubjectName: code,
    Credit: "CREDIT_10",
    ActivityType: null,
    Description: null,
    IsGraded: true,
    LearningArea: "THAI",
    Category: category,
  } as unknown as subject);

const tmpl = (
  id: number,
  code: string,
  min: number,
  sort: number,
): grade_fundamental & { subject: subject } =>
  ({
    GradeFundamentalID: id,
    Year: 4,
    SubjectCode: code,
    MinCredits: min,
    MaxCredits: null,
    SortOrder: sort,
    subject: subj(code),
  } as unknown as grade_fundamental & { subject: subject });

const owned = (
  id: number,
  code: string,
  category: string,
  min: number,
  sort: number,
): program_subject & { subject: subject } =>
  ({
    ProgramSubjectID: id,
    ProgramID: 1,
    SubjectCode: code,
    Category: category,
    IsMandatory: category !== "ACTIVITY",
    MinCredits: min,
    MaxCredits: null,
    SortOrder: sort,
    subject: subj(code, category),
  } as unknown as program_subject & { subject: subject });

describe("getEffectiveProgramSubjects", () => {
  it("emits template rows as INHERITED CORE with synthetic mandatory flag", () => {
    const result = getEffectiveProgramSubjects({
      programId: 1,
      year: 4,
      template: [tmpl(10, "ท31101", 1.0, 1)],
      overrides: [],
      programSubjects: [],
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      SubjectCode: "ท31101",
      source: "INHERITED",
      Category: "CORE",
      IsMandatory: true,
      MinCredits: 1.0,
      overridden: false,
      ProgramSubjectID: -10,
      ProgramID: 1,
    });
  });

  it("skips an excluded template row", () => {
    const result = getEffectiveProgramSubjects({
      programId: 1,
      year: 4,
      template: [tmpl(10, "ท31101", 1.0, 1)],
      overrides: [
        {
          ProgramFundamentalOverrideID: 1,
          ProgramID: 1,
          SubjectCode: "ท31101",
          Excluded: true,
          MinCredits: null,
          MaxCredits: null,
        } as program_fundamental_override,
      ],
      programSubjects: [],
    });
    expect(result).toHaveLength(0);
  });

  it("applies a credit override and marks overridden", () => {
    const result = getEffectiveProgramSubjects({
      programId: 1,
      year: 4,
      template: [tmpl(10, "ท31101", 1.0, 1)],
      overrides: [
        {
          ProgramFundamentalOverrideID: 1,
          ProgramID: 1,
          SubjectCode: "ท31101",
          Excluded: false,
          MinCredits: 0.5,
          MaxCredits: null,
        } as program_fundamental_override,
      ],
      programSubjects: [],
    });
    expect(result[0]).toMatchObject({ MinCredits: 0.5, overridden: true });
  });

  it("emits owned rows and lets OWNED win the dedupe", () => {
    const result = getEffectiveProgramSubjects({
      programId: 1,
      year: 4,
      template: [tmpl(10, "ท31101", 1.0, 1)],
      overrides: [],
      programSubjects: [
        owned(100, "ท31101", "CORE", 2.0, 1), // same code as template
        owned(101, "ค31201", "ADDITIONAL", 1.5, 2),
      ],
    });
    const byCode = Object.fromEntries(result.map((r) => [r.SubjectCode, r]));
    expect(result).toHaveLength(2); // template row suppressed by owned
    expect(byCode["ท31101"]).toMatchObject({ source: "OWNED", MinCredits: 2.0 });
    expect(byCode["ค31201"]).toMatchObject({ source: "OWNED", Category: "ADDITIONAL" });
  });

  it("returns empty for an empty template and no owned rows", () => {
    expect(
      getEffectiveProgramSubjects({
        programId: 1,
        year: 2,
        template: [],
        overrides: [],
        programSubjects: [],
      }),
    ).toEqual([]);
  });

  it("toProgramSubjectShape strips seam metadata to the validator shape", () => {
    const eff = getEffectiveProgramSubjects({
      programId: 1,
      year: 4,
      template: [tmpl(10, "ท31101", 1.0, 1)],
      overrides: [],
      programSubjects: [owned(101, "ค31201", "ADDITIONAL", 1.5, 2)],
    });
    const shaped = toProgramSubjectShape(eff);
    expect(shaped[0]).not.toHaveProperty("source");
    expect(shaped[0]).not.toHaveProperty("overridden");
    expect(shaped[0]).toHaveProperty("IsMandatory");
    expect(shaped[0]).toHaveProperty("subject");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test __test__/features/program/effective-subjects.service.test.ts`
Expected: FAIL — `Cannot find module '.../effective-subjects.service'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/features/program/domain/services/effective-subjects.service.ts
import { SubjectCategory } from "@/prisma/generated/client";
import type {
  grade_fundamental,
  program_fundamental_override,
  program_subject,
  subject,
} from "@/prisma/generated/client";

export type EffectiveSubjectSource = "INHERITED" | "OWNED";

/** Superset of `program_subject` plus inheritance metadata. */
export interface EffectiveSubject {
  ProgramSubjectID: number; // synthetic-negative for INHERITED rows
  ProgramID: number;
  SubjectCode: string;
  Category: SubjectCategory;
  IsMandatory: boolean;
  MinCredits: number;
  MaxCredits: number | null;
  SortOrder: number;
  source: EffectiveSubjectSource;
  overridden: boolean;
  subject: subject;
}

export interface EffectiveSubjectInput {
  programId: number;
  year: number;
  template: Array<grade_fundamental & { subject: subject }>;
  overrides: program_fundamental_override[];
  programSubjects: Array<program_subject & { subject: subject }>;
}

export function getEffectiveProgramSubjects(
  input: EffectiveSubjectInput,
): EffectiveSubject[] {
  const { programId, template, overrides, programSubjects } = input;

  const overrideByCode = new Map(overrides.map((o) => [o.SubjectCode, o]));
  const ownedCodes = new Set(programSubjects.map((ps) => ps.SubjectCode));

  const inherited: EffectiveSubject[] = [];
  for (const t of [...template].sort((a, b) => a.SortOrder - b.SortOrder)) {
    if (ownedCodes.has(t.SubjectCode)) continue; // OWNED wins the dedupe
    const ov = overrideByCode.get(t.SubjectCode);
    if (ov?.Excluded) continue;
    const hasCreditOverride =
      ov != null && (ov.MinCredits != null || ov.MaxCredits != null);
    inherited.push({
      ProgramSubjectID: -t.GradeFundamentalID,
      ProgramID: programId,
      SubjectCode: t.SubjectCode,
      Category: SubjectCategory.CORE,
      IsMandatory: true,
      MinCredits: ov?.MinCredits ?? t.MinCredits,
      MaxCredits: ov?.MaxCredits ?? t.MaxCredits,
      SortOrder: t.SortOrder,
      source: "INHERITED",
      overridden: hasCreditOverride,
      subject: t.subject,
    });
  }

  const ownedEffective: EffectiveSubject[] = [...programSubjects]
    .sort((a, b) => a.SortOrder - b.SortOrder)
    .map((ps) => ({
      ProgramSubjectID: ps.ProgramSubjectID,
      ProgramID: ps.ProgramID,
      SubjectCode: ps.SubjectCode,
      Category: ps.Category,
      IsMandatory: ps.IsMandatory,
      MinCredits: ps.MinCredits,
      MaxCredits: ps.MaxCredits,
      SortOrder: ps.SortOrder,
      source: "OWNED" as const,
      overridden: false,
      subject: ps.subject,
    }));

  return [...inherited, ...ownedEffective];
}

export function toProgramSubjectShape(
  rows: EffectiveSubject[],
): Array<program_subject & { subject: subject }> {
  return rows.map((r) => ({
    ProgramSubjectID: r.ProgramSubjectID,
    ProgramID: r.ProgramID,
    SubjectCode: r.SubjectCode,
    Category: r.Category,
    IsMandatory: r.IsMandatory,
    MinCredits: r.MinCredits,
    MaxCredits: r.MaxCredits,
    SortOrder: r.SortOrder,
    subject: r.subject,
  })) as Array<program_subject & { subject: subject }>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test __test__/features/program/effective-subjects.service.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/program/domain/services/effective-subjects.service.ts __test__/features/program/effective-subjects.service.test.ts
git commit -m "feat(program): add pure effective-subjects composition seam"
```

---

## Task 2: Prisma models + additive migration

Adds the two tables and back-relations. No data change yet — purely additive so the build stays green.

**Files:**
- Modify: `prisma/schema.prisma` (add models near `program_subject`, line ~110; extend `program` ~76-91 and `subject` ~58-74)
- Generated: `prisma/generated/client` (via `prisma generate`)

**Interfaces:**
- Produces: Prisma models `grade_fundamental`, `program_fundamental_override`; relations `program.program_fundamental_override[]`, `subject.grade_fundamental[]`, `subject.program_fundamental_override[]`.

- [ ] **Step 1: Add the two models to `prisma/schema.prisma`** (after the `program_subject` model, ~line 110)

```prisma
model grade_fundamental {
  GradeFundamentalID Int     @id @default(autoincrement())
  Year               Int
  SubjectCode        String
  MinCredits         Float
  MaxCredits         Float?
  SortOrder          Int     @default(0)
  subject            subject @relation(fields: [SubjectCode], references: [SubjectCode], onDelete: Cascade, map: "fk_grade_fundamental_subject")

  @@unique([Year, SubjectCode], map: "grade_fundamental_year_subject_unique")
  @@index([Year])
}

model program_fundamental_override {
  ProgramFundamentalOverrideID Int     @id @default(autoincrement())
  ProgramID                    Int
  SubjectCode                  String
  Excluded                     Boolean @default(false)
  MinCredits                   Float?
  MaxCredits                   Float?
  program                      program @relation(fields: [ProgramID], references: [ProgramID], onDelete: Cascade, map: "fk_pfo_program")
  subject                      subject @relation(fields: [SubjectCode], references: [SubjectCode], onDelete: Cascade, map: "fk_pfo_subject")

  @@unique([ProgramID, SubjectCode], map: "program_fundamental_override_unique")
  @@index([ProgramID])
}
```

- [ ] **Step 2: Add back-relations**

In `model subject {` (after `program_subject  program_subject[]`, ~line 68):
```prisma
  grade_fundamental            grade_fundamental[]
  program_fundamental_override program_fundamental_override[]
```
In `model program {` (after `program_subject program_subject[]`, ~line 86):
```prisma
  program_fundamental_override program_fundamental_override[]
```

- [ ] **Step 3: Create the migration**

Run: `pnpm db:migrate --name add_grade_fundamental_inheritance`
(`db:migrate` = `prisma migrate dev`; it generates the SQL, applies it, and runs `prisma generate`.)
Expected: a new folder `prisma/migrations/<timestamp>_add_grade_fundamental_inheritance/migration.sql` containing two `CREATE TABLE` statements; no `DROP`/`ALTER` on existing tables.

- [ ] **Step 4: Verify schema is valid and client regenerated**

Run: `pnpm typecheck`
Expected: PASS — `grade_fundamental` and `program_fundamental_override` resolve as imports from `@/prisma/generated/client` (re-run the Task 1 test; it should still pass with the real generated types).

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations prisma/generated
git commit -m "feat(db): add grade_fundamental + program_fundamental_override tables"
```

---

## Task 3: Canonical per-year fundamentals data module

Single source of truth for `grade_fundamental` seed rows, extracted from the existing `prisma/seed.ts` CORE catalog. This is the data the template carries; the spec calls it the editable config module.

**Files:**
- Create: `prisma/data/fundamentals.ts`
- Test: `__test__/features/program/fundamentals-data.test.ts`

**Interfaces:**
- Produces: `interface FundamentalTemplateRow { Year: number; SubjectCode: string; MinCredits: number; MaxCredits: number | null; SortOrder: number }` and `const FUNDAMENTALS: FundamentalTemplateRow[]`.

> **Data source (verbatim from `prisma/seed.ts`):** CORE subjects per year, credits via the `CREDIT_*` map. Junior Thai/Math/Science are `CREDIT_15` (1.5); all other junior CORE and all senior CORE are `CREDIT_10` (1.0). `MaxCredits` is `null` (the seed only sets `MinCredits`).

- [ ] **Step 1: Write the failing test**

```ts
// __test__/features/program/fundamentals-data.test.ts
import { describe, it, expect } from "vitest";
import { FUNDAMENTALS } from "@/prisma/data/fundamentals";

describe("FUNDAMENTALS template data", () => {
  it("covers years 1..6", () => {
    const years = new Set(FUNDAMENTALS.map((f) => f.Year));
    expect([...years].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("has a unique (Year, SubjectCode) key", () => {
    const keys = FUNDAMENTALS.map((f) => `${f.Year}:${f.SubjectCode}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("matches the M1 CORE set from seed.ts (8 subjects, Thai codes)", () => {
    const m1 = FUNDAMENTALS.filter((f) => f.Year === 1).map((f) => f.SubjectCode);
    expect(m1.sort()).toEqual(
      ["ท21101", "ค21101", "ว21101", "ส21101", "พ21101", "ศ21101", "ง21101", "อ21101"].sort(),
    );
  });

  it("matches the M4 CORE set from seed.ts (6 subjects)", () => {
    const m4 = FUNDAMENTALS.filter((f) => f.Year === 4).map((f) => f.SubjectCode);
    expect(m4.sort()).toEqual(
      ["ท31101", "ค31101", "ว31101", "ส31101", "พ31101", "อ31101"].sort(),
    );
  });

  it("uses 1.5 credits for junior Thai/Math/Science and 1.0 otherwise", () => {
    const find = (y: number, c: string) =>
      FUNDAMENTALS.find((f) => f.Year === y && f.SubjectCode === c);
    expect(find(1, "ท21101")!.MinCredits).toBe(1.5);
    expect(find(1, "ส21101")!.MinCredits).toBe(1.0);
    expect(find(4, "ท31101")!.MinCredits).toBe(1.0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test __test__/features/program/fundamentals-data.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the data module**

```ts
// prisma/data/fundamentals.ts
export interface FundamentalTemplateRow {
  Year: number;
  SubjectCode: string;
  MinCredits: number;
  MaxCredits: number | null;
  SortOrder: number;
}

// Source of truth: prisma/seed.ts CORE catalog (Thai MOE codes).
// Junior (M1-M3): Thai/Math/Science = 1.5 credits; Social/Health/Arts/Career/English = 1.0.
// Senior (M4-M6): all CORE = 1.0.
const JUNIOR_15 = ["ท", "ค", "ว"]; // Thai, Math, Science prefixes carry 1.5 in junior
const r = (
  year: number,
  codes: string[],
  creditFor: (code: string) => number,
): FundamentalTemplateRow[] =>
  codes.map((SubjectCode, i) => ({
    Year: year,
    SubjectCode,
    MinCredits: creditFor(SubjectCode),
    MaxCredits: null,
    SortOrder: i + 1,
  }));

const juniorCredit = (code: string) =>
  JUNIOR_15.includes(code[0]) ? 1.5 : 1.0;
const seniorCredit = () => 1.0;

export const FUNDAMENTALS: FundamentalTemplateRow[] = [
  ...r(1, ["ท21101", "ค21101", "ว21101", "ส21101", "พ21101", "ศ21101", "ง21101", "อ21101"], juniorCredit),
  ...r(2, ["ท22101", "ค22101", "ว22101", "ส22101", "พ22101", "ศ22101", "ง22101", "อ22101"], juniorCredit),
  ...r(3, ["ท23101", "ค23101", "ว23101", "ส23101", "พ23101", "ศ23101", "ง23101", "อ23101"], juniorCredit),
  ...r(4, ["ท31101", "ค31101", "ว31101", "ส31101", "พ31101", "อ31101"], seniorCredit),
  ...r(5, ["ท32101", "ค32101", "ว32101", "ส32101", "พ32101", "อ32101"], seniorCredit),
  ...r(6, ["ท33101", "ค33101", "ว33101", "ส33101", "พ33101", "อ33101"], seniorCredit),
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test __test__/features/program/fundamentals-data.test.ts`
Expected: PASS (5 tests).

> **Cross-check before committing:** open `prisma/seed.ts` `PROGRAM_SUBJECTS` (lines 668-681) and confirm each year's CORE codes here exactly match the CORE-category codes assigned to that year's programs. If a program in the seed carries a CORE code not in `FUNDAMENTALS` for its year (or vice-versa), reconcile here — `FUNDAMENTALS` must be the exact union of CORE codes per year, or the Task 9 seed change will change effective sets. M2/M3/M5/M6 follow the same shape as M1/M4 respectively.
>
> **Credit-source caveat:** `FUNDAMENTALS.MinCredits` is computed by a prefix heuristic (`ท/ค/ว` junior = 1.5, else 1.0). This is a *second encoding* of a fact the subject catalog already owns via `creditToNum(subject.Credit)`. It agrees with the catalog for every M1–M6 code today, but the heuristic is not self-validating. The behavior-preserving gate is **Task 9's second parity test** (`row.MinCredits === creditToNum(row.subject.Credit)`), which fails if the heuristic ever drifts. If you prefer one source of truth, export the catalog credit map from `seed.ts` and derive `MinCredits` from it instead of the heuristic.

- [ ] **Step 5: Commit**

```bash
git add prisma/data/fundamentals.ts __test__/features/program/fundamentals-data.test.ts
git commit -m "feat(program): add canonical per-year fundamentals template data"
```

---

## Task 4: Repository seam — `getEffectiveSubjects` + validation adapter

Wraps the pure function with the three DB loads and the `cacheStrategy` pattern. This is the only place that reads `grade_fundamental` / `program_fundamental_override` / a program's `program_subject` for the effective view.

**Files:**
- Modify: `src/features/program/infrastructure/repositories/program.repository.ts` (add two methods to the `programRepository` object; import the service + `cacheStrategy`)
- Modify: `src/features/program/domain/types/program.types.ts` (re-export `EffectiveSubject`)
- Test: `__test__/features/program/program-repository-effective.test.ts` (integration, hits the DB)

**Interfaces:**
- Consumes: `getEffectiveProgramSubjects`, `toProgramSubjectShape` (Task 1); `cacheStrategy` from `@/lib/cache-config` (pattern: `...cacheStrategy("static" | "warm" | "fresh", string[])` spread into a Prisma query — see `public-data.repository.ts:210,307,372`).
- Produces:
  - `programRepository.getEffectiveSubjects(programId: number): Promise<EffectiveSubject[]>`
  - `programRepository.getEffectiveSubjectsForValidation(programId: number): Promise<Array<program_subject & { subject: subject }>>`

- [ ] **Step 1: Write the failing integration test**

```ts
// __test__/features/program/program-repository-effective.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { programRepository } from "@/features/program/infrastructure/repositories/program.repository";
import prisma from "@/lib/prisma";

// Assumes the test DB is seeded (pnpm test runs against the seeded test DB in CI).
describe("programRepository.getEffectiveSubjects (integration)", () => {
  let m4SciId: number;
  beforeAll(async () => {
    const p = await prisma.program.findUnique({ where: { ProgramCode: "M4-SCI" } });
    m4SciId = p!.ProgramID;
  });

  it("returns inherited CORE + owned non-CORE for a seeded program", async () => {
    const eff = await programRepository.getEffectiveSubjects(m4SciId);
    const inherited = eff.filter((e) => e.source === "INHERITED");
    const owned = eff.filter((e) => e.source === "OWNED");
    expect(inherited.every((e) => e.Category === "CORE")).toBe(true);
    expect(inherited.map((e) => e.SubjectCode)).toEqual(
      expect.arrayContaining(["ท31101", "ค31101", "ว31101", "ส31101", "พ31101", "อ31101"]),
    );
    expect(owned.some((e) => e.Category === "ACTIVITY")).toBe(true);
  });

  it("validation adapter strips metadata but keeps IsMandatory + subject", async () => {
    const rows = await programRepository.getEffectiveSubjectsForValidation(m4SciId);
    expect(rows[0]).toHaveProperty("IsMandatory");
    expect(rows[0]).toHaveProperty("subject");
    expect(rows[0]).not.toHaveProperty("source");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test __test__/features/program/program-repository-effective.test.ts`
Expected: FAIL — `getEffectiveSubjects is not a function`.

- [ ] **Step 3: Implement the seam methods**

Add imports at the top of `program.repository.ts`:
```ts
import { cacheStrategy } from "@/lib/cache-config";
import {
  getEffectiveProgramSubjects,
  toProgramSubjectShape,
  type EffectiveSubject,
} from "@/features/program/domain/services/effective-subjects.service";
```
Insert these two methods into the `programRepository` object (e.g. right after `getProgramSubjectsWithDetails`), using `insert_after_symbol` on that method:
```ts
  /**
   * Effective subjects = per-year template (grade_fundamental) inherited by
   * reference, minus per-program excludes, plus credit overrides, plus the
   * program's own (ADDITIONAL/ACTIVITY) program_subject rows. The single seam
   * all readers must use instead of reading program_subject directly.
   */
  async getEffectiveSubjects(programId: number): Promise<EffectiveSubject[]> {
    const program = await prisma.program.findUnique({
      where: { ProgramID: programId },
      select: { ProgramID: true, Year: true },
      ...cacheStrategy("warm", ["programs", `program_${programId}`]),
    });
    if (!program) return [];

    const [template, overrides, programSubjects] = await Promise.all([
      prisma.grade_fundamental.findMany({
        where: { Year: program.Year },
        include: { subject: true },
        orderBy: { SortOrder: "asc" },
        ...cacheStrategy("static", ["fundamentals", `fundamentals_y${program.Year}`]),
      }),
      prisma.program_fundamental_override.findMany({
        where: { ProgramID: programId },
        ...cacheStrategy("warm", ["programs", `program_${programId}`]),
      }),
      prisma.program_subject.findMany({
        where: { ProgramID: programId },
        include: { subject: true },
        orderBy: { SortOrder: "asc" },
        ...cacheStrategy("warm", ["programs", `program_${programId}`]),
      }),
    ]);

    return getEffectiveProgramSubjects({
      programId,
      year: program.Year,
      template,
      overrides,
      programSubjects,
    });
  },

  /** Adapter to the shape moe-validation.service consumes. */
  async getEffectiveSubjectsForValidation(programId: number) {
    // Reference programRepository.* (not `this`) so destructured callers don't break.
    return toProgramSubjectShape(
      await programRepository.getEffectiveSubjects(programId),
    );
  },
```
In `program.types.ts`, re-export the type so consumers import from the feature's type barrel:
```ts
export type { EffectiveSubject } from "@/features/program/domain/services/effective-subjects.service";
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test __test__/features/program/program-repository-effective.test.ts`
Expected: PASS. Then `pnpm typecheck` PASS.

> If `cacheStrategy("static", [...])` tags collide with an existing tag namespace, keep the `"fundamentals"` tag — Task 9's seed/admin edits invalidate it.

- [ ] **Step 5: Commit**

```bash
git add src/features/program/infrastructure/repositories/program.repository.ts src/features/program/domain/types/program.types.ts __test__/features/program/program-repository-effective.test.ts
git commit -m "feat(program): add getEffectiveSubjects repository seam with caching"
```

---

## Task 5: Behavior-preserving backfill + verification gate

Converts existing data to inheritance and proves equality. Mirrors `prisma/migration-backfill-break-groups.ts` (existing pattern, wired as `db:backfill:break-groups`).

**Files:**
- Create: `prisma/migration-backfill-fundamentals.ts`
- Create: `__test__/features/program/fundamentals-backfill.test.ts` (pure-logic test of the diff, no DB)
- Modify: `package.json` (add `"db:backfill:fundamentals": "tsx prisma/migration-backfill-fundamentals.ts"`)

**Interfaces:**
- Consumes: `FUNDAMENTALS` (Task 3), `getEffectiveProgramSubjects` (Task 1).
- Produces: exported pure helper `planProgramBackfill(input): { deletes: string[]; overrides: Array<{ SubjectCode: string; Excluded: boolean; MinCredits: number | null; MaxCredits: number | null }> }` and a `main()` that applies it in a transaction then runs `verify()`.

- [ ] **Step 1: Write the failing backfill-logic test**

```ts
// __test__/features/program/fundamentals-backfill.test.ts
import { describe, it, expect } from "vitest";
import { planProgramBackfill } from "@/prisma/migration-backfill-fundamentals";

const template = [
  { SubjectCode: "ท31101", MinCredits: 1.0, MaxCredits: null },
  { SubjectCode: "ค31101", MinCredits: 1.0, MaxCredits: null },
  { SubjectCode: "ว31101", MinCredits: 1.0, MaxCredits: null },
];

describe("planProgramBackfill", () => {
  it("deletes CORE rows that match the template exactly (no override)", () => {
    const plan = planProgramBackfill({
      template,
      coreProgramSubjects: [
        { SubjectCode: "ท31101", MinCredits: 1.0, MaxCredits: null },
        { SubjectCode: "ค31101", MinCredits: 1.0, MaxCredits: null },
        { SubjectCode: "ว31101", MinCredits: 1.0, MaxCredits: null },
      ],
    });
    expect(plan.deletes.sort()).toEqual(["ค31101", "ท31101", "ว31101"]);
    expect(plan.overrides).toEqual([]);
  });

  it("emits a credit override when a CORE row's credits differ from template", () => {
    const plan = planProgramBackfill({
      template,
      coreProgramSubjects: [
        { SubjectCode: "ท31101", MinCredits: 0.5, MaxCredits: null }, // differs
        { SubjectCode: "ค31101", MinCredits: 1.0, MaxCredits: null },
        { SubjectCode: "ว31101", MinCredits: 1.0, MaxCredits: null },
      ],
    });
    expect(plan.deletes.sort()).toEqual(["ค31101", "ท31101", "ว31101"]);
    expect(plan.overrides).toContainEqual({
      SubjectCode: "ท31101",
      Excluded: false,
      MinCredits: 0.5,
      MaxCredits: null,
    });
  });

  it("emits an Excluded override when a template subject is absent from the program", () => {
    const plan = planProgramBackfill({
      template,
      coreProgramSubjects: [
        { SubjectCode: "ท31101", MinCredits: 1.0, MaxCredits: null },
        { SubjectCode: "ค31101", MinCredits: 1.0, MaxCredits: null },
        // ว31101 missing
      ],
    });
    expect(plan.deletes.sort()).toEqual(["ค31101", "ท31101"]);
    expect(plan.overrides).toContainEqual({
      SubjectCode: "ว31101",
      Excluded: true,
      MinCredits: null,
      MaxCredits: null,
    });
  });

  it("leaves a non-template CORE row untouched (not deleted, no override)", () => {
    const plan = planProgramBackfill({
      template,
      coreProgramSubjects: [
        { SubjectCode: "ท31101", MinCredits: 1.0, MaxCredits: null },
        { SubjectCode: "ค31101", MinCredits: 1.0, MaxCredits: null },
        { SubjectCode: "ว31101", MinCredits: 1.0, MaxCredits: null },
        { SubjectCode: "ส30999", MinCredits: 1.0, MaxCredits: null }, // not in template
      ],
    });
    expect(plan.deletes).not.toContain("ส30999");
    expect(plan.overrides.find((o) => o.SubjectCode === "ส30999")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test __test__/features/program/fundamentals-backfill.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the backfill script + pure planner**

```ts
// prisma/migration-backfill-fundamentals.ts
import { PrismaClient } from "@/prisma/generated/client";
import { FUNDAMENTALS } from "@/prisma/data/fundamentals";
import { getEffectiveProgramSubjects } from "@/features/program/domain/services/effective-subjects.service";

const prisma = new PrismaClient();

type CoreRow = { SubjectCode: string; MinCredits: number; MaxCredits: number | null };
type TemplateRow = { SubjectCode: string; MinCredits: number; MaxCredits: number | null };

export function planProgramBackfill(input: {
  template: TemplateRow[];
  coreProgramSubjects: CoreRow[];
}): {
  deletes: string[];
  overrides: Array<{ SubjectCode: string; Excluded: boolean; MinCredits: number | null; MaxCredits: number | null }>;
} {
  const templateByCode = new Map(input.template.map((t) => [t.SubjectCode, t]));
  const coreByCode = new Map(input.coreProgramSubjects.map((c) => [c.SubjectCode, c]));
  const deletes: string[] = [];
  const overrides: Array<{ SubjectCode: string; Excluded: boolean; MinCredits: number | null; MaxCredits: number | null }> = [];

  for (const core of input.coreProgramSubjects) {
    const t = templateByCode.get(core.SubjectCode);
    if (!t) continue; // non-template CORE: leave it owned, untouched
    deletes.push(core.SubjectCode);
    if (core.MinCredits !== t.MinCredits || (core.MaxCredits ?? null) !== (t.MaxCredits ?? null)) {
      overrides.push({
        SubjectCode: core.SubjectCode,
        Excluded: false,
        MinCredits: core.MinCredits,
        MaxCredits: core.MaxCredits ?? null,
      });
    }
  }
  for (const t of input.template) {
    if (!coreByCode.has(t.SubjectCode)) {
      overrides.push({ SubjectCode: t.SubjectCode, Excluded: true, MinCredits: null, MaxCredits: null });
    }
  }
  return { deletes, overrides };
}

async function snapshotEffectiveSets() {
  const programs = await prisma.program.findMany({
    include: { program_subject: { include: { subject: true } } },
  });
  const map = new Map<number, string>();
  for (const p of programs) {
    map.set(p.ProgramID, serialize(p.program_subject));
  }
  return map;
}

function serialize(rows: Array<{ SubjectCode: string; Category: string; MinCredits: number; MaxCredits: number | null; IsMandatory: boolean }>) {
  return rows
    .map((r) => `${r.SubjectCode}|${r.Category}|${r.MinCredits}|${r.MaxCredits ?? "null"}|${r.IsMandatory}`)
    .sort()
    .join(";");
}

async function main() {
  // 1. Seed grade_fundamental from the canonical data (idempotent upsert).
  for (const f of FUNDAMENTALS) {
    await prisma.grade_fundamental.upsert({
      where: { Year_SubjectCode: { Year: f.Year, SubjectCode: f.SubjectCode } },
      update: { MinCredits: f.MinCredits, MaxCredits: f.MaxCredits, SortOrder: f.SortOrder },
      create: f,
    });
  }

  // 2. Snapshot BEFORE.
  const before = await snapshotEffectiveSets();

  // 3. Backfill per program.
  const programs = await prisma.program.findMany({
    include: { program_subject: { include: { subject: true } } },
  });
  for (const p of programs) {
    const template = FUNDAMENTALS.filter((f) => f.Year === p.Year);
    const coreRows = p.program_subject.filter((ps) => ps.Category === "CORE");
    const plan = planProgramBackfill({ template, coreProgramSubjects: coreRows });
    await prisma.$transaction(async (tx) => {
      if (plan.deletes.length) {
        await tx.program_subject.deleteMany({
          where: { ProgramID: p.ProgramID, SubjectCode: { in: plan.deletes } },
        });
      }
      for (const o of plan.overrides) {
        await tx.program_fundamental_override.upsert({
          where: { ProgramID_SubjectCode: { ProgramID: p.ProgramID, SubjectCode: o.SubjectCode } },
          update: { Excluded: o.Excluded, MinCredits: o.MinCredits, MaxCredits: o.MaxCredits },
          create: { ProgramID: p.ProgramID, ...o },
        });
      }
    });
  }

  // 4. Verify AFTER == BEFORE on the effective set.
  await verify(before);
  console.log("✅ Backfill complete and verified.");
}

async function verify(before: Map<number, string>) {
  const programs = await prisma.program.findMany({ select: { ProgramID: true, Year: true } });
  for (const p of programs) {
    const template = await prisma.grade_fundamental.findMany({ where: { Year: p.Year }, include: { subject: true } });
    const overrides = await prisma.program_fundamental_override.findMany({ where: { ProgramID: p.ProgramID } });
    const programSubjects = await prisma.program_subject.findMany({ where: { ProgramID: p.ProgramID }, include: { subject: true } });
    const eff = getEffectiveProgramSubjects({ programId: p.ProgramID, year: p.Year, template, overrides, programSubjects });
    const after = serialize(eff);
    const wanted = before.get(p.ProgramID) ?? "";
    if (after !== wanted) {
      throw new Error(
        `Backfill mismatch for program ${p.ProgramID} (Year ${p.Year}).\n  before: ${wanted}\n  after:  ${after}`,
      );
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```
Add to `package.json` scripts: `"db:backfill:fundamentals": "tsx prisma/migration-backfill-fundamentals.ts",`

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test __test__/features/program/fundamentals-backfill.test.ts`
Expected: PASS (4 tests). Then `pnpm typecheck` PASS.

- [ ] **Step 5: Commit**

```bash
git add prisma/migration-backfill-fundamentals.ts __test__/features/program/fundamentals-backfill.test.ts package.json
git commit -m "feat(db): add behavior-preserving fundamentals backfill with verification gate"
```

---

## Task 6: Reroute the program feature (actions + validation callers)

The program feature's own server actions validate MOE credits — they must validate the **effective** set. `moe-validation.service.ts` itself stays untouched (frozen signature); its callers switch to `getEffectiveSubjectsForValidation`.

**Files:**
- Modify: `src/features/program/application/actions/program.actions.ts`
- Verify: `src/features/program/domain/services/moe-validation.service.ts` (NO change — confirm via `find_referencing_symbols`)
- Test: `__test__/features/program/program-validation-effective.test.ts`

**Interfaces:**
- Consumes: `programRepository.getEffectiveSubjectsForValidation` (Task 4), `validateProgramMOECredits` (existing).

- [ ] **Step 1:** Use `find_referencing_symbols` on `validateProgramMOECredits` (in `moe-validation.service.ts`) to list every caller. Expect callers in `program.actions.ts` and possibly `config`/`analytics` (handled in their own tasks). For each program-feature caller, the argument currently comes from `getProgramSubjectsWithDetails(programId)` or a `program.program_subject` include.

- [ ] **Step 2: Write the failing test** — assert a seeded program validates identically through the seam.

```ts
// __test__/features/program/program-validation-effective.test.ts
import { describe, it, expect } from "vitest";
import { programRepository } from "@/features/program/infrastructure/repositories/program.repository";
import { validateProgramMOECredits } from "@/features/program/domain/services/moe-validation.service";
import prisma from "@/lib/prisma";

describe("validation via the effective seam", () => {
  it("validates M4-SCI on effective subjects without throwing", async () => {
    const p = await prisma.program.findUnique({ where: { ProgramCode: "M4-SCI" } });
    const subjects = await programRepository.getEffectiveSubjectsForValidation(p!.ProgramID);
    const result = validateProgramMOECredits(p!.Year, subjects, p!.Track);
    expect(result).toHaveProperty("isValid");
    expect(Array.isArray(result.learningAreas)).toBe(true);
  });
});
```

- [ ] **Step 3: Run to verify it fails** (only if the action isn't yet rerouted; if it already compiles, this test passes immediately — then proceed to wire the action and re-run).

Run: `pnpm test __test__/features/program/program-validation-effective.test.ts`

- [ ] **Step 4: Reroute each caller in `program.actions.ts`** — replace the `getProgramSubjectsWithDetails(programId)` / raw `program_subject` argument feeding `validateProgramMOECredits` with `await programRepository.getEffectiveSubjectsForValidation(programId)`. Use `find_symbol` (include_body) on the action, then `replace_symbol_body`.

- [ ] **Step 4b: Verify cache invalidation on existing write paths.** The seam caches effective reads under tags `["programs", "program_<id>"]`. Any existing mutation of a program's subjects (`programRepository.assignSubjects`, program create/update/delete in `program.actions.ts`) must invalidate those tags (e.g. `revalidateTag("program_<id>")` / `revalidateTag("programs")`) or edits will render stale through the seam. Grep the actions for existing `revalidateTag`/`revalidatePath` usage and confirm the seam's tags are covered; add them where missing. (Task 10's new override/admin actions own their own invalidation — this step is only the pre-existing writers.)

- [ ] **Step 5: Run tests + typecheck + lint**

Run: `pnpm test __test__/features/program && pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/program/application/actions/program.actions.ts __test__/features/program/program-validation-effective.test.ts
git commit -m "refactor(program): validate effective subjects via the inheritance seam"
```

---

## Task 7: Reroute config + publish-readiness

`config.repository.ts`, `publish-readiness.service.ts`, and `config-types.ts` read `program_subject` to compute publish readiness. Route them through the seam.

**Files:**
- Modify: `src/features/config/infrastructure/repositories/config.repository.ts`
- Modify: `src/features/config/domain/services/publish-readiness.service.ts`
- Modify: `src/features/config/types/config-types.ts`
- Test: existing `__test__/features/config/domain/services/publish-readiness.service.test.ts` (extend if the read shape changes)

**Interfaces:**
- Consumes: `programRepository.getEffectiveSubjectsForValidation` and/or `getEffectiveSubjects` (Task 4).

- [ ] **Step 1:** `get_symbols_overview` on each file; `find_symbol` the methods that query `prisma.program_subject` or accept `program_subject` arrays. Note the exact call sites.
- [ ] **Step 2:** If `config-types.ts` defines a type aliasing `program_subject` for these reads, switch it to `EffectiveSubject` (or the validator shape) — keep the field names the consumers already use (all present on the superset).
- [ ] **Step 3:** Replace each `prisma.program_subject.findMany({ where: { ProgramID }, include: { subject: true } })` with `programRepository.getEffectiveSubjectsForValidation(programId)` (validator shape) or `getEffectiveSubjects(programId)` (when `source`/`overridden` is needed for display). Use `replace_symbol_body`.
- [ ] **Step 4: Run** `pnpm test __test__/features/config && pnpm typecheck && pnpm lint`. Expected PASS. Extend the publish-readiness test with one case asserting an inherited CORE subject counts toward readiness.
- [ ] **Step 5: Commit**

```bash
git add src/features/config __test__/features/config
git commit -m "refactor(config): compute publish readiness from effective subjects"
```

---

## Task 8: Reroute teaching-assignment, schedule-wizard, subject, analytics, export

The remaining read-only consumers. Each switches its `program_subject` read to the seam. Grouped because each is a small, mechanical change with the same shape; they share one commit-per-file discipline but one task gate (green build + gate test in Task 11).

**Files:**
- Modify: `src/features/teaching-assignment/infrastructure/repositories/teaching-assignment.repository.ts`, `src/features/teaching-assignment/domain/types/assignment.types.ts`
- Modify: `src/features/schedule-wizard/domain/curriculum-overview.ts`
- Modify: `src/features/subject/infrastructure/repositories/subject.repository.ts`
- Modify: `src/features/analytics/infrastructure/repositories/compliance.repository.ts`
- Modify: `src/app/dashboard/[academicYear]/[semester]/all-program/function/ExportAllProgram.ts`
- Tests: existing `__test__/.../curriculum-overview.test.ts` and any analytics/teaching-assignment tests; extend where the read shape is asserted.

**Interfaces:**
- Consumes: `programRepository.getEffectiveSubjects` / `getEffectiveSubjectsForValidation` (Task 4).

For **each** file, repeat:
- [ ] **Step A:** `get_symbols_overview` then `find_symbol` (include_body) the function reading `program_subject`. Identify whether it needs the validator shape, the display superset (for `source`/`overridden`), or just `{ SubjectCode, Category }`.
- [ ] **Step B:** Replace the raw read with the seam call via `replace_symbol_body`. Keep iteration logic identical — every field the old code read (`SubjectCode`, `Category`, `MinCredits`, `MaxCredits`, `IsMandatory`, `subject.*`) exists on `EffectiveSubject`.
- [ ] **Step C:** `pnpm typecheck` after each file; fix type drift immediately.
- [ ] **Step D:** Commit per file, e.g.:

```bash
git add src/features/schedule-wizard/domain/curriculum-overview.ts
git commit -m "refactor(schedule-wizard): read effective subjects via the seam"
```

- [ ] **Final step:** `pnpm test __test__/features/schedule-wizard __test__/features/analytics __test__/features/teaching-assignment && pnpm typecheck && pnpm lint`. Expected PASS.

> `ExportAllProgram.ts` builds the all-program export. Its rows must now include inherited CORE; verify the exported per-program subject count is unchanged for seeded programs (inherited + owned == old total). The e2e export spec (`e2e/...export...`) is the CI gate for this — do not run e2e locally.

---

## Task 9: Seed `grade_fundamental`, stop seeding CORE `program_subject`

After the seam + backfill exist, the seed must produce the same effective data via inheritance instead of duplicated CORE rows.

**Files:**
- Modify: `prisma/seed.ts` (the `PROGRAM_SUBJECTS` loop, lines 663-708; add a `grade_fundamental` seed block before it)
- Test: `__test__/features/program/seed-effective-parity.test.ts` (run against the freshly seeded test DB in CI)

- [ ] **Step 1:** Add a `grade_fundamental` seed block using `FUNDAMENTALS` (idempotent upsert on `Year_SubjectCode`), placed before the program-subject loop. Resolve `SubjectCode` against the already-seeded `subject` rows.
- [ ] **Step 2:** In the `PROGRAM_SUBJECTS` loop, **skip CORE codes** — only upsert rows whose subject category is `ADDITIONAL` or `ACTIVITY`. Concretely: `if (subj.category === "CORE") continue;` inside the inner loop (CORE now comes from inheritance). Leave ADDITIONAL/ACTIVITY untouched.
- [ ] **Step 3: Write the parity test** — for each seeded program, the effective set equals the pre-change seed's `program_subject` set. Encode the expected per-program effective counts (CORE from `FUNDAMENTALS[year]` + owned ADDITIONAL/ACTIVITY from `PROGRAM_SUBJECTS`).

```ts
// __test__/features/program/seed-effective-parity.test.ts
import { describe, it, expect } from "vitest";
import { programRepository } from "@/features/program/infrastructure/repositories/program.repository";
import { FUNDAMENTALS } from "@/prisma/data/fundamentals";
import prisma from "@/lib/prisma";

// Authoritative credit source — same map as seed.ts:665-666. The fresh-seed path
// creates NO overrides, so effective CORE credits come straight from FUNDAMENTALS.
// This test pins them to subject.Credit so a FUNDAMENTALS heuristic drift fails here.
const creditToNum = (c: string): number =>
  (({ CREDIT_05: 0.5, CREDIT_10: 1.0, CREDIT_15: 1.5, CREDIT_20: 2.0 } as Record<string, number>)[c] ?? 1.0);

describe("seed effective-subject parity", () => {
  it("every program's effective CORE equals its year's template (codes)", async () => {
    const programs = await prisma.program.findMany();
    for (const p of programs) {
      const eff = await programRepository.getEffectiveSubjects(p.ProgramID);
      const inheritedCore = eff
        .filter((e) => e.source === "INHERITED")
        .map((e) => e.SubjectCode)
        .sort();
      const expected = FUNDAMENTALS.filter((f) => f.Year === p.Year)
        .map((f) => f.SubjectCode)
        .sort();
      expect(inheritedCore).toEqual(expected);
    }
  });

  it("inherited CORE credits match subject.Credit (behavior-preserving guarantee)", async () => {
    const programs = await prisma.program.findMany();
    for (const p of programs) {
      const eff = await programRepository.getEffectiveSubjects(p.ProgramID);
      for (const row of eff.filter((e) => e.source === "INHERITED")) {
        // subject is joined onto the effective row; Credit is the catalog enum.
        expect(row.MinCredits, `${p.ProgramCode} ${row.SubjectCode}`).toBe(
          creditToNum(row.subject.Credit),
        );
        expect(row.MaxCredits).toBeNull();
      }
    }
  });
});
```

- [ ] **Step 4: Run** `pnpm typecheck && pnpm test __test__/features/program/seed-effective-parity.test.ts` (CI seeds the test DB). Expected PASS — both the code-set check **and** the credit-tuple check. The second test is the real behavior-preserving gate: it fails if `FUNDAMENTALS`'s credit heuristic ever diverges from the subject catalog.
- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts __test__/features/program/seed-effective-parity.test.ts
git commit -m "feat(db): seed grade_fundamental and stop duplicating CORE into program_subject"
```

---

## Task 10: UI — inherited vs owned sections + admin template editor

Additive UI on top of the now-stable seam. Two pieces: (a) the program-subject assignment screen splits into **Inherited fundamentals** (with exclude + override-credits controls writing `program_fundamental_override`) and **Owned subjects** (ADDITIONAL/ACTIVITY via `program_subject` as today); (b) a small admin screen to edit `grade_fundamental` per year.

**Files:**
- Modify: `src/features/program/presentation/hooks/useProgramSubjects.ts`, `useSubjectAssignment.ts` (consume `getEffectiveSubjects`; expose `source`/`overridden`)
- Modify/Create: program-subject assignment component(s) under `src/features/program/presentation/` (locate via `get_symbols_overview` on the hooks' consumers)
- Create: server actions for `program_fundamental_override` (exclude/override) and `grade_fundamental` (admin edit) under `src/features/program/application/actions/`
- Create: admin editor route/component for `grade_fundamental`
- Test: component/hook tests + an e2e spec (CI-run) covering exclude + credit-override round-trips

> **UI verification:** use the `browser_eval` / Playwright MCP tools, not curl (curl misses hydration/runtime JS errors — see CLAUDE.md). State explicitly in the PR if a UI path could not be verified in-browser.

- [ ] **Step 1:** Hooks — switch `useProgramSubjects`/`useSubjectAssignment` to read `getEffectiveSubjects`; surface `source` and `overridden` so the view can render the two sections and the "inherited" badge.
- [ ] **Step 2:** Assignment screen — render Inherited section (read-only subject identity; controls: *exclude* toggle → upsert `program_fundamental_override{Excluded:true}`; *override credits* → upsert override `MinCredits/MaxCredits`; clearing an override deletes the row) and Owned section (existing `program_subject` CRUD).
- [ ] **Step 3:** Override server action — write tests first (Vitest) for: exclude creates an Excluded override; un-exclude deletes it; credit override sets `MinCredits`; clearing reverts to template. Implement, then invalidate cache tags `["programs", program_${id}]`.
- [ ] **Step 4:** Admin `grade_fundamental` editor — per-year list with add/remove/edit-credits, writing `grade_fundamental`; show a warning that changes affect all programs of that grade; on save, invalidate `["fundamentals", fundamentals_y${year}]`.
- [ ] **Step 5:** e2e spec (CI) — exclude a fundamental on one program, assert it disappears from that program's effective list but remains on a sibling program of the same grade; override a credit and assert the new value; edit the template and assert it propagates to all non-overriding programs of the grade.
- [ ] **Step 6: Run** `pnpm typecheck && pnpm lint` locally; let CI run unit + e2e. Commit per coherent piece (hooks, assignment UI, override action, admin editor, e2e).

---

## Task 11: Stray-read gate (enforce the seam)

The spec names a missed reader the top risk. Make "no `program_subject` reads outside the seam" an automated, failing check.

**Files:**
- Create: `scripts/check-program-subject-reads.ts`
- Create: `__test__/architecture/no-stray-program-subject-reads.test.ts`
- Modify: `package.json` (add `"check:seam": "tsx scripts/check-program-subject-reads.ts"`)

**Allowed read sites (allowlist):** `src/features/program/infrastructure/repositories/program.repository.ts` (the seam), `prisma/seed.ts`, `prisma/seed-moe.ts`, `prisma/seed-2568.ts`, `prisma/seed-publish-happy.ts`, `prisma/quick-seed.ts`, `prisma/migration-backfill-fundamentals.ts`, `scripts/seed-*.ts`, anything under `__test__/`, `e2e/`, and `prisma/generated/`.

- [ ] **Step 1: Write the failing test**

```ts
// __test__/architecture/no-stray-program-subject-reads.test.ts
import { describe, it, expect } from "vitest";
import { findStrayProgramSubjectReads } from "@/scripts/check-program-subject-reads";

describe("seam enforcement", () => {
  it("finds no prisma.program_subject reads outside the allowlist", async () => {
    const offenders = await findStrayProgramSubjectReads();
    expect(offenders, `Stray program_subject reads:\n${offenders.join("\n")}`).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify it fails** — before the reroutes are complete it lists offenders; after Tasks 6-9 it should be empty. (If implementing the gate before finishing reroutes, expect FAIL listing the remaining files — that is the gate doing its job.)

Run: `pnpm test __test__/architecture/no-stray-program-subject-reads.test.ts`

- [ ] **Step 3: Implement the scanner** — glob `src/**/*.{ts,tsx}`, regex-match `prisma\.program_subject\.(findMany|findFirst|findUnique|count|aggregate|groupBy)` and `\.program_subject:` inside Prisma `include`/`select` blocks, exclude the allowlist, return `file:line` offenders.

```ts
// scripts/check-program-subject-reads.ts
import { glob } from "glob";
import { readFile } from "node:fs/promises";

const ALLOW = [
  "src/features/program/infrastructure/repositories/program.repository.ts",
];
const READ_RE = /prisma\.program_subject\.(findMany|findFirst|findUnique|count|aggregate|groupBy)|program_subject\s*:\s*\{/;

export async function findStrayProgramSubjectReads(): Promise<string[]> {
  const files = await glob("src/**/*.{ts,tsx}", { posix: true });
  const offenders: string[] = [];
  for (const f of files) {
    if (ALLOW.some((a) => f.endsWith(a))) continue;
    const lines = (await readFile(f, "utf8")).split("\n");
    lines.forEach((line, i) => {
      if (READ_RE.test(line)) offenders.push(`${f}:${i + 1}  ${line.trim()}`);
    });
  }
  return offenders;
}

if (process.argv[1]?.includes("check-program-subject-reads")) {
  findStrayProgramSubjectReads().then((o) => {
    if (o.length) {
      console.error("❌ Stray program_subject reads:\n" + o.join("\n"));
      process.exit(1);
    }
    console.log("✅ No stray program_subject reads.");
  });
}
```
Add to `package.json`: `"check:seam": "tsx scripts/check-program-subject-reads.ts",`

- [ ] **Step 4: Run to verify it passes** (after Tasks 6-9 land)

Run: `pnpm test __test__/architecture/no-stray-program-subject-reads.test.ts`
Expected: PASS (empty offenders).

- [ ] **Step 5: Commit**

```bash
git add scripts/check-program-subject-reads.ts __test__/architecture/no-stray-program-subject-reads.test.ts package.json
git commit -m "test(arch): gate against program_subject reads outside the inheritance seam"
```

---

## Execution order & integration notes

- **Build green at every task.** Tasks 1-4 add capability without touching consumers. Task 5 is data-only. Tasks 6-9 reroute + cut over the seed. Task 11's gate should be implemented after 6-9 so it lands green (or implemented early and used as a live checklist — it will fail-list remaining files until reroutes finish).
- **UI (Task 10) is last** — purely additive, no behavior change to the core.
- **Migration sequence in any environment:** apply the Prisma migration (Task 2) → run `pnpm db:backfill:fundamentals` (Task 5) → deploy seam/reroute code. The backfill is idempotent (upserts) and self-verifying.

## Self-review against the spec

| Spec section | Covered by |
|---|---|
| `grade_fundamental` model | Task 2 |
| `program_fundamental_override` model | Task 2 |
| `program_subject` semantics narrowed | Tasks 5, 9 (CORE removed from owned rows) |
| Composition function `getEffectiveProgramSubjects` | Task 1 |
| Repository seam + validator adapter | Task 4 |
| ~15 consumer reroutes (enumerated) | Tasks 6, 7, 8 (every named file listed) |
| Migration + behavior-preserving backfill | Task 5 |
| Verification step (pre/post equality) | Task 5 (`verify()`, gate) |
| Seed from editable config; seed-moe stops CORE rows | Tasks 3, 9 |
| UI inherited vs owned + admin editor | Task 10 |
| Validation on effective subjects | Tasks 6, 7 (adapter) |
| Caching via `cacheStrategy` | Task 4 |
| Risk: stray reader / lint-grep gate | Task 11 |
| Testing strategy (unit/migration/integration) | Tasks 1, 3, 4, 5, 6, 9 |

**Open item for the executor (flag, don't fabricate):** Task 3 enumerates ม.4–ม.6 CORE from `seed.ts` as 6 subjects each (no ศ/ง). `THAI_MOE_CURRICULUM_RULES.md §8.2` lists a richer senior core (adds history ส30101/ส30103, arts ศ31101, career ง31101, technology ว31171…). The plan deliberately matches **`seed.ts` (production data)** so the backfill stays behavior-preserving. If the school later wants the full §8.2 senior core, that is a `grade_fundamental` data edit (Task 10 admin editor), not a code change — and it will then add those subjects to every senior program by inheritance. Confirm this is the intended v1 stance before extending Task 3's senior rows.
