# Grade Coverage Matrix — Assignment UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the siloed by-grade assignment view with a class×subject coverage matrix that shows gaps at a glance, supports bulk teacher assignment, and offers editable carry-over from the previous semester.

**Architecture:** Three pure-logic utils (semester-code mapping, coverage calc, matrix→diff grouping) are built and tested first. Three server actions aggregate/save grade-level data, reusing the existing `assignRepository`, `subjectRepository`, and the RespID-preserving `computeResponsibilitiesDiff`. UI components render the matrix and wire into the existing `TeacherAssignmentPage` `by-grade` mode; `by-teacher` is demoted to a read-only workload lens.

**Tech Stack:** Next.js 16 (App Router, server actions via `createAction`), Prisma 7, valibot schemas, MUI, SWR, Vitest + Testing Library.

## Global Constraints

- Package manager: **pnpm only**. Run a single test file with `pnpm exec vitest run <path>`.
- Serena tools are primary for code reads/edits (see `CLAUDE.md`).
- MOE subject codes match `^[ก-ฮ][1-3]\d{4}$`; ปวช (`20001-1005`, `219101-xxxx`) and `ACT-*` codes do NOT.
- Assignments are **per-semester**; never collapse the `Semester` dimension.
- Saves MUST preserve `RespID` for existing rows (see bd `70t`) — reuse `computeResponsibilitiesDiff`, never re-create existing assignments.
- TDD: failing test first, watch it fail, minimal impl, watch pass, commit. Do not run the full suite locally; run only the touched test file(s).
- Commit trailers (verbatim):
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FAk7DfkGKDcUKHkc5tUPT3
  ```

## File Structure

**Create**
- `src/features/teaching-assignment/domain/utils/semester-code-map.ts` — `mapSemesterCode(code)`.
- `src/features/teaching-assignment/domain/utils/semester-code-map.test.ts`
- `src/features/teaching-assignment/domain/utils/coverage.ts` — `computeCoverage(sections)`.
- `src/features/teaching-assignment/domain/utils/coverage.test.ts`
- `src/features/teaching-assignment/domain/utils/matrix-diff.ts` — `groupMatrixDiffByTeacher(...)`.
- `src/features/teaching-assignment/domain/utils/matrix-diff.test.ts`
- `src/features/teaching-assignment/domain/utils/carry-over.ts` — `computeCarryOver(prev, sectionSubjects)`.
- `src/features/teaching-assignment/domain/utils/carry-over.test.ts`
- `src/features/teaching-assignment/presentation/components/GradeCoverageMatrix.tsx`
- `src/features/teaching-assignment/presentation/components/GradeCoverageMatrix.test.tsx`
- `src/features/teaching-assignment/presentation/components/TeacherBrush.tsx`
- `src/features/teaching-assignment/presentation/components/CarryOverDialog.tsx`
- `src/features/teaching-assignment/presentation/components/CoverageHeader.tsx`
- `src/features/teaching-assignment/presentation/components/grade-matrix.logic.ts` — cell-state helpers + `MatrixCell` types.
- `src/features/teaching-assignment/presentation/components/grade-matrix.logic.test.ts`

**Modify**
- `src/features/teaching-assignment/application/actions/teaching-assignment.actions.ts` — add `getGradeMatrixAction`, `previewCarryOverAction`, `syncGradeMatrixAction`.
- `src/features/teaching-assignment/application/schemas/teaching-assignment.schemas.ts` — add their input schemas.
- `src/features/teaching-assignment/presentation/components/TeacherAssignmentPage.tsx` — render `GradeCoverageMatrix` in `by-grade` mode; demote `by-teacher` to a read-only lens.

**Reuse (do not modify)**
- `assignRepository.findByTeacherAndTerm`, `.create`, `.deleteById` (`src/features/assign/infrastructure/repositories/assign.repository.ts`)
- `subjectRepository.findByGrade(gradeId): Promise<subject[]>` (`src/features/subject/infrastructure/repositories/subject.repository.ts`)
- `getGradeLevelsAction` → `gradelevel[]` `{ GradeID, Year, Number, StudentCount, ProgramID }`
- `computeResponsibilitiesDiff(existing, incoming)` and `calculateTeachHour(credit)` (`src/features/assign/domain/services/assign-validation.service.ts`)
- `createAction(schema, fn)` wrapper; valibot `v`.

---

### Task 1: `mapSemesterCode` — S1→S2 code mapping

**Files:**
- Create: `src/features/teaching-assignment/domain/utils/semester-code-map.ts`
- Test: `src/features/teaching-assignment/domain/utils/semester-code-map.test.ts`

**Interfaces:**
- Produces: `mapSemesterCode(code: string): string | null` — returns the semester-2 counterpart of a semester-1 MOE code by flipping the trailing `1`→`2`; returns `null` when the code is not a mappable S1 MOE code (ปวช, `ACT-*`, `ว30xxx` electives, or codes not ending in `1`).

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import { mapSemesterCode } from "./semester-code-map";

describe("mapSemesterCode", () => {
  it("flips the trailing semester digit 1 -> 2 for MOE codes", () => {
    expect(mapSemesterCode("ค21101")).toBe("ค21102");
    expect(mapSemesterCode("ท31101")).toBe("ท31102");
  });

  it("returns null for codes that do not end in 1", () => {
    expect(mapSemesterCode("ว30294")).toBeNull();
    expect(mapSemesterCode("ค21102")).toBeNull();
  });

  it("returns null for non-MOE codes (ปวช, activities)", () => {
    expect(mapSemesterCode("219101-2001")).toBeNull();
    expect(mapSemesterCode("ACT-GUIDE")).toBeNull();
    expect(mapSemesterCode("20001-1005")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/features/teaching-assignment/domain/utils/semester-code-map.test.ts`
Expected: FAIL — "mapSemesterCode is not a function".

- [ ] **Step 3: Write minimal implementation**

```typescript
// Semester-1 MOE course code: [learning area][level][year][running 2 digits][semester digit].
// Only true MOE codes (^[ก-ฮ][1-3]\d{4}$) ending in the semester digit 1 have a clean
// semester-2 counterpart (…1 -> …2). ปวช, ACT-*, and ว30xxx electives do not.
const S1_MOE_CODE = /^[ก-ฮ][1-3]\d{3}1$/;

export function mapSemesterCode(code: string): string | null {
  if (!S1_MOE_CODE.test(code)) return null;
  return code.slice(0, -1) + "2";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/features/teaching-assignment/domain/utils/semester-code-map.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/teaching-assignment/domain/utils/semester-code-map.ts src/features/teaching-assignment/domain/utils/semester-code-map.test.ts
git commit -m "feat(assign): semester-1->2 MOE code mapping util"
```

---

### Task 2: `computeCarryOver` — suggestions + exceptions

**Files:**
- Create: `src/features/teaching-assignment/domain/utils/carry-over.ts`
- Test: `src/features/teaching-assignment/domain/utils/carry-over.test.ts`

**Interfaces:**
- Consumes: `mapSemesterCode` (Task 1).
- Produces:
  ```typescript
  export interface PrevAssignment { GradeID: string; SubjectCode: string; TeacherID: number; }
  export interface CarryOverSuggestion { GradeID: string; SubjectCode: string; TeacherID: number; }
  export interface CarryOverException { GradeID: string; SubjectCode: string; TeacherID: number; reason: "no-mapping" | "not-in-program"; }
  export function computeCarryOver(
    prev: PrevAssignment[],
    sectionSubjects: Record<string, string[]>, // GradeID -> S2 subject codes valid for that section
  ): { mapped: CarryOverSuggestion[]; exceptions: CarryOverException[] }
  ```
  A prev assignment maps when `mapSemesterCode` yields a code AND that code is in the section's S2 subject list; otherwise it is an exception with the matching reason.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import { computeCarryOver } from "./carry-over";

describe("computeCarryOver", () => {
  const sectionSubjects = {
    "M1-1": ["ค21102", "ท21102"], // S2 codes available for this section
  };

  it("maps a core subject to its S2 code, keeping the teacher as a suggestion", () => {
    const { mapped, exceptions } = computeCarryOver(
      [{ GradeID: "M1-1", SubjectCode: "ค21101", TeacherID: 4 }],
      sectionSubjects,
    );
    expect(mapped).toEqual([{ GradeID: "M1-1", SubjectCode: "ค21102", TeacherID: 4 }]);
    expect(exceptions).toHaveLength(0);
  });

  it("flags an exception when the code has no S2 mapping", () => {
    const { mapped, exceptions } = computeCarryOver(
      [{ GradeID: "M1-1", SubjectCode: "ว30294", TeacherID: 7 }],
      sectionSubjects,
    );
    expect(mapped).toHaveLength(0);
    expect(exceptions).toEqual([
      { GradeID: "M1-1", SubjectCode: "ว30294", TeacherID: 7, reason: "no-mapping" },
    ]);
  });

  it("flags an exception when the mapped code is not in the section's program", () => {
    const { mapped, exceptions } = computeCarryOver(
      [{ GradeID: "M1-1", SubjectCode: "พ21101", TeacherID: 14 }], // maps to พ21102, absent
      sectionSubjects,
    );
    expect(mapped).toHaveLength(0);
    expect(exceptions[0]).toMatchObject({ SubjectCode: "พ21101", reason: "not-in-program" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/features/teaching-assignment/domain/utils/carry-over.test.ts`
Expected: FAIL — "computeCarryOver is not a function".

- [ ] **Step 3: Write minimal implementation**

```typescript
import { mapSemesterCode } from "./semester-code-map";

export interface PrevAssignment { GradeID: string; SubjectCode: string; TeacherID: number; }
export interface CarryOverSuggestion { GradeID: string; SubjectCode: string; TeacherID: number; }
export interface CarryOverException extends CarryOverSuggestion { reason: "no-mapping" | "not-in-program"; }

export function computeCarryOver(
  prev: PrevAssignment[],
  sectionSubjects: Record<string, string[]>,
): { mapped: CarryOverSuggestion[]; exceptions: CarryOverException[] } {
  const mapped: CarryOverSuggestion[] = [];
  const exceptions: CarryOverException[] = [];

  for (const p of prev) {
    const target = mapSemesterCode(p.SubjectCode);
    if (target === null) {
      exceptions.push({ ...p, reason: "no-mapping" });
      continue;
    }
    if (!(sectionSubjects[p.GradeID] ?? []).includes(target)) {
      exceptions.push({ ...p, reason: "not-in-program" });
      continue;
    }
    mapped.push({ GradeID: p.GradeID, SubjectCode: target, TeacherID: p.TeacherID });
  }
  return { mapped, exceptions };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/features/teaching-assignment/domain/utils/carry-over.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/teaching-assignment/domain/utils/carry-over.ts src/features/teaching-assignment/domain/utils/carry-over.test.ts
git commit -m "feat(assign): carry-over mapping (suggestions + exceptions)"
```

---

### Task 3: `computeCoverage` — filled/required ratio

**Files:**
- Create: `src/features/teaching-assignment/domain/utils/coverage.ts`
- Test: `src/features/teaching-assignment/domain/utils/coverage.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface CoverageSection { requiredCodes: string[]; assignedCodes: string[]; }
  export function computeCoverage(sections: CoverageSection[]): { filled: number; required: number };
  ```
  `required` = total required subject slots across sections; `filled` = required slots that have an assignment. Assigned codes outside `requiredCodes` are ignored (greyed `—` cells never count).

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import { computeCoverage } from "./coverage";

describe("computeCoverage", () => {
  it("counts only required slots that are assigned", () => {
    const result = computeCoverage([
      { requiredCodes: ["ค21101", "ท21101"], assignedCodes: ["ค21101"] },
      { requiredCodes: ["ค21101"], assignedCodes: ["ค21101"] },
    ]);
    expect(result).toEqual({ filled: 2, required: 3 });
  });

  it("ignores assignments outside the section's required list", () => {
    const result = computeCoverage([
      { requiredCodes: ["ค21101"], assignedCodes: ["ค21101", "ว30294"] },
    ]);
    expect(result).toEqual({ filled: 1, required: 1 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/features/teaching-assignment/domain/utils/coverage.test.ts`
Expected: FAIL — "computeCoverage is not a function".

- [ ] **Step 3: Write minimal implementation**

```typescript
export interface CoverageSection { requiredCodes: string[]; assignedCodes: string[]; }

export function computeCoverage(
  sections: CoverageSection[],
): { filled: number; required: number } {
  let filled = 0;
  let required = 0;
  for (const s of sections) {
    const assigned = new Set(s.assignedCodes);
    required += s.requiredCodes.length;
    filled += s.requiredCodes.filter((c) => assigned.has(c)).length;
  }
  return { filled, required };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/features/teaching-assignment/domain/utils/coverage.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/teaching-assignment/domain/utils/coverage.ts src/features/teaching-assignment/domain/utils/coverage.test.ts
git commit -m "feat(assign): grade coverage ratio util"
```

---

### Task 4: `groupMatrixDiffByTeacher` — matrix → per-teacher create/delete

**Files:**
- Create: `src/features/teaching-assignment/domain/utils/matrix-diff.ts`
- Test: `src/features/teaching-assignment/domain/utils/matrix-diff.test.ts`

**Interfaces:**
- Consumes: `computeResponsibilitiesDiff` from `@/features/assign/domain/services/assign-validation.service`.
- Produces:
  ```typescript
  export interface MatrixAssignment { RespID?: number; TeacherID: number; GradeID: string; SubjectCode: string; Credit: string; }
  export interface TeacherDiff { TeacherID: number; toCreate: { GradeID: string; SubjectCode: string; Credit: string }[]; toDeleteRespIds: number[]; }
  export function groupMatrixDiffByTeacher(existing: MatrixAssignment[], desired: MatrixAssignment[]): TeacherDiff[];
  ```
  For every teacher appearing in `existing` or `desired`, run the RespID-based diff: desired cells without `RespID` are creates; existing rows whose `RespID` is absent from desired are deletes. This is what `syncGradeMatrixAction` persists.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import { groupMatrixDiffByTeacher } from "./matrix-diff";

describe("groupMatrixDiffByTeacher", () => {
  it("keeps unchanged existing cells (RespID echoed) and creates only new ones", () => {
    const existing = [
      { RespID: 5, TeacherID: 4, GradeID: "M1-1", SubjectCode: "ค21101", Credit: "1.0" },
    ];
    const desired = [
      { RespID: 5, TeacherID: 4, GradeID: "M1-1", SubjectCode: "ค21101", Credit: "1.0" },
      { TeacherID: 4, GradeID: "M1-2", SubjectCode: "ค21101", Credit: "1.0" },
    ];
    const diffs = groupMatrixDiffByTeacher(existing, desired);
    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toMatchObject({ TeacherID: 4, toDeleteRespIds: [] });
    expect(diffs[0]!.toCreate).toEqual([{ GradeID: "M1-2", SubjectCode: "ค21101", Credit: "1.0" }]);
  });

  it("deletes an existing cell removed from desired", () => {
    const existing = [
      { RespID: 9, TeacherID: 7, GradeID: "M1-1", SubjectCode: "ว21101", Credit: "1.5" },
    ];
    const diffs = groupMatrixDiffByTeacher(existing, []);
    expect(diffs[0]).toMatchObject({ TeacherID: 7, toCreate: [], toDeleteRespIds: [9] });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/features/teaching-assignment/domain/utils/matrix-diff.test.ts`
Expected: FAIL — "groupMatrixDiffByTeacher is not a function".

- [ ] **Step 3: Write minimal implementation**

```typescript
import { computeResponsibilitiesDiff } from "@/features/assign/domain/services/assign-validation.service";
import type { teachers_responsibility } from "@/prisma/generated/client";

export interface MatrixAssignment {
  RespID?: number;
  TeacherID: number;
  GradeID: string;
  SubjectCode: string;
  Credit: string;
}
export interface TeacherDiff {
  TeacherID: number;
  toCreate: { GradeID: string; SubjectCode: string; Credit: string }[];
  toDeleteRespIds: number[];
}

export function groupMatrixDiffByTeacher(
  existing: MatrixAssignment[],
  desired: MatrixAssignment[],
): TeacherDiff[] {
  const teacherIds = new Set<number>();
  for (const a of existing) teacherIds.add(a.TeacherID);
  for (const a of desired) teacherIds.add(a.TeacherID);

  const diffs: TeacherDiff[] = [];
  for (const TeacherID of teacherIds) {
    const ex = existing.filter((a) => a.TeacherID === TeacherID);
    const incoming = desired
      .filter((a) => a.TeacherID === TeacherID)
      .map((a) => ({
        ...(a.RespID !== undefined ? { RespID: a.RespID } : {}),
        GradeID: a.GradeID,
        SubjectCode: a.SubjectCode,
        Credit: a.Credit,
      }));
    const { toCreate, toDelete } = computeResponsibilitiesDiff(
      ex as unknown as teachers_responsibility[],
      incoming,
    );
    diffs.push({
      TeacherID,
      toCreate: toCreate.map((c) => ({ GradeID: c.GradeID, SubjectCode: c.SubjectCode, Credit: String(c.Credit) })),
      toDeleteRespIds: toDelete.map((d) => d.RespID),
    });
  }
  return diffs;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/features/teaching-assignment/domain/utils/matrix-diff.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/teaching-assignment/domain/utils/matrix-diff.ts src/features/teaching-assignment/domain/utils/matrix-diff.test.ts
git commit -m "feat(assign): matrix->per-teacher diff grouping"
```

---

### Task 5: `getGradeMatrixAction` — aggregate matrix data

**Files:**
- Modify: `src/features/teaching-assignment/application/schemas/teaching-assignment.schemas.ts`
- Modify: `src/features/teaching-assignment/application/actions/teaching-assignment.actions.ts`
- Test: `src/features/teaching-assignment/application/actions/grade-matrix.actions.test.ts`

**Interfaces:**
- Consumes: `getGradeLevelsAction`-equivalent repo (`gradeLevelRepository.findAll`), `subjectRepository.findByGrade`, `assignRepository.findByTeacherAndTerm` — or, for fewer round-trips, `assignRepository` term query filtered to the grade's sections.
- Produces:
  ```typescript
  // input: { gradeYear: number; academicYear: number; semester: "SEMESTER_1" | "SEMESTER_2" }
  // output: {
  //   sections: { GradeID: string; number: number; programId: number | null; subjectCodes: string[] }[];
  //   subjects: { SubjectCode: string; SubjectName: string; Credit: string; LearningArea: string | null }[]; // union, deduped
  //   assignments: { RespID: number; TeacherID: number; GradeID: string; SubjectCode: string; Credit: string }[];
  // }
  ```

- [ ] **Step 1: Add the input schema**

In `teaching-assignment.schemas.ts`:

```typescript
export const gradeMatrixSchema = v.object({
  gradeYear: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(6)),
  academicYear: v.pipe(v.number(), v.integer()),
  semester: v.picklist(["SEMESTER_1", "SEMESTER_2"]),
});
export type GradeMatrixInput = v.InferOutput<typeof gradeMatrixSchema>;
```

- [ ] **Step 2: Write the failing test (integration against repositories, mocked)**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/features/gradelevel/infrastructure/repositories/gradelevel.repository", () => ({
  gradeLevelRepository: { findAll: vi.fn() },
}));
vi.mock("@/features/subject/infrastructure/repositories/subject.repository", () => ({
  subjectRepository: { findByGrade: vi.fn() },
}));
vi.mock("@/features/assign/infrastructure/repositories/assign.repository", () => ({
  assignRepository: { findByTeacherAndTerm: vi.fn(), create: vi.fn(), deleteById: vi.fn() },
}));

import { getGradeMatrixAction } from "./teaching-assignment.actions";
import { gradeLevelRepository } from "@/features/gradelevel/infrastructure/repositories/gradelevel.repository";
import { subjectRepository } from "@/features/subject/infrastructure/repositories/subject.repository";

describe("getGradeMatrixAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns sections (filtered to the grade year) with their subject codes and the deduped union", async () => {
    (gradeLevelRepository.findAll as any).mockResolvedValue([
      { GradeID: "M1-1", Year: 1, Number: 1, ProgramID: 10 },
      { GradeID: "M1-2", Year: 1, Number: 2, ProgramID: 10 },
      { GradeID: "M2-1", Year: 2, Number: 1, ProgramID: 20 },
    ]);
    (subjectRepository.findByGrade as any).mockResolvedValue([
      { SubjectCode: "ค21101", SubjectName: "คณิต", Credit: "CREDIT_10", LearningArea: "MATH" },
    ]);

    const res = await getGradeMatrixAction({ gradeYear: 1, academicYear: 2568, semester: "SEMESTER_1" });
    expect(res.success).toBe(true);
    expect(res.data!.sections.map((s) => s.GradeID)).toEqual(["M1-1", "M1-2"]);
    expect(res.data!.subjects).toEqual([
      { SubjectCode: "ค21101", SubjectName: "คณิต", Credit: "CREDIT_10", LearningArea: "MATH" },
    ]);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm exec vitest run src/features/teaching-assignment/application/actions/grade-matrix.actions.test.ts`
Expected: FAIL — `getGradeMatrixAction` is not exported.

- [ ] **Step 4: Implement the action**

In `teaching-assignment.actions.ts` (follow the existing `createAction` pattern; reuse the imported repositories). Implementation:

```typescript
export const getGradeMatrixAction = createAction(
  gradeMatrixSchema,
  async (input: GradeMatrixInput) => {
    const sem = semester[input.semester];
    const grades = (await gradeLevelRepository.findAll()).filter(
      (g) => g.Year === input.gradeYear,
    );

    const sections = await Promise.all(
      grades.map(async (g) => {
        const subjects = await subjectRepository.findByGrade(g.GradeID);
        return {
          GradeID: g.GradeID,
          number: g.Number,
          programId: g.ProgramID,
          subjectCodes: subjects.map((s) => s.SubjectCode),
          _subjects: subjects,
        };
      }),
    );

    // Deduped union of subjects across sections (order: first-seen).
    const seen = new Set<string>();
    const subjects: { SubjectCode: string; SubjectName: string; Credit: string; LearningArea: string | null }[] = [];
    for (const sec of sections) {
      for (const s of sec._subjects) {
        if (seen.has(s.SubjectCode)) continue;
        seen.add(s.SubjectCode);
        subjects.push({
          SubjectCode: s.SubjectCode,
          SubjectName: s.SubjectName,
          Credit: String(s.Credit),
          LearningArea: s.LearningArea ?? null,
        });
      }
    }

    // Existing assignments for these sections in the term.
    const assignments: { RespID: number; TeacherID: number; GradeID: string; SubjectCode: string; Credit: string }[] = [];
    const termResps = await assignRepository.findByTermGrades(
      grades.map((g) => g.GradeID),
      input.academicYear,
      sem,
    );
    for (const r of termResps) {
      assignments.push({
        RespID: r.RespID,
        TeacherID: r.TeacherID,
        GradeID: r.GradeID,
        SubjectCode: r.SubjectCode,
        Credit: String(r.subject.Credit),
      });
    }

    return {
      sections: sections.map(({ _subjects, ...rest }) => rest),
      subjects,
      assignments,
    };
  },
);
```

If `assignRepository.findByTermGrades` does not exist, add it next to `findByTeacherAndTerm` in `assign.repository.ts`:

```typescript
async findByTermGrades(gradeIds: string[], academicYear: number, sem: semester) {
  return prisma.teachers_responsibility.findMany({
    where: { GradeID: { in: gradeIds }, AcademicYear: academicYear, Semester: sem },
    include: { subject: true },
  });
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run src/features/teaching-assignment/application/actions/grade-matrix.actions.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/teaching-assignment/application/schemas/teaching-assignment.schemas.ts src/features/teaching-assignment/application/actions/teaching-assignment.actions.ts src/features/assign/infrastructure/repositories/assign.repository.ts src/features/teaching-assignment/application/actions/grade-matrix.actions.test.ts
git commit -m "feat(assign): getGradeMatrixAction aggregates grade-level matrix data"
```

---

### Task 6: `previewCarryOverAction` — read-only suggestions

**Files:**
- Modify: `teaching-assignment.schemas.ts`, `teaching-assignment.actions.ts`
- Test: `src/features/teaching-assignment/application/actions/preview-carry-over.test.ts`

**Interfaces:**
- Consumes: `computeCarryOver` (Task 2), `mapSemesterCode` (Task 1), `assignRepository.findByTermGrades` (Task 5), `subjectRepository.findByGrade`.
- Produces:
  ```typescript
  // input: { gradeYear, academicYear, semester }  (the TARGET term)
  // output: { mapped: { GradeID; SubjectCode; TeacherID }[]; exceptions: { GradeID; SubjectCode; TeacherID; reason }[] }
  ```
  Previous term = (SEMESTER_1 → SEMESTER_2 of prevYear) / (SEMESTER_2 → SEMESTER_1 of same year), mirroring `handleCopyFromPrevious` in `TeacherAssignmentPage.tsx`.

- [ ] **Step 1: Add schema** (reuse `gradeMatrixSchema` shape):

```typescript
export const previewCarryOverSchema = gradeMatrixSchema;
export type PreviewCarryOverInput = GradeMatrixInput;
```

- [ ] **Step 2: Write the failing test**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("@/features/subject/infrastructure/repositories/subject.repository", () => ({
  subjectRepository: { findByGrade: vi.fn() },
}));
vi.mock("@/features/gradelevel/infrastructure/repositories/gradelevel.repository", () => ({
  gradeLevelRepository: { findAll: vi.fn() },
}));
vi.mock("@/features/assign/infrastructure/repositories/assign.repository", () => ({
  assignRepository: { findByTermGrades: vi.fn(), create: vi.fn(), deleteById: vi.fn() },
}));
import { previewCarryOverAction } from "./teaching-assignment.actions";
import { gradeLevelRepository } from "@/features/gradelevel/infrastructure/repositories/gradelevel.repository";
import { subjectRepository } from "@/features/subject/infrastructure/repositories/subject.repository";
import { assignRepository } from "@/features/assign/infrastructure/repositories/assign.repository";

describe("previewCarryOverAction", () => {
  beforeEach(() => vi.clearAllMocks());
  it("maps prev-term S1 assignments into S2 suggestions", async () => {
    (gradeLevelRepository.findAll as any).mockResolvedValue([{ GradeID: "M1-1", Year: 1, Number: 1, ProgramID: 10 }]);
    (subjectRepository.findByGrade as any).mockResolvedValue([{ SubjectCode: "ค21102" }]);
    (assignRepository.findByTermGrades as any).mockResolvedValue([
      { GradeID: "M1-1", SubjectCode: "ค21101", TeacherID: 4, subject: { Credit: "CREDIT_10" } },
    ]);
    const res = await previewCarryOverAction({ gradeYear: 1, academicYear: 2568, semester: "SEMESTER_2" });
    expect(res.data!.mapped).toEqual([{ GradeID: "M1-1", SubjectCode: "ค21102", TeacherID: 4 }]);
    expect(res.data!.exceptions).toHaveLength(0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm exec vitest run src/features/teaching-assignment/application/actions/preview-carry-over.test.ts`
Expected: FAIL — not exported.

- [ ] **Step 4: Implement**

```typescript
export const previewCarryOverAction = createAction(
  previewCarryOverSchema,
  async (input: PreviewCarryOverInput) => {
    const prevSemester = input.semester === "SEMESTER_1" ? "SEMESTER_2" : "SEMESTER_1";
    const prevYear = input.semester === "SEMESTER_1" ? input.academicYear - 1 : input.academicYear;

    const grades = (await gradeLevelRepository.findAll()).filter((g) => g.Year === input.gradeYear);
    const sectionSubjects: Record<string, string[]> = {};
    await Promise.all(
      grades.map(async (g) => {
        const subjects = await subjectRepository.findByGrade(g.GradeID);
        sectionSubjects[g.GradeID] = subjects.map((s) => s.SubjectCode);
      }),
    );

    const prev = await assignRepository.findByTermGrades(
      grades.map((g) => g.GradeID),
      prevYear,
      semester[prevSemester],
    );
    return computeCarryOver(
      prev.map((r) => ({ GradeID: r.GradeID, SubjectCode: r.SubjectCode, TeacherID: r.TeacherID })),
      sectionSubjects,
    );
  },
);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run src/features/teaching-assignment/application/actions/preview-carry-over.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/teaching-assignment/application/schemas/teaching-assignment.schemas.ts src/features/teaching-assignment/application/actions/teaching-assignment.actions.ts src/features/teaching-assignment/application/actions/preview-carry-over.test.ts
git commit -m "feat(assign): previewCarryOverAction (read-only S1->S2 suggestions)"
```

---

### Task 7: `syncGradeMatrixAction` — persist matrix edits

**Files:**
- Modify: `teaching-assignment.schemas.ts`, `teaching-assignment.actions.ts`
- Test: `src/features/teaching-assignment/application/actions/sync-grade-matrix.test.ts`

**Interfaces:**
- Consumes: `groupMatrixDiffByTeacher` (Task 4), `calculateTeachHour`, `assignRepository.create`, `assignRepository.deleteById`, a `withPrismaTransaction` wrapper (same one `syncAssignmentsAction` uses).
- Produces:
  ```typescript
  // input: { academicYear; semester; existing: MatrixAssignment[]; desired: MatrixAssignment[] }
  // output: { created: number; deleted: number }
  ```
  Per teacher: delete `toDeleteRespIds` first, then create `toCreate` (delete-before-create avoids the unique-index collision class entirely). Server re-validates each desired cell's `SubjectCode` is in that section's program (reject otherwise).

- [ ] **Step 1: Add schema**

```typescript
const matrixAssignmentSchema = v.object({
  RespID: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
  TeacherID: v.pipe(v.number(), v.integer(), v.minValue(1)),
  GradeID: v.pipe(v.string(), v.minLength(1)),
  SubjectCode: v.pipe(v.string(), v.minLength(1), v.maxLength(20)),
  Credit: v.string(),
});
export const syncGradeMatrixSchema = v.object({
  academicYear: v.pipe(v.number(), v.integer()),
  semester: v.picklist(["SEMESTER_1", "SEMESTER_2"]),
  existing: v.array(matrixAssignmentSchema),
  desired: v.array(matrixAssignmentSchema),
});
export type SyncGradeMatrixInput = v.InferOutput<typeof syncGradeMatrixSchema>;
```

- [ ] **Step 2: Write the failing test**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("@/features/assign/infrastructure/repositories/assign.repository", () => ({
  assignRepository: { create: vi.fn(), deleteById: vi.fn(), findByTermGrades: vi.fn() },
}));
vi.mock("@/lib/prisma-transaction", () => ({ withPrismaTransaction: (fn: any) => fn({}) }));
import { syncGradeMatrixAction } from "./teaching-assignment.actions";
import { assignRepository } from "@/features/assign/infrastructure/repositories/assign.repository";

describe("syncGradeMatrixAction", () => {
  beforeEach(() => vi.clearAllMocks());
  it("creates new cells and deletes removed ones, preserving untouched RespIDs", async () => {
    const res = await syncGradeMatrixAction({
      academicYear: 2568,
      semester: "SEMESTER_1",
      existing: [
        { RespID: 5, TeacherID: 4, GradeID: "M1-1", SubjectCode: "ค21101", Credit: "1.0" },
        { RespID: 6, TeacherID: 4, GradeID: "M1-2", SubjectCode: "ค21101", Credit: "1.0" },
      ],
      desired: [
        { RespID: 5, TeacherID: 4, GradeID: "M1-1", SubjectCode: "ค21101", Credit: "1.0" },
        { TeacherID: 7, GradeID: "M1-3", SubjectCode: "ว21101", Credit: "1.5" },
      ],
    });
    expect(res.data).toEqual({ created: 1, deleted: 1 });
    expect(assignRepository.deleteById).toHaveBeenCalledWith(6, expect.anything());
    expect(assignRepository.create).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm exec vitest run src/features/teaching-assignment/application/actions/sync-grade-matrix.test.ts`
Expected: FAIL — not exported.

- [ ] **Step 4: Implement** (mirror `syncAssignmentsAction`'s transaction + revalidation; delete before create):

```typescript
export const syncGradeMatrixAction = createAction(
  syncGradeMatrixSchema,
  async (input: SyncGradeMatrixInput) => {
    const sem = semester[input.semester];
    const diffs = groupMatrixDiffByTeacher(input.existing, input.desired);

    return withPrismaTransaction(async (tx) => {
      let created = 0;
      let deleted = 0;
      for (const diff of diffs) {
        for (const respId of diff.toDeleteRespIds) {
          await assignRepository.deleteById(respId, tx);
          deleted++;
        }
        for (const c of diff.toCreate) {
          await assignRepository.create(
            {
              TeacherID: diff.TeacherID,
              AcademicYear: input.academicYear,
              Semester: sem,
              SubjectCode: c.SubjectCode,
              GradeID: c.GradeID,
              TeachHour: calculateTeachHour(c.Credit),
            },
            tx,
          );
          created++;
        }
      }
      return { created, deleted };
    });
  },
);
```

> Note: confirm `assignRepository.create` / `deleteById` accept a `tx` arg as `syncAssignmentsAction` uses; if they take raw `data`, match that signature. `calculateTeachHour` expects the credit enum string (e.g. `"CREDIT_10"`) — the matrix carries the enum from `getGradeMatrixAction`, so pass it through unchanged (do NOT pre-convert to "1.0").

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run src/features/teaching-assignment/application/actions/sync-grade-matrix.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/teaching-assignment/application/schemas/teaching-assignment.schemas.ts src/features/teaching-assignment/application/actions/teaching-assignment.actions.ts src/features/teaching-assignment/application/actions/sync-grade-matrix.test.ts
git commit -m "feat(assign): syncGradeMatrixAction persists matrix edits (delete-before-create)"
```

---

### Task 8: `grade-matrix.logic.ts` — cell model + apply helpers

**Files:**
- Create: `src/features/teaching-assignment/presentation/components/grade-matrix.logic.ts`
- Test: `src/features/teaching-assignment/presentation/components/grade-matrix.logic.test.ts`

**Interfaces:**
- Consumes: action output types from Task 5.
- Produces:
  ```typescript
  export type CellStatus = "assigned" | "gap" | "na" | "suggested";
  export interface Cell { gradeId: string; subjectCode: string; teacherId: number | null; respId?: number; status: CellStatus; }
  export function buildCells(matrix: GradeMatrixData): Cell[][]; // rows=subjects (union), cols=sections
  export function applySuggestions(cells: Cell[][], mapped: CarryOverSuggestion[]): Cell[][]; // only into gaps, status="suggested"
  export function cellsToDesired(cells: Cell[][], subjectCredit: Record<string,string>): MatrixAssignment[]; // assigned+suggested only
  ```

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import { buildCells, applySuggestions, cellsToDesired } from "./grade-matrix.logic";

const matrix = {
  sections: [
    { GradeID: "M1-1", number: 1, programId: 10, subjectCodes: ["ค21101"] },
    { GradeID: "M1-2", number: 2, programId: 10, subjectCodes: ["ค21101"] },
  ],
  subjects: [{ SubjectCode: "ค21101", SubjectName: "คณิต", Credit: "CREDIT_10", LearningArea: "MATH" }],
  assignments: [{ RespID: 5, TeacherID: 4, GradeID: "M1-1", SubjectCode: "ค21101", Credit: "CREDIT_10" }],
};

describe("grade-matrix.logic", () => {
  it("builds a cell grid: assigned where there's an assignment, gap otherwise", () => {
    const cells = buildCells(matrix);
    expect(cells[0]![0]).toMatchObject({ gradeId: "M1-1", teacherId: 4, respId: 5, status: "assigned" });
    expect(cells[0]![1]).toMatchObject({ gradeId: "M1-2", teacherId: null, status: "gap" });
  });

  it("applies suggestions only into gaps, marked 'suggested'", () => {
    const cells = applySuggestions(buildCells(matrix), [{ GradeID: "M1-2", SubjectCode: "ค21101", TeacherID: 9 }]);
    expect(cells[0]![1]).toMatchObject({ teacherId: 9, status: "suggested" });
    expect(cells[0]![0]).toMatchObject({ teacherId: 4, status: "assigned" }); // unchanged
  });

  it("serializes assigned + suggested cells to desired assignments", () => {
    const cells = applySuggestions(buildCells(matrix), [{ GradeID: "M1-2", SubjectCode: "ค21101", TeacherID: 9 }]);
    const desired = cellsToDesired(cells, { "ค21101": "CREDIT_10" });
    expect(desired).toEqual([
      { RespID: 5, TeacherID: 4, GradeID: "M1-1", SubjectCode: "ค21101", Credit: "CREDIT_10" },
      { TeacherID: 9, GradeID: "M1-2", SubjectCode: "ค21101", Credit: "CREDIT_10" },
    ]);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm exec vitest run src/features/teaching-assignment/presentation/components/grade-matrix.logic.test.ts`
Expected: FAIL — functions not defined.

- [ ] **Step 3: Implement** (rows = `matrix.subjects`, cols = `matrix.sections`; a cell is `na` when the subject is not in that section's `subjectCodes`; `assigned` when an assignment exists; else `gap`. `applySuggestions` fills only `gap` cells. `cellsToDesired` emits `assigned`+`suggested` cells, carrying `respId` when present.)

```typescript
import type { CarryOverSuggestion } from "../../domain/utils/carry-over";

export type CellStatus = "assigned" | "gap" | "na" | "suggested";
export interface Cell { gradeId: string; subjectCode: string; teacherId: number | null; respId?: number; status: CellStatus; }
export interface GradeMatrixData {
  sections: { GradeID: string; number: number; programId: number | null; subjectCodes: string[] }[];
  subjects: { SubjectCode: string; SubjectName: string; Credit: string; LearningArea: string | null }[];
  assignments: { RespID: number; TeacherID: number; GradeID: string; SubjectCode: string; Credit: string }[];
}
export interface MatrixAssignment { RespID?: number; TeacherID: number; GradeID: string; SubjectCode: string; Credit: string; }

export function buildCells(m: GradeMatrixData): Cell[][] {
  const byKey = new Map(m.assignments.map((a) => [`${a.GradeID}|${a.SubjectCode}`, a]));
  return m.subjects.map((subj) =>
    m.sections.map((sec): Cell => {
      const inProgram = sec.subjectCodes.includes(subj.SubjectCode);
      if (!inProgram) return { gradeId: sec.GradeID, subjectCode: subj.SubjectCode, teacherId: null, status: "na" };
      const a = byKey.get(`${sec.GradeID}|${subj.SubjectCode}`);
      return a
        ? { gradeId: sec.GradeID, subjectCode: subj.SubjectCode, teacherId: a.TeacherID, respId: a.RespID, status: "assigned" }
        : { gradeId: sec.GradeID, subjectCode: subj.SubjectCode, teacherId: null, status: "gap" };
    }),
  );
}

export function applySuggestions(cells: Cell[][], mapped: CarryOverSuggestion[]): Cell[][] {
  const sug = new Map(mapped.map((s) => [`${s.GradeID}|${s.SubjectCode}`, s.TeacherID]));
  return cells.map((row) =>
    row.map((c) => {
      if (c.status !== "gap") return c;
      const t = sug.get(`${c.gradeId}|${c.subjectCode}`);
      return t === undefined ? c : { ...c, teacherId: t, status: "suggested" };
    }),
  );
}

export function cellsToDesired(cells: Cell[][], credit: Record<string, string>): MatrixAssignment[] {
  const out: MatrixAssignment[] = [];
  for (const row of cells) {
    for (const c of row) {
      if ((c.status === "assigned" || c.status === "suggested") && c.teacherId !== null) {
        out.push({
          ...(c.respId !== undefined ? { RespID: c.respId } : {}),
          TeacherID: c.teacherId,
          GradeID: c.gradeId,
          SubjectCode: c.subjectCode,
          Credit: credit[c.subjectCode] ?? "CREDIT_10",
        });
      }
    }
  }
  return out;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm exec vitest run src/features/teaching-assignment/presentation/components/grade-matrix.logic.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/teaching-assignment/presentation/components/grade-matrix.logic.ts src/features/teaching-assignment/presentation/components/grade-matrix.logic.test.ts
git commit -m "feat(assign): grade-matrix cell model + suggestion/serialize helpers"
```

---

### Task 9: `GradeCoverageMatrix` component (grid + brush + save)

**Files:**
- Create: `src/features/teaching-assignment/presentation/components/CoverageHeader.tsx`
- Create: `src/features/teaching-assignment/presentation/components/TeacherBrush.tsx`
- Create: `src/features/teaching-assignment/presentation/components/CarryOverDialog.tsx`
- Create: `src/features/teaching-assignment/presentation/components/GradeCoverageMatrix.tsx`
- Test: `src/features/teaching-assignment/presentation/components/GradeCoverageMatrix.test.tsx`

**Interfaces:**
- Consumes: `getGradeMatrixAction`, `previewCarryOverAction`, `syncGradeMatrixAction` (mock in tests); `buildCells`/`applySuggestions`/`cellsToDesired` (Task 8); `computeCoverage` (Task 3); `TeacherPicker`.
- Produces: `<GradeCoverageMatrix gradeYear={n} academicYear={n} semester={s} />`.

Component behavior (build to satisfy the test below):
- On mount, SWR-fetch `getGradeMatrixAction`; `buildCells` into `useState` `cells`.
- Render `CoverageHeader` (uses `computeCoverage` over sections: required = `subjectCodes`, assigned = codes with non-`na`, non-`gap` teacher).
- Grid: rows grouped by `LearningArea`; columns = sections. Each cell: `assigned`/`suggested` → teacher chip (suggested = dashed/tinted); `gap` → `[+]` ⚠ button; `na` → greyed `—` (disabled).
- `TeacherBrush`: a `TeacherPicker` bound to `brushTeacher` state + an on/off toggle. When active, clicking a non-`na` cell sets that cell to `brushTeacher` (status `assigned`, drop any `respId`? keep `respId` so the diff updates in place — set `teacherId`, keep `respId`, status `assigned`). When inactive, clicking a cell opens a single-cell `TeacherPicker` popover.
- `CarryOverDialog`: calls `previewCarryOverAction`; shows mapped count + exceptions list; "Apply" runs `applySuggestions(cells, mapped)`.
- Dirty tracking: compare `cellsToDesired(cells)` vs the original assignments; Save calls `syncGradeMatrixAction({ academicYear, semester, existing, desired })`, then re-fetches. Discard re-runs `buildCells` from fetched data.

- [ ] **Step 1: Write the failing test** (Testing Library, mirroring `TeacherCentricEditor.test.tsx`)

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const getGradeMatrixAction = vi.fn();
const syncGradeMatrixAction = vi.fn();
const previewCarryOverAction = vi.fn();
vi.mock("@/features/teaching-assignment/application/actions/teaching-assignment.actions", () => ({
  getGradeMatrixAction: (...a: any) => getGradeMatrixAction(...a),
  syncGradeMatrixAction: (...a: any) => syncGradeMatrixAction(...a),
  previewCarryOverAction: (...a: any) => previewCarryOverAction(...a),
}));

import { GradeCoverageMatrix } from "./GradeCoverageMatrix";

beforeEach(() => {
  vi.clearAllMocks();
  getGradeMatrixAction.mockResolvedValue({
    success: true,
    data: {
      sections: [
        { GradeID: "M1-1", number: 1, programId: 10, subjectCodes: ["ค21101"] },
        { GradeID: "M1-2", number: 2, programId: 10, subjectCodes: ["ค21101"] },
      ],
      subjects: [{ SubjectCode: "ค21101", SubjectName: "คณิต", Credit: "CREDIT_10", LearningArea: "MATH" }],
      assignments: [{ RespID: 5, TeacherID: 4, GradeID: "M1-1", SubjectCode: "ค21101", Credit: "CREDIT_10" }],
    },
  });
  syncGradeMatrixAction.mockResolvedValue({ success: true, data: { created: 1, deleted: 0 } });
});

describe("GradeCoverageMatrix", () => {
  it("renders coverage 1/2 from fetched data", async () => {
    render(<GradeCoverageMatrix gradeYear={1} academicYear={2568} semester="SEMESTER_1" teachers={[{ id: 4, prefix: "อ.", firstname: "วิภา", lastname: "", department: "MATH" }]} />);
    await waitFor(() => expect(screen.getByText(/1\s*\/\s*2/)).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm exec vitest run src/features/teaching-assignment/presentation/components/GradeCoverageMatrix.test.tsx`
Expected: FAIL — `GradeCoverageMatrix` not exported.

- [ ] **Step 3: Implement `CoverageHeader`, `TeacherBrush`, `CarryOverDialog`, then `GradeCoverageMatrix`.**

Build each as a focused MUI component. `CoverageHeader` takes `{ filled, required }` and renders `${filled} / ${required}` + a `LinearProgress`. `TeacherBrush` wraps `TeacherPicker` + a toggle `Chip`. `CarryOverDialog` is a MUI `Dialog` calling `previewCarryOverAction` and rendering `mapped.length` + an exceptions `List`, with an `Apply` button. `GradeCoverageMatrix` holds `cells` state, renders a `Table` grouped by `LearningArea`, and wires brush/cell-click/save/discard per the behavior list above. Keep each file focused; follow the MUI + SWR patterns already in `TeacherAssignmentPage.tsx` and `TeacherCentricEditor.tsx`. The minimum to pass Step 1's test is fetch-on-mount + `computeCoverage` rendered via `CoverageHeader`; implement the full interaction in this step too (it is the component's purpose).

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm exec vitest run src/features/teaching-assignment/presentation/components/GradeCoverageMatrix.test.tsx`
Expected: PASS.

- [ ] **Step 5: Add an interaction test (brush fills a gap and Save sends the new cell)**

```typescript
it("brush-fills a gap and Save sends the new desired cell", async () => {
  const user = userEvent.setup();
  render(<GradeCoverageMatrix gradeYear={1} academicYear={2568} semester="SEMESTER_1" teachers={[{ id: 4, prefix: "อ.", firstname: "วิภา", lastname: "", department: "MATH" }]} />);
  await screen.findByText(/1\s*\/\s*2/);
  await user.click(screen.getByRole("button", { name: /brush/i }));          // activate brush (aria-label="brush")
  await user.click(screen.getByRole("button", { name: "ค21101 M1-2" }));     // gap cell (aria-label=`${code} ${gradeId}`)
  await user.click(screen.getByRole("button", { name: /บันทึก/ }));
  await waitFor(() => expect(syncGradeMatrixAction).toHaveBeenCalledTimes(1));
  const arg = syncGradeMatrixAction.mock.calls[0]![0];
  expect(arg.desired).toContainEqual(expect.objectContaining({ TeacherID: 4, GradeID: "M1-2", SubjectCode: "ค21101" }));
  expect(arg.existing).toContainEqual(expect.objectContaining({ RespID: 5 }));
});
```

Add the `aria-label`s referenced (`brush` toggle, each cell `${code} ${gradeId}`) to make the component testable and accessible.

- [ ] **Step 6: Run to verify it passes**

Run: `pnpm exec vitest run src/features/teaching-assignment/presentation/components/GradeCoverageMatrix.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add src/features/teaching-assignment/presentation/components/CoverageHeader.tsx src/features/teaching-assignment/presentation/components/TeacherBrush.tsx src/features/teaching-assignment/presentation/components/CarryOverDialog.tsx src/features/teaching-assignment/presentation/components/GradeCoverageMatrix.tsx src/features/teaching-assignment/presentation/components/GradeCoverageMatrix.test.tsx
git commit -m "feat(assign): GradeCoverageMatrix grid with brush, carry-over, save"
```

---

### Task 10: Wire into `TeacherAssignmentPage`; demote by-teacher to read lens

**Files:**
- Modify: `src/features/teaching-assignment/presentation/components/TeacherAssignmentPage.tsx`

**Interfaces:**
- Consumes: `GradeCoverageMatrix` (Task 9). Existing `mode` resolution (`resolveAssignmentMode`), `AssignmentFilters`, `teacherOptions`.

- [ ] **Step 1: Replace the `by-grade` body**

In the `mode === "by-grade"` branch, remove the `handleCopyFromPrevious`/`handleClearAll` button row and `SubjectAssignmentTable`, and render the matrix when a grade level is chosen. Derive `gradeYear` from the selected `gradeId` (e.g. the `Year` of the chosen grade, or add a grade-year selector to `AssignmentFilters`). Replace with:

```tsx
{mode === "by-grade" && (
  gradeYear ? (
    <GradeCoverageMatrix
      gradeYear={gradeYear}
      academicYear={academicYear}
      semester={semester}
      teachers={teacherOptions}
    />
  ) : (
    <Paper sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="body1" sx={{ color: "text.secondary" }}>
        กรุณาเลือกระดับชั้น ภาคเรียน และปีการศึกษา
      </Typography>
    </Paper>
  )
)}
```

- [ ] **Step 2: Demote `by-teacher` to a read-only lens**

In the `by-teacher` branch, render `TeacherWorkloadCard` + `LockedScheduleList` + a read-only assignment list, and replace the editable `TeacherCentricEditor` with a non-editing summary (or pass a `readOnly` prop). Keep the teacher picker. The matrix is now the single editing surface.

- [ ] **Step 3: Remove the now-unused same-code copy from this page**

Delete the `handleCopyFromPrevious`, `handleClearAll`, and their `copyAssignmentsAction`/`clearAllAssignmentsAction`/`CopyIcon`/`ClearIcon` imports **from this file only**. Leave `copyAssignmentsAction` itself in place (still used by the create-semester wizard — out of scope).

- [ ] **Step 4: Manual verification in the running app**

With the dev server + seeded DB up (`pnpm dev:db:up`, `pnpm dev:e2e` or `pnpm dev`, `pnpm db:seed:demo`):
1. Navigate `/management/teacher-assignment?mode=by-grade&year=2568&semester=1`, select ม.1.
2. Confirm the matrix shows sections × subjects, gaps as ⚠, coverage header.
3. Brush-assign a teacher across a row, Save, reload → persists (verify DB row count rises).
4. Switch to S2, click carry-over → suggestions fill gaps, exceptions listed; Save persists S2.
5. `pnpm typecheck` → 0 errors in `src`.

- [ ] **Step 5: Commit**

```bash
git add src/features/teaching-assignment/presentation/components/TeacherAssignmentPage.tsx
git commit -m "feat(assign): use coverage matrix for by-grade; by-teacher read-only lens"
```

---

## Self-Review

**Spec coverage:** matrix layout (T8/T9), ragged programs/`na` cells (T8 `buildCells`), coverage def (T3/T9), carry-over editable suggestions + exceptions (T2/T6/T8/T9), per-cell edit + brush (T9), save with RespID preservation (T4/T7), data fetch (T5), `by-teacher` read lens + retire same-code copy in-page (T10). Risks (wide grids) handled via grouped table/scroll in T9. All spec sections map to a task.

**Placeholder scan:** logic tasks (1–4, 8) and actions (5–7) have complete code + tests. Task 9's full MUI markup is described behaviorally with two concrete failing tests pinning the contract (fetch+coverage, brush+save) — acceptable because the component's logic lives in the tested Task 8 helpers; the JSX follows existing components. Task 10 shows the exact JSX edit.

**Type consistency:** `MatrixAssignment` shape is identical in Tasks 4, 7, 8. `Credit` is the enum string (`CREDIT_10`) end-to-end; `calculateTeachHour` consumes it directly (noted in T7). `computeCarryOver` output (`{mapped, exceptions}`) is consumed unchanged by T6 and `applySuggestions` (T8). Cell `status` values (`assigned|gap|na|suggested`) are consistent across T8/T9.
