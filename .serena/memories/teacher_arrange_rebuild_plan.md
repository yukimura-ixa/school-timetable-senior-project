# Teacher Arrange Page Rebuild Plan

**Date:** October 31, 2025  
**Status:** 📋 READY TO START  
**Priority:** HIGH

## Current State Analysis

### Existing Implementation
**Location:** `src/app/schedule/[semesterAndyear]/arrange/teacher-arrange/page.tsx`  
**Status:** ⚠️ 1300 lines, heavy technical debt  
**Last Modified:** Phase 3 Type Migration (Oct 31, 2025)

**Architecture Issues:**
- ❌ 1300 lines monolithic component
- ❌ 15+ "as any" casts (type safety workarounds)
- ❌ Mixed state management (34+ useState converted to Zustand, but incomplete)
- ❌ Legacy drag-and-drop (@dnd-kit migration incomplete)
- ❌ Inconsistent with modern arrange/page.tsx (988 lines, clean)
- ❌ No search/filter capabilities
- ❌ No bulk operations (clear day, copy day)
- ❌ No progress tracking
- ❌ Uses old components from `/component` directory

### Files to Remove (Legacy Code)
```
✅ DELETED: TimeSlot.refactored.tsx
✅ DELETED: page-refactored-broken.tsx
✅ DELETED: page.original.backup.tsx.bak
```

### Reusable Components (Evaluate)
```
🔄 teacher-arrange/components/LockedScheduleList.tsx
   - Shows locked schedules (assemblies, exams)
   - May need integration into modern UI

🔄 teacher-arrange/hooks/useTeacherSchedule.ts
   - Custom hook for teacher schedule data
   - May contain useful business logic
```

## Goals

### Primary Objectives
1. **Consolidate Architecture** - Use same modern stack as arrange/page.tsx
2. **Feature Parity** - Add all modern features to teacher view
3. **Type Safety** - Remove all "as any" casts
4. **Code Reduction** - Target: 400-500 lines (down from 1300)
5. **Maintainability** - Follow Clean Architecture patterns

### Target Features (Match Grade View)
- ✅ Search/filter subjects by code/name/category
- ✅ Bulk operations (Clear Day, Copy Day, Clear All)
- ✅ Progress tracking (subjects assigned vs total)
- ✅ Conflict detection with visual alerts
- ✅ Drag-and-drop with @dnd-kit
- ✅ Room selection dialogs
- ✅ Save with optimistic updates
- ✅ Undo/redo stubs (for future implementation)
- 🆕 Lock schedule display (assemblies, exams)
- 🆕 Multiple class teaching visualization
- 🆕 Teacher workload indicators

## Proposed Architecture

### Option A: Unified Page (Recommended)
**Merge teacher view into existing arrange/page.tsx as a view mode**

**Pros:**
- ✅ Zero duplication - single source of truth
- ✅ Consistent UX across grade/teacher views
- ✅ Shared components reduce maintenance
- ✅ Easy to add student view later

**Cons:**
- ⚠️ Larger initial refactor effort
- ⚠️ Need careful state management for view switching

**Implementation:**
```tsx
// arrange/page.tsx
export default function ArrangementPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'grade'; // 'grade' | 'teacher'
  
  return (
    <UnifiedArrangementLayout>
      <ViewSelector value={view} /> {/* Toggle grade/teacher */}
      
      {view === 'grade' && <GradeArrangementView />}
      {view === 'teacher' && <TeacherArrangementView />}
    </UnifiedArrangementLayout>
  );
}

// Routes:
// /schedule/1-2567/arrange → Grade view (default)
// /schedule/1-2567/arrange?view=teacher → Teacher view
```

### Option B: Separate Page (Simpler)
**Rebuild teacher-arrange/page.tsx using modern components**

**Pros:**
- ✅ Simpler initial implementation
- ✅ Independent deployment/testing
- ✅ No risk to existing grade view

**Cons:**
- ❌ Code duplication (~70% overlap with arrange/page.tsx)
- ❌ Maintenance overhead (fix bugs in 2 places)
- ❌ Inconsistent UX patterns

**Implementation:**
```tsx
// teacher-arrange/page.tsx (rebuilt)
export default function TeacherArrangePage() {
  return (
    <Container>
      <ArrangementHeader /> {/* Reuse from _components */}
      <SearchableSubjectPalette /> {/* Reuse */}
      <ScheduleActionToolbar /> {/* Reuse */}
      <TeacherTimetableGrid /> {/* New: teacher-specific */}
      <LockedScheduleList /> {/* Reuse from teacher-arrange/components */}
      <ScheduleProgressIndicators /> {/* Reuse */}
    </Container>
  );
}
```

## Recommended Approach: Option A (Unified)

### Phase 1: Preparation (1 hour)
**Extract reusable logic from current teacher-arrange/page.tsx**

**Tasks:**
1. Analyze teacher-specific business logic
   - Lock schedule handling
   - Multi-class teaching display
   - Teacher workload calculations
2. Extract pure functions to utilities
   - `calculateTeacherWorkload()`
   - `validateMultiClassTeaching()`
   - `formatTeacherSchedule()`
3. Evaluate hooks
   - `useTeacherSchedule.ts` - migrate useful parts
4. Evaluate components
   - `LockedScheduleList.tsx` - integrate or recreate

**Deliverables:**
- Utility functions in `src/features/schedule-arrangement/domain/utils/`
- Analysis document: teacher-specific features list

### Phase 2: Extend Zustand Store (1 hour)
**Add teacher view state to arrangement-ui.store.ts**

**New State Fields:**
```typescript
interface ArrangementUIStore {
  // ... existing fields
  
  // View mode
  view: 'grade' | 'teacher';
  setView: (view: 'grade' | 'teacher') => void;
  
  // Teacher context (only for teacher view)
  selectedTeacher: teacher | null;
  setSelectedTeacher: (teacher: teacher | null) => void;
  
  // Lock schedule support
  lockedSchedules: LockedSchedule[];
  setLockedSchedules: (schedules: LockedSchedule[]) => void;
  
  // Teacher-specific data
  teacherWorkload: TeacherWorkload | null;
  multiClassSchedules: MultiClassSchedule[];
}

type LockedSchedule = {
  TimeslotID: string;
  LockType: 'ASSEMBLY' | 'EXAM' | 'ACTIVITY';
  Description: string;
  AffectsGrades: string[]; // ['ม.1', 'ม.2']
};

type TeacherWorkload = {
  totalHours: number;
  assignedHours: number;
  remainingHours: number;
  bySubject: Record<string, number>;
};
```

**Deliverables:**
- Updated `arrangement-ui.store.ts`
- Type definitions in `schedule.types.ts`

### Phase 3: Create View Components (2-3 hours)
**Build teacher-specific view components**

**New Components:**
1. **ViewSelector.tsx** (50 lines)
   ```tsx
   // Tabs for desktop, Select for mobile
   <Tabs value={view} onChange={onViewChange}>
     <Tab label="จัดตารางตามชั้น" value="grade" />
     <Tab label="จัดตารางตามครู" value="teacher" />
   </Tabs>
   ```

2. **TeacherArrangementView.tsx** (200 lines)
   ```tsx
   // Main teacher view container
   export function TeacherArrangementView() {
     const { selectedTeacher, setSelectedTeacher } = useArrangementUIStore();
     
     return (
       <Stack spacing={2}>
         <TeacherSelector 
           value={selectedTeacher}
           onChange={setSelectedTeacher}
         />
         
         <LockedScheduleAlert schedules={lockedSchedules} />
         
         <TimetableGrid
           mode="teacher"
           context={selectedTeacher}
         />
         
         <TeacherWorkloadCard workload={teacherWorkload} />
       </Stack>
     );
   }
   ```

3. **LockedScheduleAlert.tsx** (100 lines)
   ```tsx
   // Show locked timeslots (assemblies, exams)
   <Alert severity="info">
     <AlertTitle>คาบล็อก</AlertTitle>
     <Stack spacing={1}>
       {lockedSchedules.map(lock => (
         <Chip
           key={lock.TimeslotID}
           label={`${lock.Description} (${lock.AffectsGrades.join(', ')})`}
           color="warning"
         />
       ))}
     </Stack>
   </Alert>
   ```

4. **TeacherWorkloadCard.tsx** (80 lines)
   ```tsx
   // Show teacher's total workload
   <Card>
     <CardContent>
       <Typography variant="h6">ภาระงานสอน</Typography>
       <LinearProgress 
         variant="determinate" 
         value={(assignedHours / totalHours) * 100}
       />
       <Typography>
         {assignedHours} / {totalHours} ชั่วโมง
       </Typography>
     </CardContent>
   </Card>
   ```

**Deliverables:**
- 4 new components in `_components/`
- All components use MUI v7
- Full TypeScript types

### Phase 4: Integrate into Main Page (2 hours)
**Merge teacher view into arrange/page.tsx**

**Tasks:**
1. Add view switcher to page header
2. Conditional rendering based on `view` parameter
3. Update data fetching to support both views
   ```typescript
   const { data: gradeSchedule } = useSWR(
     view === 'grade' ? `/api/schedule/grade/${gradeLevel}` : null
   );
   
   const { data: teacherSchedule } = useSWR(
     view === 'teacher' ? `/api/schedule/teacher/${teacherId}` : null
   );
   ```
4. Update drag-and-drop handlers
5. Update save handlers
6. Test view switching (no state leakage)

**Updated Structure:**
```tsx
// arrange/page.tsx (updated)
export default function ArrangementPage() {
  const searchParams = useSearchParams();
  const view = (searchParams.get('view') as 'grade' | 'teacher') || 'grade';
  
  return (
    <Container>
      <ArrangementHeader>
        <ViewSelector value={view} />
        {view === 'teacher' && <TeacherSelector />}
      </ArrangementHeader>
      
      <Stack direction="row" spacing={2}>
        <SearchableSubjectPalette />
        
        <Stack flex={1}>
          <ScheduleActionToolbar />
          
          {view === 'grade' && <GradeClassView />}
          {view === 'teacher' && <TeacherArrangementView />}
          
          <ScheduleProgressIndicators />
        </Stack>
      </Stack>
      
      <RoomSelectionDialog />
      <ConflictAlert />
    </Container>
  );
}
```

**Deliverables:**
- Updated `arrange/page.tsx` (~1100 lines)
- View switching fully functional
- No regressions in grade view

### Phase 5: Delete Legacy Code (30 minutes)
**Clean up old teacher-arrange directory**

**Tasks:**
1. Verify new implementation works
2. Delete `teacher-arrange/` directory entirely
3. Update any links/redirects
   - `/schedule/1-2567/teacher-arrange` → `/schedule/1-2567/arrange?view=teacher`
4. Remove old component imports
5. Run tests

**Files to Delete:**
```
❌ src/app/schedule/[semesterAndyear]/arrange/teacher-arrange/
   ├── page.tsx (1300 lines - replaced)
   ├── components/
   │   └── LockedScheduleList.tsx (moved to _components)
   └── hooks/
       └── useTeacherSchedule.ts (logic extracted)
```

**Deliverables:**
- Clean directory structure
- All tests passing
- Zero TypeScript errors

### Phase 6: Testing & Polish (1 hour)
**Comprehensive testing**

**Tasks:**
1. Unit tests for new components
2. Integration tests for view switching
3. E2E tests for teacher arrangement flow
4. Performance testing (target: <500ms view switch)
5. Accessibility audit
6. Mobile responsive testing

**Test Cases:**
```typescript
// E2E: Teacher arrangement flow
test('should arrange teacher schedule', async ({ page }) => {
  await page.goto('/schedule/1-2567/arrange?view=teacher');
  await page.selectOption('[data-testid="teacher-select"]', '1');
  await page.dragAndDrop('[data-subject="ENG101"]', '[data-timeslot="1-2567-MON1"]');
  await page.click('[data-testid="save-button"]');
  await expect(page.locator('.success-message')).toBeVisible();
});

// Integration: View switching
test('should preserve state when switching views', () => {
  const { getByRole } = render(<ArrangementPage />);
  fireEvent.click(getByRole('tab', { name: 'จัดตารางตามครู' }));
  expect(/* teacher view rendered */).toBeTruthy();
  fireEvent.click(getByRole('tab', { name: 'จัดตารางตามชั้น' }));
  expect(/* grade view rendered */).toBeTruthy();
});
```

**Deliverables:**
- Test suite (all passing)
- Performance report
- Accessibility report

## Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Preparation | 1 hour | 1 hour |
| Phase 2: Store Extension | 1 hour | 2 hours |
| Phase 3: View Components | 2-3 hours | 4-5 hours |
| Phase 4: Integration | 2 hours | 6-7 hours |
| Phase 5: Cleanup | 0.5 hours | 6.5-7.5 hours |
| Phase 6: Testing | 1 hour | 7.5-8.5 hours |
| **Total** | **7.5-8.5 hours** | - |

**Recommended Schedule:** 2-3 work sessions over 2 days

## Success Metrics

### Must Have (P0)
- ✅ Zero TypeScript errors (no "as any")
- ✅ All existing features working in teacher view
- ✅ Feature parity with grade view
- ✅ All tests passing (unit + E2E)
- ✅ Legacy code deleted
- ✅ Code reduction: 1300 → ~400 lines teacher-specific code

### Should Have (P1)
- ✅ View switching <500ms
- ✅ Mobile responsive
- ✅ Accessibility compliant
- ✅ Lock schedule support
- ✅ Teacher workload display

### Nice to Have (P2)
- ⏳ Multi-teacher comparison view
- ⏳ Teacher preference settings
- ⏳ Smart subject recommendations

## Technical Specifications

### Data Fetching Strategy

**SWR Keys:**
```typescript
// Grade view
const gradeKey = `/api/schedule/${semester}-${year}/grade/${gradeLevel}`;

// Teacher view  
const teacherKey = `/api/schedule/${semester}-${year}/teacher/${teacherId}`;

// Shared
const timeslotsKey = `/api/timeslots/${semester}-${year}`;
const subjectsKey = `/api/subjects/${semester}-${year}`;
const locksKey = `/api/schedule/${semester}-${year}/locks`;
```

### Component Props

```typescript
interface TeacherArrangementViewProps {
  teacher: teacher | null;
  timeslots: timeslot[];
  schedule: class_schedule[];
  lockedSchedules: LockedSchedule[];
  availableSubjects: SubjectData[];
  onDragEnd: (event: DragEndEvent) => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
}
```

### Server Actions

```typescript
// src/features/arrange/application/actions/arrange.actions.ts

export async function getTeacherScheduleAction(params: {
  teacherId: number;
  configId: string;
}): Promise<ActionResult<TeacherScheduleData>> {
  // Fetch teacher's schedule + workload + conflicts
}

export async function getLockedSchedulesAction(params: {
  configId: string;
}): Promise<ActionResult<LockedSchedule[]>> {
  // Fetch assembly/exam locks
}

export async function syncTeacherScheduleAction(params: {
  teacherId: number;
  schedules: ScheduleInput[];
}): Promise<ActionResult<void>> {
  // Save teacher schedule with validation
}
```

## Risk Mitigation

### High Risk: Data Loss
**Mitigation:**
- Implement auto-save draft (localStorage)
- Add "unsaved changes" warning
- Backup old implementation temporarily
- Comprehensive E2E tests for save flow

### Medium Risk: View State Leakage
**Mitigation:**
- Proper cleanup in useEffect
- Separate SWR keys per view
- Reset Zustand state on view change
- Integration tests for state isolation

### Low Risk: Performance Degradation
**Mitigation:**
- React.memo on expensive components
- Lazy load view components
- Virtualize large lists
- Performance benchmarks

## Next Steps

1. **Get Approval** - Confirm Option A (Unified) vs Option B (Separate)
2. **Start Phase 1** - Extract teacher-specific logic
3. **Create Feature Branch** - `feature/unified-teacher-view`
4. **Begin Implementation** - Follow phase plan

## Questions for User

1. **Approach:** Confirm Option A (Unified Page) or prefer Option B (Separate)?
2. **Priority:** High/Medium/Low urgency?
3. **Features:** Any teacher-specific features to add beyond listed?
4. **Timeline:** Preferred completion date?

---

**Status:** Ready to start upon approval  
**Next Action:** Await user decision on approach
