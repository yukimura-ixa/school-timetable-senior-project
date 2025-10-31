# Testing Guide

Complete guide for running automated tests in the School Timetable project.

## Quick Start

```bash
# Run all tests
./scripts/run-automated-tests.sh

# Run only unit tests
./scripts/run-automated-tests.sh --unit-only

# Run only E2E tests
./scripts/run-automated-tests.sh --e2e-only
```

## Prerequisites

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and configure:
# - DATABASE_URL (for E2E tests)
# - AUTH_SECRET
# - Other required variables
```

### 3. Generate Prisma Client

```bash
pnpm prisma generate
```

### 4. Set Up Database (for E2E tests)

```bash
# Run migrations
pnpm db:migrate

# Seed database with test data
pnpm db:seed:clean
```

### 5. Install Playwright Browsers (for E2E tests)

```bash
pnpm playwright:install
```

## Test Types

### Unit Tests (Jest)

**Location:** `__test__/` and `src/` directories  
**Framework:** Jest + React Testing Library  
**Purpose:** Test individual components, services, and utilities

#### Running Unit Tests

```bash
# Run all unit tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run specific test file
pnpm test lock-template.service.test.ts

# Run with coverage
pnpm test -- --coverage

# Run tests matching pattern
pnpm test -- --testNamePattern="should resolve"
```

#### Unit Test Structure

```
__test__/
├── component/          # React component tests
├── config/            # Configuration tests
├── features/          # Feature-specific tests
│   ├── conflict/     # Conflict detection
│   ├── dashboard/    # Dashboard features
│   ├── lock/         # Locking functionality
│   └── program/      # Program management
├── functions/         # Utility function tests
├── integration/       # Integration tests
├── utils/            # Utility tests
└── *.test.ts         # Root-level tests
```

### E2E Tests (Playwright)

**Location:** `e2e/` directory  
**Framework:** Playwright  
**Purpose:** Test complete user workflows and UI interactions

#### Running E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI mode (interactive)
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Run in debug mode
pnpm test:e2e:debug

# Run specific test file
pnpm test:e2e 01-home-page.spec.ts

# Run on specific browser
pnpm test:e2e:chromium
pnpm test:e2e:brave

# Run specific test suite
pnpm test:e2e:admin        # Admin auth tests
```

#### E2E Test Structure

```
e2e/
├── 01-home-page.spec.ts                      # Homepage tests
├── 02-data-management.spec.ts                # CRUD operations
├── 03-schedule-config.spec.ts                # Configuration
├── 04-timetable-arrangement.spec.ts          # Timetable UI
├── 05-viewing-exports.spec.ts                # Export features
├── 06-public-homepage.spec.ts                # Public pages
├── 07-server-component-migration.spec.ts     # Server components
├── 08-drag-and-drop.spec.ts                  # Drag & drop
├── 09-program-management.spec.ts             # Programs
├── 10-program-subject-assignment.spec.ts     # Subject assignment
├── 11-activity-management.spec.ts            # Activities
├── 12-conflict-detector.spec.ts              # Conflict detection
├── 13-bulk-lock.spec.ts                      # Bulk operations
├── 14-lock-templates.spec.ts                 # Templates
├── admin-auth-flow.spec.ts                   # Admin auth
├── dashboard.spec.ts                         # Dashboard
├── dashboard/                                # Dashboard tests
├── fixtures/                                 # Test fixtures
├── helpers/                                  # Helper functions
├── integration/                              # Integration tests
└── smoke/                                    # Smoke tests
```

## Test Reports

### Unit Test Reports

After running unit tests, results are displayed in the console.

For JSON output:
```bash
pnpm test -- --json --outputFile=test-results.json
```

### E2E Test Reports

Playwright automatically generates HTML reports:

```bash
# View the latest report
pnpm test:report

# Report location: playwright-report/index.html
```

Reports include:
- Test results summary
- Screenshots of failures
- Videos of test runs
- Detailed trace files

## Debugging Tests

### Debugging Unit Tests

1. **Use VS Code Debugger:**
   - Set breakpoints in test files
   - Run "Jest: Debug" in VS Code

2. **Add console logs:**
   ```typescript
   console.log('Value:', value);
   ```

3. **Use focused tests:**
   ```typescript
   it.only('should test this specific case', () => {
     // Only this test runs
   });
   ```

### Debugging E2E Tests

1. **Use Debug Mode:**
   ```bash
   pnpm test:e2e:debug
   ```

2. **Use Headed Mode:**
   ```bash
   pnpm test:e2e:headed
   ```

3. **Use UI Mode:**
   ```bash
   pnpm test:e2e:ui
   ```

4. **Add debug steps in test:**
   ```typescript
   await page.pause(); // Pause execution
   await page.screenshot({ path: 'debug.png' });
   ```

## Common Issues and Solutions

### Issue: "DATABASE_URL not found"

**Solution:**
```bash
cp .env.example .env
# Edit .env and set DATABASE_URL
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
pnpm prisma generate
```

### Issue: "Playwright browsers not installed"

**Solution:**
```bash
pnpm playwright:install
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 pnpm test:e2e
```

### Issue: "Test timeout"

**Solution:**
```bash
# Increase timeout in jest.config.js or playwright.config.ts
# Or run with increased timeout:
pnpm test -- --testTimeout=10000
```

### Issue: "Tests fail in CI but pass locally"

**Common causes:**
- Different environment variables
- Missing dependencies
- Database state differences
- Timezone differences

**Solution:**
- Ensure CI has same .env setup
- Use database seeding
- Make tests timezone-agnostic

## Test Best Practices

### Writing Unit Tests

✅ **DO:**
- Keep tests small and focused
- Use descriptive test names
- Test one thing per test
- Use beforeEach for setup
- Mock external dependencies
- Use `createTestInput()` helpers

❌ **DON'T:**
- Test implementation details
- Create interdependent tests
- Use real database in unit tests
- Leave commented-out tests

### Writing E2E Tests

✅ **DO:**
- Test complete user workflows
- Use Page Object pattern
- Add proper waits
- Take screenshots on failure
- Test error scenarios
- Use data-testid attributes

❌ **DON'T:**
- Test internal implementation
- Use hard-coded waits
- Create flaky tests
- Ignore accessibility
- Skip error handling

## Continuous Integration

### GitHub Actions

Tests run automatically on:
- Push to main branch
- Pull requests
- Scheduled runs (nightly)

### CI Commands

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Run linter
pnpm lint

# Type check
pnpm typecheck

# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

## Test Coverage

### Viewing Coverage

```bash
# Generate coverage report
pnpm test -- --coverage

# Coverage report location: coverage/
# View HTML report: coverage/lcov-report/index.html
```

### Coverage Goals

- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

### Focus Areas for Coverage

1. **Critical paths:**
   - Authentication
   - Schedule arrangement
   - Conflict detection
   - Data validation

2. **Business logic:**
   - Template resolution
   - MOE validation
   - Program validation
   - Statistics calculation

3. **Error handling:**
   - Input validation
   - API error responses
   - Database errors

## Performance Testing

### Running Performance Tests

```bash
# Run tests with performance metrics
pnpm test -- --verbose

# E2E tests include performance metrics
pnpm test:e2e
```

### Performance Benchmarks

- Unit test suite: < 10 seconds
- E2E test suite: < 5 minutes
- Individual E2E test: < 30 seconds

## Test Data Management

### Test Fixtures

Located in `e2e/fixtures/`:
- `test-data.ts` - Sample data for tests
- `mock-users.ts` - Mock user accounts
- `mock-schedules.ts` - Mock schedules

### Database Seeding

```bash
# Seed with clean data
pnpm db:seed:clean

# Seed with sample data
pnpm db:seed
```

## Advanced Topics

### Mocking

#### Mock API calls:
```typescript
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn(),
}));
```

#### Mock Prisma:
```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    schedule: {
      findMany: jest.fn(),
    },
  },
}));
```

### Parallel Testing

E2E tests run sequentially by default for data consistency.

To enable parallel execution:
```typescript
// playwright.config.ts
fullyParallel: true,
workers: 4,
```

### Visual Testing

Add screenshot comparison tests:
```typescript
await expect(page).toHaveScreenshot('homepage.png');
```

## Getting Help

### Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)

### Internal Documentation

- `TEST_AUTOMATION_REPORT.md` - Full test suite report
- `e2e/README.md` - E2E test documentation
- `e2e/TEST_PLAN.md` - E2E test plan
- `e2e/TEST_RESULTS_SUMMARY.md` - E2E results

### Contact

For testing questions:
1. Check this guide first
2. Review test documentation
3. Check existing tests for examples
4. Ask the team

## Appendix: Package Scripts

All test-related scripts from `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watchAll",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:brave": "playwright test --project=brave",
    "test:e2e:chromium": "playwright test --project=chromium",
    "test:e2e:admin": "playwright test e2e/admin-auth-flow.spec.ts",
    "test:report": "playwright show-report",
    "playwright:install": "playwright install --with-deps chromium"
  }
}
```
