# Prisma 6 Migration Complete + PostgreSQL Setup Guide

## ✅ Migration Status

### Completed Steps

1. **✅ Updated Prisma packages to v6.18.0**
   - `@prisma/client@6.18.0`
   - `prisma@6.18.0`

2. **✅ Migrated schema.prisma from MySQL to PostgreSQL**
   - Changed provider from `mysql` to `postgresql`
   - Added `directUrl` for migrations
   - Fixed foreign key constraint naming conflicts (PostgreSQL is stricter)
   - Renamed index maps to avoid conflicts

3. **✅ Created prisma.config.ts (Prisma 6 best practice)**
   - Removed deprecated `package.json#prisma` section
   - Created new `prisma.config.ts` with proper seed configuration
   - No more deprecation warnings

4. **✅ Verified no deprecated runtime imports**
   - No `@prisma/client/runtime` imports found
   - All code is Prisma 6 compatible

### Key Breaking Changes Addressed

From Prisma 6 upgrade documentation:

- ✅ **jsonProtocol is GA** - Already not using preview features
- ✅ **Runtime imports changed** - Not using any, so no changes needed
- ✅ **Config file migration** - Moved from package.json to prisma.config.ts
- ✅ **PostgreSQL constraint naming** - Fixed all constraint name conflicts

---

## 🔧 Required: Complete Database Setup

### Step 1: Get Your Direct Database URL

You're using Prisma Postgres with Accelerate. You need TWO connection strings:

1. **DATABASE_URL** (already set) - Uses Accelerate for connection pooling
2. **DIRECT_DATABASE_URL** (needs to be added) - Direct connection for migrations

#### How to Get Your Direct Connection String:

1. Go to [console.prisma.io](https://console.prisma.io)
2. Select your database
3. Click "Connection Strings"
4. Copy the **Direct Connection** string
5. It should look like:
   ```
   postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
   ```

#### Update Your .env File:

Replace this line in your `.env`:
```env
DIRECT_DATABASE_URL="ADD_YOUR_DIRECT_CONNECTION_STRING_HERE"
```

With your actual direct connection string:
```env
DIRECT_DATABASE_URL="postgresql://user:pass@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

---

### Step 2: Push Schema to Database

After adding your `DIRECT_DATABASE_URL`, run ONE of these commands:

#### Option A: Create Initial Migration (Recommended for Production)
```powershell
pnpm prisma migrate dev --name init-postgresql
```

This creates a migration file and applies it. Good for version control.

#### Option B: Quick Push (Development Only)
```powershell
pnpm prisma db push
```

This pushes schema changes without creating migration files. Faster but no migration history.

---

### Step 3: Seed the Database (Optional)

If you have seed data:
```powershell
pnpm prisma db seed
```

---

### Step 4: Test Your Application

Start the dev server:
```powershell
pnpm dev
```

---

## 📊 Schema Changes Summary

### Foreign Key Constraint Naming

PostgreSQL requires unique constraint names across all indexes and foreign keys. Updated:

**Before (MySQL):**
```prisma
gradelevel @relation(fields: [GradeID], references: [GradeID], onDelete: Cascade)
@@index([GradeID], map: "class_schedule_GradeID_fkey")
```

**After (PostgreSQL):**
```prisma
gradelevel @relation(fields: [GradeID], references: [GradeID], onDelete: Cascade, map: "fk_class_schedule_grade")
@@index([GradeID], map: "class_schedule_GradeID_idx")
```

### All Renamed Constraints:

| Model | Old Index Name | New FK Name | New Index Name |
|-------|---------------|-------------|----------------|
| class_schedule | class_schedule_GradeID_fkey | fk_class_schedule_grade | class_schedule_GradeID_idx |
| class_schedule | class_schedule_RoomID_fkey | fk_class_schedule_room | class_schedule_RoomID_idx |
| class_schedule | class_schedule_SubjectCode_fkey | fk_class_schedule_subject | class_schedule_SubjectCode_idx |
| class_schedule | class_schedule_TimeslotID_fkey | fk_class_schedule_timeslot | class_schedule_TimeslotID_idx |
| subject | subject_ProgramID_fkey | fk_subject_program | subject_ProgramID_idx |
| teachers_responsibility | teachers_responsibility_TeacherID_fkey | fk_teachers_responsibility_teacher | teachers_responsibility_TeacherID_idx |
| teachers_responsibility | teachers_responsibility_GradeID_fkey | fk_teachers_responsibility_grade | teachers_responsibility_GradeID_idx |
| teachers_responsibility | teachers_responsibility_SubjectCode_fkey | fk_teachers_responsibility_subject | teachers_responsibility_SubjectCode_idx |

---

## 🔄 MySQL vs PostgreSQL Differences

### Data Types
All your data types are compatible! No changes needed:
- ✅ String → TEXT/VARCHAR
- ✅ Int → INTEGER
- ✅ DateTime @db.Time(0) → TIME
- ✅ Boolean → BOOLEAN
- ✅ Json → JSONB (better in PostgreSQL!)
- ✅ Enums → Native PostgreSQL ENUMs

### Connection Pooling
- **MySQL**: You handled connections yourself
- **PostgreSQL + Accelerate**: Connection pooling handled automatically
- **Benefit**: Better performance, especially on serverless (Vercel)

### Performance
PostgreSQL generally performs better for:
- Complex queries with JOINs
- Full-text search
- JSON operations (uses JSONB)
- Concurrent writes

---

## 🚨 Important Notes

### Environment Variables

Your `.env` now requires:
```env
# For application queries (connection pooling)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."

# For migrations (direct connection) - GET THIS FROM CONSOLE.PRISMA.IO
DIRECT_DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

### Vercel Deployment

When deploying to Vercel, add BOTH environment variables:
1. `DATABASE_URL` - Accelerate URL (for runtime)
2. `DIRECT_DATABASE_URL` - Direct URL (for build-time migrations)

### Migration Commands Reference

```powershell
# Check migration status
pnpm prisma migrate status

# Create and apply migration
pnpm prisma migrate dev --name <name>

# Apply migrations in production
pnpm prisma migrate deploy

# Reset database (CAUTION: Deletes all data)
pnpm prisma migrate reset

# Push schema without migrations (dev only)
pnpm prisma db push

# Pull schema from database
pnpm prisma db pull

# Seed database
pnpm prisma db seed

# Open Prisma Studio
pnpm prisma studio
```

---

## ✨ Prisma 6 New Features You Can Use

### 1. TypedSQL (Preview)
Write raw SQL with full type safety:
```typescript
import { sql } from '@prisma/client'

const result = await sql`SELECT * FROM users WHERE id = ${id}`
```

### 2. Improved Error Messages
Better error messages with more context and suggestions.

### 3. Better Performance
- Faster query engine
- Optimized connection handling
- Improved batch operations

### 4. Native JSON Operations
PostgreSQL's JSONB support is now fully optimized:
```typescript
await prisma.table_config.findMany({
  where: {
    Config: {
      path: ['someKey'],
      equals: 'someValue'
    }
  }
})
```

---

## 🐛 Troubleshooting

### "URL must start with mysql://"
❌ **Problem**: Still using MySQL connection string
✅ **Solution**: Update `DATABASE_URL` to use `prisma+postgres://` or `postgresql://`

### "Environment variable not found: DIRECT_DATABASE_URL"
❌ **Problem**: Missing direct connection string
✅ **Solution**: Get direct URL from console.prisma.io and add to .env

### "Error connecting to database"
❌ **Problem**: Wrong credentials or network issue
✅ **Solution**: 
1. Verify connection string format
2. Check database is accessible
3. Ensure firewall allows connections

### "Migration failed"
❌ **Problem**: Schema incompatibility or data issues
✅ **Solution**: 
1. Check migration SQL in `prisma/migrations/`
2. Run `prisma migrate resolve` if needed
3. Use `prisma migrate reset` to start fresh (loses data)

---

## 📚 Next Steps

1. ✅ Add `DIRECT_DATABASE_URL` to your .env
2. ✅ Run `pnpm prisma migrate dev --name init-postgresql`
3. ✅ Seed database (if needed)
4. ✅ Test application with `pnpm dev`
5. ✅ Update Vercel environment variables for deployment

---

## 📖 Resources

- [Prisma 6 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-6)
- [Prisma Postgres Documentation](https://www.prisma.io/docs/accelerate/getting-started)
- [PostgreSQL vs MySQL Differences](https://www.prisma.io/docs/orm/overview/databases/postgresql)
- [Prisma Config Reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)

---

**Migration completed by AI Agent on October 23, 2025**
