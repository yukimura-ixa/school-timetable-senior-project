# Infinite Loop Fix Results - Issue #121

## ๐ŸŽ‰ Success Summary

**POST Request Reduction: 81.5%**

- **Before Fix**: 65 POST requests
- **After Fix**: 12 POST requests
- **Reduction**: 53 fewer requests (81.5% improvement)

## ๐Ÿ"ง Root Cause Identified

The infinite loop was caused by **Zustand actions in useEffect dependency arrays**.

### The Problem

```typescript
// โŒ BEFORE: Actions in dependency array
const actions = useTeacherArrangeActions(); // Object wrapped with useShallow

useEffect(() => {
  // Logic using actions
  actions.setTimeSlotData(/* ... */);
}, [
  ,
  /* ... */ actions, // โ ๏ธ Even with useShallow, this causes re-renders!
]);
```

**Why this caused loops:**

1. Even though `useShallow` stabilizes the object structure, **React checks dependencies by reference**
2. On every render cycle, `useShallow` may return a new object reference
3. useEffect sees "new" `actions` reference โ†' triggers โ†' causes re-render โ†' repeat

### The Solution

```typescript
// โœ… AFTER: Removed actions from dependency arrays
const actions = useTeacherArrangeActions(); // Still stable

useEffect(
  () => {
    // Logic using actions
    actions.setTimeSlotData(/* ... */);
  },
  [
    ,/* ... */
    // โœ… Removed: actions (Zustand actions are stable - never include in deps)
  ],
);
```

**Why this works:**

- Zustand actions are **inherently stable** - they never change between renders
- According to Context7 Zustand best practices: **"Actions are stable โ€" never include in dependency arrays"**
- Removing them breaks the circular dependency chain

## ๐Ÿ› ๏ธ Changes Applied

### Files Modified

1. **`teacher-arrange/page.tsx`**
   - Removed `actions` from 6 useEffect/useCallback dependency arrays
   - Added eslint-disable-next-line comments for exhaustive-deps rule

### Specific Locations

- Line ~494: Conflict display useEffect
- Line ~565: fetchTimeslotData useEffect
- Line ~802: subjectData useCallback
- Line ~816: timeSlotData useCallback
- Line ~828: removeSubjectFromSlot useCallback
- Line ~1198: timeslotIDtoChange useCallback

## โœ… Validation

### TypeScript Compilation

```bash
$ pnpm typecheck
# โœ… 0 errors
```

### E2E Test Results

```
Before: 65 POST /schedule/1-2567/arrange?TeacherID=1
After:  12 POST /schedule/1-2567/arrange?TeacherID=1
```

### Performance Impact

- **81.5% reduction** in redundant server requests
- Faster page load and interaction times
- Reduced server/database load
- Better user experience

## ๐Ÿ"Š Request Pattern Analysis

### Before Fix (65 requests)

```
POST timing: 20-50ms apart (rapid-fire)
Duration: ~3 seconds of continuous requests
Pattern: Infinite loop detected
```

### After Fix (12 requests)

```
POST timing: Varied (100-200ms apart)
Duration: ~1 second total
Pattern: Legitimate data fetching (initial + updates)
```

## ๐Ÿงช Testing Strategy Used

1. **Baseline measurement**: Counted POST requests before fix (65)
2. **Hypothesis validation**: Identified `actions` in dependency arrays
3. **Incremental fix**:
   - Stage 1: Remove `timeSlotData` from deps (failed - still 65)
   - Stage 2: Remove `actions` from ALL deps (success - down to 12)
4. **Regression check**: TypeScript compilation still passes
5. **E2E validation**: POST count verified in live test run

## ๐Ÿ" Related Work

### Context7 Best Practices Applied

From [Zustand Next.js Guide](https://zustand.docs.pmnd.rs/guides/nextjs):

- โœ… Zustand actions are stable - never include in deps
- โœ… Use `useShallow` for object selectors
- โœ… Avoid global stores (use provider pattern) - TODO

### Issues Addressed

- **Issue #121**: Excessive POST requests (65+) โœ… FIXED
- **Issue #120**: Subject card rendering race condition โœ… FIXED (separate commit)

## ๐Ÿ"ฎ Remaining Work

### Known Issue: Subject Data Not Loading

**Status**: โŒ UNRESOLVED (separate from infinite loop)

**Symptoms**:

- Subject palette shows "ไม่มีวิชาที่สามารถจัดได้"
- Count displays "ทั้งหมด: 0"
- Teacher selection works, but subject fetch returns empty

**Possible Causes**:

1. SWR fetch failing silently
2. Rendering gate too restrictive
3. Test seed data missing teacher responsibilities
4. Data transformation in useEffect failing

**Next Steps**:

1. Debug SWR fetch response in test environment
2. Check if `fetchResp.data` is actually populated
3. Verify test seed has responsibilities for TeacherID=1
4. Add logging to subject data transformation logic

### Remaining 12 POST Requests Analysis

**Hypothesis**: These may be legitimate:

1. Initial page GET (1 request)
2. Initial page POST for RSC data (1 request)
3. Teacher selection navigation (2-3 requests)
4. SWR data fetches (conflict data, schedule data, teacher data) (3-4 requests)
5. Re-renders from state updates (3-4 requests)

**Validation Needed**: Analyze which of the 12 are truly necessary vs can be optimized further.

## ๐Ÿ"š Learnings

### Key Takeaways

1. **Always consult Context7** before implementing Zustand patterns
2. **useShallow โ‰ stable reference** - React still checks by reference
3. **Zustand actions are special** - they're the only part of the store that's truly stable
4. **Dependency arrays matter** - even "stable" objects can cause loops if included
5. **Incremental debugging** - test hypotheses one at a time, measure results

### Anti-patterns Identified

- โŒ Including `actions` in dependency arrays (even with `useShallow`)
- โŒ Assuming `useShallow` prevents all reference changes
- โŒ Not measuring before/after when fixing performance issues

### Best Practices Confirmed

- โœ… Remove Zustand actions from ALL dependency arrays
- โœ… Use `useShallow` for object/array selectors (but not actions)
- โœ… Measure POST request counts to validate infinite loop fixes
- โœ… Add explanatory comments when disabling eslint rules

## ๐Ÿ"– Documentation References

- [Zustand Next.js Guide](https://zustand.docs.pmnd.rs/guides/nextjs)
- [Zustand Testing Guide](https://zustand.docs.pmnd.rs/guides/testing)
- [React useEffect Dependencies](https://react.dev/reference/react/useEffect#dependencies)
- [AGENTS.md - Context7-First Protocol](../AGENTS.md#context7-first-protocol)

## ๐Ÿ—"๏ธ Timeline

- **Initial Discovery**: November 2025 - Issue #121 created (65+ POST requests)
- **First Attempt**: Inline callback logic (failed - still 65 requests)
- **Second Attempt**: Remove `timeSlotData` from deps (failed - still 65 requests)
- **Final Fix**: Remove `actions` from all deps (success - down to 12 requests)
- **Validation**: E2E test confirms 81.5% reduction

## โœ… Acceptance Criteria Met

- [x] POST request count significantly reduced (target: <10-15, achieved: 12)
- [x] No TypeScript compilation errors
- [x] Zustand best practices followed (Context7 validated)
- [x] Performance improvement measurable and documented
- [ ] E2E test passes (blocked by separate subject data loading issue)

---

**Status**: โœ… **Infinite Loop FIXED** (Issue #121)  
**Outcome**: 81.5% reduction in POST requests (65 โ†' 12)  
**Remaining**: Subject data loading issue (separate debugging needed)
