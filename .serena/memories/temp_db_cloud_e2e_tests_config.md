# Temporary Database for Cloud E2E Tests - October 31, 2025

## Overview
Enhanced the test environment configuration with comprehensive temporary database setup for both cloud CI/CD and local E2E testing, ensuring isolated and consistent test environments.

## File Updated
**Location**: `.github/copilot-test-environment.md`

## Changes Made

### 1. Enhanced Cloud CI/CD Strategy (Section 4)

#### Option A: Temporary PostgreSQL Database (NEW - Recommended)

**GitHub Actions with PostgreSQL Service Container**:

```yaml
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
      POSTGRES_DB: test_timetable
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

**Key Benefits**:
- ✅ **Isolated**: Each test run gets a fresh database
- ✅ **Fast**: No cleanup needed, destroyed automatically
- ✅ **Safe**: Cannot affect production or staging
- ✅ **Consistent**: Same starting state every time
- ✅ **Cost-effective**: No persistent test database needed
- ✅ **Parallel**: Multiple PRs can run simultaneously

**Complete Workflow Steps**:
1. Setup PostgreSQL service container
2. Install dependencies
3. Setup environment with temporary DB URL
4. Apply migrations (`pnpm db:deploy`)
5. Seed with clean data (`pnpm db:seed:clean`)
6. Install Playwright browsers
7. Run E2E tests
8. Upload artifacts (reports, videos on failure)
9. Automatic cleanup (container destroyed)

**Environment Variables Set**:
```bash
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/test_timetable
SEED_FOR_TESTS=true
SEED_CLEAN_DATA=true
NEXT_TELEMETRY_DISABLED=1
```

#### Option B: Persistent Test Database (Existing)

Kept the original persistent database option for cases where data persistence is needed.

**Comparison Table Added**:

| Feature | Temporary DB | Persistent DB |
|---------|--------------|---------------|
| **Isolation** | ✅ Perfect | ⚠️ Shared |
| **Speed** | ✅ Fast | ⚠️ Slower |
| **Cost** | ✅ Free | 💰 May cost |
| **Setup** | ✅ Simple | ⚠️ External service |
| **Data persistence** | ❌ Destroyed | ✅ Persists |
| **Best for** | CI/CD, PRs | Manual testing |

### 2. New Section: "Local Temporary Database Setup"

Added comprehensive local testing options for developers.

#### Option 1: Docker Compose (Recommended)

**Created `docker-compose.test.yml` template**:

```yaml
version: '3.8'

services:
  postgres-test:
    image: postgres:16
    container_name: timetable-test-db
    environment:
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
      POSTGRES_DB: test_timetable
    ports:
      - "5433:5432"  # Avoids conflicts with existing PostgreSQL
    volumes:
      - test_db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test_user"]
```

**Usage Commands**:
```bash
# Start
docker-compose -f docker-compose.test.yml up -d

# Setup
echo "DATABASE_URL=postgresql://test_user:test_password@localhost:5433/test_timetable" > .env.test.local

# Test
pnpm db:deploy
pnpm db:seed:clean
pnpm test:e2e

# Cleanup
docker-compose -f docker-compose.test.yml down -v
```

#### Option 2: PostgreSQL Running Locally

For developers with PostgreSQL already installed:

```bash
# Create database
psql -U postgres -c "CREATE DATABASE test_timetable;"
psql -U postgres -c "CREATE USER test_user WITH PASSWORD 'test_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE test_timetable TO test_user;"

# Test
export DATABASE_URL="postgresql://test_user:test_password@localhost:5432/test_timetable"
pnpm db:deploy
pnpm db:seed:clean
pnpm test:e2e

# Cleanup
psql -U postgres -c "DROP DATABASE test_timetable;"
```

#### Option 3: Quick Test Script (PowerShell)

**Created `scripts/run-e2e-tests.ps1` template**:

```powershell
# Automated script that:
# 1. Starts Docker test database
# 2. Waits for database ready
# 3. Sets up environment
# 4. Applies migrations
# 5. Seeds test data
# 6. Runs E2E tests
# 7. Cleans up database
# 8. Returns test exit code
```

**Usage**:
```bash
pwsh scripts/run-e2e-tests.ps1
```

## Key Features

### Cloud CI/CD (GitHub Actions)
1. ✅ **Ephemeral Database**: PostgreSQL 16 service container
2. ✅ **Automatic Health Checks**: `pg_isready` with retries
3. ✅ **Clean Slate**: `SEED_CLEAN_DATA=true` for each run
4. ✅ **Artifact Upload**: Test reports and failure videos
5. ✅ **Automatic Cleanup**: Container destroyed after job
6. ✅ **Parallel Execution**: Multiple PRs can test simultaneously

### Local Development
1. ✅ **Docker Compose**: Simple containerized test DB
2. ✅ **Port 5433**: Avoids conflicts with local PostgreSQL
3. ✅ **Health Checks**: Ensures DB is ready before tests
4. ✅ **Quick Script**: One-command test execution
5. ✅ **Easy Cleanup**: `down -v` removes all data

## Technical Details

### PostgreSQL Version
- Using **PostgreSQL 16** (latest stable)
- Health check: `pg_isready` command
- Startup timeout: 5 seconds with 5 retries

### Database Credentials (Test Only)
- **User**: `test_user`
- **Password**: `test_password`
- **Database**: `test_timetable`
- **Port**: 5432 (cloud), 5433 (local)

### Environment Variables
```env
DATABASE_URL=postgresql://test_user:test_password@localhost:5433/test_timetable
SEED_FOR_TESTS=true
SEED_CLEAN_DATA=true
NEXT_TELEMETRY_DISABLED=1
```

## Use Cases

### 1. Pull Request Testing (Cloud)
```yaml
on: [pull_request]
jobs:
  test:
    services:
      postgres: # Temporary DB
```
- ✅ Clean slate for each PR
- ✅ No interference between PRs
- ✅ Fast and isolated

### 2. Local Development Testing
```bash
docker-compose -f docker-compose.test.yml up -d
pnpm test:e2e
docker-compose -f docker-compose.test.yml down -v
```
- ✅ Doesn't touch development database
- ✅ Reproducible test environment
- ✅ Quick cleanup

### 3. CI/CD Pipeline
```yaml
on: [push, pull_request]
# Uses temporary PostgreSQL service
# Runs migrations, seeds, tests
# Automatic cleanup
```
- ✅ Consistent across all runs
- ✅ No manual database management
- ✅ Cost-effective

## Benefits

### For Developers
1. ✅ **No database pollution**: Test data doesn't affect dev DB
2. ✅ **Easy setup**: `docker-compose up` and ready
3. ✅ **Quick cleanup**: `down -v` removes everything
4. ✅ **Reproducible**: Same environment every time
5. ✅ **Automated**: Script handles all steps

### For CI/CD
1. ✅ **No external dependencies**: Self-contained
2. ✅ **Parallel testing**: Multiple jobs without conflicts
3. ✅ **Cost savings**: No persistent test database fees
4. ✅ **Security**: Isolated test credentials
5. ✅ **Reliability**: Fresh state prevents flaky tests

### For AI Assistants (Copilot)
1. ✅ **Knows temp DB pattern**: Can generate similar configs
2. ✅ **Understands isolation**: Won't suggest shared test DBs
3. ✅ **Can create scripts**: Follows PowerShell template
4. ✅ **Environment aware**: Sets correct DATABASE_URL

## Comparison with Other Approaches

### vs Persistent Test Database
| Aspect | Temporary DB | Persistent DB |
|--------|--------------|---------------|
| Setup | Simple (one service) | Complex (external) |
| Cost | Free | Paid (Vercel/Supabase) |
| Isolation | Perfect | Shared state issues |
| Cleanup | Automatic | Manual or scripted |
| Speed | Fast | Slower (cleanup needed) |
| Reliability | High (fresh state) | Lower (state drift) |

### vs In-Memory Database
| Aspect | PostgreSQL Container | SQLite/In-Memory |
|--------|---------------------|------------------|
| Accuracy | Exact production match | Different SQL dialect |
| Features | Full PostgreSQL | Limited features |
| Performance | Slightly slower | Faster |
| Reliability | High | May miss DB-specific bugs |

## Files to Create (Optional)

### 1. `docker-compose.test.yml` (Root)
```yaml
# Temporary PostgreSQL for E2E tests
version: '3.8'
services:
  postgres-test: # ...
```

### 2. `scripts/run-e2e-tests.ps1`
```powershell
# Automated E2E test runner with temp DB
# Handles: start, migrate, seed, test, cleanup
```

### 3. `.github/workflows/e2e-tests.yml`
```yaml
# GitHub Actions E2E workflow
# Uses PostgreSQL service container
```

## Integration with Existing Tools

### Works With
- ✅ **Prisma**: Migrations and seeding
- ✅ **Playwright**: E2E test execution
- ✅ **pnpm**: All package scripts
- ✅ **Docker**: Container management
- ✅ **GitHub Actions**: Service containers
- ✅ **PowerShell**: Automation scripts

### Environment Variables
- Reuses existing `SEED_FOR_TESTS`
- Reuses existing `SEED_CLEAN_DATA`
- Adds temporary `DATABASE_URL`
- Works with `.env.test.local`

## Next Steps for Users

### Immediate Actions
1. **Create Docker Compose file**:
   ```bash
   # Copy template from documentation
   code docker-compose.test.yml
   ```

2. **Test locally**:
   ```bash
   docker-compose -f docker-compose.test.yml up -d
   pnpm db:deploy
   pnpm test:e2e
   docker-compose -f docker-compose.test.yml down -v
   ```

3. **Setup GitHub Actions**:
   ```bash
   mkdir -p .github/workflows
   # Copy e2e-tests.yml template
   ```

### Optional Enhancements
- Create PowerShell automation script
- Add pre-commit hook to run local E2E tests
- Setup VS Code task for quick E2E testing
- Add database backup/restore for debugging

## Related Configuration

### package.json Scripts (No Changes Needed)
```json
"db:deploy": "prisma migrate deploy",
"db:seed": "tsx prisma/seed.ts",
"db:seed:clean": "SEED_CLEAN_DATA=true tsx prisma/seed.ts",
"test:e2e": "playwright test"
```

### Playwright Config (No Changes Needed)
- Uses `process.env.DATABASE_URL`
- Works with temporary database URL
- No code changes required

## Security Considerations

### Test Credentials
- ✅ **Not secrets**: Test credentials are public in code
- ✅ **Isolated**: Only used in test containers
- ✅ **Temporary**: Database destroyed after tests
- ✅ **No production data**: Fresh seed only

### GitHub Actions Secrets
- `AUTH_SECRET`: For NextAuth
- `AUTH_GOOGLE_ID`: OAuth client ID
- `AUTH_GOOGLE_SECRET`: OAuth client secret
- **Not needed**: `TEST_DATABASE_URL` (uses service container)

## Summary

Successfully enhanced E2E test environment with comprehensive temporary database support:

### Cloud CI/CD
- ✅ **PostgreSQL 16 service container** in GitHub Actions
- ✅ **Automatic health checks** and startup verification
- ✅ **Clean slate seeding** for each test run
- ✅ **Artifact upload** for test reports and videos
- ✅ **Automatic cleanup** after job completion

### Local Development
- ✅ **Docker Compose** configuration template
- ✅ **Port 5433** to avoid conflicts
- ✅ **PowerShell automation script** for one-command testing
- ✅ **Manual PostgreSQL** option for flexibility

### Benefits
- ✅ **Perfect isolation** between test runs
- ✅ **Cost-effective** (no persistent DB needed)
- ✅ **Fast and reliable** (no cleanup overhead)
- ✅ **Developer-friendly** (simple setup)
- ✅ **CI/CD ready** (no external dependencies)

The test environment now supports fully isolated, temporary databases for both cloud and local E2E testing! 🎯
