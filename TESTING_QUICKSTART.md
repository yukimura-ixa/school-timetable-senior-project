# Testing Quick Start Guide

Quick reference for running tests on the School Timetable Management System.

## Prerequisites

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate
```

## Unit Tests (Jest)

### Run Tests
```bash
# Run all unit tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run specific test file
pnpm test __test__/features/conflict/conflict-detector.test.ts
```

### Current Status
- **277/349 tests passing (79.4%)**
- Execution time: ~4.7 seconds
- Known issue: 7 test suites need Prisma mock updates

## E2E Tests (Playwright)

### Setup Database
```bash
# Start PostgreSQL test database
docker compose -f docker-compose.test.yml up -d

# Apply migrations
pnpm db:deploy

# (Optional) Seed test data
pnpm db:seed
```

### Install Browsers
```bash
# Install Playwright browsers
pnpm playwright:install
```

### Run E2E Tests
```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI mode (interactive)
pnpm test:e2e:ui

# Run with headed browser (visible)
pnpm test:e2e:headed

# Run specific test
pnpm playwright test e2e/01-home-page.spec.ts
```

### Current Status
- **Infrastructure: ✅ Ready**
- **Test Specs: 29 files available**
- **Database: ✅ Running on port 5433**
- **Pending: Browser installation**

## Environment Files

### `.env` (Development)
```env
DATABASE_URL="postgresql://test_user:test_password@localhost:5433/test_timetable"
AUTH_SECRET="test-secret-key"
ENABLE_DEV_BYPASS="true"
DEV_USER_EMAIL="admin@test.com"
DEV_USER_ROLE="admin"
```

### `.env.test` (E2E Tests)
```env
ENABLE_DEV_BYPASS=true
DEV_USER_ID=1
DEV_USER_EMAIL=admin@test.local
DEV_USER_NAME=E2E Admin
DEV_USER_ROLE=admin
AUTH_SECRET=testing-secret-not-for-prod
```

## Troubleshooting

### Database Connection Error
```bash
# Check if database is running
docker ps | grep timetable-test-db

# Restart database
docker compose -f docker-compose.test.yml restart
```

### Playwright Browser Not Found
```bash
# Reinstall browsers
npx playwright install chromium --with-deps
```

### Test Failures
```bash
# Clear Jest cache
pnpm test --clearCache

# Run specific failing test
pnpm test <test-file-path>
```

## Documentation

- **Detailed Results**: `TEST_EXECUTION_RESULTS.md`
- **Executive Summary**: `TEST_SUMMARY.md`
- **Execution Log**: `EXECUTION_LOG.md`
- **Full Guide**: `docs/E2E_TEST_EXECUTION_GUIDE.md`

## Quick Commands Reference

```bash
# Setup
pnpm install
pnpm prisma generate
docker compose -f docker-compose.test.yml up -d
pnpm db:deploy

# Test
pnpm test              # Unit tests
pnpm test:e2e          # E2E tests

# Database
pnpm db:studio         # Open Prisma Studio
pnpm db:seed           # Seed database

# Clean up
docker compose -f docker-compose.test.yml down -v
```

---

**Last Updated**: October 31, 2025  
**Test Pass Rate**: 79.4% (unit tests)
