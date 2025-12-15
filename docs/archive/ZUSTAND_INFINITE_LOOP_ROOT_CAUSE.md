# Zustand Infinite Loop Root Cause Analysis

## Summary

The teacher arrange page (`teacher-arrange/page.tsx`) has an **architectural issue** causing excessive POST requests (65+ per page load) due to circular dependencies in `useEffect` and `useCallback` chains.

## Root Cause

### Problem 1: Object-Returning Selectors Without `useShallow`

**Fixed** ✅ (Issues #120, #121)

- `useTeacherArrangeActions()` - wrapped with `useShallow`
- `useCurrentTeacher()` - wrapped with `useShallow`
- `useModalState()` - wrapped with `useShallow`
- `useErrorState()` - wrapped with `useShallow`
- `useHistoryControls()` - wrapped with `useShallow`
- Direct store access in page.tsx line 186 - wrapped with `useShallow`

### Problem 2: Callback Dependency Chains (Still Active)

**Critical Loop:**

```tsx
// Line ~394: useEffect depends on storeSelectedSubject, changeTimeSlotSubject
useEffect(() => {
  if (!checkConflictData.isValidating) {
    onSelectSubject(); // This callback changes when its dependencies change
  }
}, [
  storeSelectedSubject, // Changes → triggers useEffect
  changeTimeSlotSubject, // Changes → triggers useEffect
  checkConflictData.isValidating,
  onSelectSubject, // Changes when dependencies change → triggers useEffect
]);

// Line ~750: onSelectSubject depends on many things
const onSelectSubject = useCallback(() => {
  // Uses:
  // - storeSelectedSubject (in dep array)
  // - changeTimeSlotSubject (in dep array)
  // - clearScheduledData (callback, changes when timeSlotData changes)
  // - timeSlotData (complex object, changes frequently)
  // - checkConflictData.data
  // - currentTeacherID
  // - actions (stable, but used internally)
}, [
  storeSelectedSubject, // Same as useEffect dependency
  changeTimeSlotSubject, // Same as useEffect dependency
  checkConflictData.data,
  timeSlotData, // ❌ PROBLEM: Complex object, changes frequently
  clearScheduledData, // ❌ PROBLEM: Callback depends on timeSlotData
  actions,
]);
```

**The Loop:**

1. `timeSlotData` changes (from any action)
2. `clearScheduledData` callback recreates (depends on `timeSlotData`)
3. `onSelectSubject` callback recreates (depends on `clearScheduledData` + `timeSlotData`)
4. useEffect at line ~394 triggers (depends on `onSelectSubject`)
5. `onSelectSubject()` runs, potentially modifying `timeSlotData` again
6. Loop continues...

## Evidence

**Test Output:**

```
POST /schedule/1-2567/arrange?TeacherID=1  (65 requests in single page load)
```

**Server Logs:**
Every POST request triggers:

- Route compilation (6-72ms)
- React rendering (15-63ms)
- Full Server Component re-render

## Attempted Fixes

### ✅ Completed

1. Added `useShallow` to all object-returning selectors
2. Removed unstable dependencies from useEffect arrays (actions, currentTeacherID)
3. Added SWR deduplication config
4. Gated palette rendering on data availability

### 🟡 Partial

- Added `onSelectSubject` to dependency array (fixes lint, but doesn't stop loop)

### ❌ Not Effective

The fixes reduced some re-renders but the fundamental circular dependency remains.

## Proper Solution

### Option 1: Inline `onSelectSubject` Logic (Recommended)

Move the logic directly into the useEffect to eliminate callback dependency:

```tsx
// ❌ BEFORE: Callback dependency creates loop
const onSelectSubject = useCallback(() => {
  /* ... */
}, [many, deps]);
useEffect(() => {
  onSelectSubject();
}, [storeSelectedSubject, changeTimeSlotSubject, onSelectSubject]);

// ✅ AFTER: No callback dependency
useEffect(() => {
  const isSelectedToAdd = storeSelectedSubject != null;
  const isSelectedToChange = changeTimeSlotSubject != null;

  // ... all logic inline
}, [storeSelectedSubject, changeTimeSlotSubject /* only data deps */]);
```

### Option 2: Use `useEvent` (React RFC)

Once React 19 stabilizes `useEvent`, use it for event handlers that shouldn't trigger re-renders:

```tsx
const onSelectSubject = useEvent(() => {
  // Can access latest props/state without being a dependency
});
```

### Option 3: Ref-Based Stable Callbacks

Store callback in ref to keep stable reference:

```tsx
const onSelectSubjectRef = useRef<() => void>();
onSelectSubjectRef.current = () => {
  // Latest logic with current closures
};

useEffect(() => {
  onSelectSubjectRef.current?.();
}, [storeSelectedSubject, changeTimeSlotSubject]);
```

## Similar Issues Found

**Other Callbacks with Circular Dependencies:**

1. `fetchTimeslotData` (line ~438)
   - Depends on: `fetchTimeSlot.data`, `timeSlotData`, `actions`
   - Called from: useEffect with `fetchTimeSlot.data`
   - Missing dep: `currentTeacherID` (lint error)

2. `fetchClassData` (line ~606)
   - Depends on: `fetchAllClassData.data`, `timeSlotData`, `actions`
   - Called from: useEffect with `fetchAllClassData.data`
   - Missing dep: `currentTeacherID` (lint error)

3. `onSelectSubject` (line ~750) **PRIMARY CULPRIT**
   - Depends on: 6+ values including complex objects
   - Called from: useEffect with overlapping dependencies

4. `clickOrDragToSelectSubject` (line ~909)
   - Missing deps: itself is called from callbacks with shared state

## Impact Assessment

**Performance:**

- 65 POST requests = 65 full Server Component re-renders
- Each render: ~20-100ms compile + render
- Total wasted time: ~3-6 seconds per page load
- User experience: Slow loading, spinner lag

**Data Integrity:**

- SWR deduplication prevents duplicate fetches (✅)
- But still causes unnecessary network traffic
- Race conditions possible if user interacts during loop

**Developer Experience:**

- 12+ lint errors disabled with `eslint-disable-next-line`
- Confusing dependency arrays
- Hard to reason about render triggers

## Recommended Action Plan

1. **Immediate (P0):** Inline `onSelectSubject` logic to break the primary loop
2. **Short-term (P1):** Add ref-based stable callbacks for other problematic useCallbacks
3. **Medium-term (P2):** Refactor to reduce `timeSlotData` mutations
4. **Long-term (P3):** Consider migrating to Zustand actions for complex logic

## Testing Strategy

**Before Fix:**

```bash
pnpm test:e2e -- e2e/tests/admin/schedule-assignment.spec.ts:71 --project=chromium 2>&1 | Select-String "POST /schedule" | Measure-Object
# Count: 65
```

**After Fix Target:**

```bash
# Expected: 1-3 POST requests (initial load + teacher selection + data fetch)
```

**Acceptance Criteria:**

- ✅ POST request count ≤ 5
- ✅ All lint errors resolved
- ✅ E2E test passes (subject data loads)
- ✅ No visual regressions (palette renders correctly)

## Related Issues

- #120: Subject card rendering race condition (fixed by gating)
- #121: Excessive POST requests (partial fix via useShallow)
- Context7 docs: /pmndrs/zustand/docs/hooks/use-shallow.md
- Context7 docs: /pmndrs/zustand/docs/guides/nextjs.md (recommends no global stores)

## Notes

This analysis was generated during implementation of Zustand best practices from Context7 documentation. The `useShallow` fixes resolved the **symptom** (new object references) but not the **disease** (circular callback dependencies).

**Key Insight:** React's exhaustive-deps lint rule is catching real architectural problems, not just pedantic style issues. Disabling it with `// eslint-disable-next-line` masks the problem instead of fixing it.

---

**Created:** 2025-01-XX (during Issue #121 investigation)  
**Status:** Analysis complete, awaiting implementation  
**Severity:** P1 - Impacts performance and user experience
