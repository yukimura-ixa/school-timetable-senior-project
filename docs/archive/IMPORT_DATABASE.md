# Import Database to Prisma Postgres - Step-by-Step Guide

## Overview

Your `seed.ts` contains comprehensive data for a Thai secondary school:

- ✅ 60 Teachers across 8 departments
- ✅ 40 Classrooms in 3 buildings
- ✅ 18 Grade levels (M.1-M.6, 3 sections each)
- ✅ 50+ Thai curriculum subjects
- ✅ Complete timetable configuration
- ✅ Realistic teacher assignments

We'll use Prisma's seeding feature to import this data into your PostgreSQL database.

---

## Step 1: Get Your Direct Database URL

1. **Go to Prisma Console**: [console.prisma.io](https://console.prisma.io)

2. **Navigate to your database**:
   - Click on your project
   - You should see your Prisma Postgres database

3. **Copy the Direct Connection String**:
   - Click "Connection Strings" or similar
   - Find the **Direct Connection** (not Accelerate)
   - It looks like: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require`

4. **Update your `.env` file**:

   Replace this line:

   ```env
   DIRECT_DATABASE_URL="ADD_YOUR_DIRECT_CONNECTION_STRING_HERE"
   ```

   With your actual connection string:

   ```env
   DIRECT_DATABASE_URL="postgresql://av4z6...@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
   ```

---

## Step 2: Create Database Schema

Run this command to create all tables in PostgreSQL:

```powershell
pnpm prisma migrate dev --name init-postgresql
```

This will:

- ✅ Create all tables (teacher, room, subject, gradelevel, etc.)
- ✅ Set up foreign keys and indexes
- ✅ Create enums for day_of_week, semester, etc.
- ✅ Generate migration history

**Expected Output:**

```
✔ Created database (if didn't exist)
✔ Applied migration 20XX_init-postgresql
✔ Generated Prisma Client
```

---

## Step 3: Import Data Using Seed

Now populate your database with the comprehensive seed data:

```powershell
pnpm prisma db seed
```

This will create:

- **Programs**: Core curriculum, science-math, language programs
- **Grade Levels**: M.1/1 through M.6/3 (18 classes)
- **Rooms**: 40 classrooms across 3 buildings
- **Teachers**: 60 teachers with Thai names, distributed across departments
- **Subjects**: 50+ Thai curriculum subjects with proper codes
- **Timeslots**: 8 periods × 5 days (MON-FRI)
- **Teacher Responsibilities**: Subject assignments for all teachers
- **Table Config**: Semester configuration

**Expected Output:**

```
🌱 Starting seed...
🗑️  Cleaning existing data...
✅ Existing data cleaned
📚 Creating programs...
✅ Created 8 programs
👥 Creating grade levels...
✅ Created 18 grade levels
🏫 Creating rooms...
✅ Created 40 rooms
👨‍🏫 Creating teachers...
✅ Created 60 teachers
📖 Creating subjects...
✅ Created 50 subjects
🕐 Creating timeslots...
✅ Created 40 timeslots (8 periods × 5 days)
📝 Creating teacher responsibilities...
✅ Created 120+ teacher responsibilities
⚙️  Creating table config...
✅ Created config for 2567/1
🌟 Seed completed successfully!
```

---

## Step 4: Verify Import

### Option A: Using Prisma Studio (Visual)

```powershell
pnpm prisma studio
```

Opens a web interface where you can:

- Browse all tables
- View teacher data
- Check timetable assignments
- Verify relationships

### Option B: Using Query (Command Line)

```powershell
# Count records in each table
pnpm prisma db execute --stdin <<EOF
SELECT
  'teachers' as table_name, COUNT(*) as count FROM teacher
UNION ALL SELECT 'rooms', COUNT(*) FROM room
UNION ALL SELECT 'subjects', COUNT(*) FROM subject
UNION ALL SELECT 'grade_levels', COUNT(*) FROM gradelevel
UNION ALL SELECT 'timeslots', COUNT(*) FROM timeslot
UNION ALL SELECT 'responsibilities', COUNT(*) FROM teachers_responsibility;
EOF
```

---

## Step 5: Test Your Application

Start the development server:

```powershell
pnpm dev
```

Visit: http://localhost:3000

Test these features:

- ✅ View teacher list (should show 60 teachers)
- ✅ View rooms (should show 40 rooms)
- ✅ View subjects (should show 50+ subjects)
- ✅ View grade levels (M.1/1 through M.6/3)
- ✅ Check timetable configuration

---

## Troubleshooting

### Error: "Environment variable not found: DIRECT_DATABASE_URL"

**Solution**: Make sure you added the direct connection string to `.env`

```env
DIRECT_DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

### Error: "Can't reach database server"

**Solutions**:

1. Check your connection string is correct
2. Verify your IP is whitelisted (if using Prisma Cloud)
3. Ensure database is running
4. Try pinging the host

### Error: "Migration failed"

**Solution**: Reset and try again:

```powershell
pnpm prisma migrate reset
pnpm prisma migrate dev --name init-postgresql
pnpm prisma db seed
```

**⚠️ Warning**: `migrate reset` will delete all data!

### Seed Fails Partway

**Solution**: The seed script cleans data first, so just run it again:

```powershell
pnpm prisma db seed
```

### Want to Re-import Data

**Solution**: Run seed again (it cleans before importing):

```powershell
pnpm prisma db seed
```

---

## Understanding the Seeded Data

### Teachers (60 total)

- Distributed across 8 departments
- Thai names with appropriate prefixes (นาย, นาง, นางสาว, ครู)
- Realistic email addresses
- Department-specific assignments

### Rooms (40 total)

- **Building 1 (ตึกเรียน)**: Rooms 101-120 (20 rooms)
- **Building 2 (ตึกวิทยาศาสตร์)**: Rooms 201-210 (10 rooms)
- **Building 3 (ตึกกีฬา)**: Rooms 301-310 (10 rooms)

### Grade Levels (18 total)

- **ม.ต้น (Junior)**: M.1/1, M.1/2, M.1/3, M.2/1-3, M.3/1-3 (9 classes)
- **ม.ปลาย (Senior)**: M.4/1, M.4/2, M.4/3, M.5/1-3, M.6/1-3 (9 classes)

### Subjects (50+)

Core subjects for Thai curriculum:

- **Thai Language**: TH101-TH106
- **Mathematics**: MA101-MA106
- **Science**: SC101-SC106
- **English**: EN101-EN106
- **Social Studies**: SS101-SS106
- **Physical Education**: PE101-PE106
- **Arts**: AR101-AR106
- **Career Education**: CA101-CA106
- **Additional subjects**: Health, ICT, etc.

### Timeslots (40)

- **8 periods per day**: 08:00-15:30
- **5 days**: Monday to Friday
- **Break times**:
  - Morning break (BREAK_JUNIOR/SENIOR)
  - Lunch break (BREAK_BOTH)
- **Academic Year**: 2567 (2024)
- **Semester**: 1

---

## Next Steps After Import

1. **✅ Verify data** in Prisma Studio or your app
2. **✅ Test timetable creation** features
3. **✅ Configure teacher assignments** if needed
4. **✅ Set up locked timeslots** for assemblies
5. **✅ Test conflict detection** logic
6. **✅ Deploy to Vercel** (see DEPLOYMENT.md)

---

## Alternative: Import from MySQL Backup

If you need to import from your MySQL backup instead of seed data:

### Option 1: Use pgloader (Recommended)

```bash
# Install pgloader (if not installed)
# Windows: Download from https://pgloader.io/

# Run conversion
pgloader mysql://user:pass@host/school-timetable-db-dev \
          postgresql://user:pass@host:5432/postgres
```

### Option 2: Convert SQL Dump Manually

This is complex and error-prone. The seed approach is much cleaner.

---

## Quick Reference Commands

```powershell
# Get direct URL, then add to .env
# Then run these in order:

# 1. Create schema
pnpm prisma migrate dev --name init-postgresql

# 2. Import data
pnpm prisma db seed

# 3. View data
pnpm prisma studio

# 4. Start app
pnpm dev

# Reset everything (CAUTION: Deletes data)
pnpm prisma migrate reset
```

---

**Ready to import!** Follow Steps 1-5 above to get your database populated with comprehensive Thai school data.
