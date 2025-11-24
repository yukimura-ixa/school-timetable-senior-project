# E2E Tests for School Timetable System

## Overview

This directory contains end-to-end (E2E) tests for the School Timetable Management System using Playwright.

## Test Structure

```
e2e/
├── TEST_PLAN.md              # Comprehensive test plan with all 29 test cases
├── helpers/                  # Helper utilities
│   ├── auth.ts              # Authentication helpers
│   └── navigation.ts        # Navigation helpers
├── 01-home-page.spec.ts     # Home page and auth tests (TC-001, TC-002)
├── 02-data-management.spec.ts   # Data management tests (TC-003 to TC-006)
├── 03-schedule-config.spec.ts   # Configuration tests (TC-007 to TC-009)
├── 04-timetable-arrangement.spec.ts  # Arrangement tests (TC-010 to TC-016)
└── 05-viewing-exports.spec.ts       # Viewing and export tests (TC-017 to TC-024)
```

## Prerequisites

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

2. **Install Playwright Browsers**

   ```bash
   pnpm playwright:install
   ```

3. **Set Up Test Environment**
   - Ensure database is running
   - Configure `.env` file with test credentials
   - Seed database with test data (optional but recommended)

## Running Tests

### Run All Tests

```bash
pnpm test:e2e
```

### Run Tests in UI Mode (Interactive)

```bash
pnpm test:e2e:ui
```

### Run Specific Test File

```bash
pnpm playwright test e2e/01-home-page.spec.ts
```

### Run Tests with Video Recording

```bash
pnpm test:e2e --video=on
```

### Run Tests with Screenshots

```bash
pnpm playwright test --screenshot=on
```

### Generate HTML Report

```bash
pnpm playwright show-report
```

## Test Configuration

The tests are configured via `playwright.config.ts` in the project root:

- **Base URL**: `http://localhost:3000`
- **Browser**: Chromium (Desktop Chrome)
- **Retries**: 2 (in CI), 0 (locally)
- **Video**: Recorded on failure
- **Screenshots**: Captured on failure
- **Timeout**: 30 seconds for navigation, 15 seconds for actions

## Test Data Requirements

For comprehensive testing, ensure your test database contains:

- **Teachers**: At least 5 teachers with various departments
- **Subjects**: At least 10 subjects with different credits
- **Rooms**: At least 5 rooms in different buildings
- **Grade Levels**: 3 grade levels with 2-3 classes each
- **Semester**: At least 1 configured semester with timeslots
- **Sample Data**: Some assigned subjects and arranged timetable data

## Test Coverage

### Phase 1: Critical Path (8 tests)

✅ Authentication and authorization  
✅ Core data management (teachers, subjects, rooms)  
✅ Timetable configuration  
✅ Subject assignment  
✅ Timetable arrangement  
✅ Conflict detection  
✅ View schedules  
✅ Export to Excel

### Phase 2: Core Features (10 tests)

✅ Additional data management  
✅ Copy from previous semester  
✅ Student timetable arrangement  
✅ Lock timeslots  
✅ View student schedules  
✅ Additional export formats (PDF)

### Phase 3: Extended Features (11 tests)

✅ Unlock timeslots  
✅ Summary views  
✅ Edge cases and error handling  
✅ Mobile responsiveness

## Screenshots and Videos

Test artifacts are stored in:

- **Screenshots**: `test-results/screenshots/`
- **Videos**: `test-results/artifacts/` (on failure)
- **HTML Report**: `playwright-report/`

## Authentication Notes

⚠️ **Google OAuth Testing**

The current tests do not fully implement Google OAuth authentication due to complexity. For complete E2E testing:

1. **Option A: Mock Authentication**
   - Set up a mock auth provider for testing
   - Use session tokens directly

2. **Option B: Test Accounts**
   - Create dedicated Google test accounts
   - Store credentials securely (never in code)
   - Implement proper OAuth flow in `helpers/auth.ts`

3. **Option C: Bypass Authentication**
   - Configure Next-Auth for test environment
   - Allow test-mode bypass with special credentials

## Interpreting Test Results

### Success ✅

- Test passed with all assertions met
- Screenshots show expected UI state
- No errors in console logs

### Failure ❌

- Review screenshot to see actual state
- Check video recording for interaction flow
- Review console logs for errors
- Verify test data exists

### Skipped ⏭️

- Test requires authentication or data not present
- May need manual setup or configuration

## Manual Testing Checklist

Some scenarios require manual verification:

- [ ] Google OAuth login flow with real credentials
- [ ] File download and content verification (Excel/PDF)
- [ ] Drag-and-drop interactions (complex gestures)
- [ ] Real-time conflict detection during arrangement
- [ ] Concurrent user editing scenarios
- [ ] Mobile device testing on actual devices

## Continuous Integration

For CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: pnpm install

- name: Install Playwright
  run: pnpm playwright install --with-deps

- name: Run E2E tests
  run: pnpm test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Tests Timing Out

- Increase timeout in `playwright.config.ts`
- Check if dev server started successfully
- Verify network connectivity

### Authentication Failures

- Ensure `.env` file is configured
- Check NextAuth configuration
- Review middleware redirects

### Database Errors

- Verify database is running
- Check Prisma migrations are applied
- Ensure test data is seeded

### Screenshots Not Captured

- Check `test-results/` directory permissions
- Verify screenshot configuration in playwright.config.ts
- Ensure tests reach screenshot commands

## Contributing

When adding new tests:

1. Follow existing naming conventions (TC-XXX-YY)
2. Add descriptive test names
3. Include screenshots for visual verification
4. Document prerequisites and expected outcomes
5. Update TEST_PLAN.md with new test cases
6. Ensure tests can run independently

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Test Plan](./TEST_PLAN.md) - Complete list of test cases
- [Project Documentation](../README.md)
- [API Documentation](../src/app/api/)

## Contact

For questions about E2E tests:

- Review TEST_PLAN.md for test case details
- Check existing issues in the repository
- Refer to project README for team contacts
