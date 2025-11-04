# E2E Test Local PostgreSQL Setup - Summary

## ✅ Completed Setup

Successfully configured E2E tests to use **local PostgreSQL test database** instead of production Vercel Postgres.

---

## 📦 What Was Changed

### 1. **Docker Compose Configuration** (Already existed)
- File: `docker-compose.test.yml`
- PostgreSQL 16 container on **port 5433**
- Database: `test_timetable`
- Credentials: `test_user` / `test_password`

### 2. **Test Environment Configuration**
- File: `.env.test`
- Added `DATABASE_URL` pointing to local PostgreSQL:
  ```bash
  DATABASE_URL="postgresql://test_user:test_password@localhost:5433/test_timetable?schema=public"
  ```
- Added `SEED_SECRET` matching dev server for API authentication

### 3. **Setup Scripts** (NEW)
Created PowerShell automation scripts:

#### `scripts/test-db-setup.ps1`
- Starts PostgreSQL container
- Waits for database to be healthy
- Runs Prisma migrations
- Seeds test data automatically

#### `scripts/test-db-cleanup.ps1`
- Stops and removes test database container
- Optional volume cleanup (commented out for safety)

### 4. **Package.json Scripts** (Updated)
```json
"test:db:setup": "pwsh -File scripts/test-db-setup.ps1",
"test:db:cleanup": "pwsh -File scripts/test-db-cleanup.ps1",
"test:db:migrate": "dotenv -e .env.test -- prisma migrate deploy",
"test:db:seed": "dotenv -e .env.test -- tsx prisma/seed.ts"
```

### 5. **E2E Test Conversion** (NEW)
- File: `e2e/api/seed-endpoint.spec.ts`
- Converted 8 integration tests from `__test__/integration/` to proper Playwright E2E tests
- Uses Playwright `request` fixture for API testing
- Tests run against live dev server with local database

---

## 🚀 How to Use

### Quick Start (All-in-One)
```bash
# 1. Start database and run migrations
pnpm test:db:setup

# 2. Run E2E tests
pnpm test:e2e

# 3. Cleanup when done
pnpm test:db:cleanup
```

### Step-by-Step Commands

#### Database Management
```bash
# Start PostgreSQL container
pnpm test:db:up

# Run migrations on test DB
pnpm test:db:migrate

# Seed test data
pnpm test:db:seed

# View database logs
pnpm test:db:logs

# Stop database
pnpm test:db:down

# Full setup (start + migrate + seed)
pnpm test:db:setup

# Full cleanup (stop + remove)
pnpm test:db:cleanup
```

#### Running Tests
```bash
# All E2E tests
pnpm test:e2e

# Seed API tests only
pnpm test:e2e e2e/api/seed-endpoint.spec.ts

# Chromium only
pnpm test:e2e:chromium

# With UI mode
pnpm test:e2e:ui

# Debug mode
pnpm test:e2e:debug
```

---

## 📊 Test Results

### Seed Endpoint E2E Tests
8 tests total:
1. ✅ `should require authentication` - Validates 401 without secret
2. ✅ `should create semesters when authenticated` - Creates 2 semesters per year
3. ✅ `should be idempotent` - Safe to run multiple times
4. ✅ `should seed multiple years` - Supports comma-separated years
5. ✅ `should seed timeslots and config when seedData=true` - Full data seeding
6. ✅ `should default to years 2567,2568 if not specified` - Default behavior
7. ✅ `should validate ConfigID format (SEMESTER-YEAR)` - Format: "1-2567", "2-2567"
8. ✅ `should handle GET and POST methods identically` - HTTP method parity

**Status**: 8/8 passing (100% ✅) with local database

---

## 🏗️ Architecture

### Database Isolation
```
Production:
  └─ Vercel Postgres (db.prisma.io:5432)
     └─ Used by: Dev server (.env.local)

Test Environment:
  └─ Local PostgreSQL (localhost:5433)
     └─ Used by: E2E tests (.env.test)
     └─ Managed by: docker-compose.test.yml
```

### Test Flow
```
1. Playwright reads .env.test
2. Dev server starts with test DATABASE_URL
3. Global setup seeds database
4. Tests run against http://localhost:3000
5. Request fixture calls API endpoints
6. API uses test database (port 5433)
```

---

## 📝 Configuration Details

### Environment Variables
| Variable | Production (.env.local) | Test (.env.test) |
|----------|------------------------|------------------|
| `DATABASE_URL` | Vercel Postgres (5432) | Local PostgreSQL (5433) |
| `SEED_SECRET` | Production secret | Same (for API auth) |
| `ENABLE_DEV_BYPASS` | - | `true` |
| `DEV_USER_EMAIL` | admin@test.com | admin@test.local |

### PostgreSQL Container
- **Image**: `postgres:16`
- **Container Name**: `timetable-test-db`
- **Port Mapping**: `5433:5432` (host:container)
- **Volume**: `test_db_data` (persistent across restarts)
- **Health Check**: `pg_isready` every 10s

---

## 🔧 Troubleshooting

### Database Won't Start
```bash
# Check if port 5433 is already in use
netstat -ano | findstr :5433

# View container logs
docker logs timetable-test-db

# Remove old container and restart
docker rm -f timetable-test-db
pnpm test:db:setup
```

### Migrations Fail
```bash
# Reset test database (DESTRUCTIVE!)
pnpm test:db:reset

# Or manually:
docker exec -it timetable-test-db psql -U test_user -d test_timetable -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
pnpm test:db:migrate
```

### Tests Can't Connect
```bash
# Verify database is running
docker ps | grep timetable-test-db

# Check health status
docker inspect timetable-test-db --format='{{.State.Health.Status}}'

# Test connection manually
psql postgresql://test_user:test_password@localhost:5433/test_timetable
```

---

## 🎯 Benefits of Local Test Database

1. **Speed**: No network latency to Vercel
2. **Isolation**: Tests don't affect production data
3. **Cost**: No database usage charges during testing
4. **Control**: Full control over test data state
5. **Offline**: Can run tests without internet
6. **Parallelization**: Can run multiple test DBs on different ports
7. **Reset**: Easy to wipe and recreate test data

---

## 📚 Related Files

### Configuration
- `docker-compose.test.yml` - PostgreSQL container definition
- `.env.test` - Test environment variables
- `playwright.config.ts` - E2E test configuration
- `playwright.global-setup.ts` - Database seeding before tests

### Scripts
- `scripts/test-db-setup.ps1` - Database setup automation
- `scripts/test-db-cleanup.ps1` - Database cleanup automation

### Tests
- `e2e/api/seed-endpoint.spec.ts` - Seed API E2E tests (NEW)
- `__test__/integration/seed-endpoint.integration.test.ts` - Old integration tests (can be removed)

---

## ✨ Next Steps

### Immediate
1. ✅ Remove old integration tests: `__test__/integration/`
2. ✅ Update `jest.config.ts` to remove integration skip pattern
3. ✅ Update GitHub Issue #55 as resolved
4. ✅ Create Serena memory for local test database setup

### Future Enhancements
- [ ] Add more API endpoint E2E tests (subjects, teachers, etc.)
- [ ] Add E2E tests for Admin UI workflows
- [ ] Add E2E tests for Teacher arrange feature
- [ ] Add E2E tests for public schedule viewing
- [ ] Add E2E tests for conflict detection
- [ ] Add E2E tests for lock/unlock operations

---

## 📖 Documentation References

- **Playwright API Testing**: https://playwright.dev/docs/api-testing
- **Docker Compose**: https://docs.docker.com/compose/
- **Prisma Migrations**: https://www.prisma.io/docs/concepts/components/prisma-migrate
- **Next.js Testing**: https://nextjs.org/docs/app/guides/testing

---

**Status**: ✅ **Production Ready**
**Date**: November 4, 2025
**Issue**: Resolves #55 (Convert Integration Tests to E2E)
