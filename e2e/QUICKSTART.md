# E2E Test Expansion - Quick Start Guide

**Goal**: Implement Phase 1 (Admin tests) following the Page Object Model pattern

---

## 🚀 Getting Started

### Prerequisites

1. **Playwright Installed**
   ```bash
   pnpm add -D @playwright/test@latest
   pnpm playwright install chromium
   ```

2. **Database Seeded**
   ```bash
   pnpm db:deploy
   pnpm db:seed
   ```

3. **Dev Server Running**
   ```bash
   pnpm dev
   ```

---

## 📁 Project Structure

```
e2e/
├── pages/                          # ✅ Created
│   ├── admin/
│   │   └── ScheduleAssignmentPage.ts  # ✅ Example POM
│   └── common/
├── tests/                          # ✅ Created
│   └── admin/
│       └── schedule-assignment.spec.ts  # ✅ Example tests
├── fixtures/                       # ⏳ To create
│   ├── admin.fixture.ts
│   └── seed-data.fixture.ts
└── helpers/                        # ✅ Existing
    ├── auth.ts
    ├── navigation.ts
    └── drag-drop.helper.ts
```

---

## 🛠️ Step-by-Step Implementation

### Step 1: Add Test Data Attributes to Components

The Page Object Model relies on `data-testid` attributes for reliable element selection.

**Example: Add to teacher-arrange page components**

```tsx
// src/app/schedule/[semesterAndyear]/arrange/teacher-arrange/page.tsx

// Semester selector
<Select data-testid="semester-selector">
  {/* ... */}
</Select>

// Teacher selector
<Select data-testid="teacher-selector">
  {/* ... */}
</Select>

// Subject list container
<div data-testid="subject-list">
  {subjects.map((subject) => (
    <div 
      key={subject.code}
      data-subject-code={subject.code}
      data-testid={`subject-${subject.code}`}
    >
      {/* ... */}
    </div>
  ))}
</div>

// Timeslot grid
<div data-testid="timeslot-grid">
  {days.map((day) =>
    periods.map((period) => (
      <div
        key={`${day}-${period}`}
        data-day={day}
        data-period={period}
        data-locked={isLocked ? 'true' : 'false'}
        data-assigned={hasSubject ? 'true' : 'false'}
      >
        {/* ... */}
      </div>
    ))
  )}
</div>

// Conflict indicator
<Alert data-testid="conflict-indicator">
  {conflictMessage}
</Alert>

// Export button
<Button data-testid="export-button">
  Export
</Button>

// Save button
<Button data-testid="save-button">
  Save Schedule
</Button>
```

### Step 2: Create Test Fixtures

**`e2e/fixtures/seed-data.fixture.ts`**

```typescript
import { test as base } from '@playwright/test';

export type SeedDataFixtures = {
  testSemester: string;
  testTeacher: { id: string; name: string; code: string };
  testSubject: { code: string; name: string };
  testClassroom: { id: string; name: string };
};

export const test = base.extend<SeedDataFixtures>({
  testSemester: async ({}, use) => {
    await use('1-2567'); // From prisma/seed.ts
  },

  testTeacher: async ({}, use) => {
    await use({
      id: 'TCH001',
      name: 'สมชาย ใจดี',
      code: 'TCH001',
    });
  },

  testSubject: async ({}, use) => {
    await use({
      code: 'TH101',
      name: 'ภาษาไทย 1',
    });
  },

  testClassroom: async ({}, use) => {
    await use({
      id: 'ROOM101',
      name: 'ห้อง 101',
    });
  },
});

export { expect } from '@playwright/test';
```

### Step 3: Run Example Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run only admin tests
pnpm playwright test tests/admin

# Run specific test file
pnpm playwright test tests/admin/schedule-assignment.spec.ts

# Run in UI mode (interactive)
pnpm playwright test --ui

# Run in headed mode (see browser)
pnpm playwright test --headed

# Debug specific test
pnpm playwright test --debug tests/admin/schedule-assignment.spec.ts
```

### Step 4: View Test Results

```bash
# Open HTML report
pnpm playwright show-report

# Generate and open trace viewer
pnpm playwright show-trace trace.zip
```

---

## 🎯 What to Test First

Based on Issue #36 priorities:

### Priority 1: Admin Schedule Assignment
- ✅ Basic subject assignment (already implemented)
- ✅ Teacher double-booking detection (already implemented)
- ✅ Room double-booking detection (already implemented)
- ✅ Timeslot locking (already implemented)
- ✅ Export to Excel/PDF (already implemented)

### Priority 2: Admin Data Management
1. Create `TeacherManagementPage.ts` POM
2. Implement CRUD tests for teachers
3. Create similar POMs for subjects, classrooms, grades

### Priority 3: Conflict Resolution
1. Create `ConflictResolutionPage.ts` POM
2. Test conflict detection UI
3. Test conflict resolution workflows

---

## 🧪 Writing Your First Test

### Example: Test Subject Assignment

```typescript
import { test, expect } from '@playwright/test';
import { ScheduleAssignmentPage } from '../../pages/admin/ScheduleAssignmentPage';

test('should assign subject successfully', async ({ page }) => {
  // Arrange
  const schedulePage = new ScheduleAssignmentPage(page);
  await schedulePage.goto('1-2567');
  await schedulePage.waitForPageReady();

  // Act
  await schedulePage.selectTeacher('TCH001');
  await schedulePage.dragSubjectToTimeslot('TH101', 'MON', 1);

  // Assert
  const conflict = await schedulePage.getConflictMessage();
  expect(conflict).toBeNull();

  const assignedCount = await schedulePage.getAssignedSubjectCount();
  expect(assignedCount).toBeGreaterThan(0);
});
```

### Test Naming Convention

Follow **Given-When-Then** pattern:

```typescript
test('should [expected behavior] when [condition]', async ({ page }) => {
  // Given (Arrange)
  // When (Act)
  // Then (Assert)
});
```

---

## 🐛 Debugging Tips

### 1. Use Playwright Inspector

```bash
pnpm playwright test --debug
```

### 2. Add Breakpoints in Tests

```typescript
test('my test', async ({ page }) => {
  await schedulePage.goto('1-2567');
  
  // Pause execution
  await page.pause();
  
  await schedulePage.selectTeacher('TCH001');
});
```

### 3. Take Screenshots During Test

```typescript
await page.screenshot({ 
  path: 'debug-screenshot.png',
  fullPage: true 
});
```

### 4. Check Console Logs

```typescript
page.on('console', msg => console.log('Browser:', msg.text()));
page.on('pageerror', err => console.log('Page error:', err));
```

---

## 📊 Coverage Tracking

### Generate Coverage Report

```bash
# Run tests with coverage
pnpm test:e2e

# Calculate coverage
node scripts/calculate-coverage.ts

# Expected output:
# Total Coverage: 85%
# Admin Coverage: 90%
# Teacher Coverage: 75%
# Student Coverage: 80%
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Element Not Found

**Error**: `TimeoutError: Locator.click: Timeout 30000ms exceeded`

**Solution**: Check if `data-testid` is present in the component

```typescript
// Check if element exists
const element = page.locator('[data-testid="teacher-selector"]');
console.log('Element visible:', await element.isVisible());
```

### Issue 2: Flaky Tests

**Problem**: Tests pass sometimes, fail other times

**Solution**: Add proper waits

```typescript
// Bad
await page.click('[data-testid="button"]');

// Good
await page.locator('[data-testid="button"]').click();
await page.waitForLoadState('networkidle');
```

### Issue 3: Drag and Drop Not Working

**Problem**: `dragTo()` doesn't trigger drop event

**Solution**: Use custom drag-and-drop helper

```typescript
import { dragAndDrop } from '../../helpers/drag-drop.helper';

await dragAndDrop(page, sourceSelector, targetSelector);
```

---

## 📚 Resources

### Playwright Documentation
- [Getting Started](https://playwright.dev/docs/intro)
- [Writing Tests](https://playwright.dev/docs/writing-tests)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)

### Project Documentation
- [EXPANSION_PLAN.md](./EXPANSION_PLAN.md) - Full implementation plan
- [TEST_PLAN.md](./TEST_PLAN.md) - Existing test plan
- [AGENTS.md](../AGENTS.md#8-testing-strategy) - Testing strategy

### Example Code
- `pages/admin/ScheduleAssignmentPage.ts` - Example POM
- `tests/admin/schedule-assignment.spec.ts` - Example tests
- Existing tests in `e2e/*.spec.ts` - Current patterns

---

## ✅ Checklist Before Starting

- [ ] Playwright installed (`pnpm playwright install`)
- [ ] Database seeded (`pnpm db:seed`)
- [ ] Dev server running (`pnpm dev`)
- [ ] Read `EXPANSION_PLAN.md`
- [ ] Reviewed example POM and tests
- [ ] Understand Page Object Model pattern
- [ ] Know how to add `data-testid` attributes

---

## 🎯 Next Actions

1. **Add test IDs** to existing components
2. **Create fixtures** for test data
3. **Write first test** using existing POM
4. **Run and verify** tests pass
5. **Create new POMs** for other pages
6. **Expand test coverage** iteratively

---

**Ready to start!** Follow the plan and reference the example code. 🚀

For questions, see:
- Issue #36: https://github.com/yukimura-ixa/school-timetable-senior-project/issues/36
- EXPANSION_PLAN.md: Detailed implementation guide
