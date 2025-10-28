# E2E Test Implementation for MOE-Compliant Program Management

**Date:** 2025-06-XX  
**Feature:** Credit/Mandatory Editing + Activity CRUD  
**Test Coverage:** Complete workflow testing for program subject assignment and activity management

---

## Overview

Created comprehensive E2E tests for the newly implemented features:
1. **Program Subject Assignment** - Interactive table with editable credits and mandatory status
2. **Activity Management** - Full CRUD operations for activity subjects

---

## Test Files Created

### 1. `e2e/10-program-subject-assignment.spec.ts`

Tests the complete program management workflow:

**Test Scenarios:**

#### Program Creation & Subject Assignment
- `TC-PROG-SUB-001`: Create new program and assign subjects with custom credits
  - Create program (M1-TEST)
  - Navigate to subject assignment page
  - Select subjects with custom MinCredits/MaxCredits
  - Toggle mandatory status per subject
  - Verify MOE validation feedback

- `TC-PROG-SUB-002`: Assign program to gradelevel
  - Navigate to gradelevel management
  - Select program from dropdown
  - Verify assignment saved

#### Validation Testing
- `TC-PROG-SUB-003`: Validate subject assignment with invalid credits
  - Create program with insufficient total credits
  - Verify MOE validation errors displayed
  - Check error messages contain credit requirements

- `TC-PROG-SUB-004`: Update existing subject assignments
  - Navigate to existing program
  - Modify credits for selected subjects
  - Verify changes persist

**Key Features Tested:**
- Interactive table UI with editable cells
- TextField inputs for MinCredits/MaxCredits (numeric, 0-10 range, 0.5 step)
- Switch components for IsMandatory toggle
- Row selection and highlighting
- Real-time selected count display
- Color-coded MOE validation feedback (green/red/orange)

---

### 2. `e2e/11-activity-management.spec.ts`

Tests activity subject CRUD operations:

**Test Scenarios:**

#### CRUD Operations
- `TC-ACT-001`: Create new activity subject
  - Open modal via "Add Activity" button
  - Fill SubjectCode, SubjectName, ActivityType
  - Set IsGraded checkbox
  - Verify activity appears in table

- `TC-ACT-002`: Edit existing activity
  - Create activity first
  - Open edit modal
  - Modify name and activity type
  - Toggle IsGraded
  - Verify updates displayed

- `TC-ACT-003`: Delete activity with confirmation
  - Create activity to delete
  - Click delete button
  - Confirm deletion in dialog
  - Verify activity removed from table

- `TC-ACT-004`: Cancel deletion
  - Initiate deletion
  - Cancel in confirmation dialog
  - Verify activity still exists

#### Validation
- `TC-ACT-005`: Validate required fields
  - Submit without SubjectCode
  - Submit without SubjectName
  - Verify validation errors displayed
  - Confirm modal remains open

#### Comprehensive Testing
- `TC-ACT-006`: Test all activity types
  - Create activities for each type: CLUB, SCOUT, GUIDANCE, SOCIAL_SERVICE
  - Verify all types can be created successfully

- `TC-ACT-007`: Table refresh after operations
  - Count initial activities
  - Create activity and verify count increase
  - Delete activity and verify count decrease
  - Ensure table refreshes automatically

#### Edge Cases
- `TC-ACT-008`: Display empty state message
  - Check for empty state when no activities exist

**Key Features Tested:**
- Modal-based create/edit forms
- ActivityType dropdown with all enum values
- IsGraded checkbox functionality
- Delete confirmation dialog
- Form validation with error messages
- Automatic table refresh after CRUD operations
- Loading and empty states

---

## Running the Tests

### Run All New Tests
```bash
# Run both test files
pnpm test:e2e e2e/10-program-subject-assignment.spec.ts e2e/11-activity-management.spec.ts

# Or run individually
pnpm test:e2e e2e/10-program-subject-assignment.spec.ts
pnpm test:e2e e2e/11-activity-management.spec.ts
```

### Run with UI Mode (Recommended for Development)
```bash
pnpm test:e2e:ui
```

### Run in Headed Mode (See Browser)
```bash
pnpm test:e2e:headed e2e/10-program-subject-assignment.spec.ts
```

### Debug Mode
```bash
pnpm test:e2e:debug e2e/11-activity-management.spec.ts
```

---

## Prerequisites

1. **Dev Server Running**
   ```bash
   pnpm dev
   # Server should be at http://localhost:3000
   ```

2. **Database Seeded**
   ```bash
   pnpm prisma db seed
   # Or use clean seed:
   SEED_CLEAN_DATA=true pnpm prisma db seed
   ```

3. **Authentication**
   - Either bypass auth in dev mode
   - Or ensure admin user is logged in

4. **Playwright Installed**
   ```bash
   pnpm exec playwright install chromium
   ```

---

## Test Architecture

### Page Object Pattern
Tests use direct Playwright locators for simplicity, but could be refactored to use Page Objects if needed.

### Assertions
- **Visibility**: `await expect(element).toBeVisible()`
- **Text Content**: `await expect(element).toContainText('...')`
- **State**: `await expect(checkbox).toBeChecked()`
- **Values**: `await expect(input).toHaveValue('...')`

### Wait Strategies
- `networkidle`: Wait for network requests to settle
- `domcontentloaded`: Wait for DOM to be ready
- Explicit timeouts: `{ timeout: 5000 }` for async operations
- Strategic `waitForTimeout`: Only when necessary (e.g., React hydration)

### Screenshots
- Captured at key points for visual verification
- Saved to `test-results/screenshots/`
- Useful for debugging failures in CI

---

## Coverage Summary

### Program Subject Assignment
- ✅ Interactive table with editable credits
- ✅ Per-subject mandatory toggle
- ✅ Row selection and highlighting
- ✅ Real-time selected count
- ✅ MOE validation feedback (success/errors/warnings)
- ✅ Program-to-gradelevel assignment
- ✅ Invalid credit validation

### Activity Management
- ✅ Create activity (all types)
- ✅ Edit activity
- ✅ Delete activity with confirmation
- ✅ Cancel deletion
- ✅ Form validation (required fields)
- ✅ Table refresh after operations
- ✅ Empty state handling
- ✅ Loading states

---

## Next Steps

1. **Run Tests Locally**
   ```bash
   pnpm dev  # In terminal 1
   pnpm test:e2e:ui  # In terminal 2 - select test files
   ```

2. **Verify Test Results**
   - Check `test-results/` for screenshots
   - Review HTML report: `pnpm playwright show-report`

3. **CI Integration** (if not already configured)
   - Add to GitHub Actions workflow
   - Ensure database is seeded before tests
   - Configure environment variables

4. **Test Data Cleanup** (optional)
   - Consider adding test cleanup in `afterEach`/`afterAll` hooks
   - Or use database transactions if supported

---

## Known Limitations

1. **Test Data Isolation**: Tests may create persistent data. Consider cleanup or use separate test database.

2. **Flakiness Potential**: 
   - Network-dependent operations may need longer timeouts in slow environments
   - Race conditions possible in table refresh - added explicit waits

3. **Authentication**: Tests assume admin access. May need to add login flow if auth is enforced.

4. **Localization**: Tests use English regex patterns. May need updates for Thai language UI.

---

## Debugging Tips

### Test Fails to Find Element
```typescript
// Add debug screenshot
await page.screenshot({ path: 'debug.png', fullPage: true });

// Print page HTML
console.log(await page.content());

// Use Playwright Inspector
pnpm test:e2e:debug e2e/10-program-subject-assignment.spec.ts
```

### Timeout Issues
```typescript
// Increase timeout for slow operations
await expect(element).toBeVisible({ timeout: 10000 });

// Or globally in playwright.config.ts
actionTimeout: 30000
```

### Selector Issues
```typescript
// Use multiple strategies
page.getByRole('button', { name: /add/i })  // Accessible
page.getByLabel(/subject code/i)            // Form field
page.locator('[data-testid="activity-row"]')  // Test ID (if added)
page.getByText('Exact Text')                // Text content
```

---

## Success Criteria

- [x] All test scenarios defined
- [x] Tests run without TypeScript errors
- [ ] Tests pass in local environment (pending run)
- [ ] Tests produce useful screenshots
- [ ] Tests verify actual UI behavior
- [ ] Tests cover happy path + validation errors
- [ ] Documentation complete

---

## Files Modified/Created

### Created
- `e2e/10-program-subject-assignment.spec.ts` (368 lines)
- `e2e/11-activity-management.spec.ts` (418 lines)
- `docs/E2E_TESTS_MOE_PROGRAM.md` (this file)

### No Modifications Required
- Existing `e2e/09-program-management.spec.ts` focuses on navigation/filtering (no overlap)
- Test infrastructure already in place

---

## Conclusion

Comprehensive E2E test suite created for the new MOE-compliant program management features. Tests cover:
- Complete CRUD workflows
- Form validation
- UI interactions (table editing, modals, confirmations)
- Data persistence verification
- Error handling

Ready to run and verify the implementation end-to-end. 🚀
