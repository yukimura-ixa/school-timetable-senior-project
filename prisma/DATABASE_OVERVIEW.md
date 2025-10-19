# Mock Database Structure Overview

## Visual Summary

```
🏫 Mock Thai Matthayom School Database
═══════════════════════════════════════════════════════════════

📚 PROGRAMS (4)
├─ หลักสูตรแกนกลาง ม.ต้น (Core M.1-M.3)
├─ หลักสูตรแกนกลาง ม.ปลาย (Core M.4-M.6)
├─ หลักสูตรเพิ่มเติม วิทย์-คณิต (Science-Math Elective)
└─ หลักสูตรเพิ่มเติม ศิลป์-ภาษา (Arts-Language Elective)

🎓 GRADE LEVELS (18)
Junior High (มัธยมต้น)          Senior High (มัธยมปลาย)
├─ M.1: 101, 102, 103           ├─ M.4: 401, 402, 403
├─ M.2: 201, 202, 203           ├─ M.5: 501, 502, 503
└─ M.3: 301, 302, 303           └─ M.6: 601, 602, 603

🏢 ROOMS (40)
ตึกเรียน (Academic Building)
├─ ห้อง 111-114, 121-124, 131-134, 141-144 (16 rooms)
└─ 4 floors, 4 rooms per floor

ตึกวิทยาศาสตร์ (Science Building)
├─ ห้อง 211-214, 221-224, 231-234, 241-244 (16 rooms)
└─ 4 floors, 4 rooms per floor

ตึกกีฬา (Sports/Arts Building)
├─ ห้อง 311-314, 321-324 (8 rooms)
└─ 2 floors, 4 rooms per floor

Format: ห้อง xyz (x=building, y=floor, z=room)

👨‍🏫 TEACHERS (60) - 8 Departments
├─ คณิตศาสตร์ (Math) .............. 7 teachers
├─ วิทยาศาสตร์ (Science) ......... 7 teachers
├─ ภาษาไทย (Thai) ................ 7 teachers
├─ ภาษาอังกฤษ (English) ........... 7 teachers
├─ สังคมศึกษา (Social) ........... 7 teachers
├─ ศิลปะ (Arts) ................... 7 teachers
├─ พลศึกษา (PE) ................... 7 teachers
└─ การงานอาชีพ (Career) ........... 7 teachers

📖 SUBJECTS (42+)
Core Subjects (วิชาหลัก)
├─ ท21101-ท31102: Thai Language (5 subjects)
├─ ค21101-ค31201: Mathematics (5 subjects)
├─ ว21101-ว31101: Science (6 subjects)
├─ อ21101-อ31201: English (5 subjects)
├─ ส21101-ส31101: Social Studies (4 subjects)
├─ พ21101-พ31101: PE (4 subjects)
├─ ศ21101-ศ31101: Arts (4 subjects)
└─ ง21101-ง31101: Career/Tech (4 subjects)

Activities (กิจกรรม)
├─ ชุมนุม: Club activities
├─ ลูกเสือ/ยุวกาชาด: Scouts
├─ แนะแนว: Guidance
├─ โครงงาน: Projects
└─ จริยธรรม: Ethics

⏰ SCHEDULE (8 periods × 5 days = 40 timeslots)

       MON    TUE    WED    THU    FRI
P1   08:30  08:30  08:30  08:30  08:30  Regular
P2   09:20  09:20  09:20  09:20  09:20  Classes
P3   10:10  10:10  10:10  10:10  10:10  
P4   11:00  11:00  11:00  11:00  11:00  
     ═════  ═════  ═════  ═════  ═════  LUNCH 60min
P5   12:50  12:50  12:50  12:50  12:50  Junior Break
P6   13:40  13:40  13:40  13:40  13:40  Senior Break
P7   14:30  14:30  14:30  14:30  14:30  Regular
P8   15:20  15:20  15:20  15:20  15:20  Activities
     🔒    ─────  🔒    ─────  ─────
     ชุมนุม        ลูกเสือ              (LOCKED)
```

## Credit Distribution

```
Subject Type          Credits    Examples
═══════════════════════════════════════════════════
Core Academic         1.5 cr     ภาษาไทย, คณิต, วิทย์
Standard Subjects     1.0 cr     ศิลปะ, การงาน, electives
PE & Health           0.5 cr     พลศึกษา, สุขศึกษา
Special Arts          2.0 cr     นาฏศิลป์
Activities            0.5 cr     ชุมนุม, ลูกเสือ
```

## Sample Class Schedule (M.1/01)

```
วัน/คาบ    P1      P2      P3      P4      LUNCH   P5      P6      P7      P8
─────────────────────────────────────────────────────────────────────────────
MON        ไทย     คณิต    วิทย์   อังกฤษ  [60min] สังคม  ศิลปะ   การงาน  ชุมนุม🔒
TUE        อังกฤษ  ไทย     คณิต    วิทย์   [60min] พละ     สังคม  ศิลปะ   [free]
WED        คณิต    วิทย์   ไทย     อังกฤษ  [60min] การงาน  สังคม  แนะแนว  ลูกเสือ🔒
THU        วิทย์   คณิต    ไทย     อังกฤษ  [60min] ศิลปะ   พละ     การงาน  [free]
FRI        ไทย     อังกฤษ  คณิต    วิทย์   [60min] การงาน  สังคม   โครงงาน จริยธรรม

🔒 = Locked slot (all 18 classes have same activity)
```

## Teacher Responsibility Example

```
Teacher: นายสมชาย สมบูรณ์
Department: คณิตศาสตร์
Email: teacher1@school.ac.th

Teaching Assignments:
├─ ค21101 (คณิตศาสตร์ 1) → Grade 101 (M.1/1) - 3 periods/week
├─ ค21101 (คณิตศาสตร์ 1) → Grade 102 (M.1/2) - 3 periods/week
└─ ค21101 (คณิตศาสตร์ 1) → Grade 103 (M.1/3) - 3 periods/week

Total Teaching Load: 9 periods/week
```

## Edge Cases Demonstrated

### 1. Locked Timeslots
```
MON Period 8 - All 18 classes
  101 → ชุมนุม (LOCKED)
  102 → ชุมนุม (LOCKED)
  103 → ชุมนุม (LOCKED)
  ... (15 more classes)
  
WED Period 8 - All 18 classes
  101 → ลูกเสือ/ยุวกาชาด (LOCKED)
  102 → ลูกเสือ/ยุวกาชาด (LOCKED)
  ... (16 more classes)
```

### 2. Break Time Differences
```
Junior Students (M.1-M.3)
  Period 4: 11:00-11:50
  LUNCH BREAK: 11:50-12:50 (60 min)
  Period 5: 12:50-13:40 ← BREAK_JUNIOR
  
Senior Students (M.4-M.6)
  Period 5: 12:50-13:40
  Period 6: 13:40-14:30 ← BREAK_SENIOR
```

### 3. Multiple Teacher Assignments
```
Teacher A teaches:
  - Math to 101, 102, 103 (3 classes × 3 periods = 9 periods)
  - Total: 9 periods/week

Teacher B teaches:
  - Thai to 101 (3 periods)
  - Thai to 201 (3 periods)
  - Total: 6 periods/week
```

### 4. Room Assignment Scenarios
```
Regular Classes:
  MON P1: ไทย @ Room 1101
  MON P2: คณิต @ Room 1101
  
Activities (no room):
  MON P8: ชุมนุม @ null (outdoor/various)
  WED P8: ลูกเสือ @ null (field/various)
```

### 5. Conflict Scenarios
```
Potential Teacher Conflict:
  Teacher X teaching 101 at MON P1
  + Teacher X teaching 102 at MON P1
  = CONFLICT! ❌

Potential Room Conflict:
  Class 101 using Room 1101 at MON P1
  + Class 102 using Room 1101 at MON P1
  = CONFLICT! ❌

Valid Locked Slot:
  All 18 classes at MON P8 for ชุมนุม
  = OK! ✅ (school-wide activity)
```

## Data Relationships

```
program (4)
  ↓ many-to-many
gradelevel (18) ────┐
  ↓ one-to-many    │
class_schedule (40+)│
  ↓                 │
  ├─ timeslot (40) │
  ├─ subject (42)  │
  ├─ room (40)     │
  └─ teachers_resp │
       ↓            │
       ├─ teacher (60)
       ├─ subject (42)
       └─ gradelevel ←┘
```

## Testing Use Cases

### ✅ Supported Test Scenarios

1. **Schedule Creation**
   - Assign class to empty period
   - Detect teacher conflicts
   - Detect room conflicts
   - Verify break time rules

2. **Schedule Modification**
   - Move class to different period
   - Attempt to modify locked slot (should fail)
   - Swap two classes

3. **Teacher Management**
   - View teacher workload
   - Find available teachers for period
   - Calculate total teaching hours

4. **Room Management**
   - Find available rooms
   - Identify room conflicts
   - Generate room usage report

5. **Reports & Export**
   - Teacher schedule by teacher
   - Class schedule by grade
   - Combined schedule matrix
   - Curriculum coverage report

6. **Edge Cases**
   - Handle locked slots
   - Respect break times
   - Multiple program assignments
   - Activities without rooms

## Quick Stats

```
Entity                Count    Notes
═══════════════════════════════════════════════════
Programs              4        2 core + 2 elective
Grade Levels          18       M.1-M.6 × 3 sections
Teachers              60       8 departments
Rooms                 40       3 specialized buildings
Subjects              42+      Core + electives + activities
Timeslots             40       5 days × 8 periods
Teacher Resp.         100+     Assignments per semester
Class Schedules       40+      Sample + locked slots
Table Config          1        System configuration
═══════════════════════════════════════════════════
Total Records         ~350     Ready for testing!
```

## Commands Reference

```bash
# Seed database
npx prisma db seed

# Reset and reseed
npx prisma migrate reset

# View database
npx prisma studio

# Run validation tests
npm test -- __test__/seed-validation.test.ts
```

---

**Generated by:** Prisma Seed Script  
**Version:** 1.0  
**Date:** 2024  
**For:** School Timetable Senior Project @ KMITL
