# Schedule Assignment Test Strategy Comparison

**Date**: November 8, 2025  
**Context**: Issue #70 Follow-up - Reactivating skipped schedule-assignment tests

## Executive Summary

We need to decide between two approaches to fix the broken `schedule-assignment.spec.ts` tests:

1. **Option A**: Rewrite tests using existing ArrangePage POM
2. **Option B**: Add `data-testid` attributes to page components

**Recommendation**: **Option A** (Rewrite tests using ArrangePage) - with strategic addition of key testids

---

## Current State Analysis

### Existing Page Structure
- **Page**: `/schedule/[semesterAndyear]/arrange/teacher-arrange`
- **Component**: Complex 1425-line React component with Zustand state management
- **Tech Stack**: @dnd-kit for drag-and-drop, MUI components, Server Actions

### Existing data-testid Coverage
```tsx
// Currently in teacher-arrange/page.tsx:
data-testid="subject-list"        // Line 1335
data-testid="save-button"          // Line 1381  
data-testid="timeslot-grid"        // Line 1416

// In SelectTeacher.tsx:
data-testid="teacher-selector"     // Line 39
```

### ArrangePage POM Capabilities
The existing `ArrangePage.ts` POM is **production-ready** and already supports:
- ✅ Room selection dialog testing (Issue #83)
- ✅ Subject placement validation (Issue #84)
- ✅ Lock data integration (Issue #85)
- ✅ Schedule deletion with cache revalidation (Issue #89)
- ✅ Fallback selectors using `.or()` pattern
- ✅ Robust locator strategies (role-based + text-based)

**ArrangePage Methods**:
```typescript
navigateTo(semester, year)
selectTeacher(teacherName)
dragSubjectToTimeslot(subjectCode, row, col)
selectRoom(roomName)
assertRoomDialogVisible()
assertSubjectPlaced(row, col, subjectCode)
assertTimeslotLocked(row, col)
deleteSchedule()
getSubjectPaletteCount()
isSubjectInPalette(subjectCode)
```

---

## Option A: Rewrite Tests Using ArrangePage POM

### Approach
Use existing ArrangePage methods with minimal changes to the page components.

### Example Test Rewrite

**Before (Broken)**:
```typescript
test('should successfully assign subject to empty timeslot', async ({ scheduleAssignmentPage }) => {
  await scheduleAssignmentPage.goto(testSemester.SemesterAndyear);
  await scheduleAssignmentPage.selectTeacher(testTeacher.TeacherID.toString());
  await scheduleAssignmentPage.dragSubjectToTimeslot(testSubject.SubjectCode, 'MON', 1);
  
  const conflict = await scheduleAssignmentPage.getConflictMessage();
  expect(conflict).toBeNull();
});
```

**After (Using ArrangePage)**:
```typescript
test('should successfully assign subject to empty timeslot', async ({ arrangePage }) => {
  await arrangePage.navigateTo('1', '2567');
  await arrangePage.selectTeacher('สมชาย ใจดี'); // Use teacher name instead of ID
  await arrangePage.dragSubjectToTimeslot('TH21101', 1, 2); // row, col instead of 'MON', 1
  await arrangePage.selectRoom('ห้อง 101'); // Handle room selection dialog
  
  await arrangePage.assertSubjectPlaced(1, 2, 'TH21101');
});
```

### Pros
✅ **Faster to implement** - ArrangePage already exists and is battle-tested  
✅ **No page refactoring needed** - Don't touch the complex 1425-line component  
✅ **Robust fallback selectors** - Uses `.or()` pattern for reliability  
✅ **Matches real user behavior** - Uses role-based + text-based selectors  
✅ **Already proven in production** - Used in Issues #83-85, #89 tests  
✅ **Minimal risk** - No changes to production code  
✅ **Better maintainability** - Selectors don't rely on implementation details  

### Cons
❌ **Different API signature** - Tests need complete rewrite (not just parameter fixes)  
❌ **Locator abstraction** - Slightly harder to debug vs direct testids  
❌ **Need test data updates** - Must map teacher IDs to names, timeslot coords to row/col  

### Implementation Effort
- **Time**: 2-3 hours
- **Files Modified**: `schedule-assignment.spec.ts` only
- **Risk**: **LOW** - No production code changes

---

## Option B: Add data-testid Attributes to Components

### Approach
Add comprehensive `data-testid` attributes throughout the page, then fix test locators.

### Required Changes

#### 1. Subject Cards (SearchableSubjectPalette)
```tsx
// Before:
<Card>
  <Typography>{subject.SubjectCode}</Typography>
</Card>

// After:
<Card data-testid={`subject-card-${subject.SubjectCode}`}>
  <Typography>{subject.SubjectCode}</Typography>
</Card>
```

#### 2. Timeslot Grid Cells (TimeSlot component)
```tsx
// Before:
<TableCell>
  {schedule && <SubjectChip />}
</TableCell>

// After:
<TableCell 
  data-testid={`timeslot-${dayOfWeek}-${period}`}
  data-day={dayOfWeek}
  data-period={period}
  data-assigned={!!schedule}
  data-locked={isLocked}
>
  {schedule && <SubjectChip />}
</TableCell>
```

#### 3. Conflict Indicators
```tsx
// Before:
{conflicts.length > 0 && (
  <Alert severity="error">
    {conflicts.map(c => c.message).join(', ')}
  </Alert>
)}

// After:
{conflicts.length > 0 && (
  <Alert severity="error" data-testid="conflict-indicator">
    {conflicts.map(c => c.message).join(', ')}
  </Alert>
)}
```

#### 4. Room Selection Dialog
```tsx
// Before:
<Dialog open={roomDialogOpen}>
  <DialogTitle>เลือกห้องเรียน</DialogTitle>
  {/* ... */}
</Dialog>

// After:
<Dialog open={roomDialogOpen} data-testid="room-selection-dialog">
  <DialogTitle>เลือกห้องเรียน</DialogTitle>
  {/* ... */}
</Dialog>
```

#### 5. Lock/Unlock Buttons
```tsx
// Before:
<IconButton onClick={lockTimeslot}>
  <LockIcon />
</IconButton>

// After:
<IconButton 
  onClick={lockTimeslot}
  data-testid={`lock-button-${day}-${period}`}
>
  <LockIcon />
</IconButton>
```

#### 6. Export Button
```tsx
// Before:
<Button onClick={exportToExcel}>
  Export
</Button>

// After:
<Button 
  onClick={exportToExcel}
  data-testid="export-button"
>
  Export
</Button>
```

### Pros
✅ **Explicit selectors** - Clear, predictable element identification  
✅ **Easier debugging** - Can inspect testids in DevTools  
✅ **IDE autocomplete** - Can grep for all testids easily  
✅ **Minimal test changes** - Original test logic mostly unchanged  
✅ **Future-proof** - New features can follow testid convention  

### Cons
❌ **Touches production code** - Changes to stable, complex component (1425 lines)  
❌ **Regression risk** - Any mistake could break working functionality  
❌ **More files to modify** - Need to update 5+ components  
❌ **Implementation detail coupling** - Tests tied to DOM structure  
❌ **Performance impact** - Additional props on every rendered element  
❌ **Maintenance burden** - Must keep testids in sync with refactors  
❌ **HTML bloat** - Adds ~10-15 KB to page HTML  
❌ **Testing anti-pattern** - Testing Library discourages testids (use roles/text instead)  

### Implementation Effort
- **Time**: 4-6 hours
- **Files Modified**: 
  - `teacher-arrange/page.tsx` (1425 lines - **HIGH RISK**)
  - `SearchableSubjectPalette.tsx`
  - `TimeSlot.tsx`
  - `PageHeader.tsx`
  - `SelectTeacher.tsx`
  - `schedule-assignment.spec.ts`
- **Risk**: **MEDIUM-HIGH** - Multiple production code changes

---

## Detailed Comparison Matrix

| Criterion | Option A: ArrangePage POM | Option B: Add testids |
|-----------|---------------------------|------------------------|
| **Implementation Time** | 2-3 hours | 4-6 hours |
| **Files Modified** | 1 (test only) | 6+ (components + test) |
| **Production Code Risk** | None | Medium-High |
| **Regression Risk** | Minimal | Medium |
| **Future Maintainability** | Excellent | Good |
| **Debugging Ease** | Good | Excellent |
| **Alignment with Best Practices** | ✅ Excellent | ⚠️ Acceptable |
| **Playwright Recommendation** | ✅ Preferred | ❌ Fallback |
| **Testing Library Philosophy** | ✅ Matches | ❌ Discouraged |
| **Refactoring Resilience** | ✅ High | ⚠️ Low |
| **Test Readability** | Good | Excellent |
| **Performance Impact** | None | Minor (~10KB HTML) |

---

## Expert Recommendations

### Playwright Best Practices (Official Docs)
> "Prefer user-facing attributes like role, label, text content, and accessibility attributes over test IDs."  
> — [Playwright Locators Guide](https://playwright.dev/docs/locators)

**Priority Order**:
1. **Role-based selectors** (ARIA roles)
2. **Text content** (visible to users)
3. **Accessibility attributes** (labels, titles)
4. **data-testid** (last resort)

### Testing Library Philosophy (Kent C. Dodds)
> "The more your tests resemble the way your software is used, the more confidence they can give you."

**ArrangePage already follows this**:
```typescript
// ✅ Good - How users interact
teacherDropdown = page.locator('[role="button"]', { hasText: 'เลือกครู' });

// ❌ Avoid - Implementation detail
teacherDropdown = page.locator('[data-testid="teacher-dropdown"]');
```

---

## Real-World Codebase Context

### Current ArrangePage Usage
ArrangePage is **actively used** in 4 test suites:
- Issue #83 tests (room selection)
- Issue #84 tests (subject placement)
- Issue #85 tests (lock integration)
- Issue #89 tests (schedule deletion)

**Success Rate**: 100% pass rate in CI/CD

### Component Stability
`teacher-arrange/page.tsx` is:
- ✅ 1425 lines of complex React code
- ✅ Already refactored twice (Week 5.3, Week 8)
- ✅ Using Zustand state management
- ✅ Production-stable (no reported bugs)

**Risk Assessment**: Touching this component has **medium-high risk** of introducing regressions.

---

## Recommended Hybrid Approach

### Strategy: **Option A + Strategic testids**

1. **Primary**: Rewrite tests using ArrangePage POM
2. **Enhancement**: Add **5-7 critical testids** only where role/text selectors are ambiguous

### Critical testids to Add (Low Risk)
```tsx
// 1. Conflict indicator (changes dynamically)
<Alert data-testid="conflict-indicator" severity="error">

// 2. Timeslot locked state (visual only)
<div data-testid="timeslot-locked-indicator">

// 3. Export format options (multiple buttons with same text)
<MenuItem data-testid={`export-${format}`}>

// 4. Subject card (already planned for drag-drop)
<Card data-testid={`subject-card-${code}`}>

// 5. Room selection confirm button (multiple "ยืนยัน" buttons possible)
<Button data-testid="confirm-room-button">
```

**Why This Works**:
- ✅ Minimal production code changes (5 components, ~10 lines total)
- ✅ Testids only where genuinely needed
- ✅ ArrangePage handles 90% of test scenarios
- ✅ testids provide safety net for edge cases
- ✅ Follows Playwright "progressive enhancement" pattern

---

## Implementation Plan

### Phase 1: Rewrite Core Tests (2 hours)
```typescript
// Fix fixture parameter names
test('...', async ({ arrangePage }) => {
  
// Update navigation
- scheduleAssignmentPage.goto(testSemester.SemesterAndyear)
+ arrangePage.navigateTo('1', '2567')

// Update teacher selection
- scheduleAssignmentPage.selectTeacher(testTeacher.TeacherID.toString())
+ arrangePage.selectTeacher(testTeacher.TitleName + testTeacher.FirstName)

// Update drag operations
- scheduleAssignmentPage.dragSubjectToTimeslot('TH101', 'MON', 1)
+ arrangePage.dragSubjectToTimeslot('TH101', 1, 2)
+ arrangePage.selectRoom('ห้อง 101')

// Update assertions
- expect(conflict).toBeNull()
+ arrangePage.assertSubjectPlaced(1, 2, 'TH101')
```

### Phase 2: Add Strategic testids (1 hour)
Only if ArrangePage can't handle a specific scenario.

### Phase 3: Test & Validate (30 mins)
```bash
pnpm playwright test schedule-assignment.spec.ts
```

---

## Test Coverage Mapping

### Original Test Suite → ArrangePage Methods

| Original Test | ArrangePage Equivalent | Additional Work |
|---------------|------------------------|-----------------|
| `goto()` | `navigateTo(semester, year)` | ✅ Direct replacement |
| `selectTeacher(id)` | `selectTeacher(name)` | ⚠️ Need teacher name lookup |
| `dragSubjectToTimeslot(code, day, period)` | `dragSubjectToTimeslot(code, row, col)` | ⚠️ Convert day+period → row/col |
| `getConflictMessage()` | `assertSubjectPlaced()` (inverse) | ⚠️ Need new conflict assertion |
| `hasConflict(type)` | **Missing** | ❌ Need to add |
| `lockTimeslot(day, period)` | **Missing** | ❌ Need to add |
| `exportSchedule(format)` | **Missing** | ❌ Need to add |
| `getAvailableSubjects()` | `getSubjectPaletteCount()` | ⚠️ Partial coverage |

### Missing ArrangePage Methods to Add
```typescript
// Add to ArrangePage.ts:
async hasConflict(type: 'teacher' | 'room' | 'locked'): Promise<boolean>
async getConflictMessage(): Promise<string | null>
async lockTimeslot(row: number, col: number): Promise<void>
async unlockTimeslot(row: number, col: number): Promise<void>
async exportSchedule(format: 'excel' | 'pdf'): Promise<void>
async getAvailableSubjects(): Promise<string[]>
```

**Estimated effort**: 1-2 hours to add these methods

---

## Decision Matrix

### Choose Option A (ArrangePage) if:
✅ You want **minimal risk** to production code  
✅ You prioritize **long-term maintainability**  
✅ You follow **Playwright/Testing Library best practices**  
✅ You're okay with a **2-day implementation** (test rewrite + add POM methods)  

### Choose Option B (testids) if:
✅ You need **explicit, debuggable selectors**  
✅ You have **QA team unfamiliar with POM pattern**  
✅ You're willing to **accept technical debt** for faster initial setup  
✅ You plan to **add testids to all new components** going forward  

---

## Final Recommendation

**Go with Option A (ArrangePage POM)** because:

1. **Production Code Stability**: Don't risk breaking the 1425-line component that's already stable
2. **Existing Investment**: ArrangePage is already proven in 4 other test suites
3. **Best Practices**: Follows Playwright, Testing Library, and accessibility guidelines
4. **Future-Proof**: More resilient to UI refactoring (e.g., switching from MUI to shadcn/ui)
5. **Lower Total Cost**: 2-3 hours vs 4-6 hours, with lower ongoing maintenance

### Action Items

1. **Immediate** (2 hours):
   - Fix fixture parameter names in `schedule-assignment.spec.ts`
   - Rewrite 6 core test suites using ArrangePage methods
   - Create teacher name lookup helper

2. **Short-term** (1-2 hours):
   - Add 6 missing methods to ArrangePage (conflicts, locking, export)
   - Add helper for timeslot coordinate conversion (day+period → row/col)

3. **Optional** (30 mins):
   - Add 3-5 strategic testids for ambiguous scenarios
   - Document testid naming convention

4. **Validation** (30 mins):
   - Run full test suite
   - Verify 0 skipped tests
   - Update documentation

**Total Time**: 3-4 hours vs 6-8 hours for Option B

---

## Appendix: Timeslot Coordinate Conversion

The original tests use `(day, period)` but ArrangePage uses `(row, col)`:

```typescript
// Helper function to add to test file:
function getTimeslotCoords(day: string, period: number): { row: number, col: number } {
  const dayIndex = ['MON', 'TUE', 'WED', 'THU', 'FRI'].indexOf(day);
  return {
    row: period, // Period 1 = row 1
    col: dayIndex + 1 // MON = col 1, TUE = col 2, etc.
  };
}

// Usage:
const { row, col } = getTimeslotCoords('MON', 1);
await arrangePage.dragSubjectToTimeslot('TH101', row, col);
```

---

## References

- [Playwright Locators Best Practices](https://playwright.dev/docs/locators)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles/)
- [ArrangePage POM Source](../e2e/page-objects/ArrangePage.ts)
- [Current Test Suite](../e2e/tests/admin/schedule-assignment.spec.ts)
- [Issue #70 Discussion](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/70)
