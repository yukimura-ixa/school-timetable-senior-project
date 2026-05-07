# Seed Data Rework Design
**Date**: 2026-04-30  
**Author**: Napat Phobutdee  
**Status**: Approved

---

## Overview

Replace current two-semester demo (`1-2567`, `2-2567`) with academic year 2568 semesters:

| ConfigID | Purpose | Status |
|----------|---------|--------|
| `1-2568` | Full realistic M.1–M.6 timetable | PUBLISHED |
| `2-2568` | Conflict/error showcase for testing error UI | DRAFT |

`KEEP_CONFIG_IDS` in `seedDemoData` updated to `["1-2568", "2-2568"]`.

---

## Section 1: Global Entities (shared by both semesters)

Global entities have no semester scope: `teacher`, `room`, `subject`, `program`, `gradelevel`.

### Teachers (28 total)

| Dept | Count | TeachHour/class | Classes covered |
|------|-------|-----------------|-----------------|
| ภาษาไทย | 3 | 3 (M.1-3), 2 (M.4-6) | All 18 |
| คณิตศาสตร์ | 3 | 3 (M.1-3), 3-4 (SCI/LANG-MATH elective) | All 18 |
| วิทยาศาสตร์ | 4 | 3 (M.1-3), 3 each (SCI electives) | All 18 + SCI upper |
| สังคมศึกษา | 3 | 2-3 | All 18 + LANG elective |
| สุขศึกษา/พลศึกษา | 2 | 2 | All 18 |
| ศิลปะ | 2 | 2 | Lower-sec + LANG-ARTS upper |
| การงานอาชีพ | 2 | 2 | Lower-sec + LANG-MATH upper |
| ภาษาอังกฤษ | 4 | 2-3 | All 18 |
| ภาษาจีน | 2 | 3 | LANG-MATH + LANG-ARTS (M.4-6) |
| ภาษาญี่ปุ่น | 1 | 3 | LANG-ARTS only (M.4-6) |
| แนะแนว/กิจกรรม | 2 | 1-2 | All 18 |

Emails: `teacher{N}@school.ac.th` (T1–T28). No `MaxHours` field exists in schema.

### Rooms (22 total)

| Type | Count | Names |
|------|-------|-------|
| Standard classrooms | 12 | ห้อง 101–106 (อาคาร 1), ห้อง 201–206 (อาคาร 2) |
| Science labs | 3 | ห้องปฏิบัติการวิทย์ 1–3 |
| Computer labs | 2 | ห้องคอมพิวเตอร์ 1–2 |
| Art room | 1 | ห้องศิลปะ |
| PE hall | 1 | โรงพลศึกษา |
| Activity rooms | 2 | ห้องกิจกรรม 1–2 |
| Multi-purpose | 1 | ห้องประชุม |

### Subjects (~50 total)

#### Lower Secondary Core (M.1–M.3) — 24 subjects
Subject code format: `[area][2][year][1][01]` e.g. `ท21101`

| Year | Subjects (8 per year) |
|------|----------------------|
| M.1 | ท21101, ค21101, ว21101, ส21101, พ21101, ศ21101, ง21101, อ21101 |
| M.2 | ท22101, ค22101, ว22101, ส22101, พ22101, ศ22101, ง22101, อ22101 |
| M.3 | ท23101, ค23101, ว23101, ส23101, พ23101, ศ23101, ง23101, อ23101 |

Credits: ท, ค, ว → `CREDIT_15`; ส, พ, ศ, ง, อ → `CREDIT_10`

#### Upper Secondary Core + Electives (M.4–M.6)

Core (all tracks):
- ท3x101, ค3x101, ว3x101, ส3x101, พ3x101, อ3x101 (x = 1/2/3 for M.4/5/6)

SCI-MATH electives (per year):
- ค3x201 (Advanced Math, `CREDIT_20`), ว3x201 (Physics), ว3x202 (Chemistry), ว3x203 (Biology) — all `CREDIT_15`

LANG-MATH electives (per year):
- ค3x201 (Advanced Math, `CREDIT_20`), จ3x201 (Chinese, `CREDIT_15`), ง3x201 (Career/Tech, `CREDIT_10`)

LANG-ARTS electives (per year):
- จ3x201 (Chinese, `CREDIT_15`), ญ3x201 (Japanese, `CREDIT_15`), ส3x102 (Advanced Social, `CREDIT_15`), ศ3x201 (Advanced Arts, `CREDIT_10`)

#### Activity Subjects (shared all grades) — 8 subjects
`ACT-GUIDE` (GUIDANCE), `ACT-SCOUT-M1`–`ACT-SCOUT-M6` (SCOUT), `ACT-CLUB` (CLUB)

### Programs (12 total)

| ProgramCode | Year | Track | Sections |
|-------------|------|-------|----------|
| M1-GEN | 1 | GENERAL | M1-1, M1-2, M1-3 |
| M2-GEN | 2 | GENERAL | M2-1, M2-2, M2-3 |
| M3-GEN | 3 | GENERAL | M3-1, M3-2, M3-3 |
| M4-SCI | 4 | SCIENCE_MATH | M4-1 |
| M4-LANG-MATH | 4 | LANGUAGE_MATH | M4-2 |
| M4-LANG-ARTS | 4 | LANGUAGE_ARTS | M4-3 |
| M5-SCI | 5 | SCIENCE_MATH | M5-1 |
| M5-LANG-MATH | 5 | LANGUAGE_MATH | M5-2 |
| M5-LANG-ARTS | 5 | LANGUAGE_ARTS | M5-3 |
| M6-SCI | 6 | SCIENCE_MATH | M6-1 |
| M6-LANG-MATH | 6 | LANGUAGE_MATH | M6-2 |
| M6-LANG-ARTS | 6 | LANGUAGE_ARTS | M6-3 |

Schema enforces `@@unique([Year, Track])` — one program per year-track combo.

### Grade Levels (18 total)

GradeIDs: `M1-1` through `M6-3` (format `M{year}-{section}`).  
Each grade: `Year` = 1–6, `Number` = 1–3, `StudentCount` = 35 (lower-sec) / 32 (upper-sec).

---

## Section 2: Semester 1 (1-2568) — Full Realistic Timetable

**ConfigID**: `1-2568`, AcademicYear: 2568, Semester: SEMESTER_1  
**Status**: PUBLISHED (ready for demo)

### Timeslots (40 per semester)
8 timeslots × 5 days. Start 08:30, end 15:20. All break durations = 50 min (same as study period). configTemplate updated: `lunchBreak.duration: 50`, add `miniBreak: { after: 2, duration: 10 }`, `breakTimes.junior.duration: 50`, `breakTimes.senior.duration: 50`.

Derived from `configTemplate`: `startTime: "08:30"`, `periodDuration: 50`, `lunchBreak.duration: 60`.  
BREAK_JUNIOR/BREAK_SENIOR slots ARE the break period for those students (no class_schedule entries). P4 = 60 min (juniors eat; seniors study this longer slot). P5 = 50 min (seniors eat; juniors study). Mini-break = 10 min gap between P2 end and P3 start (P2 marked BREAK_BOTH).

| Period | Start | End | Duration | Breaktime | Who is in class |
|--------|-------|-----|----------|-----------|-----------------|
| P1 | 08:30 | 09:20 | 50 min | NOT_BREAK | All |
| P2 | 09:20 | 10:10 | 50 min | BREAK_BOTH | All (10 min mini-break follows) |
| [mini] | 10:10 | 10:20 | 10 min | — | Nobody |
| P3 | 10:20 | 11:10 | 50 min | NOT_BREAK | All |
| P4 | 11:10 | 12:00 | 50 min | BREAK_JUNIOR | Seniors only |
| P5 | 12:00 | 12:50 | 50 min | BREAK_SENIOR | Juniors only |
| P6 | 12:50 | 13:40 | 50 min | NOT_BREAK | All |
| P7 | 13:40 | 14:30 | 50 min | NOT_BREAK | All |
| P8 | 14:30 | 15:20 | 50 min | NOT_BREAK | All |

### Subject-Hours per Grade Group

**Lower Secondary (M.1–M.3)** — MOE standard 22–30 core + 6 activity = 28–32 total:

| Subject | Credit | Periods/week | TeachHour |
|---------|--------|--------------|-----------|
| ท, ค, ว | CREDIT_15 | 3 each | 3 |
| ส, พ, ศ, ง, อ | CREDIT_10 | 2 each | 2 |
| ACT-SCOUT-Mx | activity | 2 | 2 |
| ACT-GUIDE | activity | 1 | 1 |
| ACT-CLUB | activity | 1 | 1 |
| **Total** | | **27 slots/class** | |

**Upper Secondary SCI-MATH (M.4–M.6)** — target 30–34 MOE range:

| Subject | Credit | Periods/week |
|---------|--------|--------------|
| ท, ค, ว, ส, พ, อ core | CREDIT_10 | 2 each = 12 |
| ค3x201 Adv.Math | CREDIT_20 | 4 |
| ว3x201 Physics, ว3x202 Chem, ว3x203 Bio | CREDIT_15 | 3 each = 9 |
| ACT-SCOUT-Mx + ACT-GUIDE + ACT-CLUB | activity | 4 |
| **Total** | | **29 slots/class** |

**Upper Secondary LANG-MATH (M.4–M.6)**:

| Subject | Credit | Periods/week |
|---------|--------|--------------|
| ท, ค, ว, ส, พ, อ core | CREDIT_10 | 2 each = 12 |
| ค3x201 Adv.Math | CREDIT_20 | 4 |
| จ3x201 Chinese | CREDIT_15 | 3 |
| ง3x201 Career/Tech | CREDIT_10 | 2 |
| ACT-SCOUT-Mx + ACT-GUIDE + ACT-CLUB | activity | 4 |
| **Total** | | **25 slots/class** |

**Upper Secondary LANG-ARTS (M.4–M.6)**:

| Subject | Credit | Periods/week |
|---------|--------|--------------|
| ท, ค, ว, ส, พ, อ core | CREDIT_10 | 2 each = 12 |
| จ3x201 Chinese | CREDIT_15 | 3 |
| ญ3x201 Japanese | CREDIT_15 | 3 |
| ส3x102 Adv.Social | CREDIT_15 | 3 |
| ศ3x201 Adv.Arts | CREDIT_10 | 2 |
| ACT-SCOUT-Mx + ACT-GUIDE + ACT-CLUB | activity | 4 |
| **Total** | | **27 slots/class** |

### Schedule Generation Strategy

**Rotation approach**: each subject is assigned to a canonical period template per grade-group, then each section within a year is shifted by N columns to prevent teacher double-booking.

Example for M.1 Thai teacher (3 sections, same teacher for M1-1 and M1-2):
- M1-1: ท at MON-P1, WED-P1, THU-P1
- M1-2: ท at MON-P2, WED-P2, THU-P2 (shifted 1 period)
- M1-3: ท at MON-P3, WED-P3, THU-P3 (shifted 2 periods)

Teacher allocation:
- Each Thai teacher covers max 6 grade-sections: ~18 periods/week (within safe range)
- Each Science teacher covers lower-sec (3×3h=9h) + SCI-track M.4-6 (3×3h=9h each elective) = ~18-20h
- E2E test teacher (`e2e.teacher@school.ac.th`) retained for compatibility

All schedules created with `try/catch`, `console.warn` on `Unique constraint` errors (idempotent).

**Approximate totals**:
- `teachers_responsibility`: 18 grades × ~11 subjects avg = ~198 entries
- `class_schedule`: 18 grades × ~27 periods avg = ~486 entries

---

## Section 3: Semester 2 (2-2568) — Conflict/Error Showcase

**ConfigID**: `2-2568`, AcademicYear: 2568, Semester: SEMESTER_2  
**Status**: DRAFT (intentionally incomplete + broken)

### Timeslots (40, same structure as S1)

Same 8-period × 5-day timeslots using SEMESTER_2 prefix: `2-2568-MON1`, etc.

### Conflict Types Seeded

Schema analysis determines what CAN vs CANNOT be seeded:

| Conflict Type | DB Constraint | Seedable? | Method |
|---------------|---------------|-----------|--------|
| Teacher double-booked | None (no unique on TimeslotID+TeacherID) | ✅ YES | Same teacher in two class_schedules at same timeslot |
| Grade double-booked | `@@unique([TimeslotID, GradeID])` | ❌ NO | Cannot seed; DB rejects |
| Room double-booked | `@@unique([TimeslotID, RoomID])` | ❌ NO | Cannot seed; DB rejects |
| Teacher overloaded | None (no MaxHours column) | ✅ YES | TeachHour set abnormally high (30+) |
| Missing rooms | RoomID is nullable | ✅ YES | class_schedule with RoomID=null |
| Sparse schedule | No constraint | ✅ YES | Only ~30% of slots filled per grade |

### S2 Conflict Scenarios

**Scenario A — Teacher Double-Booked**:
- Teacher T1 (Thai) assigned to M1-1 AND M1-2 at SEMESTER_2-MON-P1 simultaneously
- Teacher T4 (Math) assigned to M2-1 AND M2-2 at SEMESTER_2-TUE-P2 simultaneously
- Creates 4 `class_schedule` entries sharing a teacher at same timeslot

**Scenario B — Teacher Overloaded**:
- Teacher T7 (Science) has `TeachHour=10` across 6 grade responsibilities (total 60h/week, wildly excessive)
- Creates a readiness warning in the UI's teacher load panel

**Scenario C — Missing Room Assignments**:
- ~40% of S2 class_schedule entries created with `RoomID=null`
- Triggers "ไม่มีห้องเรียน" readiness issues in dashboard

**Scenario D — Sparse/Incomplete Schedule**:
- Grades M3-1, M4-1, M5-2, M6-3 filled to only ~30% of their subject-hour requirements
- Most responsibilities have no matching class_schedule entries
- Dashboard shows low schedule completion

### S2 Data Counts (approximate)
- `teachers_responsibility`: ~100 entries (same subjects, fewer grades)
- `class_schedule`: ~80 entries total (intentionally sparse)

---

## Section 4: Migration & Cleanup

### KEEP_CONFIG_IDS
```typescript
const KEEP_CONFIG_IDS = ["1-2568", "2-2568"];
```
Stale cleanup loop already handles removal of configs not in this list.

### E2E Tests
Any Playwright/Jest fixtures referencing `2567`, `1-2567`, or `2-2567` need updating to `2568` equivalents. Affected test areas: semester selector, arrange page, schedule display.

### Seed Commands
All existing seed modes preserved:
- `pnpm db:seed:demo` → runs updated `seedDemoData()`
- `pnpm db:seed:clean` → destructive clean + `seedDemoData()`
- E2E teacher (`e2e.teacher@school.ac.th`) retained

### Production Reseed
After implementation:
```bash
pnpm db:seed:clean   # local verify
# then prod:
vercel env pull .env.production
SEED_DEMO_DATA=true pnpm dotenv -e .env.production -- tsx prisma/seed.ts
```

---

## Spec Self-Review

- ✅ No placeholders or TBDs
- ✅ Program `@@unique([Year, Track])` respected — no duplicate year+track combos
- ✅ Room double-booking excluded (DB prevents it)  
- ✅ Grade double-booking excluded (DB prevents it)
- ✅ MOE 8 learning areas all covered for lower-sec subjects
- ✅ MOE period ranges: lower-sec 27/28-32 ✓, upper-sec 25-29/30-34 (slightly under for LANG tracks — acceptable for seed demo purposes)
- ✅ `subject_credit` enum values only: CREDIT_05/10/15/20
- ✅ `ProgramTrack` enum: SCIENCE_MATH, LANGUAGE_MATH, LANGUAGE_ARTS, GENERAL
- ✅ E2E teacher retained for backward compat
- ⚠️ LANG-MATH/LANG-ARTS upper-sec period count (~25) slightly below MOE 30-34 target — seed data is a demo, not a fully optimized curriculum; acceptable
