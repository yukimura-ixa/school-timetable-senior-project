# Thai MOE Curriculum Rules – SubjectCode, Credits, Validation

This document details how the Phrasongsa Timetable must align with
**Thailand’s Basic Education Core Curriculum B.E. 2551 (A.D. 2008)
and its 2560 revision**.:contentReference[oaicite:1]{index=1}

It expands the short rules in `AGENTS.md` into more precise guidance
for SubjectCode structure, credits/hours, and validation.

---

## 1. Learning Areas & Subject Codes (รหัสวิชา)

The MOE curriculum defines 8 main learning areas:

1. ภาษาไทย (Thai language)
2. คณิตศาสตร์ (Mathematics)
3. วิทยาศาสตร์ (Science)
4. สังคมศึกษา ศาสนา และวัฒนธรรม (Social studies, religion, culture)
5. สุขศึกษาและพลศึกษา (Health & PE)
6. ศิลปะ (Arts)
7. การงานอาชีพและเทคโนโลยี (Work & technology)
8. ภาษาต่างประเทศ (Foreign languages):contentReference[oaicite:2]{index=2}

Most schools implement subject codes with a pattern such as:

- `ท21101` ภาษาไทย 1
- `ค21101` คณิตศาสตร์พื้นฐาน 1
- `ว21101` วิทยาศาสตร์ 1
- `ส21101` สังคมศึกษา 1
- `อ21101` ภาษาอังกฤษพื้นฐาน 1:contentReference[oaicite:3]{index=3}

A common structure table for **พื้นฐาน** (core) subjects:​:contentReference[oaicite:4]{index=4}

- ป.1: `ท11101`, `ค11101`, `ว11101`, `ส11101`, `พ11101`, `ศ11101`, `ง11101`, `อ11101`
- ม.1: `ท21101`, `ค21101`, `ว21101`, `ส21101`, `พ21101`, `ศ21101`, `ง21101`, `อ21101`  
  (and similar patterns for ม.2–ม.3, ม.4–ม.6, with level/faculty encoded)

### 1.1 Mapping learning area → leading Thai letter

- ภาษาไทย → `ท`
- คณิตศาสตร์ → `ค`
- วิทยาศาสตร์ → `ว`
- สังคมศึกษา ศาสนา และวัฒนธรรม → `ส`
- สุขศึกษาและพลศึกษา → `พ`
- ศิลปะ → `ศ`
- การงานอาชีพและเทคโนโลยี → `ง`
- ภาษาต่างประเทศ → `อ`:contentReference[oaicite:5]{index=5}

### 1.2 Level digit

The second digit typically encodes level:

- `1` = ประถมศึกษา (primary)
- `2` = มัธยมศึกษาตอนต้น (lower secondary)
- `3` = มัธยมศึกษาตอนปลาย (upper secondary):contentReference[oaicite:6]{index=6}

The remaining digits encode year/sequence according to school/OBEC conventions.

### 1.3 Agent rules for SubjectCode

- SubjectCode type must at least enforce a **structural pattern**:
  - Regex example: `^[ก-ฮ][1-3]\d{3,4}$` (adjust for your exact 5–6 digit form).
- When adding subjects:
  - Validate leading letter vs learning area.
  - Validate level digit vs grade.
- Seed data should mirror **real MOE-style codes**, not dummy `SUB101`.

Where precise OBEC rules differ by province/school, use the most common patterns
above and leave room for local overrides via configuration.

---

## 2. Credits & Hours (หน่วยกิต / ชั่วโมงเรียน)

The Basic Education Core Curriculum defines:

- Total **time allocation per learning area** by grade band.
- Aggregate **annual hours** over lower and upper secondary.:contentReference[oaicite:7]{index=7}

Schools implement this as:

- Each subject having:
  - hours per week (e.g. 60 hours/semester)
  - credits (e.g. 1.0 or 1.5 units):contentReference[oaicite:8]{index=8}

### 2.1 System rules

For each semester + grade:

- Sum hours / credits by:
  - learning area
  - total curriculum
- Compare to MOE-required **ranges/minimums** for that level.
- Block timetable publishing if:
  - any learning area is under-provisioned
  - total hours are outside MOE bounds.

These ranges should be encoded in configuration or seed data so they
can be updated if MOE issues revisions.

---

## 3. Validation Logic (High-Level Design)

### 3.1 SubjectCode validation

Recommended approach:

- Pure function: `validateSubjectCode(code: string, learningArea: LearningArea, level: Level)`.
- Returns rich result:
  - `{ valid: true, normalizedCode }`
  - `{ valid: false, reason, hints }`
- Use in:
  - subject creation/update APIs
  - curriculum validators
  - seed data consistency checks

### 3.2 Curriculum validation

Pure function pattern:

```ts
type CurriculumInput = {
  grade: "ม.1" | "ม.2" | ...;
  semester: "1" | "2";
  subjects: {
    subjectCode: string;
    learningArea: LearningArea;
    credits: number;
    weeklyHours: number;
  }[];
};

type CurriculumValidationResult =
  | { success: true }
  | {
      success: false;
      errors: {
        code: string;
        message: string;    // Thai user-facing text
        detail?: unknown;   // extra info for logs/tests
      }[];
    };
```

Validation steps:

Check SubjectCode structure per subject.

Aggregate credits/hours per learning area.

Compare against MOE thresholds for this grade.

Return a deterministic set of errors (no randomness, no hidden assumptions).

3.3 Testing expectations

Unit tests for:

SubjectCode patterns for each learning area & level.

Credit/hour aggregation and thresholds.

E2E tests for:

Attempting to publish a non-compliant timetable:

expect blocking message in Thai

expect no persisted “published” state.

4. Implementation Notes & TODOs

Link this doc to actual config files where MOE thresholds are stored.

Add example subject seed data per grade matching real-world codes.

Add a “compliance report” UI summarizing per-grade status before publish.

Keep this doc in sync when MOE issues official updates.
