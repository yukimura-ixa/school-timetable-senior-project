# Phase 4 Migration - E2E Testing Guide

## Quick Start

### Run E2E Tests
```bash
# Run all teacher-arrange migration tests
pnpm test:e2e teacher-arrange-store-migration.spec.ts

# Run with UI mode for debugging
pnpm test:e2e:ui teacher-arrange-store-migration.spec.ts

# Run specific test suite
pnpm test:e2e teacher-arrange-store-migration.spec.ts -g "Teacher Selection"
```

## Test Coverage

### 12 E2E Test Scenarios

#### 1. Teacher Selection & State Management (2 tests)
- ✅ Load teacher list and select a teacher
- ✅ Persist selected teacher on page reload

#### 2. Subject Data Management (2 tests)
- ✅ Display subject list for selected teacher
- ✅ Filter subjects using search/filter

#### 3. Timeslot Operations (2 tests)
- ✅ Display timeslot grid with day headers
- ✅ Highlight timeslot on hover

#### 4. Drag and Drop Functionality (2 tests)
- ✅ Select subject when clicked
- ✅ Show error for invalid assignment

#### 5. Modal Operations (2 tests)
- ✅ Open room selection modal when assigning
- ✅ Close modal on cancel

#### 6. Save & Persistence (1 test)
- ✅ Show saving indicator and success message

#### 7. Performance & Re-render Validation (2 tests)
- ✅ Maintain responsive UI during rapid state changes
- ✅ Handle localStorage persistence correctly

## Manual Testing Checklist

### Pre-Flight
- [ ] Start dev server: `pnpm dev`
- [ ] Open browser: http://localhost:3000
- [ ] Navigate to: `/schedule/1-2567/arrange/teacher-arrange`
- [ ] Open DevTools Console (check for errors)
- [ ] Open React DevTools (optional - for profiling)

### Test Scenarios

#### 1. Teacher Selection (5 mins)
- [ ] Click teacher dropdown
- [ ] Select "Teacher A"
- [ ] Verify schedule loads
- [ ] Check console for errors
- [ ] Reload page
- [ ] Verify teacher still selected

#### 2. Subject Management (5 mins)
- [ ] View subject list
- [ ] Count visible subjects
- [ ] Apply grade filter
- [ ] Verify subject count changes
- [ ] Clear filter
- [ ] Verify all subjects return

#### 3. Drag & Drop (5 mins)
- [ ] Click a subject (should highlight)
- [ ] Click another subject (previous should unhighlight)
- [ ] Click empty timeslot with subject selected
- [ ] Verify room selection modal opens
- [ ] Select a room
- [ ] Verify subject assigned to timeslot

#### 4. Modal Operations (3 mins)
- [ ] Open modal by assigning subject
- [ ] Click "Cancel" button
- [ ] Verify modal closes
- [ ] Verify subject not assigned
- [ ] Open modal again
- [ ] Select room and confirm
- [ ] Verify modal closes
- [ ] Verify subject assigned

#### 5. Error Display (3 mins)
- [ ] Try assigning subject to locked timeslot
- [ ] Verify error message appears
- [ ] Note error is in Thai: "ไม่สามารถจัดตาราง"
- [ ] Remove assignment
- [ ] Verify error clears

#### 6. Save Functionality (5 mins)
- [ ] Make changes to schedule
- [ ] Click "บันทึก" (Save) button
- [ ] Verify loading indicator appears
- [ ] Wait for success message
- [ ] Reload page
- [ ] Verify changes persisted

#### 7. Performance Check (5 mins)
- [ ] Open React DevTools Profiler
- [ ] Start recording
- [ ] Click multiple subjects rapidly
- [ ] Stop recording
- [ ] Check for minimal re-renders
- [ ] Should see ~60-70% reduction vs old store

### Post-Testing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No visual glitches
- [ ] All interactions smooth
- [ ] localStorage has `teacher-arrange-store` key

## Troubleshooting

### E2E Tests Fail
**Issue**: Tests timeout or fail to find elements
**Solution**: 
- Check if test data is seeded: `pnpm db:seed`
- Verify dev server is running
- Increase timeout in test if slow machine

### localStorage Errors in Jest
**Issue**: `localStorage is not defined`
**Solution**: 
- Verify `jest.setup.js` has localStorage mock
- Clear Jest cache: `pnpm test --clearCache`

### Build Errors
**Issue**: TypeScript compilation errors
**Solution**:
- Remaining errors are pre-existing (not migration-related)
- Run `pnpm typecheck` to see specific errors
- Safe to proceed with manual testing

### Performance Not Improved
**Issue**: Re-renders still high
**Solution**:
- Verify using granular selectors not full store
- Check dependency arrays use `actions` not individual functions
- Use React DevTools Profiler to identify issues

## Success Criteria

### All Tests Pass ✅
- [ ] 55 unit tests pass
- [ ] 12 E2E tests pass
- [ ] Manual testing checklist complete

### Performance Improved ✅
- [ ] 60-70% re-render reduction measured
- [ ] UI feels more responsive
- [ ] No lag during rapid interactions

### No Regressions ✅
- [ ] All features work as before
- [ ] No new console errors
- [ ] No visual bugs
- [ ] Save/load works correctly

## Next Steps

### Phase 4.7: Performance Profiling
- Use React DevTools Profiler
- Measure actual re-render counts
- Compare with backup version
- Document findings

### Phase 5: Rollout
- Share migration patterns with team
- Plan migrations for other pages
- Update architecture docs
- Celebrate! 🎉

## Resources

- **GitHub Issue**: [#42 - Phase 4 Complete](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/42)
- **Project Memory**: `phase4_teacher_arrange_migration_complete`
- **E2E Tests**: `e2e/teacher-arrange-store-migration.spec.ts`
- **Unit Tests**: `__test__/stores/teacher-arrange.store.test.ts`
- **Store Code**: `src/features/schedule-arrangement/presentation/stores/teacher-arrange.store.ts`

---

**Status**: ✅ Ready for Testing
**Estimated Test Time**: 30 minutes manual + automated tests
**Expected Result**: 60-70% performance improvement with zero regressions
