# Teacher Responsibility Page Migration Summary

**Date:** Week 8 (October 2025)  
**Scope:** Migrated teacher-responsibility (assign) page from API routes to Server Actions  
**Status:** ✅ Complete - 0 TypeScript errors

---

## What Was Changed

### File Updated
- `src/app/schedule/[semesterandyear]/assign/teacher_responsibility/page.tsx` (455 lines)

### Migration Overview
Replaced API route calls with Clean Architecture Server Actions for teacher responsibility management:

#### Before (API Routes)
```typescript
// Old: Using axios with SWR
const responsibilityData = useSWR(
  `/assign?TeacherID=${searchTeacherID}&AcademicYear=${academicYear}&Semester=SEMESTER_${semester}`,
  fetcher
);

const teacherData = useSWR(
  `/teacher?TeacherID=${searchTeacherID}`,
  fetcher
);

// Old: POST via axios
const response = await api.post("/assign", data);
```

#### After (Server Actions)
```typescript
// New: Using Server Actions with SWR
const responsibilityData = useSWR(
  `assign-${searchTeacherID}-${academicYear}-${semester}`,
  async () => {
    const result = await getAssignmentsAction({
      TeacherID: parseInt(searchTeacherID),
      AcademicYear: parseInt(academicYear),
      Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
    });
    return result; // Returns array directly
  }
);

// New: Direct Server Action call
const result = await syncAssignmentsAction({
  TeacherID: data.TeacherID,
  Resp: data.Resp,
  AcademicYear: data.AcademicYear,
  Semester: data.Semester,
});
```

---

## API Routes → Server Actions Mapping

| Old API Route | New Server Action | Feature |
|--------------|-------------------|---------|
| `GET /assign?TeacherID=...&AcademicYear=...&Semester=...` | `getAssignmentsAction()` | Assign |
| `GET /teacher?TeacherID=...` | `getTeachersAction()` | Teacher |
| `POST /assign` | `syncAssignmentsAction()` | Assign |

---

## Key Changes

### 1. **Removed Deprecated Imports**
```diff
- import api, { fetcher } from "@/libs/axios";
```

### 2. **Added Server Action Imports**
```typescript
import { getAssignmentsAction, syncAssignmentsAction } from "@/features/assign/application/actions/assign.actions";
import { getTeachersAction } from "@/features/teacher/application/actions/teacher.actions";
```

### 3. **Updated Data Fetching Pattern**
- **Before:** URL-based SWR keys with `fetcher` function
- **After:** Descriptive cache keys with async Server Action calls
- **Note:** Assign actions return data directly (not wrapped in success/error pattern)
- **Fixed:** Semester enum format (`"1"` → `"SEMESTER_1"`)

### 4. **Updated Save Operation**
- **Before:** `api.post("/assign", data)` with axios response handling
- **After:** `syncAssignmentsAction(data)` with try/catch error handling
- **Improved:** Direct error messages from thrown errors

---

## Important: Different Error Pattern

⚠️ **The Assign feature uses a different error handling pattern than other features!**

### Standard Pattern (Teacher, Class, etc.)
```typescript
const result = await getTeachersAction();
if (result.success) {
  // Use result.data
} else {
  // Handle result.error
}
```

### Assign Feature Pattern
```typescript
try {
  const result = await getAssignmentsAction(input);
  // Use result directly (array or object)
} catch (error) {
  // Handle thrown error
}
```

**Reason:** The assign actions use a local `createAction` wrapper that throws errors instead of returning the standard `{ success, data, error }` pattern.

---

## Type Safety Improvements

### 1. **Direct Return Handling**
```typescript
const result = await getAssignmentsAction({...});
// result is already the data array, not wrapped
return result;
```

### 2. **Semester Enum Conversion**
```typescript
Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2"
```

### 3. **Error Type Narrowing**
```typescript
catch (error) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  enqueueSnackbar("เกิดข้อผิดพลาดในการบันทึก: " + errorMessage, { variant: "error" });
}
```

---

## Testing Checklist

### Manual Testing Required
- [ ] Load teacher-responsibility page with valid teacher ID
- [ ] Verify assignment data loads (responsibilities by grade/class)
- [ ] Verify teacher data loads in header
- [ ] Open SelectClassRoomModal and select classrooms
- [ ] Open AddSubjectModal and add subjects
- [ ] Save changes (syncAssignmentsAction)
- [ ] Verify success notification appears
- [ ] Refresh page and confirm data persists
- [ ] Test validation: try to save without adding subjects to all classes
- [ ] Test with no teacher selected (error state)

### Edge Cases
- [ ] Teacher with no responsibilities
- [ ] Multiple grades/classrooms
- [ ] Adding and removing subjects
- [ ] Validation errors (empty subjects)
- [ ] Network errors
- [ ] Multiple saves in succession (SWR revalidation)

---

## Code Quality Metrics

| Metric | Value |
|--------|-------|
| **File Size** | 455 lines (no change) |
| **TypeScript Errors** | 0 ✅ |
| **Deprecated Imports** | Removed (`api`, `fetcher`) |
| **Server Actions Used** | 2 (getAssignmentsAction, syncAssignmentsAction) |
| **Teacher Actions Used** | 1 (getTeachersAction) |
| **Features Integrated** | 2 (Assign, Teacher) |
| **Error Handling** | try/catch (throw pattern) |

---

## Performance Considerations

### Benefits of Server Actions
1. **Type Safety:** End-to-end TypeScript from UI to database
2. **Bundle Size:** No axios client-side dependency
3. **Caching:** SWR cache keys optimized for Server Actions
4. **Error Handling:** Native Error throwing/catching

### SWR Configuration
```typescript
{
  revalidateOnFocus: false,  // Don't refetch on window focus
}
```

---

## Backward Compatibility

### What Still Works
✅ SelectClassRoomModal component  
✅ AddSubjectModal component  
✅ All state management logic  
✅ Validation logic  
✅ All existing UI/UX patterns  

### What Was Removed
❌ Axios API client (`api.post`)  
❌ Fetcher function for SWR  
❌ URL-based API routes for assign feature  

---

## Related Components (Still Need Migration)

These modal components also need to be updated:

### 1. SelectClassRoomModal
- **Path:** `src/app/schedule/[semesterandyear]/assign/component/SelectClassRoomModal.tsx`
- **Likely API Usage:** Fetching available classrooms/grades
- **Priority:** MEDIUM (used by this page)

### 2. AddSubjectModal
- **Path:** `src/app/schedule/[semesterandyear]/assign/component/AddSubjectModal.tsx`
- **Likely API Usage:** Fetching available subjects
- **Priority:** MEDIUM (used by this page)

---

## Next Steps

1. **Test this page** thoroughly with the new Server Actions
2. **Migrate modal components** (SelectClassRoomModal, AddSubjectModal)
3. **Update other pages** using old API routes
4. **Add unit tests** for Server Action integration
5. **Add E2E tests** for the full assign workflow

---

## Rollback Plan

If issues arise, revert by:
1. **Restore imports:** Add back `import api, { fetcher } from "@/libs/axios";`
2. **Revert SWR calls:** Replace Server Actions with URL-based SWR
3. **Revert save operation:** Change `syncAssignmentsAction` back to `api.post`
4. **Git:** `git revert <commit-hash>`

---

## References

- **Assign Actions:** `src/features/assign/application/actions/assign.actions.ts`
- **Teacher Actions:** `src/features/teacher/application/actions/teacher.actions.ts`
- **Assign Schemas:** `src/features/assign/application/schemas/assign.schemas.ts`
- **Previous Migration:** `docs/UI_MIGRATION_TEACHER_ARRANGE.md`

---

## Success Criteria

✅ **0 TypeScript errors**  
✅ **All deprecated imports removed**  
✅ **All API routes replaced with Server Actions**  
✅ **Error handling pattern correct (try/catch for assign actions)**  
✅ **SWR caching preserved**  

**Status:** Migration complete. Ready for testing.

---

## Notes for Future Migrations

When migrating other components that use assign actions:

1. **Remember:** Assign actions throw errors (don't return `{ success, error }`)
2. **Use try/catch** for error handling
3. **Return data directly** from SWR fetchers
4. **Check action return type** before assuming success/error pattern
5. **Test validation logic** carefully (subject validation, etc.)
