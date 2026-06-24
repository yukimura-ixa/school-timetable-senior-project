# MOE Activity-Pillar Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate that a program covers the grade-appropriate กิจกรรมพัฒนาผู้เรียน categories (as warnings), and add an `OTHER` catch-all `ActivityType`.

**Architecture:** Purely additive. Add `OTHER` to the `ActivityType` enum (Prisma + the hand-mirrored client enum). Add a grade-aware pure function `validateActivityCoverage` to the live `moe-validation.service.ts` and call it from `validateProgramMOECredits`, replacing the existing coarse "no activities" warning. No legacy files touched (cleanup deferred to `-bbn`).

**Tech Stack:** TypeScript, Prisma (Postgres), Valibot, Vitest, pnpm.

## Global Constraints

- Package manager: **pnpm only**.
- Severity: **warnings only** — never set `isValid = false` for activity coverage.
- Grade-aware required `ActivityType` sets (warn per missing):
  - Junior **M1–M3**: `GUIDANCE`, `SCOUT`, `CLUB`
  - Senior **M4–M6**: `GUIDANCE`, `CLUB`
  - `SCOUT` (senior), `SOCIAL_SERVICE`, `OTHER` are optional (satisfy no requirement).
- Beads issue: `school-timetable-senior-project-9vz`.
- CI is the test source of truth; single-file `vitest` runs are fine for TDD, CI is the final gate.
- `ActivityType` enum after this work: `CLUB | SCOUT | GUIDANCE | SOCIAL_SERVICE | OTHER`.

---

### Task 1: Add `OTHER` to the `ActivityType` enum

**Files:**
- Modify: `prisma/schema.prisma` (enum `ActivityType`, ~line 333-338)
- Modify: `src/features/program/domain/types/enums.ts:23-28` (mirrored client enum)
- Migration: generated under `prisma/migrations/`

**Interfaces:**
- Produces: `ActivityType.OTHER === "OTHER"`, available from both
  `@/prisma/generated/client` and `@/features/program/domain/types/enums`.

- [ ] **Step 1: Add `OTHER` to the Prisma enum**

In `prisma/schema.prisma`, change:

```prisma
enum ActivityType {
  CLUB
  SCOUT
  GUIDANCE
  SOCIAL_SERVICE
}
```

to:

```prisma
enum ActivityType {
  CLUB
  SCOUT
  GUIDANCE
  SOCIAL_SERVICE
  OTHER
}
```

- [ ] **Step 2: Add `OTHER` to the mirrored client enum**

In `src/features/program/domain/types/enums.ts`, change the `ActivityType` enum to:

```ts
export enum ActivityType {
  CLUB = "CLUB",
  SCOUT = "SCOUT",
  GUIDANCE = "GUIDANCE",
  SOCIAL_SERVICE = "SOCIAL_SERVICE",
  OTHER = "OTHER",
}
```

- [ ] **Step 3: Create the migration + regenerate the client**

Run: `pnpm db:migrate --name add_activity_type_other`
Expected: a new migration folder under `prisma/migrations/` containing
`ALTER TYPE "ActivityType" ADD VALUE 'OTHER';`, and the Prisma client regenerates.
(If `db:migrate` prompts for a name interactively, the `--name` flag supplies it.)

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck`
Expected: PASS. This proves no exhaustive `switch`/`Record<ActivityType, …>` elsewhere
is missing an `OTHER` branch. If it fails, add the missing `OTHER` case where flagged.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma src/features/program/domain/types/enums.ts prisma/migrations
git commit -m "feat(moe): add OTHER activity type (9vz)"
```

---

### Task 2: `validateActivityCoverage` pure function

**Files:**
- Modify: `src/features/program/domain/services/moe-validation.service.ts`
  - imports (line 10), and append new constants + function near the other exported functions.
- Test: `__test__/features/program/moe-validation.service.test.ts` (new `describe` block)

**Interfaces:**
- Consumes: `program_subject & { subject: subject }` (already the service's row shape), `ActivityType`.
- Produces:
  ```ts
  export function validateActivityCoverage(
    year: number,
    programSubjects: Array<program_subject & { subject: subject }>,
  ): { warnings: string[] }
  ```
  Junior (1–3) requires GUIDANCE+SCOUT+CLUB; senior (4–6) requires GUIDANCE+CLUB.
  Zero ACTIVITY subjects → single warning containing `กิจกรรมพัฒนาผู้เรียน` (early return).
  Otherwise one `ขาด<label> (<TYPE>)` warning per missing required type. Out-of-range year → `{ warnings: [] }`.

- [ ] **Step 1: Write the failing tests**

Append this block inside the top-level `describe("MOE Validation Service", () => { … })`, after the
`calculateLearningAreaCredits` describe:

```ts
  describe("validateActivityCoverage", () => {
    function mkActivity(
      type: ActivityType | null,
      id = Math.floor(Math.random() * 100000),
    ): program_subject & { subject: subject } {
      return {
        ProgramSubjectID: id,
        ProgramID: 1,
        SubjectCode: `ACT${id}`,
        Category: SubjectCategory.ACTIVITY,
        IsMandatory: true,
        MinCredits: 1,
        MaxCredits: 1,
        SortOrder: id,
        subject: {
          SubjectCode: `ACT${id}`,
          SubjectName: "กิจกรรม",
          Credit: "CREDIT_10",
          Category: SubjectCategory.ACTIVITY,
          LearningArea: null,
          ActivityType: type,
          IsGraded: false,
          Description: "",
        },
      };
    }

    it("junior with GUIDANCE+SCOUT+CLUB has no warnings", () => {
      const subjects = [
        mkActivity("GUIDANCE"),
        mkActivity("SCOUT"),
        mkActivity("CLUB"),
      ];
      expect(validateActivityCoverage(1, subjects).warnings).toHaveLength(0);
    });

    it("junior missing CLUB warns about CLUB", () => {
      const subjects = [mkActivity("GUIDANCE"), mkActivity("SCOUT")];
      const { warnings } = validateActivityCoverage(2, subjects);
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain("CLUB");
    });

    it("junior missing SCOUT warns about SCOUT", () => {
      const subjects = [mkActivity("GUIDANCE"), mkActivity("CLUB")];
      const { warnings } = validateActivityCoverage(3, subjects);
      expect(warnings.some((w) => w.includes("SCOUT"))).toBe(true);
    });

    it("senior with GUIDANCE+CLUB has no warnings (SCOUT/SOCIAL_SERVICE optional)", () => {
      const subjects = [mkActivity("GUIDANCE"), mkActivity("CLUB")];
      expect(validateActivityCoverage(4, subjects).warnings).toHaveLength(0);
    });

    it("senior with SCOUT only warns about GUIDANCE and CLUB", () => {
      const { warnings } = validateActivityCoverage(5, [mkActivity("SCOUT")]);
      expect(warnings.some((w) => w.includes("GUIDANCE"))).toBe(true);
      expect(warnings.some((w) => w.includes("CLUB"))).toBe(true);
    });

    it("OTHER-only program still warns the full required set", () => {
      const { warnings } = validateActivityCoverage(4, [mkActivity("OTHER")]);
      expect(warnings.some((w) => w.includes("GUIDANCE"))).toBe(true);
      expect(warnings.some((w) => w.includes("CLUB"))).toBe(true);
    });

    it("zero activity subjects → single generic warning", () => {
      const { warnings } = validateActivityCoverage(1, []);
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain("กิจกรรมพัฒนาผู้เรียน");
    });

    it("out-of-range year returns no warnings", () => {
      expect(validateActivityCoverage(7, []).warnings).toHaveLength(0);
    });
  });
```

Add `ActivityType` to the test's type imports (line 7):

```ts
import { SubjectCategory, LearningArea, ActivityType } from "@/prisma/generated/client";
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test __test__/features/program/moe-validation.service.test.ts -t "validateActivityCoverage"`
Expected: FAIL with `validateActivityCoverage is not a function` (not yet exported).

- [ ] **Step 3: Implement the function**

In `src/features/program/domain/services/moe-validation.service.ts`, change the imports on line 10 to add `ActivityType`:

```ts
import { LearningArea, SubjectCategory, ActivityType } from "@/prisma/generated/client";
```

Then append near the other exported functions (e.g., after `validateMandatorySubjects`):

```ts
const REQUIRED_ACTIVITY_TYPES: Record<"junior" | "senior", ActivityType[]> = {
  junior: ["GUIDANCE", "SCOUT", "CLUB"],
  senior: ["GUIDANCE", "CLUB"],
};

const ACTIVITY_TYPE_LABEL_TH: Record<ActivityType, string> = {
  GUIDANCE: "กิจกรรมแนะแนว",
  SCOUT: "กิจกรรมนักเรียน (ลูกเสือ/เนตรนารี/นศท.)",
  CLUB: "กิจกรรมชุมนุม",
  SOCIAL_SERVICE: "กิจกรรมเพื่อสังคมและสาธารณประโยชน์",
  OTHER: "กิจกรรมอื่น ๆ",
};

/**
 * Warn (never block) when a program lacks the grade-appropriate
 * กิจกรรมพัฒนาผู้เรียน categories. Junior (ม.1–3) must run ลูกเสือ + ชุมนุม + แนะแนว;
 * senior (ม.4–6) must run แนะแนว + ชุมนุม (uniformed/นศท. optional). SOCIAL_SERVICE
 * and OTHER are allowed but satisfy no requirement.
 */
export function validateActivityCoverage(
  year: number,
  programSubjects: Array<program_subject & { subject: subject }>,
): { warnings: string[] } {
  const isJunior = year >= 1 && year <= 3;
  const isSenior = year >= 4 && year <= 6;
  if (!isJunior && !isSenior) return { warnings: [] };

  const present = new Set(
    programSubjects
      .filter((ps) => ps.Category === SubjectCategory.ACTIVITY)
      .map((ps) => ps.subject.ActivityType)
      .filter((t): t is ActivityType => t != null),
  );

  if (present.size === 0) {
    return {
      warnings: ["ไม่พบกิจกรรมพัฒนาผู้เรียน (ชุมนุม, แนะแนว, ลูกเสือ)"],
    };
  }

  const required = isJunior
    ? REQUIRED_ACTIVITY_TYPES.junior
    : REQUIRED_ACTIVITY_TYPES.senior;

  const warnings = required
    .filter((t) => !present.has(t))
    .map((t) => `ขาด${ACTIVITY_TYPE_LABEL_TH[t]} (${t})`);

  return { warnings };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test __test__/features/program/moe-validation.service.test.ts -t "validateActivityCoverage"`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/program/domain/services/moe-validation.service.ts __test__/features/program/moe-validation.service.test.ts
git commit -m "feat(moe): grade-aware validateActivityCoverage (9vz)"
```

---

### Task 3: Wire coverage into `validateProgramMOECredits` + fix the affected existing test

**Files:**
- Modify: `src/features/program/domain/services/moe-validation.service.ts` (the activity block inside `validateProgramMOECredits`)
- Modify: `__test__/features/program/moe-validation.service.test.ts` (the "compliant junior program" mock)

**Interfaces:**
- Consumes: `validateActivityCoverage` (Task 2).

- [ ] **Step 1: Update the existing "compliant junior program" test first**

That test currently has only one activity (`ACT01` = CLUB) and asserts `warnings` is empty.
Under the junior rule it would now warn (missing GUIDANCE + SCOUT). Add the two missing
activity subjects so the program is genuinely compliant. Immediately after the `ACT01` object
(the one with `SubjectName: "ชุมนุม"`, ends at `SortOrder: 9` / `ActivityType: "CLUB"`), insert:

```ts
          {
            ProgramSubjectID: 10,
            ProgramID: 1,
            SubjectCode: "ACT02",
            Category: SubjectCategory.ACTIVITY,
            IsMandatory: true,
            MinCredits: 1,
            MaxCredits: 1,
            SortOrder: 10,
            subject: {
              SubjectCode: "ACT02",
              SubjectName: "แนะแนว",
              Credit: "CREDIT_10",
              Category: SubjectCategory.ACTIVITY,
              LearningArea: null,
              ActivityType: "GUIDANCE",
              IsGraded: false,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 11,
            ProgramID: 1,
            SubjectCode: "ACT03",
            Category: SubjectCategory.ACTIVITY,
            IsMandatory: true,
            MinCredits: 1,
            MaxCredits: 1,
            SortOrder: 11,
            subject: {
              SubjectCode: "ACT03",
              SubjectName: "ลูกเสือ",
              Credit: "CREDIT_10",
              Category: SubjectCategory.ACTIVITY,
              LearningArea: null,
              ActivityType: "SCOUT",
              IsGraded: false,
              Description: "",
            },
          },
```

(The `totalCredits` assertion of 28 is unchanged — activities are excluded from credit totals.)

- [ ] **Step 2: Run the affected test to verify it now fails against the OLD code**

Run: `pnpm test __test__/features/program/moe-validation.service.test.ts -t "compliant junior program"`
Expected: still PASS here (current code emits no per-category warnings). This step just confirms the
mock edit didn't break credits. Proceed to wire the validator.

- [ ] **Step 3: Replace the coarse activity warning in `validateProgramMOECredits`**

In `src/features/program/domain/services/moe-validation.service.ts`, find this block inside
`validateProgramMOECredits`:

```ts
  // Check for activities
  const hasActivities = programSubjects.some(
    (ps) => ps.Category === SubjectCategory.ACTIVITY,
  );
  if (!hasActivities) {
    warnings.push("ไม่พบกิจกรรมพัฒนาผู้เรียน (ชุมนุม, แนะแนว, ลูกเสือ)");
  }
```

Replace it with:

```ts
  // Check activity-pillar coverage (กิจกรรมพัฒนาผู้เรียน), grade-aware (warnings only)
  warnings.push(...validateActivityCoverage(year, programSubjects).warnings);
```

- [ ] **Step 4: Run the full service test file**

Run: `pnpm test __test__/features/program/moe-validation.service.test.ts`
Expected: PASS (all existing tests + the Task 2 block). In particular:
- "compliant junior program" → 0 warnings (now has GUIDANCE+SCOUT+CLUB).
- "should warn if activities are missing" → still warns, message contains `กิจกรรมพัฒนาผู้เรียน`.

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/program/domain/services/moe-validation.service.ts __test__/features/program/moe-validation.service.test.ts
git commit -m "feat(moe): enforce grade activity coverage in program validation (9vz)"
```

---

## Self-Review

**Spec coverage:**
- Spec §A (`OTHER` enum, both places, migration, typecheck) → Task 1. ✓
- Spec §B (`validateActivityCoverage`, grade-aware required sets, reads `ps.subject.ActivityType`, replaces coarse warning, warnings only) → Tasks 2 + 3. ✓
- Spec §C (cleanup) → deferred to `-bbn`; no tasks here by design. ✓
- Spec §D (tests: junior no-warning, junior missing CLUB/SCOUT, senior no-warning, senior SCOUT-only, OTHER-only, zero-activities) → Task 2 Step 1. ✓

**Placeholder scan:** none — every code step shows full code; every run step shows command + expected.

**Type consistency:** `validateActivityCoverage(year: number, programSubjects: Array<program_subject & { subject: subject }>)` used identically in Tasks 2 and 3. `ActivityType` values (`GUIDANCE`/`SCOUT`/`CLUB`/`SOCIAL_SERVICE`/`OTHER`) consistent with Task 1's enum. `Record<ActivityType, string>` label map forces the `OTHER` key (compile-time guard).
