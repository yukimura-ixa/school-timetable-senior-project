# Schedule Page UI Rebuild Plan

**Date:** October 31, 2025  
**Status:** 📋 PLANNING  
**Owner:** Serena AI Agent

## Executive Summary

Comprehensive plan to rebuild the schedule arrangement UI from legacy implementation to modern, maintainable architecture. This addresses technical debt accumulated over 8 weeks of iterative development.

## Current State Analysis

### Existing Implementations

#### 1. Modern Implementation (Phase 2 Complete)
**Location:** `src/app/schedule/[semesterAndyear]/arrange/page.tsx`  
**Status:** ✅ Production-ready, 988 lines  
**Architecture:**
- Clean Architecture with Server Actions
- MUI v7 components throughout
- Zustand store for state management
- @dnd-kit for drag-and-drop
- SWR for data fetching
- Modern enhanced components:
  - `SearchableSubjectPalette` (345 lines)
  - `ScheduleActionToolbar` (379 lines)
  - `ScheduleProgressIndicators` (307 lines)
  - `TimetableGrid`, `TimeslotCard`, `ConflictAlert`, etc.

**Features:**
- ✅ Grade-level tabs with class views
- ✅ Real-time search/filtering by subject/teacher/category
- ✅ Bulk operations (Clear Day, Copy Day, Clear All)
- ✅ Progress tracking (overall/teacher/class)
- ✅ Conflict detection and alerts
- ✅ Undo/redo stubs (awaiting history implementation)
- ✅ Drag-and-drop subject assignment
- ✅ Room selection dialogs
- ✅ Save with optimistic UI updates

#### 2. Legacy Implementation (Pre-refactor)
**Location:** `src/app/schedule/[semesterAndyear]/arrange/teacher-arrange/page.tsx`  
**Status:** ⚠️ Technical debt, 1300 lines  
**Architecture:**
- Monolithic component structure
- Mixed API routes + Server Actions
- 34+ useState hooks (pre-Zustand migration)
- react-beautiful-dnd (deprecated)
- Legacy components:
  - `TimeSlot.tsx` (old implementation)
  - `SubjectDragBox` (basic palette)
  - `PageHeader` (minimal features)
  - `SelectTeacher` (basic dropdown)

**Issues:**
- ❌ Code duplication between arrange/page.tsx and teacher-arrange/page.tsx
- ❌ Inconsistent component architecture
- ❌ Multiple state management approaches
- ❌ Old refactored files still in codebase (TimeSlot.refactored.tsx, page-refactored-broken.tsx)
- ❌ Type errors fixed with "as any" casts (technical debt)
- ❌ No unified UI/UX across arrangement pages

### Directory Structure (Current)

```
src/app/schedule/[semesterAndyear]/arrange/
├── page.tsx                          # ✅ Modern implementation (Grade/Class view)
├── teacher-arrange/
│   ├── page.tsx                      # ⚠️ Legacy implementation (Teacher view)
│   ├── page-refactored-broken.tsx    # ❌ DELETE - Failed refactor attempt
│   ├── page.original.backup.tsx.bak  # ❌ DELETE - Backup file
│   ├── components/
│   │   └── LockedScheduleList.tsx    # 🔄 EVALUATE - May be useful
│   └── hooks/
│       └── useTeacherSchedule.ts     # 🔄 MIGRATE - May have useful logic
├── student-arrange/
│   └── page.tsx                      # 🔄 EVALUATE - Student view (status unknown)
├── component/                        # ⚠️ Legacy components directory
│   ├── TimeSlot.tsx                  # 🔄 MIGRATE - Core timeslot component
│   ├── TimeSlot.refactored.tsx       # ❌ DELETE - Incomplete refactor
│   ├── PageHeader.tsx                # ⚠️ REPLACE - Basic header
│   ├── SelectTeacher.tsx             # ⚠️ REPLACE - Basic dropdown
│   ├── SelectRoomToTimeslotModal.tsx # 🔄 EVALUATE - Room selection
│   ├── SubjectDragBox.tsx            # ⚠️ REPLACE - Legacy palette
│   ├── SubjectItem.tsx               # 🔄 EVALUATE - Subject card component
│   ├── TimeslotCell.tsx              # 🔄 EVALUATE - Cell component
│   ├── TimetableHeader.tsx           # 🔄 EVALUATE - Table header
│   └── TimetableRow.tsx              # 🔄 EVALUATE - Table row
└── _components/                      # ✅ Modern components directory
    ├── index.ts                      # ✅ Barrel exports
    ├── ArrangementHeader.tsx         # ✅ Modern header with teacher select
    ├── SearchableSubjectPalette.tsx  # ✅ Enhanced palette with search/filter
    ├── ScheduleActionToolbar.tsx     # ✅ Bulk operations toolbar
    ├── ScheduleProgressIndicators.tsx # ✅ Progress tracking panel
    ├── TimetableGrid.tsx             # ✅ Modern grid component
    ├── TimeslotCard.tsx              # ✅ Modern timeslot card
    ├── GradeClassView.tsx            # ✅ Class schedule view
    ├── GradeLevelTabs.tsx            # ✅ Grade tabs (ม.1-6)
    ├── ConflictAlert.tsx             # ✅ Conflict indicator
    ├── ConflictSummaryPanel.tsx      # ✅ Conflict summary
    ├── RoomSelectionDialog.tsx       # ✅ Modern room picker
    ├── ActionToolbar.tsx             # ⚠️ OLD - Replaced by ScheduleActionToolbar
    └── SubjectPalette.tsx            # ⚠️ OLD - Replaced by SearchableSubjectPalette
```

## Problems to Solve

### 1. Code Duplication & Inconsistency
**Impact:** High maintenance cost, bug propagation  
**Examples:**
- Two separate arrange pages with 70% overlapping logic
- Duplicate TimeSlot implementations (TimeSlot.tsx vs TimeslotCard.tsx)
- Two subject palettes (SubjectDragBox vs SubjectPalette vs SearchableSubjectPalette)
- Inconsistent drag-and-drop implementations

### 2. Technical Debt from Type Migration
**Impact:** Reduced type safety, future refactoring risk  
**Examples:**
- 15+ "as any" casts in teacher-arrange/page.tsx
- Mixed PascalCase/camelCase field access
- Incomplete type definitions for callbacks
- TODO comments indicating future refactoring needed

### 3. Architecture Inconsistency
**Impact:** Difficult onboarding, unpredictable behavior  
**Examples:**
- arrange/page.tsx uses Clean Architecture (Server Actions)
- teacher-arrange/page.tsx mixes old API routes + Server Actions
- Inconsistent state management patterns
- Different component organization strategies

### 4. Legacy Component Burden
**Impact:** Maintenance overhead, confusion  
**Examples:**
- Old components in `/component` directory still used
- Failed refactor artifacts (*.refactored.tsx, *.backup.tsx)
- Redundant implementations side-by-side
- No clear deprecation path

### 5. Missing Features
**Impact:** Incomplete user experience  
**Examples:**
- Teacher arrange page lacks modern search/filtering
- No progress indicators in teacher view
- No bulk operations in teacher view
- Student arrange page status unknown

## Goals

### Primary Goals
1. **Unify Architecture** - Single source of truth for arrangement UI
2. **Eliminate Duplication** - DRY principle across all arrange pages
3. **Modernize Components** - Consistent MUI v7 + TypeScript strict
4. **Improve UX** - Feature parity across all views (grade/teacher/student)
5. **Reduce Technical Debt** - Remove "as any" casts, legacy components, failed refactors

### Success Metrics
- ✅ Zero TypeScript errors (no "as any" casts)
- ✅ Single TimetableGrid component used across all views
- ✅ Feature parity: all views have search/filter/bulk ops/progress
- ✅ Code reduction: <5000 total lines for all arrange pages
- ✅ Performance: <100ms time-to-interactive
- ✅ All tests passing (unit + E2E)

## Proposed Solution

### Architecture: View-Based Routing with Shared Components

```
src/app/schedule/[semesterAndyear]/arrange/
├── page.tsx                 # 🎯 UNIFIED ARRANGEMENT PAGE
│   # Props: { view?: 'grade' | 'teacher' | 'student' }
│   # Routes to: /arrange (defaults to grade view)
│
├── [view]/                  # 🆕 DYNAMIC VIEW ROUTING
│   └── page.tsx             # View-specific routing handler
│       # Renders: <UnifiedArrangementPage view={params.view} />
│
└── _components/             # ✅ SHARED MODERN COMPONENTS
    ├── index.ts             # Barrel exports
    ├── UnifiedArrangementPage.tsx      # 🆕 Main orchestrator
    ├── ViewSelector.tsx                # 🆕 View switcher (tabs/dropdown)
    ├── ArrangementHeader.tsx           # ✅ Header with context selector
    ├── SearchableSubjectPalette.tsx    # ✅ Enhanced palette
    ├── ScheduleActionToolbar.tsx       # ✅ Bulk operations
    ├── ScheduleProgressIndicators.tsx  # ✅ Progress tracking
    ├── TimetableGrid.tsx               # ✅ Unified grid
    ├── TimeslotCard.tsx                # ✅ Unified card
    ├── GradeClassView.tsx              # ✅ Class view (for grade mode)
    ├── TeacherScheduleView.tsx         # 🆕 Teacher view
    ├── StudentScheduleView.tsx         # 🆕 Student view
    ├── ConflictAlert.tsx               # ✅ Alerts
    ├── RoomSelectionDialog.tsx         # ✅ Room picker
    └── [legacy components deleted]     # ❌ Clean up

DELETED:
├── teacher-arrange/         # ❌ REMOVE - Consolidated into unified page
├── student-arrange/         # ❌ REMOVE - Consolidated into unified page
└── component/               # ❌ REMOVE - Replace with _components
```

### Routing Strategy

```typescript
// Routes
/schedule/1-2567/arrange           → Grade view (default)
/schedule/1-2567/arrange?view=grade    → Grade view (explicit)
/schedule/1-2567/arrange?view=teacher  → Teacher view
/schedule/1-2567/arrange?view=student  → Student view

// Or with dynamic routing:
/schedule/1-2567/arrange/grade     → Grade view
/schedule/1-2567/arrange/teacher   → Teacher view
/schedule/1-2567/arrange/student   → Student view
```

### Component Hierarchy

```tsx
<UnifiedArrangementPage view="grade|teacher|student">
  <ArrangementHeader>
    <ViewSelector />
    {view === 'teacher' && <TeacherSelect />}
    {view === 'student' && <ClassSelect />}
    <SaveButton />
  </ArrangementHeader>

  <Container>
    <Stack direction="row" spacing={2}>
      {/* Left Sidebar */}
      <SearchableSubjectPalette />

      {/* Main Content */}
      <Stack flex={1}>
        <ScheduleActionToolbar />
        
        {view === 'grade' && <GradeClassView />}
        {view === 'teacher' && <TeacherScheduleView />}
        {view === 'student' && <StudentScheduleView />}

        <ScheduleProgressIndicators />
      </Stack>
    </Stack>
  </Container>

  <RoomSelectionDialog />
  <ConflictAlert />
</UnifiedArrangementPage>
```

### State Management Strategy

**Zustand Store (Unified)**
```typescript
// src/features/schedule-arrangement/presentation/stores/arrangement-ui.store.ts

interface ArrangementUIStore {
  // View context
  view: 'grade' | 'teacher' | 'student';
  setView: (view: ArrangementUIStore['view']) => void;

  // Selection context
  selectedGradeLevel: number | null;  // For grade view (ม.1-6)
  selectedClass: string | null;        // For grade/student view
  selectedTeacher: teacher | null;     // For teacher view
  
  // Active subject (drag source)
  activeSubject: SubjectData | null;
  
  // Timetable data
  timeSlotData: TimeSlotGridData;
  scheduledSubjects: SubjectData[];
  availableSubjects: SubjectData[];
  
  // UI state
  roomDialogOpen: boolean;
  selectedTimeslotForRoom: string | null;
  isDirty: boolean;
  isSaving: boolean;
  
  // Conflict tracking
  conflicts: ConflictData[];
  
  // History (for undo/redo)
  history: ScheduleState[];
  historyIndex: number;
  
  // Actions
  setSelectedGradeLevel: (level: number | null) => void;
  setSelectedClass: (classId: string | null) => void;
  setSelectedTeacher: (teacher: teacher | null) => void;
  setActiveSubject: (subject: SubjectData | null) => void;
  updateTimeslotSubject: (timeslotId: string, subject: SubjectData | null) => void;
  pushHistory: (state: ScheduleState) => void;
  undo: () => void;
  redo: () => void;
  // ... etc
}
```

### Data Fetching Strategy

**SWR Keys by View**
```typescript
// Grade view
useSWR(`/api/schedule/${semester}-${year}/grade/${gradeLevel}`, fetcher);
useSWR(`/api/conflicts/${semester}-${year}/grade/${gradeLevel}`, fetcher);

// Teacher view
useSWR(`/api/schedule/${semester}-${year}/teacher/${teacherId}`, fetcher);
useSWR(`/api/conflicts/${semester}-${year}/teacher/${teacherId}`, fetcher);

// Student view
useSWR(`/api/schedule/${semester}-${year}/class/${classId}`, fetcher);
useSWR(`/api/conflicts/${semester}-${year}/class/${classId}`, fetcher);

// Shared data
useSWR(`/api/timeslots/${semester}-${year}`, fetcher);
useSWR(`/api/subjects/${semester}-${year}`, fetcher);
```

## Implementation Plan

### Phase 1: Preparation & Analysis (1-2 hours)
**Goal:** Understand current state, identify reusable logic

**Tasks:**
1. ✅ Audit existing components (DONE - this memory)
2. 🔄 Extract reusable logic from teacher-arrange/page.tsx
   - `useTeacherSchedule` hook analysis
   - `LockedScheduleList` component evaluation
   - Drag-and-drop handlers comparison
3. 🔄 Map feature parity gaps
   - Document what teacher view has that grade view doesn't
   - Document what grade view has that teacher view doesn't
4. 🔄 Create component mapping
   - Old component → New component replacement table
   - Identify deprecated components for deletion

**Deliverables:**
- Component inventory spreadsheet
- Feature parity matrix
- Migration checklist

### Phase 2: Create Unified Architecture (2-3 hours)
**Goal:** Build foundation for unified arrangement page

**Tasks:**
1. Create `UnifiedArrangementPage.tsx` component
   - Accept `view` prop with 'grade' | 'teacher' | 'student'
   - Implement view switching logic
   - Set up shared layout structure
2. Create `ViewSelector.tsx` component
   - Tabs for desktop (MUI Tabs)
   - Dropdown for mobile (MUI Select)
   - URL state synchronization
3. Extend Zustand store for multi-view support
   - Add view-specific state fields
   - Add view-agnostic actions
   - Migrate teacher-arrange state to store
4. Create view-specific wrapper components
   - `GradeViewContainer.tsx` (orchestrates GradeClassView)
   - `TeacherViewContainer.tsx` (new, simplified)
   - `StudentViewContainer.tsx` (new, based on grade view)

**Deliverables:**
- `UnifiedArrangementPage.tsx` (skeleton)
- `ViewSelector.tsx` (functional)
- Updated Zustand store (extended)
- View container components (scaffolded)

### Phase 3: Migrate Teacher View (3-4 hours)
**Goal:** Port teacher arrange functionality to unified architecture

**Tasks:**
1. Create `TeacherScheduleView.tsx` component
   - Render TimetableGrid with teacher context
   - Integrate SearchableSubjectPalette
   - Add ScheduleActionToolbar
   - Add ScheduleProgressIndicators
2. Migrate teacher-specific logic
   - Extract pure functions from teacher-arrange/page.tsx
   - Remove "as any" casts with proper types
   - Implement teacher subject filtering
3. Implement teacher-specific features
   - Lock schedule support (integrate LockedScheduleList)
   - Multi-class teaching display
   - Teacher workload indicators
4. Test teacher view in isolation
   - Unit tests for new components
   - Integration tests for drag-and-drop
   - E2E tests for save flow

**Deliverables:**
- `TeacherScheduleView.tsx` (production-ready)
- Teacher-specific utilities (pure functions)
- Test suite (passing)

### Phase 4: Create Student View (2-3 hours)
**Goal:** Build student arrangement view (if needed)

**Tasks:**
1. Analyze student-arrange/page.tsx (if exists)
   - Document current functionality
   - Identify unique requirements
2. Create `StudentScheduleView.tsx` component
   - Read-only timetable display (students don't arrange)
   - Class schedule visualization
   - Teacher names display
   - Room information display
3. Implement student-specific features
   - Print-friendly layout
   - PDF export support
   - Share schedule feature
4. Test student view
   - Unit tests
   - E2E tests for viewing

**Deliverables:**
- `StudentScheduleView.tsx` (production-ready)
- Student view documentation
- Test suite (passing)

### Phase 5: Integrate & Refactor (2-3 hours)
**Goal:** Connect all views into unified page, cleanup legacy code

**Tasks:**
1. Wire up routing
   - Implement `/arrange?view=X` or `/arrange/[view]` routing
   - Add view persistence (localStorage + URL sync)
   - Add default view logic (grade for admin, teacher for teachers)
2. Connect Zustand store to all views
   - Ensure state isolation between views
   - Implement proper data refetching on view change
   - Add loading states for view transitions
3. Implement undo/redo history
   - Add history stack to Zustand store
   - Implement pushHistory, undo, redo actions
   - Connect to toolbar buttons
4. Delete legacy code
   - Remove teacher-arrange/ directory
   - Remove student-arrange/ directory
   - Remove component/ directory (legacy components)
   - Remove *.refactored.tsx, *.backup.tsx files
   - Update imports across codebase

**Deliverables:**
- Fully functional unified arrangement page
- Clean codebase (legacy code removed)
- Updated imports (no broken references)

### Phase 6: Polish & Optimization (1-2 hours)
**Goal:** Improve performance, UX, and documentation

**Tasks:**
1. Performance optimization
   - Add React.memo to expensive components
   - Optimize re-renders with useCallback/useMemo
   - Lazy load view components (React.lazy)
   - Implement virtualization if needed (large timetables)
2. UX improvements
   - Add skeleton loaders for view transitions
   - Add empty states for each view
   - Add helpful tooltips
   - Improve mobile responsiveness
3. Documentation
   - Update component README files
   - Add JSDoc comments
   - Create architecture diagram
   - Write migration guide for future developers
4. Accessibility
   - Add ARIA labels
   - Test keyboard navigation
   - Test screen reader compatibility

**Deliverables:**
- Performance benchmarks
- Accessibility audit report
- Updated documentation
- Architecture diagram

### Phase 7: Testing & Deployment (2-3 hours)
**Goal:** Ensure quality, deploy to production

**Tasks:**
1. Comprehensive testing
   - Run all unit tests (expect 100% pass)
   - Run all E2E tests (expect 100% pass)
   - Manual testing of all views
   - Cross-browser testing (Chrome, Firefox, Safari, Edge)
   - Mobile testing (iOS Safari, Chrome Android)
2. Type safety verification
   - Run `pnpm typecheck` (expect 0 errors)
   - Remove any remaining "as any" casts
   - Ensure strict TypeScript compliance
3. Code review
   - Self-review all changes
   - Check for console.log statements
   - Verify no commented-out code
   - Ensure consistent code style
4. Deployment
   - Create feature branch: `feature/unified-arrange-page`
   - Commit with semantic messages
   - Create PR with detailed description
   - Deploy to staging
   - Test on staging
   - Deploy to production

**Deliverables:**
- Test report (all passing)
- TypeScript report (0 errors)
- Deployment checklist (completed)
- Production URL

## Technical Specifications

### Component API Design

#### UnifiedArrangementPage
```typescript
interface UnifiedArrangementPageProps {
  // Required
  semesterAndYear: string; // "1-2567"
  
  // Optional
  initialView?: 'grade' | 'teacher' | 'student';
  onViewChange?: (view: string) => void;
}

export default function UnifiedArrangementPage({
  semesterAndYear,
  initialView = 'grade',
  onViewChange,
}: UnifiedArrangementPageProps) {
  // ...
}
```

#### TeacherScheduleView
```typescript
interface TeacherScheduleViewProps {
  // Teacher context
  teacher: teacher | null;
  onTeacherChange: (teacher: teacher) => void;
  
  // Schedule data
  timeslots: timeslot[];
  schedule: class_schedule[];
  lockedSchedules: LockedSchedule[];
  
  // Actions
  onSave: () => Promise<void>;
  onDragEnd: (event: DragEndEvent) => void;
  
  // UI state
  isLoading: boolean;
  isSaving: boolean;
  hasConflicts: boolean;
}
```

### Type Definitions

```typescript
// src/types/schedule.types.ts

export type ArrangementView = 'grade' | 'teacher' | 'student';

export interface ViewContext {
  view: ArrangementView;
  gradeLevel?: number;      // For grade/student view
  classId?: string;         // For grade/student view
  teacherId?: number;       // For teacher view
}

export interface ScheduleState {
  timeslots: TimeslotData[];
  subjects: SubjectData[];
  conflicts: ConflictData[];
  timestamp: number;
}

export interface HistoryEntry {
  state: ScheduleState;
  action: string;  // "add_subject", "remove_subject", "swap_subjects", etc.
  metadata?: Record<string, unknown>;
}
```

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Load | <2s | Time to interactive |
| View Switch | <500ms | Grade → Teacher transition |
| Drag Start | <16ms | Time to drag feedback |
| Save Operation | <3s | Server round-trip |
| Re-render | <16ms | 60fps smooth scrolling |
| Bundle Size | <100KB | gzip compressed |

## Risk Assessment

### High Risk
1. **Data Loss During Migration**
   - Mitigation: Backup database before deployment
   - Mitigation: Implement save validation with checksums
   - Mitigation: Add "unsaved changes" warning

2. **Breaking Existing Workflows**
   - Mitigation: Maintain feature parity during migration
   - Mitigation: Add migration guide for users
   - Mitigation: Provide fallback to old view (temporary)

### Medium Risk
1. **Performance Regression**
   - Mitigation: Performance benchmarks before/after
   - Mitigation: Implement lazy loading
   - Mitigation: Add performance monitoring

2. **Type Safety Issues**
   - Mitigation: Strict TypeScript mode
   - Mitigation: Comprehensive type tests
   - Mitigation: No "as any" casts allowed

### Low Risk
1. **Browser Compatibility**
   - Mitigation: Polyfills for older browsers
   - Mitigation: Graceful degradation
   - Mitigation: Cross-browser testing

## Dependencies

### External Libraries (Already in package.json)
- ✅ @dnd-kit - Drag-and-drop
- ✅ @mui/material v7 - UI components
- ✅ zustand v5 - State management
- ✅ swr v2 - Data fetching
- ✅ next v16 - Framework
- ✅ notistack v3 - Notifications

### Internal Dependencies
- ✅ Server Actions (Clean Architecture)
- ✅ Prisma generated types
- ✅ Zustand store setup
- ✅ Modern components in _components/

## Success Criteria

### Must Have (P0)
- ✅ Zero TypeScript errors
- ✅ All unit tests passing
- ✅ All E2E tests passing
- ✅ Feature parity across all views
- ✅ No "as any" casts
- ✅ Legacy code removed
- ✅ Production deployment successful

### Should Have (P1)
- ✅ Performance targets met
- ✅ Accessibility audit passing
- ✅ Mobile responsive
- ✅ Documentation complete

### Nice to Have (P2)
- ⏳ Undo/redo fully functional
- ⏳ Auto-arrange algorithm
- ⏳ Real-time collaboration
- ⏳ Keyboard shortcuts

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Preparation | 1-2 hours | None |
| Phase 2: Unified Architecture | 2-3 hours | Phase 1 |
| Phase 3: Teacher View | 3-4 hours | Phase 2 |
| Phase 4: Student View | 2-3 hours | Phase 2 |
| Phase 5: Integration | 2-3 hours | Phases 3, 4 |
| Phase 6: Polish | 1-2 hours | Phase 5 |
| Phase 7: Testing | 2-3 hours | Phase 6 |
| **Total** | **13-20 hours** | - |

**Recommended Approach:** Break into 3-4 work sessions over 2-3 days

## Next Steps (Immediate Actions)

1. **Get User Approval** on plan scope and timeline
2. **Create Feature Branch:** `feature/unified-arrange-page`
3. **Begin Phase 1:** Component inventory and analysis
4. **Set Up Tracking:** Create GitHub issues for each phase
5. **Schedule Checkpoints:** Daily progress reviews

## Questions for User

1. **Priority:** High/Medium/Low priority for this rebuild?
2. **Timeline:** Any deadline constraints?
3. **Scope:** All three views (grade/teacher/student) or start with one?
4. **Legacy Support:** Should we keep old pages temporarily (feature flag)?
5. **Features:** Any new features to add during rebuild?

## References

- [Phase 2 Integration Complete](phase3_migration_session2_complete.md)
- [Schedule UI Phase 2 Complete](schedule_ui_phase_2_complete.md)
- [Project Overview](project_overview.md)
- [Code Style Conventions](code_style_conventions.md)
