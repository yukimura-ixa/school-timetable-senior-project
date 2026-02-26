# Launch Day Recheck — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all overlooked issues before real school users arrive — Thai UX, data safety, stability, and DX cleanup.

**Architecture:** Three sequential phases: (1) public page & Thai UX polish, (2) data safety & stability, (3) DX cleanup. Each phase produces coherent commits that CI validates independently.

**Tech Stack:** Next.js 16 (App Router), TypeScript, MUI, Tailwind, SWR, Prisma, Vitest, Playwright

---

## Phase 1: Public Page & Thai UX Polish

### Task 1: Translate Public Page Strings to Thai

**Files:**
- Modify: `src/app/(public)/_components/DataTableSection.tsx`
- Modify: `src/app/(public)/_components/TablePagination.tsx`
- Modify: `src/app/(public)/_components/TableSearch.tsx`

**Step 1: Translate DataTableSection.tsx**

Apply these replacements in `src/app/(public)/_components/DataTableSection.tsx`:

| Line | Old | New |
|------|-----|-----|
| ~L145 | `"ครู (Teachers)"` | `"ครู"` |
| ~L168 | `"ชั้นเรียน (Classes)"` | `"ชั้นเรียน"` |
| ~L276 | `aria-label="Pagination"` | `aria-label="การแบ่งหน้า"` |
| ~L285 | `Previous` (button text) | `ก่อนหน้า` |
| ~L291 | `Next` (button text) | `ถัดไป` |
| ~L312 | `aria-label="Previous page"` | `aria-label="หน้าก่อนหน้า"` |
| ~L327 | `` aria-label={`Page ${page}`} `` | `` aria-label={`หน้า ${page}`} `` |
| ~L338 | `aria-label="Next page"` | `aria-label="หน้าถัดไป"` |

**Step 2: Translate TablePagination.tsx**

Apply these replacements in `src/app/(public)/_components/TablePagination.tsx`:

| Line | Old | New |
|------|-----|-----|
| ~L35 | `aria-label="Pagination"` | `aria-label="การแบ่งหน้า"` |
| ~L43 | `Previous` (button text) | `ก่อนหน้า` |
| ~L50 | `Next` (button text) | `ถัดไป` |
| ~L72 | `aria-label="Previous page"` | `aria-label="หน้าก่อนหน้า"` |
| ~L86 | `` aria-label={`Page ${page}`} `` | `` aria-label={`หน้า ${page}`} `` |
| ~L97 | `aria-label="Next page"` | `aria-label="หน้าถัดไป"` |

**Step 3: Translate TableSearch.tsx**

| Line | Old | New |
|------|-----|-----|
| ~L77 | `aria-label="Search"` | `aria-label="ค้นหา"` |
| ~L84 | `aria-label="Clear search"` | `aria-label="ล้างการค้นหา"` |

**Step 4: Verify** — Open the public page in browser. Inspect elements. Confirm no English strings remain in buttons, tabs, or aria-labels.

**Step 5: Commit**

```bash
git add src/app/\(public\)/_components/
git commit -m "i18n: translate public page strings from English to Thai"
```

---

### Task 2: Translate Shared Component Strings

**Files:**
- Modify: `src/components/mui/SearchBar.tsx`
- Modify: `src/components/templates/Navbar.tsx`
- Modify: `src/app/schedule/[academicYear]/[semester]/lock/component/LockSchedule.tsx`

**Step 1: Fix SearchBar.tsx**

In `src/components/mui/SearchBar.tsx` ~L156:
```
Old: aria-label="clear search"
New: aria-label="ล้างการค้นหา"
```

**Step 2: Fix Navbar.tsx**

In `src/components/templates/Navbar.tsx` ~L163:
```
Old: alt="profile_pic"
New: alt="รูปโปรไฟล์"
```

**Step 3: Fix LockSchedule.tsx aria-labels**

In `src/app/schedule/[academicYear]/[semester]/lock/component/LockSchedule.tsx`:
```
Old: aria-label="view mode"     → New: aria-label="โหมดมุมมอง"
Old: aria-label="calendar view" → New: aria-label="มุมมองปฏิทิน"
Old: aria-label="list view"     → New: aria-label="มุมมองรายการ"
```

**Step 4: Commit**

```bash
git add src/components/mui/SearchBar.tsx src/components/templates/Navbar.tsx src/app/schedule/*/[semester]/lock/component/LockSchedule.tsx
git commit -m "i18n: translate shared component strings to Thai"
```

---

### Task 3: Translate Admin Error Messages

**Files:**
- Modify: `src/app/management/teacher/component/TeacherDataGrid.tsx`
- Modify: `src/app/management/subject/component/SubjectDataGrid.tsx`
- Modify: `src/app/management/gradelevel/component/GradeLevelDataGrid.tsx`
- Modify: `src/app/management/program/component/ProgramDataGrid.tsx`
- Modify: `src/app/schedule/[academicYear]/[semester]/assign/component/QuickAssignmentPanel.tsx`

**Step 1: Fix all 4 DataGrid files**

In each DataGrid file, replace:
```
Old: "Update failed"
New: "บันทึกไม่สำเร็จ"
```

Exact locations:
- `TeacherDataGrid.tsx` ~L197
- `SubjectDataGrid.tsx` ~L239
- `GradeLevelDataGrid.tsx` ~L259
- `ProgramDataGrid.tsx` ~L201

**Step 2: Fix QuickAssignmentPanel.tsx**

Two English error strings:
```
Old: "Failed to sync assignments"    → New: "ซิงค์การมอบหมายไม่สำเร็จ"
Old: "Failed to update assignment"   → New: "แก้ไขการมอบหมายไม่สำเร็จ"
```

Locations: ~L200 and ~L315.

**Step 3: Commit**

```bash
git add src/app/management/*/component/*DataGrid.tsx src/app/schedule/*/[semester]/assign/component/QuickAssignmentPanel.tsx
git commit -m "i18n: translate admin error messages from English to Thai"
```

---

### Task 4: Replace `window.confirm()` in TeacherAssignmentPage

**Files:**
- Modify: `src/features/teaching-assignment/presentation/components/TeacherAssignmentPage.tsx`

The component already imports MUI. We need to add the ConfirmDialog.

**Step 1: Add imports and state**

Add to imports:
```tsx
import { useConfirmDialog } from "@/components/dialogs/ConfirmDialog";
```

Add inside the component, after existing state declarations:
```tsx
const { confirm, dialog } = useConfirmDialog();
```

**Step 2: Replace `handleCopyFromPrevious` window.confirm**

Replace (~L43-45):
```tsx
// Old:
const confirmed = window.confirm(
  `คัดลอกการมอบหมายครูจากภาคเรียนก่อนหน้าไปยัง ${gradeId} - ${...}/${academicYear}?\n\nการดำเนินการนี้จะเพิ่มการมอบหมายใหม่โดยไม่ลบข้อมูลเดิม`
);

// New:
const confirmed = await confirm({
  title: "คัดลอกการมอบหมายครู",
  message: `คัดลอกการมอบหมายครูจากภาคเรียนก่อนหน้าไปยัง ${gradeId} - ${semester}/${academicYear}?\n\nการดำเนินการนี้จะเพิ่มการมอบหมายใหม่โดยไม่ลบข้อมูลเดิม`,
  variant: "info",
});
```

**Step 3: Replace `handleClearAll` window.confirm**

Replace (~L91-93):
```tsx
// Old:
const confirmed = window.confirm(
  `⚠️ ต้องการลบการมอบหมายครูทั้งหมดใน ${gradeId} - ${...}/${academicYear}?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้!`
);

// New:
const confirmed = await confirm({
  title: "ลบการมอบหมายครูทั้งหมด",
  message: `ต้องการลบการมอบหมายครูทั้งหมดใน ${gradeId} - ${semester}/${academicYear}?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้!`,
  variant: "danger",
});
```

**Step 4: Add dialog to JSX**

Add `{dialog}` just before the closing `</>` or `</Container>` of the component's return.

**Step 5: Verify** — Navigate to teacher assignment page, click copy and clear buttons, confirm dialog appears with Thai text and styled buttons.

**Step 6: Commit**

```bash
git add src/features/teaching-assignment/presentation/components/TeacherAssignmentPage.tsx
git commit -m "ux: replace window.confirm with MUI ConfirmDialog in TeacherAssignmentPage"
```

---

### Task 5: Replace `window.confirm()` in SubjectAssignmentTable

**Files:**
- Modify: `src/features/teaching-assignment/presentation/components/SubjectAssignmentTable.tsx`

**Step 1: Add import and hook**

```tsx
import { useConfirmDialog } from "@/components/dialogs/ConfirmDialog";
// Inside component:
const { confirm, dialog } = useConfirmDialog();
```

**Step 2: Replace handleUnassign window.confirm (~L135)**

```tsx
// Old:
if (!window.confirm("ต้องการยกเลิกการมอบหมายครูนี้?")) return;

// New:
const confirmed = await confirm({
  title: "ยกเลิกการมอบหมายครู",
  message: "ต้องการยกเลิกการมอบหมายครูนี้?",
  variant: "warning",
});
if (!confirmed) return;
```

Ensure `handleUnassign` is `async`.

**Step 3: Add `{dialog}` to JSX return**

**Step 4: Commit**

```bash
git add src/features/teaching-assignment/presentation/components/SubjectAssignmentTable.tsx
git commit -m "ux: replace window.confirm with MUI ConfirmDialog in SubjectAssignmentTable"
```

---

### Task 6: Replace `confirm()` in QuickAssignmentPanel

**Files:**
- Modify: `src/app/schedule/[academicYear]/[semester]/assign/component/QuickAssignmentPanel.tsx`

**Step 1: Add import and hook**

```tsx
import { useConfirmDialog } from "@/components/dialogs/ConfirmDialog";
// Inside component:
const { confirm, dialog } = useConfirmDialog();
```

**Step 2: Replace handleDelete confirm (~L337-339)**

```tsx
// Old:
if (!confirm(`ต้องการลบวิชา ${assignment.SubjectCode} - ${assignment.SubjectName} ใช่หรือไม่?`)) return;

// New:
const confirmed = await confirm({
  title: "ลบวิชา",
  message: `ต้องการลบวิชา ${assignment.SubjectCode} - ${assignment.SubjectName} ใช่หรือไม่?`,
  variant: "danger",
});
if (!confirmed) return;
```

Ensure `handleDelete` is `async`.

**Step 3: Add `{dialog}` to JSX return**

**Step 4: Commit**

```bash
git add src/app/schedule/*/[semester]/assign/component/QuickAssignmentPanel.tsx
git commit -m "ux: replace window.confirm with MUI ConfirmDialog in QuickAssignmentPanel"
```

---

### Task 7: Replace `window.location.reload()` in TeacherAssignmentPage

**Files:**
- Modify: `src/features/teaching-assignment/presentation/components/TeacherAssignmentPage.tsx`

**Step 1: Add router import**

```tsx
import { useRouter } from "next/navigation";
// Inside component:
const router = useRouter();
```

**Step 2: Replace both reload() calls**

L74 and L113 — replace:
```tsx
// Old:
window.location.reload();

// New:
router.refresh();
```

**Step 3: Commit**

```bash
git add src/features/teaching-assignment/presentation/components/TeacherAssignmentPage.tsx
git commit -m "fix: replace window.location.reload with router.refresh in TeacherAssignmentPage"
```

---

### Task 8: Replace `window.location.reload()` in SubjectAssignmentTable

**Files:**
- Modify: `src/features/teaching-assignment/presentation/components/SubjectAssignmentTable.tsx`

**Step 1: Add router import (if not already present)**

```tsx
import { useRouter } from "next/navigation";
const router = useRouter();
```

**Step 2: Replace both reload() calls (L124 and L143)**

```tsx
// Old: window.location.reload();
// New: router.refresh();
```

**Step 3: Also replace `alert()` calls with `enqueueSnackbar` or error state**

If MUI notistack is available, use it. If not, use the existing `setError()` state. Check what the component already uses.

**Step 4: Commit**

```bash
git add src/features/teaching-assignment/presentation/components/SubjectAssignmentTable.tsx
git commit -m "fix: replace window.location.reload with router.refresh in SubjectAssignmentTable"
```

---

### Task 9: Replace `window.location.reload()` in Config ConfirmDeleteModal

**Files:**
- Modify: `src/app/schedule/[academicYear]/[semester]/config/component/ConfirmDeleteModal.tsx`

**Step 1: Replace reload with mutate + closeModal**

The component already receives `mutate` prop. Replace L56:
```tsx
// Old:
window.location.reload();

// New:
mutate();
closeModal("success");
```

`mutate()` triggers SWR revalidation. `closeModal` already handles closing. No full page reload needed.

**Step 2: Commit**

```bash
git add src/app/schedule/*/[semester]/config/component/ConfirmDeleteModal.tsx
git commit -m "fix: replace window.location.reload with SWR mutate in config ConfirmDeleteModal"
```

---

### Task 10: Replace `window.history.pushState` in ShowTeacherData

**Files:**
- Modify: `src/app/schedule/[academicYear]/[semester]/assign/component/ShowTeacherData.tsx`

**Step 1: Check if useRouter is already imported**

If not, add:
```tsx
import { useRouter } from "next/navigation";
const router = useRouter();
```

**Step 2: Replace pushState calls (~L206-210)**

```tsx
// Old:
if (value) {
  const newUrl = `${pathName}?TeacherID=${value.TeacherID}`;
  window.history.pushState(null, "", newUrl);
} else {
  window.history.pushState(null, "", pathName);
}

// New:
if (value) {
  router.push(`${pathName}?TeacherID=${value.TeacherID}`, { scroll: false });
} else {
  router.push(pathName, { scroll: false });
}
```

Note: `{ scroll: false }` prevents the page from scrolling to top on navigation. This matches the `pushState` behavior.

**Caveat:** `router.push` triggers a server component re-render. The original `pushState` was intentionally avoiding this (comment says "without triggering server component refresh"). If this causes performance issues, we may need to keep `pushState` but wrap it properly. Test this carefully — if teacher select becomes noticeably slower, revert and document.

**Step 3: Commit**

```bash
git add src/app/schedule/*/[semester]/assign/component/ShowTeacherData.tsx
git commit -m "fix: replace window.history.pushState with Next.js router.push in ShowTeacherData"
```

---

## Phase 2: Data Safety & Stability

### Task 11: Verify Non-Atomic Edit is Already Safe

**Files:**
- Read: `src/features/assign/application/actions/assign.actions.ts`

**Step 1: Read and verify `syncAssignmentsAction`**

The audit found this already uses `withPrismaTransaction`. Verify:
1. Open `src/features/assign/application/actions/assign.actions.ts`
2. Confirm `syncAssignmentsAction` wraps all DB operations in `withPrismaTransaction(async (tx) => { ... })`
3. Confirm both create and delete loops use `tx.` prefix (not raw `prisma.`)

**Step 2: If confirmed safe, no code changes needed**

Update the design doc to note this was already resolved.

**Step 3: Commit (docs only if needed)**

```bash
git commit --allow-empty -m "verify: syncAssignmentsAction already uses $transaction (no change needed)"
```

---

### Task 12: Convert `autoArrangeAction` from raw fetch to server action

**Files:**
- Modify: `src/app/schedule/[academicYear]/[semester]/arrange/@header/_components/HeaderClient.tsx`
- Check: `src/app/api/schedule/auto-arrange/route.ts` — read the existing API route to understand what it does

**Step 1: Check if a server action equivalent already exists**

Search for `autoArrange` in `src/features/`. If a server action exists, use it. If not, create one that wraps the same logic.

**Step 2: Replace fetch call (~L83)**

```tsx
// Old:
const response = await fetch("/api/schedule/auto-arrange", { method: "POST", body: JSON.stringify(...) });

// New:
const result = await autoArrangeAction(...);
```

**Step 3: Handle error/success with existing snackbar pattern**

**Step 4: Commit**

```bash
git add src/app/schedule/*/[semester]/arrange/@header/_components/HeaderClient.tsx
git commit -m "refactor: replace raw fetch with server action for auto-arrange"
```

---

### Task 13: Convert `validateDropAction` from raw fetch to server action

**Files:**
- Modify: `src/app/schedule/[academicYear]/[semester]/arrange/@grid/page.tsx`
- Check: `src/app/api/schedule/validate-drop/route.ts`

**Step 1: Read the existing validate-drop API route**

**Step 2: Create server action if needed, or find existing one**

**Step 3: Replace fetch call (~L209)**

**Step 4: Commit**

```bash
git add src/app/schedule/*/[semester]/arrange/@grid/page.tsx
git commit -m "refactor: replace raw fetch with server action for validate-drop"
```

---

### Task 14: Add error handling to remaining fetch calls

**Files:**
- Modify: `src/app/schedule/[academicYear]/[semester]/arrange/@grid/page.tsx` (SWR fetchers at L166, L179)
- Modify: `src/app/dashboard/[academicYear]/[semester]/student-table/page.tsx` (PDF export at L282)

**Step 1: Add SWR error handling to timeslot and teacher schedule fetchers**

Ensure the SWR `onError` callback is defined and shows a user-friendly Thai error via snackbar or error state.

**Step 2: Add try/catch and Thai error message to PDF export fetch**

```tsx
try {
  const response = await fetch("/api/export/student-timetable/pdf", { ... });
  if (!response.ok) throw new Error("ส่งออก PDF ไม่สำเร็จ");
  // ... existing blob handling
} catch (error) {
  enqueueSnackbar("ส่งออก PDF ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", { variant: "error" });
}
```

**Step 3: Commit**

```bash
git add src/app/schedule/*/[semester]/arrange/@grid/page.tsx src/app/dashboard/*/[semester]/student-table/page.tsx
git commit -m "fix: add error handling to remaining fetch calls"
```

---

### Task 15: Add missing error.tsx boundaries (4 routes)

**Files:**
- Create: `src/app/management/email-outbox/error.tsx`
- Create: `src/app/management/teacher-assignment/error.tsx`
- Create: `src/app/schedule/[academicYear]/[semester]/lock/error.tsx`
- Create: `src/app/schedule/[academicYear]/[semester]/config/error.tsx`

**Step 1: Create all 4 files following the established pattern**

Each file follows the same template (only `context` changes):

```tsx
"use client";
import RouteErrorFallback from "@/components/error/RouteErrorFallback";

export default function [Name]Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorFallback error={error} reset={reset} context="[Thai context]" />;
}
```

Context values:
- email-outbox: `"อีเมล"`
- teacher-assignment: `"การมอบหมายครู"`
- lock: `"ล็อคตารางสอน"`
- config: `"ตั้งค่าตารางสอน"`

**Step 2: Commit**

```bash
git add src/app/management/email-outbox/error.tsx src/app/management/teacher-assignment/error.tsx src/app/schedule/*/[semester]/lock/error.tsx src/app/schedule/*/[semester]/config/error.tsx
git commit -m "feat: add error.tsx boundaries to 4 remaining routes"
```

---

### Task 16: Add missing loading.tsx skeletons (8 routes)

**Files:**
- Create: `src/app/schedule/[academicYear]/[semester]/assign/loading.tsx`
- Create: `src/app/schedule/[academicYear]/[semester]/config/loading.tsx`
- Create: `src/app/dashboard/[academicYear]/[semester]/analytics/loading.tsx`
- Create: `src/app/dashboard/[academicYear]/[semester]/all-program/loading.tsx`
- Create: `src/app/management/teacher-assignment/loading.tsx`
- Create: `src/app/signin/loading.tsx`
- Create: `src/app/forgot-password/loading.tsx`
- Create: `src/app/reset-password/loading.tsx`

**Step 1: Create each file**

Follow the established pattern — pure Tailwind, `animate-pulse`, gray placeholder blocks mimicking actual page layouts. No `"use client"` needed.

Skeleton structures per route:

**assign/loading.tsx** — Sidebar (h-full w-80) + TimetableGridSkeleton
**config/loading.tsx** — Card with 4 form field placeholders (h-10 w-full)
**analytics/loading.tsx** — 3 stat cards (h-24 w-1/3) + large chart area (h-64)
**all-program/loading.tsx** — Title bar + table skeleton (header + 5 rows × 4 cols)
**teacher-assignment/loading.tsx** — Grade selector (h-14) + table skeleton (header + 6 rows)
**signin/loading.tsx** — Centered card (max-w-md) with 2 input fields + button
**forgot-password/loading.tsx** — Centered card with 1 input field + button
**reset-password/loading.tsx** — Centered card with 2 input fields + button

**Step 2: Commit**

```bash
git add src/app/schedule/*/[semester]/assign/loading.tsx src/app/schedule/*/[semester]/config/loading.tsx src/app/dashboard/*/[semester]/analytics/loading.tsx src/app/dashboard/*/[semester]/all-program/loading.tsx src/app/management/teacher-assignment/loading.tsx src/app/signin/loading.tsx src/app/forgot-password/loading.tsx src/app/reset-password/loading.tsx
git commit -m "feat: add loading.tsx skeletons to 8 remaining routes"
```

---

### Task 17: Clean up console statements

**Files:**
- Modify: `src/features/teaching-assignment/presentation/components/SubjectAssignmentTable.tsx`
- Modify: `src/lib/public/teachers.ts`
- Modify: Other files with raw `console.error` in catch blocks

**Step 1: Remove debug console.warn from SubjectAssignmentTable.tsx**

Delete lines ~L62, ~L82-83, ~L94 (`console.warn("[SubjectAssignmentTable]...")`)

**Step 2: Replace console.warn in public data layer with logger**

In `src/lib/public/teachers.ts`, replace 5 `console.warn` calls with `logger.warn`:

```tsx
// Add at top:
import { createLogger } from "@/lib/logger";
const logger = createLogger("PublicTeachers");

// Replace each:
// Old: console.warn("[PublicTeachers] getCurrentTermInfo error:", (err as Error).message)
// New: logger.warn("getCurrentTermInfo error", { error: (err as Error).message })
```

**Step 3: Search for other console.warn/error in src/ that should use logger**

```bash
grep -rn "console\.\(warn\|error\)" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v ".test." | grep -v "logger.ts" | grep -v "client-logger.ts"
```

For each hit, determine if it should be replaced with logger or removed.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: clean up console statements, use structured logger"
```

---

## Phase 3: DX Cleanup & Maintenance

### Task 18: Remove dead files

**Step 1: Delete duplicate all-timeslot directory**

```bash
rm -rf src/app/dashboard/\[academicYear\]/\[semester\]/all-timeslot/all-timeslot/
```

**Step 2: Delete other dead files**

```bash
rm src/app/signin/page.tsx.backup
rm src/app/schedule/\[academicYear\]/\[semester\]/lock/component/EditLockScheduleModal.tsx.disabled
rm -rf src/app/design-system/
```

**Step 3: Build to verify nothing breaks**

```bash
pnpm build
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove dead files (~700 LOC)"
```

---

### Task 19: Dependency cleanup

**Step 1: Verify zod has no imports**

```bash
grep -rn "from ['\"]zod" src/ --include="*.ts" --include="*.tsx"
```

Expected: no results.

**Step 2: Remove zod, move vercel to devDependencies**

```bash
pnpm remove zod
pnpm remove vercel && pnpm add -D vercel
```

**Step 3: Pin next-devtools-mcp**

In `package.json`, replace `"next-devtools-mcp": "latest"` with a pinned version. Check current installed version with `pnpm list next-devtools-mcp` and pin that.

**Step 4: Verify immer is correctly placed**

```bash
grep -rn "from ['\"]immer" src/ --include="*.ts" --include="*.tsx"
```

If used at runtime (not just in tests), move to dependencies. Otherwise keep in devDependencies.

**Step 5: Install and build**

```bash
pnpm install
pnpm build
```

**Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: remove unused zod, move vercel to devDeps, pin versions"
```

---

### Task 20: Expand lint scope

**Step 1: Update lint:eslint in package.json**

```json
// Old:
"lint:eslint": "eslint \"src/features/**\" \"src/lib/**\" \"src/types/**\" \"src/utils/**\" --ext .ts,.tsx --report-unused-disable-directives"

// New:
"lint:eslint": "eslint \"src/**\" --ext .ts,.tsx --report-unused-disable-directives"
```

**Step 2: Run lint and count errors**

```bash
pnpm lint 2>&1 | tail -5
```

**Step 3: Fix or inline-disable new errors**

If < 20 errors, fix them. If > 20, batch suppress with inline comments and create a follow-up TODO.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: expand lint scope to cover all of src/"
```

---

### Task 21: Fix Windows compatibility + add missing scripts

**Step 1: Check if cross-env is installed**

```bash
pnpm list cross-env
```

If not: `pnpm add -D cross-env`

**Step 2: Fix test:e2e:prod script**

```json
// Old:
"test:e2e:prod": "pnpm build && PROD_BUILD=true node scripts/run-e2e-tests.mjs"

// New:
"test:e2e:prod": "pnpm build && cross-env PROD_BUILD=true node scripts/run-e2e-tests.mjs"
```

**Step 3: Add missing test scripts**

```json
"test:actions": "vitest run -c vitest.actions.config.ts",
"test:stores": "vitest run -c vitest.store.config.ts"
```

**Step 4: Deduplicate scripts**

Remove `test:unit` and `test:unit:watch` (identical to `test` and `test:watch`).

**Step 5: Commit**

```bash
git add package.json
git commit -m "chore: fix Windows compat, add missing test scripts, deduplicate"
```

---

### Task 22: Remove debug E2E specs

**Step 1: Delete debug specs**

```bash
rm e2e/debug-activitytype.spec.ts
rm e2e/debug-combobox.spec.ts
rm e2e/debug-full-fill.spec.ts
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove debug E2E spec files"
```

---

### Task 23: Review and fix CSP headers

**Files:**
- Modify: `next.config.mjs`

**Step 1: Investigate unsafe-eval necessity**

Search for `eval(`, `new Function(`, or dynamic code generation in dependencies:
- MUI may need it for emotion styles
- Next.js dev mode needs it but not production

Test by removing `'unsafe-eval'` and running `pnpm build && pnpm start`. Check browser console for CSP violations.

**Step 2: Add Vercel analytics domains to connect-src (if analytics is active)**

```js
// Old:
"connect-src 'self'"

// New (if Vercel analytics active):
"connect-src 'self' https://*.vercel-insights.com https://*.vercel-analytics.com"
```

**Step 3: Check cacheComponents setting**

In `next.config.mjs`, find `cacheComponents: false`. If it was for debugging, remove it. If intentional, add a comment explaining why.

**Step 4: Deploy to preview and test**

Push to a branch, verify Vercel preview deployment works without CSP errors.

**Step 5: Commit**

```bash
git add next.config.mjs
git commit -m "security: tighten CSP headers, add analytics domains"
```

---

### Task 24: Environment file cleanup

**Files:**
- Delete: `.env.example`
- Delete: `.env.local.disabled` (local file, not tracked)
- Modify: `.env.local.example` (add env file guide header)
- Modify: `.env.production.example` (remove speculative sections)

**Step 1: Delete redundant .env.example**

```bash
git rm .env.example
```

**Step 2: Delete local .env.local.disabled**

```bash
rm .env.local.disabled
```

**Step 3: Add env file guide to .env.local.example**

Add at the very top of `.env.local.example`:

```dotenv
# ====================
# Which env file to use?
# ====================
# Local Development:  Copy this file to .env.local → pnpm dev
# GitHub CI:          Uses .env.ci automatically
# Production:         Copy .env.production.example to .env.production
# E2E Tests:          Uses .env.test automatically
# Vercel Tests:       Uses .env.vercel automatically
# ====================
```

**Step 4: Trim .env.production.example**

Remove these unused sections:
- AWS S3 (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET)
- Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
- Edge Config (EDGE_CONFIG)
- Prisma Accelerate API Key (PRISMA_ACCELERATE_API_KEY) — only the separate variable, keep the DATABASE_URL comment

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: clean up env files, remove redundant .env.example"
```

---

## Final Verification

### Task 25: Full build and CI validation

**Step 1: Clean build**

```bash
pnpm clean
pnpm build
```

Expected: Build succeeds.

**Step 2: Run unit tests**

```bash
pnpm test
```

Expected: All pass.

**Step 3: Run lint**

```bash
pnpm lint
```

Expected: No errors.

**Step 4: Push and let CI validate**

```bash
git push origin main
```

Monitor GitHub Actions for green CI.
