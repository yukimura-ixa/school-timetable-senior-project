# Thai MOE Curriculum Rules – SubjectCode, Credits, Validation

Doc: how Phrasongsa Timetable align with **Thailand's Basic Education Core Curriculum B.E. 2551 (A.D. 2008) + 2560 revision**.

Expands short rules in `AGENTS.md`: SubjectCode structure, credits/hours, validation.

---

## 1. Learning Areas & Subject Codes (รหัสวิชา)

MOE curriculum: 8 learning areas:

1. ภาษาไทย (Thai language)
2. คณิตศาสตร์ (Mathematics)
3. วิทยาศาสตร์และเทคโนโลยี (Science & Technology)
4. สังคมศึกษา ศาสนา และวัฒนธรรม (Social studies, religion, culture)
5. สุขศึกษาและพลศึกษา (Health & PE)
6. ศิลปะ (Arts)
7. การงานอาชีพและเทคโนโลยี (Work & technology)
8. ภาษาต่างประเทศ (Foreign languages)

Common school code pattern:

- `ท21101` ภาษาไทย 1
- `ค21101` คณิตศาสตร์พื้นฐาน 1
- `ว21101` วิทยาศาสตร์ 1
- `ส21101` สังคมศึกษา 1
- `อ21101` ภาษาอังกฤษพื้นฐาน 1

Common structure for **พื้นฐาน** (core) subjects:

- ป.1: `ท11101`, `ค11101`, `ว11101`, `ส11101`, `พ11101`, `ศ11101`, `ง11101`, `อ11101`
- ม.1: `ท21101`, `ค21101`, `ว21101`, `ส21101`, `พ21101`, `ศ21101`, `ง21101`, `อ21101`  
  (similar for ม.2–ม.3, ม.4–ม.6, level/faculty encoded)

### 1.1 Mapping learning area → leading Thai letter

- ภาษาไทย → `ท`
- คณิตศาสตร์ → `ค`
- วิทยาศาสตร์ → `ว`
- สังคมศึกษา ศาสนา และวัฒนธรรม → `ส`
- สุขศึกษาและพลศึกษา → `พ`
- ศิลปะ → `ศ`
- การงานอาชีพและเทคโนโลยี → `ง`
- ภาษาต่างประเทศ → `อ` (English), `จ` (Chinese), `ญ` (Japanese)

### 1.2 Level digit

Second digit = level:

- `1` = ประถมศึกษา (primary)
- `2` = มัธยมศึกษาตอนต้น (lower secondary)
- `3` = มัธยมศึกษาตอนปลาย (upper secondary)

Remaining digits = year/sequence per school/OBEC conventions.

### 1.3 Agent rules for SubjectCode

- SubjectCode type must enforce **structural pattern**:
  - Regex example: `^[ก-ฮ][1-3]\d{4}$` (Thai letter + 5 digits for secondary).
- Adding subjects:
  - Validate leading letter vs learning area.
  - Validate level digit vs grade.
- Seed data mirror **real MOE-style codes**, not dummy `SUB101`.

OBEC rules differ by province/school → use common patterns above, allow local overrides via config.

---

## 2. Credits & Hours (หน่วยกิต / ชั่วโมงเรียน)

Core Curriculum defines:

- **Time allocation per learning area** by grade band.
- Aggregate **annual hours** for lower + upper secondary.

Schools implement:

- Each subject:
  - hours per week (e.g. 60 hours/semester)
  - credits (e.g. 1.0 or 1.5 units)

### 2.1 System rules

Per semester + grade:

- Sum hours/credits by:
  - learning area
  - total curriculum
- Compare to MOE **ranges/minimums** for level.
- Block timetable publishing if:
  - any learning area under-provisioned
  - total hours outside MOE bounds.

Encode ranges in config or seed data — updatable when MOE revises.

---

## 3. Validation Logic (High-Level Design)

### 3.1 SubjectCode validation

Approach:

- Pure function: `validateSubjectCode(code: string, learningArea: LearningArea, level: Level)`.
- Rich result:
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

Compare against MOE thresholds for grade.

Return deterministic errors (no randomness, no hidden assumptions).

3.3 Testing expectations

Unit tests:

SubjectCode patterns per learning area & level.

Credit/hour aggregation + thresholds.

E2E tests:

Publish attempt with non-compliant timetable:

expect blocking message in Thai

expect no persisted "published" state.

4. Implementation Notes & TODOs

Link doc to config files storing MOE thresholds.

Add example subject seed data per grade with real-world codes.

Add "compliance report" UI: per-grade status before publish.

Sync doc when MOE issues updates.

---

## 5. Seed Data Rules (MOE Full Semester)

**Canonical entrypoint**: `prisma/seed.ts`

- `SEED_MOE_FULL_SEMESTER=true` seeds full MOE-compliant semester (M.1–M.6).
- Program tracks: `SCIENCE_MATH`, `LANGUAGE_MATH`, `LANGUAGE_ARTS`, `GENERAL`.
- Seed data must use **Thai MOE subject codes** (e.g., `ท21101`, `ค21101`, `ว21101`).
- Extra foreign languages map to `FOREIGN_LANGUAGE`, may use `จ`/`ญ` prefixes.
- Computing modeled under **Science & Technology** (e.g., `ว30204`), never under Career.
- Timetable IDs: always `generateTimeslotId()` from `src/utils/timeslot-id.ts`, canonical `{SEM}-{YEAR}-{DAY}{PERIOD}` format.