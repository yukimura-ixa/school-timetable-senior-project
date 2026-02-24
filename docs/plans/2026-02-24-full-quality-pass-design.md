# Full Quality Pass — Design Document

**Date:** 2026-02-24  
**Scope:** Schedule Arrangement + Management Pages  
**Approach:** Approach B — Bugs + UX + Accessibility + Architecture  
**Timeline:** ~6-8 weeks, ongoing incremental commits  

---

## Context

A deep audit of the schedule arrangement and management pages uncovered ~40 concrete issues across 6 categories: runtime bugs, dead code, type safety, architecture violations, UX inconsistencies, and accessibility gaps. This design covers all fixes in priority order.

### Focus Areas

- **Schedule arrangement** — drag-and-drop scheduling, assign page, config page
- **Management pages** — teacher, subject, room, grade level, program CRUD

### Constraints

- CI-first: every commit must pass lint + typecheck + unit + E2E
- No MOE curriculum logic changes (out of scope)
- No new features — strictly fixing what exists
- PNPM-only

---

## Section 1: Critical Bugs (P0)

### 1.1 Inspector Stub Shows False "0 Conflicts"

- **File:** `src/app/schedule/[academicYear]/[semester]/arrange/@inspector/page.tsx`
- **Problem:** Hardcoded "ไม่มีความขัดแย้ง" and "จัดแล้ว 0 คาบ" regardless of actual state
- **Fix:** Hide the inspector panel content and show a "กำลังพัฒนา" (coming soon) placeholder. A misleading panel is worse than no panel.

### 1.2 Regex Injection in Subject Search

- **File:** `src/app/schedule/[academicYear]/[semester]/assign/component/AddSubjectModal.tsx` L86
- **Problem:** `s.SubjectName.match(searchText)` — special characters like `(`, `[`, `*` crash the filter
- **Fix:** Replace `.match(searchText)` with `.toLowerCase().includes(searchText.toLowerCase())`

### 1.3 Duplicate DndContext

- **Files:** `src/app/schedule/[academicYear]/[semester]/arrange/layout.tsx` + `@grid/page.tsx`
- **Problem:** Nested `<DndContext>` causes unpredictable drag-and-drop — drops fire on wrong context or not at all
- **Fix:** Keep DndContext only in the layout (parent); remove from grid page

### 1.4 `window.location.reload()` in Server Component

- **File:** `src/app/management/gradelevel/page.tsx` L21
- **Problem:** `window` does not exist in Server Components — crashes at runtime when data fetch fails
- **Fix:** Extract the error retry into a Client Component, or use Next.js `error.tsx` boundary

### 1.5 Fire-and-Forget Delete (Race Condition)

- **File:** `src/app/management/gradelevel/component/ConfirmDeleteModal.tsx` L26-27
- **Problem:** `void removeMultiData()` then immediately `closeModal()` — UI may not refresh
- **Fix:** `await removeMultiData(...)` before calling `closeModal()`

### 1.6 Non-Atomic Edit (Delete + Create)

- **File:** `src/app/schedule/[academicYear]/[semester]/assign/component/QuickAssignmentPanel.tsx` L245
- **Problem:** `handleSaveEdit` deletes old schedule then creates new. If creation fails, data is lost.
- **Fix:** Use a single `updateClassScheduleAction` or wrap in Prisma `$transaction`

### 1.7 Persistent Snackbar Leak

- **File:** `src/app/management/program/component/ProgramEditableTable.tsx` L126
- **Problem:** `persist: true` snackbar enqueued but never dismissed — permanent loading indicator
- **Fix:** Capture key from `enqueueSnackbar`, call `closeSnackbar(key)` in `finally`

---

## Section 2: Dead Code Cleanup

~25 unused files, ~4,000 lines of code. Removing them reduces confusion, speeds up IDE indexing, eliminates false positives in searches.

### 2.1 Schedule Arrangement Dead Code

| File | Lines | Why Dead |
|------|-------|----------|
| `src/features/schedule-arrangement/presentation/stores/teacher-arrange.store.ts` | 871 | Never imported — superseded by `arrangement-ui.store.ts` |
| `src/features/schedule-arrangement/presentation/stores/slices/teacher-selection.slice.ts` | ~60 | Orphaned slice, no consumer |
| `src/features/schedule-arrangement/application/schemas/schedule-arrangement.schemas.ts` | ~40 | `batchArrangeSchedulesSchema` never referenced |

### 2.2 Management Legacy Modals

All replaced by MUI Dialog / DataGrid inline editing:

| Domain | Dead Files |
|--------|-----------|
| **Teacher** | `AddModalForm.tsx`, `EditModalForm.tsx`, `ConfirmDeleteModal.tsx`, `TableRow.tsx`, `TeacherTable.tsx` |
| **Subject** | `AddModalForm.tsx`, `EditModalForm.tsx`, `ConfirmDeleteModal.tsx`, `TableRow.tsx`, `ActivityTable.tsx` |
| **Rooms** | `AddModalForm.tsx`, `EditModalForm.tsx`, `ConfirmDeleteModal.tsx`, `TableRow.tsx` |
| **GradeLevel** | `AddModalForm.tsx`, `EditModalForm.tsx`, `ConfirmDeleteModal.tsx`, `TableRow.tsx`, `GradeLevelTable.tsx` |
| **Program** | `ProgramEditableTable.tsx`, `EditStudyProgramModalLegacy.tsx`, `ProgramTable.tsx`, `AddStudyProgramModal.tsx`, `EditStudyProgramModal.tsx`, `DeleteProgramModal.tsx`, `StudyProgramLabel.tsx`, `YearSemester.tsx` |

### 2.3 Approach

- Delete all in a single commit: `chore: remove ~4000 LOC of dead legacy code`
- Run `pnpm tsc --noEmit` and `pnpm lint` after to confirm nothing breaks
- Let CI validate

---

## Section 3: Type Safety & Architecture

### 3.1 Remove `as any` / `as never` / `as unknown as` Casts

| Fix | File | Current | Replacement |
|-----|------|---------|-------------|
| Undo/Redo store | `arrangement-ui.store.ts` L465, L488 | `return state as any` | Properly type temporal state snapshots with `Partial<ArrangementUIState>` |
| Semester enum | `AddSubjectModal.tsx` L169 | `` `SEMESTER_${semester}` as any `` | Typed helper `toSemesterEnum(semester)` |
| Lock cast | `LockSchedule.tsx` L155 | `selectedLock as any` | Define `SelectedLockData` type |
| Config JSON | `config/page.tsx` L88 | `Config as Record<string, any>` | Define `TableConfig` interface |
| MUI handler | `BreakSlotSelect.tsx` L63 | `handleChange as any` | Type with `SelectChangeEvent<string>` |
| Semester string | `schedule.repository.ts` L56 | `semesterValue as semester` | Use `$Enums.semester` with validation |
| Status/kind | `email-outbox/page.tsx` L40-41 | `as never` | Validate search params with Valibot |
| GradeLevel row | `GradeLevelTable.tsx` L55 | `row as unknown as { program? }` | `Prisma.gradelevelGetPayload<{ include: { program: true } }>` |
| Program track | `ProgramEditableTable.tsx` L113 | `"GENERAL" as unknown as ProgramTrack` | `$Enums.ProgramTrack.GENERAL` |
| Error extraction | `DeleteProgramModal.tsx` L34 | `result.error as unknown as Error` | Type `ActionResult.error` as `string` consistently |

### 3.2 Move Direct Prisma Calls to Repository Layer

| File | Current | Fix |
|------|---------|-----|
| `email-outbox/page.tsx` | `prisma.emailOutbox.findMany()` | Create `email.repository.ts` → `findOutboxEmails()` |
| `program/page.tsx` | `prisma.program.groupBy()` | Add `getDistinctYears()` to `program.repository.ts` |
| `program/year/[year]/page.tsx` | `prisma.program.findMany()` | Add `findByYear()` to `program.repository.ts` |

### 3.3 Replace Raw `fetch()` with Server Actions

| File | Endpoint | Fix |
|------|----------|-----|
| `@grid/page.tsx` L165 | `POST /api/schedule/validate-drop` | Create `validateDropAction()` |
| `HeaderClient.tsx` L89 | `POST /api/schedule/auto-arrange` | Create `autoArrangeAction()` |
| `RoomSelectionContent.tsx` L56 | `GET /api/rooms/available` | Create `getAvailableRoomsAction()` |

### 3.4 Add Error Boundaries

Add `error.tsx` to these route segments:

- `src/app/management/teacher/error.tsx`
- `src/app/management/subject/error.tsx`
- `src/app/management/rooms/error.tsx`
- `src/app/management/gradelevel/error.tsx`
- `src/app/management/program/error.tsx`
- `src/app/schedule/[academicYear]/[semester]/arrange/error.tsx`
- `src/app/schedule/[academicYear]/[semester]/assign/error.tsx`

#### Error Page Behavior

Each `error.tsx` classifies the error and renders accordingly:

| Category | Example | Retryable? | UI |
|----------|---------|------------|-----|
| Network/Transient | DB timeout, fetch failed | Yes | "ลองใหม่" button |
| Not Found | Invalid URL params | No | "ไม่พบข้อมูล" + "กลับหน้าหลัก" link |
| Auth/Permission | Session expired | No | "กรุณาเข้าสู่ระบบใหม่" + redirect |
| Data Integrity | FK violation | No | "ข้อมูลไม่ถูกต้อง" + "กลับหน้าก่อนหน้า" |
| Unknown | Runtime crash | Maybe | Both "ลองใหม่" and "กลับหน้าหลัก" |

Error detail shown in collapsible section, sanitized (strips DB/Prisma internals). Full stack trace visible only in `NODE_ENV === 'development'`.

### 3.5 Fix `window.history.pushState` Bypass

- **File:** `ShowTeacherData.tsx` L203
- **Fix:** Use `useRouter().push()` or `useRouter().replace()` from `next/navigation`

---

## Section 4: UX Consistency

### 4.1 Replace `window.confirm()` with MUI Dialog

- **File:** `QuickAssignmentPanel.tsx` L343
- **Fix:** Use existing `useConfirmDialog` hook or MUI `<Dialog>` with "ยืนยันการลบ" / "ยกเลิก"

### 4.2 Fix English Labels in ActivityModal

- **File:** `ActivityModal.tsx` L91-93
- `"Edit Activity"` → `"แก้ไขกิจกรรม"`
- `"Add Activity"` → `"เพิ่มกิจกรรม"`
- `"Subject code and name are required."` → `"กรุณากรอกรหัสวิชาและชื่อวิชา"`

### 4.3 Hide Save/Undo/Redo Buttons

- **File:** `HeaderClient.tsx` L219-224
- **Fix:** Hide entirely with code comment explaining they're planned. Re-enable when store supports undo/redo.

### 4.4 Consistent Empty States with Actions

- **Problem:** Rooms and GradeLevel show generic empty state with no action button after deleting all items
- **Fix:** Add "เพิ่มห้องเรียน" / "เพิ่มระดับชั้น" buttons linking to the add dialog

### 4.5 Replace Full-Table Skeleton with Subtle Loading

- **Problem:** All `*ManageClient` components replace visible data with `<TableSkeleton>` during mutation
- **Fix:** Show `<LinearProgress>` at top of table during mutation; keep data visible

### 4.6 Remove Arbitrary 1s setTimeout

- **File:** `@grid/page.tsx` L236
- **Fix:** Call `mutate()` immediately in server action's `.then()` callback

---

## Section 5: Accessibility

### 5.1 ARIA Labels on Interactive Elements

Add `aria-label` to all interactive elements across schedule and management pages:

- Edit/delete icon buttons: `aria-label="แก้ไขครู"`, `aria-label="ลบวิชา"`
- Search inputs: `aria-label="ค้นหาครู"`
- Dropdown selectors
- Timetable grid cells: `aria-label="คาบที่ 1 วันจันทร์"`

### 5.2 Keyboard Navigation for Timetable Grid

- Add `role="grid"` to timetable container
- Add `role="gridcell"` to each cell
- Enable arrow key navigation between cells
- Configure DnD Kit `KeyboardSensor` with proper `coordinateGetter`

### 5.3 Focus Trapping in Custom Modals

- Wrap remaining in-use custom modals with MUI `<FocusTrap>`
- Add `Escape` key handler to close
- Or migrate to `<Dialog>` component

### 5.4 Live Regions for Feedback

Add `aria-live="polite"` to:

- Conflict warning areas in arrange page
- Success/error feedback after CRUD operations
- Schedule count updates

---

## Section 6: Performance

### 6.1 Fetch Single Teacher Instead of All

- **File:** `useTeacherSchedule.ts` L152
- **Problem:** `getTeachersAction({})` fetches entire teacher table to find one
- **Fix:** Create `getTeacherByIdAction(id)` that queries by primary key

### 6.2 Consolidate SWR Queries

- **File:** `useTeacherSchedule.ts`
- **Problem:** 5 independent SWR hooks that waterfall
- **Fix:** Create `getTeacherScheduleDataAction(teacherId, configId)` returning all data in one round-trip

---

## Testing Strategy

- **Unit tests:** For new server actions (`validateDropAction`, `autoArrangeAction`, `getAvailableRoomsAction`, `getTeacherByIdAction`), repository methods, and error classification logic
- **E2E tests:** Verify error boundaries render correctly, confirm dialog replacements work, ARIA attributes present
- **CI validation:** Every commit must pass `pnpm lint`, `pnpm tsc --noEmit`, and `pnpm test`
- **Manual testing:** DnD behavior after removing duplicate context, keyboard navigation in grid

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Removing dead code breaks an obscure import | Build failure | Run `tsc --noEmit` before committing; CI catches any miss |
| DndContext removal changes drag behavior | Schedule arrangement broken | Test thoroughly in dev; have rollback commit ready |
| Error boundary catches too broadly | Swallows actionable errors | Keep boundaries at route-segment level only, not component level |
| Repository migration changes query behavior | Data regressions | Match existing Prisma `include`/`select` exactly; add unit tests |
| ARIA additions cause MUI rendering issues | Visual regressions | Visual E2E tests already exist; run after changes |

---

## Out of Scope

- New features (real-time collaboration, Storybook, Sentry)
- MOE curriculum logic changes
- Auth/permission model changes
- Database schema migrations
- Legacy modal migration to MUI Dialog (already dead code — just delete)
