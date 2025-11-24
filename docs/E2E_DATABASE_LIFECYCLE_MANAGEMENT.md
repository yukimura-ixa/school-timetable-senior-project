# E2E Test Database Lifecycle Management

This document describes the automatic Docker Compose lifecycle management system for E2E tests.

## Overview

The E2E test suite now includes **automatic database lifecycle management** that:

- ✅ Automatically starts the test database before tests
- ✅ Waits for database readiness
- ✅ Runs migrations and seeds data
- ✅ Cleans up database after tests (optional)
- ✅ Detects existing database instances (reuses them)
- ✅ Works cross-platform (Windows, macOS, Linux)

## Quick Start

### Simple Usage (Recommended)

```bash
# Run all E2E tests with automatic database management
pnpm test:e2e

# Run with UI mode
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Run specific test file
pnpm test:e2e e2e/01-home-page.spec.ts
```

The database will **automatically start** before tests and **automatically stop** after tests.

### Keep Database Running

If you want to keep the database running after tests (for debugging):

```bash
# Keep database running after tests
pnpm test:e2e:keep-db

# Or set environment variable
SKIP_DB_CLEANUP=true pnpm test:e2e
```

### Manual Database Control

If you prefer to manage the database yourself:

```bash
# Start database manually
pnpm test:db:up

# Run tests WITHOUT automatic management
pnpm test:e2e:no-auto

# Stop database manually
pnpm test:db:down
```

## How It Works

### Architecture

The system consists of three layers:

1. **Playwright Global Setup** (`playwright.global-setup.ts`)
   - Detects if Docker is available
   - Checks if database is already running
   - Starts database if needed
   - Waits for database readiness
   - Runs migrations and seeds data

2. **Playwright Global Teardown** (`playwright.global-teardown.ts`)
   - Runs after all tests complete
   - Stops database if it was started by setup
   - Skips cleanup if database was already running

3. **Cross-Platform Script** (`scripts/run-e2e-tests.mjs`)
   - Node.js wrapper - Works on all platforms (Windows, macOS, Linux)
   - Used by `pnpm test:e2e` and related commands

### Lifecycle Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. User runs: pnpm test:e2e                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Script wrapper starts (run-e2e-tests.mjs)           │
│    - Checks Docker availability                         │
│    - Checks if database is running                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Start database if not running                       │
│    - docker compose up -d                               │
│    - Wait for pg_isready (max 30s)                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Playwright Global Setup                             │
│    - Runs migrations (prisma migrate deploy)            │
│    - Seeds test data (pnpm db:seed)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Run E2E Tests (27 tests, ~10 min with sharding)     │
│    - 4 parallel workers                                 │
│    - Sharded across CI runners                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Playwright Global Teardown                          │
│    - Cleanup only if we started the database            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Script wrapper cleanup                              │
│    - docker compose down (if SKIP_DB_CLEANUP not set)  │
└─────────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

| Variable              | Default     | Description                                    |
| --------------------- | ----------- | ---------------------------------------------- |
| `AUTO_MANAGE_TEST_DB` | `true`      | Enable automatic database lifecycle management |
| `SKIP_DB_CLEANUP`     | `false`     | Keep database running after tests              |
| `DATABASE_URL`        | `.env.test` | Test database connection string                |

### Examples

```bash
# Disable automatic database management (use external DB)
AUTO_MANAGE_TEST_DB=false pnpm test:e2e

# Keep database running for debugging
SKIP_DB_CLEANUP=true pnpm test:e2e

# Use custom database URL
DATABASE_URL="postgresql://..." pnpm test:e2e
```

## Database Configuration

### Test Database Specs

- **Image**: PostgreSQL 16
- **Container Name**: `timetable-test-db`
- **Port**: 5433 (avoids conflict with dev DB on 5432)
- **Database**: `test_timetable`
- **User**: `test_user`
- **Password**: `test_password`

### Docker Compose File

```yaml
# docker-compose.test.yml
version: "3.8"

services:
  postgres-test:
    image: postgres:16
    container_name: timetable-test-db
    environment:
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
      POSTGRES_DB: test_timetable
    ports:
      - "5433:5432"
    volumes:
      - test_db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test_user"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  test_db_data:
```

## CI/CD Integration

### GitHub Actions

The automatic lifecycle management works seamlessly in CI:

```yaml
# .github/workflows/e2e-tests.yml
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: pnpm install

      # No manual database setup needed!
      # The test runner handles it automatically

      - name: Run E2E Tests
        run: pnpm test:e2e
```

### Advanced CI Configuration

For matrix builds with sharding:

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]

steps:
  - name: Run E2E Tests (Shard ${{ matrix.shard }}/4)
    run: pnpm test:e2e --shard=${{ matrix.shard }}/4
```

Each shard will:

1. Start its own database container
2. Run ~7 tests (27 tests ÷ 4 shards)
3. Clean up its database
4. Total time: ~10 minutes (vs 2.5 hours without sharding)

## Troubleshooting

### Database Won't Start

**Symptom**: "Database failed to start within timeout"

**Solutions**:

1. Check Docker is running: `docker ps`
2. Check port 5433 is available: `netstat -an | grep 5433`
3. Remove old containers: `docker compose -f docker-compose.test.yml down -v`
4. Check Docker logs: `pnpm test:db:logs`

### Port Conflict

**Symptom**: "port is already allocated"

**Solutions**:

1. Check for conflicting services on port 5433
2. Stop other PostgreSQL instances
3. Change port in `docker-compose.test.yml` and `.env.test`

### Database Already Running

**Symptom**: "Test database is already running - Reusing existing instance"

**This is not an error!** The system detects existing databases and reuses them. To force a fresh start:

```bash
# Stop existing database
pnpm test:db:down

# Run tests (will start fresh database)
pnpm test:e2e
```

## Manual Commands Reference

### Database Management

```bash
# Start test database
pnpm test:db:up

# Stop test database
pnpm test:db:down

# Restart test database
pnpm test:db:restart

# View database logs
pnpm test:db:logs

# Run migrations
pnpm test:db:migrate

# Seed test data
pnpm test:db:seed

# Full reset (migrations + seed)
pnpm test:db:reset
```

### E2E Test Commands

```bash
# Automatic lifecycle management (recommended)
pnpm test:e2e                    # All tests
pnpm test:e2e:ui                 # UI mode
pnpm test:e2e:headed             # Headed mode
pnpm test:e2e:debug              # Debug mode
pnpm test:e2e:keep-db            # Keep DB running after

# Manual control
pnpm test:e2e:manual             # No automatic DB management
pnpm test:e2e:no-auto            # Disable AUTO_MANAGE_TEST_DB

# Specific tests
pnpm test:e2e e2e/01-*.spec.ts   # Pattern matching
pnpm test:e2e:admin              # Admin tests only
```

## Best Practices

### Development

1. **Use automatic management** for most development work
2. **Keep database running** when iterating on tests (`pnpm test:e2e:keep-db`)
3. **Stop database** when switching branches or updating schema (`pnpm test:db:down`)

### CI/CD

1. **Always use automatic management** in CI (it's the default)
2. **Enable sharding** for faster test execution (4 shards = 4x faster)
3. **Don't skip cleanup** in CI (let tests clean up after themselves)

### Debugging

1. **Keep database running** after failed tests (`SKIP_DB_CLEANUP=true`)
2. **Check logs** with `pnpm test:db:logs`
3. **Connect manually** with `psql` or database tools:
   ```bash
   psql postgresql://test_user:test_password@localhost:5433/test_timetable
   ```

## Performance

### Before Automatic Management

- Manual setup: 2-3 minutes (human time)
- Risk of stale data from previous runs
- Inconsistent state between developers

### After Automatic Management

- Automatic setup: 5-10 seconds (computer time)
- Fresh database every run (reliable)
- Consistent experience for all developers

### CI Performance

- **Without Sharding**: ~2.5 hours (150 minutes)
- **With Sharding (4 runners)**: ~10 minutes (93% faster)
- **Database startup**: ~5 seconds per runner
- **Total overhead**: Negligible compared to test execution

## Migration Guide

### From Old Setup (Manual)

**Before** (manual commands):

```bash
# Old workflow (error-prone)
docker compose -f docker-compose.test.yml up -d
sleep 5
pnpm test:db:migrate
pnpm test:db:seed
pnpm test:e2e:manual
docker compose -f docker-compose.test.yml down
```

**After** (automatic):

```bash
# New workflow (one command)
pnpm test:e2e
```

### Update Your Scripts

If you have custom scripts that run E2E tests, update them:

```bash
# Old
#!/bin/bash
docker compose -f docker-compose.test.yml up -d
pnpm playwright test
docker compose -f docker-compose.test.yml down

# New
#!/bin/bash
pnpm test:e2e
```

## Related Documentation

- [DEVELOPMENT_GUIDE.md](../docs/DEVELOPMENT_GUIDE.md) - Full development guide
- [GitHub Issue #61](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/61) - Database connection failure
- [GitHub Issue #62](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/62) - Auth JWT errors
- [E2E Performance Optimization](../docs/E2E_IMPLEMENTATION_SUMMARY.md) - Performance improvements

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section above
2. Review [GitHub Issues](https://github.com/yukimura-ixa/school-timetable-senior-project/issues)
3. Check Docker logs: `pnpm test:db:logs`
4. Ask in team chat or create a new issue
