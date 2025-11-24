# E2E Tests - Playwright with Page Object Model

This directory contains End-to-End (E2E) tests for the Phrasongsa Timetable application using Playwright Test framework with Page Object Model (POM) design pattern.

## Structure

```
e2e/
├── page-objects/          # Page Object Models
│   ├── BasePage.ts       # Base POM with common utilities
│   ├── ProgramViewPage.ts      # Issue #87 - Teacher data display
│   ├── ComplianceAnalyticsPage.ts  # Issue #86 - Subject names
│   └── ArrangePage.ts    # Issues #83-85, #89 - Drag-drop & deletion
├── fixtures/             # Custom Playwright fixtures
│   └── test.ts          # Extended test with POM fixtures
└── specs/               # Test specifications
    ├── issue-87-teacher-data.spec.ts
    ├── issue-86-subject-names.spec.ts
    ├── issue-83-85-drag-drop-flow.spec.ts
    └── issue-89-schedule-deletion.spec.ts
```

## Running Tests

### Prerequisites

```bash
# Install dependencies (if not already done)
pnpm install

# Install Playwright browsers
pnpm exec playwright install
```

### Commands

```bash
# Run all E2E tests
pnpm test:e2e

# Run tests in UI mode (interactive)
pnpm test:e2e:ui

# Run specific test file
pnpm exec playwright test e2e/specs/issue-87-teacher-data.spec.ts

# Run tests in headed mode (see browser)
pnpm exec playwright test --headed

# Debug tests
pnpm exec playwright test --debug

# View test report
pnpm exec playwright show-report
```

## Test Coverage

### Issue #87 - Teacher Data Display

**File:** `issue-87-teacher-data.spec.ts`

- ✅ Display teacher names in program table
- ✅ Validate Thai name format (prefix + first + last)
- ✅ Maintain data across grade changes
- ✅ Export button enabled with data
- ✅ Subject count matches teacher count

### Issue #86 - Subject Name Display

**File:** `issue-86-subject-names.spec.ts`

- ✅ Display Thai subject names (not codes)
- ✅ Compliance section with subject data
- ✅ Missing subjects section visible
- ✅ Specific subject names correct
- ✅ No subject codes as names

### Issues #83-85 - Drag-Drop Flow

**File:** `issue-83-85-drag-drop-flow.spec.ts`

- ✅ Room dialog after valid drag (Issue #83)
- ✅ Subject placement after room selection (Issue #83)
- ✅ Cancel room selection (Issue #83)
- ✅ Subject placement validation (Issue #84)
- ✅ Respect locked timeslots (Issue #85)
- ✅ Update subject palette after placement
- ✅ Error for invalid timeslots

### Issue #89 - Schedule Deletion

**File:** `issue-89-schedule-deletion.spec.ts`

- ✅ Delete schedule successfully
- ✅ Empty schedule after deletion
- ✅ SWR cache revalidation
- ✅ Persist deletion across reload
- ✅ Handle empty schedule deletion
- ✅ Update subject availability

## Page Object Model (POM)

### BasePage

Common utilities for all page objects:

- Navigation helpers (`goto()`, `getCurrentUrl()`)
- Wait utilities (`waitForPageLoad()`, `waitForElement()`)
- Notification assertions (`assertSuccessNotification()`, `assertErrorNotification()`)
- Screenshot capture (`takeScreenshot()`)

### ProgramViewPage

Page object for `/dashboard/[semester-year]/all-program`:

- `navigateTo(semester, year)` - Navigate to program view
- `selectGrade(gradeText)` - Select grade from dropdown
- `getTeacherNames()` - Get all teacher names from table
- `assertTeacherDataVisible()` - Assert teacher data exists
- `assertTeacherNameFormat()` - Validate Thai name format

### ComplianceAnalyticsPage

Page object for `/dashboard/[semester-year]/analytics`:

- `navigateTo(semester, year)` - Navigate to analytics
- `getSubjectNames()` - Get all subject names
- `assertSubjectNamesInThai()` - Validate Thai subject names
- `isSubjectNameDisplayed(name)` - Check if specific name exists

### ArrangePage

Page object for `/schedule/[semester-year]/arrange`:

- `navigateTo(semester, year)` - Navigate to arrange page
- `selectTeacher(name)` - Select teacher from dropdown
- `dragSubjectToTimeslot(code, row, col)` - Drag subject to timeslot
- `selectRoom(roomName)` - Select room from dialog
- `assertRoomDialogVisible()` - Assert room dialog appears
- `deleteSchedule()` - Delete entire schedule
- `assertScheduleEmpty()` - Verify schedule is empty
- `assertTimeslotLocked(row, col)` - Check if timeslot is locked

## Custom Fixtures

Extended Playwright test with POM fixtures:

```typescript
import { test, expect } from "../fixtures/test";

test("my test", async ({ programViewPage }) => {
  await programViewPage.navigateTo("1", "2567");
  await programViewPage.assertTeacherDataVisible();
});
```

Available fixtures:

- `programViewPage` - ProgramViewPage instance
- `complianceAnalyticsPage` - ComplianceAnalyticsPage instance
- `arrangePage` - ArrangePage instance

## Writing New Tests

### 1. Create Page Object (if needed)

```typescript
// e2e/page-objects/MyPage.ts
import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class MyPage extends BasePage {
  readonly myElement: Locator;

  constructor(page: Page) {
    super(page);
    this.myElement = page.locator('[data-testid="my-element"]');
  }

  async navigateTo() {
    await this.goto("/my-path");
    await this.waitForPageLoad();
  }
}
```

### 2. Add Fixture

```typescript
// e2e/fixtures/test.ts
import { MyPage } from "../page-objects/MyPage";

type CustomFixtures = {
  // ... existing fixtures
  myPage: MyPage;
};

export const test = base.extend<CustomFixtures>({
  // ... existing fixtures
  myPage: async ({ page }, use) => {
    const myPage = new MyPage(page);
    await use(myPage);
  },
});
```

### 3. Write Test Spec

```typescript
// e2e/specs/my-feature.spec.ts
import { test, expect } from "../fixtures/test";

test.describe("My Feature", () => {
  test.beforeEach(async ({ myPage }) => {
    await myPage.navigateTo();
  });

  test("should do something", async ({ myPage }) => {
    // Test implementation
  });
});
```

## Best Practices

1. **Use Page Objects** - Encapsulate page interactions in POM classes
2. **Use Fixtures** - Leverage Playwright's dependency injection
3. **Wait Properly** - Use `waitForPageLoad()` and `expect().toBeVisible()`
4. **Descriptive Assertions** - Use meaningful error messages
5. **Skip Gracefully** - Use `test.skip()` for conditional tests
6. **Test Data** - Use seeded data from `prisma/seed.ts` (semesters: 1-2567, 2-2567, 1-2568)
7. **Screenshots** - Take screenshots on failures for debugging

## Configuration

See `playwright.config.ts` for Playwright configuration including:

- Base URL: http://localhost:3000
- Timeout: 30s per test
- Retries: 2 on CI, 0 locally
- Workers: 4 parallel tests locally, 2 on CI
- Trace: on-first-retry
- Screenshot: only-on-failure

## CI/CD Integration

Tests run automatically on:

- Pull requests
- Push to main branch

Environment: Vercel production deployment (see `playwright.vercel.config.ts`)

## Troubleshooting

### Test Timeouts

- Increase timeout in `playwright.config.ts`
- Use `{ timeout: 60000 }` for slow operations
- Check network conditions

### Element Not Found

- Verify selector with Playwright Inspector: `pnpm exec playwright test --debug`
- Use `page.locator()` with flexible selectors
- Add explicit waits: `await expect(element).toBeVisible()`

### Flaky Tests

- Add proper waits before assertions
- Use `waitForPageLoad()` after navigation
- Avoid hard-coded waits (`page.waitForTimeout()`)

### Data Issues

- Verify seed data exists: `pnpm db:seed`
- Use correct semester/year values
- Check test data in database with Prisma Studio: `pnpm db:studio`

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [Best Practices](https://playwright.dev/docs/best-practices)
