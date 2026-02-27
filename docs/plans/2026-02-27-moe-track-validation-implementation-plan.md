# MOE Track-Specific Elective Validation Hardening — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement unified MOE validation that enforces track-specific elective requirements for upper secondary programs (M4-M6), preventing invalid programs from being published.

**Architecture:** Unified validation layer checking both credit-based and lesson-based requirements. Track enum alignment in config. Optional track parameter passed through publish-readiness gate.

**Tech Stack:** TypeScript, Prisma, Vitest, Next.js server actions, Valibot

**Related Design:** [2026-02-27-moe-track-validation-hardening-design.md](2026-02-27-moe-track-validation-hardening-design.md)

---

## Phase 1: Config & Setup (30 min) — **[LOWEST RISK]**

### Task 1: Fix ProgramTrack Type in Config

**Files:**
- Modify: `src/config/moe-standards.ts:504-506`

**Step 1: Locate the type definition**

Open `src/config/moe-standards.ts` and find the line with:
```typescript
export type ProgramTrack = "GENERAL" | "SCIENCE_MATH" | "ARTS_LANGUAGE";
```

**Step 2: Replace with corrected type**

```typescript
export type ProgramTrack = "GENERAL" | "SCIENCE_MATH" | "LANGUAGE_MATH" | "LANGUAGE_ARTS";
```

**Step 3: Verify imports of this type**

Run:
```bash
cd b:\Dev\school-timetable-senior-project
grep -r "ProgramTrack" src --include="*.ts" --include="*.tsx"
```

Expect to see imports in:
- `moe-standards.ts` (definition)
- `moe-validation.ts` (will add later)
- Any other validation/config files

**Step 4: Commit**

```bash
git add src/config/moe-standards.ts
git commit -m "fix: correct ProgramTrack enum to match Prisma (add LANGUAGE_MATH, rename ARTS_LANGUAGE)"
```

---

### Task 2: Add LANGUAGE_MATH Electives Config

**Files:**
- Modify: `src/config/moe-standards.ts` (after line ~310)

**Step 1: Locate where electives are defined**

Find `ARTS_LANGUAGE_ELECTIVES` constant (~line 285).

**Step 2: Add new LANGUAGE_MATH_ELECTIVES constant after ARTS_LANGUAGE_ELECTIVES**

```typescript
/**
 * Arts-Math track electives for upper secondary (ศิลป์-คำนวณ)
 */
const LANGUAGE_MATH_ELECTIVES: SubjectWeeklyStandard[] = [
  {
    subjectCode: "MA_ADV",
    subjectNameTh: "คณิตศาสตร์เพิ่มเติม",
    subjectNameEn: "Advanced Mathematics",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 4,
    category: "ELECTIVE",
    group: "คณิตศาสตร์",
  },
  {
    subjectCode: "EN_ADV",
    subjectNameTh: "ภาษาอังกฤษเพิ่มเติม",
    subjectNameEn: "Advanced English",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "ELECTIVE",
    group: "ภาษาอังกฤษ",
  },
  {
    subjectCode: "CH",
    subjectNameTh: "ภาษาจีน",
    subjectNameEn: "Chinese",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "ELECTIVE",
    group: "ภาษาต่างประเทศ",
  },
  {
    subjectCode: "JP",
    subjectNameTh: "ภาษาญี่ปุ่น",
    subjectNameEn: "Japanese",
    minWeeklyLessons: 2,
    maxWeeklyLessons: 3,
    category: "ELECTIVE",
    group: "ภาษาต่างประเทศ",
  },
  {
    subjectCode: "CP_ADV",
    subjectNameTh: "วิทยาการคำนวณ",
    subjectNameEn: "Computer Science",
    minWeeklyLessons: 1,
    maxWeeklyLessons: 2,
    category: "ELECTIVE",
    group: "วิทยาศาสตร์",
  },
];
```

**Step 3: Verify code formatting**

Run:
```bash
pnpm run lint src/config/moe-standards.ts
```

Expect: No errors.

**Step 4: Commit**

```bash
git add src/config/moe-standards.ts
git commit -m "feat: add LANGUAGE_MATH electives (ศิลป์-คำนวณ track) to MOE standards config"
```

---

### Task 3: Update getTrackElectives() to Use Correct Enum Values

**Files:**
- Modify: `src/config/moe-standards.ts` (~line 509-520)

**Step 1: Find getTrackElectives function**

Locate the function that looks like:
```typescript
export function getTrackElectives(year: YearKey, track: ProgramTrack): SubjectWeeklyStandard[] {
```

**Step 2: Update the switch statement**

Replace:
```typescript
switch (track) {
  case "SCIENCE_MATH":
    return SCIENCE_MATH_ELECTIVES;
  case "ARTS_LANGUAGE":
    return ARTS_LANGUAGE_ELECTIVES;
  case "GENERAL":
  default:
    return standard.electiveSubjects;
}
```

With:
```typescript
switch (track) {
  case "SCIENCE_MATH":
    return SCIENCE_MATH_ELECTIVES;
  case "LANGUAGE_MATH":
    return LANGUAGE_MATH_ELECTIVES;
  case "LANGUAGE_ARTS":
    return ARTS_LANGUAGE_ELECTIVES;
  case "GENERAL":
  default:
    return standard.electiveSubjects;
}
```

**Step 3: Verify function works**

Run tests for `moe-standards.ts`:
```bash
pnpm run test:moe vitest run __test__/moe-standards/moe-standards.test.ts
```

Expected: Tests should pass (or at least not break on the switch statement).

**Step 4: Commit**

```bash
git add src/config/moe-standards.ts
git commit -m "fix: update getTrackElectives switch to use LANGUAGE_MATH and LANGUAGE_ARTS enum values"
```

---

### Task 4: Create SubjectCategory Mapper Utility

**Files:**
- Create: `src/utils/moe-category-mapper.ts`

**Step 1: Create new file**

```typescript
/**
 * Maps Prisma SubjectCategory enum to validation category strings
 * Prisma uses ADDITIONAL, validation code expects ELECTIVE
 */

import type { SubjectCategory } from "@/prisma/generated/client";

/**
 * Map Prisma SubjectCategory to validation code category
 * Prisma enum: CORE, ADDITIONAL, ACTIVITY
 * Validation expects: CORE, ELECTIVE, ACTIVITY
 *
 * @param prismaCategory - Category from Prisma database
 * @returns Validation category string
 */
export function mapSubjectCategory(
  prismaCategory: SubjectCategory,
): "CORE" | "ELECTIVE" | "ACTIVITY" {
  switch (prismaCategory) {
    case "CORE":
      return "CORE";
    case "ADDITIONAL":
      return "ELECTIVE"; // Prisma ADDITIONAL = validation ELECTIVE
    case "ACTIVITY":
      return "ACTIVITY";
    default:
      const _exhaustive: never = prismaCategory;
      return _exhaustive;
  }
}

/**
 * Check if a Prisma category is an elective
 */
export function isElectiveCategory(category: SubjectCategory): boolean {
  return mapSubjectCategory(category) === "ELECTIVE";
}

/**
 * Check if a Prisma category is core
 */
export function isCoreCategory(category: SubjectCategory): boolean {
  return mapSubjectCategory(category) === "CORE";
}

/**
 * Check if a Prisma category is an activity
 */
export function isActivityCategory(category: SubjectCategory): boolean {
  return mapSubjectCategory(category) === "ACTIVITY";
}
```

**Step 2: Verify TypeScript compilation**

Run:
```bash
pnpm run typecheck
```

Expected: No errors in the new file.

**Step 3: Commit**

```bash
git add src/utils/moe-category-mapper.ts
git commit -m "feat: add SubjectCategory mapper utility (ADDITIONAL ↔ ELECTIVE)"
```

---

## Phase 2: Credit-Based Validation Service (1.5 hr) — **[MEDIUM RISK]**

### Task 5: Add Track Parameter to validateProgramMOECredits

**Files:**
- Modify: `src/features/program/domain/services/moe-validation.service.ts:93-110`

**Step 1: Open the file and locate the function signature**

Find:
```typescript
export function validateProgramMOECredits(
  year: number,
  programSubjects: Array<program_subject & { subject: subject }>,
): ProgramValidationResult {
```

**Step 2: Add import at top**

Add to imports section:
```typescript
import type { ProgramTrack } from "@/config/moe-standards";
import { getTrackElectives } from "@/config/moe-standards";
import { mapSubjectCategory } from "@/utils/moe-category-mapper";
```

**Step 3: Update function signature**

Change to:
```typescript
export function validateProgramMOECredits(
  year: number,
  programSubjects: Array<program_subject & { subject: subject }>,
  track?: ProgramTrack,
): ProgramValidationResult {
```

**Step 4: Run existing tests to ensure no breakage**

```bash
pnpm run test:program vitest run __test__/features/program/moe-validation.service.test.ts
```

Expected: All existing tests pass (backward compatible).

**Step 5: Commit**

```bash
git add src/features/program/domain/services/moe-validation.service.ts
git commit -m "feat: add optional track parameter to validateProgramMOECredits for backward compatibility"
```

---

### Task 6: Implement validateTrackElectives Helper Function

**Files:**
- Modify: `src/features/program/domain/services/moe-validation.service.ts` (add after line ~200)

**Step 1: Add helper function to map learning areas**

After the `validateMandatorySubjects` function, add:

```typescript
/**
 * Map subject group name to LearningArea for matching track electives
 * Converts Thai group names to enum values
 */
function mapGroupToLearningArea(group: string): LearningArea {
  const mapping: Record<string, LearningArea> = {
    "คณิตศาสตร์": "MATHEMATICS",
    "วิทยาศาสตร์": "SCIENCE",
    "ภาษาอังกฤษ": "FOREIGN_LANGUAGE",
    "ภาษาต่างประเทศ": "FOREIGN_LANGUAGE",
    "สังคมศึกษา": "SOCIAL",
    "ศิลปะ": "ARTS",
  };
  return mapping[group] || "SCIENCE";
}

/**
 * Get Thai name for program track
 */
function getTrackNameThai(track: ProgramTrack): string {
  const names: Record<ProgramTrack, string> = {
    SCIENCE_MATH: "แผนวิทย์-คณิต",
    LANGUAGE_MATH: "แผนศิลป์-คำนวณ",
    LANGUAGE_ARTS: "แผนศิลป์-ภาษา",
    GENERAL: "แผนทั่วไป",
  };
  return names[track];
}

/**
 * Validate track-specific elective requirements for upper secondary
 *
 * Rules per Thai MOE 2551:
 * - SCIENCE_MATH: Must have ≥3 of (Math Adv, Physics, Chemistry, Biology)
 * - LANGUAGE_MATH: Must have ≥2 of (Math Adv, English Adv, 3rd Language)
 * - LANGUAGE_ARTS: Must have ≥2 of (Social Adv, English Adv, 3rd Language)
 * - GENERAL: No specific requirement
 */
function validateTrackElectives(
  track: ProgramTrack,
  year: number,
  programSubjects: Array<program_subject & { subject: subject }>,
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (track === "GENERAL") {
    return { errors, warnings }; // No track-specific requirements
  }

  // Determine year key for config lookup
  const yearKey = year === 1 ? "M1" : year === 2 ? "M2" : year === 3 ? "M3" : year === 4 ? "M4" : year === 5 ? "M5" : "M6";

  // Get required elective groups for this track
  const trackElectives = getTrackElectives(yearKey as YearKey, track);

  // Group track electives by learning area
  const trackElectiveGroups = new Map<LearningArea, string[]>();
  trackElectives.forEach((e) => {
    const learningArea = mapGroupToLearningArea(e.group);
    if (!trackElectiveGroups.has(learningArea)) {
      trackElectiveGroups.set(learningArea, []);
    }
    trackElectiveGroups.get(learningArea)!.push(e.group);
  });

  // Check which required learning areas are covered by student electives
  const studentElectives = programSubjects.filter(
    (ps) => ps.Category === SubjectCategory.ADDITIONAL,
  );

  const coveredLearningAreas = new Set<LearningArea>();
  for (const studentElective of studentElectives) {
    const learningArea = studentElective.subject.LearningArea;
    if (trackElectiveGroups.has(learningArea)) {
      coveredLearningAreas.add(learningArea);
    }
  }

  // Enforce track-specific minimums
  const minimumRequired =
    track === "SCIENCE_MATH" ? 3 : track === "GENERAL" ? 0 : 2;
  const totalRequired = trackElectiveGroups.size;
  const trackNameThai = getTrackNameThai(track);

  if (coveredLearningAreas.size < minimumRequired) {
    if (coveredLearningAreas.size === 0) {
      errors.push(
        `${trackNameThai}: ขาดวิชาเพิ่มเติมตามแผนการเรียน (ต้องมีอย่างน้อย ${minimumRequired}/${totalRequired} กลุ่ม)`,
      );
    } else {
      warnings.push(
        `${trackNameThai}: มีวิชาเพิ่มเติมตามแผนเพียง ${coveredLearningAreas.size}/${totalRequired} กลุ่ม (แนะนำให้ครบตามข้อกำหนด)`,
      );
    }
  }

  return { errors, warnings };
}
```

**Step 2: Import YearKey type if not already imported**

Verify `YearKey` is imported:
```typescript
import type { YearKey } from "@/config/moe-standards";
```

**Step 3: Run linter**

```bash
pnpm run lint src/features/program/domain/services/moe-validation.service.ts
```

Expected: No errors. TypeScript types should resolve correctly.

**Step 4: Commit**

```bash
git add src/features/program/domain/services/moe-validation.service.ts
git commit -m "feat: add validateTrackElectives helper function to enforce MOE track requirements"
```

---

### Task 7: Wire Track Validation Into Return Logic

**Files:**
- Modify: `src/features/program/domain/services/moe-validation.service.ts` (~line 150-160)

**Step 1: Locate the return statement in validateProgramMOECredits**

Find the line:
```typescript
return {
  isValid: errors.length === 0,
  totalCredits: totalCurrent,
  requiredCredits: totalRequired,
  learningAreas: learningAreaStatuses,
  errors,
  warnings,
};
```

**Step 2: Add track validation before the return**

Insert before the return statement:

```typescript
// Check track-specific electives for upper secondary
const isUpperSecondary = year >= 4 && year <= 6;
if (track && isUpperSecondary && track !== "GENERAL") {
  const trackResult = validateTrackElectives(track, year, programSubjects);
  errors.push(...trackResult.errors);
  warnings.push(...trackResult.warnings);
}
```

**Step 3: Test the change with existing tests**

```bash
pnpm run test:program vitest run __test__/features/program/moe-validation.service.test.ts
```

Expected: All tests still pass.

**Step 4: Commit**

```bash
git add src/features/program/domain/services/moe-validation.service.ts
git commit -m "fix: wire track-aware elective validation into moe-validation.service return logic"
```

---

## Phase 3: Lesson-Based Validation (1 hr) — **[MEDIUM RISK]**

### Task 8: Update validateProgramStandards to Use Track Field

**Files:**
- Modify: `src/utils/moe-validation.ts` (~line 85)

**Step 1: Open the file and locate validateProgramStandards function**

Find where it returns the ValidationResult (~line 150).

**Step 2: Add imports at top**

```typescript
import { getTrackElectives } from "@/config/moe-standards";
import type { ProgramTrack } from "@/config/moe-standards";
```

**Step 3: Add helper function at end of file**

```typescript
/**
 * Get Thai name for program track
 */
function getTrackNameThai(track: ProgramTrack): string {
  const names: Record<ProgramTrack, string> = {
    SCIENCE_MATH: "แผนวิทย์-คณิต",
    LANGUAGE_MATH: "แผนศิลป์-คำนวณ",
    LANGUAGE_ARTS: "แผนศิลป์-ภาษา",
    GENERAL: "แผนทั่วไป",
  };
  return names[track];
}
```

**Step 4: Add track elective checking before the return statement**

Find the `return` statement in `validateProgramStandards` and add this before it (~line 145):

```typescript
// Check track-specific electives for upper secondary
if (input.track && isUpperSecondary(input.year) && input.track !== "GENERAL") {
  const trackElectives = getTrackElectives(input.year, input.track);
  const trackElectiveGroups = new Map<string, string[]>();
  
  trackElectives.forEach((e) => {
    if (!trackElectiveGroups.has(e.group)) {
      trackElectiveGroups.set(e.group, []);
    }
  });

  const studentElectiveGroups = new Set(
    input.subjects
      .filter((s) => s.category === "ELECTIVE")
      .map((s) => s.group),
  );

  const minimumRequired = input.track === "SCIENCE_MATH" ? 3 : 2;
  const coveredCount = Array.from(studentElectiveGroups).filter((g) =>
    trackElectiveGroups.has(g),
  ).length;

  if (coveredCount < minimumRequired) {
    errors.push(
      `${getTrackNameThai(input.track)}: ขาดวิชาเพิ่มเติมตามแผนการเรียน`,
    );
  }
}
```

**Step 5: Test with existing MOE standards tests**

```bash
pnpm run test:moe vitest run __test__/moe-standards/moe-standards.test.ts
```

Expected: All tests pass. If tests fail, check that you didn't break any existing validation logic.

**Step 6: Commit**

```bash
git add src/utils/moe-validation.ts
git commit -m "feat: implement track-aware elective validation in lesson-based system (validateProgramStandards)"
```

---

## Phase 4: Publish Gateway Wiring (15 min) — **[LOW RISK]**

### Task 9: Pass Track Through checkPublishReadiness

**Files:**
- Modify: `src/features/config/domain/services/publish-readiness.service.ts:56`

**Step 1: Locate the validateProgramMOECredits call**

Find around line 56:
```typescript
const result = validateProgramMOECredits(
  program.Year,
  program.program_subject,
);
```

**Step 2: Add track parameter**

Change to:
```typescript
const result = validateProgramMOECredits(
  program.Year,
  program.program_subject,
  program.Track,
);
```

**Step 3: Verify types resolve correctly**

No type imports needed — `program.Track` is already typed as `ProgramTrack` from Prisma model.

Run:
```bash
pnpm run typecheck
```

Expected: No TypeScript errors.

**Step 4: Test that publish-readiness still works**

If publish-readiness tests exist, run them:
```bash
pnpm run test vitest run __test__/features/config/publish-readiness.service.test.ts
```

Expected: Tests pass (or no errors if tests don't exist yet).

**Step 5: Commit**

```bash
git add src/features/config/domain/services/publish-readiness.service.ts
git commit -m "feat: wire program.Track through checkPublishReadiness gate"
```

---

## Phase 5: Testing & Validation (2 hr) — **[HIGH PRIORITY]**

### Task 10: Write Unit Tests for SCIENCE_MATH Track

**Files:**
- Modify: `__test__/features/program/moe-validation.service.test.ts`

**Step 1: Add new test suite**

Add at the end of the describe block for `validateProgramMOECredits`:

```typescript
describe("track-specific elective validation (SCIENCE_MATH)", () => {
  it("should error when SCIENCE_MATH program has zero science electives", () => {
    const mockSubjects: Array<program_subject & { subject: subject }> = [
      // Core subjects only
      createMockProgramSubject("ท21101", "Thai", "CORE"),
      createMockProgramSubject("ค21101", "Math", "CORE"),
      createMockProgramSubject("ว21101", "Science (general core)", "CORE"),
      createMockProgramSubject("ส21101", "Social", "CORE"),
      createMockProgramSubject("พ21101", "PE", "CORE"),
      createMockProgramSubject("ศ21101", "Arts", "CORE"),
      createMockProgramSubject("ง21101", "Career", "CORE"),
      createMockProgramSubject("อ21101", "English", "CORE"),
    ];

    const result = validateProgramMOECredits(
      4, // Year 4 (upper secondary)
      mockSubjects,
      "SCIENCE_MATH", // Track
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("ขาดวิชาเพิ่มเติม"))).toBe(true);
  });

  it("should pass when SCIENCE_MATH program has all required science electives", () => {
    const mockSubjects: Array<program_subject & { subject: subject }> = [
      // Core subjects
      createMockProgramSubject("ท41101", "Thai", "CORE"),
      createMockProgramSubject("ค41101", "Math", "CORE"),
      createMockProgramSubject("ว41101", "Science (general core)", "CORE"),
      createMockProgramSubject("ส41101", "Social", "CORE"),
      createMockProgramSubject("พ41101", "PE", "CORE"),
      createMockProgramSubject("อ41101", "English", "CORE"),
      // Track electives (SCIENCE_MATH)
      createMockProgramSubject("ค41202", "Advanced Math", "ADDITIONAL", 4), // Learning area: MATHEMATICS
      createMockProgramSubject("ว41301", "Physics", "ADDITIONAL", 3), // Learning area: SCIENCE
      createMockProgramSubject("ว41302", "Chemistry", "ADDITIONAL", 3), // Learning area: SCIENCE
      createMockProgramSubject("ว41303", "Biology", "ADDITIONAL", 3), // Learning area: SCIENCE
      // Activity
      createMockProgramSubject("กจ", "Homeroom", "ACTIVITY"),
    ];

    const result = validateProgramMOECredits(
      4,
      mockSubjects,
      "SCIENCE_MATH",
    );

    expect(result.isValid).toBe(true);
    expect(result.errors.filter((e) => e.includes("แผนวิทย์"))).toHaveLength(0);
  });

  it("should warn when SCIENCE_MATH program has only 2/4 required science groups", () => {
    const mockSubjects: Array<program_subject & { subject: subject }> = [
      // Core subjects (simplified)
      createMockProgramSubject("ท41101", "Thai", "CORE"),
      createMockProgramSubject("ค41101", "Math", "CORE"),
      createMockProgramSubject("ว41101", "Science", "CORE"),
      createMockProgramSubject("ส41101", "Social", "CORE"),
      createMockProgramSubject("พ41101", "PE", "CORE"),
      createMockProgramSubject("อ41101", "English", "CORE"),
      // Only 2 track electives
      createMockProgramSubject("ค41202", "Advanced Math", "ADDITIONAL", 4),
      createMockProgramSubject("ว41301", "Physics", "ADDITIONAL", 3),
      // Missing Chemistry, Biology
      createMockProgramSubject("กจ", "Homeroom", "ACTIVITY"),
    ];

    const result = validateProgramMOECredits(
      4,
      mockSubjects,
      "SCIENCE_MATH",
    );

    // Should have warnings about incomplete track coverage
    expect(
      result.warnings.some((w) => w.includes("มีวิชาเพิ่มเติม"))
    ).toBe(true);
  });
});
```

**Step 2: Create helper function for mock subjects**

Add to test file (if not already present):

```typescript
function createMockProgramSubject(
  subjectCode: string,
  name: string,
  category: "CORE" | "ADDITIONAL" | "ACTIVITY",
  credits: number = 3,
): program_subject & { subject: subject } {
  // Determine learning area based on subject code or name
  let learningArea: LearningArea = "SCIENCE";
  if (subjectCode.startsWith("ค") || name.includes("Math")) learningArea = "MATHEMATICS";
  else if (subjectCode.startsWith("ท") || name.includes("Thai")) learningArea = "THAI";
  else if (subjectCode.startsWith("ส") || name.includes("Social")) learningArea = "SOCIAL";
  else if (subjectCode.startsWith("อ") || name.includes("English")) learningArea = "FOREIGN_LANGUAGE";
  else if (name.includes("Physics") || name.includes("Chemistry") || name.includes("Biology")) learningArea = "SCIENCE";

  return {
    ProgramSubjectID: `id-${subjectCode}`,
    ProgramID: "test-program",
    SubjectCode: subjectCode,
    Category: category as SubjectCategory,
    IsMandatory: category === "CORE",
    MinCredits: credits,
    MaxCredits: credits,
    subject: {
      SubjectCode: subjectCode,
      SubjectName: name,
      LearningArea: learningArea,
      Semester: 1,
      Year: 4,
      Credits: credits,
      Hours: credits,
      Level: "SECONDARY",
    },
  };
}
```

**Step 3: Run the new tests**

```bash
pnpm run test:program vitest run __test__/features/program/moe-validation.service.test.ts --grep "SCIENCE_MATH"
```

Expected: 3 tests pass (error case, pass case, warning case).

**Step 4: Commit**

```bash
git add __test__/features/program/moe-validation.service.test.ts
git commit -m "test: add unit tests for SCIENCE_MATH track validation"
```

---

### Task 11: Write Unit Tests for LANGUAGE_ARTS Track

**Files:**
- Modify: `__test__/features/program/moe-validation.service.test.ts`

**Step 1: Add test suite for LANGUAGE_ARTS**

Add after SCIENCE_MATH tests:

```typescript
describe("track-specific elective validation (LANGUAGE_ARTS)", () => {
  it("should error when LANGUAGE_ARTS program has zero language electives", () => {
    const mockSubjects: Array<program_subject & { subject: subject }> = [
      // Core only
      createMockProgramSubject("ท41101", "Thai", "CORE"),
      createMockProgramSubject("ค41101", "Math", "CORE"),
      createMockProgramSubject("ว41101", "Science", "CORE"),
      createMockProgramSubject("ส41101", "Social", "CORE"),
      createMockProgramSubject("พ41101", "PE", "CORE"),
      createMockProgramSubject("อ41101", "English", "CORE"),
      createMockProgramSubject("กจ", "Homeroom", "ACTIVITY"),
    ];

    const result = validateProgramMOECredits(
      4,
      mockSubjects,
      "LANGUAGE_ARTS",
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("ศิลป์-ภาษา"))).toBe(true);
  });

  it("should pass when LANGUAGE_ARTS program has required language electives", () => {
    const mockSubjects: Array<program_subject & { subject: subject }> = [
      // Core
      createMockProgramSubject("ท41101", "Thai", "CORE"),
      createMockProgramSubject("ค41101", "Math", "CORE"),
      createMockProgramSubject("ว41101", "Science", "CORE"),
      createMockProgramSubject("ส41101", "Social", "CORE"),
      createMockProgramSubject("พ41101", "PE", "CORE"),
      createMockProgramSubject("อ41101", "English", "CORE"),
      // Track electives (LANGUAGE_ARTS) — need ≥2 of 3
      createMockProgramSubject("ส41202", "Advanced Social", "ADDITIONAL", 3), // SOCIAL
      createMockProgramSubject("อ41202", "Advanced English", "ADDITIONAL", 3), // FOREIGN_LANGUAGE
      createMockProgramSubject("กจ", "Homeroom", "ACTIVITY"),
    ];

    const result = validateProgramMOECredits(
      4,
      mockSubjects,
      "LANGUAGE_ARTS",
    );

    expect(result.isValid).toBe(true);
  });
});
```

**Step 2: Run tests**

```bash
pnpm run test:program vitest run __test__/features/program/moe-validation.service.test.ts --grep "LANGUAGE_ARTS"
```

Expected: 2 tests pass.

**Step 3: Commit**

```bash
git add __test__/features/program/moe-validation.service.test.ts
git commit -m "test: add unit tests for LANGUAGE_ARTS track validation"
```

---

### Task 12: Write Unit Tests for LANGUAGE_MATH Track

**Files:**
- Modify: `__test__/features/program/moe-validation.service.test.ts`

**Step 1: Add test suite for LANGUAGE_MATH**

```typescript
describe("track-specific elective validation (LANGUAGE_MATH)", () => {
  it("should error when LANGUAGE_MATH program has only math (no language)", () => {
    const mockSubjects: Array<program_subject & { subject: subject }> = [
      // Core
      createMockProgramSubject("ท41101", "Thai", "CORE"),
      createMockProgramSubject("ค41101", "Math", "CORE"),
      createMockProgramSubject("ว41101", "Science", "CORE"),
      createMockProgramSubject("ส41101", "Social", "CORE"),
      createMockProgramSubject("พ41101", "PE", "CORE"),
      createMockProgramSubject("อ41101", "English", "CORE"),
      // Only math elective, no language
      createMockProgramSubject("ค41202", "Advanced Math", "ADDITIONAL", 4),
      createMockProgramSubject("กจ", "Homeroom", "ACTIVITY"),
    ];

    const result = validateProgramMOECredits(
      4,
      mockSubjects,
      "LANGUAGE_MATH",
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("ศิลป์-คำนวณ"))).toBe(true);
  });

  it("should pass when LANGUAGE_MATH program has math and language electives", () => {
    const mockSubjects: Array<program_subject & { subject: subject }> = [
      // Core
      createMockProgramSubject("ท41101", "Thai", "CORE"),
      createMockProgramSubject("ค41101", "Math", "CORE"),
      createMockProgramSubject("ว41101", "Science", "CORE"),
      createMockProgramSubject("ส41101", "Social", "CORE"),
      createMockProgramSubject("พ41101", "PE", "CORE"),
      createMockProgramSubject("อ41101", "English", "CORE"),
      // Track electives (need ≥2 of 3): Math + English + Language
      createMockProgramSubject("ค41202", "Advanced Math", "ADDITIONAL", 4),
      createMockProgramSubject("อ41202", "Advanced English", "ADDITIONAL", 3),
      createMockProgramSubject("create mock for Chinese", "Chinese", "ADDITIONAL", 3),
      createMockProgramSubject("กจ", "Homeroom", "ACTIVITY"),
    ];

    const result = validateProgramMOECredits(
      4,
      mockSubjects,
      "LANGUAGE_MATH",
    );

    expect(result.isValid).toBe(true);
  });
});
```

**Step 2: Run tests**

```bash
pnpm run test:program vitest run __test__/features/program/moe-validation.service.test.ts --grep "LANGUAGE_MATH"
```

Expected: 2 tests pass.

**Step 3: Commit**

```bash
git add __test__/features/program/moe-validation.service.test.ts
git commit -m "test: add unit tests for LANGUAGE_MATH track validation (new track)"
```

---

### Task 13: Write Unit Tests for GENERAL Track

**Files:**
- Modify: `__test__/features/program/moe-validation.service.test.ts`

**Step 1: Add test suite**

```typescript
describe("track-specific elective validation (GENERAL)", () => {
  it("should not enforce track-specific requirements for GENERAL track", () => {
    const mockSubjects: Array<program_subject & { subject: subject }> = [
      // Core only
      createMockProgramSubject("ท41101", "Thai", "CORE"),
      createMockProgramSubject("ค41101", "Math", "CORE"),
      createMockProgramSubject("ว41101", "Science", "CORE"),
      createMockProgramSubject("ส41101", "Social", "CORE"),
      createMockProgramSubject("พ41101", "PE", "CORE"),
      createMockProgramSubject("อ41101", "English", "CORE"),
      createMockProgramSubject("กจ", "Homeroom", "ACTIVITY"),
    ];

    const result = validateProgramMOECredits(
      4,
      mockSubjects,
      "GENERAL",
    );

    // Should not have track-specific errors for GENERAL
    expect(
      result.errors.some((e) =>
        e.includes("แผน") && e.includes("ขาดวิชาเพิ่มเติม")
      ),
    ).toBe(false);
  });
});
```

**Step 2: Run test**

```bash
pnpm run test:program vitest run __test__/features/program/moe-validation.service.test.ts --grep "GENERAL"
```

Expected: 1 test passes.

**Step 3: Commit**

```bash
git add __test__/features/program/moe-validation.service.test.ts
git commit -m "test: add unit tests for GENERAL track (no track-specific requirements)"
```

---

### Task 14: Write Unit Tests for Lower Secondary Track Handling

**Files:**
- Modify: `__test__/features/program/moe-validation.service.test.ts`

**Step 1: Add test suite for lower secondary**

```typescript
describe("track-specific validation for lower secondary (M1-M3)", () => {
  it("should skip track validation for M1 regardless of track", () => {
    const mockSubjects: Array<program_subject & { subject: subject }> = [
      // Core only
      createMockProgramSubject("ท11101", "Thai", "CORE"),
      createMockProgramSubject("ค11101", "Math", "CORE"),
      createMockProgramSubject("ว11101", "Science", "CORE"),
      createMockProgramSubject("ส11101", "Social", "CORE"),
      createMockProgramSubject("พ11101", "PE", "CORE"),
      createMockProgramSubject("ศ11101", "Arts", "CORE"),
      createMockProgramSubject("ง11101", "Career", "CORE"),
      createMockProgramSubject("อ11101", "English", "CORE"),
      createMockProgramSubject("กจ", "Homeroom", "ACTIVITY"),
    ];

    const result = validateProgramMOECredits(
      1, // M1
      mockSubjects,
      "SCIENCE_MATH", // Track provided but should be ignored
    );

    // Should not have track-specific errors for M1
    expect(
      result.errors.filter((e) => e.includes("แผน"))
    ).toHaveLength(0);
  });

  it("should skip track validation for M3 regardless of track", () => {
    const mockSubjects: Array<program_subject & { subject: subject }> = [
      // Same simplified structure
      createMockProgramSubject("ท31101", "Thai", "CORE"),
      createMockProgramSubject("ค31101", "Math", "CORE"),
      createMockProgramSubject("ว31101", "Science", "CORE"),
      createMockProgramSubject("ส31101", "Social", "CORE"),
      createMockProgramSubject("พ31101", "PE", "CORE"),
      createMockProgramSubject("ศ31101", "Arts", "CORE"),
      createMockProgramSubject("ง31101", "Career", "CORE"),
      createMockProgramSubject("อ31101", "English", "CORE"),
      createMockProgramSubject("กจ", "Homeroom", "ACTIVITY"),
    ];

    const result = validateProgramMOECredits(
      3, // M3
      mockSubjects,
      "LANGUAGE_ARTS",
    );

    expect(
      result.errors.filter((e) => e.includes("แผน"))
    ).toHaveLength(0);
  });
});
```

**Step 2: Run tests**

```bash
pnpm run test:program vitest run __test__/features/program/moe-validation.service.test.ts --grep "lower secondary"
```

Expected: 2 tests pass.

**Step 3: Commit**

```bash
git add __test__/features/program/moe-validation.service.test.ts
git commit -m "test: add unit tests for lower secondary track handling (M1-M3 skip track validation)"
```

---

### Task 15: Run All Program Validation Tests

**Step 1: Run full test suite for moe-validation.service**

```bash
pnpm run test:program vitest run __test__/features/program/moe-validation.service.test.ts
```

Expected: All tests pass (including new track tests + existing tests).

**Step 2: Check coverage**

```bash
pnpm run test:program vitest run __test__/features/program/moe-validation.service.test.ts --coverage
```

Expected: Track validation code has ≥80% coverage.

**Step 3: Commit**

```bash
git add __test__/features/program/moe-validation.service.test.ts
git commit -m "test: all track-specific validation unit tests passing"
```

---

### Task 16: Write MOE Standards Config Tests

**Files:**
- Modify: `__test__/moe-standards/moe-standards.test.ts`

**Step 1: Add test for LANGUAGE_MATH electives in config**

Add to the existing `getTrackElectives` test suite:

```typescript
it("should return LANGUAGE_MATH electives for language-math track (NEW)", () => {
  const electives = getTrackElectives("M4", "LANGUAGE_MATH");

  expect(electives).toHaveLength(5);
  expect(electives).toContainEqual(
    expect.objectContaining({
      subjectNameTh: "คณิตศาสตร์เพิ่มเติม",
    }),
  );
  expect(electives).toContainEqual(
    expect.objectContaining({
      subjectNameTh: "ภาษาอังกฤษเพิ่มเติม",
    }),
  );
  expect(electives).toContainEqual(
    expect.objectContaining({
      subjectNameTh: "ภาษาจีน",
    }),
  );
});

it("should return LANGUAGE_ARTS electives for language-arts track (fixed name)", () => {
  const electives = getTrackElectives("M4", "LANGUAGE_ARTS");

  expect(electives).toContainEqual(
    expect.objectContaining({
      subjectNameTh: "สังคมศึกษาเพิ่มเติม",
    }),
  );
  expect(electives).toContainEqual(
    expect.objectContaining({
      subjectNameTh: "ภาษาอังกฤษเพิ่มเติม",
    }),
  );
});
```

**Step 2: Run MOE standards tests**

```bash
pnpm run test:moe vitest run __test__/moe-standards/moe-standards.test.ts
```

Expected: All tests pass including new LANGUAGE_MATH tests.

**Step 3: Commit**

```bash
git add __test__/moe-standards/moe-standards.test.ts
git commit -m "test: add MOE config tests for LANGUAGE_MATH and verify LANGUAGE_ARTS enum fix"
```

---

### Task 17: Run Full Test Suite & Verify No Regressions

**Step 1: Run all tests**

```bash
pnpm run test
```

Expected: All existing tests + new tests pass. No regressions.

**Step 2: Check lint**

```bash
pnpm run lint
```

Expected: No lint errors.

**Step 3: Type check**

```bash
pnpm run typecheck
```

Expected: No TypeScript errors.

**Step 4: Final commit**

```bash
git add -A
git commit -m "test: all MOE validation tests passing, no regressions"
```

---

## Summary of Changes

| Component | Files Changed | Status |
|---|---|---|
| Config alignment | `src/config/moe-standards.ts` | ✓ New LANGUAGE_MATH track, fixed enums |
| Category mapper | `src/utils/moe-category-mapper.ts` | ✓ New utility for ADDITIONAL ↔ ELECTIVE |
| Credit-based validation | `src/features/program/domain/services/moe-validation.service.ts` | ✓ Track parameter + `validateTrackElectives()` |
| Lesson-based validation | `src/utils/moe-validation.ts` | ✓ Uses `input.track` field |
| Publish gateway | `src/features/config/domain/services/publish-readiness.service.ts` | ✓ Passes `program.Track` |
| Unit tests | `__test__/features/program/moe-validation.service.test.ts` | ✓ 8+ new tests (all tracks × scenarios) |
| Config tests | `__test__/moe-standards/moe-standards.test.ts` | ✓ LANGUAGE_MATH verification |

**Estimated Total Time:** 5.5–6 hours  
**Risk Level:** Medium (test coverage mitigates risk)  
**Breaking Changes:** None (track parameter optional, backward compatible)

---

## Validation Checklist Before Declaring Complete

- [ ] All 4 tracks tested (SCIENCE_MATH, LANGUAGE_MATH, LANGUAGE_ARTS, GENERAL)
- [ ] Lower secondary (M1-M3) skips track validation ✓
- [ ] SCIENCE_MATH missing science electives → error ✓
- [ ] LANGUAGE_ARTS missing language electives → error ✓
- [ ] LANGUAGE_MATH missing math + language → error ✓
- [ ] Partial coverage (e.g., 1/3 electives) → warning ✓
- [ ] Config `getTrackElectives` returns correct electives ✓
- [ ] Publish-readiness integration wired ✓
- [ ] All tests pass (unit + existing) ✓
- [ ] No lint/typecheck errors ✓
- [ ] Commits are atomic and logical ✓

---

**Next Step:** Execute this plan task-by-task in order (Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5).

For each task, run the specified commands and verify expected output before proceeding. If a test fails unexpectedly, check the implementation against the design doc before re-running.
