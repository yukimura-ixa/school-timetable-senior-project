# Prisma Schema Migration Guide: MySQL → PostgreSQL

## Overview

This guide helps you migrate from MySQL (local dev) to PostgreSQL (Prisma Postgres on Vercel).

---

## Required Changes

### 1. Update `schema.prisma` datasource

**Current (MySQL):**
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**New (PostgreSQL):**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

### 2. Update Connection String Format

**MySQL format:**
```
mysql://user:password@localhost:3306/database?connection_limit=40
```

**PostgreSQL format:**
```
postgresql://user:password@host:5432/database?schema=public&connection_limit=10&pool_timeout=20
```

---

### 3. Schema Differences to Review

Most of your schema is compatible, but review these:

#### Auto-increment IDs
MySQL uses `@default(autoincrement())`, PostgreSQL uses `@default(autoincrement())` or `@default(sequence())`.

Your schema already uses String IDs, so no changes needed.

#### Boolean Defaults
✅ Your `@default(false)` syntax works in both databases.

#### Enum Types
✅ Your Prisma enums (`teacher_role`, `subject_credit`, `semester`) work in both.

#### Indexes
✅ Your `@@index` syntax is compatible.

---

## Migration Steps

### Step 1: Create PostgreSQL-compatible schema

```bash
# Update datasource in schema.prisma
# Change provider from "mysql" to "postgresql"
```

### Step 2: Generate migration for PostgreSQL

```bash
# Set PostgreSQL DATABASE_URL
$env:DATABASE_URL="postgresql://your-prisma-postgres-connection"

# Create baseline migration
pnpm prisma migrate dev --name init_postgresql

# This will:
# 1. Create migration files
# 2. Apply to PostgreSQL database
# 3. Generate Prisma Client
```

### Step 3: Migrate Data (if needed)

If you have existing data to migrate from MySQL to PostgreSQL:

**Option A: Export/Import via Prisma**

```bash
# 1. Export from MySQL
$env:DATABASE_URL="mysql://localhost:3306/school-timetable-db-dev"
pnpm prisma db pull  # Pull schema
node scripts/export-data.js  # Custom script to export data

# 2. Import to PostgreSQL
$env:DATABASE_URL="postgresql://your-connection"
pnpm prisma migrate deploy
node scripts/import-data.js  # Custom script to import data
```

**Option B: Start Fresh (Recommended for Dev)**

```bash
# Just run migrations and seed
$env:DATABASE_URL="postgresql://your-connection"
pnpm prisma migrate deploy
pnpm prisma db seed
```

---

## Development Workflow

### For Local Development (MySQL)

Keep using MySQL locally:

```bash
# .env.local
DATABASE_URL="mysql://root:password@localhost:3306/school-timetable-db-dev"
```

```prisma
// schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### For Production (PostgreSQL)

Use Prisma Postgres:

```bash
# Vercel Environment Variables
DATABASE_URL="postgresql://..."
```

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Multi-Provider Support (Advanced)

If you want to support both MySQL (local) and PostgreSQL (production):

### Option 1: Use Environment Variable for Provider

```prisma
datasource db {
  provider = env("DATABASE_PROVIDER") // "mysql" or "postgresql"
  url      = env("DATABASE_URL")
}
```

```bash
# .env (local)
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://..."

# Vercel (production)
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://..."
```

### Option 2: Use Separate Schema Files (Not Recommended)

Keep separate schema files and switch based on environment.

---

## Compatibility Matrix

| Feature | MySQL | PostgreSQL | Notes |
|---------|-------|------------|-------|
| String IDs | ✅ | ✅ | Compatible |
| Int Auto-increment | ✅ | ✅ | Compatible |
| Boolean | ✅ | ✅ | Compatible |
| DateTime | ✅ | ✅ | Compatible |
| Enums | ✅ | ✅ | Compatible |
| JSON | ✅ | ✅ | Compatible |
| Relations | ✅ | ✅ | Compatible |
| Cascades | ✅ | ✅ | Compatible |
| Indexes | ✅ | ✅ | Compatible |

**Result**: Your schema is 100% compatible! 🎉

---

## Recommended Approach for This Project

**Use PostgreSQL for both dev and production:**

### Why?
1. **Consistency**: Same database in all environments
2. **Simplicity**: No provider switching
3. **Free Tier**: Prisma Postgres has a generous free tier
4. **Better Features**: PostgreSQL has more advanced features

### How?

1. **Create Prisma Postgres database for development**
   - Go to console.prisma.io
   - Create database: `school-timetable-dev`
   - Copy connection string

2. **Update local `.env`**
   ```bash
   DATABASE_URL="postgresql://dev-connection-string"
   ```

3. **Update `schema.prisma`**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. **Run migrations**
   ```bash
   pnpm prisma migrate dev --name init_postgresql
   pnpm prisma db seed
   ```

5. **For production**: Create separate database
   - Database: `school-timetable-prod`
   - Set in Vercel environment variables

---

## Quick Start (PostgreSQL Only)

```bash
# 1. Create Prisma Postgres database at console.prisma.io
# 2. Copy connection string
# 3. Update .env
echo 'DATABASE_URL="postgresql://..."' > .env

# 4. Update schema.prisma provider to "postgresql"

# 5. Generate and apply migration
pnpm prisma generate
pnpm prisma migrate dev --name init

# 6. Seed database
pnpm prisma db seed

# 7. Start dev server
pnpm dev
```

---

## Connection Pooling (Important for Vercel)

Vercel uses serverless functions, which can exhaust database connections.

### Solution 1: Use Prisma Accelerate (Recommended)

```bash
# Install
pnpm add @prisma/extension-accelerate
```

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Solution 2: Optimize Connection String

```bash
# Add connection pooling parameters
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=20&connect_timeout=10"
```

---

## Troubleshooting

### "P1001: Can't reach database server"

**Cause**: Wrong connection string or database not accessible.

**Fix**: 
- Verify connection string
- Check database is running
- Verify IP whitelist (Prisma Postgres allows all by default)

### "The table `main.teacher` does not exist"

**Cause**: Migrations not applied.

**Fix**:
```bash
pnpm prisma migrate deploy
```

### "Unique constraint failed"

**Cause**: Trying to insert duplicate primary keys.

**Fix**: Check seed data for duplicates.

---

**Ready to migrate! Choose your approach and follow the steps above. 🚀**
