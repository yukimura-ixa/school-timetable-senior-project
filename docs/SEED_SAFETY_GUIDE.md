# Seed Safety Guide

## Overview

The seed file (`prisma/seed.ts`) has **two modes** to prevent accidental data loss:

### 1. **Safe Mode (Default)** ✅
Creates admin user only, preserves all existing data.

```bash
pnpm tsx prisma/seed.ts
# OR
pnpm db:seed
```

**What happens:**
- ✅ Creates admin user if missing (`admin@school.local` / `admin123`)
- ✅ Preserves ALL existing timetable data
- ✅ Preserves ALL Auth.js data (User, Account, Session)
- ✅ Safe for production

---

### 2. **Clean Mode (Destructive)** ⚠️
Deletes all timetable data and recreates from seed.

```bash
SEED_CLEAN_DATA=true pnpm tsx prisma/seed.ts
```

**What happens:**
- ⚠️ **DELETES** all timetable data:
  - class_schedule
  - teachers_responsibility
  - timeslot
  - table_config
  - subject
  - teacher
  - room
  - gradelevel
  - program
- ✅ **PRESERVES** Auth.js tables (User, Account, Session, VerificationToken)
- ✅ Recreates all timetable data from seed
- ⚠️ **NOT safe for production with existing data**

---

## Usage Scenarios

### Initial Database Setup
First time setting up the database with sample data:

```bash
# 1. Apply migrations
pnpm prisma migrate deploy

# 2. Run seed with clean mode
SEED_CLEAN_DATA=true pnpm tsx prisma/seed.ts
```

---

### Add Admin User to Existing Database
Database already has data, just need admin user:

```bash
# Safe mode (default) - only creates admin
pnpm tsx prisma/seed.ts
```

Or use standalone script:

```bash
pnpm tsx scripts/create-admin.ts
```

---

### Reset Development Database
Want to start fresh in development:

```bash
# Full reset with Prisma migrate
pnpm prisma migrate reset

# This automatically runs seed in clean mode
```

---

### Production Deployment
**NEVER** use clean mode in production:

```bash
# SAFE - Only creates admin if missing
pnpm tsx prisma/seed.ts

# DANGEROUS - Deletes all data
# SEED_CLEAN_DATA=true pnpm tsx prisma/seed.ts  ❌ DON'T DO THIS
```

---

## Safety Checks

### Environment Variable
The `SEED_CLEAN_DATA` environment variable acts as a safety guard:

```typescript
// In seed.ts
const shouldCleanData = process.env.SEED_CLEAN_DATA === 'true';

if (!shouldCleanData) {
  console.log('ℹ️  Skipping data cleanup (set SEED_CLEAN_DATA=true to enable)');
  console.log('✅ Seed completed - admin user ready');
  return; // Exit early - no data deletion
}
```

### What Gets Preserved
The seed **NEVER** deletes Auth.js tables:
- ✅ `User` - preserved
- ✅ `Account` - preserved
- ✅ `Session` - preserved
- ✅ `VerificationToken` - preserved

This means:
- Admin user survives clean mode
- All OAuth accounts (Google) survive
- All active sessions survive

---

## Admin User Credentials

After running seed (any mode):

- **Email**: `admin@school.local`
- **Password**: `admin123`
- **Role**: `admin`
- **Login URL**: http://localhost:3000/signin

**⚠️ Change default password in production!**

---

## Verification

### Check if admin exists
```bash
pnpm tsx scripts/verify-admin.ts
```

### Check if seed data exists
```bash
# Open Prisma Studio
pnpm db:studio

# Check tables:
# - teacher (should have ~20 teachers)
# - room (should have ~15 rooms)
# - subject (should have ~10 subjects)
```

---

## Common Commands

```bash
# Safe seed (default)
pnpm tsx prisma/seed.ts

# Clean seed (destructive)
SEED_CLEAN_DATA=true pnpm tsx prisma/seed.ts

# Full reset (includes clean seed)
pnpm prisma migrate reset

# Create admin only
pnpm tsx scripts/create-admin.ts

# Verify admin
pnpm tsx scripts/verify-admin.ts

# Open Prisma Studio
pnpm db:studio
```

---

## Troubleshooting

### "Admin already exists"
This is normal - seed is idempotent for admin creation.

### "Skipping data cleanup"
Expected in safe mode. Add `SEED_CLEAN_DATA=true` if you want to clean data.

### Foreign key errors during deletion
Seed deletes in correct order (respecting foreign keys). If you see errors, check:
1. Migration state: `pnpm prisma migrate status`
2. Schema drift: `pnpm prisma migrate diff`

### No seed data after running
Check if you ran in safe mode (default). Use `SEED_CLEAN_DATA=true` to populate sample data.

---

## Best Practices

1. **Development**: Use clean mode freely to reset data
2. **Staging**: Use safe mode, manually add test data
3. **Production**: Use safe mode only, never clean mode
4. **CI/CD**: Use clean mode for test databases
5. **Version Control**: Never commit `.env` with `SEED_CLEAN_DATA=true`

---

## Related Documentation

- [AUTH_PRISMA_ADAPTER_IMPLEMENTATION.md](./AUTH_PRISMA_ADAPTER_IMPLEMENTATION.md) - Auth.js setup
- [DATABASE_OVERVIEW.md](./DATABASE_OVERVIEW.md) - Database schema
- [SEED_README.md](./SEED_README.md) - Original seed documentation
