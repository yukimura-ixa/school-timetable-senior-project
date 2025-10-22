# Week 5: Presentation Layer - Zustand Store

**Status**: ✅ Week 5.1 Complete - Zustand Store Created  
**Date**: October 22, 2025  
**Phase**: Phase 2 (Schedule Arrangement Feature) - Weeks 3-6

---

## 🎯 Week 5 Objectives

1. ✅ **Create Zustand store** for schedule arrangement UI state management
2. ⏳ Migrate from react-beautiful-dnd to @dnd-kit
3. ⏳ Refactor TeacherArrangePage component (replace 34+ useState hooks)
4. ⏳ Integrate Server Actions into UI
5. ⏳ Add optimistic updates & conflict error handling

---

## ✅ Completed: Zustand Store Creation

### Library Information (Context7)
```
Library: Zustand v5.0.8
Docs: /pmndrs/zustand
Pattern: create<T>()(devtools(...))
Middleware: devtools (with @redux-devtools/extension)
Trust Score: 9.6/10
Code Snippets: 400+ examples
```

### File Created
```
src/features/schedule-arrangement/
  └── presentation/
      └── stores/
          └── arrangement-ui.store.ts (480 lines)
```

---

## 📊 Store Architecture

### State Management Strategy

**Before (34+ useState hooks)**:
```tsx
// ❌ OLD: TeacherArrangePage had 34+ useState calls
const [currentTeacherID, setCurrentTeacherID] = useState(null);
const [selectedSubject, setSelectedSubject] = useState({});
const [draggedSubject, setDraggedSubject] = useState(null);
const [yearSelected, setYearSelected] = useState(null);
const [storeSelectedSubject, setStoreSelectedSubject] = useState({});
const [changeTimeSlotSubject, setChangeTimeSlotSubject] = useState({});
// ... 28 more useState declarations
```

**After (Centralized Zustand Store)**:
```tsx
// ✅ NEW: Single source of truth with devtools
import { useArrangementUIStore } from '@/features/schedule-arrangement/presentation/stores/arrangement-ui.store';

export default function TeacherArrangePage() {
  const { currentTeacherID, setCurrentTeacherID } = useArrangementUIStore();
  const { selectedSubject, setSelectedSubject } = useArrangementUIStore();
  // ... or use selector hooks for better performance
}
```

---

## 🏗️ Store Structure

### Type Definitions
```typescript
// Core types
SubjectData       // Subject drag/drop operations
TimeslotData      // Schedule timeslot structure
TeacherData       // Teacher information
TimeslotChange    // Swap operation payload
SubjectPayload    // Modal addition payload
ErrorState        // Error display by timeslot
```

### State Categories (7 groups)

#### 1. Teacher State
- `currentTeacherID: string | null`
- `teacherData: TeacherData`

#### 2. Subject Selection State
- `selectedSubject: SubjectData`
- `draggedSubject: SubjectData | null`
- `yearSelected: number | null`

#### 3. Subject Change/Swap State
- `changeTimeSlotSubject: SubjectData`
- `destinationSubject: SubjectData`
- `timeslotIDtoChange: TimeslotChange`
- `isCilckToChangeSubject: boolean`

#### 4. Subject Data State
- `subjectData: SubjectData[]` (available subjects)
- `scheduledSubjects: SubjectData[]` (already scheduled)

#### 5. Timeslot State
- `timeSlotData`: Complex object with:
  - `AllData: TimeslotData[]`
  - `SlotAmount: number[]`
  - `DayOfWeek: Array<{Day, TextColor, BgColor}>`
  - `BreakSlot: Array<{TimeslotID, Breaktime, SlotNumber}>`
- `lockData: any[]`

#### 6. Modal State
- `isActiveModal: boolean`
- `subjectPayload: SubjectPayload`

#### 7. Error & UI State
- `showErrorMsgByTimeslotID: ErrorState`
- `showLockDataMsgByTimeslotID: ErrorState`
- `isSaving: boolean`
- `filters: {academicYear, semester, gradeLevel}`

### Actions (33 total)

**Teacher Actions** (2):
- `setCurrentTeacherID(id)`
- `setTeacherData(data)`

**Subject Selection Actions** (4):
- `setSelectedSubject(subject)`
- `setDraggedSubject(subject)`
- `setYearSelected(year)`
- `clearSelectedSubject()`

**Subject Change Actions** (5):
- `setChangeTimeSlotSubject(subject)`
- `setDestinationSubject(subject)`
- `setTimeslotIDtoChange(change)`
- `setIsCilckToChangeSubject(isClicked)`
- `clearChangeSubjectState()`

**Subject Data Actions** (4):
- `setSubjectData(data)`
- `setScheduledSubjects(subjects)`
- `addSubjectToData(subject)`
- `removeSubjectFromData(subjectCode)`

**Timeslot Actions** (3):
- `setTimeSlotData(data)`
- `updateTimeslotSubject(timeslotID, subject)`
- `setLockData(data)`

**Modal Actions** (3):
- `openModal(payload)`
- `closeModal()`
- `setSubjectPayload(payload)`

**Error Display Actions** (3):
- `setShowErrorMsg(timeslotID, show)`
- `setShowLockDataMsg(timeslotID, show)`
- `clearErrorMessages()`

**Save State Actions** (1):
- `setIsSaving(saving)`

**Filter Actions** (1):
- `setFilters(filters)`

**Reset Actions** (2):
- `resetAllState()`
- `resetOnTeacherChange()`

---

## 🎨 Devtools Integration

### Redux DevTools Support
```typescript
export const useArrangementUIStore = create<ArrangementUIStore>()(
  devtools(
    (set, get) => ({ ...state, ...actions }),
    { name: 'arrangement-ui-store' }
  )
);
```

**Action Naming Convention**:
```typescript
// All actions use explicit names for devtools tracking:
set({ currentTeacherID: id }, undefined, 'arrangement/setCurrentTeacherID');
set({ selectedSubject: subject }, undefined, 'arrangement/setSelectedSubject');
```

**Benefits**:
- ✅ Time-travel debugging
- ✅ State inspection in browser
- ✅ Action replay
- ✅ Performance monitoring

---

## 🚀 Usage Examples

### Basic Usage
```tsx
import { useArrangementUIStore } from '@/features/schedule-arrangement/presentation/stores/arrangement-ui.store';

export default function TeacherArrangePage() {
  const store = useArrangementUIStore();

  const handleTeacherChange = (teacherId: string) => {
    store.setCurrentTeacherID(teacherId);
    store.resetOnTeacherChange(); // Clear related state
  };

  const handleSubjectSelect = (subject: SubjectData) => {
    store.setSelectedSubject(subject);
  };

  return (
    <div>
      <p>Selected: {store.selectedSubject.SubjectName}</p>
      <p>Saving: {store.isSaving ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Optimized with Selector Hooks
```tsx
import {
  useCurrentTeacher,
  useSelectedSubject,
  useModalState,
  useSaveState,
} from '@/features/schedule-arrangement/presentation/stores/arrangement-ui.store';

export default function OptimizedComponent() {
  // Only re-renders when specific values change
  const { id, data } = useCurrentTeacher();
  const selectedSubject = useSelectedSubject();
  const { isOpen, payload } = useModalState();
  const isSaving = useSaveState();

  // Component only re-renders when these specific slices change
  // NOT when other store values update
}
```

### With Server Actions
```tsx
import { useArrangementUIStore } from '@/features/schedule-arrangement/presentation/stores/arrangement-ui.store';
import { arrangeScheduleAction } from '@/features/schedule-arrangement/application/actions/schedule-arrangement.actions';

export default function SaveButton() {
  const { selectedSubject, currentTeacherID, setIsSaving } = useArrangementUIStore();

  const handleSave = async () => {
    setIsSaving(true);

    const result = await arrangeScheduleAction({
      teacherId: currentTeacherID!,
      subjectCode: selectedSubject.SubjectCode!,
      // ... other fields
    });

    if (result.success) {
      // Update UI state
      useArrangementUIStore.getState().clearSelectedSubject();
    } else {
      // Show error
      console.error(result.error);
    }

    setIsSaving(false);
  };

  return <button onClick={handleSave}>Save</button>;
}
```

---

## 📦 Dependencies Installed

```json
{
  "dependencies": {
    "zustand": "^5.0.8"  // Already installed
  },
  "devDependencies": {
    "@redux-devtools/extension": "3.3.0"  // ✅ Newly installed
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Planned)
```typescript
// src/features/schedule-arrangement/presentation/stores/__tests__/arrangement-ui.store.test.ts

describe('Arrangement UI Store', () => {
  beforeEach(() => {
    useArrangementUIStore.getState().resetAllState();
  });

  it('should set current teacher ID', () => {
    const store = useArrangementUIStore.getState();
    store.setCurrentTeacherID('T001');
    expect(store.currentTeacherID).toBe('T001');
  });

  it('should clear selected subject', () => {
    const store = useArrangementUIStore.getState();
    store.setSelectedSubject({ SubjectCode: 'MATH101' });
    store.clearSelectedSubject();
    expect(store.selectedSubject).toEqual({});
    expect(store.yearSelected).toBeNull();
  });

  // ... more tests
});
```

---

## 📝 Next Steps (Week 5 Continued)

### 5.2 Migrate to @dnd-kit
- [ ] Install @dnd-kit packages
- [ ] Replace react-beautiful-dnd with @dnd-kit
- [ ] Update drag handlers to use @dnd-kit API
- [ ] Test drag and drop functionality

### 5.3 Refactor TeacherArrangePage
- [ ] Replace useState hooks with Zustand store
- [ ] Integrate Server Actions
- [ ] Add optimistic updates
- [ ] Add conflict error handling
- [ ] Remove legacy code

### 5.4 Create Custom Hooks
- [ ] `useArrangeSchedule()` - Wrapper for Server Action
- [ ] `useScheduleFilters()` - Filter management
- [ ] `useConflictValidation()` - Real-time validation

### 5.5 Performance Optimization
- [ ] Implement selector hooks for all components
- [ ] Add React.memo where appropriate
- [ ] Profile and optimize re-renders

---

## 🎯 Success Criteria

- ✅ Zustand store created with TypeScript types
- ✅ Redux DevTools integration working
- ✅ No TypeScript compilation errors
- ⏳ 0 useState hooks remaining in TeacherArrangePage
- ⏳ @dnd-kit migration complete
- ⏳ Server Actions integrated
- ⏳ E2E tests passing

---

## 📚 References

- **Zustand Docs**: https://github.com/pmndrs/zustand
- **Context7 Library ID**: `/pmndrs/zustand`
- **Version**: 5.0.8
- **Pattern Used**: `create<T>()(devtools(...))`
- **AGENTS.md**: Lines 92-108 (MCP-first workflow)
- **Refactoring Plan**: `docs/COMPREHENSIVE_REFACTORING_PLAN.md`

---

**Week 5.1 Complete** ✅  
**Next**: Migrate to @dnd-kit (Week 5.2)
