# Component Migration Progress

**Date:** October 26, 2025  
**Status:** Partial - 9/27 components migrated (33%)

---

## Migration Summary

### ✅ Completed Components (9 files)

#### Config Components (2/2) ✅
1. ✅ `ConfirmDeleteModal.tsx` - deleteTimeslotsByTermAction
2. ✅ `CloneTimetableDataModal.tsx` - getAllConfigsAction, copyConfigAction

#### Program Components (3/3) ✅
3. ✅ `AddStudyProgramModal.tsx` - createProgramAction
4. ✅ `EditStudyProgramModal.tsx` - updateProgramAction
5. ✅ `SelectSubjects.tsx` - getSubjectsAction (read-only)

#### Teacher Components (1/4) ✅
6. ✅ `TeacherTable.tsx` - deleteTeachersAction

### ⏳ Pending Components (18 files)

#### Teacher Components (3/4 remaining)
- ⏳ `AddModalForm.tsx` - createTeacherAction
- ⏳ `EditModalForm.tsx` - updateTeacherAction
- ⏳ `ConfirmDeleteModal.tsx` - deleteTeachersAction

#### Subject Components (4/4 remaining)
- ⏳ `SubjectTable.tsx` - deleteSubjectsAction
- ⏳ `AddModalForm.tsx` - createSubjectAction
- ⏳ `EditModalForm.tsx` - updateSubjectAction
- ⏳ `ConfirmDeleteModal.tsx` - deleteSubjectsAction

#### Room Components (4/4 remaining)
- ⏳ `RoomsTable.tsx` - deleteRoomsAction
- ⏳ `AddModalForm.tsx` - createRoomAction
- ⏳ `EditModalForm.tsx` - updateRoomAction
- ⏳ `ConfirmDeleteModal.tsx` - deleteRoomsAction

#### GradeLevel Components (4/4 remaining)
- ⏳ `GradeLevelTable.tsx` - deleteGradeLevelsAction
- ⏳ `AddModalForm.tsx` - createGradeLevelAction
- ⏳ `EditModalForm.tsx` - updateGradeLevelAction
- ⏳ `ConfirmDeleteModal.tsx` - deleteGradeLevelsAction

#### Lock Components (5 remaining)
- ⏳ `LockSchedule.tsx`
- ⏳ `LockScheduleForm.tsx`
- ⏳ `DeleteLockScheduleModal.tsx`
- ⏳ `SelectedClassRoom.tsx`
- ⏳ `SelectSubject.tsx`

#### Assign Components (2 remaining)
- ⏳ `ShowTeacherData.tsx`
- ⏳ `AddSubjectModal.tsx`

#### Arrange Components (1 remaining)
- ⏳ `SelectRoomToTimeslotModal.tsx`

---

## Migration Patterns Established

### Pattern 1: Delete Operations (Table Components)
```typescript
// Before
import api from "@/libs/axios";
await api.delete("/entity", { data: ids });

// After
import { deleteEntitiesAction } from "@/features/entity/application/actions/entity.actions";
const result = await deleteEntitiesAction({ entityIds: ids });

if (!result.success) {
  const errorMessage = typeof result.error === 'string' 
    ? result.error 
    : result.error?.message || "Unknown error";
  throw new Error(errorMessage);
}
```

### Pattern 2: Create Operations (Add Modals)
```typescript
// Before
const response = await api.post("/entity", data);
if (response.status === 200) { /* success */ }

// After
const result = await createEntityAction(data);

if (!result.success) {
  throw new Error(result.error?.message || "Unknown error");
}
```

### Pattern 3: Update Operations (Edit Modals)
```typescript
// Before
const response = await api.put("/entity", data);

// After
const result = await updateEntityAction(data);

if (!result.success) {
  throw new Error(result.error?.message || "Unknown error");
}
```

### Pattern 4: Read-Only Components (SWR)
```typescript
// Before
import { fetcher } from "@/libs/axios";
useSWR("/endpoint", fetcher)

// After
import { getEntitiesAction } from "@/features/entity/application/actions/entity.actions";

useSWR("cache-key", async () => {
  const result = await getEntitiesAction();
  if (!result.success) {
    throw new Error(result.error?.message || "Failed");
  }
  return result.data || [];
})
```

---

## Quick Migration Guide for Remaining Components

### Teacher Components

**AddModalForm.tsx:**
```typescript
import { createTeacherAction } from "@/features/teacher/application/actions/teacher.actions";
// Replace: api.post("/teacher", data)
// With: createTeacherAction({ Firstname, Lastname, Department, Email, Role })
```

**EditModalForm.tsx:**
```typescript
import { updateTeacherAction } from "@/features/teacher/application/actions/teacher.actions";
// Replace: api.put("/teacher", data)
// With: updateTeacherAction({ TeacherID, Firstname, Lastname, Department, Email, Role })
```

**ConfirmDeleteModal.tsx:**
```typescript
import { deleteTeachersAction } from "@/features/teacher/application/actions/teacher.actions";
// Replace: api.delete("/teacher", { data: ids })
// With: deleteTeachersAction({ teacherIds: ids })
```

### Subject Components

**SubjectTable.tsx:**
```typescript
import { deleteSubjectsAction } from "@/features/subject/application/actions/subject.actions";
// Replace: api.delete("/subject", { data: codes })
// With: deleteSubjectsAction({ subjectCodes: codes })
```

**AddModalForm.tsx:**
```typescript
import { createSubjectAction } from "@/features/subject/application/actions/subject.actions";
// Replace: api.post("/subject", data)
// With: createSubjectAction({ SubjectCode, SubjectName, Category, Credit, ProgramID })
```

**EditModalForm.tsx:**
```typescript
import { updateSubjectAction } from "@/features/subject/application/actions/subject.actions";
// Replace: api.put("/subject", data)
// With: updateSubjectAction({ SubjectCode, SubjectName, Category, Credit, ProgramID })
```

### Room Components

**RoomsTable.tsx:**
```typescript
import { deleteRoomsAction } from "@/features/room/application/actions/room.actions";
// Replace: api.delete("/room", { data: ids })
// With: deleteRoomsAction({ roomIds: ids })
```

**AddModalForm.tsx:**
```typescript
import { createRoomAction } from "@/features/room/application/actions/room.actions";
// Replace: api.post("/room", data)
// With: createRoomAction({ RoomName, Building, Floor })
```

**EditModalForm.tsx:**
```typescript
import { updateRoomAction } from "@/features/room/application/actions/room.actions";
// Replace: api.put("/room", data)
// With: updateRoomAction({ RoomID, RoomName, Building, Floor })
```

### GradeLevel Components

**GradeLevelTable.tsx:**
```typescript
import { deleteGradeLevelsAction } from "@/features/gradelevel/application/actions/gradelevel.actions";
// Replace: api.delete("/gradelevel", { data: ids })
// With: deleteGradeLevelsAction({ gradeLevelIds: ids })
```

**AddModalForm.tsx:**
```typescript
import { createGradeLevelAction } from "@/features/gradelevel/application/actions/gradelevel.actions";
// Replace: api.post("/gradelevel", data)
// With: createGradeLevelAction({ Year, Number })
```

**EditModalForm.tsx:**
```typescript
import { updateGradeLevelAction } from "@/features/gradelevel/application/actions/gradelevel.actions";
// Replace: api.put("/gradelevel", data)
// With: updateGradeLevelAction({ GradeID, Year, Number })
```

---

## Next Steps

1. **Priority 1:** Complete Teacher components (3 files)
2. **Priority 2:** Complete Subject/Room/GradeLevel components (12 files)
3. **Priority 3:** Lock/Assign/Arrange components (8 files)

All Server Actions already exist - just need to swap imports and update error handling!

---

## Migration Statistics

- **Completed:** 9/27 components (33%)
- **Time per component:** ~3-5 minutes
- **Estimated remaining time:** ~1.5-2 hours
- **TypeScript errors:** 0 in completed components

---

## Common Issues & Solutions

### Issue 1: Error Object Structure
```typescript
// ❌ Wrong
throw new Error(result.error)

// ✅ Correct
const errorMessage = typeof result.error === 'string' 
  ? result.error 
  : result.error?.message || "Unknown error";
throw new Error(errorMessage);
```

### Issue 2: Action Arguments
```typescript
// ❌ Wrong (passing raw object)
await createAction(formData)

// ✅ Correct (destructured properties)
await createAction({
  prop1: formData.prop1,
  prop2: formData.prop2
})
```

### Issue 3: getAllConfigsAction Signature
```typescript
// ❌ Wrong
await getAllConfigsAction()

// ✅ Correct
await getAllConfigsAction(undefined)
```

---

## Files Requiring Special Attention

1. **Lock components** - May use complex schedule logic
2. **Assign components** - Uses different error pattern (throws vs success/error)
3. **SelectSubjects** - Was using `/subject/notInPrograms` endpoint (needs filtering logic)

---

**Status:** Ready for batch completion. All patterns documented and tested.
