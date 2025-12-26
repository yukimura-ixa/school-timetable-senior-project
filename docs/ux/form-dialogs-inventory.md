# Form Dialogs Inventory

> **Generated**: 2025-12-19  
> **Scope**: All dialog/modal components in `src/app/` and `src/components/`

## Summary

| Category                  | Count  | Pattern                                        |
| ------------------------- | ------ | ---------------------------------------------- |
| Custom CSS Overlay Modals | 28     | `fixed div` + rgba backdrop (❌ no focus trap) |
| MUI Dialog (proper)       | 3      | MUI `<Dialog>` with primitives                 |
| **Total**                 | **31** |                                                |

---

## Detailed Inventory

### ✅ Using MUI Dialog (Proper Implementation)

| File                                                                                                                                                     | Purpose                          | Fields           | Complexity | Notes                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------- | ---------- | ----------------------------------------------------------- |
| [ConfirmDialog.tsx](file:///b:/Dev/school-timetable-senior-project/src/components/dialogs/ConfirmDialog.tsx)                                             | Generic confirmation             | 0 (message only) | Simple     | ✅ Has `aria-labelledby`, `aria-describedby`, loading state |
| [ConfigureTimeslotsDialog.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/dashboard/_components/ConfigureTimeslotsDialog.tsx)                | Configure timeslots for semester | 3+               | Medium     | ✅ Uses MUI Dialog properly                                 |
| [RoomSelectionDialog.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/schedule/[academicYear]/[semester]/arrange/_components/RoomSelectionDialog.tsx) | Select room for timeslot         | 1-2              | Simple     | ✅ Uses MUI Dialog                                          |

---

### ❌ Custom CSS Overlay Pattern (Need Migration)

These use `<div className="fixed left-0 top-0">` with rgba backdrop. **Missing**: focus trap, Escape key handling, proper ARIA.

#### Management - Teacher

| File                                                                                                                                 | Purpose             | Fields     | Complexity | Validation     | Issues                                      |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | ---------- | ---------- | -------------- | ------------------------------------------- |
| [AddModalForm.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/teacher/component/AddModalForm.tsx)             | Create teacher(s)   | 5 × N rows | Complex    | Inline boolean | ❌ No focus trap, no Escape, multi-row form |
| [EditModalForm.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/teacher/component/EditModalForm.tsx)           | Edit teacher        | 5          | Medium     | Inline         | ❌ Same issues                              |
| [ConfirmDeleteModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/teacher/component/ConfirmDeleteModal.tsx) | Delete confirmation | 0          | Simple     | None           | ❌ Should use ConfirmDialog                 |

#### Management - Rooms

| File                                                                                                                               | Purpose             | Fields | Complexity | Issues                      |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------ | ---------- | --------------------------- |
| [AddModalForm.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/rooms/component/AddModalForm.tsx)             | Create room(s)      | 4 × N  | Complex    | ❌ Multi-row, no focus trap |
| [EditModalForm.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/rooms/component/EditModalForm.tsx)           | Edit room           | 4      | Medium     | ❌ Same                     |
| [ConfirmDeleteModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/rooms/component/ConfirmDeleteModal.tsx) | Delete confirmation | 0      | Simple     | ❌ Use ConfirmDialog        |

#### Management - Subject

| File                                                                                                                                 | Purpose                 | Fields | Complexity | Issues               |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ------ | ---------- | -------------------- |
| [AddModalForm.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/subject/component/AddModalForm.tsx)             | Create subject(s)       | 6 × N  | Complex    | ❌ Multi-row         |
| [EditModalForm.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/subject/component/EditModalForm.tsx)           | Edit subject            | 6      | Medium     | ❌                   |
| [ConfirmDeleteModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/subject/component/ConfirmDeleteModal.tsx) | Delete                  | 0      | Simple     | ❌ Use ConfirmDialog |
| [ActivityModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/subject/component/ActivityModal.tsx)           | Activity type selection | 2-3    | Medium     | ❌                   |

#### Management - Grade Level

| File                                                                                                                                    | Purpose         | Fields | Complexity | Issues               |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------ | ---------- | -------------------- |
| [AddModalForm.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/gradelevel/component/AddModalForm.tsx)             | Create grade(s) | 2 × N  | Medium     | ❌ Multi-row         |
| [EditModalForm.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/gradelevel/component/EditModalForm.tsx)           | Edit grade      | 2      | Simple     | ❌                   |
| [ConfirmDeleteModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/gradelevel/component/ConfirmDeleteModal.tsx) | Delete          | 0      | Simple     | ❌ Use ConfirmDialog |

#### Management - Program

| File                                                                                                                                                   | Purpose        | Fields | Complexity | Issues               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ------ | ---------- | -------------------- |
| [AddStudyProgramModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/program/component/AddStudyProgramModal.tsx)               | Create program | 5+     | Medium     | ❌                   |
| [EditStudyProgramModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/program/component/EditStudyProgramModal.tsx)             | Edit program   | 5+     | Medium     | ❌                   |
| [EditStudyProgramModalLegacy.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/program/component/EditStudyProgramModalLegacy.tsx) | Legacy edit    | 5+     | Medium     | ❌ Should delete     |
| [DeleteProgramModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/management/program/component/DeleteProgramModal.tsx)                   | Delete         | 0      | Simple     | ❌ Use ConfirmDialog |

#### Schedule - Assign

| File                                                                                                                                                    | Purpose              | Fields | Complexity | Issues               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------ | ---------- | -------------------- |
| [AddSubjectModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/schedule/[academicYear]/[semester]/assign/component/AddSubjectModal.tsx)           | Add subject to class | 3 × N  | Complex    | ❌ Multi-row, search |
| [SelectClassRoomModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/schedule/[academicYear]/[semester]/assign/component/SelectClassRoomModal.tsx) | Select classroom     | 1-2    | Simple     | ❌                   |

#### Schedule - Arrange

| File                                                                                                                                                               | Purpose             | Fields | Complexity | Issues |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | ------ | ---------- | ------ |
| [SelectRoomToTimeslotModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/schedule/[academicYear]/[semester]/arrange/component/SelectRoomToTimeslotModal.tsx) | Assign room to slot | 1      | Simple     | ❌     |

#### Schedule - Config

| File                                                                                                                                                          | Purpose                   | Fields | Complexity | Issues |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------ | ---------- | ------ |
| [CloneTimetableDataModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/schedule/[academicYear]/[semester]/config/component/CloneTimetableDataModal.tsx) | Clone from other semester | 2      | Medium     | ❌     |
| [ConfirmDeleteModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/schedule/[academicYear]/[semester]/config/component/ConfirmDeleteModal.tsx)           | Delete semester config    | 0      | Simple     | ❌     |

#### Schedule - Lock

| File                                                                                                                                                        | Purpose             | Fields | Complexity | Issues |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------ | ---------- | ------ |
| [AddLockScheduleModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/schedule/[academicYear]/[semester]/lock/component/AddLockScheduleModal.tsx)       | Add locked slot     | 4+     | Medium     | ❌     |
| [BulkLockModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/schedule/[academicYear]/[semester]/lock/component/BulkLockModal.tsx)                     | Bulk lock slots     | 3+     | Medium     | ❌     |
| [DeleteLockScheduleModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/schedule/[academicYear]/[semester]/lock/component/DeleteLockScheduleModal.tsx) | Delete lock         | 0      | Simple     | ❌     |
| [LockTemplatesModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/schedule/[academicYear]/[semester]/lock/component/LockTemplatesModal.tsx)           | Apply lock template | 2      | Medium     | ❌     |

#### Dashboard

| File                                                                                                                        | Purpose            | Fields | Complexity | Issues |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------ | ---------- | ------ |
| [CopySemesterModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/dashboard/_components/CopySemesterModal.tsx) | Copy semester data | 2      | Medium     | ❌     |

#### Schedule - Components (shared)

| File                                                                                                                                      | Purpose      | Fields | Complexity | Issues |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------ | ---------- | ------ |
| [SelectClassModal.tsx](file:///b:/Dev/school-timetable-senior-project/src/app/schedule/[academicYear]/[semester]/components/SelectClassModal.tsx) | Select class | 1      | Simple     | ❌     |

---

## Common Problems Identified

1. **No Focus Trap**: Users can Tab outside the modal
2. **No Escape Key Handling**: Must click X button to close
3. **No Backdrop Click Handling**: Clicking backdrop does nothing
4. **No Dirty State Protection**: Closing loses unsaved changes silently
5. **Inconsistent Button Order**: Some have Cancel on left, some on right
6. **No ARIA Labels**: Missing `aria-labelledby`, `aria-describedby`
7. **Duplicate Delete Modals**: 6 separate `ConfirmDeleteModal` files (should use shared `ConfirmDialog`)

---

## Recommended Migration Priority

### Priority 1: High-Traffic CRUD Dialogs

1. `management/teacher/AddModalForm.tsx`
2. `management/subject/AddModalForm.tsx`
3. `management/rooms/AddModalForm.tsx`
4. `management/gradelevel/AddModalForm.tsx`

### Priority 2: Scheduling Dialogs

5. `schedule/assign/AddSubjectModal.tsx`
6. `schedule/lock/AddLockScheduleModal.tsx`
7. `schedule/config/CloneTimetableDataModal.tsx`

### Priority 3: Delete Confirmations

- Replace all `ConfirmDeleteModal.tsx` files with the existing `ConfirmDialog` component

### Priority 4: Simple Selection Dialogs

- Remaining low-impact selection modals
