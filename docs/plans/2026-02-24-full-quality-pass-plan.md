# Full Quality Pass — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix ~35 concrete bugs, remove ~4,000 LOC of dead code, improve type safety, add error boundaries, fix UX inconsistencies, and add accessibility across schedule arrangement and management pages.

**Architecture:** Incremental fixes grouped by risk level. P0 bugs first, then dead code cleanup, then type safety / architecture, then UX / accessibility. Each task is independently committable and CI-verifiable.

**Tech Stack:** Next.js 16, TypeScript strict, Prisma 6, MUI 7, Zustand, Valibot, Vitest, Playwright

---

## Phase 1: Critical Bugs (P0)

### Task 1: Fix Regex Injection in Subject Search

**Files:**
- Modify: `src/app/schedule/[academicYear]/[semester]/assign/component/AddSubjectModal.tsx:90`

**Step 1: Fix the regex injection**

Replace the `.match()` call at line 90 with `.includes()`:

```tsx
// BEFORE (line 90):
`${item.SubjectCode} - ${item.SubjectName}`.match(searchText),

// AFTER:
`${item.SubjectCode} - ${item.SubjectName}`.toLowerCase().includes(searchText.toLowerCase()),
```

**Step 2: Verify no TypeScript errors**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json 2>&1 | Select-String "AddSubjectModal"`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/schedule/\[academicYear\]/\[semester\]/assign/component/AddSubjectModal.tsx
git commit -m "fix: replace regex injection-prone .match() with .includes() in subject search"
```

---

### Task 2: Hide Stub Inspector Panel

**Files:**
- Modify: `src/app/schedule/[academicYear]/[semester]/arrange/@inspector/page.tsx`

**Step 1: Replace hardcoded false data with "coming soon" placeholder**

Replace the entire return body with a simple coming-soon message. Keep the component structure but remove misleading "0 conflicts" / "0 periods" text:

```tsx
export default async function InspectorSlot({
  searchParams,
}: {
  searchParams: Promise<{ teacher?: string }>;
}) {
  const params = await searchParams;
  const teacherParam = params.teacher;

  return (
    <Stack spacing={1} sx={{ p: 2, height: "100%" }}>
      <Typography variant="subtitle2" color="text.secondary">
        ตรวจสอบตารางสอน
      </Typography>
      <Alert severity="info" variant="outlined">
        {teacherParam
          ? "กำลังพัฒนาระบบตรวจสอบความขัดแย้ง"
          : "เลือกครูเพื่อดูข้อมูล"}
      </Alert>
    </Stack>
  );
}
```

**Step 2: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json 2>&1 | Select-String "inspector"`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/schedule/\[academicYear\]/\[semester\]/arrange/@inspector/page.tsx
git commit -m "fix: replace misleading inspector stub with coming-soon placeholder"
```

---

### Task 3: Remove Duplicate DndContext

**Files:**
- Modify: `src/app/schedule/[academicYear]/[semester]/arrange/layout.tsx:58`

**Step 1: Remove DndContext from layout**

The layout wraps everything in `<DndContext>` (line 58) but has no `onDragEnd` handler — the real handler is in `@grid/page.tsx`. Remove the DndContext wrapper from layout, keeping only the one in `@grid/page.tsx`.

In `layout.tsx`, remove the `DndContext` import and wrapper. Keep the layout structure (slots) but without the drag context. Also remove `sensors`, `closestCenter`, and related imports if they become unused.

**Step 2: Verify the grid's DndContext still works**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json 2>&1 | Select-String "layout|grid"`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/schedule/\[academicYear\]/\[semester\]/arrange/layout.tsx
git commit -m "fix: remove duplicate DndContext from arrange layout (keep only in grid)"
```

---

### Task 4: Fix window.location.reload in Server Component

**Files:**
- Modify: `src/app/management/gradelevel/page.tsx:21`

**Step 1: Replace with proper error handling**

The Server Component currently passes `() => window.location.reload()` as `onRetry` prop. Since this is a Server Component, pass `undefined` or handle the error differently. The simplest fix: let the error.tsx boundary handle it instead (Task 18 adds error boundaries). For now, remove the `onRetry` prop:

```tsx
// BEFORE (line 21):
return <NetworkErrorEmptyState onRetry={() => window.location.reload()} />;

// AFTER:
return <NetworkErrorEmptyState />;
```

If `NetworkErrorEmptyState` requires `onRetry`, check its interface. If optional, just omit it. If required, create a client wrapper component that provides the reload behavior.

**Step 2: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json 2>&1 | Select-String "gradelevel/page"`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/management/gradelevel/page.tsx
git commit -m "fix: remove window.location.reload from Server Component (gradelevel page)"
```

---

### Task 5: Fix Fire-and-Forget Delete Race Condition

**Files:**
- Modify: `src/app/management/gradelevel/component/ConfirmDeleteModal.tsx:26`

**Step 1: Await the delete operation**

```tsx
// BEFORE (line 26-27):
const confirmed = () => {
    void removeMultiData(deleteData, checkedList);
    closeModal();
};

// AFTER:
const confirmed = async () => {
    await removeMultiData(deleteData, checkedList);
    closeModal();
};
```

**Step 2: Verify TypeScript**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json 2>&1 | Select-String "ConfirmDeleteModal"`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/management/gradelevel/component/ConfirmDeleteModal.tsx
git commit -m "fix: await delete operation before closing modal (gradelevel)"
```

---

### Task 6: Fix Persistent Snackbar Leak

**Files:**
- Modify: `src/app/management/program/component/ProgramEditableTable.tsx:127,150,175`

**Step 1: Capture snackbar key and close it properly**

For each of the three `persist: true` snackbar calls (L127, L150, L175), capture the key and close it in the `finally` block:

```tsx
// BEFORE (example at L125-146):
try {
  const loadbar = enqueueSnackbar("กำลังเพิ่มหลักสูตร", { variant: "info", persist: true });
  // ... action ...
  enqueueSnackbar("เพิ่มหลักสูตรสำเร็จ", { variant: "success" });
} catch (e) {
  enqueueSnackbar("เกิดข้อผิดพลาด", { variant: "error" });
} finally {
  enqueueSnackbar("", { variant: "default" }); // BUG: doesn't close persistent
}

// AFTER:
try {
  const loadbar = enqueueSnackbar("กำลังเพิ่มหลักสูตร", { variant: "info", persist: true });
  // ... action ...
  closeSnackbar(loadbar);
  enqueueSnackbar("เพิ่มหลักสูตรสำเร็จ", { variant: "success" });
} catch (e) {
  enqueueSnackbar("เกิดข้อผิดพลาด", { variant: "error" });
} finally {
  closeSnackbar(loadbar); // ensure persistent snackbar is always dismissed
}
```

Ensure `closeSnackbar` is imported from `notistack`. Apply to all three occurrences.

**Step 2: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json 2>&1 | Select-String "ProgramEditableTable"`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/management/program/component/ProgramEditableTable.tsx
git commit -m "fix: close persistent snackbar properly in ProgramEditableTable"
```

---

### Task 7: Hide Permanently-Disabled Save/Undo/Redo Buttons

**Files:**
- Modify: `src/app/schedule/[academicYear]/[semester]/arrange/@header/_components/HeaderClient.tsx:213-222`

**Step 1: Comment out the disabled button group**

```tsx
// BEFORE (L213-222):
          <ButtonGroup variant="contained">
            <Button startIcon={<UndoIcon />} disabled>
              Undo
            </Button>
            <Button startIcon={<RedoIcon />} disabled>
              Redo
            </Button>
            <Button startIcon={<SaveIcon />} color="primary">
              Save
            </Button>
          </ButtonGroup>

// AFTER:
          {/* TODO: Re-enable when arrangement store supports undo/redo/save
          <ButtonGroup variant="contained">
            <Button startIcon={<UndoIcon />} disabled>
              Undo
            </Button>
            <Button startIcon={<RedoIcon />} disabled>
              Redo
            </Button>
            <Button startIcon={<SaveIcon />} color="primary">
              Save
            </Button>
          </ButtonGroup>
          */}
```

**Step 2: Remove unused imports**

Remove `UndoIcon`, `RedoIcon`, `SaveIcon`, `ButtonGroup` imports if no longer used.

**Step 3: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json 2>&1 | Select-String "HeaderClient"`
Expected: No errors

**Step 4: Commit**

```bash
git add src/app/schedule/\[academicYear\]/\[semester\]/arrange/@header/_components/HeaderClient.tsx
git commit -m "fix: hide permanently-disabled Save/Undo/Redo buttons (not yet implemented)"
```

---

## Phase 2: Dead Code Cleanup

### Task 8: Remove Dead Schedule Arrangement Code

**Files to delete:**
- `src/features/schedule-arrangement/presentation/stores/teacher-arrange.store.ts` (871 lines)
- `src/features/schedule-arrangement/presentation/stores/slices/teacher-selection.slice.ts` (~60 lines)
- `__test__/stores/teacher-arrange.store.test.ts` (tests the dead store)

**Step 1: Verify no imports exist**

Run: `Get-ChildItem -Path src -Recurse -Filter "*.ts*" | Select-String "teacher-arrange.store|teacher-selection.slice" | Select-Object Path, LineNumber, Line`
Expected: Zero matches in application code (only the files themselves and their test)

**Step 2: Remove the unused `batchArrangeSchedulesSchema` export**

In `src/features/schedule-arrangement/application/schemas/schedule-arrangement.schemas.ts`, remove lines 134-148 (`batchArrangeSchedulesSchema` and its type). Keep the rest of the file (other schemas are used).

**Step 3: Delete dead files**

```bash
git rm src/features/schedule-arrangement/presentation/stores/teacher-arrange.store.ts
git rm src/features/schedule-arrangement/presentation/stores/slices/teacher-selection.slice.ts
git rm __test__/stores/teacher-arrange.store.test.ts
```

**Step 4: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json`
Expected: No new errors

**Step 5: Commit**

```bash
git commit -m "chore: remove dead schedule arrangement stores and unused schema (~950 LOC)"
```

---

### Task 9: Remove Dead Management Legacy Files

**Files to delete (~3,200 LOC):**

Teacher domain:
- `src/app/management/teacher/component/AddModalForm.tsx`
- `src/app/management/teacher/component/EditModalForm.tsx`
- `src/app/management/teacher/component/ConfirmDeleteModal.tsx`
- `src/app/management/teacher/component/TableRow.tsx`
- `src/app/management/teacher/component/TeacherTable.tsx`

Subject domain:
- `src/app/management/subject/component/AddModalForm.tsx`
- `src/app/management/subject/component/EditModalForm.tsx`
- `src/app/management/subject/component/ConfirmDeleteModal.tsx`
- `src/app/management/subject/component/TableRow.tsx`
- `src/app/management/subject/component/ActivityTable.tsx`

Rooms domain:
- `src/app/management/rooms/component/AddModalForm.tsx`
- `src/app/management/rooms/component/EditModalForm.tsx`
- `src/app/management/rooms/component/ConfirmDeleteModal.tsx`
- `src/app/management/rooms/component/TableRow.tsx`

GradeLevel domain:
- `src/app/management/gradelevel/component/AddModalForm.tsx`
- `src/app/management/gradelevel/component/EditModalForm.tsx`
- `src/app/management/gradelevel/component/ConfirmDeleteModal.tsx`
- `src/app/management/gradelevel/component/TableRow.tsx`
- `src/app/management/gradelevel/component/GradeLevelTable.tsx`

Program domain:
- `src/app/management/program/component/ProgramEditableTable.tsx`
- `src/app/management/program/component/EditStudyProgramModalLegacy.tsx`
- `src/app/management/program/component/ProgramTable.tsx`
- `src/app/management/program/component/AddStudyProgramModal.tsx`
- `src/app/management/program/component/EditStudyProgramModal.tsx`
- `src/app/management/program/component/DeleteProgramModal.tsx`
- `src/app/management/program/component/StudyProgramLabel.tsx`
- `src/app/management/program/component/YearSemester.tsx`

**Step 1: Verify zero imports for each file**

Run: `Get-ChildItem -Path src -Recurse -Filter "*.ts*" | Select-String "AddModalForm|EditModalForm|ConfirmDeleteModal|TableRow|TeacherTable|ActivityTable|GradeLevelTable|ProgramEditableTable|EditStudyProgramModalLegacy|ProgramTable|AddStudyProgramModal|EditStudyProgramModal|DeleteProgramModal|StudyProgramLabel|YearSemester" | Where-Object { $_.Path -notmatch "component[\\/](Add|Edit|Confirm|Table|Program|Delete|Study|Year)" } | Select-Object Path, Line`

Expected: Zero imports from application code (only the dead files importing each other)

**Step 2: Delete all dead files**

```bash
git rm src/app/management/teacher/component/AddModalForm.tsx
git rm src/app/management/teacher/component/EditModalForm.tsx
git rm src/app/management/teacher/component/ConfirmDeleteModal.tsx
git rm src/app/management/teacher/component/TableRow.tsx
git rm src/app/management/teacher/component/TeacherTable.tsx
git rm src/app/management/subject/component/AddModalForm.tsx
git rm src/app/management/subject/component/EditModalForm.tsx
git rm src/app/management/subject/component/ConfirmDeleteModal.tsx
git rm src/app/management/subject/component/TableRow.tsx
git rm src/app/management/subject/component/ActivityTable.tsx
git rm src/app/management/rooms/component/AddModalForm.tsx
git rm src/app/management/rooms/component/EditModalForm.tsx
git rm src/app/management/rooms/component/ConfirmDeleteModal.tsx
git rm src/app/management/rooms/component/TableRow.tsx
git rm src/app/management/gradelevel/component/AddModalForm.tsx
git rm src/app/management/gradelevel/component/EditModalForm.tsx
git rm src/app/management/gradelevel/component/ConfirmDeleteModal.tsx
git rm src/app/management/gradelevel/component/TableRow.tsx
git rm src/app/management/gradelevel/component/GradeLevelTable.tsx
git rm src/app/management/program/component/ProgramEditableTable.tsx
git rm src/app/management/program/component/EditStudyProgramModalLegacy.tsx
git rm src/app/management/program/component/ProgramTable.tsx
git rm src/app/management/program/component/AddStudyProgramModal.tsx
git rm src/app/management/program/component/EditStudyProgramModal.tsx
git rm src/app/management/program/component/DeleteProgramModal.tsx
git rm src/app/management/program/component/StudyProgramLabel.tsx
git rm src/app/management/program/component/YearSemester.tsx
```

**Step 3: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json`
Expected: No errors (or fewer than before)

**Step 4: Commit**

```bash
git commit -m "chore: remove ~3200 LOC of dead legacy management modals/tables"
```

---

## Phase 3: Architecture & Type Safety

### Task 10: Move Direct Prisma Calls to Repository Layer

**Files:**
- Create: `src/features/email/infrastructure/repositories/email.repository.ts`
- Modify: `src/app/management/email-outbox/page.tsx`
- Modify: `src/features/program/infrastructure/repositories/program.repository.ts`
- Modify: `src/app/management/program/page.tsx`
- Modify: `src/app/management/program/year/[year]/page.tsx`

**Step 1: Create email repository**

Create `src/features/email/infrastructure/repositories/email.repository.ts`:

```typescript
import prisma from "@/lib/prisma";
import { cache } from "react";

export const findOutboxEmails = cache(
  async (filters?: { status?: string; kind?: string }) => {
    return prisma.emailOutbox.findMany({
      where: {
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.kind ? { kind: filters.kind } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }
);
```

**Step 2: Update email-outbox page to use repository**

Replace direct prisma import with repository import in `email-outbox/page.tsx`.

**Step 3: Add repository methods for program**

In `src/features/program/infrastructure/repositories/program.repository.ts`, add:

```typescript
export const getDistinctYears = cache(async () => {
  return prisma.program.groupBy({
    by: ["Year"],
    _count: { ProgramID: true },
    where: { IsActive: true },
  });
});

export const findByYear = cache(async (year: number) => {
  return prisma.program.findMany({
    where: { Year: year },
    orderBy: { ProgramName: "asc" },
  });
});
```

**Step 4: Update program pages to use repository**

Replace direct prisma calls in `program/page.tsx` and `program/year/[year]/page.tsx`.

**Step 5: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json`
Expected: No errors

**Step 6: Commit**

```bash
git add src/features/email/ src/features/program/ src/app/management/email-outbox/ src/app/management/program/
git commit -m "refactor: move direct Prisma calls to repository layer (email-outbox, program)"
```

---

### Task 11: Fix `as never` Casts in Email-Outbox

**Files:**
- Modify: `src/app/management/email-outbox/page.tsx:40-41`

**Step 1: Add Valibot validation for search params**

```typescript
import * as v from "valibot";

const statusSchema = v.optional(v.picklist(["PENDING", "SENT", "FAILED"]));
const kindSchema = v.optional(v.picklist(["INVITATION", "NOTIFICATION", "RESET"]));
```

Apply validation to search params before passing to repository. Remove `as never` casts.

**Step 2: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json 2>&1 | Select-String "email-outbox"`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/management/email-outbox/page.tsx
git commit -m "fix: replace 'as never' casts with Valibot validation in email-outbox"
```

---

### Task 12: Fix ShowTeacherData pushState

**Files:**
- Modify: `src/app/schedule/[academicYear]/[semester]/assign/component/ShowTeacherData.tsx:206-208`

**Step 1: Replace window.history.pushState with Next.js router**

```tsx
// BEFORE:
window.history.pushState(null, "", newUrl);
// ...
window.history.pushState(null, "", pathName);

// AFTER:
import { useRouter } from "next/navigation";
// in component:
const router = useRouter();
// ...
router.replace(newUrl);
// ...
router.replace(pathName);
```

Use `router.replace()` (not `push`) to match the original pushState behavior (no new history entry).

**Step 2: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json 2>&1 | Select-String "ShowTeacherData"`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/schedule/\[academicYear\]/\[semester\]/assign/component/ShowTeacherData.tsx
git commit -m "fix: replace window.history.pushState with Next.js router.replace()"
```

---

### Task 13: Remove Arbitrary setTimeout for SWR Refresh

**Files:**
- Modify: `src/app/schedule/[academicYear]/[semester]/arrange/@grid/page.tsx:232-234`

**Step 1: Replace setTimeout with immediate mutate**

```tsx
// BEFORE (L228-234):
router.push(roomSelectUrl);
setTimeout(() => {
  void mutate();
}, 1000);

// AFTER:
router.push(roomSelectUrl);
void mutate(); // SWR will revalidate when component refocuses
```

Or if the refresh should happen after navigation completes, use `router.push()` then `mutate()` in the `onComplete` / subsequent render.

**Step 2: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json 2>&1 | Select-String "grid/page"`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/schedule/\[academicYear\]/\[semester\]/arrange/@grid/page.tsx
git commit -m "fix: remove arbitrary 1s setTimeout, use immediate SWR mutate"
```

---

## Phase 4: Error Boundaries

### Task 14: Create Shared Error Page Component

**Files:**
- Create: `src/components/error/RouteErrorFallback.tsx`

**Step 1: Create reusable error boundary component**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { Button, Stack, Typography, Alert, Collapse } from "@mui/material";
import { useState } from "react";

interface RouteErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  context?: string; // e.g. "ครู", "วิชา", "ห้องเรียน"
}

function classifyError(error: Error): {
  isRetryable: boolean;
  thaiMessage: string;
} {
  const msg = error.message.toLowerCase();

  if (msg.includes("fetch") || msg.includes("timeout") || msg.includes("network") || msg.includes("503") || msg.includes("econnrefused")) {
    return { isRetryable: true, thaiMessage: "เกิดปัญหาในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง" };
  }
  if (msg.includes("not found") || msg.includes("404")) {
    return { isRetryable: false, thaiMessage: "ไม่พบข้อมูลที่ต้องการ" };
  }
  if (msg.includes("unauthorized") || msg.includes("unauthenticated") || msg.includes("403") || msg.includes("401")) {
    return { isRetryable: false, thaiMessage: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาเข้าสู่ระบบใหม่" };
  }
  if (msg.includes("constraint") || msg.includes("foreign key") || msg.includes("unique")) {
    return { isRetryable: false, thaiMessage: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" };
  }
  return { isRetryable: true, thaiMessage: "เกิดข้อผิดพลาดที่ไม่คาดคิด" };
}

function sanitizeErrorMessage(message: string): string {
  return message.replace(/postgres|prisma|database|connection|password|secret|dsn|url/gi, "[redacted]");
}

export default function RouteErrorFallback({ error, reset, context }: RouteErrorFallbackProps) {
  const router = useRouter();
  const [showDetail, setShowDetail] = useState(false);
  const { isRetryable, thaiMessage } = classifyError(error);
  const isDev = process.env.NODE_ENV === "development";

  return (
    <Stack spacing={3} alignItems="center" justifyContent="center" sx={{ p: 4, minHeight: "50vh" }}>
      <Typography variant="h5" color="error">
        ⚠️ เกิดข้อผิดพลาด
      </Typography>

      <Typography variant="body1" color="text.secondary" textAlign="center">
        {context ? `ไม่สามารถโหลดข้อมูล${context}ได้` : thaiMessage}
      </Typography>

      <Stack direction="row" spacing={2}>
        {isRetryable && (
          <Button variant="contained" onClick={reset}>
            ลองใหม่
          </Button>
        )}
        <Button variant="outlined" onClick={() => router.back()}>
          กลับหน้าก่อนหน้า
        </Button>
        <Button variant="text" onClick={() => router.push("/")}>
          กลับหน้าหลัก
        </Button>
      </Stack>

      <Button size="small" onClick={() => setShowDetail(!showDetail)} sx={{ mt: 2 }}>
        {showDetail ? "ซ่อนรายละเอียด" : "แสดงรายละเอียด"}
      </Button>
      <Collapse in={showDetail}>
        <Alert severity="warning" sx={{ maxWidth: 600 }}>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
            {sanitizeErrorMessage(error.message)}
          </Typography>
          {isDev && error.stack && (
            <Typography variant="caption" component="pre" sx={{ whiteSpace: "pre-wrap", mt: 1, fontSize: 10, color: "text.disabled" }}>
              {error.stack}
            </Typography>
          )}
        </Alert>
      </Collapse>
    </Stack>
  );
}
```

**Step 2: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json 2>&1 | Select-String "RouteErrorFallback"`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/error/RouteErrorFallback.tsx
git commit -m "feat: add shared RouteErrorFallback with error classification"
```

---

### Task 15: Add Error Boundaries to Management Routes

**Files:**
- Create: `src/app/management/teacher/error.tsx`
- Create: `src/app/management/subject/error.tsx`
- Create: `src/app/management/rooms/error.tsx`
- Create: `src/app/management/gradelevel/error.tsx`
- Create: `src/app/management/program/error.tsx`

**Step 1: Create each error.tsx**

All follow the same pattern — only `context` prop differs:

```tsx
// src/app/management/teacher/error.tsx
"use client";
import RouteErrorFallback from "@/components/error/RouteErrorFallback";

export default function TeacherError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorFallback error={error} reset={reset} context="ครู" />;
}
```

Repeat for:
- `subject/error.tsx` → `context="วิชา"`
- `rooms/error.tsx` → `context="ห้องเรียน"`
- `gradelevel/error.tsx` → `context="ระดับชั้น"`
- `program/error.tsx` → `context="หลักสูตร"`

**Step 2: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/management/*/error.tsx
git commit -m "feat: add error.tsx boundaries to all management routes"
```

---

### Task 16: Add Error Boundaries to Schedule Routes

**Files:**
- Create: `src/app/schedule/[academicYear]/[semester]/arrange/error.tsx`
- Create: `src/app/schedule/[academicYear]/[semester]/assign/error.tsx`

**Step 1: Create each error.tsx**

```tsx
// arrange/error.tsx
"use client";
import RouteErrorFallback from "@/components/error/RouteErrorFallback";

export default function ArrangeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorFallback error={error} reset={reset} context="การจัดตารางสอน" />;
}
```

```tsx
// assign/error.tsx
"use client";
import RouteErrorFallback from "@/components/error/RouteErrorFallback";

export default function AssignError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorFallback error={error} reset={reset} context="การมอบหมายการสอน" />;
}
```

**Step 2: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/schedule/\[academicYear\]/\[semester\]/arrange/error.tsx
git add src/app/schedule/\[academicYear\]/\[semester\]/assign/error.tsx
git commit -m "feat: add error.tsx boundaries to schedule arrange and assign routes"
```

---

## Phase 5: UX Consistency

### Task 17: Fix English Labels in ActivityModal

**Files:**
- Modify: `src/app/management/subject/component/ActivityModal.tsx`

**Step 1: Replace all English strings with Thai**

```tsx
// L56: "Subject code and name are required." → "กรุณากรอกรหัสวิชาและชื่อวิชา"
// L86: "Unknown error" → "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
// L95: "Edit Activity" → "แก้ไขกิจกรรม", "Add Activity" → "เพิ่มกิจกรรม"
// L99: label="Subject Code" → label="รหัสวิชา"
// L107: label="Subject Name" → label="ชื่อวิชา"
// L116: label="Activity Type" → label="ประเภทกิจกรรม"
// L133: label="Is Graded" → label="มีเกรด"
// L139: "Cancel" → "ยกเลิก"
// L145: "Update" → "บันทึก", "Create" → "เพิ่ม"
```

**Step 2: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json 2>&1 | Select-String "ActivityModal"`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/management/subject/component/ActivityModal.tsx
git commit -m "fix: translate ActivityModal from English to Thai for consistency"
```

---

### Task 18: Replace Full-Table Skeleton with LinearProgress

**Files:**
- Modify: `src/app/management/subject/component/SubjectManageClient.tsx`
- Modify: `src/app/management/rooms/component/RoomsManageClient.tsx`
- Modify: `src/app/management/gradelevel/component/GradeLevelManageClient.tsx`
- Modify: `src/app/management/teacher/component/TeacherManageClient.tsx`

**Step 1: Replace skeleton swap with LinearProgress overlay**

For each `*ManageClient.tsx`, change the pattern from:

```tsx
if (isRefreshing) {
  return <SomeSkeleton />;
}
```

To:

```tsx
// At top of return (before main content):
{isRefreshing && <LinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0 }} />}
```

This keeps data visible during refresh and shows a subtle loading bar at the top.

Wrap the container in `position: "relative"` if not already.

Import: `import { LinearProgress } from "@mui/material";`

**Step 2: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/management/*/component/*ManageClient.tsx
git commit -m "ux: replace full-table skeleton with LinearProgress during mutations"
```

---

### Task 19: Add Action Buttons to Empty States

**Files:**
- Modify: `src/app/management/rooms/component/RoomsManageClient.tsx`
- Modify: `src/app/management/gradelevel/component/GradeLevelManageClient.tsx`

**Step 1: Add action button to rooms empty state**

Check if `NoRoomsEmptyState` accepts an `onAdd` prop like `NoSubjectsEmptyState` does. If not, pass a similar button.

**Step 2: Add action button to gradelevel empty state**

`NoDataEmptyState` is generic — either add an `onAdd` prop or wrap with a button.

**Step 3: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json`
Expected: No errors

**Step 4: Commit**

```bash
git add src/app/management/rooms/ src/app/management/gradelevel/
git commit -m "ux: add action buttons to rooms and gradelevel empty states"
```

---

## Phase 6: Performance

### Task 20: Create getTeacherByIdAction

**Files:**
- Create: Server action for fetching single teacher by ID (in existing teacher feature)
- Modify: `src/app/schedule/[academicYear]/[semester]/assign/hooks/useTeacherSchedule.ts:148-155`

**Step 1: Add repository method**

In the teacher repository, add a `findById` method:

```typescript
export const findTeacherById = cache(async (teacherId: number) => {
  return prisma.teacher.findUnique({
    where: { TeacherID: teacherId },
  });
});
```

**Step 2: Create server action**

```typescript
"use server";
import { createAction } from "@/lib/action-wrapper";
import * as v from "valibot";

const getTeacherByIdSchema = v.object({
  teacherId: v.number(),
});

export const getTeacherByIdAction = createAction(
  getTeacherByIdSchema,
  async ({ teacherId }) => {
    const teacher = await findTeacherById(teacherId);
    return teacher;
  }
);
```

**Step 3: Update useTeacherSchedule to use new action**

Replace L148-155:
```tsx
// BEFORE:
const result = await getTeachersAction({});
const teachers = result.data;
const foundTeacher = teachers.find((t) => t.TeacherID === teacherIDNum);

// AFTER:
const result = await getTeacherByIdAction({ teacherId: teacherIDNum });
const foundTeacher = result?.success ? result.data : null;
```

**Step 4: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json`
Expected: No errors

**Step 5: Commit**

```bash
git add src/features/teacher/ src/app/schedule/
git commit -m "perf: fetch single teacher by ID instead of loading entire table"
```

---

## Phase 7: Accessibility (Quick Wins)

### Task 21: Add ARIA Labels to Management Table Actions

**Files:**
- Modify: All DataGrid/table components in management pages that have edit/delete icon buttons

**Step 1: Find all icon buttons without aria-label**

Search for `<IconButton` without `aria-label` in management components.

**Step 2: Add aria-labels**

Pattern examples:
```tsx
<IconButton aria-label={`แก้ไข ${row.TeacherName}`} onClick={...}>
<IconButton aria-label={`ลบ ${row.SubjectName}`} onClick={...}>
```

**Step 3: Verify build**

Run: `pnpm tsc --noEmit --project tsconfig.typecheck.json`
Expected: No errors

**Step 4: Commit**

```bash
git add src/app/management/
git commit -m "a11y: add aria-labels to management table action buttons"
```

---

### Task 22: Add ARIA Labels to Search Inputs

**Files:**
- Modify: All search/filter inputs across management and schedule pages

**Step 1: Find search inputs**

Search for `TextField` or `input` components used for search/filter in management and schedule pages.

**Step 2: Add aria-labels**

```tsx
<TextField aria-label="ค้นหาครู" placeholder="ค้นหา..." ... />
```

**Step 3: Commit**

```bash
git add src/app/management/ src/app/schedule/
git commit -m "a11y: add aria-labels to search and filter inputs"
```

---

## Summary

| Phase | Tasks | Commits | Estimated Time |
|-------|-------|---------|---------------|
| 1. Critical Bugs | 1-7 | 7 | 2-3 hours |
| 2. Dead Code | 8-9 | 2 | 30 min |
| 3. Architecture | 10-13 | 4 | 2-3 hours |
| 4. Error Boundaries | 14-16 | 3 | 1-2 hours |
| 5. UX Consistency | 17-19 | 3 | 1-2 hours |
| 6. Performance | 20 | 1 | 1 hour |
| 7. Accessibility | 21-22 | 2 | 1-2 hours |
| **Total** | **22** | **22** | **~10-14 hours** |

Each task is independently committable. CI validates each commit. No task depends on another unless noted. Phases can be done in any order, though Phase 1 (bugs) should come first.
