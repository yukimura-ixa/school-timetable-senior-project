# GitHub Copilot - Test Environment Configuration

> Configuration for AI-assisted test creation and maintenance in VS Code.
> This file is automatically read by GitHub Copilot in cloud/workspace mode.

---

## Test Environment Overview

This project uses a comprehensive testing strategy:

- **Jest 29.7.0** for unit tests
- **Playwright 1.56.1** for E2E tests
- **React Testing Library 16.3.0** for component tests

---

## Unit Testing (Jest)

### Location & Structure

```
__test__/
├── features/               # Feature-based tests
│   ├── assign/
│   ├── class/
│   ├── conflict/
│   └── {domain}/
│       ├── {domain}.repository.test.ts
│       ├── {domain}-validation.test.ts
│       └── {domain}.actions.test.ts
├── utils/                  # Utility function tests
├── integration/            # Integration tests
└── __mocks__/             # Mock implementations
```

### Test File Naming

- Repository tests: `{domain}.repository.test.ts`
- Domain services: `{domain}-validation.test.ts`
- Server Actions: `{domain}.actions.test.ts`
- Utilities: `{utility-name}.test.ts`

### Test Pattern Template

```typescript
/**
 * Unit Tests for {Feature} {Component}
 *
 * Tests verify:
 * - Core business logic
 * - Validation rules
 * - Error handling
 * - Edge cases
 */

import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { functionToTest } from "@/features/{domain}/domain/services/{domain}-service";

describe("{ComponentName}", () => {
  // Setup before each test
  beforeEach(() => {
    // Initialize test data
  });

  // Cleanup after each test
  afterEach(() => {
    // Reset state
  });

  describe("Happy Path", () => {
    test("should handle normal case correctly", () => {
      const result = functionToTest(validInput);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty input", () => {
      const result = functionToTest([]);
      expect(result.success).toBe(false);
      expect(result.error).toContain("ข้อมูลว่าง");
    });

    test("should handle null values", () => {
      const result = functionToTest(null);
      expect(result.success).toBe(false);
    });
  });

  describe("Error Handling", () => {
    test("should throw error for invalid input", () => {
      expect(() => functionToTest(invalidInput)).toThrow();
    });
  });
});
```

### Table-Driven Test Pattern

```typescript
describe("validateBusinessRule", () => {
  const testCases = [
    {
      name: "should accept valid data",
      input: { valid: "data" },
      expected: { success: true },
    },
    {
      name: "should reject invalid data",
      input: { invalid: "data" },
      expected: { success: false, error: "ข้อมูลไม่ถูกต้อง" },
    },
    // Add more cases
  ];

  testCases.forEach(({ name, input, expected }) => {
    test(name, () => {
      const result = validateBusinessRule(input);
      expect(result).toEqual(expected);
    });
  });
});
```

### Mocking Prisma Client

```typescript
import { jest } from "@jest/globals";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    teacher: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    // Add other models as needed
  },
}));

// In test
import prisma from "@/lib/prisma";

test("should fetch teachers", async () => {
  const mockTeachers = [{ TeacherID: "T001", Name: "John" }];
  (prisma.teacher.findMany as jest.Mock).mockResolvedValue(mockTeachers);

  const result = await teacherRepository.findAll();

  expect(result).toEqual(mockTeachers);
  expect(prisma.teacher.findMany).toHaveBeenCalledTimes(1);
});
```

### Running Unit Tests

```bash
# Run all unit tests
pnpm test

# Watch mode (auto-rerun on changes)
pnpm test:watch

# Run specific test file
pnpm test __test__/features/teacher/teacher-validation.test.ts

# Run tests matching pattern
pnpm test --testNamePattern="conflict"

# Generate coverage report
pnpm test --coverage
```

---

## E2E Testing (Playwright)

### Location & Structure

```
e2e/
├── smoke/                  # Quick smoke tests
│   └── semester-smoke.spec.ts
├── features/              # Feature-based E2E tests
│   ├── schedule-assignment.spec.ts
│   ├── schedule-arrangement.spec.ts
│   └── schedule-conflicts.spec.ts
├── integration/           # Integration tests
│   ├── public-pages.spec.ts
│   └── analytics-dashboard.spec.ts
└── admin-auth-flow.spec.ts  # Authentication flows
```

### Test File Naming

- Feature tests: `{feature-name}.spec.ts`
- Integration tests: `{area}-integration.spec.ts`
- Smoke tests: `{area}-smoke.spec.ts`

### E2E Test Pattern Template

```typescript
/**
 * E2E Tests for {Feature Name}
 *
 * Tests critical user flows:
 * - {Flow 1 description}
 * - {Flow 2 description}
 */

import { test, expect } from "@playwright/test";

test.describe("{Feature Name}", () => {
  // Setup authentication
  test.beforeEach(async ({ page }) => {
    // Login as admin (if needed)
    await page.goto("/signin");
    // Handle auth flow
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should complete {action} successfully", async ({ page }) => {
    // Navigate to page
    await page.goto("/schedule/1-2567/assign");

    // Wait for page load
    await expect(page.locator("h1")).toContainText("มอบหมายรายวิชา");

    // Perform action
    await page.click('button:has-text("เพิ่มรายวิชา")');
    await page.fill('input[name="subjectCode"]', "TH101");
    await page.click('button[type="submit"]');

    // Verify result
    await expect(page.locator("text=บันทึกสำเร็จ")).toBeVisible();

    // Verify data persistence
    await page.reload();
    await expect(page.locator("text=TH101")).toBeVisible();
  });

  test("should validate {error condition}", async ({ page }) => {
    // Setup error scenario
    await page.goto("/schedule/1-2567/assign");

    // Trigger error
    await page.click('button:has-text("เพิ่มรายวิชา")');
    // Don't fill required fields
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator("text=กรุณากรอกข้อมูล")).toBeVisible();
  });
});
```

### Test Data Strategy

**Use seeded data from `prisma/seed.ts`:**

- **Semesters**: `1-2567`, `2-2567`, `1-2568`
- **Teachers**: Seeded teachers with known IDs
- **Classes**: Seeded grade levels (M.1/1, M.2/1, etc.)
- **Subjects**: Seeded subjects with known codes

**Document in test comments:**

```typescript
test("should assign teacher to class", async ({ page }) => {
  // Using seeded semester: 1-2567
  // Using seeded teacher: Check seed.ts for current IDs
  // Using seeded class: M.1/1
  await page.goto("/schedule/1-2567/assign");
  // ...
});
```

### Page Object Pattern (Optional)

```typescript
// e2e/page-objects/schedule-assign.page.ts
export class ScheduleAssignPage {
  constructor(private page: Page) {}

  async goto(semesterAndYear: string) {
    await this.page.goto(`/schedule/${semesterAndYear}/assign`);
  }

  async selectGrade(gradeLevel: string) {
    await this.page.selectOption('select[name="gradeLevel"]', gradeLevel);
  }

  async addSubject(subjectCode: string, teacherId: string) {
    await this.page.click('button:has-text("เพิ่มรายวิชา")');
    await this.page.fill('input[name="subjectCode"]', subjectCode);
    await this.page.selectOption('select[name="teacherId"]', teacherId);
  }

  async save() {
    await this.page.click('button[type="submit"]');
  }

  async expectSuccessMessage() {
    await expect(this.page.locator("text=บันทึกสำเร็จ")).toBeVisible();
  }
}

// In test
test("should assign subject", async ({ page }) => {
  const assignPage = new ScheduleAssignPage(page);
  await assignPage.goto("1-2567");
  await assignPage.selectGrade("M.1/1");
  await assignPage.addSubject("TH101", "T001");
  await assignPage.save();
  await assignPage.expectSuccessMessage();
});
```

### Running E2E Tests

```bash
# Run all E2E tests (local)
pnpm test:e2e

# UI mode (interactive debugging)
pnpm test:e2e:ui

# Headed mode (see browser)
pnpm test:e2e:headed

# Debug mode (step through)
pnpm test:e2e:debug

# Run specific test file
pnpm test:e2e e2e/features/schedule-assignment.spec.ts

# Run specific browser
pnpm test:e2e:chromium
pnpm test:e2e:brave

# Test against Vercel production
pnpm test:vercel

# Test specific area on Vercel
pnpm test:vercel:public
pnpm test:vercel:dashboard
```

---

## Test Environment Variables

### Required for Tests

```env
# Database (test DB recommended)
DATABASE_URL="postgresql://..."

# Auth (test Google account)
AUTH_SECRET="test-secret"
AUTH_GOOGLE_ID="test-client-id"
AUTH_GOOGLE_SECRET="test-client-secret"

# Test user credentials (for E2E)
TEST_ADMIN_EMAIL="admin@school.local"
TEST_ADMIN_PASSWORD="admin123"

# Seed
SEED_SECRET="test-seed-secret"

# Prisma Seed Configuration for E2E Tests
SEED_FOR_TESTS="true"           # Enables test mode in seed script
SEED_CLEAN_DATA="false"         # Set to "true" to delete all data before seeding (DANGEROUS!)

# Next.js
NEXT_TELEMETRY_DISABLED="1"
```

### Test-Specific Config

Create `.env.test.local` for test-specific overrides:

```env
DATABASE_URL="postgresql://localhost:5432/test_db"
NODE_ENV="test"
SEED_FOR_TESTS="true"
SEED_CLEAN_DATA="false"
```

### Prisma Seed for E2E Cloud Tests

**Important**: E2E tests rely on seeded data. Before running E2E tests in cloud environment:

#### 1. Seed Test Database

```bash
# Standard seed (preserves existing data, adds test data)
pnpm db:seed

# Clean seed (DELETES ALL DATA, then seeds - use carefully!)
pnpm db:seed:clean

# Or manually with environment variables
SEED_FOR_TESTS=true tsx prisma/seed.ts
SEED_CLEAN_DATA=true SEED_FOR_TESTS=true tsx prisma/seed.ts
```

#### 2. Verify Seed Data

```bash
# Open Prisma Studio to verify seeded data
pnpm db:studio

# Check for test semesters (should exist):
# - 1-2567 (Semester 1, Academic Year 2567)
# - 2-2567 (Semester 2, Academic Year 2567)
# - 1-2568 (Semester 1, Academic Year 2568)
```

#### 3. Seed Data Reference

**Seeded Test Data** (from `prisma/seed.ts`):

- **Semesters**: 1-2567, 2-2567, 1-2568
- **Teachers**: Multiple teachers with departments
- **Subjects**: Core subjects (TH, EN, MA, SCI, SOC)
- **Programs**: M1-SCI, M1-LANG, M2-SCI, M2-LANG
- **Grade Levels**: M.1/1, M.1/2, M.2/1, M.2/2
- **Rooms**: Multiple classrooms
- **Timeslots**: Full schedule grid (MON-FRI, 8 periods/day)

**Reference in E2E Tests**:

```typescript
// Use seeded semester IDs
await page.goto("/schedule/1-2567/assign");

// Use seeded teacher IDs (check seed.ts for current IDs)
await page.selectOption('select[name="teacherId"]', "seeded-teacher-id");

// Use seeded class IDs
await page.selectOption('select[name="gradeLevel"]', "M.1/1");
```

#### 4. Cloud CI/CD Seed Strategy

**GitHub Actions / Cloud Environment**:

##### Option A: Temporary PostgreSQL Database (Recommended)

Use an ephemeral PostgreSQL service container for clean, isolated tests:

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    # Temporary PostgreSQL service container
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

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Setup environment
        run: |
          echo "DATABASE_URL=postgresql://test_user:test_password@localhost:5432/test_timetable" >> .env.test.local
          echo "AUTH_SECRET=${{ secrets.AUTH_SECRET }}" >> .env.test.local
          echo "AUTH_GOOGLE_ID=${{ secrets.AUTH_GOOGLE_ID }}" >> .env.test.local
          echo "AUTH_GOOGLE_SECRET=${{ secrets.AUTH_GOOGLE_SECRET }}" >> .env.test.local
          echo "SEED_FOR_TESTS=true" >> .env.test.local
          echo "SEED_CLEAN_DATA=true" >> .env.test.local
          echo "NEXT_TELEMETRY_DISABLED=1" >> .env.test.local

      - name: Apply database migrations
        run: pnpm db:deploy
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_timetable

      - name: Seed test database (clean slate)
        run: pnpm db:seed:clean
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_timetable
          SEED_FOR_TESTS: "true"
          SEED_CLEAN_DATA: "true"

      - name: Install Playwright browsers
        run: pnpm playwright:install

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_timetable

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload test videos (on failure)
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-videos
          path: test-results/
          retention-days: 7
# Temporary database is automatically destroyed after job completes
```

**Benefits of Temporary Database**:

- ✅ **Isolated**: Each test run gets a fresh database
- ✅ **Fast**: No cleanup needed, destroyed automatically
- ✅ **Safe**: Cannot affect production or staging
- ✅ **Consistent**: Same starting state every time
- ✅ **Cost-effective**: No persistent test database needed
- ✅ **Parallel**: Multiple PRs can run simultaneously

##### Option B: Persistent Test Database

Use a persistent test database (e.g., Vercel Postgres, Supabase):

```yaml
# .github/workflows/e2e-tests-persistent.yml
name: E2E Tests (Persistent DB)

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Setup environment
        run: |
          echo "DATABASE_URL=${{ secrets.TEST_DATABASE_URL }}" >> .env.test.local
          echo "AUTH_SECRET=${{ secrets.AUTH_SECRET }}" >> .env.test.local
          echo "SEED_FOR_TESTS=true" >> .env.test.local

      - name: Apply database migrations
        run: pnpm db:deploy

      - name: Seed test database
        run: pnpm db:seed
        env:
          SEED_FOR_TESTS: "true"
          SEED_CLEAN_DATA: "false"

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

**When to Use Each Option**:

| Feature              | Temporary DB (Option A) | Persistent DB (Option B)     |
| -------------------- | ----------------------- | ---------------------------- |
| **Isolation**        | ✅ Perfect              | ⚠️ Shared between runs       |
| **Speed**            | ✅ Fast (no cleanup)    | ⚠️ Slower (needs cleanup)    |
| **Cost**             | ✅ Free                 | 💰 May have costs            |
| **Setup**            | ✅ Simple               | ⚠️ Requires external service |
| **Data persistence** | ❌ Destroyed after run  | ✅ Persists                  |
| **Best for**         | CI/CD, PRs              | Manual testing, debugging    |

#### 5. Environment-Specific Seed Flags

| Environment    | `SEED_FOR_TESTS` | `SEED_CLEAN_DATA` | Use Case                        |
| -------------- | ---------------- | ----------------- | ------------------------------- |
| **Local Dev**  | `false`          | `false`           | Preserve data, add minimal seed |
| **Local Test** | `true`           | `false`           | Add test data without deletion  |
| **CI/CD**      | `true`           | `true`            | Clean slate for each test run   |
| **Staging**    | `false`          | `false`           | Preserve staging data           |
| **Production** | `false`          | `false`           | Never delete production data    |

**Warning**: `SEED_CLEAN_DATA=true` **DELETES ALL DATA**. Only use in:

- ✅ Test databases
- ✅ CI/CD ephemeral databases
- ❌ **NEVER in production**
- ❌ **NEVER in staging**

#### 6. Seed Data Consistency

**Best Practices**:

- Document seed data IDs in `prisma/seed.ts` comments
- Use deterministic IDs (e.g., `T001`, `S001`) for easy reference
- Keep seed data minimal but sufficient for all test scenarios
- Update tests when seed data changes
- Version control seed script alongside tests

---

## Local Temporary Database Setup

For local E2E testing with an isolated temporary database:

### Option 1: Docker Compose (Recommended)

Create `docker-compose.test.yml`:

```yaml
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
      - "5433:5432" # Use 5433 to avoid conflicts with existing PostgreSQL
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

**Usage**:

```bash
# Start temporary test database
docker-compose -f docker-compose.test.yml up -d

# Wait for database to be ready
docker-compose -f docker-compose.test.yml ps

# Setup environment for tests
echo "DATABASE_URL=postgresql://test_user:test_password@localhost:5433/test_timetable" > .env.test.local
echo "SEED_FOR_TESTS=true" >> .env.test.local
echo "SEED_CLEAN_DATA=true" >> .env.test.local

# Apply migrations
pnpm db:deploy

# Seed test data
pnpm db:seed:clean

# Run E2E tests
pnpm test:e2e

# Stop and remove test database
docker-compose -f docker-compose.test.yml down -v
```

### Option 2: PostgreSQL Running Locally

If you have PostgreSQL installed locally:

```bash
# Create test database
psql -U postgres -c "CREATE DATABASE test_timetable;"
psql -U postgres -c "CREATE USER test_user WITH PASSWORD 'test_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE test_timetable TO test_user;"

# Setup environment
export DATABASE_URL="postgresql://test_user:test_password@localhost:5432/test_timetable"
export SEED_FOR_TESTS=true
export SEED_CLEAN_DATA=true

# Apply migrations
pnpm db:deploy

# Seed test data
pnpm db:seed:clean

# Run E2E tests
pnpm test:e2e

# Cleanup (optional)
psql -U postgres -c "DROP DATABASE test_timetable;"
psql -U postgres -c "DROP USER test_user;"
```

### Option 3: Quick Test Script (PowerShell)

Create `scripts/run-e2e-tests.ps1`:

```powershell
#!/usr/bin/env pwsh

# Start test database container
Write-Host "Starting test database..." -ForegroundColor Cyan
docker-compose -f docker-compose.test.yml up -d

# Wait for database
Write-Host "Waiting for database to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Setup environment
Write-Host "Setting up environment..." -ForegroundColor Cyan
@"
DATABASE_URL=postgresql://test_user:test_password@localhost:5433/test_timetable
SEED_FOR_TESTS=true
SEED_CLEAN_DATA=true
NEXT_TELEMETRY_DISABLED=1
"@ | Out-File -FilePath .env.test.local -Encoding utf8

# Apply migrations
Write-Host "Applying database migrations..." -ForegroundColor Cyan
pnpm db:deploy

# Seed database
Write-Host "Seeding test data..." -ForegroundColor Cyan
pnpm db:seed:clean

# Run E2E tests
Write-Host "Running E2E tests..." -ForegroundColor Green
pnpm test:e2e

# Capture exit code
$testExitCode = $LASTEXITCODE

# Cleanup
Write-Host "Cleaning up test database..." -ForegroundColor Cyan
docker-compose -f docker-compose.test.yml down -v

# Exit with test result
exit $testExitCode
```

**Usage**:

```bash
# Make executable (Git Bash)
chmod +x scripts/run-e2e-tests.ps1

# Run tests with temp database
pwsh scripts/run-e2e-tests.ps1
```

---

## Playwright Configuration

### Local Tests (`playwright.config.ts`)

- Uses local dev server (`http://localhost:3000`)
- Runs on `pnpm test:e2e`
- Full browser testing (Chromium, Brave if available)

### Vercel Tests (`playwright.vercel.config.ts`)

- Uses production URL (`https://phrasongsa-timetable.vercel.app`)
- Runs on `pnpm test:vercel`
- Public pages only (no authentication)

---

## Test Coverage Guidelines

### What Copilot Should Test

**Unit Tests (Always):**

- ✅ Domain service functions (pure logic)
- ✅ Validation functions
- ✅ Repository methods (mocked Prisma)
- ✅ Utility functions
- ✅ Business rule enforcement

**E2E Tests (Critical Flows):**

- ✅ Schedule creation workflow
- ✅ Schedule modification
- ✅ Conflict detection
- ✅ Export functionality (Excel/PDF)
- ✅ Authentication flows
- ✅ Role-based access
- ✅ Public pages (teacher search, class search)

**What NOT to Test:**

- ❌ Prisma Client internals
- ❌ Third-party library internals
- ❌ Next.js framework code
- ❌ MUI component internals

### Coverage Targets

- **Unit tests**: 70%+ for domain services
- **E2E tests**: All critical user flows
- **Integration tests**: All Server Actions

---

## Common Test Patterns

### Testing Server Actions

```typescript
import { getTeacherByIdAction } from "@/features/teacher/application/actions/teacher.actions";

test("should return teacher by ID", async () => {
  const result = await getTeacherByIdAction({ TeacherID: "T001" });

  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
  expect(result.data?.TeacherID).toBe("T001");
});

test("should return error for invalid ID", async () => {
  const result = await getTeacherByIdAction({ TeacherID: "" });

  expect(result.success).toBe(false);
  expect(result.error).toContain("รหัสครูห้ามว่าง");
});
```

### Testing Validation Services

```typescript
import { validateTimeslotConflict } from "@/features/timeslot/domain/services/timeslot-validation.service";

describe("validateTimeslotConflict", () => {
  test("should detect same-time conflict", () => {
    const slot1 = { day: "MON", period: 1 };
    const slot2 = { day: "MON", period: 1 };

    const result = validateTimeslotConflict(slot1, slot2);

    expect(result.hasConflict).toBe(true);
    expect(result.message).toMatch(/ซ้ำซ้อน|ทับซ้อน/);
  });
});
```

### Testing with Fixtures

```typescript
// __test__/fixtures/teacher.fixtures.ts
export const mockTeacher = {
  TeacherID: "T001",
  Name: "สมชาย",
  Surname: "ใจดี",
  Department: "คณิตศาสตร์",
  isActive: true,
};

// In test
import { mockTeacher } from "../fixtures/teacher.fixtures";

test("should format teacher name", () => {
  const result = formatTeacherName(mockTeacher);
  expect(result).toBe("สมชาย ใจดี");
});
```

---

## Debugging Tests

### Jest Debugging

```bash
# Run with verbose output
pnpm test --verbose

# Run single test file with debug
node --inspect-brk node_modules/.bin/jest __test__/path/to/test.ts

# VS Code: Add breakpoint and press F5
```

### Playwright Debugging

```bash
# Debug mode (opens inspector)
pnpm test:e2e:debug

# UI mode (best for debugging)
pnpm test:e2e:ui

# Headed mode (see browser)
pnpm test:e2e:headed

# Slow down execution
PWDEBUG=1 pnpm test:e2e
```

### VS Code Integration

Add to `.vscode/launch.json`:

```json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Current File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["${fileBasename}", "--config", "jest.config.js"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Playwright Debug",
      "program": "${workspaceFolder}/node_modules/.bin/playwright",
      "args": ["test", "--debug"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

## Test Best Practices

### DO

- ✅ Write descriptive test names
- ✅ Use Thai error messages for user-facing validation
- ✅ Use table-driven tests for multiple scenarios
- ✅ Mock external dependencies (Prisma, APIs)
- ✅ Use seeded data for E2E tests
- ✅ Test both happy path and error cases
- ✅ Keep tests isolated (no shared state)
- ✅ Use meaningful assertions with clear error messages

### DON'T

- ❌ Test implementation details
- ❌ Write flaky tests (timing-dependent)
- ❌ Share state between tests
- ❌ Test third-party libraries
- ❌ Skip cleanup in afterEach
- ❌ Hardcode IDs without documenting seed data
- ❌ Use production database for tests

---

## Continuous Integration

Tests run automatically on:

- **Pre-commit**: Lint and type check
- **Pull Request**: Full test suite
- **Pre-deployment**: E2E tests against preview

GitHub Actions configuration handles:

- Unit test execution
- E2E test execution
- Coverage reporting
- Test result artifacts

---

## Quick Reference

```bash
# Unit tests
pnpm test                    # Run all
pnpm test:watch              # Watch mode
pnpm test --coverage         # With coverage

# E2E tests
pnpm test:e2e                # Run all (local)
pnpm test:e2e:ui             # UI mode
pnpm test:vercel             # Against production

# Code quality
pnpm lint                    # Lint
pnpm typecheck               # Type check
pnpm format                  # Format

# Combined
pnpm lint && pnpm test && pnpm test:e2e
```

---

**Last Updated**: October 31, 2025
**Next.js**: 16.0.1
**Jest**: 29.7.0
**Playwright**: 1.56.1
