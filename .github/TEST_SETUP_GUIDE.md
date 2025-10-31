# Test Setup Guide

Quick reference for setting up and running tests in this project.

## Quick Start

```bash
# 1. Install pnpm (if not already installed)
npm install -g pnpm@10.20.0

# 2. Install dependencies
pnpm install --frozen-lockfile

# 3. Create .env file (copy from template below)
cp .env.example .env  # Or create manually

# 4. Generate Prisma client
pnpm prisma generate

# 5. Run tests
pnpm test
```

## Environment Variables

Create `.env` file in project root:

```bash
# For Unit Tests (mock-based, no real DB needed)
AUTH_SECRET="test-secret-key-for-development-only-32chars"
AUTH_URL=http://localhost:3000
ENABLE_DEV_BYPASS=true
DEV_USER_ID=1
DEV_USER_EMAIL=admin@test.com
DEV_USER_NAME=Test Admin
DEV_USER_ROLE=admin

# For E2E Tests (requires real database)
DATABASE_URL="******localhost:3306/test_db"
```

## Test Types

### Unit Tests (Jest)

**Location**: `__test__/` and `src/**/*.test.ts`

**Run commands**:
```bash
pnpm test                    # Run all unit tests
pnpm test:watch             # Run in watch mode
pnpm test -- --clearCache   # Clear Jest cache
pnpm test lock-template     # Run specific test file
```

**Database**: Uses mocks (no real database needed)
- Mocks defined in `jest.setup.js`
- Fast execution (< 5 seconds for 300+ tests)
- Test data defined inline in test files

### E2E Tests (Playwright)

**Location**: `e2e/` directory

**Run commands**:
```bash
pnpm test:e2e               # Run all E2E tests
pnpm test:e2e:ui            # Run with UI
pnpm test:e2e:headed        # Run in headed mode
pnpm test:e2e:debug         # Run in debug mode
pnpm test:report            # View test report
```

**Database**: Requires real database with seed data
```bash
# Set up database
pnpm db:migrate             # Run migrations
pnpm db:seed:clean          # Seed with test data
```

## Database Simulation Approaches

### Approach 1: Mock-Based (Current for Unit Tests)

**Advantages**:
- ✅ Fast execution (< 5 seconds)
- ✅ No database setup required
- ✅ Tests are isolated and independent
- ✅ Easy to run in CI/CD

**Implementation**:
- Prisma client mocked in `jest.setup.js`
- Test data defined inline in test files
- No external dependencies

**Example** (from `lock-template.service.test.ts`):
```typescript
const mockGrades = [
  { GradeID: "1-1", GradeName: "ม.1/1", Level: 1 },
  { GradeID: "1-2", GradeName: "ม.1/2", Level: 1 },
];

const mockTimeslots = [
  { TimeslotID: "1-MON-1", Day: "MON", PeriodStart: 1 },
  { TimeslotID: "1-MON-4", Day: "MON", PeriodStart: 4 },
];
```

### Approach 2: Seed-Based (For E2E Tests)

**Advantages**:
- ✅ Tests real database interactions
- ✅ Validates actual SQL queries
- ✅ Catches database-specific issues
- ✅ Realistic Thai school data

**Implementation**:
- Use `prisma/seed.ts` file
- Creates 60 teachers, 18 grades, 50+ subjects
- Realistic Thai names and school structure

**Setup**:
```bash
# 1. Configure database
DATABASE_URL="******localhost:3306/test_db"

# 2. Run migrations
pnpm db:migrate

# 3. Seed data
pnpm db:seed:clean
```

### Approach 3: In-Memory Database (Future)

**Not currently implemented**, but could be added:

```bash
# Using SQLite in-memory
DATABASE_URL="file::memory:?cache=shared"

# Or using jest-prisma
pnpm add -D jest-prisma @databases/sqlite
```

**Advantages**:
- ✅ Faster than real database
- ✅ No external database needed
- ✅ Automatic setup/teardown

## Troubleshooting

### "Cannot find module '@prisma/client'"

```bash
pnpm prisma generate
```

### "Missing required environment variable: DATABASE_URL"

For **unit tests**: Create `.env` with minimal config (DATABASE_URL not needed)

For **E2E tests**: Add `DATABASE_URL` to `.env` file

### Tests fail with "Module not found"

```bash
# Clear cache and reinstall
pnpm test -- --clearCache
rm -rf node_modules
pnpm install --frozen-lockfile
```

### Jest cache issues

```bash
pnpm test -- --clearCache --no-cache
```

## Test Structure

```
project/
├── __test__/                    # Unit tests
│   ├── component/              # Component tests
│   ├── features/               # Feature tests
│   │   ├── lock/              # Lock template tests
│   │   ├── conflict/          # Conflict detection tests
│   │   └── dashboard/         # Dashboard tests
│   ├── functions/             # Utility function tests
│   └── utils/                 # Utility tests
├── e2e/                        # E2E tests
│   ├── 01-home-page.spec.ts
│   ├── 02-data-management.spec.ts
│   └── ...
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Jest mocks and setup
└── playwright.config.ts        # Playwright configuration
```

## Running Tests in CI/CD

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm@10.20.0
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Generate Prisma Client
        run: pnpm prisma generate
      
      - name: Run Unit Tests
        run: pnpm test
        env:
          AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
```

## Best Practices

### ✅ Do

- Use mocks for unit tests (fast and isolated)
- Use seed data for E2E tests (realistic scenarios)
- Run `pnpm prisma generate` after schema changes
- Keep test data in test files for unit tests
- Use descriptive test names
- Test one thing per test
- Clean up after tests (if using real DB)

### ❌ Don't

- Don't use real database for unit tests
- Don't skip `pnpm prisma generate`
- Don't commit `.env` file
- Don't create interdependent tests
- Don't use hard-coded IDs in tests

## Test Coverage

Current coverage:
- **Unit Tests**: 333 passing (100% pass rate)
- **E2E Tests**: 302+ documented
- **Total**: 650+ automated tests

To generate coverage report:
```bash
pnpm test -- --coverage
```

## Additional Resources

- **TESTING_GUIDE.md** - Comprehensive testing guide
- **TEST_AUTOMATION_REPORT.md** - Test suite analysis
- **jest.setup.js** - Mock configuration
- **prisma/seed.ts** - Database seeding logic

---

**Last Updated**: October 31, 2025
