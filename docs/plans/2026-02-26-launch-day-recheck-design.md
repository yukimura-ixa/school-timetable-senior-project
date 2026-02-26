# Launch Day Recheck — Design Document

**Date:** 2026-02-26  
**Approach:** A — User-Facing First  
**Scope:** Full production quality pass before real school users (students, parents, public) arrive  
**Timeline:** ~3 weeks, 3 phases  

---

## Context

The Phrasongsa Timetable app launched January 8, 2026. Real school users (students, parents via public page; teacher as admin) will arrive within 3+ weeks. A comprehensive audit uncovered 23 issues across data safety, Thai UX, production stability, and developer experience.

### User Roles

- **Teacher** = school admin (single user managing the system)
- **Students / Parents** = public page viewers (the primary user-facing surface)

### Audit Summary

| Category | Count | Examples |
|----------|:-----:|---------|
| Public page English strings | 16 | aria-labels, button text, tab labels |
| Admin English error messages | 6 | "Update failed", "Failed to sync" |
| `window.confirm()` native dialogs | 4 | TeacherAssignment, SubjectAssignment, QuickAssignment |
| `window.location.reload()` | 5 | TeacherAssignment, SubjectAssignment, ConfirmDelete |
| `window.history.pushState` bypass | 2 | ShowTeacherData |
| Non-atomic data operation | 1 | QuickAssignmentPanel delete+create |
| Raw `fetch()` (should be server actions) | 5 | HeaderClient, @grid/page, student-table |
| Missing `loading.tsx` | 8 | assign, config, analytics, all-program, auth pages |
| Missing `error.tsx` | 4 | email-outbox, teacher-assignment, lock, config |
| Console statement cleanup | ~78 | Debug logs, raw console.error instead of logger |
| Dead files | 5 | Duplicate all-timeslot/, .backup, .disabled, empty dir |
| Dependency issues | 4 | Unused zod, vercel in prod deps, unpinned version |
| Lint scope gap | 1 | Missing src/app/, src/components/, etc. |
| Env file clutter | 3 | Redundant .env.example, dead .env.local.disabled, speculative prod sections |
| CSP/config concerns | 3 | unsafe-eval, connect-src, cacheComponents |

---

## Phase 1: Public Page & Thai UX Polish (Week 1)

### 1.1 Translate Public Page Strings

**Files:**
- `src/app/(public)/_components/DataTableSection.tsx`
- `src/app/(public)/_components/TablePagination.tsx`
- `src/app/(public)/_components/TableSearch.tsx`

| Current | Replacement |
|---------|-------------|
| `aria-label="Pagination"` | `aria-label="การแบ่งหน้า"` |
| `Previous` / `aria-label="Previous page"` | `ก่อนหน้า` / `aria-label="หน้าก่อนหน้า"` |
| `Next` / `aria-label="Next page"` | `ถัดไป` / `aria-label="หน้าถัดไป"` |
| `` aria-label={`Page ${page}`} `` | `` aria-label={`หน้า ${page}`} `` |
| `aria-label="Search"` | `aria-label="ค้นหา"` |
| `aria-label="Clear search"` | `aria-label="ล้างการค้นหา"` |
| Tab: `"ครู (Teachers)"` | `"ครู"` |
| Tab: `"ชั้นเรียน (Classes)"` | `"ชั้นเรียน"` |

**Shared components:**
- `src/components/mui/SearchBar.tsx`: `"clear search"` → `"ล้างการค้นหา"`
- `src/components/templates/Navbar.tsx`: `alt="profile_pic"` → `alt="รูปโปรไฟล์"`

### 1.2 Translate Admin Error Messages

4 DataGrid files — change `"Update failed"` → `"บันทึกไม่สำเร็จ"`:
- `src/app/management/teacher/component/TeacherDataGrid.tsx` L197
- `src/app/management/subject/component/SubjectDataGrid.tsx` L239
- `src/app/management/gradelevel/component/GradeLevelDataGrid.tsx` L259
- `src/app/management/program/component/ProgramDataGrid.tsx` L201

QuickAssignmentPanel English strings:
- `"Failed to sync assignments"` → `"ซิงค์การมอบหมายไม่สำเร็จ"`
- `"Failed to update assignment"` → `"แก้ไขการมอบหมายไม่สำเร็จ"`

### 1.3 Replace `window.confirm()` with MUI ConfirmDialog

4 call sites across 3 files:
- `TeacherAssignmentPage.tsx` L43 (copy from previous semester) and L91 (clear all)
- `SubjectAssignmentTable.tsx` L135 (unassign teacher)
- `QuickAssignmentPanel.tsx` L337 (delete subject)

Use existing `ConfirmDialog` component (Thai defaults already: ยืนยัน / ยกเลิก). Add `useState` for dialog open/close + pending action pattern.

### 1.4 Replace `window.location.reload()` with Proper Revalidation

5 call sites across 3 files:
- `TeacherAssignmentPage.tsx` L74 (after copy) and L113 (after clear)
- `SubjectAssignmentTable.tsx` L124 (after assign) and L143 (after unassign)
- `ConfirmDeleteModal.tsx` L56 (after config delete)

Replace with `router.refresh()` or SWR `mutate()` depending on data source.

### 1.5 Fix `window.history.pushState` in ShowTeacherData

`src/app/schedule/[academicYear]/[semester]/assign/component/ShowTeacherData.tsx` L206-210.

Replace 2 `pushState` calls with Next.js `useRouter().push()` or `useSearchParams` + `usePathname` approach.

---

## Phase 2: Data Safety & Stability (Week 2)

### 2.1 Non-Atomic Edit in QuickAssignmentPanel (P0)

**File:** `src/app/schedule/[academicYear]/[semester]/assign/component/QuickAssignmentPanel.tsx`

**Problem:** `handleSaveEdit` L234-330 uses "Delete + Create" strategy. If sync call fails mid-way, data is lost.

**Fix:** Wrap the server action's underlying Prisma operations in `$transaction` so delete+create is atomic at the DB level. UI code stays the same.

### 2.2 Replace Raw `fetch()` with Server Actions

| File | Endpoint | Action |
|------|----------|--------|
| `HeaderClient.tsx` L83 | `POST /api/schedule/auto-arrange` | Create `autoArrangeAction` |
| `@grid/page.tsx` L209 | `POST /api/schedule/validate-drop` | Create `validateDropAction` |
| `@grid/page.tsx` L166, L179 | `GET /api/timeslots`, `GET /api/schedule/teacher/:id` | Keep as SWR+API (GET endpoints work correctly) — add error handling |
| `student-table/page.tsx` L282 | `POST /api/export/student-timetable/pdf` | Keep as `fetch()` (PDF blob download) — add error handling |

### 2.3 Add Missing Route Boundaries

**8 missing `loading.tsx`:**

| Route | Skeleton Pattern |
|-------|-----------------|
| `schedule/.../assign` | Sidebar + grid (reuse `TimetableGridSkeleton`) |
| `schedule/.../config` | Form card with 4 field placeholders |
| `dashboard/.../analytics` | 3 summary cards + chart placeholder |
| `dashboard/.../all-program` | Title + table (header + 5 rows) |
| `management/teacher-assignment` | Grade selector + assignment table skeleton |
| `signin` | Centered card with form fields |
| `forgot-password` | Centered card with email field |
| `reset-password` | Centered card with password fields |

**4 missing `error.tsx`:**

All use existing `RouteErrorFallback` component:
- `management/email-outbox`
- `management/teacher-assignment`
- `schedule/.../lock`
- `schedule/.../config`

### 2.4 Clean Up Console Statements

| Category | Action |
|----------|--------|
| Debug `console.warn` in `SubjectAssignmentTable.tsx` (3 calls) | Remove |
| Error `console.warn` in `src/lib/public/` data layer (5+ calls) | Replace with `logger.warn()` |
| Feature error handlers using raw `console.error` | Replace with `logger.error()` |
| Test file `console.log` | Remove |

---

## Phase 3: DX Cleanup & Maintenance (Week 3)

### 3.1 Remove Dead Files

| Item | LOC |
|------|-----|
| `src/app/dashboard/.../all-timeslot/all-timeslot/` (duplicate directory, 7 files) | ~665 |
| `src/app/signin/page.tsx.backup` | ~50 |
| `src/app/schedule/.../lock/component/EditLockScheduleModal.tsx.disabled` | ~80 |
| `src/app/design-system/` (empty directory) | 0 |

### 3.2 Dependency Cleanup

| Change | Rationale |
|--------|-----------|
| Remove `zod` | Zero imports — Valibot used everywhere |
| Move `vercel` CLI to devDependencies | CLI tool, not needed at runtime |
| Pin `next-devtools-mcp` version | `"latest"` is unpredictable |
| Verify `immer` placement | If Zustand uses at runtime, move from devDeps to deps |

### 3.3 Expand Lint Scope

Change `lint:eslint` from `"src/features/**" "src/lib/**" "src/types/**" "src/utils/**"` to `"src/**"`.

Run once, fix or inline-disable new errors, commit.

### 3.4 Fix Windows Compatibility

`test:e2e:prod` uses Unix `PROD_BUILD=true`. Replace with `cross-env`:
```
"test:e2e:prod": "pnpm build && cross-env PROD_BUILD=true node scripts/run-e2e-tests.mjs"
```

### 3.5 Remove Debug E2E Specs

Delete:
- `e2e/debug-activitytype.spec.ts`
- `e2e/debug-combobox.spec.ts`
- `e2e/debug-full-fill.spec.ts`

### 3.6 Deduplicate Package Scripts

- Remove `test:unit` (identical to `test`)
- Remove `test:unit:watch` (identical to `test:watch`)

### 3.7 Review CSP Headers

| Item | Action |
|------|--------|
| `'unsafe-eval'` in CSP | Investigate if removable; if not, document why |
| `connect-src 'self'` | Add Vercel analytics domains if those services are active |
| `cacheComponents: false` | Verify if intentional or leftover debug config |

### 3.8 Add Missing Test Scripts

```json
"test:actions": "vitest run -c vitest.actions.config.ts",
"test:stores": "vitest run -c vitest.store.config.ts"
```

### 3.9 Environment File Cleanup

**Delete:**
- `.env.example` (redundant — `.env.local.example` and `.env.production.example` cover both cases)
- `.env.local.disabled` (dead file from security commit, cluttering filesystem)

**Trim `.env.production.example`:**
- Remove unused speculative sections: AWS S3, Cloudinary, Edge Config

**Consolidate documentation:**
- Move "Which env file to use" guide from `.env.example` into `.env.local.example` header

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Lint scope expansion surfaces many errors | Run lint first, count, fix incrementally |
| Removing `zod` breaks hidden dependency | Grep for `zod` imports before removing |
| CSP changes break Vercel analytics | Test in preview deployment first |
| `window.confirm` → ConfirmDialog changes state flow | Self-contained per component — test individually |
| SWR fetcher changes in `@grid/page.tsx` break DnD | Keep existing API routes for GET endpoints |
| Non-atomic fix changes data flow | Wrap in `$transaction` only — no UI changes |

---

## Testing Strategy

- **Phase 1:** Manual smoke test public page + admin CRUD after each commit. Run existing E2E suite for regression.
- **Phase 2:** Unit test the `$transaction` wrapper. E2E for schedule assignment flow. Verify loading skeletons render.
- **Phase 3:** `pnpm lint` after scope expansion. `pnpm build` after dependency changes. CI validates everything.

All phases: CI-first. Commit and push; let CI run. Debug locally only if CI fails.
