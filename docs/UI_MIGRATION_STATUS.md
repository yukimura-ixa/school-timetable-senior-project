# UI Migration Status - API Routes to Server Actions

**Date:** Week 8 (October 2025)  
**Overall Status:** ✅ Main Pages Complete - 4/4 pages migrated (100%)

---

## Migration Overview

All backend features (11/11) are migrated to Clean Architecture with Server Actions.  
Now migrating UI components from old API routes to new Server Actions.

---

## Pages Migration Status

### ✅ Completed (4/4 = 100%)

#### 1. Teacher Arrange Page ✅
- **Path:** `src/app/schedule/[semesterAndyear]/arrange/teacher-arrange/page.tsx`
- **Size:** 1,006 lines
- **Status:** ✅ Complete - 0 TypeScript errors
- **Migrated Endpoints:** 6
  - `GET /class/checkConflict` → `getConflictsAction()`
  - `GET /class` → `getTeacherScheduleAction()`
  - `GET /teacher` → `getTeachersAction()`
  - `GET /assign/getAvailableResp` → `getAvailableRespsAction()`
  - `GET /timeslot` → `getTimeslotsByTermAction()`
  - `POST /arrange` → `syncTeacherScheduleAction()`
- **Documentation:** ✅ `docs/UI_MIGRATION_TEACHER_ARRANGE.md`
- **Testing:** ⏳ Pending manual testing

#### 2. Teacher Responsibility (Assign) Page ✅
- **Path:** `src/app/schedule/[semesterandyear]/assign/teacher_responsibility/page.tsx`
- **Size:** 455 lines
- **Status:** ✅ Complete - 0 TypeScript errors
- **Migrated Endpoints:** 3
  - `GET /assign?TeacherID=...&AcademicYear=...&Semester=...` → `getAssignmentsAction()`
  - `GET /teacher?TeacherID=...` → `getTeachersAction()`
  - `POST /assign` → `syncAssignmentsAction()`
- **Documentation:** ✅ `docs/UI_MIGRATION_TEACHER_RESPONSIBILITY.md`
- **Testing:** ⏳ Pending manual testing
- **Special Note:** Uses different error pattern (throws errors instead of success/error object)

#### 3. Config (Timetable Settings) Page ✅
- **Path:** `src/app/schedule/[semesterandyear]/config/page.tsx`
- **Size:** 470 lines
- **Status:** ✅ Complete - 0 TypeScript errors
- **Migrated Endpoints:** 2
  - `GET /config/getConfig?AcademicYear=...&Semester=...` → `getConfigByTermAction()`
  - `POST /timeslot` → `createTimeslotsAction()`
- **Documentation:** ✅ `docs/UI_MIGRATION_CONFIG.md`
- **Testing:** ⏳ Pending manual testing
- **Special Note:** Config action imported from Config feature, timeslot action from Timeslot feature

#### 4. Program Management Page ✅
- **Path:** `src/app/management/program/[year]/page.tsx`
- **Size:** 256 lines
- **Status:** ✅ Complete - 0 TypeScript errors
- **Migrated Endpoints:** 2
  - `GET /program?Year=...` → `getProgramsByYearAction()` (via custom hook)
  - `DELETE /program` → `deleteProgramAction()`
- **Documentation:** ✅ `docs/UI_MIGRATION_PROGRAM.md`
- **Testing:** ⏳ Pending manual testing
- **Special Note:** Replaced custom `useProgramData` hook with inline SWR + Server Action

---

### 🟢 Skip (Placeholder Page)

#### Student Arrange Page
- **Path:** `src/app/schedule/[semesterandyear]/arrange/student-arrange/page.tsx`
- **Size:** 11 lines (placeholder only)
- **Status:** ⏭️ Skip - No API routes to migrate
- **Reason:** Contains only `<div>page</div>` placeholder

---

## Component Migration Status

### Management Components (Pending)

Many management components still use old API routes. These are lower priority since they're admin-only:

#### Teacher Management Components (5 components)
- `src/app/management/teacher/component/TeacherTable.tsx`
- `src/app/management/teacher/component/EditModalForm.tsx`
- `src/app/management/teacher/component/ConfirmDeleteModal.tsx`
- `src/app/management/teacher/component/AddModalForm.tsx`
- **Required Actions:** ✅ All teacher actions exist
- **Priority:** 🟢 LOW

#### Subject Management Components (4 components)
- `src/app/management/subject/component/SubjectTable.tsx`
- `src/app/management/subject/component/EditModalForm.tsx`
- `src/app/management/subject/component/ConfirmDeleteModal.tsx`
- `src/app/management/subject/component/AddModalForm.tsx`
- **Required Actions:** ✅ All subject actions exist
- **Priority:** 🟢 LOW

#### Room Management Components (4 components)
- `src/app/management/rooms/component/RoomsTable.tsx`
- `src/app/management/rooms/component/EditModalForm.tsx`
- `src/app/management/rooms/component/ConfirmDeleteModal.tsx`
- `src/app/management/rooms/component/AddModalForm.tsx`
- **Required Actions:** ✅ All room actions exist
- **Priority:** 🟢 LOW

#### Config Components (2 components)
- `src/app/schedule/[semesterandyear]/config/component/CloneTimetableDataModal.tsx`
- `src/app/schedule/[semesterandyear]/config/component/ConfirmDeleteModal.tsx`
- **Required Actions:** ✅ All config actions exist
- **Priority:** 🟡 MEDIUM

#### Lock Schedule Components (3 components)
- `src/app/schedule/[semesterandyear]/lock/component/LockScheduleForm.tsx`
- `src/app/schedule/[semesterandyear]/lock/component/DeleteLockScheduleModal.tsx`
- `src/app/schedule/[semesterandyear]/lock/component/LockSchedule.tsx`
- **Required Actions:** ✅ All lock actions exist
- **Priority:** 🟡 MEDIUM

#### Assign Components (2 components)
- `src/app/schedule/[semesterandyear]/assign/component/SelectClassRoomModal.tsx`
- `src/app/schedule/[semesterandyear]/assign/component/AddSubjectModal.tsx`
- **Required Actions:** ✅ All assign actions exist
- **Priority:** 🔴 HIGH (part of teacher_responsibility page)

---

## Migration Priority Plan

### Phase 1: Critical Pages (Week 8)
1. ✅ **Teacher Arrange** - DONE
2. ⏳ **Teacher Responsibility (Assign)** - IN PROGRESS
   - Main page + 2 modal components
   - High priority - core scheduling feature

### Phase 2: Admin Pages (Week 9)
3. ⏳ **Config Page** + 2 components
4. ⏳ **Program Management Page**
5. ⏳ **Lock Schedule Components** (3 components)

### Phase 3: Management Pages (Week 9-10)
6. ⏳ **Teacher Management** (5 components)
7. ⏳ **Subject Management** (4 components)
8. ⏳ **Room Management** (4 components)

---

## Migration Pattern (Standardized)

Based on teacher-arrange migration, use this pattern for all components:

### 1. Remove Deprecated Imports
```diff
- import api, { fetcher } from "@/libs/axios";
```

### 2. Add Server Action Imports
```typescript
import { getXAction, createXAction, updateXAction, deleteXAction } 
  from "@/features/X/application/actions/X.actions";
```

### 3. Update SWR Data Fetching
```typescript
// Before
const data = useSWR(`/api/endpoint?param=${value}`, fetcher);

// After
const data = useSWR(
  `cache-key-${value}`,
  async () => {
    if (!value) return null;
    const result = await getXAction({ param: value });
    if (!result || typeof result !== 'object' || !('success' in result)) {
      return null;
    }
    return (result.success && 'data' in result) ? result.data : null;
  },
  { revalidateOnFocus: false }
);
```

### 4. Update Mutations (POST/PUT/DELETE)
```typescript
// Before
await api.post("/endpoint", data);

// After
const result = await createXAction(data);
if (result.success) {
  // success
} else {
  // error: result.error?.message
}
```

### 5. Fix Semester Enum
```typescript
// Always use: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2"
```

---

## Testing Checklist Template

For each migrated component:

### Functional Testing
- [ ] Load page/component successfully
- [ ] Fetch data (GET operations)
- [ ] Create new record (POST)
- [ ] Update existing record (PUT)
- [ ] Delete record (DELETE)
- [ ] Error handling works
- [ ] Success notifications appear

### Edge Cases
- [ ] Empty state (no data)
- [ ] Network errors
- [ ] Validation errors
- [ ] Concurrent operations
- [ ] SWR cache invalidation

---

## Code Quality Metrics

| Metric | Current | Target |
|--------|---------|--------|
| **Pages Migrated** | 2/4 (50%) ✅ | 4/4 (100%) |
| **Components Migrated** | 0/20 (0%) | 20/20 (100%) |
| **Total TypeScript Errors** | 0 ✅ | 0 |
| **Deprecated API Imports** | 18 (down from 20+) | 0 |
| **Server Actions Available** | ~74 ✅ | ~74 |

---

## Next Immediate Step

**🎯 Migrate Config Page OR Program Page**

Both are MEDIUM priority admin pages. Choose based on:
1. **Config Page** - More important for timetable setup
2. **Program Page** - Simpler data management

OR

**🔄 Test Completed Migrations**

Before continuing, you could:
1. Test teacher-arrange page functionality
2. Test teacher-responsibility page functionality
3. Verify all data flows work correctly
4. Document any issues found

---

## Success Criteria (Overall)

- [ ] All pages use Server Actions (0 API routes)
- [ ] All components use Server Actions (0 `import api`)
- [ ] 0 TypeScript errors across all files
- [ ] All SWR caching preserved
- [ ] Error handling improved (result patterns)
- [ ] Documentation for each major migration
- [ ] Manual testing passed for all components

---

## References

- **Migration Guide:** `docs/UI_MIGRATION_TEACHER_ARRANGE.md`
- **Server Actions:** `src/features/*/application/actions/*.actions.ts`
- **Pattern Reference:** teacher-arrange page (completed)

---

**Status:** Ready to migrate Teacher Responsibility page next.
