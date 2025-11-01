# Teacher Arrange Phase 4: Component Migration Checklist

**Status**: 📋 **Planning** → Ready for Execution  
**Prerequisite**: Phase 3 (Context7-Powered Zustand Store) ✅ Complete  
**Goal**: Migrate teacher-arrange/page.tsx from 34+ useState hooks to Zustand store

---

## 📊 Migration Scope

### Current State (teacher-arrange/page.tsx)
- **Lines**: 1465 lines
- **useState Hooks**: 34+ hooks
- **Complexity**: High (drag-and-drop, modals, error handling)
- **Dependencies**: SWR, @dnd-kit, MUI

### Target State
- **useState Hooks**: ~5-8 (only truly local UI state)
- **Zustand Store**: All shared/complex state
- **Performance**: 60-70% reduction in re-renders
- **Maintainability**: Centralized state management

---

## ✅ Pre-Migration Checklist

- [x] Context7 Zustand documentation reviewed
- [x] Production-ready store created (`teacher-arrange.store.ts`)
- [x] Immer middleware integrated
- [x] Persist middleware configured
- [x] Optimized selector hooks created
- [x] Documentation complete
- [ ] Store unit tests written (~20 test cases)
- [ ] Component backup created
- [ ] Migration plan reviewed with team

---

## 🗺️ Migration Strategy

### Phase 4.1: Setup & Validation (Week 5, Day 1-2)

#### Tasks
1. **Create Store Unit Tests**
   - [ ] Test all actions (~30 actions)
   - [ ] Test selectors (~15 selectors)
   - [ ] Test history (undo/redo)
   - [ ] Test persistence (filters)
   - [ ] Test reset operations

2. **Validate Store in Isolation**
   - [ ] Run tests: `pnpm test teacher-arrange.store.test.ts`
   - [ ] Fix any type errors
   - [ ] Verify localStorage persistence
   - [ ] Test Redux DevTools integration

3. **Create Backup**
   ```bash
   cp src/features/schedule-arrangement/presentation/teacher-arrange/page.tsx \
      src/features/schedule-arrangement/presentation/teacher-arrange/page.tsx.backup
   ```

**Acceptance Criteria**:
- ✅ All store tests passing
- ✅ No type errors in store
- ✅ Backup created
- ✅ Redux DevTools showing actions

---

### Phase 4.2: Simple State Migration (Week 5, Day 3-4)

Migrate straightforward useState hooks first (low risk).

#### 1. Teacher Selection State

**Current (useState)**:
```typescript
const [currentTeacherID, setCurrentTeacherID] = useState<string | null>(null);
const [teacherData, setTeacherData] = useState<teacher | null>(null);
```

**Migration (Zustand)**:
```typescript
const { id: currentTeacherID, data: teacherData } = useCurrentTeacher();
const actions = useTeacherArrangeActions();

// Usage
actions.setCurrentTeacherID(newID);
actions.setTeacherData(newData);
```

**Checklist**:
- [ ] Replace useState declarations
- [ ] Update all setter calls
- [ ] Remove old useState hooks
- [ ] Test teacher switching
- [ ] Verify no regressions

#### 2. Subject Selection State

**Current (useState)**:
```typescript
const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
const [draggedSubject, setDraggedSubject] = useState<SubjectData | null>(null);
const [yearSelected, setYearSelected] = useState<number | null>(null);
```

**Migration (Zustand)**:
```typescript
const selectedSubject = useSelectedSubject();
const draggedSubject = useDraggedSubject();
const yearSelected = useYearSelected();
const actions = useTeacherArrangeActions();

// Usage
actions.setSelectedSubject(subject); // Auto-sets yearSelected
actions.clearSelectedSubject(); // Clears all three
```

**Checklist**:
- [ ] Replace useState declarations
- [ ] Update all setter calls
- [ ] Remove callback adapters (use store directly)
- [ ] Test subject selection in palette
- [ ] Test drag-and-drop operations

#### 3. Modal State

**Current (useState)**:
```typescript
const [isActiveModal, setIsActiveModal] = useState(false);
const [subjectPayload, setSubjectPayload] = useState<SubjectPayload | null>(null);
```

**Migration (Zustand)**:
```typescript
const { isOpen, payload } = useModalState();
const actions = useTeacherArrangeActions();

// Usage
actions.openModal(payload); // Sets both isOpen and payload
actions.closeModal(); // Clears both
```

**Checklist**:
- [ ] Replace useState declarations
- [ ] Update modal open/close calls
- [ ] Update AddRoomModal props
- [ ] Test modal opening/closing
- [ ] Test payload passing

#### 4. Save State

**Current (useState)**:
```typescript
const [isSaving, setIsSaving] = useState(false);
```

**Migration (Zustand)**:
```typescript
const isSaving = useSaveState();
const actions = useTeacherArrangeActions();

// Usage
actions.setIsSaving(true);
await saveData();
actions.setIsSaving(false);
```

**Checklist**:
- [ ] Replace useState declaration
- [ ] Update all setter calls
- [ ] Test save button disabled state
- [ ] Test loading indicators

**Phase 4.2 Acceptance Criteria**:
- ✅ 10-15 useState hooks removed
- ✅ All simple state using store
- ✅ No console errors
- ✅ Manual testing passes

---

### Phase 4.3: Complex State Migration (Week 5, Day 5-6)

Migrate complex state with careful testing.

#### 5. Subject Data Collections

**Current (useState)**:
```typescript
const [subjectData, setSubjectData] = useState<SubjectData[]>([]);
const [scheduledSubjects, setScheduledSubjects] = useState<SubjectData[]>([]);
```

**Migration (Zustand)**:
```typescript
const subjectData = useSubjectData();
const scheduledSubjects = useScheduledSubjects();
const actions = useTeacherArrangeActions();

// Usage
actions.setSubjectData(newData);
actions.addSubjectToData(newSubject); // 👈 New helper
actions.removeSubjectFromData(code); // 👈 New helper
actions.updateSubjectInData(code, updates); // 👈 New helper
```

**Checklist**:
- [ ] Replace useState declarations
- [ ] Update SWR integration
- [ ] Replace manual array operations with helpers
- [ ] Test subject adding/removing
- [ ] Test subject updates

#### 6. Timeslot Data (Most Complex)

**Current (useState)**:
```typescript
const [timeSlotData, setTimeSlotData] = useState<{
  AllData: TimeslotData[];
  SlotAmount: number[];
  DayOfWeek: DayOfWeekDisplay[];
  BreakSlot: BreakSlotData[];
}>({
  AllData: [],
  SlotAmount: [],
  DayOfWeek: [],
  BreakSlot: [],
});
```

**Migration (Zustand)**:
```typescript
const timeslotData = useTimeslotData();
const actions = useTeacherArrangeActions();

// Usage
actions.setTimeSlotData({ AllData: newData }); // Partial updates
actions.updateTimeslotSubject(id, subject); // Update single slot
actions.swapTimeslots(sourceID, destID); // 👈 New operation
```

**Checklist**:
- [ ] Replace useState declaration
- [ ] Update fetchTimeslotData integration
- [ ] Replace manual timeslot updates with helpers
- [ ] Test timeslot rendering
- [ ] Test subject assignment to timeslots
- [ ] Test swap operation

#### 7. Subject Change/Swap State

**Current (useState)**:
```typescript
const [changeTimeSlotSubject, setChangeTimeSlotSubject] = useState<SubjectData | null>(null);
const [destinationSubject, setDestinationSubject] = useState<SubjectData | null>(null);
const [timeslotIDtoChange, setTimeslotIDtoChange] = useState<TimeslotChange>({ source: '', destination: '' });
const [isClickToChangeSubject, setIsClickToChangeSubject] = useState(false);
```

**Migration (Zustand)**:
```typescript
// No selectors needed (internal state)
const actions = useTeacherArrangeActions();

// Usage in clickOrDragToChangeTimeSlot
actions.setChangeTimeSlotSubject(sourceSubject);
actions.setDestinationSubject(destSubject);
actions.setTimeslotIDtoChange({ source, destination });
actions.setIsClickToChangeSubject(true);

// Clear after operation
actions.clearChangeSubjectState();
```

**Checklist**:
- [ ] Replace useState declarations
- [ ] Update clickOrDragToChangeTimeSlot function
- [ ] Update confirmChangeSubject function
- [ ] Test subject swapping
- [ ] Test change confirmation modal

#### 8. Error Display State

**Current (useState)**:
```typescript
const [showErrorMsgByTimeslotID, setShowErrorMsgByTimeslotID] = useState<ErrorState>({});
const [showLockDataMsgByTimeslotID, setShowLockDataMsgByTimeslotID] = useState<ErrorState>({});
```

**Migration (Zustand)**:
```typescript
const { errorMessages, lockMessages } = useErrorState();
const actions = useTeacherArrangeActions();

// Usage
actions.setShowErrorMsg(timeslotID, true);
actions.setShowLockDataMsg(timeslotID, true);
actions.clearErrorMessages(); // Clear all
actions.clearAllErrors(); // Alias for clarity
```

**Checklist**:
- [ ] Replace useState declarations
- [ ] Update error display logic
- [ ] Update TimeSlot component integration
- [ ] Test error message display
- [ ] Test lock message display
- [ ] Test error clearing

**Phase 4.3 Acceptance Criteria**:
- ✅ 20-25 useState hooks removed
- ✅ All complex state using store
- ✅ Drag-and-drop working
- ✅ Timeslot operations working
- ✅ Manual testing passes

---

### Phase 4.4: Callback Adapter Removal (Week 6, Day 1-2)

Remove adapter functions now that store provides direct access.

#### 9. Remove Callback Adapters

**Current (Phase 2 Adapters)**:
```typescript
// Lines 1206-1246 in page.tsx
const handleAddRoomModalCallback = useCallback(/* ... */);
const handleClickOrDragCallback = useCallback(/* ... */);
const handleTimeSlotClassNameCallback = useCallback(/* ... */);
```

**Migration (Direct Store Access)**:
```typescript
// Remove adapters entirely, use actions directly
const actions = useTeacherArrangeActions();

// In TimeSlot component props
onClickOrDrag={(sourceID, destID) => {
  const sourceSlot = timeslotData.AllData.find(s => s.TimeslotID === sourceID);
  const destSlot = timeslotData.AllData.find(s => s.TimeslotID === destID);
  actions.swapTimeslots(sourceID, destID);
  actions.pushHistory(scheduledSubjects); // For undo
}}
```

**Checklist**:
- [ ] Remove `handleAddRoomModalCallback`
- [ ] Remove `handleClickOrDragCallback`
- [ ] Remove `handleTimeSlotClassNameCallback`
- [ ] Update TimeSlot props to use actions directly
- [ ] Update SearchableSubjectPalette props
- [ ] Test all callback flows
- [ ] Verify no broken references

---

### Phase 4.5: Filter Persistence Testing (Week 6, Day 3)

#### 10. Test Filter Persistence

**Test Cases**:
1. **Set Filters**:
   ```typescript
   const actions = useTeacherArrangeActions();
   actions.setFilters({ academicYear: 2567, semester: '1' });
   ```

2. **Verify localStorage**:
   ```typescript
   const stored = localStorage.getItem('teacher-arrange-filters');
   const parsed = JSON.parse(stored!);
   expect(parsed.state.filters.academicYear).toBe(2567);
   ```

3. **Refresh Page**: Filters should persist

4. **Reset Filters**:
   ```typescript
   actions.resetFilters(); // Back to null values
   ```

**Checklist**:
- [ ] Implement filter UI (if not exists)
- [ ] Test filter setting
- [ ] Test localStorage persistence
- [ ] Test page refresh retention
- [ ] Test filter reset
- [ ] Test filter clearing on logout

---

### Phase 4.6: History (Undo/Redo) Integration (Week 6, Day 4)

#### 11. Implement Undo/Redo UI

**Current**: History stack exists but no UI

**Migration**: Add undo/redo buttons

```typescript
function UndoRedoControls() {
  const { canUndo, canRedo, undo, redo } = useHistoryControls();

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        onClick={undo}
        disabled={!canUndo}
        startIcon={<UndoIcon />}
      >
        Undo
      </Button>
      <Button
        onClick={redo}
        disabled={!canRedo}
        startIcon={<RedoIcon />}
      >
        Redo
      </Button>
    </Box>
  );
}
```

**Checklist**:
- [ ] Create UndoRedoControls component
- [ ] Add to ScheduleActionToolbar
- [ ] Test undo operation
- [ ] Test redo operation
- [ ] Test history clearing on teacher change
- [ ] Test keyboard shortcuts (Ctrl+Z, Ctrl+Y)

---

### Phase 4.7: Final Cleanup & Optimization (Week 6, Day 5)

#### 12. Code Cleanup

**Remove**:
- [ ] All unused useState hooks
- [ ] All callback adapter functions
- [ ] All manual state update logic replaced by store

**Optimize**:
- [ ] Replace any remaining `useArrangementUIStore((state) => state)` with granular selectors
- [ ] Add React.memo() to heavy components
- [ ] Add useMemo() for expensive computations

**Example Optimization**:
```typescript
// ❌ Before: Re-renders on any store change
function TimeSlotGrid() {
  const store = useTeacherArrangeStore();
  // ... render logic
}

// ✅ After: Only re-renders when timeslotData changes
const TimeSlotGrid = React.memo(function TimeSlotGrid() {
  const timeslotData = useTimeslotData();
  const actions = useTeacherArrangeActions(); // Never causes re-render
  // ... render logic
});
```

#### 13. Performance Profiling

**Tools**:
- React DevTools Profiler
- Redux DevTools Timeline
- Chrome Performance Tab

**Metrics to Capture**:
- [ ] Re-renders per user action (target: <10)
- [ ] Time to interactive (target: <200ms)
- [ ] Memory usage (target: <50MB increase)
- [ ] Bundle size impact (target: +8KB)

**Checklist**:
- [ ] Profile before/after migration
- [ ] Document performance improvements
- [ ] Identify any performance regressions
- [ ] Fix any identified bottlenecks

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] Store action tests (30 test cases)
- [ ] Store selector tests (15 test cases)
- [ ] History stack tests (5 test cases)
- [ ] Persistence tests (5 test cases)

### Integration Tests

- [ ] SWR + Store integration
- [ ] @dnd-kit + Store integration
- [ ] Modal + Store integration
- [ ] Error handling + Store integration

### E2E Tests (Playwright)

- [ ] Teacher selection flow
- [ ] Subject assignment flow
- [ ] Drag-and-drop flow
- [ ] Subject swap flow
- [ ] Save schedule flow
- [ ] Undo/redo flow
- [ ] Filter persistence flow

---

## 📊 Success Metrics

### Before (Current State)
| Metric | Value |
|--------|-------|
| useState Hooks | 34+ |
| Re-renders per action | ~50-80 |
| Lines of code | 1465 |
| State management | Scattered |
| Debugging | Difficult |

### After (Target State)
| Metric | Target | Status |
|--------|--------|--------|
| useState Hooks | 5-8 | ⏳ Pending |
| Re-renders per action | <10 | ⏳ Pending |
| Lines of code | ~1200 | ⏳ Pending |
| State management | Centralized | ⏳ Pending |
| Debugging | Easy (DevTools) | ⏳ Pending |

### Performance Improvement Targets
- ✅ **60-70% reduction** in unnecessary re-renders
- ✅ **20% reduction** in component complexity
- ✅ **40% improvement** in debugging speed
- ✅ **Filter persistence** working across sessions

---

## 🚨 Risk Mitigation

### High-Risk Areas

1. **Drag-and-Drop Integration**
   - **Risk**: State updates breaking @dnd-kit sensors
   - **Mitigation**: Test extensively, keep sensors in component
   - **Rollback**: Revert to backup if issues

2. **Timeslot Rendering Performance**
   - **Risk**: Store updates causing grid re-renders
   - **Mitigation**: Use granular selectors, React.memo()
   - **Rollback**: Optimize selectors, add shallow comparison

3. **SWR + Store Integration**
   - **Risk**: Race conditions between SWR and store
   - **Mitigation**: Clear update sequence, optimistic updates
   - **Rollback**: Simplify to store-only or SWR-only

### Rollback Plan

```bash
# If migration fails at any point:
git checkout src/features/schedule-arrangement/presentation/teacher-arrange/page.tsx.backup
git checkout src/features/schedule-arrangement/presentation/stores/teacher-arrange.store.ts

# Or restore from backup:
cp page.tsx.backup page.tsx
```

---

## 📅 Timeline

| Phase | Days | Status |
|-------|------|--------|
| 4.1: Setup & Validation | 2 days | ⏳ Pending |
| 4.2: Simple State | 2 days | ⏳ Pending |
| 4.3: Complex State | 2 days | ⏳ Pending |
| 4.4: Adapter Removal | 2 days | ⏳ Pending |
| 4.5: Filter Testing | 1 day | ⏳ Pending |
| 4.6: Undo/Redo | 1 day | ⏳ Pending |
| 4.7: Cleanup | 1 day | ⏳ Pending |
| **Total** | **11 days** | **~2.5 weeks** |

---

## 🎯 Acceptance Criteria (Final)

### Functional Requirements
- ✅ All teacher-arrange functionality working
- ✅ No regressions in existing features
- ✅ Undo/redo fully functional
- ✅ Filter persistence working
- ✅ Drag-and-drop working
- ✅ Modal operations working
- ✅ Error display working
- ✅ Save operations working

### Non-Functional Requirements
- ✅ <10 re-renders per user action
- ✅ <200ms time to interactive
- ✅ Redux DevTools integration working
- ✅ Type safety maintained (no new `any`)
- ✅ Bundle size increase <10KB
- ✅ localStorage usage <1KB for filters

### Code Quality
- ✅ No eslint errors
- ✅ No TypeScript errors
- ✅ No console warnings
- ✅ All tests passing (unit + E2E)
- ✅ Code coverage >80% for store

### Documentation
- ✅ Migration guide complete
- ✅ API documentation updated
- ✅ Inline comments added
- ✅ Memory created for future reference

---

## 📚 Related Documentation

- **TEACHER_ARRANGE_ZUSTAND_IMPLEMENTATION.md**: Store architecture and best practices
- **TEACHER_ARRANGE_PHASE2_COMPLETION.md**: Phase 2 callback refactoring
- **ALLDATA_STRUCTURE_ANALYSIS.md**: AllData null pattern
- **AGENTS.md**: MCP-first workflow
- **.github/copilot-instructions.md**: Context7-first protocol

---

**Status**: 📋 **Ready for Execution**  
**Next**: Start Phase 4.1 (Setup & Validation)  
**Owner**: Development Team  
**Reviewer**: Tech Lead
