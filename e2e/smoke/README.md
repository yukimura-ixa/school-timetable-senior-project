# Smoke Tests

This directory contains smoke tests for the School Timetable Management System. Smoke tests are a subset of the full E2E test suite designed to quickly verify that critical functionality works correctly.

## What are Smoke Tests?

Smoke tests are fast, focused tests that validate the most critical user paths in the application. They answer the question: **"Does the application work at a basic level?"**

Unlike comprehensive E2E tests, smoke tests:

- Run faster (~10-15 minutes vs 30-60 minutes for full E2E)
- Cover only critical paths
- Focus on happy path scenarios
- Are suitable for running on every PR

## Test Files

### `critical-smoke.spec.ts`

The main smoke test suite covering 8 critical user journeys:

1. **Authentication Flow** - Login, session persistence, unauthorized access
2. **Data Management** - Teacher CRUD operations with pagination
3. **Schedule Configuration** - Semester navigation, data loading, metrics
4. **Subject Assignment** - Assigning subjects to teachers
5. **Timetable Creation** - Teacher arrange page basics
6. **Conflict Detection** - Conflict warnings and locked timeslots
7. **View Teacher Schedule** - Schedule rendering and display
8. **Export to Excel** - Excel export functionality

### `visual-smoke.spec.ts`

Visual regression tests using screenshot comparison:

- **8 Critical Pages**: Home, management pages, schedule, dashboard

### `semester-smoke.spec.ts`

The main smoke test suite covering 8 critical user journeys:

1. **Authentication Flow** - Login, session persistence, unauthorized access
2. **Data Management** - Teacher CRUD operations with pagination
3. **Schedule Configuration** - Semester navigation, data loading, metrics
4. **Subject Assignment** - Assigning subjects to teachers
5. **Timetable Creation** - Teacher arrange page basics
6. **Conflict Detection** - Conflict warnings and locked timeslots
7. **View Teacher Schedule** - Schedule rendering and display
8. **Export to Excel** - Excel export functionality

### `semester-smoke.spec.ts`

Tests for semester-specific routes and navigation:

- Schedule config pages return 200 OK for all seeded terms
- Dashboard pages render correctly
- Route validation and error handling
- Cross-term navigation

## Running Smoke Tests

### Run All Smoke Tests

```bash
pnpm test:smoke
```

### Run Only Critical Path Tests

```bash
pnpm test:smoke:critical
```

### Run Visual Smoke Tests

```bash
# Run visual tests (compare screenshots)
pnpm test:smoke:visual

# Create/update baseline screenshots
pnpm test:smoke:visual:update

# View visual comparisons in UI
pnpm test:smoke:visual:ui
```

### Run in UI Mode (Interactive)

```bash
pnpm test:smoke:ui
```

### Run with Browser Visible

```bash
pnpm test:smoke:headed
```

## Expected Execution Time

- **Critical Smoke**: ~10-15 minutes
- **Semester Smoke**: ~5 minutes
- **Total Smoke Suite**: ~15-20 minutes

This is significantly faster than the full E2E suite (~30-60 minutes).

## CI Integration

Smoke tests run automatically on:

- Every pull request (via `.github/workflows/smoke-tests.yml`)
- Every push to `develop` and `main` branches
- Manual workflow dispatch

The smoke test workflow must pass before a PR can be merged.

## Test Data Requirements

Smoke tests use the seeded test data from `pnpm db:seed:clean`:

- 56 teachers
- 82 subjects
- Multiple classrooms and rooms
- 4 semesters (1-2567, 2-2567, 1-2568, 2-2568)

**Important**: Smoke tests do NOT create or destroy data. They verify that existing seeded data works correctly.

## When to Run Smoke Tests vs Full E2E

**Run Smoke Tests When:**

- Making a pull request
- Testing a quick fix
- Verifying basic functionality after changes
- You need fast feedback (< 20 minutes)

**Run Full E2E Tests When:**

- Merging to main branch
- Before deploying to production
- Testing complex drag-and-drop interactions
- Validating edge cases and error scenarios
- You need comprehensive coverage

## Adding New Smoke Tests

When adding new smoke tests, follow these guidelines:

1. **Focus on Critical Paths**: Only add tests for functionality that would make the app unusable if broken
2. **Keep Tests Fast**: Avoid unnecessary waits, use efficient selectors
3. **Test Happy Paths**: Smoke tests validate normal usage, not edge cases
4. **Use Seeded Data**: Don't create test data, use what's already seeded
5. **Group Logically**: Organize tests by user journey, not by feature

Example structure:

```typescript
test.describe("Critical User Journey Name", () => {
  test("First step in journey", async ({ page }) => {
    // Test implementation
  });

  test("Second step in journey", async ({ page }) => {
    // Test implementation
  });
});
```

## Troubleshooting

### Tests Timing Out

- Check if dev server is running (`pnpm dev:e2e`)
- Verify database is seeded (`pnpm db:seed:clean`)
- Increase timeout in test if needed (but keep it reasonable)

### Authentication Failures

- Ensure auth setup runs correctly (`e2e/auth.setup.ts`)
- Check that `.env.test` has correct credentials
- Verify `playwright/.auth/admin.json` exists

### Data Not Found

- Run `pnpm db:seed:clean` to reset test database
- Verify you're using the correct semester (`1-2567` for smoke tests)
- Check that test data wasn't modified by previous tests

### CI Failures But Local Success

- Verify you're using the same Node.js version as CI (v20)
- Check for timing issues (CI may be slower)
- Review CI logs for specific error messages
- Ensure no hard-coded localhost URLs

## Resources

- [Main E2E README](../README.md)
- [Test Plan](../TEST_PLAN.md)
- [Playwright Documentation](https://playwright.dev)
- [Project Documentation](../../README.md)
