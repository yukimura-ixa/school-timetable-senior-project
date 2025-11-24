# E2E Test Strategy - Coexistence Approach

## Decision: Keep Both Patterns (November 2, 2025)

### Context

- **Existing**: 29 exploratory tests using direct page interactions (01-14 spec files)
- **New**: POM + fixtures pattern with data-testid attributes (tests/admin/, pages/, fixtures/)
- **Goal**: Move forward with feature work, not massive test migration

---

## Strategy: Two Patterns Coexist

### 1. Existing Tests (Keep As-Is)

**Files**: `01-*.spec.ts` through `14-*.spec.ts`

- ✅ Continue to serve as smoke/exploratory tests
- ✅ Validate pages load and basic functionality
- ✅ Screenshot-based validation useful for visual regression
- ❌ No migration needed - leave them alone

**Benefits**:

- Already written and working
- Cover basic "does it load?" scenarios
- Good for quick smoke tests

**When to run**: CI/CD smoke tests, quick validation

---

### 2. New Tests (POM + Fixtures Pattern)

**Location**: `tests/admin/`, `pages/admin/`, `fixtures/`

- ✅ Use for new feature development
- ✅ Use for critical regression tests
- ✅ Use when adding test coverage to existing features
- ✅ Follow Page Object Model best practices

**Pattern**:

```typescript
import { test, expect } from "@/e2e/fixtures/admin.fixture";
import { testSemester, testTeacher } from "@/e2e/fixtures/seed-data.fixture";

test("should do something", async ({ scheduleAssignmentPage }) => {
  await scheduleAssignmentPage.goto(testSemester.SemesterAndyear);
  // ... clean, maintainable test
});
```

**When to use**:

- Adding tests for new features
- Adding tests for bug fixes
- Improving coverage for critical paths
- When you need stable, maintainable tests

---

## Infrastructure Ready

### ✅ Completed

1. **Page Object Models**: `e2e/pages/admin/ScheduleAssignmentPage.ts` (example)
2. **Test Fixtures**: `e2e/fixtures/seed-data.fixture.ts`, `e2e/fixtures/admin.fixture.ts`
3. **Test IDs Added**: SelectTeacher, SearchableSubjectPalette, TimeSlot, Save button
4. **Documentation**: EXPANSION_PLAN.md, QUICKSTART.md, MIGRATION_GUIDE.ts

### 📦 Available for Use

- Import fixtures: `import { testSemester } from '@/e2e/fixtures/seed-data.fixture'`
- Import custom test: `import { test } from '@/e2e/fixtures/admin.fixture'`
- Create new POMs in: `e2e/pages/admin/`
- Add data-testid to components as needed

---

## When to Add E2E Tests (Incremental Approach)

### Scenario 1: New Feature Development

```
1. Build feature
2. Add data-testid attributes to new components
3. Create POM if needed
4. Write 2-3 critical path tests
5. Ship feature
```

### Scenario 2: Bug Fix

```
1. Fix bug
2. Write regression test using POM pattern (prevents future breakage)
3. Ship fix
```

### Scenario 3: Refactoring Existing Code

```
1. Add data-testid to components being refactored
2. Write 1-2 tests for critical behavior
3. Refactor with confidence
4. Tests prevent regressions
```

### Scenario 4: Improving Test Coverage (Low Priority)

```
Only when:
- Feature is stable
- Have extra time
- Want to improve confidence in deployments
```

---

## Test Coverage Status

### Current Coverage (~30%)

**Existing exploratory tests cover**:

- ✅ Page load validation (all major pages)
- ✅ Navigation flows
- ✅ Basic UI structure
- ✅ Screenshot baselines
- ⚠️ Limited behavior validation
- ⚠️ Fragile selectors (may break on UI changes)

**New POM tests partially cover**:

- ✅ Schedule assignment (4/20 tests migrated)
- ⏳ Teacher CRUD (not started)
- ⏳ Subject CRUD (not started)
- ⏳ Conflict detection (not started)

### Target Coverage (Future, Low Priority)

- **Goal**: 80%+ critical paths with POM tests
- **Timeline**: Incremental, as features are built/fixed
- **Priority**: LOW (feature work comes first)

---

## Decision Rationale

### Why Keep Both Patterns?

1. **Avoid large refactor** - 29 tests x 30 min each = 14+ hours of no feature work
2. **Existing tests still valuable** - they catch "page won't load" issues
3. **New pattern available** - developers can use it when beneficial
4. **Gradual adoption** - teams can learn new pattern over time
5. **Focus on features** - business value > perfect test coverage

### Why Not Migrate Everything?

- **Time cost**: 14+ hours of pure test migration
- **Risk**: Breaking tests during migration
- **Limited benefit**: Exploratory tests already work
- **Opportunity cost**: Could build 2-3 new features instead

### Why Not Delete Old Tests?

- They work fine for smoke testing
- Useful for visual regression (screenshots)
- Cover scenarios not yet in POM tests
- Zero maintenance if left alone

---

## Guidelines for Future Contributors

### Adding Tests to Existing Features

**Option A**: Use new POM pattern (recommended)

```typescript
// 1. Add data-testid to component
<button data-testid="delete-button">Delete</button>

// 2. Add method to POM (or create new POM)
class TeacherManagementPage {
  async deleteTeacher(id: string) {
    await this.page.locator('[data-testid="delete-button"]').click();
  }
}

// 3. Write test
test('should delete teacher', async ({ teacherPage }) => {
  await teacherPage.deleteTeacher('1');
  expect(await teacherPage.getTeachers()).not.toContain('Teacher 1');
});
```

**Option B**: Extend old pattern (if touching old test file)

```typescript
// Just add test to existing file, match existing style
test("TC-015: Delete teacher", async ({ page }) => {
  await page.goto("/management/teacher");
  await page.locator('button:has-text("Delete")').first().click();
  // ...
});
```

### Creating New Test Files

**Always use POM pattern** for new test files:

- Place in `e2e/tests/admin/`
- Create POM in `e2e/pages/admin/`
- Use fixtures: `import { test } from '@/e2e/fixtures/admin.fixture'`
- Add data-testid to components

---

## File Organization

### Keep

```
e2e/
├── 01-14 *.spec.ts          # Old pattern - keep as-is
├── helpers/                  # Old helpers - keep
├── tests/admin/              # New pattern - expand here
├── pages/admin/              # New POMs - expand here
├── fixtures/                 # Fixtures - use in new tests
├── TEST_PLAN.md             # Overall test plan
└── TEST_COEXISTENCE.md      # This file
```

### Where to Add New Work

- **New tests**: `tests/admin/<feature>.spec.ts`
- **New POMs**: `pages/admin/<Feature>Page.ts`
- **New fixtures**: `fixtures/<name>.fixture.ts`
- **Test IDs**: Add to components when writing tests

---

## Next Steps (Low Priority)

When time allows (after feature work):

1. ⏳ Add more data-testid attributes to components
2. ⏳ Create POMs for: Teacher, Subject, Classroom, Grade management
3. ⏳ Write regression tests for critical bugs
4. ⏳ Expand conflict detection tests
5. ⏳ Add export functionality tests

**But remember**: Features > Tests. Add tests incrementally as you work on features.

---

## Summary

✅ **Both patterns coexist peacefully**
✅ **Old tests stay (smoke/exploratory)**
✅ **New tests use POM (regression/features)**
✅ **Infrastructure ready for new tests**
✅ **Focus on features, add tests incrementally**

No massive migration needed. Move forward with confidence! 🚀
