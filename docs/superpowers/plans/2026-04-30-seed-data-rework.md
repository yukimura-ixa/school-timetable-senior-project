# Seed Data Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `seedDemoData()` in `prisma/seed.ts` with 2568 academic year data: S1 (`1-2568`) = full M.1–M.6 realistic timetable (PUBLISHED), S2 (`2-2568`) = conflict/error showcase (DRAFT). Then clean-reseed prod.

**Architecture:** Single function `seedDemoData()` (lines 223–1141) replaced in-place. Data constants defined at top of function. S1 uses day+period rotation to place 18 grades × ~23 slots without teacher conflicts. S2 intentionally seeds teacher double-booking and null rooms. E2E fixture updated to reference 2568.

**Tech Stack:** TypeScript, Prisma ORM, PostgreSQL, `withRetry()` wrapper (lines 103–131, unchanged)

**Spec:** `docs/superpowers/specs/2026-04-30-seed-data-rework-design.md`

---

## File Map

| Action | File |
|--------|------|
| Modify | `prisma/seed.ts` — replace `seedDemoData()` lines 223–1141 |
| Modify | `e2e/fixtures/seed-data.fixture.ts` — update 2567 → 2568 references |

---

## Task 1: Replace KEEP_CONFIG_IDS and configTemplate

**Files:**
- Modify: `prisma/seed.ts:229` (KEEP_CONFIG_IDS inside seedDemoData)
- Modify: `prisma/seed.ts` (configTemplate object)

- [ ] **Step 1: Locate both constants in seedDemoData()**

In `seedDemoData()` at line 223, find:
```typescript
const KEEP_CONFIG_IDS = ["1-2567", "2-2567"];
```
and:
```typescript
const configTemplate = {
  periodsPerDay: 8,
  startTime: "08:30",
  periodDuration: 50,
  schoolDays: ["MON", "TUE", "WED", "THU", "FRI"],
  lunchBreak: { after: 4, duration: 60 },
  breakTimes: { junior: { after: 4 }, senior: { after: 5 } },
};
```

- [ ] **Step 2: Replace both**

New values:
```typescript
const KEEP_CONFIG_IDS = ["1-2568", "2-2568"];
```
```typescript
const configTemplate = {
  periodsPerDay: 8,
  startTime: "08:30",
  periodDuration: 50,
  schoolDays: ["MON", "TUE", "WED", "THU", "FRI"],
  miniBreak: { after: 2, duration: 10 },
  lunchBreak: { after: 4, duration: 50 },
  breakTimes: { junior: { after: 4, duration: 50 }, senior: { after: 5, duration: 50 } },
};
```

- [ ] **Step 3: Commit**

```bash
git add prisma/seed.ts
git commit -m "chore(seed): update KEEP_CONFIG_IDS to 2568, fix configTemplate break durations"
```

---

## Task 2: Define all subjects (~77 entries)

**Files:**
- Modify: `prisma/seed.ts` — replace `demoSubjects` array inside `seedDemoData()`

- [ ] **Step 1: Replace demoSubjects with full ALL_SUBJECTS array**

Replace the `demoSubjects` block (after KEEP_CONFIG_IDS) with:

```typescript
// ── Subjects ──────────────────────────────────────────────────────────
type SubjectDef = {
  code: string;
  name: string;
  credit: subject_credit;
  learningArea?: LearningArea | null;
  activityType?: ActivityType | null;
  category: SubjectCategory;
};

const ALL_SUBJECTS: SubjectDef[] = [
  // Lower Secondary Core (M.1–M.3) — 24 subjects
  { code: "ท21101", name: "ภาษาไทย พื้นฐาน ม.1", credit: "CREDIT_15", learningArea: "THAI", category: "CORE" },
  { code: "ค21101", name: "คณิตศาสตร์ พื้นฐาน ม.1", credit: "CREDIT_15", learningArea: "MATHEMATICS", category: "CORE" },
  { code: "ว21101", name: "วิทยาศาสตร์และเทคโนโลยี ม.1", credit: "CREDIT_15", learningArea: "SCIENCE", category: "CORE" },
  { code: "ส21101", name: "สังคมศึกษา ศาสนาและวัฒนธรรม ม.1", credit: "CREDIT_10", learningArea: "SOCIAL", category: "CORE" },
  { code: "พ21101", name: "สุขศึกษาและพลศึกษา ม.1", credit: "CREDIT_10", learningArea: "HEALTH_PE", category: "CORE" },
  { code: "ศ21101", name: "ศิลปะ ม.1", credit: "CREDIT_10", learningArea: "ARTS", category: "CORE" },
  { code: "ง21101", name: "การงานอาชีพ ม.1", credit: "CREDIT_10", learningArea: "CAREER", category: "CORE" },
  { code: "อ21101", name: "ภาษาอังกฤษ พื้นฐาน ม.1", credit: "CREDIT_10", learningArea: "FOREIGN_LANGUAGE", category: "CORE" },

  { code: "ท22101", name: "ภาษาไทย พื้นฐาน ม.2", credit: "CREDIT_15", learningArea: "THAI", category: "CORE" },
  { code: "ค22101", name: "คณิตศาสตร์ พื้นฐาน ม.2", credit: "CREDIT_15", learningArea: "MATHEMATICS", category: "CORE" },
  { code: "ว22101", name: "วิทยาศาสตร์และเทคโนโลยี ม.2", credit: "CREDIT_15", learningArea: "SCIENCE", category: "CORE" },
  { code: "ส22101", name: "สังคมศึกษา ศาสนาและวัฒนธรรม ม.2", credit: "CREDIT_10", learningArea: "SOCIAL", category: "CORE" },
  { code: "พ22101", name: "สุขศึกษาและพลศึกษา ม.2", credit: "CREDIT_10", learningArea: "HEALTH_PE", category: "CORE" },
  { code: "ศ22101", name: "ศิลปะ ม.2", credit: "CREDIT_10", learningArea: "ARTS", category: "CORE" },
  { code: "ง22101", name: "การงานอาชีพ ม.2", credit: "CREDIT_10", learningArea: "CAREER", category: "CORE" },
  { code: "อ22101", name: "ภาษาอังกฤษ พื้นฐาน ม.2", credit: "CREDIT_10", learningArea: "FOREIGN_LANGUAGE", category: "CORE" },

  { code: "ท23101", name: "ภาษาไทย พื้นฐาน ม.3", credit: "CREDIT_15", learningArea: "THAI", category: "CORE" },
  { code: "ค23101", name: "คณิตศาสตร์ พื้นฐาน ม.3", credit: "CREDIT_15", learningArea: "MATHEMATICS", category: "CORE" },
  { code: "ว23101", name: "วิทยาศาสตร์และเทคโนโลยี ม.3", credit: "CREDIT_15", learningArea: "SCIENCE", category: "CORE" },
  { code: "ส23101", name: "สังคมศึกษา ศาสนาและวัฒนธรรม ม.3", credit: "CREDIT_10", learningArea: "SOCIAL", category: "CORE" },
  { code: "พ23101", name: "สุขศึกษาและพลศึกษา ม.3", credit: "CREDIT_10", learningArea: "HEALTH_PE", category: "CORE" },
  { code: "ศ23101", name: "ศิลปะ ม.3", credit: "CREDIT_10", learningArea: "ARTS", category: "CORE" },
  { code: "ง23101", name: "การงานอาชีพ ม.3", credit: "CREDIT_10", learningArea: "CAREER", category: "CORE" },
  { code: "อ23101", name: "ภาษาอังกฤษ พื้นฐาน ม.3", credit: "CREDIT_10", learningArea: "FOREIGN_LANGUAGE", category: "CORE" },

  // Upper Secondary Core (M.4–M.6, all tracks) — 18 subjects
  { code: "ท31101", name: "ภาษาไทย พื้นฐาน ม.4", credit: "CREDIT_10", learningArea: "THAI", category: "CORE" },
  { code: "ค31101", name: "คณิตศาสตร์ พื้นฐาน ม.4", credit: "CREDIT_10", learningArea: "MATHEMATICS", category: "CORE" },
  { code: "ว31101", name: "วิทยาศาสตร์และเทคโนโลยี ม.4", credit: "CREDIT_10", learningArea: "SCIENCE", category: "CORE" },
  { code: "ส31101", name: "สังคมศึกษา ศาสนาและวัฒนธรรม ม.4", credit: "CREDIT_10", learningArea: "SOCIAL", category: "CORE" },
  { code: "พ31101", name: "สุขศึกษาและพลศึกษา ม.4", credit: "CREDIT_10", learningArea: "HEALTH_PE", category: "CORE" },
  { code: "อ31101", name: "ภาษาอังกฤษ พื้นฐาน ม.4", credit: "CREDIT_10", learningArea: "FOREIGN_LANGUAGE", category: "CORE" },

  { code: "ท32101", name: "ภาษาไทย พื้นฐาน ม.5", credit: "CREDIT_10", learningArea: "THAI", category: "CORE" },
  { code: "ค32101", name: "คณิตศาสตร์ พื้นฐาน ม.5", credit: "CREDIT_10", learningArea: "MATHEMATICS", category: "CORE" },
  { code: "ว32101", name: "วิทยาศาสตร์และเทคโนโลยี ม.5", credit: "CREDIT_10", learningArea: "SCIENCE", category: "CORE" },
  { code: "ส32101", name: "สังคมศึกษา ศาสนาและวัฒนธรรม ม.5", credit: "CREDIT_10", learningArea: "SOCIAL", category: "CORE" },
  { code: "พ32101", name: "สุขศึกษาและพลศึกษา ม.5", credit: "CREDIT_10", learningArea: "HEALTH_PE", category: "CORE" },
  { code: "อ32101", name: "ภาษาอังกฤษ พื้นฐาน ม.5", credit: "CREDIT_10", learningArea: "FOREIGN_LANGUAGE", category: "CORE" },

  { code: "ท33101", name: "ภาษาไทย พื้นฐาน ม.6", credit: "CREDIT_10", learningArea: "THAI", category: "CORE" },
  { code: "ค33101", name: "คณิตศาสตร์ พื้นฐาน ม.6", credit: "CREDIT_10", learningArea: "MATHEMATICS", category: "CORE" },
  { code: "ว33101", name: "วิทยาศาสตร์และเทคโนโลยี ม.6", credit: "CREDIT_10", learningArea: "SCIENCE", category: "CORE" },
  { code: "ส33101", name: "สังคมศึกษา ศาสนาและวัฒนธรรม ม.6", credit: "CREDIT_10", learningArea: "SOCIAL", category: "CORE" },
  { code: "พ33101", name: "สุขศึกษาและพลศึกษา ม.6", credit: "CREDIT_10", learningArea: "HEALTH_PE", category: "CORE" },
  { code: "อ33101", name: "ภาษาอังกฤษ พื้นฐาน ม.6", credit: "CREDIT_10", learningArea: "FOREIGN_LANGUAGE", category: "CORE" },

  // SCI-MATH electives — 12 subjects (ค shared with LANG-MATH)
  { code: "ค31201", name: "คณิตศาสตร์เพิ่มเติม ม.4", credit: "CREDIT_20", learningArea: "MATHEMATICS", category: "ADDITIONAL" },
  { code: "ว31201", name: "ฟิสิกส์ ม.4", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
  { code: "ว31202", name: "เคมี ม.4", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
  { code: "ว31203", name: "ชีววิทยา ม.4", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
  { code: "ค32201", name: "คณิตศาสตร์เพิ่มเติม ม.5", credit: "CREDIT_20", learningArea: "MATHEMATICS", category: "ADDITIONAL" },
  { code: "ว32201", name: "ฟิสิกส์ ม.5", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
  { code: "ว32202", name: "เคมี ม.5", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
  { code: "ว32203", name: "ชีววิทยา ม.5", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
  { code: "ค33201", name: "คณิตศาสตร์เพิ่มเติม ม.6", credit: "CREDIT_20", learningArea: "MATHEMATICS", category: "ADDITIONAL" },
  { code: "ว33201", name: "ฟิสิกส์ ม.6", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
  { code: "ว33202", name: "เคมี ม.6", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
  { code: "ว33203", name: "ชีววิทยา ม.6", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },

  // LANG-MATH / LANG-ARTS shared: Chinese — 3 subjects
  { code: "จ31201", name: "ภาษาจีน ม.4", credit: "CREDIT_15", learningArea: "FOREIGN_LANGUAGE", category: "ADDITIONAL" },
  { code: "จ32201", name: "ภาษาจีน ม.5", credit: "CREDIT_15", learningArea: "FOREIGN_LANGUAGE", category: "ADDITIONAL" },
  { code: "จ33201", name: "ภาษาจีน ม.6", credit: "CREDIT_15", learningArea: "FOREIGN_LANGUAGE", category: "ADDITIONAL" },

  // LANG-MATH only: Career/Tech — 3 subjects
  { code: "ง31201", name: "การงานอาชีพและเทคโนโลยี ม.4", credit: "CREDIT_10", learningArea: "CAREER", category: "ADDITIONAL" },
  { code: "ง32201", name: "การงานอาชีพและเทคโนโลยี ม.5", credit: "CREDIT_10", learningArea: "CAREER", category: "ADDITIONAL" },
  { code: "ง33201", name: "การงานอาชีพและเทคโนโลยี ม.6", credit: "CREDIT_10", learningArea: "CAREER", category: "ADDITIONAL" },

  // LANG-ARTS only — 9 subjects
  { code: "ญ31201", name: "ภาษาญี่ปุ่น ม.4", credit: "CREDIT_15", learningArea: "FOREIGN_LANGUAGE", category: "ADDITIONAL" },
  { code: "ญ32201", name: "ภาษาญี่ปุ่น ม.5", credit: "CREDIT_15", learningArea: "FOREIGN_LANGUAGE", category: "ADDITIONAL" },
  { code: "ญ33201", name: "ภาษาญี่ปุ่น ม.6", credit: "CREDIT_15", learningArea: "FOREIGN_LANGUAGE", category: "ADDITIONAL" },
  { code: "ส31102", name: "สังคมศึกษาเพิ่มเติม ม.4", credit: "CREDIT_15", learningArea: "SOCIAL", category: "ADDITIONAL" },
  { code: "ส32102", name: "สังคมศึกษาเพิ่มเติม ม.5", credit: "CREDIT_15", learningArea: "SOCIAL", category: "ADDITIONAL" },
  { code: "ส33102", name: "สังคมศึกษาเพิ่มเติม ม.6", credit: "CREDIT_15", learningArea: "SOCIAL", category: "ADDITIONAL" },
  { code: "ศ31201", name: "ศิลปะเพิ่มเติม ม.4", credit: "CREDIT_10", learningArea: "ARTS", category: "ADDITIONAL" },
  { code: "ศ32201", name: "ศิลปะเพิ่มเติม ม.5", credit: "CREDIT_10", learningArea: "ARTS", category: "ADDITIONAL" },
  { code: "ศ33201", name: "ศิลปะเพิ่มเติม ม.6", credit: "CREDIT_10", learningArea: "ARTS", category: "ADDITIONAL" },

  // Activity subjects — 8 subjects
  { code: "ACT-GUIDE", name: "แนะแนว", credit: "CREDIT_10", category: "ACTIVITY", activityType: "GUIDANCE" },
  { code: "ACT-CLUB",  name: "ชุมนุม",  credit: "CREDIT_10", category: "ACTIVITY", activityType: "CLUB" },
  { code: "ACT-SCOUT-M1", name: "ลูกเสือ/เนตรนารี ม.1", credit: "CREDIT_10", category: "ACTIVITY", activityType: "SCOUT" },
  { code: "ACT-SCOUT-M2", name: "ลูกเสือ/เนตรนารี ม.2", credit: "CREDIT_10", category: "ACTIVITY", activityType: "SCOUT" },
  { code: "ACT-SCOUT-M3", name: "ลูกเสือ/เนตรนารี ม.3", credit: "CREDIT_10", category: "ACTIVITY", activityType: "SCOUT" },
  { code: "ACT-SCOUT-M4", name: "ลูกเสือ/เนตรนารี ม.4", credit: "CREDIT_10", category: "ACTIVITY", activityType: "SCOUT" },
  { code: "ACT-SCOUT-M5", name: "ลูกเสือ/เนตรนารี ม.5", credit: "CREDIT_10", category: "ACTIVITY", activityType: "SCOUT" },
  { code: "ACT-SCOUT-M6", name: "ลูกเสือ/เนตรนารี ม.6", credit: "CREDIT_10", category: "ACTIVITY", activityType: "SCOUT" },
];
```

- [ ] **Step 2: Replace upsert loop**

Replace the `for (const subject of demoSubjects)` loop with:
```typescript
for (const subject of ALL_SUBJECTS) {
  await withRetry(
    () =>
      prisma.subject.upsert({
        where: { SubjectCode: subject.code },
        update: {},
        create: {
          SubjectCode: subject.code,
          SubjectName: subject.name,
          Credit: subject.credit,
          Category: subject.category,
          LearningArea: subject.learningArea ?? null,
          ActivityType: subject.activityType ?? null,
          IsGraded: subject.category !== "ACTIVITY",
        },
      }),
    `Upsert subject ${subject.code}`,
  );
}
console.log(`✅ Created ${ALL_SUBJECTS.length} subjects`);
```

- [ ] **Step 3: Commit**

```bash
git add prisma/seed.ts
git commit -m "chore(seed): define full 77-subject array for 2568 seed"
```

---

## Task 3: Define rooms, teachers, programs, grade levels

**Files:**
- Modify: `prisma/seed.ts` — replace demo rooms/teachers/programs/grades sections

- [ ] **Step 1: Replace room definitions**

```typescript
// ── Rooms (22) ─────────────────────────────────────────────────────────
const ALL_ROOMS = [
  // Standard classrooms — อาคาร 1
  { name: "ห้อง 101", building: "อาคาร 1", floor: "ชั้น 1" },
  { name: "ห้อง 102", building: "อาคาร 1", floor: "ชั้น 1" },
  { name: "ห้อง 103", building: "อาคาร 1", floor: "ชั้น 1" },
  { name: "ห้อง 104", building: "อาคาร 1", floor: "ชั้น 1" },
  { name: "ห้อง 105", building: "อาคาร 1", floor: "ชั้น 1" },
  { name: "ห้อง 106", building: "อาคาร 1", floor: "ชั้น 1" },
  // Standard classrooms — อาคาร 2
  { name: "ห้อง 201", building: "อาคาร 2", floor: "ชั้น 1" },
  { name: "ห้อง 202", building: "อาคาร 2", floor: "ชั้น 1" },
  { name: "ห้อง 203", building: "อาคาร 2", floor: "ชั้น 1" },
  { name: "ห้อง 204", building: "อาคาร 2", floor: "ชั้น 1" },
  { name: "ห้อง 205", building: "อาคาร 2", floor: "ชั้น 1" },
  { name: "ห้อง 206", building: "อาคาร 2", floor: "ชั้น 1" },
  // Science labs
  { name: "ห้องปฏิบัติการวิทย์ 1", building: "อาคารวิทยาศาสตร์", floor: "ชั้น 1" },
  { name: "ห้องปฏิบัติการวิทย์ 2", building: "อาคารวิทยาศาสตร์", floor: "ชั้น 1" },
  { name: "ห้องปฏิบัติการวิทย์ 3", building: "อาคารวิทยาศาสตร์", floor: "ชั้น 2" },
  // Computer labs
  { name: "ห้องคอมพิวเตอร์ 1", building: "อาคารเทคโนโลยี", floor: "ชั้น 1" },
  { name: "ห้องคอมพิวเตอร์ 2", building: "อาคารเทคโนโลยี", floor: "ชั้น 1" },
  // Art room
  { name: "ห้องศิลปะ", building: "อาคาร 2", floor: "ชั้น 2" },
  // PE hall
  { name: "โรงพลศึกษา", building: "อาคารกีฬา", floor: "ชั้น 1" },
  // Activity rooms
  { name: "ห้องกิจกรรม 1", building: "อาคาร 1", floor: "ชั้น 2" },
  { name: "ห้องกิจกรรม 2", building: "อาคาร 1", floor: "ชั้น 2" },
  // Multi-purpose
  { name: "ห้องประชุม", building: "อาคารอำนวยการ", floor: "ชั้น 1" },
];
```

- [ ] **Step 2: Replace teacher definitions**

```typescript
// ── Teachers (29: 28 subject + 1 E2E) ──────────────────────────────────
// T1–T3: ภาษาไทย, T4–T6: คณิตศาสตร์, T7–T10: วิทยาศาสตร์,
// T11–T13: สังคมศึกษา, T14–T15: สุขศึกษา/พลศึกษา, T16–T17: ศิลปะ,
// T18–T19: การงานอาชีพ, T20–T23: ภาษาอังกฤษ,
// T24–T25: ภาษาจีน, T26: ภาษาญี่ปุ่น, T27–T28: แนะแนว/กิจกรรม
// T29: E2E ทดสอบ (retained for backward compatibility)
const ALL_TEACHERS = [
  { email: "teacher1@school.ac.th",  prefix: "ครู", firstname: "สมชาย",    lastname: "ทองดี",      dept: "ภาษาไทย" },
  { email: "teacher2@school.ac.th",  prefix: "ครู", firstname: "นิภา",     lastname: "ใสสะอาด",    dept: "ภาษาไทย" },
  { email: "teacher3@school.ac.th",  prefix: "ครู", firstname: "วิมล",     lastname: "รักภาษา",    dept: "ภาษาไทย" },
  { email: "teacher4@school.ac.th",  prefix: "ครู", firstname: "อนุชา",    lastname: "มั่นคง",     dept: "คณิตศาสตร์" },
  { email: "teacher5@school.ac.th",  prefix: "ครู", firstname: "สุภา",     lastname: "เลขเก่ง",    dept: "คณิตศาสตร์" },
  { email: "teacher6@school.ac.th",  prefix: "ครู", firstname: "ประสิทธิ์", lastname: "คิดเร็ว",   dept: "คณิตศาสตร์" },
  { email: "teacher7@school.ac.th",  prefix: "ครู", firstname: "วิชัย",    lastname: "เก่งมาก",    dept: "วิทยาศาสตร์และเทคโนโลยี" },
  { email: "teacher8@school.ac.th",  prefix: "ครู", firstname: "ศิริพรรณ", lastname: "สุขเจริญ",   dept: "วิทยาศาสตร์และเทคโนโลยี" },
  { email: "teacher9@school.ac.th",  prefix: "ครู", firstname: "นันทวัน", lastname: "ภูมิใจ",     dept: "วิทยาศาสตร์และเทคโนโลยี" },
  { email: "teacher10@school.ac.th", prefix: "ครู", firstname: "ธีรพล",   lastname: "วิทยา",      dept: "วิทยาศาสตร์และเทคโนโลยี" },
  { email: "teacher11@school.ac.th", prefix: "ครู", firstname: "สุดา",    lastname: "รักเรียน",   dept: "สังคมศึกษา" },
  { email: "teacher12@school.ac.th", prefix: "ครู", firstname: "จิราพร",  lastname: "ประวัติดี",  dept: "สังคมศึกษา" },
  { email: "teacher13@school.ac.th", prefix: "ครู", firstname: "ชาติชาย", lastname: "ศาสนา",      dept: "สังคมศึกษา" },
  { email: "teacher14@school.ac.th", prefix: "ครู", firstname: "ประสิทธิ์", lastname: "แข็งแรง",  dept: "สุขศึกษาและพลศึกษา" },
  { email: "teacher15@school.ac.th", prefix: "ครู", firstname: "กนกพร",   lastname: "สุขภาพดี",   dept: "สุขศึกษาและพลศึกษา" },
  { email: "teacher16@school.ac.th", prefix: "ครู", firstname: "ศิริพร",  lastname: "ศิลป์งาม",   dept: "ศิลปะ" },
  { email: "teacher17@school.ac.th", prefix: "ครู", firstname: "อรุณ",    lastname: "วาดเก่ง",    dept: "ศิลปะ" },
  { email: "teacher18@school.ac.th", prefix: "ครู", firstname: "บุญส่ง",  lastname: "อาชีพดี",    dept: "การงานอาชีพ" },
  { email: "teacher19@school.ac.th", prefix: "ครู", firstname: "วรรณา",   lastname: "เทคโนโลยี",  dept: "การงานอาชีพ" },
  { email: "teacher20@school.ac.th", prefix: "ครู", firstname: "จอห์น",   lastname: "สมิธ",       dept: "ภาษาต่างประเทศ" },
  { email: "teacher21@school.ac.th", prefix: "ครู", firstname: "แมรี่",   lastname: "จอห์นสัน",   dept: "ภาษาต่างประเทศ" },
  { email: "teacher22@school.ac.th", prefix: "ครู", firstname: "ไมเคิล",  lastname: "บราวน์",     dept: "ภาษาต่างประเทศ" },
  { email: "teacher23@school.ac.th", prefix: "ครู", firstname: "เอมิลี่", lastname: "เดวิส",      dept: "ภาษาต่างประเทศ" },
  { email: "teacher24@school.ac.th", prefix: "ครู", firstname: "หลี่",    lastname: "เมย์",       dept: "ภาษาต่างประเทศ" },
  { email: "teacher25@school.ac.th", prefix: "ครู", firstname: "หวัง",    lastname: "ฟาง",        dept: "ภาษาต่างประเทศ" },
  { email: "teacher26@school.ac.th", prefix: "ครู", firstname: "ซาโตะ",   lastname: "ยูกิ",       dept: "ภาษาต่างประเทศ" },
  { email: "teacher27@school.ac.th", prefix: "ครู", firstname: "กมลา",    lastname: "แนะนำดี",    dept: "แนะแนว" },
  { email: "teacher28@school.ac.th", prefix: "ครู", firstname: "ปรีชา",   lastname: "กิจกรรม",    dept: "แนะแนว" },
  { email: "e2e.teacher@school.ac.th", prefix: "ครู", firstname: "E2E", lastname: "ทดสอบ", dept: "คณิตศาสตร์" },
];
```

- [ ] **Step 3: Replace program definitions**

```typescript
// ── Programs (12) ──────────────────────────────────────────────────────
// schema: @@unique([Year, Track]) — one program per year-track combo
const ALL_PROGRAMS = [
  { code: "M1-GEN",       name: "หลักสูตรมัธยมศึกษาปีที่ 1",             year: 1, track: "GENERAL"       as ProgramTrack, minCredits: 43 },
  { code: "M2-GEN",       name: "หลักสูตรมัธยมศึกษาปีที่ 2",             year: 2, track: "GENERAL"       as ProgramTrack, minCredits: 43 },
  { code: "M3-GEN",       name: "หลักสูตรมัธยมศึกษาปีที่ 3",             year: 3, track: "GENERAL"       as ProgramTrack, minCredits: 43 },
  { code: "M4-SCI",       name: "หลักสูตรวิทย์-คณิต ม.4",               year: 4, track: "SCIENCE_MATH"  as ProgramTrack, minCredits: 41 },
  { code: "M4-LANG-MATH", name: "หลักสูตรศิลป์-คำนวณ ม.4",              year: 4, track: "LANGUAGE_MATH" as ProgramTrack, minCredits: 41 },
  { code: "M4-LANG-ARTS", name: "หลักสูตรศิลป์-ภาษา ม.4",               year: 4, track: "LANGUAGE_ARTS" as ProgramTrack, minCredits: 41 },
  { code: "M5-SCI",       name: "หลักสูตรวิทย์-คณิต ม.5",               year: 5, track: "SCIENCE_MATH"  as ProgramTrack, minCredits: 41 },
  { code: "M5-LANG-MATH", name: "หลักสูตรศิลป์-คำนวณ ม.5",              year: 5, track: "LANGUAGE_MATH" as ProgramTrack, minCredits: 41 },
  { code: "M5-LANG-ARTS", name: "หลักสูตรศิลป์-ภาษา ม.5",               year: 5, track: "LANGUAGE_ARTS" as ProgramTrack, minCredits: 41 },
  { code: "M6-SCI",       name: "หลักสูตรวิทย์-คณิต ม.6",               year: 6, track: "SCIENCE_MATH"  as ProgramTrack, minCredits: 41 },
  { code: "M6-LANG-MATH", name: "หลักสูตรศิลป์-คำนวณ ม.6",              year: 6, track: "LANGUAGE_MATH" as ProgramTrack, minCredits: 41 },
  { code: "M6-LANG-ARTS", name: "หลักสูตรศิลป์-ภาษา ม.6",               year: 6, track: "LANGUAGE_ARTS" as ProgramTrack, minCredits: 41 },
];
```

- [ ] **Step 4: Replace grade level definitions**

```typescript
// ── Grade Levels (18) ──────────────────────────────────────────────────
// GradeID format: M{year}-{section}
// Lower sec: M1-M3, 3 sections each; Upper sec: M4-M6, 3 sections (one per track)
const ALL_GRADES = [
  // Lower secondary — GENERAL program, 35 students each
  { id: "M1-1", year: 1, number: 1, students: 35, programCode: "M1-GEN" },
  { id: "M1-2", year: 1, number: 2, students: 35, programCode: "M1-GEN" },
  { id: "M1-3", year: 1, number: 3, students: 35, programCode: "M1-GEN" },
  { id: "M2-1", year: 2, number: 1, students: 35, programCode: "M2-GEN" },
  { id: "M2-2", year: 2, number: 2, students: 35, programCode: "M2-GEN" },
  { id: "M2-3", year: 2, number: 3, students: 35, programCode: "M2-GEN" },
  { id: "M3-1", year: 3, number: 1, students: 35, programCode: "M3-GEN" },
  { id: "M3-2", year: 3, number: 2, students: 35, programCode: "M3-GEN" },
  { id: "M3-3", year: 3, number: 3, students: 35, programCode: "M3-GEN" },
  // Upper secondary — one track per section, 32 students each
  { id: "M4-1", year: 4, number: 1, students: 32, programCode: "M4-SCI" },
  { id: "M4-2", year: 4, number: 2, students: 32, programCode: "M4-LANG-MATH" },
  { id: "M4-3", year: 4, number: 3, students: 32, programCode: "M4-LANG-ARTS" },
  { id: "M5-1", year: 5, number: 1, students: 32, programCode: "M5-SCI" },
  { id: "M5-2", year: 5, number: 2, students: 32, programCode: "M5-LANG-MATH" },
  { id: "M5-3", year: 5, number: 3, students: 32, programCode: "M5-LANG-ARTS" },
  { id: "M6-1", year: 6, number: 1, students: 32, programCode: "M6-SCI" },
  { id: "M6-2", year: 6, number: 2, students: 32, programCode: "M6-LANG-MATH" },
  { id: "M6-3", year: 6, number: 3, students: 32, programCode: "M6-LANG-ARTS" },
];
```

- [ ] **Step 5: Replace seeding loops for rooms, teachers, programs, grades**

```typescript
// ── Seed rooms ────────────────────────────────────────────────────────
console.log("🚪 Seeding rooms...");
const roomMap = new Map<string, number>(); // name → RoomID
for (const r of ALL_ROOMS) {
  const room = await withRetry(
    () => prisma.room.upsert({
      where: { RoomName: r.name },
      update: {},
      create: { RoomName: r.name, Building: r.building, Floor: r.floor },
    }),
    `Upsert room ${r.name}`,
  );
  roomMap.set(room.RoomName, room.RoomID);
}
console.log(`✅ ${ALL_ROOMS.length} rooms`);

// ── Seed teachers ─────────────────────────────────────────────────────
console.log("👨‍🏫 Seeding teachers...");
const teacherMap = new Map<string, number>(); // email → TeacherID
for (const t of ALL_TEACHERS) {
  const teacher = await withRetry(
    () => prisma.teacher.upsert({
      where: { Email: t.email },
      update: {},
      create: { Prefix: t.prefix, Firstname: t.firstname, Lastname: t.lastname, Department: t.dept, Email: t.email, Role: "teacher" },
    }),
    `Upsert teacher ${t.email}`,
  );
  teacherMap.set(teacher.Email, teacher.TeacherID);
}
console.log(`✅ ${ALL_TEACHERS.length} teachers`);

// ── Seed programs ────────────────────────────────────────────────────
console.log("🎓 Seeding programs...");
const programMap = new Map<string, number>(); // code → ProgramID
for (const p of ALL_PROGRAMS) {
  const existing = await prisma.program.findFirst({ where: { Year: p.year, Track: p.track } });
  const prog = existing ?? await withRetry(
    () => prisma.program.create({
      data: { ProgramCode: p.code, ProgramName: p.name, Year: p.year, Track: p.track, MinTotalCredits: p.minCredits },
    }),
    `Create program ${p.code}`,
  );
  programMap.set(p.code, prog.ProgramID);
}
console.log(`✅ ${ALL_PROGRAMS.length} programs`);

// ── Seed grade levels ────────────────────────────────────────────────
console.log("🏫 Seeding grade levels...");
const gradeMap = new Map<string, string>(); // GradeID → GradeID (for existence check)
for (const g of ALL_GRADES) {
  const pid = programMap.get(g.programCode)!;
  await withRetry(
    () => prisma.gradelevel.upsert({
      where: { GradeID: g.id },
      update: {},
      create: { GradeID: g.id, Year: g.year, Number: g.number, StudentCount: g.students, ProgramID: pid },
    }),
    `Upsert grade ${g.id}`,
  );
  gradeMap.set(g.id, g.id);
}
console.log(`✅ ${ALL_GRADES.length} grade levels`);
```

- [ ] **Step 6: Commit**

```bash
git add prisma/seed.ts
git commit -m "chore(seed): define 22 rooms, 29 teachers, 12 programs, 18 grades for 2568"
```

---

## Task 4: Define program-subject links

**Files:**
- Modify: `prisma/seed.ts` — replace program_subject section

- [ ] **Step 1: Add program-subject map and seeding loop**

After grade seeding, add:

```typescript
// ── Program-Subject links ──────────────────────────────────────────────
console.log("🔗 Seeding program-subject links...");

// Credit-to-number helper
const creditToNum = (c: subject_credit): number =>
  ({ CREDIT_05: 0.5, CREDIT_10: 1.0, CREDIT_15: 1.5, CREDIT_20: 2.0 }[c] ?? 1.0);

// Map: programCode → subject codes for that program
const PROGRAM_SUBJECTS: Record<string, string[]> = {
  // Lower secondary — all 8 core + 3 activities each year
  "M1-GEN": ["ท21101","ค21101","ว21101","ส21101","พ21101","ศ21101","ง21101","อ21101","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M1"],
  "M2-GEN": ["ท22101","ค22101","ว22101","ส22101","พ22101","ศ22101","ง22101","อ22101","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M2"],
  "M3-GEN": ["ท23101","ค23101","ว23101","ส23101","พ23101","ศ23101","ง23101","อ23101","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M3"],
  // Upper secondary SCI-MATH
  "M4-SCI": ["ท31101","ค31101","ว31101","ส31101","พ31101","อ31101","ค31201","ว31201","ว31202","ว31203","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M4"],
  "M5-SCI": ["ท32101","ค32101","ว32101","ส32101","พ32101","อ32101","ค32201","ว32201","ว32202","ว32203","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M5"],
  "M6-SCI": ["ท33101","ค33101","ว33101","ส33101","พ33101","อ33101","ค33201","ว33201","ว33202","ว33203","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M6"],
  // Upper secondary LANG-MATH
  "M4-LANG-MATH": ["ท31101","ค31101","ว31101","ส31101","พ31101","อ31101","ค31201","จ31201","ง31201","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M4"],
  "M5-LANG-MATH": ["ท32101","ค32101","ว32101","ส32101","พ32101","อ32101","ค32201","จ32201","ง32201","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M5"],
  "M6-LANG-MATH": ["ท33101","ค33101","ว33101","ส33101","พ33101","อ33101","ค33201","จ33201","ง33201","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M6"],
  // Upper secondary LANG-ARTS
  "M4-LANG-ARTS": ["ท31101","ค31101","ว31101","ส31101","พ31101","อ31101","จ31201","ญ31201","ส31102","ศ31201","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M4"],
  "M5-LANG-ARTS": ["ท32101","ค32101","ว32101","ส32101","พ32101","อ32101","จ32201","ญ32201","ส32102","ศ32201","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M5"],
  "M6-LANG-ARTS": ["ท33101","ค33101","ว33101","ส33101","พ33101","อ33101","จ33201","ญ33201","ส33102","ศ33201","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M6"],
};

const subjectMap = new Map(ALL_SUBJECTS.map((s) => [s.code, s]));

let psCount = 0;
for (const [pCode, subjectCodes] of Object.entries(PROGRAM_SUBJECTS)) {
  const pid = programMap.get(pCode)!;
  for (let i = 0; i < subjectCodes.length; i++) {
    const code = subjectCodes[i];
    const subj = subjectMap.get(code)!;
    await withRetry(
      () => prisma.program_subject.upsert({
        where: { ProgramID_SubjectCode: { ProgramID: pid, SubjectCode: code } },
        update: {},
        create: {
          ProgramID: pid, SubjectCode: code,
          Category: subj.category,
          IsMandatory: subj.category !== "ACTIVITY",
          MinCredits: creditToNum(subj.credit),
          SortOrder: i + 1,
        },
      }),
      `Link ${code} to ${pCode}`,
    );
    psCount++;
  }
}
console.log(`✅ ${psCount} program-subject links`);
```

- [ ] **Step 2: Commit**

```bash
git add prisma/seed.ts
git commit -m "chore(seed): add program-subject links for all 12 programs"
```

---

## Task 5: Implement S1 timeslots + table_config

**Files:**
- Modify: `prisma/seed.ts` — replace timeslots + table_config sections

- [ ] **Step 1: Define period schedule and seed S1 timeslots**

```typescript
// ── S1 Timeslots (40: 8 periods × 5 days) ─────────────────────────────
console.log("⏰ Seeding S1-2568 timeslots...");

const DAYS: day_of_week[] = ["MON", "TUE", "WED", "THU", "FRI"];

// 8 periods. Note: P2 carries BREAK_BOTH (10-min mini-break follows after 10:10).
// P4=BREAK_JUNIOR (juniors at lunch; no class_schedule for junior grades at P4)
// P5=BREAK_SENIOR (seniors at lunch; no class_schedule for senior grades at P5)
const PERIODS_2568 = [
  { num: 1, start: "08:30", end: "09:20", brk: "NOT_BREAK"    as breaktime },
  { num: 2, start: "09:20", end: "10:10", brk: "BREAK_BOTH"   as breaktime },
  { num: 3, start: "10:20", end: "11:10", brk: "NOT_BREAK"    as breaktime }, // gap 10:10–10:20 = mini-break
  { num: 4, start: "11:10", end: "12:00", brk: "BREAK_JUNIOR" as breaktime },
  { num: 5, start: "12:00", end: "12:50", brk: "BREAK_SENIOR" as breaktime },
  { num: 6, start: "12:50", end: "13:40", brk: "NOT_BREAK"    as breaktime },
  { num: 7, start: "13:40", end: "14:30", brk: "NOT_BREAK"    as breaktime },
  { num: 8, start: "14:30", end: "15:20", brk: "NOT_BREAK"    as breaktime },
];

const s1TimeslotMap = new Map<string, string>(); // key → TimeslotID
for (const day of DAYS) {
  for (const p of PERIODS_2568) {
    const id = `1-2568-${day}${p.num}`;
    await withRetry(
      () => prisma.timeslot.upsert({
        where: { TimeslotID: id },
        update: {},
        create: {
          TimeslotID: id,
          AcademicYear: 2568,
          Semester: "SEMESTER_1",
          StartTime: new Date(`2024-01-01T${p.start}:00`),
          EndTime:   new Date(`2024-01-01T${p.end}:00`),
          Breaktime: p.brk,
          DayOfWeek: day,
        },
      }),
      `Upsert S1 timeslot ${id}`,
    );
    s1TimeslotMap.set(`${day}${p.num}`, id);
  }
}
console.log("✅ 40 S1-2568 timeslots");

// ── S1 table_config ────────────────────────────────────────────────────
await withRetry(
  () => prisma.table_config.upsert({
    where: { ConfigID: "1-2568" },
    update: {},
    create: {
      ConfigID: "1-2568",
      AcademicYear: 2568,
      Semester: "SEMESTER_1",
      Config: configTemplate,
      status: "PUBLISHED",
    },
  }),
  "Upsert table config 1-2568",
);
console.log("✅ table_config 1-2568 (PUBLISHED)");
```

- [ ] **Step 2: Commit**

```bash
git add prisma/seed.ts
git commit -m "chore(seed): add S1-2568 timeslots (8 periods × 5 days) and PUBLISHED table_config"
```

---

## Task 6: Implement S1 teacher responsibilities + class schedules

This is the largest task. Uses day-rotation (per year) + period-rotation (per section) to avoid teacher conflicts.

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Define teacher assignment map and schedule generation helper**

```typescript
// ── S1 Teacher assignments ─────────────────────────────────────────────
// teacherMap: email → TeacherID (populated in Task 3)
// Teacher roles by email key (for readability in schedule definitions):
const T = (email: string) => teacherMap.get(email)!;

// Lower secondary: one teacher per subject per 3-year block
// Thai: T1(M1+M2+M3-sec1), T2(M1+M2+M3-sec2), T3(sec3)
// → but actually 1 teacher per year group works since different year = different subject code
// Teacher mapping for lower sec (same teacher handles 1 year, all 3 sections):
const LOWER_SEC_TEACHERS: Record<string, Record<number, string>> = {
  // subjectPrefix: { year: teacherEmail }
  "ท": { 1: "teacher1@school.ac.th", 2: "teacher2@school.ac.th", 3: "teacher3@school.ac.th" },
  "ค": { 1: "teacher4@school.ac.th", 2: "teacher5@school.ac.th", 3: "teacher6@school.ac.th" },
  "ว": { 1: "teacher7@school.ac.th", 2: "teacher8@school.ac.th", 3: "teacher9@school.ac.th" },
  "ส": { 1: "teacher11@school.ac.th", 2: "teacher12@school.ac.th", 3: "teacher13@school.ac.th" },
  "พ": { 1: "teacher14@school.ac.th", 2: "teacher15@school.ac.th", 3: "teacher14@school.ac.th" },
  "ศ": { 1: "teacher16@school.ac.th", 2: "teacher17@school.ac.th", 3: "teacher16@school.ac.th" },
  "ง": { 1: "teacher18@school.ac.th", 2: "teacher19@school.ac.th", 3: "teacher18@school.ac.th" },
  "อ": { 1: "teacher20@school.ac.th", 2: "teacher21@school.ac.th", 3: "teacher22@school.ac.th" },
  "ACT": { 1: "teacher27@school.ac.th", 2: "teacher28@school.ac.th", 3: "teacher27@school.ac.th" },
};

// Junior periods available (skip P4=BREAK_JUNIOR)
const JUNIOR_PERIODS = [1, 2, 3, 5, 6, 7, 8];
// Senior periods available (skip P5=BREAK_SENIOR)
const SENIOR_PERIODS = [1, 2, 3, 4, 6, 7, 8];

type SlotDef = { day: day_of_week; period: number; subjectCode: string; teacherEmail: string; teachHour: number };

function buildLowerSecSlots(yearNum: 1|2|3, sectionNum: 1|2|3): SlotDef[] {
  // Day-rotation: year 1→MON-start, year 2→TUE-start, year 3→WED-start
  // This prevents guide/activity teacher conflicts across years
  const dayBase = yearNum - 1;
  // Period-rotation: section 1→index 0, section 2→index 1, section 3→index 2
  const periBase = sectionNum - 1;
  
  const d = (offset: number): day_of_week => DAYS[(dayBase + offset) % 5];
  const p = (offset: number): number => JUNIOR_PERIODS[(periBase + offset) % JUNIOR_PERIODS.length];
  
  const yr = `${yearNum + 1}`; // 1→"2", 2→"3" etc (for subject code middle digit: ท21101 = "2"+"1")
  const sub = (prefix: string) => `${prefix}${yr}${yearNum}101`; // e.g. ท21101
  const te = (prefix: string) => LOWER_SEC_TEACHERS[prefix]?.[yearNum] ?? "teacher27@school.ac.th";
  
  return [
    // Thai (3 periods/week)
    { day: d(0), period: p(0), subjectCode: sub("ท"), teacherEmail: te("ท"), teachHour: 3 },
    { day: d(1), period: p(0), subjectCode: sub("ท"), teacherEmail: te("ท"), teachHour: 3 },
    { day: d(2), period: p(0), subjectCode: sub("ท"), teacherEmail: te("ท"), teachHour: 3 },
    // Math (3 periods/week)
    { day: d(0), period: p(1), subjectCode: sub("ค"), teacherEmail: te("ค"), teachHour: 3 },
    { day: d(1), period: p(1), subjectCode: sub("ค"), teacherEmail: te("ค"), teachHour: 3 },
    { day: d(2), period: p(1), subjectCode: sub("ค"), teacherEmail: te("ค"), teachHour: 3 },
    // Science (3 periods/week)
    { day: d(0), period: p(2), subjectCode: sub("ว"), teacherEmail: te("ว"), teachHour: 3 },
    { day: d(1), period: p(2), subjectCode: sub("ว"), teacherEmail: te("ว"), teachHour: 3 },
    { day: d(2), period: p(2), subjectCode: sub("ว"), teacherEmail: te("ว"), teachHour: 3 },
    // Social (2 periods/week)
    { day: d(3), period: p(0), subjectCode: sub("ส"), teacherEmail: te("ส"), teachHour: 2 },
    { day: d(4), period: p(0), subjectCode: sub("ส"), teacherEmail: te("ส"), teachHour: 2 },
    // PE (2 periods/week)
    { day: d(3), period: p(1), subjectCode: sub("พ"), teacherEmail: te("พ"), teachHour: 2 },
    { day: d(4), period: p(1), subjectCode: sub("พ"), teacherEmail: te("พ"), teachHour: 2 },
    // Art (2 periods/week)
    { day: d(3), period: p(2), subjectCode: sub("ศ"), teacherEmail: te("ศ"), teachHour: 2 },
    { day: d(4), period: p(2), subjectCode: sub("ศ"), teacherEmail: te("ศ"), teachHour: 2 },
    // Career (2 periods/week)
    { day: d(0), period: p(3), subjectCode: sub("ง"), teacherEmail: te("ง"), teachHour: 2 },
    { day: d(1), period: p(3), subjectCode: sub("ง"), teacherEmail: te("ง"), teachHour: 2 },
    // English (2 periods/week)
    { day: d(2), period: p(3), subjectCode: sub("อ"), teacherEmail: te("อ"), teachHour: 2 },
    { day: d(3), period: p(3), subjectCode: sub("อ"), teacherEmail: te("อ"), teachHour: 2 },
    // Activities (FRI)
    { day: d(4), period: p(3), subjectCode: `ACT-SCOUT-M${yearNum}`, teacherEmail: te("ACT"), teachHour: 2 },
    { day: d(4), period: p(4), subjectCode: `ACT-SCOUT-M${yearNum}`, teacherEmail: te("ACT"), teachHour: 2 },
    { day: d(4), period: p(5), subjectCode: "ACT-GUIDE",              teacherEmail: te("ACT"), teachHour: 1 },
    { day: d(4), period: p(6), subjectCode: "ACT-CLUB",               teacherEmail: te("ACT"), teachHour: 1 },
  ]; // 23 slots per grade
}
```

- [ ] **Step 2: Define upper secondary slot builder**

```typescript
// Upper sec teacher assignments per subject and year
const UPPER_SEC_TEACHERS: Record<string, Record<number, Record<string, string>>> = {
  // track → year → subjectPrefix → teacherEmail
  SCIENCE_MATH: {
    4: { "ท": "teacher1@school.ac.th", "ค": "teacher4@school.ac.th", "ว": "teacher7@school.ac.th",
         "ส": "teacher11@school.ac.th", "พ": "teacher14@school.ac.th", "อ": "teacher20@school.ac.th",
         "ค_adv": "teacher5@school.ac.th", "ว_phy": "teacher8@school.ac.th",
         "ว_che": "teacher9@school.ac.th", "ว_bio": "teacher10@school.ac.th", "ACT": "teacher27@school.ac.th" },
    5: { "ท": "teacher2@school.ac.th", "ค": "teacher5@school.ac.th", "ว": "teacher8@school.ac.th",
         "ส": "teacher12@school.ac.th", "พ": "teacher15@school.ac.th", "อ": "teacher21@school.ac.th",
         "ค_adv": "teacher6@school.ac.th", "ว_phy": "teacher9@school.ac.th",
         "ว_che": "teacher10@school.ac.th", "ว_bio": "teacher7@school.ac.th", "ACT": "teacher28@school.ac.th" },
    6: { "ท": "teacher3@school.ac.th", "ค": "teacher6@school.ac.th", "ว": "teacher9@school.ac.th",
         "ส": "teacher13@school.ac.th", "พ": "teacher14@school.ac.th", "อ": "teacher22@school.ac.th",
         "ค_adv": "teacher4@school.ac.th", "ว_phy": "teacher10@school.ac.th",
         "ว_che": "teacher7@school.ac.th", "ว_bio": "teacher8@school.ac.th", "ACT": "teacher27@school.ac.th" },
  },
  LANGUAGE_MATH: {
    4: { "ท": "teacher1@school.ac.th", "ค": "teacher4@school.ac.th", "ว": "teacher7@school.ac.th",
         "ส": "teacher11@school.ac.th", "พ": "teacher14@school.ac.th", "อ": "teacher20@school.ac.th",
         "ค_adv": "teacher5@school.ac.th", "จ": "teacher24@school.ac.th", "ง": "teacher18@school.ac.th", "ACT": "teacher28@school.ac.th" },
    5: { "ท": "teacher2@school.ac.th", "ค": "teacher5@school.ac.th", "ว": "teacher8@school.ac.th",
         "ส": "teacher12@school.ac.th", "พ": "teacher15@school.ac.th", "อ": "teacher21@school.ac.th",
         "ค_adv": "teacher6@school.ac.th", "จ": "teacher25@school.ac.th", "ง": "teacher19@school.ac.th", "ACT": "teacher27@school.ac.th" },
    6: { "ท": "teacher3@school.ac.th", "ค": "teacher6@school.ac.th", "ว": "teacher9@school.ac.th",
         "ส": "teacher13@school.ac.th", "พ": "teacher14@school.ac.th", "อ": "teacher22@school.ac.th",
         "ค_adv": "teacher4@school.ac.th", "จ": "teacher24@school.ac.th", "ง": "teacher18@school.ac.th", "ACT": "teacher28@school.ac.th" },
  },
  LANGUAGE_ARTS: {
    4: { "ท": "teacher1@school.ac.th", "ค": "teacher4@school.ac.th", "ว": "teacher7@school.ac.th",
         "ส": "teacher11@school.ac.th", "พ": "teacher14@school.ac.th", "อ": "teacher23@school.ac.th",
         "จ": "teacher24@school.ac.th", "ญ": "teacher26@school.ac.th",
         "ส_adv": "teacher12@school.ac.th", "ศ": "teacher16@school.ac.th", "ACT": "teacher28@school.ac.th" },
    5: { "ท": "teacher2@school.ac.th", "ค": "teacher5@school.ac.th", "ว": "teacher8@school.ac.th",
         "ส": "teacher12@school.ac.th", "พ": "teacher15@school.ac.th", "อ": "teacher23@school.ac.th",
         "จ": "teacher25@school.ac.th", "ญ": "teacher26@school.ac.th",
         "ส_adv": "teacher13@school.ac.th", "ศ": "teacher17@school.ac.th", "ACT": "teacher27@school.ac.th" },
    6: { "ท": "teacher3@school.ac.th", "ค": "teacher6@school.ac.th", "ว": "teacher9@school.ac.th",
         "ส": "teacher13@school.ac.th", "พ": "teacher14@school.ac.th", "อ": "teacher23@school.ac.th",
         "จ": "teacher24@school.ac.th", "ญ": "teacher26@school.ac.th",
         "ส_adv": "teacher11@school.ac.th", "ศ": "teacher16@school.ac.th", "ACT": "teacher28@school.ac.th" },
  },
};

function buildUpperSecSlots(yearNum: 4|5|6, track: "SCIENCE_MATH"|"LANGUAGE_MATH"|"LANGUAGE_ARTS"): SlotDef[] {
  // Upper sec uses sections 1/2/3 within a year BUT each section is a different track
  // Section number maps: SCI→1, LANG-MATH→2, LANG-ARTS→3
  const sectionNum = track === "SCIENCE_MATH" ? 1 : track === "LANGUAGE_MATH" ? 2 : 3;
  const dayBase = (yearNum - 4); // M4→0, M5→1, M6→2
  const periBase = sectionNum - 1;
  
  const d = (offset: number): day_of_week => DAYS[(dayBase + offset) % 5];
  const p = (offset: number): number => SENIOR_PERIODS[(periBase + offset) % SENIOR_PERIODS.length];
  
  const x = yearNum - 3; // M4→1, M5→2, M6→3
  const yr = `3${x}`; // "31", "32", "33"
  const te = UPPER_SEC_TEACHERS[track][yearNum];
  
  const coreSlots: SlotDef[] = [
    // Core 6 subjects (2 periods each)
    { day: d(0), period: p(0), subjectCode: `ท${yr}101`, teacherEmail: te["ท"], teachHour: 2 },
    { day: d(1), period: p(0), subjectCode: `ท${yr}101`, teacherEmail: te["ท"], teachHour: 2 },
    { day: d(0), period: p(1), subjectCode: `ค${yr}101`, teacherEmail: te["ค"], teachHour: 2 },
    { day: d(1), period: p(1), subjectCode: `ค${yr}101`, teacherEmail: te["ค"], teachHour: 2 },
    { day: d(0), period: p(2), subjectCode: `ว${yr}101`, teacherEmail: te["ว"], teachHour: 2 },
    { day: d(1), period: p(2), subjectCode: `ว${yr}101`, teacherEmail: te["ว"], teachHour: 2 },
    { day: d(2), period: p(0), subjectCode: `ส${yr}101`, teacherEmail: te["ส"], teachHour: 2 },
    { day: d(3), period: p(0), subjectCode: `ส${yr}101`, teacherEmail: te["ส"], teachHour: 2 },
    { day: d(2), period: p(1), subjectCode: `พ${yr}101`, teacherEmail: te["พ"], teachHour: 2 },
    { day: d(3), period: p(1), subjectCode: `พ${yr}101`, teacherEmail: te["พ"], teachHour: 2 },
    { day: d(2), period: p(2), subjectCode: `อ${yr}101`, teacherEmail: te["อ"], teachHour: 2 },
    { day: d(3), period: p(2), subjectCode: `อ${yr}101`, teacherEmail: te["อ"], teachHour: 2 },
    // Activities
    { day: d(4), period: p(0), subjectCode: `ACT-SCOUT-M${yearNum}`, teacherEmail: te["ACT"], teachHour: 2 },
    { day: d(4), period: p(1), subjectCode: `ACT-SCOUT-M${yearNum}`, teacherEmail: te["ACT"], teachHour: 2 },
    { day: d(4), period: p(2), subjectCode: "ACT-GUIDE",              teacherEmail: te["ACT"], teachHour: 1 },
    { day: d(4), period: p(3), subjectCode: "ACT-CLUB",               teacherEmail: te["ACT"], teachHour: 1 },
  ];
  
  // Track-specific electives
  const electives: SlotDef[] = [];
  if (track === "SCIENCE_MATH") {
    electives.push(
      { day: d(0), period: p(3), subjectCode: `ค${yr}201`, teacherEmail: te["ค_adv"], teachHour: 4 },
      { day: d(1), period: p(3), subjectCode: `ค${yr}201`, teacherEmail: te["ค_adv"], teachHour: 4 },
      { day: d(2), period: p(3), subjectCode: `ค${yr}201`, teacherEmail: te["ค_adv"], teachHour: 4 },
      { day: d(3), period: p(3), subjectCode: `ค${yr}201`, teacherEmail: te["ค_adv"], teachHour: 4 },
      { day: d(0), period: p(4), subjectCode: `ว${yr}201`, teacherEmail: te["ว_phy"], teachHour: 3 },
      { day: d(1), period: p(4), subjectCode: `ว${yr}201`, teacherEmail: te["ว_phy"], teachHour: 3 },
      { day: d(2), period: p(4), subjectCode: `ว${yr}201`, teacherEmail: te["ว_phy"], teachHour: 3 },
      { day: d(0), period: p(5), subjectCode: `ว${yr}202`, teacherEmail: te["ว_che"], teachHour: 3 },
      { day: d(1), period: p(5), subjectCode: `ว${yr}202`, teacherEmail: te["ว_che"], teachHour: 3 },
      { day: d(2), period: p(5), subjectCode: `ว${yr}202`, teacherEmail: te["ว_che"], teachHour: 3 },
      { day: d(3), period: p(4), subjectCode: `ว${yr}203`, teacherEmail: te["ว_bio"], teachHour: 3 },
      { day: d(4), period: p(4), subjectCode: `ว${yr}203`, teacherEmail: te["ว_bio"], teachHour: 3 },
      { day: d(3), period: p(5), subjectCode: `ว${yr}203`, teacherEmail: te["ว_bio"], teachHour: 3 },
    );
  } else if (track === "LANGUAGE_MATH") {
    electives.push(
      { day: d(0), period: p(3), subjectCode: `ค${yr}201`, teacherEmail: te["ค_adv"], teachHour: 4 },
      { day: d(1), period: p(3), subjectCode: `ค${yr}201`, teacherEmail: te["ค_adv"], teachHour: 4 },
      { day: d(2), period: p(3), subjectCode: `ค${yr}201`, teacherEmail: te["ค_adv"], teachHour: 4 },
      { day: d(3), period: p(3), subjectCode: `ค${yr}201`, teacherEmail: te["ค_adv"], teachHour: 4 },
      { day: d(0), period: p(4), subjectCode: `จ${yr}201`, teacherEmail: te["จ"], teachHour: 3 },
      { day: d(1), period: p(4), subjectCode: `จ${yr}201`, teacherEmail: te["จ"], teachHour: 3 },
      { day: d(2), period: p(4), subjectCode: `จ${yr}201`, teacherEmail: te["จ"], teachHour: 3 },
      { day: d(0), period: p(5), subjectCode: `ง${yr}201`, teacherEmail: te["ง"], teachHour: 2 },
      { day: d(1), period: p(5), subjectCode: `ง${yr}201`, teacherEmail: te["ง"], teachHour: 2 },
    );
  } else { // LANGUAGE_ARTS
    electives.push(
      { day: d(0), period: p(3), subjectCode: `จ${yr}201`, teacherEmail: te["จ"], teachHour: 3 },
      { day: d(1), period: p(3), subjectCode: `จ${yr}201`, teacherEmail: te["จ"], teachHour: 3 },
      { day: d(2), period: p(3), subjectCode: `จ${yr}201`, teacherEmail: te["จ"], teachHour: 3 },
      { day: d(0), period: p(4), subjectCode: `ญ${yr}201`, teacherEmail: te["ญ"], teachHour: 3 },
      { day: d(1), period: p(4), subjectCode: `ญ${yr}201`, teacherEmail: te["ญ"], teachHour: 3 },
      { day: d(2), period: p(4), subjectCode: `ญ${yr}201`, teacherEmail: te["ญ"], teachHour: 3 },
      { day: d(0), period: p(5), subjectCode: `ส${yr}102`, teacherEmail: te["ส_adv"], teachHour: 3 },
      { day: d(1), period: p(5), subjectCode: `ส${yr}102`, teacherEmail: te["ส_adv"], teachHour: 3 },
      { day: d(2), period: p(5), subjectCode: `ส${yr}102`, teacherEmail: te["ส_adv"], teachHour: 3 },
      { day: d(3), period: p(3), subjectCode: `ศ${yr}201`, teacherEmail: te["ศ"], teachHour: 2 },
      { day: d(4), period: p(3), subjectCode: `ศ${yr}201`, teacherEmail: te["ศ"], teachHour: 2 },
    );
  }
  
  return [...coreSlots, ...electives];
}
```

- [ ] **Step 3: Seed S1 responsibilities and class schedules**

```typescript
// ── S1 Teacher Responsibilities + Class Schedules ─────────────────────
console.log("📝 Seeding S1-2568 responsibilities + schedules...");

// Grade info lookup
type GradeInfo = { yearNum: number; sectionNum: number; track?: string };
const gradeInfoMap = new Map<string, GradeInfo>([
  ["M1-1",{yearNum:1,sectionNum:1}],["M1-2",{yearNum:1,sectionNum:2}],["M1-3",{yearNum:1,sectionNum:3}],
  ["M2-1",{yearNum:2,sectionNum:1}],["M2-2",{yearNum:2,sectionNum:2}],["M2-3",{yearNum:2,sectionNum:3}],
  ["M3-1",{yearNum:3,sectionNum:1}],["M3-2",{yearNum:3,sectionNum:2}],["M3-3",{yearNum:3,sectionNum:3}],
  ["M4-1",{yearNum:4,sectionNum:1,track:"SCIENCE_MATH"}],
  ["M4-2",{yearNum:4,sectionNum:2,track:"LANGUAGE_MATH"}],
  ["M4-3",{yearNum:4,sectionNum:3,track:"LANGUAGE_ARTS"}],
  ["M5-1",{yearNum:5,sectionNum:1,track:"SCIENCE_MATH"}],
  ["M5-2",{yearNum:5,sectionNum:2,track:"LANGUAGE_MATH"}],
  ["M5-3",{yearNum:5,sectionNum:3,track:"LANGUAGE_ARTS"}],
  ["M6-1",{yearNum:6,sectionNum:1,track:"SCIENCE_MATH"}],
  ["M6-2",{yearNum:6,sectionNum:2,track:"LANGUAGE_MATH"}],
  ["M6-3",{yearNum:6,sectionNum:3,track:"LANGUAGE_ARTS"}],
]);

let s1RespCount = 0;
let s1SchedCount = 0;
const ROOM_NAMES = ALL_ROOMS.map(r => r.name);

for (const grade of ALL_GRADES) {
  const info = gradeInfoMap.get(grade.id)!;
  const slots = info.yearNum <= 3
    ? buildLowerSecSlots(info.yearNum as 1|2|3, info.sectionNum as 1|2|3)
    : buildUpperSecSlots(info.yearNum as 4|5|6, info.track as "SCIENCE_MATH"|"LANGUAGE_MATH"|"LANGUAGE_ARTS");

  // Build responsibilities map: subjectCode → RespID
  // Group slots by (teacherEmail, subjectCode) to avoid duplicate resps
  const respKey = (email: string, code: string) => `${email}::${code}`;
  const respIDMap = new Map<string, number>();
  
  const uniqueResps = new Map<string, { teacherEmail: string; subjectCode: string; teachHour: number }>();
  for (const slot of slots) {
    const k = respKey(slot.teacherEmail, slot.subjectCode);
    if (!uniqueResps.has(k)) {
      uniqueResps.set(k, { teacherEmail: slot.teacherEmail, subjectCode: slot.subjectCode, teachHour: slot.teachHour });
    }
  }
  
  for (const [k, resp] of uniqueResps) {
    const tid = teacherMap.get(resp.teacherEmail)!;
    const existing = await prisma.teachers_responsibility.findFirst({
      where: { TeacherID: tid, GradeID: grade.id, SubjectCode: resp.subjectCode, AcademicYear: 2568, Semester: "SEMESTER_1" },
    });
    const r = existing ?? await withRetry(
      () => prisma.teachers_responsibility.create({
        data: { TeacherID: tid, GradeID: grade.id, SubjectCode: resp.subjectCode, AcademicYear: 2568, Semester: "SEMESTER_1", TeachHour: resp.teachHour },
      }),
      `Create resp ${resp.subjectCode}/${grade.id}/S1-2568`,
    );
    respIDMap.set(k, r.RespID);
    s1RespCount++;
  }
  
  // Seed class schedules
  for (let si = 0; si < slots.length; si++) {
    const slot = slots[si];
    const tsId = s1TimeslotMap.get(`${slot.day}${slot.period}`);
    if (!tsId) continue;
    
    const k = respKey(slot.teacherEmail, slot.subjectCode);
    const respId = respIDMap.get(k)!;
    
    // Room assignment: cycle through standard classrooms (0–11) by slot index
    const roomName = ROOM_NAMES[si % 12];
    const roomId = roomMap.get(roomName)!;
    
    try {
      await withRetry(
        () => prisma.class_schedule.create({
          data: {
            TimeslotID: tsId,
            SubjectCode: slot.subjectCode,
            GradeID: grade.id,
            RoomID: roomId,
            IsLocked: false,
            teachers_responsibility: { connect: [{ RespID: respId }] },
          },
        }),
        `Create schedule ${grade.id} ${slot.subjectCode} ${tsId}`,
      );
      s1SchedCount++;
    } catch (err: any) {
      if (!err.message?.includes("Unique constraint")) {
        console.warn(`⚠️ Skip schedule ${grade.id}/${tsId}: ${err.message}`);
      }
    }
  }
}
console.log(`✅ S1-2568: ${s1RespCount} responsibilities, ${s1SchedCount} class schedules`);
```

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts
git commit -m "chore(seed): implement S1-2568 full M.1-M.6 timetable with rotation scheduling"
```

---

## Task 7: Implement S2 timeslots + table_config (DRAFT)

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Seed S2 timeslots (same period structure as S1)**

```typescript
// ── S2 Timeslots (40) ─────────────────────────────────────────────────
console.log("⏰ Seeding S2-2568 timeslots...");
const s2TimeslotMap = new Map<string, string>();
for (const day of DAYS) {
  for (const p of PERIODS_2568) {
    const id = `2-2568-${day}${p.num}`;
    await withRetry(
      () => prisma.timeslot.upsert({
        where: { TimeslotID: id },
        update: {},
        create: {
          TimeslotID: id, AcademicYear: 2568, Semester: "SEMESTER_2",
          StartTime: new Date(`2024-01-01T${p.start}:00`),
          EndTime:   new Date(`2024-01-01T${p.end}:00`),
          Breaktime: p.brk, DayOfWeek: day,
        },
      }),
      `Upsert S2 timeslot ${id}`,
    );
    s2TimeslotMap.set(`${day}${p.num}`, id);
  }
}
console.log("✅ 40 S2-2568 timeslots");

// ── S2 table_config ────────────────────────────────────────────────────
await withRetry(
  () => prisma.table_config.upsert({
    where: { ConfigID: "2-2568" },
    update: {},
    create: {
      ConfigID: "2-2568", AcademicYear: 2568, Semester: "SEMESTER_2",
      Config: configTemplate, status: "DRAFT",
    },
  }),
  "Upsert table config 2-2568",
);
console.log("✅ table_config 2-2568 (DRAFT)");
```

- [ ] **Step 2: Commit**

```bash
git add prisma/seed.ts
git commit -m "chore(seed): add S2-2568 timeslots and DRAFT table_config"
```

---

## Task 8: Implement S2 conflict scenarios

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Scenario A — Teacher double-booked**

Create responsibilities first, then two class_schedules at the SAME timeslot with SAME teacher (no DB constraint on TimeslotID+TeacherID so this succeeds):

```typescript
// ── S2 Conflict Scenarios ─────────────────────────────────────────────
console.log("\n⚠️  Seeding S2-2568 conflict scenarios...");

// Helper: create resp + schedule in S2
async function s2Resp(teacherEmail: string, gradeId: string, subjectCode: string, teachHour: number) {
  const tid = teacherMap.get(teacherEmail)!;
  const existing = await prisma.teachers_responsibility.findFirst({
    where: { TeacherID: tid, GradeID: gradeId, SubjectCode: subjectCode, AcademicYear: 2568, Semester: "SEMESTER_2" },
  });
  return existing ?? await prisma.teachers_responsibility.create({
    data: { TeacherID: tid, GradeID: gradeId, SubjectCode: subjectCode, AcademicYear: 2568, Semester: "SEMESTER_2", TeachHour: teachHour },
  });
}

// SCENARIO A: Teacher double-booked
// T1 (Thai) teaches ท21101 to M1-1 AND M1-2 at same timeslot 2-2568-MON1
console.log("  Scenario A: teacher double-booking...");
const aResp1 = await s2Resp("teacher1@school.ac.th", "M1-1", "ท21101", 3);
const aResp2 = await s2Resp("teacher1@school.ac.th", "M1-2", "ท21101", 3);
const aTsId = s2TimeslotMap.get("MON1")!;

for (const [gradeId, respId, roomName] of [
  ["M1-1", aResp1.RespID, "ห้อง 101"],
  ["M1-2", aResp2.RespID, "ห้อง 102"],
] as [string, number, string][]) {
  try {
    await prisma.class_schedule.create({
      data: {
        TimeslotID: aTsId, SubjectCode: "ท21101", GradeID: gradeId,
        RoomID: roomMap.get(roomName)!, IsLocked: false,
        teachers_responsibility: { connect: [{ RespID: respId }] },
      },
    });
  } catch (err: any) {
    if (!err.message?.includes("Unique constraint")) console.warn(`⚠️ A: ${err.message}`);
  }
}

// T4 (Math) teaches ค21101 to M2-1 AND M2-2 at 2-2568-TUE2
const bResp1 = await s2Resp("teacher4@school.ac.th", "M2-1", "ค21101", 3);
const bResp2 = await s2Resp("teacher4@school.ac.th", "M2-2", "ค21101", 3);
const bTsId = s2TimeslotMap.get("TUE2")!;

for (const [gradeId, respId, roomName] of [
  ["M2-1", bResp1.RespID, "ห้อง 103"],
  ["M2-2", bResp2.RespID, "ห้อง 104"],
] as [string, number, string][]) {
  try {
    await prisma.class_schedule.create({
      data: {
        TimeslotID: bTsId, SubjectCode: "ค21101", GradeID: gradeId,
        RoomID: roomMap.get(roomName)!, IsLocked: false,
        teachers_responsibility: { connect: [{ RespID: respId }] },
      },
    });
  } catch (err: any) {
    if (!err.message?.includes("Unique constraint")) console.warn(`⚠️ A2: ${err.message}`);
  }
}
console.log("  ✅ Scenario A: 4 schedules (T1 and T4 each double-booked)");
```

- [ ] **Step 2: Scenario B — Overloaded teacher**

```typescript
// SCENARIO B: Teacher overloaded (TeachHour=10 per subject × 6 responsibilities = 60h/week)
console.log("  Scenario B: teacher overload...");
const overloadGrades = ["M3-1", "M3-2", "M3-3", "M1-1", "M1-2", "M1-3"];
for (const gradeId of overloadGrades) {
  const existing = await prisma.teachers_responsibility.findFirst({
    where: { TeacherID: teacherMap.get("teacher7@school.ac.th")!, GradeID: gradeId, SubjectCode: "ว21101", AcademicYear: 2568, Semester: "SEMESTER_2" },
  });
  if (!existing) {
    await prisma.teachers_responsibility.create({
      data: {
        TeacherID: teacherMap.get("teacher7@school.ac.th")!, GradeID: gradeId,
        SubjectCode: "ว21101", AcademicYear: 2568, Semester: "SEMESTER_2", TeachHour: 10,
      },
    });
  }
}
console.log("  ✅ Scenario B: T7 (Science) assigned 10h × 6 grades = 60h overload");
```

- [ ] **Step 3: Scenario C — Missing rooms (~40% null RoomID)**

```typescript
// SCENARIO C: Missing room assignments
// Create schedules for M4-1, M4-2, M4-3 with ~40% having RoomID=null
console.log("  Scenario C: missing room assignments...");
const scenarioCGrades = ["M4-1", "M4-2", "M4-3"];
const scenarioCSubjects = [
  { code: "ท31101", teacher: "teacher1@school.ac.th" },
  { code: "ค31101", teacher: "teacher4@school.ac.th" },
  { code: "ว31101", teacher: "teacher7@school.ac.th" },
  { code: "ส31101", teacher: "teacher11@school.ac.th" },
  { code: "อ31101", teacher: "teacher20@school.ac.th" },
];

let cSchedCount = 0;
for (let gi = 0; gi < scenarioCGrades.length; gi++) {
  const gradeId = scenarioCGrades[gi];
  const tsIds = ["MON2","MON3","TUE1","TUE3","WED1"].map(k => s2TimeslotMap.get(k)!);
  for (let si = 0; si < scenarioCSubjects.length; si++) {
    const subj = scenarioCSubjects[si];
    const tsId = tsIds[si];
    const resp = await s2Resp(subj.teacher, gradeId, subj.code, 2);
    // Null room for every other schedule entry (40% pattern)
    const useRoom = (gi * scenarioCSubjects.length + si) % 5 >= 2;
    const roomId = useRoom ? roomMap.get(ROOM_NAMES[si % 12])! : null;
    try {
      await prisma.class_schedule.create({
        data: {
          TimeslotID: tsId, SubjectCode: subj.code, GradeID: gradeId,
          RoomID: roomId, IsLocked: false,
          teachers_responsibility: { connect: [{ RespID: resp.RespID }] },
        },
      });
      cSchedCount++;
    } catch (err: any) {
      if (!err.message?.includes("Unique constraint")) console.warn(`⚠️ C: ${err.message}`);
    }
  }
}
console.log(`  ✅ Scenario C: ${cSchedCount} schedules with ~40% null rooms`);
```

- [ ] **Step 4: Scenario D — Sparse schedule (30% fill)**

```typescript
// SCENARIO D: Sparse schedule for M5-2, M6-3 (~30% fill)
console.log("  Scenario D: sparse schedules...");
const sparseDefs = [
  { gradeId: "M5-2", subjectCode: "ค32101", teacherEmail: "teacher5@school.ac.th", timeslotKeys: ["MON1","WED1"] },
  { gradeId: "M6-3", subjectCode: "ท33101", teacherEmail: "teacher3@school.ac.th", timeslotKeys: ["TUE1","THU1"] },
];
let dSchedCount = 0;
for (const def of sparseDefs) {
  const resp = await s2Resp(def.teacherEmail, def.gradeId, def.subjectCode, 2);
  for (const tsKey of def.timeslotKeys) {
    const tsId = s2TimeslotMap.get(tsKey)!;
    try {
      await prisma.class_schedule.create({
        data: {
          TimeslotID: tsId, SubjectCode: def.subjectCode, GradeID: def.gradeId,
          RoomID: roomMap.get("ห้อง 205")!, IsLocked: false,
          teachers_responsibility: { connect: [{ RespID: resp.RespID }] },
        },
      });
      dSchedCount++;
    } catch (err: any) {
      if (!err.message?.includes("Unique constraint")) console.warn(`⚠️ D: ${err.message}`);
    }
  }
}
console.log(`  ✅ Scenario D: ${dSchedCount} sparse schedules (M5-2, M6-3 ~30% fill)`);

console.log("\n✅ All S2-2568 conflict scenarios seeded");
console.log("   A: teacher double-booking | B: overload | C: null rooms | D: sparse");
```

- [ ] **Step 5: Add summary log at end of function**

```typescript
// ── Final summary ─────────────────────────────────────────────────────
console.log("\n" + "=".repeat(70));
console.log("🌐 Demo Data Seed 2568 Complete!");
console.log("=".repeat(70));
console.log(`   Subjects: ${ALL_SUBJECTS.length}`);
console.log(`   Programs: ${ALL_PROGRAMS.length}`);
console.log(`   Grades: ${ALL_GRADES.length}`);
console.log(`   Rooms: ${ALL_ROOMS.length}`);
console.log(`   Teachers: ${ALL_TEACHERS.length}`);
console.log(`   S1-2568: PUBLISHED — full M.1–M.6 timetable`);
console.log(`   S2-2568: DRAFT — conflict showcase (A/B/C/D)`);
console.log("=".repeat(70));
```

- [ ] **Step 6: Commit**

```bash
git add prisma/seed.ts
git commit -m "chore(seed): implement S2-2568 conflict showcase (teacher double-book, overload, null rooms, sparse)"
```

---

## Task 9: Update E2E fixture

**Files:**
- Modify: `e2e/fixtures/seed-data.fixture.ts`

- [ ] **Step 1: Update testSemesters and default semester**

Replace the `testSemesters` object and `testSemester` default:

```typescript
export const testSemesters = {
  semester1_2568: {
    SemesterAndyear: "1-2568" as const,
    Semester: 1 as semester,
    Year: 2568,
    DisplayName: "ภาคเรียนที่ 1/2568",
    IsActive: true,
  },
  semester2_2568: {
    SemesterAndyear: "2-2568" as const,
    Semester: 2 as semester,
    Year: 2568,
    DisplayName: "ภาคเรียนที่ 2/2568",
    IsActive: false,
  },
};

export const testSemester = testSemesters.semester1_2568;
```

- [ ] **Step 2: Update testTeachers**

Teacher IDs depend on auto-increment after clean seed. The E2E teacher email is deterministic; hardcoded IDs are fragile. Update to remove hardcoded TeacherIDs where possible, or document the dependency:

```typescript
export const testTeachers = {
  e2eTeacher: {
    Prefix: "ครู",
    Firstname: "E2E",
    Lastname: "ทดสอบ",
    Department: "คณิตศาสตร์",
    Email: "e2e.teacher@school.ac.th",
    SubjectCode: "ค21101",
    GradeID: "M1-1",
  },
  thaiTeacher: {
    Email: "teacher1@school.ac.th",
    Department: "ภาษาไทย",
  },
  mathTeacher: {
    Email: "teacher4@school.ac.th",
    Department: "คณิตศาสตร์",
  },
  scienceTeacher: {
    Email: "teacher7@school.ac.th",
    Department: "วิทยาศาสตร์และเทคโนโลยี",
  },
  englishTeacher: {
    Email: "teacher20@school.ac.th",
    Department: "ภาษาต่างประเทศ",
  },
};

export const testTeacher = testTeachers.e2eTeacher;
```

- [ ] **Step 3: Update testGradeLevels program names**

```typescript
export const testGradeLevels = {
  m1_1: {
    GradeID: "M1-1",
    GradeLevel: 1,
    Section: 1,
    DisplayName: "ม.1/1",
    Program: "M1-GEN",
  },
  m1_2: {
    GradeID: "M1-2",
    GradeLevel: 1,
    Section: 2,
    DisplayName: "ม.1/2",
    Program: "M1-GEN",
  },
  m4_1: {
    GradeID: "M4-1",
    GradeLevel: 4,
    Section: 1,
    DisplayName: "ม.4/1",
    Program: "M4-SCI",
  },
};
```

- [ ] **Step 4: Commit**

```bash
git add e2e/fixtures/seed-data.fixture.ts
git commit -m "chore(e2e): update seed-data fixture for 2568 — new semesters, teacher emails, program codes"
```

---

## Task 10: Scan for remaining 2567 references in E2E tests

**Files:**
- Various `e2e/*.spec.ts` and `__test__/**/*.ts`

- [ ] **Step 1: Find all hardcoded 2567 references**

```bash
grep -rn "2567\|1-2567\|2-2567" e2e/ --include="*.ts" | grep -v "node_modules"
```

- [ ] **Step 2: Update each reference**

For each file found, replace:
- `"1-2567"` → `"1-2568"`
- `"2-2567"` → `"2-2568"`
- `2567` (year) → `2568` where it refers to the seeded year
- `"ภาคเรียนที่ 1/2567"` → `"ภาคเรียนที่ 1/2568"` etc.

- [ ] **Step 3: Commit**

```bash
git add e2e/
git commit -m "chore(e2e): update all 2567→2568 references in E2E specs"
```

---

## Task 11: Local verification

- [ ] **Step 1: Run clean seed locally**

```bash
pnpm db:seed:clean
```

Expected output includes:
```
✅ 77 subjects (or similar count)
✅ 12 programs
✅ 18 grade levels
✅ 22 rooms
✅ 29 teachers
✅ 40 S1-2568 timeslots
✅ table_config 1-2568 (PUBLISHED)
✅ S1-2568: ~200 responsibilities, ~450+ class schedules
✅ 40 S2-2568 timeslots
✅ table_config 2-2568 (DRAFT)
⚠️  Scenario A: teacher double-booking
✅ Scenario B/C/D: ...
```

- [ ] **Step 2: Run typecheck and lint**

```bash
pnpm typecheck && pnpm lint
```

Expected: 0 errors.

- [ ] **Step 3: Run E2E smoke test (if server available)**

```bash
pnpm dev:e2e &
sleep 10
pnpm test:e2e --grep "semester"
```

- [ ] **Step 4: Commit any fixes from verification**

```bash
git add -p  # stage only what changed
git commit -m "fix(seed): correct any issues found during local verification"
```

---

## Task 12: Production reseed

**WARNING:** This will destructively replace production database seed data. Confirm with the user before proceeding.

> **Before this step:** Confirm `pnpm db:seed:clean` ran successfully locally and E2E passes.

- [ ] **Step 1: Pull production env**

```bash
# Install Vercel CLI if not present
npm i -g vercel
vercel env pull .env.production
```

- [ ] **Step 2: Run clean seed against production**

```bash
SEED_CLEAN_DATA=true pnpm dotenv -e .env.production -- tsx prisma/seed.ts
```

Expected: same success output as local (Step 11).

- [ ] **Step 3: Verify in prod UI**

Open production URL → navigate to timetable. Confirm semester selector shows `1/2568` and `2/2568`. Confirm S1 timetable has filled slots; S2 shows conflict indicators.

- [ ] **Step 4: Final push**

```bash
git status
git push
```

---

## Spec Coverage Check

| Spec requirement | Task |
|-----------------|------|
| KEEP_CONFIG_IDS = ["1-2568","2-2568"] | Task 1 |
| configTemplate: miniBreak + 50min lunch | Task 1 |
| ~77 subjects covering all MOE learning areas | Task 2 |
| 12 programs (3 GENERAL + 9 upper-sec tracks) | Task 3 |
| 18 grade levels, 22 rooms, 29 teachers | Task 3 |
| Program-subject links | Task 4 |
| 40 S1 timeslots with correct breaktime flags | Task 5 |
| S1 PUBLISHED table_config | Task 5 |
| ~200 S1 responsibilities, ~450 class schedules | Task 6 |
| 40 S2 timeslots | Task 7 |
| S2 DRAFT table_config | Task 7 |
| Scenario A: teacher double-booking | Task 8 |
| Scenario B: overloaded teacher (60h) | Task 8 |
| Scenario C: ~40% null rooms | Task 8 |
| Scenario D: sparse schedules (~30%) | Task 8 |
| E2E fixture updated | Task 9 |
| 2567 refs swept from E2E | Task 10 |
| Local verification | Task 11 |
| Prod reseed | Task 12 |
