# E2E Tests: Assignment & Arrangement Flows (December 2025)

**Created:** December 21, 2025  
**Context:** E2E tests for subject assignment and schedule arrangement flows

## Overview

Two new E2E test files were created to test the core scheduling workflows:

1. **`e2e/20-subject-assignment.spec.ts`** - Subject assignment flow (6 tests)
2. **`e2e/21-arrangement-flow.spec.ts`** - Schedule arrangement flow (8 tests)

## Subject Assignment Tests (20-subject-assignment.spec.ts)

| Test ID | Scenario | Description |
|---------|----------|-------------|
| AS-01 | Page Load | Assignment page loads with teacher autocomplete |
| AS-02 | Teacher Search | Autocomplete shows teacher options |
| AS-03 | Teacher Selection | Selecting teacher shows assignments |
| AS-04 | Workload Summary | Teacher card shows progress indicators |
| AS-05 | Detail Navigation | Can navigate to detailed assignment view |
| AS-06 | Quick Assignment | Assignment panel is accessible |

## Arrangement Flow Tests (21-arrangement-flow.spec.ts)

| Test ID | Scenario | Description |
|---------|----------|-------------|
| AR-01 | Page Load | Arrangement page loads with timetable grid |
| AR-02 | Timetable Grid | Teacher selection renders timetable |
| AR-03 | Subject Palette | Assigned subjects appear in palette |
| AR-04 | Drag & Drop | Drag subject to empty timeslot |
| AR-05 | Room Modal | Room selection dialog after drop |
| AR-06 | Locked Slots | Visual indicators for locked timeslots |
| AR-07 | Conflict Detection | Conflict indicators displayed |
| AR-08 | Save Button | Save button visibility and state |

## Running Tests

```bash
# Prerequisites
docker-compose -f docker-compose.test.yml up -d
pnpm dev

# Run tests
pnpm exec playwright test e2e/20-subject-assignment.spec.ts e2e/21-arrangement-flow.spec.ts --project=chromium
```

## Test Dependencies

- Requires running dev server at `localhost:3000`
- Requires PostgreSQL at `localhost:5433`
- Uses `admin.fixture.ts` for authentication
- Uses `seed-data.fixture.ts` for test data

## Related Files

- `e2e/fixtures/admin.fixture.ts` - Authenticated admin fixture
- `e2e/fixtures/seed-data.fixture.ts` - Test data constants
- `docs/USER_FLOWS_VISUAL_SUMMARY.md` - User flows reference
