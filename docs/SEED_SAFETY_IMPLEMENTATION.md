# Seed Safety Implementation Summary

**Date**: 2025-01-26  
**Issue**: Seed file was deleting ALL timetable data unconditionally  
**Solution**: Added environment-variable safety guard

---

## Problem

The original `prisma/seed.ts` had this behavior:

```typescript
async function main() {
  // 1. Create admin user
  const existingAdmin = await prisma.user.findUnique({ ... });
  if (!existingAdmin) { await prisma.user.create({ ... }); }
  
  // 2. DELETE ALL TIMETABLE DATA (unconditional)
  await prisma.class_schedule.deleteMany({});
  await prisma.teachers_responsibility.deleteMany({});
  await prisma.timeslot.deleteMany({});
  await prisma.table_config.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.gradelevel.deleteMany({});
  await prisma.program.deleteMany({});
  
  // 3. Recreate all seed data
  // ...
}
```

**Risks:**
- ❌ Running seed on production database would delete all data
- ❌ No confirmation prompt before destructive operation
- ❌ Admin user would be preserved (User table), but all timetable data lost
- ❌ No way to run seed just to create admin without deleting data

---

## Solution

### 1. Environment Variable Guard

Added `SEED_CLEAN_DATA` environment variable check:

```typescript
async function main() {
  // 1. Create admin user (always runs)
  const existingAdmin = await prisma.user.findUnique({ ... });
  if (!existingAdmin) { await prisma.user.create({ ... }); }
  
  // 2. Check if data cleanup is requested
  const shouldCleanData = process.env.SEED_CLEAN_DATA === 'true';
  
  if (!shouldCleanData) {
    console.log('ℹ️  Skipping data cleanup (set SEED_CLEAN_DATA=true to enable)');
    console.log('✅ Seed completed - admin user ready');
    return; // EXIT EARLY - no deletion
  }
  
  console.log('⚠️  SEED_CLEAN_DATA=true - Cleaning existing timetable data...');
  
  // 3. Delete timetable data (only if SEED_CLEAN_DATA=true)
  await prisma.class_schedule.deleteMany({});
  // ... rest of deletions
  
  // 4. Recreate all seed data
  // ...
}
```

### 2. Two Modes

**Safe Mode (Default)**:
```bash
pnpm tsx prisma/seed.ts
# OR
pnpm db:seed
```
- ✅ Creates admin user if missing
- ✅ Preserves ALL existing data
- ✅ Safe for production

**Clean Mode (Opt-in)**:
```bash
SEED_CLEAN_DATA=true pnpm tsx prisma/seed.ts
# OR
pnpm db:seed:clean
```
- ✅ Creates admin user if missing
- ⚠️ Deletes all timetable data
- ✅ Recreates seed data
- ⚠️ Only for development/testing

---

## Package.json Scripts

Added convenience scripts:

```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts",
    "db:seed:clean": "SEED_CLEAN_DATA=true tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "admin:create": "tsx scripts/create-admin.ts",
    "admin:verify": "tsx scripts/verify-admin.ts"
  }
}
```

### Usage

| Command | Purpose | Safe? |
|---------|---------|-------|
| `pnpm db:seed` | Create admin only | ✅ Yes |
| `pnpm db:seed:clean` | Full reset | ⚠️ Dev only |
| `pnpm admin:create` | Create admin standalone | ✅ Yes |
| `pnpm admin:verify` | Check admin exists | ✅ Yes |
| `pnpm db:studio` | Open Prisma Studio | ✅ Yes |
| `pnpm db:migrate` | Run dev migrations | ⚠️ Dev only |
| `pnpm db:deploy` | Apply migrations | ✅ Yes |

---

## What Gets Preserved

The seed **NEVER** deletes Auth.js tables (even in clean mode):

| Table | Preserved? | Contains |
|-------|------------|----------|
| `User` | ✅ Always | Admin user, OAuth users |
| `Account` | ✅ Always | Google OAuth accounts |
| `Session` | ✅ Always | Active sessions |
| `VerificationToken` | ✅ Always | Email verification tokens |

**Deleted only in clean mode**:
- `class_schedule` - timetable assignments
- `teachers_responsibility` - teacher-subject assignments
- `timeslot` - period definitions
- `table_config` - timetable settings
- `subject` - courses
- `teacher` - legacy teacher records
- `room` - classrooms
- `gradelevel` - grade levels
- `program` - programs (e.g., Science, Arts)

---

## Testing

### Verify Safe Mode (Default)

```bash
# 1. Check current data
pnpm db:studio
# Note number of teachers, rooms, etc.

# 2. Run seed in safe mode
pnpm db:seed

# Expected output:
# ℹ️  Admin user already exists
# ℹ️  Skipping data cleanup (set SEED_CLEAN_DATA=true to enable)
# ✅ Seed completed - admin user ready

# 3. Verify data NOT deleted
pnpm db:studio
# Same number of teachers, rooms, etc.
```

### Verify Clean Mode

```bash
# 1. Run seed in clean mode
pnpm db:seed:clean

# Expected output:
# ✅ Admin user created (or already exists)
# ⚠️  SEED_CLEAN_DATA=true - Cleaning existing timetable data...
# ✅ Timetable data cleaned (Auth.js tables preserved)
# 📚 Creating programs...
# 👥 Creating teachers...
# 🏫 Creating rooms...
# ... (full seed data recreation)

# 2. Verify data recreated
pnpm db:studio
# Fresh seed data visible
```

---

## Migration Guide

### Before (Unsafe)
```bash
# Old way - always deleted data
pnpm tsx prisma/seed.ts
# ❌ Deleted all timetable data
```

### After (Safe)
```bash
# New way - safe by default
pnpm db:seed
# ✅ Only creates admin, preserves data

# Explicit clean mode when needed
pnpm db:seed:clean
# ⚠️ Deletes and recreates data
```

---

## Production Deployment

### Initial Setup
```bash
# 1. Apply migrations
pnpm db:deploy

# 2. Create admin (safe)
pnpm db:seed
# OR
pnpm admin:create

# 3. Verify admin
pnpm admin:verify
```

### Existing Database
```bash
# NEVER use clean mode in production
pnpm db:seed  # ✅ Safe - only creates admin
# pnpm db:seed:clean  # ❌ DANGEROUS - deletes all data
```

---

## Environment Variables

### Development `.env`
```bash
# No SEED_CLEAN_DATA needed - defaults to safe mode
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."
```

### CI/CD Test Environment
```bash
# Can use clean mode for test databases
SEED_CLEAN_DATA=true
DATABASE_URL="postgresql://test-db..."
```

### Production `.env`
```bash
# NEVER set SEED_CLEAN_DATA in production
# DATABASE_URL injected by Vercel Storage
AUTH_SECRET="..."
```

---

## Error Handling

### Foreign Key Errors
Seed deletes in correct order (respecting foreign keys):

1. `class_schedule` (depends on teacher, room, subject, timeslot)
2. `teachers_responsibility` (depends on teacher, subject)
3. `timeslot` (depends on table_config)
4. `table_config`
5. `subject` (depends on gradelevel, program)
6. `teacher`
7. `room`
8. `gradelevel` (depends on program)
9. `program`

If errors occur, check:
```bash
# Migration status
pnpm prisma migrate status

# Schema drift
pnpm prisma migrate diff
```

---

## Admin User Details

Default credentials (change in production):

- **Email**: `admin@school.local`
- **Password**: `admin123` (bcrypt hashed)
- **Role**: `admin`
- **Login URL**: http://localhost:3000/signin

**Security Notes**:
- Password hashed with bcrypt (10 rounds)
- Email verified by default (`emailVerified: new Date()`)
- Survives clean mode (User table never deleted)

---

## Related Documentation

- [SEED_SAFETY_GUIDE.md](./SEED_SAFETY_GUIDE.md) - Complete usage guide
- [AUTH_PRISMA_ADAPTER_IMPLEMENTATION.md](./AUTH_PRISMA_ADAPTER_IMPLEMENTATION.md) - Auth.js setup
- [DATABASE_OVERVIEW.md](./DATABASE_OVERVIEW.md) - Database schema
- [AGENTS.md](../AGENTS.md) - AI agent instructions

---

## Changelog

### v2 (2025-01-26) - Safety Guard Added
- ✅ Added `SEED_CLEAN_DATA` environment variable check
- ✅ Safe mode by default (only creates admin)
- ✅ Clean mode opt-in via environment variable
- ✅ Updated package.json with convenience scripts
- ✅ Created comprehensive documentation

### v1 (Original) - Unsafe
- ❌ Always deleted all timetable data
- ❌ No safety checks
- ❌ No way to run admin-only seed

---

## Summary

**Key Changes**:
1. Environment variable guard (`SEED_CLEAN_DATA`)
2. Default safe mode (no data deletion)
3. Explicit opt-in for clean mode
4. Convenience scripts in package.json
5. Comprehensive documentation

**Benefits**:
- ✅ Safe for production deployment
- ✅ Prevents accidental data loss
- ✅ Clear separation of concerns (admin vs full seed)
- ✅ Better developer experience
- ✅ CI/CD friendly

**Migration Required**: None - backwards compatible (defaults to safer behavior)
