# Database Seed Documentation

## Overview

This seed file creates a comprehensive mock database based on a medium-sized Thai matthayom (secondary) school. The data is designed to support testing of all app logic features and cover common edge cases found in Thai school timetabling systems.

## Data Scale

The seed generates realistic data for a medium-sized Thai secondary school:

| Entity | Count | Description |
|--------|-------|-------------|
| **Programs** | 4 | Core curriculum (junior/senior) + electives (Science-Math, Arts-Language) |
| **Grade Levels** | 18 | M.1-M.6 with 3 sections each (101-603) |
| **Teachers** | 60 | Distributed across 8 departments |
| **Rooms** | 40 | 3 specialized buildings (Academic, Science, Sports/Arts) |
| **Subjects** | 42+ | Thai curriculum (core + elective + activities) |
| **Timeslots** | 40 | 8 periods/day × 5 days (MON-FRI) |
| **Teacher Responsibilities** | 100+ | Subject assignments per grade/teacher |
| **Class Schedules** | 40+ | Sample schedules including locked slots |

## Data Structure

### Programs (หลักสูตร)

1. **หลักสูตรแกนกลาง ม.ต้น** - Core curriculum for M.1-M.3
2. **หลักสูตรแกนกลาง ม.ปลาย** - Core curriculum for M.4-M.6
3. **หลักสูตรเพิ่มเติม วิทย์-คณิต** - Science-Math elective track
4. **หลักสูตรเพิ่มเติม ศิลป์-ภาษา** - Arts-Language elective track

### Grade Levels (ระดับชั้น)

- **M.1-M.3 (มัธยมต้น)**: Grades 101, 102, 103, 201, 202, 203, 301, 302, 303
- **M.4-M.6 (มัธยมปลาย)**: Grades 401, 402, 403, 501, 502, 503, 601, 602, 603

Each grade has:
- Year: 1-6
- Number: 1-3 (section/classroom number)
- Associated programs (core + elective based on track)

### Teachers (ครู)

60 teachers distributed across 8 departments:

1. **คณิตศาสตร์** - Mathematics (7-8 teachers)
2. **วิทยาศาสตร์** - Science (7-8 teachers)
3. **ภาษาไทย** - Thai Language (7-8 teachers)
4. **ภาษาอังกฤษ** - English (7-8 teachers)
5. **สังคมศึกษา** - Social Studies (7-8 teachers)
6. **ศิลปะ** - Arts (7-8 teachers)
7. **พลศึกษา** - Physical Education (7-8 teachers)
8. **การงานอาชีพ** - Career and Technology (7-8 teachers)

Each teacher has:
- Thai prefix (นาย, นางสาว, นาง, ครู, อาจารย์)
- Thai firstname and lastname (realistic names)
- Email: `teacher[N]@school.ac.th`
- Role: First teacher in each dept is "admin", others are "teacher"

### Rooms (ห้องเรียน)

40 classrooms across 3 buildings:

- **ตึกเรียน (Academic Building)**: 16 rooms
  - ห้อง 111, 112, 113, 114 (Floor 1)
  - ห้อง 121, 122, 123, 124 (Floor 2)
  - ห้อง 131, 132, 133, 134 (Floor 3)
  - ห้อง 141, 142, 143, 144 (Floor 4)

- **ตึกวิทยาศาสตร์ (Science Building)**: 16 rooms
  - ห้อง 211, 212, 213, 214 (Floor 1)
  - ห้อง 221, 222, 223, 224 (Floor 2)
  - ห้อง 231, 232, 233, 234 (Floor 3)
  - ห้อง 241, 242, 243, 244 (Floor 4)

- **ตึกกีฬา (Sports/Arts Building)**: 8 rooms
  - ห้อง 311, 312, 313, 314 (Floor 1)
  - ห้อง 321, 322, 323, 324 (Floor 2)

Room naming format: `ห้อง xyz` where x=building number, y=floor number, z=room number

### Subjects (วิชา)

#### Core Subjects (วิชาหลัก)

**ภาษาไทย (Thai Language)**
- ท21101: ภาษาไทย 1 (1.5 credits)
- ท21102: ภาษาไทย 2 (1.5 credits)
- ท21201: ภาษาไทย 3 (1.5 credits)
- ท31101: ภาษาไทย 4 (1.5 credits)
- ท31102: ภาษาไทย 5 (1.5 credits)

**คณิตศาสตร์ (Mathematics)**
- ค21101: คณิตศาสตร์ 1 (1.5 credits)
- ค21102: คณิตศาสตร์ 2 (1.5 credits)
- ค21201: คณิตศาสตร์ 3 (1.5 credits)
- ค31101: คณิตศาสตร์ 4 (1.5 credits)
- ค31201: คณิตศาสตร์เพิ่มเติม (1.0 credit) - Elective

**วิทยาศาสตร์ (Science)**
- ว21101: วิทยาศาสตร์ 1 (1.5 credits)
- ว21102: วิทยาศาสตร์ 2 (1.5 credits)
- ว21171: เคมี 1 (1.0 credit) - Elective
- ว21172: ชีววิทยา 1 (1.0 credit) - Elective
- ว21201: วิทยาศาสตร์ 3 (1.5 credits)
- ว31101: ฟิสิกส์ 1 (1.0 credit) - Elective

**ภาษาอังกฤษ (English)**
- อ21101: ภาษาอังกฤษ 1 (1.5 credits)
- อ21102: ภาษาอังกฤษ 2 (1.5 credits)
- อ21201: ภาษาอังกฤษ 3 (1.5 credits)
- อ31101: ภาษาอังกฤษ 4 (1.5 credits)
- อ31201: ภาษาอังกฤษสนทนา (1.0 credit) - Elective

**สังคมศึกษา (Social Studies)**
- ส21101: สังคมศึกษา 1 (1.5 credits)
- ส21102: สังคมศึกษา 2 (1.5 credits)
- ส21104: ประวัติศาสตร์ (1.0 credit)
- ส31101: สังคมศึกษา 4 (1.5 credits)

**พลศึกษา (Physical Education)**
- พ21101: พลศึกษา 1 (0.5 credit)
- พ21102: พลศึกษา 2 (0.5 credit)
- พ21103: สุขศึกษา (0.5 credit)
- พ31101: พลศึกษา 4 (0.5 credit)

**ศิลปะ (Arts)**
- ศ21101: ศิลปะ 1 (1.0 credit)
- ศ21102: ดนตรี (0.5 credit)
- ศ20201: นาฏศิลป์ (2.0 credits) - Special elective
- ศ31101: ศิลปะ 4 (1.0 credit)

**การงานอาชีพ (Career and Technology)**
- ง21101: การงานอาชีพ 1 (1.0 credit)
- ง21102: คอมพิวเตอร์ 1 (1.0 credit)
- ง21201: การงานอาชีพ 2 (1.0 credit)
- ง31101: คอมพิวเตอร์ 2 (1.0 credit)

#### Student Development Activities (กิจกรรมพัฒนาผู้เรียน)

- ชุมนุม: กิจกรรมชุมนุม (0.5 credit)
- ลูกเสือ/ยุวกาชาด: ลูกเสือ/ยุวกาชาด (0.5 credit)
- แนะแนว: แนะแนว (0.5 credit)
- โครงงาน: กิจกรรมโครงงาน (0.5 credit)
- จริยธรรม: จริยธรรม (0.5 credit)

### Timeslots (ช่วงเวลา)

**Schedule**: 5 days (MON-FRI) × 8 periods = 40 timeslots

| Period | Time | Break Type |
|--------|------|------------|
| 1 | 08:30-09:20 | None |
| 2 | 09:20-10:10 | None |
| 3 | 10:10-11:00 | None |
| 4 | 11:00-11:50 | None |
| **Lunch Break** | **11:50-12:50** | **60 minutes** |
| 5 | 12:50-13:40 | Junior break (after period 4) |
| 6 | 13:40-14:30 | Senior break (after period 5) |
| 7 | 14:30-15:20 | None |
| 8 | 15:20-16:10 | None |

**Timeslot ID Format**: `1/2567-{DAY}{PERIOD}`
- Example: `1/2567-MON1` = Semester 1, Year 2567, Monday Period 1

## Edge Cases Covered

### 1. Locked Timeslots (ช่วงเวลาล็อก)

The seed includes locked slots for school-wide activities:

- **Monday Period 8**: ชุมนุม (Club activities) - All 18 classes locked
- **Wednesday Period 8**: ลูกเสือ/ยุวกาชาด (Scout activities) - All 18 classes locked

These demonstrate:
- Multiple classes scheduled at the same time
- Periods that cannot be modified (IsLocked = true)
- Activities without specific room assignments

### 2. Multiple Teacher Assignments

Teachers are assigned to multiple classes:
- Each teacher typically teaches 2-3 different classes
- Some teachers handle both junior and senior levels
- Demonstrates workload distribution

### 3. Different Break Times

- **Junior students (M.1-M.3)**: Break after period 4
- **Senior students (M.4-M.6)**: Break after period 5
- Stored in `Breaktime` enum: `BREAK_JUNIOR`, `BREAK_SENIOR`, `BREAK_BOTH`, `NOT_BREAK`

### 4. Mixed Credit Subjects

Subjects range from 0.5 to 2.0 credits:
- 0.5 credits: PE, Activities
- 1.0 credit: Arts, Career subjects, Electives
- 1.5 credits: Core subjects (Thai, Math, Science, English, Social)
- 2.0 credits: Special subjects (นาฏศิลป์)

### 5. Room Assignment Scenarios

- Regular classes: Assigned to specific rooms
- Activities: No room assignment (RoomID = null)
- Can test room conflict detection

### 6. Teacher Responsibility Variations

- Different `TeachHour` values per assignment:
  - Core subjects: 3 periods/week
  - PE: 1 period/week
  - Arts: 2 periods/week
  - Career: 1 period/week
  - Activities: 1 period/week

## Usage

### Running the Seed

```bash
# Install dependencies (including ts-node)
pnpm install

# Generate Prisma Client
npx prisma generate

# Run migrations (if needed)
npx prisma migrate dev

# Execute seed
npx prisma db seed
```

### Seed Output

The seed provides detailed console output:

```
🌱 Starting seed...
🗑️  Cleaning existing data...
✅ Existing data cleaned
📚 Creating programs...
✅ Created 4 programs
🎓 Creating grade levels...
✅ Created 18 grade levels
🏫 Creating rooms...
✅ Created 40 rooms
👨‍🏫 Creating teachers...
✅ Created 60 teachers
📖 Creating subjects...
✅ Created 42 subjects
⏰ Creating timeslots...
✅ Created 40 timeslots
📝 Creating teacher responsibilities...
✅ Created 100+ teacher responsibilities
📅 Creating sample class schedules...
✅ Created 40+ class schedules (including locked slots)
⚙️  Creating timetable configuration...
✅ Created timetable configuration

================================================================
🎉 Seed completed successfully!
================================================================
📊 Database Summary:
   • Programs: 4
   • Grade Levels: 18 (M.1-M.6, 3 sections each)
   • Rooms: 40 (2 buildings)
   • Teachers: 60 (8 departments)
   • Subjects: 42 (Thai curriculum)
   • Timeslots: 40 (5 days × 8 periods)
   • Teacher Responsibilities: 100+
   • Class Schedules: 40+ (including locked slots)
   • Table Configurations: 1
================================================================

✨ Your mock database is ready for testing!
💡 Edge cases included:
   - Locked timeslots for school-wide activities
   - Multiple teacher assignments
   - Different break times for junior/senior
   - Mixed credit subjects (0.5 to 2.0)
   - Room assignments and conflicts
================================================================
```

### Resetting the Database

To clear all data and re-seed:

```bash
# Option 1: Reset and migrate
npx prisma migrate reset

# Option 2: Delete data manually then seed
npx prisma db seed
```

## Testing Scenarios

The seeded data supports testing these scenarios:

1. **Conflict Detection**:
   - Teacher teaching multiple classes at the same time
   - Room double-booking
   - Class scheduled during break time

2. **Schedule Management**:
   - Creating new schedules for empty periods
   - Moving schedules to different timeslots
   - Attempting to modify locked slots (should fail)

3. **Teacher Workload**:
   - Viewing all classes a teacher is responsible for
   - Calculating total teaching hours per week
   - Identifying over/under-allocated teachers

4. **Room Utilization**:
   - Finding available rooms for a given timeslot
   - Identifying room conflicts
   - Generating room usage reports

5. **Curriculum Coverage**:
   - Verifying all required subjects are scheduled
   - Checking credit hour requirements per grade
   - Identifying missing subject assignments

6. **Export Functions**:
   - Teacher schedules (individual)
   - Class schedules (by grade)
   - Combined schedules (all teachers matrix)
   - Curriculum summary

7. **Copy/Template Functions**:
   - Copying schedules between semesters
   - Using previous term as template
   - Bulk schedule operations

## Data Characteristics

### Realistic Thai Names

- **Prefixes**: นาย, นางสาว, นาง, ครู, อาจารย์
- **Firstnames**: 60 common Thai firstnames
- **Lastnames**: 60 common Thai lastnames
- Random combination ensures unique teachers

### Thai Subject Codes

Follows standard Thai Ministry of Education coding:
- **ท** (Thai Language)
- **ค** (Mathematics)
- **ว** (Science)
- **อ** (English/Foreign Language)
- **ส** (Social Studies)
- **พ** (Physical Education)
- **ศ** (Arts)
- **ง** (Career/Technology)

Format: `[Category][Level][Sequence]`
- Example: `ท21101` = Thai Language, Level 2 (M.1-M.3), Course 1, Version 01

### Academic Calendar

- **Year**: 2567 (Thai Buddhist calendar = 2024 CE)
- **Semester**: 1 (First semester)
- **School Days**: Monday to Friday
- **Periods per Day**: 8 periods
- **Period Duration**: 50 minutes

## Customization

To customize the seed data, modify these constants in `prisma/seed.ts`:

```typescript
// Adjust school size
const teachersPerDept = Math.floor(60 / DEPARTMENTS.length); // Change 60

// Adjust number of grade sections
for (let section = 1; section <= 3; section++) // Change 3

// Adjust rooms
const roomsPerFloor = 5; // Change 5

// Adjust periods
const periods = [ /* ... */ ]; // Modify periods array

// Adjust academic year
const academicYear = 2567; // Change year
```

## Troubleshooting

### Seed Fails with Foreign Key Error

Ensure migrations are up to date:
```bash
npx prisma migrate dev
npx prisma generate
```

### ts-node Not Found

Install ts-node:
```bash
pnpm add -D ts-node
```

### Database Connection Error

Check your `.env` file has correct `DATABASE_URL`:
```env
DATABASE_URL="mysql://user:password@localhost:3306/school-timetable-db-dev"
```

### Prisma Client Out of Sync

Regenerate Prisma Client:
```bash
npx prisma generate
```

## Additional Resources

- **Database Schema**: See `prisma/schema.prisma`
- **ER Diagram**: See `database/er-diagram.mwb`
- **SQL Backup**: See `database/school-timetable-db-dev_backup.sql`
- **Project Documentation**: See `README.md`

## Contributing

When adding new seed data:
1. Maintain realistic Thai naming conventions
2. Ensure foreign key relationships are valid
3. Include comments explaining edge cases
4. Update this documentation
5. Test the seed thoroughly

## License

Part of the School Timetable Senior Project by KMITL students.
See project README for full license information.
