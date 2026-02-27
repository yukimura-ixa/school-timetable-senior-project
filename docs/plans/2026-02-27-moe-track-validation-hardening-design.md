# MOE Track-Specific Elective Validation Hardening

**Date:** 2026-02-27  
**Status:** Approved Design  
**Priority:** High (Senior Project Core)  
**Scope:** Unified MOE validation system with track-aware elective enforcement

---

## 1. Executive Summary

The current MOE compliance validation system has five critical gaps that allow invalid programs to be published:

1. **Track-specific elective validation is completely missing** — Programs for วิทย์-คณิต, ศิลป์-คำนวณ, and ศิลป์-ภาษา don't enforce their required elective subjects
2. **Prisma enum ≠ Config enum** — `LANGUAGE_ARTS` (Prisma) vs `ARTS_LANGUAGE` (Config) naming mismatch, `LANGUAGE_MATH` missing from config
3. **SubjectCategory mismatch** — Prisma uses `ADDITIONAL`, validation code expects `ELECTIVE`
4. **Publish gateway doesn't pass Track** — `checkPublishReadiness` ignores program track
5. **Two parallel validation systems** — Credit-based and lesson-based systems duplicate logic and miss rules

**Solution:** Implement unified MOE validation with track-aware elective enforcement across both systems, fix enums, and wire through publish-readiness flow.

**Expected Outcome:**
- วิทย์-คณิต programs without required science electives → **error**
- ศิลป์-ภาษา programs without language electives → **error**
- Partial track coverage (e.g., only 2/3 required electives) → **warning**
- Lower secondary (M1-M3) unaffected (no track separation at junior level)

---

## 2. Problem Analysis

### 2.1 Gap 1: Track-Aware Elective Validation Missing

**Current State:**
```typescript
// moe-validation.service.ts line 93
validateProgramMOECredits(year: number, programSubjects: Array<...>)
// Takes year but NO track parameter
```

```typescript
// moe-validation.ts line 32
export interface ProgramValidationInput {
  year: YearKey;
  track?: ProgramTrack;  // Defined but NEVER READ
  subjects: SubjectAssignment[];
}
```

```typescript
// moe-standards.ts line 507
export function getTrackElectives(year: YearKey, track: ProgramTrack): SubjectWeeklyStandard[]
// Implemented correctly but NEVER CALLED from validation
```

**Impact:** A SCIENCE_MATH program with zero Physics, Chemistry, or Biology passes MOE validation. Same for LANGUAGE_ARTS without language electives.

### 2.2 Gap 2: Enum Naming Mismatch

| Component | SCIENCE_MATH | LANGUAGE_MATH | LANGUAGE_ARTS | GENERAL |
|-----------|---|---|---|---|
| Prisma enum | ✓ | ✓ | ✓ | ✓ |
| Config type | ✓ | ✗ Missing | Name: ARTS_LANGUAGE | ✓ |
| Prisma schema | ✓ | ✓ as LANGUAGE_MATH | ✓ | ✓ |

**Problem:** `Program.Track` from DB holds `LANGUAGE_ARTS`, but `getTrackElectives()` expects `ARTS_LANGUAGE` → never matches.

### 2.3 Gap 3: SubjectCategory Enum Mismatch

- Prisma schema: `enum SubjectCategory { CORE, ADDITIONAL, ACTIVITY }`
- Validation code: Checks for `"CORE" | "ELECTIVE" | "ACTIVITY"`
- Subjects stored as `ADDITIONAL` in DB may not be recognized as electives

### 2.4 Gap 4: Publish Readiness Ignores Track

[publish-readiness.service.ts:56](src/features/config/domain/services/publish-readiness.service.ts#L56):
```typescript
const result = validateProgramMOECredits(program.Year, program.program_subject);
// program.Track available but not passed
```

Even after fixing validation, publish gate won't use track awareness unless we update this call.

### 2.5 Gap 5: Two Validation Systems

- **Credit-based** (`moe-validation.service.ts`): Checks min credit per learning area, activity presence
  - **Missing:** Track-specific electives, mandatory subject lists
  - **Used by:** `checkPublishReadiness` ✓
  - **Tests:** 34 passing (but no track coverage)

- **Lesson-based** (`moe-validation.ts`): Checks total lessons, core subject presence, per-subject hour ranges
  - **Missing:** Track-specific electives
  - **Used by:** Config tests only
  - **Tests:** 40 passing (but no track coverage)

Both systems overlap (check core subjects, activity presence) but neither enforces track electives.

---

## 3. Thai MOE 2551 Curriculum Rules for Track Electives

### 3.1 การแบ่งแผนการเรียน (ม.ปลาย เท่านั้น)

Lower secondary (M1-M3): **No track separation** — all students follow same curriculum.

Upper secondary (M4-M6): **Four tracks**

#### Track: วิทย์-คณิต (SCIENCE_MATH)

**Required Elective Groups:**
- Advanced Mathematics (คณิตศาสตร์เพิ่มเติม): 2–4 periods/week
- Physics (ฟิสิกส์): 2–3 periods/week
- Chemistry (เคมี): 2–3 periods/week
- Biology (ชีววิทยา): 2–3 periods/week
- Computer Science (optional, วิทยาการคำนวณ): 1–2 periods/week

**MOE Requirement:** Student must take at least 3 of the first 4 required subjects (Math + Science triad = mandatory, flexibility on which science electives).

#### Track: ศิลป์-คำนวณ (LANGUAGE_MATH) — **New Track, Not Yet in Config**

**Required Elective Groups:**
- Advanced Mathematics (คณิตศาสตร์เพิ่มเติม): 2–4 periods/week
- Advanced English (ภาษาอังกฤษเพิ่มเติม): 2–3 periods/week
- 3rd Foreign Language (ภาษาจีน/ญี่ปุ่น): 2–3 periods/week
- Computer/Technology (optional): 1–2 periods/week

**MOE Requirement:** At least 2 of first 3 required subjects.

#### Track: ศิลป์-ภาษา (LANGUAGE_ARTS)

**Required Elective Groups:**
- Advanced Social Studies (สังคมศึกษาเพิ่มเติม): 2–3 periods/week
- Advanced English (ภาษาอังกฤษเพิ่มเติม): 2–3 periods/week
- 3rd Foreign Language (ภาษาจีน/ญี่ปุ่น): 2–3 periods/week
- Advanced Arts (ศิลปะเพิ่มเติม, optional): 1–2 periods/week

**MOE Requirement:** At least 2 of first 3 required subjects.

#### Track: ทั่วไป (GENERAL)

**Required Elective Groups:** None — can choose any electives from any track.

---

## 4. Design: Unified MOE Validation System

### 4.1 Enum Alignment

#### Order 1: Fix Config ProgramTrack Type

**File:** `src/config/moe-standards.ts`  
**Change:** Line ~504

```typescript
// BEFORE
export type ProgramTrack = "GENERAL" | "SCIENCE_MATH" | "ARTS_LANGUAGE";

// AFTER
export type ProgramTrack = "GENERAL" | "SCIENCE_MATH" | "LANGUAGE_MATH" | "LANGUAGE_ARTS";
```

This matches Prisma enum exactly.

#### Order 2: Add LANGUAGE_MATH Electives Config

**File:** `src/config/moe-standards.ts`  
**Addition:** New constant after `ARTS_LANGUAGE_ELECTIVES` (~line 310)

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

#### Order 3: Update getTrackElectives()

**File:** `src/config/moe-standards.ts`  
**Change:** Line ~509 in `getTrackElectives()`

```typescript
// BEFORE
switch (track) {
  case "SCIENCE_MATH":
    return SCIENCE_MATH_ELECTIVES;
  case "ARTS_LANGUAGE":  // <- Wrong name
    return ARTS_LANGUAGE_ELECTIVES;
  case "GENERAL":
  default:
    return standard.electiveSubjects;
}

// AFTER
switch (track) {
  case "SCIENCE_MATH":
    return SCIENCE_MATH_ELECTIVES;
  case "LANGUAGE_MATH":  // <- NEW
    return LANGUAGE_MATH_ELECTIVES;
  case "LANGUAGE_ARTS":  // <- Fixed name
    return ARTS_LANGUAGE_ELECTIVES;
  case "GENERAL":
  default:
    return standard.electiveSubjects;
}
```

#### Order 4: Add SubjectCategory Mapper Utility

**File:** `src/utils/moe-validation.ts` (or new `src/utils/moe-mapper.ts`)  
**Addition:** New utility function

```typescript
import type { SubjectCategory } from "@/prisma/generated/client";

/**
 * Map Prisma SubjectCategory to validation category
 * Prisma uses ADDITIONAL, validation code expects ELECTIVE
 */
export function mapSubjectCategory(prismaCategory: SubjectCategory): "CORE" | "ELECTIVE" | "ACTIVITY" {
  switch (prismaCategory) {
    case "CORE":
      return "CORE";
    case "ADDITIONAL":
      return "ELECTIVE";  // Prisma ADDITIONAL = validation ELECTIVE
    case "ACTIVITY":
      return "ACTIVITY";
    default:
      return "CORE"; // Safe fallback
  }
}
```

---

### 4.2 Track-Aware Validation Logic

#### Order 5: Enhance Credit-Based Service

**File:** `src/features/program/domain/services/moe-validation.service.ts`

**Change 1:** Update function signature (line ~93)

```typescript
// BEFORE
export function validateProgramMOECredits(
  year: number,
  programSubjects: Array<program_subject & { subject: subject }>,
): ProgramValidationResult

// AFTER
export function validateProgramMOECredits(
  year: number,
  programSubjects: Array<program_subject & { subject: subject }>,
  track?: ProgramTrack,  // NEW: optional, for backward compatibility
): ProgramValidationResult
```

Add import at top:
```typescript
import type { ProgramTrack } from "@/config/moe-standards";
```

**Change 2:** Add track elective validation call in function body (after learning area checks)

In the return block of `validateProgramMOECredits`, after line ~150 (after learning area loop), add:

```typescript
// Check track-specific electives for upper secondary
const isUpperSecondary = year >= 4 && year <= 6;
if (track && isUpperSecondary && track !== "GENERAL") {
  const trackElectiveResult = validateTrackElectives(track, programSubjects);
  errors.push(...trackElectiveResult.errors);
  warnings.push(...trackElectiveResult.warnings);
}

return {
  isValid: errors.length === 0,
  totalCredits: totalCurrent,
  requiredCredits: totalRequired,
  learningAreas: learningAreaStatuses,
  errors,
  warnings,
};
```

**Change 3:** Add new function `validateTrackElectives()`

Add after `validateMandatorySubjects()` function (~line 200):

```typescript
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
  programSubjects: Array<program_subject & { subject: subject }>,
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get required elective groups for this track
  const trackElectives = getTrackElectives(yearKeyToNumeric(year) as unknown as YearKey, track);
  
  // Group electives by learning area (match by group, not exact code)
  const trackElectiveGroups = new Map<string, SubjectWeeklyStandard[]>();
  trackElectives.forEach(e => {
    if (!trackElectiveGroups.has(e.group)) {
      trackElectiveGroups.set(e.group, []);
    }
    trackElectiveGroups.get(e.group)!.push(e);
  });

  // Check which required groups are covered
  const studentElectives = programSubjects.filter(ps => 
    ps.Category === SubjectCategory.ADDITIONAL  // Prisma enum
  );
  
  const coveredGroups = new Set<string>();
  for (const [groupName, groupElectives] of trackElectiveGroups) {
    const hasGroupSubject = studentElectives.some(se => {
      // Match by learning area group (academic discipline)
      return groupElectives.some(ge => 
        ge.group === groupName && se.subject.LearningArea === mapLearningArea(groupName)
      );
    });
    if (hasGroupSubject) {
      coveredGroups.add(groupName);
    }
  }

  // Enforce track-specific minimums
  const totalRequired = trackElectiveGroups.size;
  const minimumRequired = track === "SCIENCE_MATH" ? 3 : track === "GENERAL" ? 0 : 2;
  const trackNameThai = getTRackNameThai(track);

  if (track !== "GENERAL" && coveredGroups.size < minimumRequired) {
    if (coveredGroups.size === 0) {
      errors.push(
        `${trackNameThai}: ขาดวิชาเพิ่มเติมตามแผนการเรียน (ต้องมีอย่างน้อย ${minimumRequired}/${totalRequired} กลุ่ม)`,
      );
    } else {
      warnings.push(
        `${trackNameThai}: มีวิชาเพิ่มเติมตามแผนเพียง ${coveredGroups.size}/${totalRequired} กลุ่ม (แนะนำให้ครบตามข้อกำหนด)`,
      );
    }
  }

  return { errors, warnings };
}

/**
 * Map group name to LearningArea enum for matching
 */
function mapLearningArea(group: string): LearningArea {
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
 * Get Thai name for track
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

Add imports at top:
```typescript
import { getTrackElectives } from "@/config/moe-standards";
import { mapSubjectCategory } from "@/utils/moe-mapper";
import type { ProgramTrack, YearKey } from "@/config/moe-standards";
```

#### Order 6: Update Lesson-Based Validation

**File:** `src/utils/moe-validation.ts`

**Change:** In `validateProgramStandards()` function (~line 85), after the core subject checks and before return, add:

```typescript
// Check track-specific electives for upper secondary
if (input.track && isUpperSecondary(input.year) && input.track !== "GENERAL") {
  const trackElectives = getTrackElectives(input.year, input.track);
  const electiveGroups = new Map<string, SubjectWeeklyStandard[]>();
  trackElectives.forEach(e => {
    if (!electiveGroups.has(e.group)) {
      electiveGroups.set(e.group, []);
    }
    electiveGroups.get(e.group)!.push(e);
  });

  const studentElectiveGroups = new Set(
    input.subjects
      .filter(s => s.category === "ELECTIVE")
      .map(s => s.group),
  );

  const minimumRequired = input.track === "SCIENCE_MATH" ? 3 : 2;
  const coveredCount = Array.from(studentElectiveGroups).filter(g => 
    Array.from(electiveGroups.keys()).includes(g)
  ).length;

  if (coveredCount < minimumRequired) {
    errors.push(
      `${getTrackNameThai(input.track)}: ขาดวิชาเพิ่มเติมตามแผนการเรียน`,
    );
  }
}
```

Add helper function at end of file:
```typescript
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

---

### 4.3 Publish Readiness Integration

#### Order 7: Wire Track Through Publish Gate

**File:** `src/features/config/domain/services/publish-readiness.service.ts`  
**Change:** Line ~56

```typescript
// BEFORE
const result = validateProgramMOECredits(
  program.Year,
  program.program_subject,
);

// AFTER
const result = validateProgramMOECredits(
  program.Year,
  program.program_subject,
  program.Track,  // NEW: pass track from Prisma model
);
```

**No type changes required** — `program` already has `Track: ProgramTrack` from Prisma.

---

### 4.4 UI Messaging

#### Order 8: Error Messages

No UI component changes needed. The existing `MOEValidationAlert` component will automatically display new track validation errors/warnings added to `ProgramValidationResult.errors` and `.warnings`.

**Sample error messages that will appear:**

```
หลักสูตร ม.4 (แผนวิทย์-คณิต): ขาดวิชาเพิ่มเติมตามแผนการเรียน (ต้องมี 3 ของ 4 กลุ่ม)
```

```
หลักสูตร ม.5 (แผนศิลป์-ภาษา): มีวิชาเพิ่มเติมตามแผนเพียง 1/3 กลุ่ม (แนะนำให้ครบตามข้อกำหนด)
```

---

## 5. Testing Strategy

### 5.1 Unit Tests — Track-Based Validation

**File:** `__test__/features/program/moe-validation.service.test.ts`

**New test suites:**

```typescript
describe("validateTrackElectives", () => {
  describe("SCIENCE_MATH track", () => {
    it("should pass when all required science electives present", () => {
      // Physics + Chemistry + Biology + Math Adv present
    });

    it("should pass when 3 of 4 required electives present", () => {
      // Physics + Chemistry + Bio (Math Adv missing but acceptable)
    });

    it("should error when < 3 required electives present", () => {
      // Only Physics + Chemistry → error
    });

    it("should error when ZERO science electives present", () => {
      // All core subjects, no track electives → error
    });
  });

  describe("LANGUAGE_ARTS track", () => {
    it("should pass when 2+ of 3 required electives present", () => {
      // English Adv + Chinese present
    });

    it("should warn when only 1/3 required electives present", () => {
      // Only English Adv → warning
    });

    it("should error when zero language electives present", () => {
      // Core only → error
    });
  });

  describe("LANGUAGE_MATH track (new)", () => {
    it("should pass when 2+ of 3 required electives present", () => {
      // Math Adv + English Adv
    });

    it("should error when missing language requirements", () => {
      // Only Math Adv (no language) → error
    });
  });

  describe("GENERAL track", () => {
    it("should not enforce track-specific requirements", () => {
      // Any electives pass
    });
  });

  describe("Lower secondary (M1-M3)", () => {
    it("should skip track validation regardless of track", () => {
      // M1 + SCIENCE_MATH track → no track error
    });
  });
});
```

### 5.2 Integration Tests — Publish Readiness

**File:** `__test__/features/config/publish-readiness.service.test.ts` (extend existing or create new)

```typescript
describe("checkPublishReadiness", () => {
  describe("track-aware MOE validation", () => {
    it("should fail publish when SCIENCE_MATH program lacks physics", () => {
      // Program with Math Adv + Chemistry + Biology should fail
      // because Physics is required
      expect(result.status).toBe("moe-failed");
      expect(result.issues.some(i => i.includes("ขาดวิชาเพิ่มเติม"))).toBe(true);
    });

    it("should fail publish when LANGUAGE_ARTS program lacks language electives", () => {
      // Program with core only should fail
    });

    it("should pass when track requirements met", () => {
      // Program with all track electives should pass MOE checks
    });
  });
});
```

### 5.3 Config Tests — Track Electives Data

**File:** `__test__/moe-standards/moe-standards.test.ts` (extend existing)

```typescript
describe("getTrackElectives", () => {
  it("should return SCIENCE_MATH electives for science track", () => {
    const electives = getTrackElectives("M4", "SCIENCE_MATH");
    expect(electives).toContainEqual(expect.objectContaining({ 
      subjectNameTh: "ฟิสิกส์" 
    }));
    expect(electives).toContainEqual(expect.objectContaining({ 
      subjectNameTh: "เคมี" 
    }));
  });

  it("should return LANGUAGE_MATH electives for language-math track (NEW)", () => {
    const electives = getTrackElectives("M4", "LANGUAGE_MATH");
    expect(electives).toContainEqual(expect.objectContaining({ 
      subjectNameTh: "คณิตศาสตร์เพิ่มเติม" 
    }));
    expect(electives).toContainEqual(expect.objectContaining({ 
      subjectNameTh: "ภาษาอังกฤษเพิ่มเติม" 
    }));
  });

  it("should return LANGUAGE_ARTS electives (fixed name from ARTS_LANGUAGE)", () => {
    const electives = getTrackElectives("M4", "LANGUAGE_ARTS");
    expect(electives).toContainEqual(expect.objectContaining({ 
      subjectNameTh: "สังคมศึกษาเพิ่มเติม" 
    }));
  });

  it("should return same electives for M1-M3 regardless of track", () => {
    const m1Science = getTrackElectives("M1", "SCIENCE_MATH");
    const m1Arts = getTrackElectives("M1", "LANGUAGE_ARTS");
    expect(m1Science).toEqual(m1Arts); // Lower secondary no differentiation
  });
});
```

### 5.4 Property-Based Tests

**File:** `__test__/moe-standards/moe-property-based.test.ts` (extend existing)

```typescript
describe("MOE standards property-based tests", () => {
  it("any valid SCIENCE_MATH program has ≥1 science elective", () => {
    fc.assert(
      fc.property(
        generateValidScienceMathProgram(),
        (program) => {
          const result = validateProgramMOECredits(4, program.subjects, "SCIENCE_MATH");
          assume(result.isValid); // Filter: only valid programs
          
          const hasScience = program.subjects.some(s => 
            ["ฟิสิกส์", "เคมี", "ชีววิทยา"].includes(s.subject.SubjectName)
          );
          return hasScience;
        },
      ),
    );
  });

  it("any valid LANGUAGE_ARTS program has ≥2 language-related electives", () => {
    // Similar structure...
  });
});
```

### 5.5 Negative Test Coverage Checklist

- [ ] SCIENCE_MATH with zero science electives → error
- [ ] SCIENCE_MATH with only 1 science elective → warning
- [ ] LANGUAGE_ARTS with zero language electives → error
- [ ] LANGUAGE_ARTS with only 1 language elective → warning
- [ ] LANGUAGE_MATH with only Math (no language) → error
- [ ] GENERAL track with any electives → no error
- [ ] M1 with SCIENCE_MATH track → skip track validation
- [ ] Publish fails when track electives missing
- [ ] Publish succeeds when track requirements met

---

## 6. Implementation Order

**Phase 1: Config & Setup (30 min)**
1. Fix `ProgramTrack` type in config
2. Add `LANGUAGE_MATH` electives
3. Add SubjectCategory mapper utility

**Phase 2: Credit-Based Service (1.5 hr)**
4. Add `track` parameter to `validateProgramMOECredits`
5. Implement `validateTrackElectives()` function
6. Wire into return logic

**Phase 3: Lesson-Based Validation (1 hr)**
6. Update `validateProgramStandards()` to use `track` field
7. Add track elective checking logic

**Phase 4: Publish Gateway (15 min)**
7. Pass `program.Track` through `checkPublishReadiness`

**Phase 5: Testing (2 hr)**
8. Write unit tests for all 4 tracks
9. Write integration tests for publish flow
10. Add property-based tests

**Total Estimated Time:** 5.5–6 hours

---

## 7. Backward Compatibility & Risk Mitigation

- `track` parameter in validation functions is **optional** — existing calls without it will still work
- Lower secondary (M1-M3) validation **unchanged** — only upper secondary affected
- **GENERAL track** has no mandatory electives — schools using only generic track unaffected
- Tests run in CI first — no runtime surprises

---

## 8. Validation Checklist

Before marking complete:

- [ ] All 4 tracks + General pass/fail tests written
- [ ] Publish readiness integration tests pass
- [ ] Config `getTrackElectives()` returns correct electives for all tracks
- [ ] Error messages display correctly in MOEValidationAlert
- [ ] Publish gate shows track failures
- [ ] CI passes on all test files
- [ ] No breaking changes to existing non-track validation
- [ ] Lower secondary (M1-M3) unaffected

---

## 9. Related Issues & Follow-Up

- **Enum consistency:** Consider aligning Prisma `SubjectCategory` enum (add `ELECTIVE` alias or migrate to use `ADDITIONAL` everywhere)
- **Documentation:** Update user guide with track requirements for each program type
- **E2E Coverage:** Once implementation complete, add E2E test covering full track validation journey (create program → assign electives → publish)

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-27  
**Author:** Reasoning Agent  
**Status:** Ready for Implementation
