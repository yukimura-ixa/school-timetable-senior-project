# Quick Start: Database Seeding

## What is this?

This seed creates a realistic mock database for a medium-sized Thai matthayom (secondary) school with:
- **60 teachers** across 8 departments
- **18 classes** (M.1-M.6, 3 sections each)
- **40 rooms** in 2 buildings
- **42+ subjects** (Thai curriculum)
- **Sample timetables** with edge cases

## Quick Commands

```bash
# 1. Install dependencies (if not done)
pnpm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Run seed
npx prisma db seed
```

## What Gets Created?

### Core Data
- ✅ 4 Programs (หลักสูตร)
- ✅ 18 Grade Levels (ระดับชั้น M.1-M.6)
- ✅ 40 Rooms (ห้องเรียน in 2 buildings)
- ✅ 60 Teachers (ครู with Thai names)
- ✅ 42 Subjects (วิชา - Thai curriculum)
- ✅ 40 Timeslots (ช่วงเวลา - 8 periods × 5 days)
- ✅ 100+ Teacher Responsibilities (ภาระงานสอน)
- ✅ 40+ Class Schedules (ตารางเรียน)
- ✅ 1 Timetable Config (การตั้งค่า)

### Edge Cases Included
- 🔒 **Locked timeslots** for school-wide activities (ชุมนุม, ลูกเสือ)
- ⏰ **Different break times** for junior (M.1-M.3) vs senior (M.4-M.6)
- 👥 **Multiple teacher assignments** to test workload distribution
- 📊 **Mixed credit subjects** (0.5 to 2.0 credits)
- 🏫 **Room conflicts** scenarios for testing

## Sample Data Preview

### Teachers
```
นายสมชาย สมบูรณ์ (teacher1@school.ac.th) - คณิตศาสตร์
นางสาววิชัย จิตรใจ (teacher2@school.ac.th) - คณิตศาสตร์
...
```

### Subjects
```
ท21101 - ภาษาไทย 1 (1.5 credits)
ค21101 - คณิตศาสตร์ 1 (1.5 credits)
ว21101 - วิทยาศาสตร์ 1 (1.5 credits)
...
```

### Schedule
```
MON Period 1-7: Regular classes
MON Period 8: ชุมนุม (LOCKED - all classes)
WED Period 8: ลูกเสือ/ยุวกาชาด (LOCKED - all classes)
...
```

## Resetting Data

To clear all data and re-seed:

```bash
# Option 1: Reset migrations (WARNING: deletes all data)
npx prisma migrate reset

# Option 2: Just run seed again (it clears data first)
npx prisma db seed
```

## Troubleshooting

### "ts-node: command not found"
```bash
pnpm add -D ts-node
```

### "DATABASE_URL environment variable is not set"
Create a `.env` file:
```env
DATABASE_URL="mysql://user:password@localhost:3306/school-timetable-db-dev"
```

### "Prisma Client not generated"
```bash
npx prisma generate
```

## More Information

For detailed documentation, see:
- 📖 [prisma/SEED_README.md](./SEED_README.md) - Complete seed documentation
- 🧪 [__test__/seed-validation.test.ts](../__test__/seed-validation.test.ts) - Seed validation tests
- 📊 [prisma/schema.prisma](./schema.prisma) - Database schema

## Test Results

All seed validation tests pass:
```
✓ Data Dimensions (3 tests)
✓ Grade Level Generation (2 tests)
✓ Room Generation (2 tests)
✓ Timeslot Generation (2 tests)
✓ Subject Data (3 tests)
✓ Period Schedule (4 tests)
✓ Edge Cases (2 tests)
✓ Data Integrity (2 tests)

Total: 20 tests, all passing ✅
```
