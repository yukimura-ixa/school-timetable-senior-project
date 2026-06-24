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

> **Source / version**: โครงสร้างเวลาเรียน, หลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน **พ.ศ. 2551**,
> consolidated with the **ฉบับปรับปรุง พ.ศ. 2560** resource page — OBEC news 75
> (`https://academic.obec.go.th/web/news/view/75`). The **2551 framework totals below are
> unchanged by the 2560 revision**; 2560 changed learning-area *content/structure* (revised
> มาตรฐาน/ตัวชี้วัด for คณิตศาสตร์ / วิทยาศาสตร์ / ภูมิศาสตร์, and สพฐ. order 921/2560 moved
> **เทคโนโลยี out of การงานอาชีพ→วิทยาศาสตร์และเทคโนโลยี**, renaming area #7 to **การงานอาชีพ**),
> not the time/credit framework. See [[moe-and-identifiers]] and §5 (computing under Science).

### 2.0 Official time structure (โครงสร้างเวลาเรียน)

**Credit rule (secondary):** `40 ชั่วโมง/ภาคเรียน = 1 หน่วยกิต`.

**มัธยมศึกษาตอนต้น (ม.1–ม.3) — per year:**

| Component | Hours | Credits |
| --------- | ----- | ------- |
| รายวิชาพื้นฐาน (8 learning areas) | 880 / yr | 22 / yr |
| กิจกรรมพัฒนาผู้เรียน | 120 / yr | — (ผ/มผ) |
| รายวิชา/กิจกรรมเพิ่มเติม (school-decided) | ≥ 200 / yr | varies |
| **รวม (total)** | **≥ 1,200 / yr** | |

**มัธยมศึกษาตอนปลาย (ม.4–ม.6) — total over 3 years:**

| Component | Hours (3 yrs) | Credits |
| --------- | ------------- | ------- |
| รายวิชาพื้นฐาน | 1,640 | 41 |
| กิจกรรมพัฒนาผู้เรียน | 360 *(≈120/yr, **not** 360/yr)* | — (ผ/มผ) |
| รายวิชา/กิจกรรมเพิ่มเติม (track electives) | ≥ 1,600 | ≥ 40 |
| **รวม (total)** | **≥ 3,600** | |

Schools implement each subject as **weekly periods (คาบ)** that sum to the per-area hour budget,
carrying **credits (e.g. 1.0 / 1.5 units)** derived from the 40-hour rule. The "เพิ่มเติม" rows are
where program **tracks** (วิทย์-คณิต / ศิลป์-ภาษา / ทั่วไป) differentiate.

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

---

## 6. กิจกรรมพัฒนาผู้เรียน (Learner Development Activities)

The Core Curriculum has **two mandatory pillars**: the 8 learning areas (§1) **and**
กิจกรรมพัฒนาผู้เรียน. Activities are **not credit-bearing** and **not part of the 8 areas**, but
are **required for promotion/graduation** — assessed **ผ (ผ่าน) / มผ (ไม่ผ่าน)** (pass/fail) on
participation time + objectives, not grades. Source: OBEC news 75 (2551 framework, unchanged by 2560).

### 6.1 Three categories (3 ลักษณะ)

1. **กิจกรรมแนะแนว** (Guidance) — self-knowledge, decision-making, study & career planning. All students.
2. **กิจกรรมนักเรียน** (Student activities), two sub-kinds:
   - **Uniformed**: ลูกเสือ, เนตรนารี, ยุวกาชาด, ผู้บำเพ็ญประโยชน์, and **นักศึกษาวิชาทหาร (นศท.)** at upper secondary.
   - **ชุมนุม / ชมรม** (clubs) — student-interest-driven.
3. **กิจกรรมเพื่อสังคมและสาธารณประโยชน์** (Social & public-service / volunteer) — บำเพ็ญประโยชน์, จิตสาธารณะ.

### 6.2 Hour allocation (verified)

| Level | Total activities | of which เพื่อสังคมฯ (embedded) |
| ----- | ---------------- | ------------------------------- |
| ม.ต้น (ม.1–3) | **120 hrs / year** | 45 hrs over 3 yrs |
| ม.ปลาย (ม.4–6) | **360 hrs over 3 yrs** (≈120/yr) | 60 hrs over 3 yrs |
| *(ป.1–6, reference)* | *120 hrs / year* | *60 hrs over 6 yrs* |

The เพื่อสังคมฯ quota is **inside** the 120/yr budget (not added on top); schools commonly fulfil it
through the other two categories (e.g. a club's volunteer project).

### 6.3 Mapping to the timetable platform (code bridge)

120 hrs/yr over a ~40-week academic year ≈ **3 periods (คาบ)/week** of activity time. Today
`src/config/moe-standards.ts` → `COMMON_ACTIVITIES` models only:

- **ชั้นเรียน** (Homeroom, `HR`) — 1/wk — administrative, **not** one of the 3 official categories.
- **ชุมนุม** (Club, `CLUB`) — 1–2/wk — covers part of category 2 only.

**Gap vs MOE:** กิจกรรมแนะแนว (category 1), the uniformed นักเรียน activities (ลูกเสือ ฯลฯ, category 2),
and กิจกรรมเพื่อสังคมฯ (category 3) are **not represented** in standards/validation. Activity coverage
is therefore narrower than the curriculum mandates.

**Follow-up (not done here):** extend `COMMON_ACTIVITIES` with แนะแนว + a uniformed-activity slot, and
have program/timetable validation surface the activity pillar (ผ/มผ, ~3 periods/wk) rather than only
homeroom + club. Tracked: beads `school-timetable-senior-project-9vz`.

---

## 7. Program tracks (แผนการเรียน ม.ปลาย) — cross-check

MOE 2551 **does not prescribe tracks**. แผนการเรียน are a **school-level** construct at upper
secondary, realized through the "รายวิชาเพิ่มเติม" budget (§2: ≥1,600 hrs / 3 yrs). This section
cross-checks the platform's `ProgramTrack` model (`src/config/moe-standards.ts`) against common
Thai practice (see Sources at bottom).

### 7.1 Track taxonomy (verified)

| `ProgramTrack` | แผนการเรียน | Real-world? |
| -------------- | ----------- | ----------- |
| `GENERAL` | ทั่วไป / no specialization | ✓ catch-all (also absorbs ศิลป์-สังคม / ศิลป์-ทั่วไป) |
| `SCIENCE_MATH` | วิทย์–คณิต | ✓ canonical |
| `LANGUAGE_MATH` | ศิลป์–คำนวณ | ✓ canonical |
| `LANGUAGE_ARTS` | ศิลป์–ภาษา | ✓ canonical (but see 7.2) |

Reliable sources list **3 main tracks** — วิทย์-คณิต, ศิลป์-คำนวณ, ศิลป์-ภาษา — plus secondary
variants **ศิลป์-สังคม** and **ศิลป์-ทั่วไป** which the platform does not model separately.

### 7.2 Elective composition cross-check

| Track | Code electives | Verdict |
| ----- | -------------- | ------- |
| `SCIENCE_MATH` | คณิตเพิ่มเติม, ฟิสิกส์, เคมี, ชีววิทยา, วิทยาการคำนวณ | ✓ **exact** — canonical ฟิสิกส์/เคมี/ชีววิทยา + คณิตเพิ่มเติม archetype |
| `LANGUAGE_MATH` | คณิตเพิ่มเติม, อังกฤษเพิ่มเติม, จีน, ญี่ปุ่น, วิทยาการคำนวณ | ✓ **match** — "คณิตเพิ่มเติม + ภาษา, no lab science" |
| `LANGUAGE_ARTS` | สังคมเพิ่มเติม, อังกฤษเพิ่มเติม, จีน, ญี่ปุ่น, ศิลปะเพิ่มเติม | △ **partial** — real ศิลป์-ภาษา centers on อังกฤษเข้ม + ภาษาที่ 3 (จีน/ญี่ปุ่น/ฝรั่งเศส/เกาหลี/เยอรมัน). สังคมเพิ่มเติม leans ศิลป์-สังคม, ศิลปะเพิ่มเติม leans ศิลป์-ทั่วไป → generic "arts" blend, not pure ศิลป์-ภาษา; 3rd-language choice limited to จีน/ญี่ปุ่น |

### 7.3 Discrepancies (actionable)

1. **Naming**: enum value `LANGUAGE_ARTS` vs constant `ARTS_LANGUAGE_ELECTIVES` — mismatched
   (mapped in `getTrackElectives`, not a bug, but a smell).
2. **Stale doc**: `docs/MOE_STANDARDS_IMPLEMENTATION.md` lists track `ARTS_LANGUAGE` (wrong) and
   omits `LANGUAGE_MATH`; trust the enum in `src/config/moe-standards.ts` as source of truth.
3. **`UPPER_SECONDARY_CORE` models only 6 of 8 areas** (TH/MA/SC/SS/PE/EN) — ศิลปะ + การงานอาชีพ
   dropped from core, though MOE ม.ปลาย พื้นฐาน keeps all 8 at low hours.
4. **`LANGUAGE_ARTS` composition** vs pure ศิลป์-ภาษา (see 7.2) — consider a 3rd-language slot
   over ศิลปะเพิ่มเติม, or split out ศิลป์-สังคม.

Tracked: beads `school-timetable-senior-project-h9t`.

### Sources

- [SmartMathPro — เลือกแผนการเรียน ม.ปลาย](https://www.smartmathpro.com/article/highschool-program/)
- [TruePlookpanya — แผนการเรียน ม.ปลาย มีสายอะไรบ้าง](https://www.trueplookpanya.com/knowledge/content/92354)
- [รักวิทยา — ม.4 วิทยาศาสตร์-คณิตศาสตร์](https://www.rakwittaya.ac.th/sci-math.html)
- [สสวท. (IPST) — หลักสูตรฉบับปรับปรุง 2560](https://www.ipst.ac.th/curriculum)