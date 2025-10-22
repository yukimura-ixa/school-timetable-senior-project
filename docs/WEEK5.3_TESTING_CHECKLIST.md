# Week 5.3 - TeacherArrangePage Refactoring Testing Checklist

**Component**: `page-refactored.tsx` (Teacher Arrangement Page)  
**Status**: Ready for Testing  
**Last Updated**: After TypeScript error fixes

---

## 🎯 Testing Objectives

1. Verify refactored component has **zero functional regressions**
2. Confirm **all interactions work** (drag/drop, selection, validation, save)
3. Ensure **88/88 tests still pass** (no infrastructure regressions)
4. Validate **performance improvements** (fewer re-renders, faster updates)

---

## ✅ Pre-Testing Checks (Completed)

- [x] TypeScript compilation: Zero errors in refactored file
- [x] All useState replaced with Zustand store (34+ hooks removed)
- [x] @dnd-kit migration complete (sensors configured)
- [x] All business logic preserved (no code deletions)
- [x] Original file preserved (rollback available)
- [x] Documentation complete (WEEK5.3_REFACTORING_COMPLETE.md)

---

## 🧪 Test Suite Execution

### 1. Unit Tests (88 tests expected)

```bash
pnpm test
```

**Expected Result**: 88/88 tests passing

**Test Breakdown**:
- ✅ 28 domain tests (constraint checking, conflict detection)
- ✅ 10 repository tests (database operations)
- ✅ 11 action tests (business logic)
- ✅ 39 other tests (utilities, parsing, components)

**Why This Matters**:
- Refactoring shouldn't break existing business logic
- Domain tests validate constraint rules unchanged
- Repository tests ensure DB operations still work
- Component tests verify UI utilities intact

**If Tests Fail**:
1. Check which tests failed
2. Verify Zustand store exports match original state structure
3. Ensure no imports were broken in refactored file
4. Review error messages for hints

---

## 🌐 Manual Browser Testing

### Setup

```bash
# Terminal 1: Start dev server
pnpm dev

# Terminal 2: Open browser
# Navigate to: http://localhost:3000
# Login with Google OAuth (Admin role)
# Go to: /schedule/1-2567/arrange/teacher-arrange?TeacherID=1
```

### Test Cases

#### Test 1: Initial Page Load
- [ ] Page loads without errors
- [ ] No console errors/warnings (except ESLint warnings expected)
- [ ] Teacher selection dropdown appears
- [ ] SelectTeacher component renders correctly

#### Test 2: Teacher Selection
- [ ] Select a teacher from dropdown
- [ ] Teacher name displays in header
- [ ] Subject list loads (available subjects for teacher)
- [ ] Timetable grid loads (existing schedule)
- [ ] Loading states work correctly

#### Test 3: Subject Drag & Drop (Add to Empty Slot)
- [ ] Click/drag a subject from subject box
- [ ] Subject highlights/follows cursor (@dnd-kit)
- [ ] Empty timeslots highlight as valid drop zones
- [ ] Drop subject into empty slot
- [ ] **Room selection modal appears** (critical functionality)
- [ ] Select room from modal
- [ ] Subject appears in timeslot with room name
- [ ] Subject disappears from available list (or marks as scheduled)

#### Test 4: Subject Selection (Click to Add)
- [ ] Click a subject in subject box (don't drag)
- [ ] Subject highlights as "selected"
- [ ] Click an empty timeslot
- [ ] **Room selection modal appears**
- [ ] Select room
- [ ] Subject added to timeslot correctly

#### Test 5: Conflict Detection
- [ ] Try to add subject to slot where teacher has another class
- [ ] **Conflict indicator appears** (red border, error icon, etc.)
- [ ] Tooltip/message shows conflict reason
- [ ] Cannot drop into conflicted slot (isDropDisabled)
- [ ] Try to add subject during break time
- [ ] Break time slots disabled correctly

#### Test 6: Subject Removal
- [ ] Hover over scheduled subject
- [ ] **Remove icon (X) appears**
- [ ] Click remove icon
- [ ] Subject removed from timeslot
- [ ] Subject returns to available list
- [ ] Timeslot becomes empty/available again

#### Test 7: Subject Swap (Change Timeslot)
- [ ] Click "Change" icon on existing scheduled subject
- [ ] Subject enters "change mode"
- [ ] Other timeslots highlight as potential destinations
- [ ] Click/drag to new timeslot
- [ ] Subject moves to new slot (room preserved)
- [ ] Old slot becomes empty
- [ ] Cannot swap to conflicted slots

#### Test 8: Locked Timeslots
- [ ] Identify locked timeslots (lock icon 🔒)
- [ ] Try to drag subject to locked slot
- [ ] **Locked slot should be disabled** (isDropDisabled)
- [ ] Hover over lock icon
- [ ] Tooltip shows "คาบนี้ถูกล็อก สามารถจัดการคาบล็อกได้ที่แท็บ ล็อกคาบสอน"
- [ ] Verify locked slots have `typeof GradeID !== "string"` (array indicates locked)

#### Test 9: Break Time Validation
- [ ] Identify break time slots (Breaktime !== "NOT_BREAK")
- [ ] Try to add subject to break time slot
- [ ] **Should be disabled** for most grades
- [ ] Verify break time styling (checkBreakTime logic)
- [ ] Ensure break time validation works for different grade levels

#### Test 10: Save Functionality
- [ ] Make multiple changes (add/remove/swap subjects)
- [ ] Click "บันทึกข้อมูล" (Save) button
- [ ] **Loading/saving state appears** (button disabled, spinner)
- [ ] Success notification appears (notistack)
- [ ] Data persists after page reload
- [ ] No duplicate entries created

#### Test 11: Error Handling
- [ ] Make invalid operation (e.g., conflicted slot)
- [ ] Error message displays correctly
- [ ] Error message disappears after timeout or action
- [ ] Try to save with validation errors
- [ ] Appropriate error feedback shown

#### Test 12: Zustand DevTools (Optional)
- [ ] Open Redux DevTools in browser
- [ ] Verify Zustand store appears as "ArrangementUIStore"
- [ ] Make actions (add/remove subject)
- [ ] See state changes in DevTools
- [ ] Time-travel debugging works (revert actions)

---

## 🔄 Side-by-Side Comparison

Test both versions to ensure parity:

### Original (`page.tsx`)
```
URL: /schedule/1-2567/arrange/teacher-arrange?TeacherID=1
```

### Refactored (`page-refactored.tsx`)
```
URL: Create route switch or rename file temporarily
```

**Comparison Points**:
- [ ] UI appearance identical
- [ ] Drag & drop behavior identical
- [ ] Modal appearance/functionality identical
- [ ] Validation messages identical
- [ ] Save operation produces same result
- [ ] Performance feels same or better

---

## ⚡ Performance Testing

### React DevTools Profiler

```bash
# In browser with React DevTools installed:
1. Open React DevTools > Profiler tab
2. Click "Record" button
3. Perform actions (drag subject, select teacher, etc.)
4. Click "Stop" button
5. Review flamegraph
```

**Metrics to Check**:
- [ ] Component render count (should be lower with Zustand)
- [ ] Render duration (should be similar or faster)
- [ ] No unnecessary re-renders of child components
- [ ] useCallback prevents function recreation

### Zustand Store Performance

**Expected Improvements**:
- Fewer re-renders (Zustand uses subscription model)
- Better separation of concerns (state updates don't trigger full re-render)
- DevTools integration for debugging

---

## 🐛 Known Issues to Verify

### ESLint Warnings (9 total - Non-Breaking)

These warnings should NOT cause runtime errors:

1. Line 232: `useEffect` missing `fetchTimeslotData` dependency
2. Line 239: `useEffect` missing `fetchClassData` dependency
3. Line 246: `useEffect` missing `onSelectSubject` dependency
4. Line 257: `useEffect` missing 5 dependencies
5. Line 422: `useCallback` missing `removeSubjectFromSlot` dependency
6. Line 433: `useCallback` missing `returnSubject` dependency
7. Line 532: `useCallback` missing 2 dependencies
8. Line 571: `useCallback` missing 3 dependencies
9. Line 736: `useCallback` missing `displayErrorChangeSubject` dependency

**Verify**:
- [ ] No infinite re-render loops
- [ ] No stale closure bugs (functions using old state values)
- [ ] Data fetching works correctly despite warnings

### Type Conversions

**ErrorState Object → String Conversion** (lines 856-860):
```typescript
showErrorMsgByTimeslotID={Object.keys(showErrorMsgByTimeslotID).find(key => showErrorMsgByTimeslotID[key]) || ""}
showLockDataMsgByTimeslotID={Object.keys(showLockDataMsgByTimeslotID).find(key => showLockDataMsgByTimeslotID[key]) || ""}
```

**Verify**:
- [ ] Error messages appear correctly in timeslots
- [ ] Lock messages appear on hover
- [ ] Messages clear correctly after mouse leave
- [ ] No console errors about type mismatches

---

## 📊 Test Results Template

### Unit Tests

```
Date: __________
Command: pnpm test
Result: ___/88 tests passing
Failures: (if any)
- Test name: _______
  Error: _______
  Fix: _______
```

### Browser Tests

```
Date: __________
Browser: Chrome/Firefox/Safari
Result: Pass/Fail
Issues Found:
1. ___________
2. ___________
```

### Performance Tests

```
Date: __________
Tool: React DevTools Profiler
Render Count (Original): ___
Render Count (Refactored): ___
Average Render Time: ___ ms
Issues: ___________
```

---

## 🚨 Failure Scenarios & Fixes

### If Unit Tests Fail

**Scenario 1**: Import errors
- **Fix**: Check all imports in page-refactored.tsx match original
- **Verify**: Zustand store exports all necessary types/actions

**Scenario 2**: Domain tests fail
- **Fix**: Verify business logic functions unchanged
- **Check**: Constraint checking, conflict detection logic

**Scenario 3**: Repository tests fail
- **Fix**: Ensure no Prisma schema changes
- **Check**: Database connection, mock data

### If Browser Tests Fail

**Scenario 1**: Drag & drop doesn't work
- **Fix**: Check @dnd-kit sensors configuration
- **Verify**: DndContext wraps components correctly
- **Debug**: Console log drag events (onDragStart, onDragEnd)

**Scenario 2**: Room modal doesn't appear
- **Fix**: Check `openModal()` receives correct payload
- **Verify**: `subjectPayload` state set correctly
- **Debug**: Log payload before modal open

**Scenario 3**: Subjects don't add to timeslots
- **Fix**: Check `addSubjectToSlot()` Zustand action
- **Verify**: Store state updates correctly
- **Debug**: Redux DevTools to see state changes

**Scenario 4**: Conflicts not detected
- **Fix**: Check `checkConflictData` SWR hook
- **Verify**: Conflict detection logic unchanged
- **Debug**: Log conflict check results

**Scenario 5**: Save doesn't work
- **Fix**: Check `postData()` function and API call
- **Verify**: Request payload matches backend expectations
- **Debug**: Network tab to see request/response

### If Performance Degrades

**Scenario**: More re-renders than original
- **Fix**: Add missing dependencies to useCallback arrays
- **Or**: Use Zustand selectors for fine-grained subscriptions
- **Debug**: React Profiler to identify problematic components

---

## ✅ Sign-Off Checklist

Before marking Week 5.3 as complete:

- [ ] All 88 unit tests passing
- [ ] All 12 browser test cases pass
- [ ] No console errors in browser
- [ ] Side-by-side comparison shows identical behavior
- [ ] Performance same or better than original
- [ ] Documentation complete and accurate
- [ ] ESLint warnings documented (non-breaking)
- [ ] Rollback plan confirmed (original file preserved)

---

## 🎓 Post-Testing Actions

### If All Tests Pass ✅

1. **Decide on deployment strategy**:
   - Option A: Replace original with refactored (rename files)
   - Option B: Feature flag (environment variable)
   - Option C: Query param switch (`?refactored=true`)
   - Option D: A/B testing (random users get new version)

2. **Update documentation**:
   - Mark Week 5.3 as COMPLETE ✅
   - Update WEEK5_PROGRESS_SUMMARY.md
   - Document deployment date

3. **Plan Week 5.4-5.5**:
   - Extract custom hooks
   - Migrate child components to @dnd-kit
   - Remove react-beautiful-dnd dependency

### If Tests Fail ❌

1. **Document failures**:
   - Which tests failed
   - Error messages
   - Steps to reproduce

2. **Fix issues**:
   - Prioritize breaking changes
   - Address ESLint warnings if causing bugs
   - Re-test after fixes

3. **Iterate**:
   - Fix → Test → Document → Repeat
   - Don't merge until all tests pass

---

## 📞 Support & Resources

- **Documentation**: `docs/WEEK5.3_REFACTORING_COMPLETE.md`
- **Original Code**: `src/app/schedule/.../page.tsx` (preserved)
- **Zustand Store**: `src/features/schedule-arrangement/presentation/stores/arrangement-ui.store.ts`
- **@dnd-kit Examples**: `src/features/schedule-arrangement/presentation/components/examples/`
- **Agent Instructions**: `AGENTS.md`

---

**Testing Started**: ___________  
**Testing Completed**: ___________  
**Result**: PASS / FAIL  
**Tester**: ___________
