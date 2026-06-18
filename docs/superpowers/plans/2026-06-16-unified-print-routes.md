# Unified Print → Server-Rendered PDF + Excel Export — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every `window.print()`-on-the-live-page and the `innerHTML`-copy hack with chrome-free `/print` HTML routes that headless Chromium renders to real PDFs (opened in a new tab), plus an Excel download per timetable.

**Architecture:** A dedicated `/print/*` route segment (own minimal layout, no app nav) renders each timetable via the existing `TimeslotGrid` inside `PrintShell`. A sibling `/pdf` route handler launches headless Chromium, forwards the caller's session cookies, navigates to the `/print` HTML route, and returns `page.pdf()` bytes inline. Excel export is a client action reusing existing export utilities.

**Tech Stack:** Next.js 16 App Router (RSC + route handlers), React 19, `puppeteer-core` + `@sparticuz/chromium` (Vercel-serverless Chromium; local Chrome in dev), Vitest, Playwright (E2E), Tailwind.

Spec: `docs/superpowers/specs/2026-06-16-unified-print-routes-design.md`.

**Route shape (refines spec — isolates layout/nav):**
`/print/classes/[gradeId]/[ay]/[sem]` (+ `/pdf`), `/print/teachers/[id]/[ay]/[sem]` (+ `/pdf`),
`/print/student-table/[ay]/[sem]`, `/print/all-timeslot/[ay]/[sem]`, `/print/teacher-table/[ay]/[sem]?ids=` (+ `/pdf`).

---

## File Structure

- `src/features/print/render-pdf.ts` — `renderUrlToPdf(url, opts)`: headless Chromium → PDF buffer.
- `src/features/print/cookies.ts` — `parseCookieHeader(header, domain)`: cookie-string → puppeteer cookie objects.
- `src/components/print/PrintShell.tsx` — chrome-free wrapper; title + children + `@page` orientation.
- `src/app/print.css` — shared print stylesheet (imported by `PrintShell`).
- `src/app/print/layout.tsx` — minimal layout for the print segment (no nav).
- `src/features/schedule/loaders/*.ts` — extracted data loaders shared by the screen page and the print route (DRY).
- `src/app/print/<surface>/.../page.tsx` — print HTML routes.
- `src/app/print/<surface>/.../pdf/route.ts` — PDF handlers.
- `src/features/export/class-timetable-excel.ts`, `student-timetable-excel.ts` — Excel row builders.

---

## Phase 0 — Dependencies

### Task 0: Add Chromium PDF deps

**Files:** Modify: `package.json`

- [ ] **Step 1: Install**

Run:
```bash
pnpm add puppeteer-core @sparticuz/chromium
```
Expected: both appear under `dependencies`.

- [ ] **Step 2: Add dev Chrome env note**

Add to `.env.local.example`:
```
# Local-dev Chromium for PDF render (path to installed Chrome/Chromium).
# Production uses @sparticuz/chromium automatically.
CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"
```

- [ ] **Step 3: Commit**
```bash
git add package.json pnpm-lock.yaml .env.local.example
git commit -m "build: add puppeteer-core + @sparticuz/chromium for PDF render"
```

---

## Phase 1 — Foundation

### Task 1: Cookie header parser

**Files:** Create `src/features/print/cookies.ts`; Test `__test__/features/print/cookies.test.ts`

- [ ] **Step 1: Write the failing test**
```ts
import { describe, it, expect } from "vitest";
import { parseCookieHeader } from "@/features/print/cookies";

describe("parseCookieHeader", () => {
  it("splits a cookie header into puppeteer cookie objects scoped to the domain", () => {
    const out = parseCookieHeader("a=1; b=two", "localhost");
    expect(out).toEqual([
      { name: "a", value: "1", domain: "localhost", path: "/" },
      { name: "b", value: "two", domain: "localhost", path: "/" },
    ]);
  });
  it("returns [] for null/empty", () => {
    expect(parseCookieHeader(null, "localhost")).toEqual([]);
    expect(parseCookieHeader("", "localhost")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test, verify fail**
Run: `pnpm vitest run __test__/features/print/cookies.test.ts`
Expected: FAIL ("parseCookieHeader is not a function").

- [ ] **Step 3: Implement**
```ts
export type PuppeteerCookie = { name: string; value: string; domain: string; path: string };

export function parseCookieHeader(
  header: string | null,
  domain: string,
): PuppeteerCookie[] {
  if (!header) return [];
  return header
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((pair) => {
      const eq = pair.indexOf("=");
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      return { name, value, domain, path: "/" };
    })
    .filter((c) => c.name.length > 0);
}
```

- [ ] **Step 4: Run test, verify pass**
Run: `pnpm vitest run __test__/features/print/cookies.test.ts` — Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/features/print/cookies.ts __test__/features/print/cookies.test.ts
git commit -m "feat(print): cookie-header parser for headless render auth"
```

### Task 2: PDF render service

**Files:** Create `src/features/print/render-pdf.ts`

> No unit test (launches a real browser); covered by the integration test in Task 12.

- [ ] **Step 1: Implement**
```ts
import "server-only";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import type { PuppeteerCookie } from "./cookies";

export type RenderPdfOptions = {
  landscape: boolean;
  cookies?: PuppeteerCookie[];
};

export async function renderUrlToPdf(
  url: string,
  { landscape, cookies = [] }: RenderPdfOptions,
): Promise<Buffer> {
  const isProd = process.env.NODE_ENV === "production";
  const browser = await puppeteer.launch(
    isProd
      ? {
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: true,
        }
      : {
          executablePath: process.env.CHROME_PATH,
          headless: true,
        },
  );
  try {
    const page = await browser.newPage();
    if (cookies.length) await page.setCookie(...cookies);
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30_000 });
    await page.waitForSelector('[data-testid="schedule-grid"]', { timeout: 15_000 });
    const pdf = await page.pdf({
      format: "a4",
      landscape,
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
```

- [ ] **Step 2: Typecheck**
Run: `pnpm typecheck` — Expected: no errors in this file.

- [ ] **Step 3: Commit**
```bash
git add src/features/print/render-pdf.ts
git commit -m "feat(print): headless-Chromium URL→PDF render service"
```

### Task 3: Shared print stylesheet

**Files:** Create `src/app/print.css`

- [ ] **Step 1: Implement**
```css
/* Shared print stylesheet for /print/* routes (PrintShell imports this). */
.print-shell { margin: 0; padding: 0; background: #fff; color: #111; }
.print-title { font-size: 16px; font-weight: 700; margin: 0 0 8px; }
.print-card { break-inside: avoid; page-break-inside: avoid; margin-bottom: 8mm; }

/* Fit a wide grid to the printable page width. */
.print-fit table { width: 100%; table-layout: fixed; font-size: 10px; }
.print-fit th, .print-fit td { word-break: break-word; }

/* Bulk: two timetables per portrait page. */
.print-bulk .print-card { height: 48vh; }

/* Belt-and-suspenders: never show app chrome if a route ever inherits it. */
nav[data-app-nav], aside[data-app-sidebar] { display: none !important; }
```

- [ ] **Step 2: Commit**
```bash
git add src/app/print.css
git commit -m "feat(print): shared print stylesheet"
```

### Task 4: `PrintShell` component

**Files:** Create `src/components/print/PrintShell.tsx`; Test `__test__/components/print/PrintShell.test.tsx`

- [ ] **Step 1: Write the failing test**
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrintShell } from "@/components/print/PrintShell";

describe("PrintShell", () => {
  it("renders the title and children", () => {
    render(<PrintShell title="ตาราง ม.1/1"><div data-testid="kid" /></PrintShell>);
    expect(screen.getByText("ตาราง ม.1/1")).toBeInTheDocument();
    expect(screen.getByTestId("kid")).toBeInTheDocument();
  });
  it("emits the requested @page orientation", () => {
    const { container } = render(
      <PrintShell title="t" orientation="landscape"><span /></PrintShell>,
    );
    expect(container.querySelector("style")?.textContent).toContain("size: A4 landscape");
  });
  it("defaults to portrait", () => {
    const { container } = render(<PrintShell title="t"><span /></PrintShell>);
    expect(container.querySelector("style")?.textContent).toContain("size: A4 portrait");
  });
});
```

- [ ] **Step 2: Run test, verify fail**
Run: `pnpm vitest run __test__/components/print/PrintShell.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**
```tsx
import "@/app/print.css";
import type { ReactNode } from "react";

export function PrintShell({
  title,
  orientation = "portrait",
  children,
}: {
  title: string;
  orientation?: "portrait" | "landscape";
  children: ReactNode;
}) {
  return (
    <div className="print-shell">
      <style>{`@page { size: A4 ${orientation}; margin: 10mm; }`}</style>
      <h1 className="print-title">{title}</h1>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Run test, verify pass** — Run: `pnpm vitest run __test__/components/print/PrintShell.test.tsx` — Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/print/PrintShell.tsx src/app/print.css __test__/components/print/PrintShell.test.tsx
git commit -m "feat(print): PrintShell chrome-free wrapper with @page orientation"
```

### Task 5: Print segment layout

**Files:** Create `src/app/print/layout.tsx`

> First verify app nav lives in segment layouts (`src/app/(public)/layout.tsx`, dashboard layout), NOT the root layout — so `/print/*` does not inherit it. If the root layout renders nav, instead add `data-app-nav` to it and rely on the print.css hide rule.

- [ ] **Step 1: Implement**
```tsx
import type { ReactNode } from "react";

export default function PrintLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/print/layout.tsx
git commit -m "feat(print): minimal layout for /print segment (no app nav)"
```

---

## Phase 2 — Public class slice (proves the architecture end-to-end)

### Task 6: Extract the class-schedule loader (DRY)

**Files:** Create `src/features/schedule/loaders/class-schedule.ts`; Modify `src/app/(public)/classes/[gradeId]/[academicYear]/[semester]/page.tsx`

- [ ] **Step 1: Implement the loader** — move the data-fetch from `ClassScheduleByTermPage` (`page.tsx:50-100`) into a reusable function.
```ts
import "server-only";
import { notFound } from "next/navigation";
import type { semester } from "@/prisma/generated/client";
import { publicDataRepository } from "@/features/public/.../publicDataRepository"; // use the existing import path from page.tsx
import { classRepository } from "..."; // copy import paths from the existing page
import { findConfigByTerm } from "...";
import { breakGroupRepository } from "...";
import { parseConfigData } from "...";
import { toBreakGroups, buildGradeGroupIndex } from "...";
import type { SlotConfig, BreakGroup } from "@/features/timeslot/domain/models/break.types";
import type { ScheduleCell } from "@/components/schedule/TimeslotGrid";

export type ClassScheduleView = {
  gradeLevel: { GradeID: string; Year: number; Number: number };
  academicYear: number;
  semNum: number;
  timeslots: Awaited<ReturnType<typeof publicDataRepository.findTimeslotsByTerm>>;
  slots: SlotConfig[];
  breakGroups: BreakGroup[];
  groupNames: string[];
  cellsByTimeslotId: Map<string, ScheduleCell>;
};

export async function loadClassScheduleView(
  gradeId: string,
  academicYear: number,
  semNum: number,
): Promise<ClassScheduleView> {
  const semesterEnum: semester | null =
    semNum === 1 ? "SEMESTER_1" : semNum === 2 ? "SEMESTER_2" : null;
  if (!semesterEnum || isNaN(academicYear)) notFound();

  const gradeLevel = await publicDataRepository.findGradeByIdOrNumeric(gradeId);
  if (!gradeLevel) notFound();
  if (!(await publicDataRepository.isTermPublished(academicYear, semesterEnum))) notFound();

  const schedules = await classRepository.findByGrade(gradeLevel.GradeID, academicYear, semesterEnum);
  const timeslots = await publicDataRepository.findTimeslotsByTerm(academicYear, semesterEnum);
  const configId = `${semNum}-${academicYear}`;
  const [termConfig, breakGroupRows] = await Promise.all([
    findConfigByTerm(academicYear, semesterEnum),
    breakGroupRepository.findByConfigId(configId),
  ]);
  let slots: SlotConfig[] = [];
  try { slots = termConfig?.Config ? parseConfigData(termConfig.Config).slots : []; } catch { slots = []; }
  const breakGroups = toBreakGroups(breakGroupRows);
  const groupNames = [...(buildGradeGroupIndex(breakGroups).get(gradeLevel.GradeID) ?? [])];

  const cellsByTimeslotId = new Map<string, ScheduleCell>();
  for (const s of schedules) {
    cellsByTimeslotId.set(s.timeslot.TimeslotID, {
      timeslotId: s.timeslot.TimeslotID,
      subjectCode: s.subject.SubjectCode,
      subjectName: s.subject.SubjectName,
      teacherLabel:
        s.teachers_responsibility
          .map((tr) => `${tr.teacher.Prefix}${tr.teacher.Firstname} ${tr.teacher.Lastname}`)
          .join(", ") || undefined,
      roomLabel: s.room?.RoomName ?? undefined,
    });
  }
  return { gradeLevel, academicYear, semNum, timeslots, slots, breakGroups, groupNames, cellsByTimeslotId };
}
```
> Copy the exact import paths from the existing `page.tsx` import block.

- [ ] **Step 2: Refactor `page.tsx` to use the loader** — replace its inline fetch with `const view = await loadClassScheduleView(gradeId, parseInt(yearStr,10), parseInt(semStr,10));` and read fields off `view`. Keep the existing JSX (`TimeslotGrid` + `PrintButton`).

- [ ] **Step 3: Verify the page still renders**
Use `browser_eval` MCP (per project rule — not curl): navigate `http://localhost:3000/classes/M1-1/2568/1`, assert `[data-testid="schedule-grid"]` present, no console errors.

- [ ] **Step 4: Commit**
```bash
git add src/features/schedule/loaders/class-schedule.ts "src/app/(public)/classes/[gradeId]/[academicYear]/[semester]/page.tsx"
git commit -m "refactor(schedule): extract class-schedule loader for reuse"
```

### Task 7: Class print HTML route

**Files:** Create `src/app/print/classes/[gradeId]/[academicYear]/[semester]/page.tsx`

- [ ] **Step 1: Implement**
```tsx
import { loadClassScheduleView } from "@/features/schedule/loaders/class-schedule";
import { PrintShell } from "@/components/print/PrintShell";
import { TimeslotGrid } from "@/components/schedule/TimeslotGrid";

type Params = { gradeId: string; academicYear: string; semester: string };

export default async function ClassPrintPage({ params }: { params: Promise<Params> }) {
  const { gradeId, academicYear, semester } = await params;
  const view = await loadClassScheduleView(gradeId, parseInt(academicYear, 10), parseInt(semester, 10));
  const title = `ตารางเรียน ม.${view.gradeLevel.Year}/${view.gradeLevel.Number} — ภาคเรียนที่ ${view.semNum}/${view.academicYear}`;
  return (
    <PrintShell title={title} orientation="portrait">
      <div className="print-card print-fit">
        <TimeslotGrid
          timeslots={view.timeslots}
          slots={view.slots}
          breakGroups={view.breakGroups}
          view={{ mode: "class", gradeId: view.gradeLevel.GradeID, groupNames: view.groupNames }}
          cellsByTimeslotId={view.cellsByTimeslotId}
          show={{ teacher: true, room: true }}
        />
      </div>
    </PrintShell>
  );
}
```

- [ ] **Step 2: Verify** — `browser_eval` navigate `http://localhost:3000/print/classes/M1-1/2568/1`: `schedule-grid` present, NO app nav in DOM, no console errors.

- [ ] **Step 3: Commit**
```bash
git add "src/app/print/classes/[gradeId]/[academicYear]/[semester]/page.tsx"
git commit -m "feat(print): class timetable print route"
```

### Task 8: Class PDF handler

**Files:** Create `src/app/print/classes/[gradeId]/[academicYear]/[semester]/pdf/route.ts`

- [ ] **Step 1: Implement**
```ts
import { renderUrlToPdf } from "@/features/print/render-pdf";

type Params = { gradeId: string; academicYear: string; semester: string };

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  const { gradeId, academicYear, semester } = await params;
  const origin = new URL(req.url).origin;
  const printUrl = `${origin}/print/classes/${gradeId}/${academicYear}/${semester}`;
  const pdf = await renderUrlToPdf(printUrl, { landscape: false }); // public: no cookies
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="class-${gradeId}-${academicYear}-${semester}.pdf"`,
    },
  });
}
```

- [ ] **Step 2: Verify** — `browser_eval` navigate `http://localhost:3000/print/classes/M1-1/2568/1/pdf`: response is a PDF (new tab shows PDF viewer). Confirm non-empty.

- [ ] **Step 3: Commit**
```bash
git add "src/app/print/classes/[gradeId]/[academicYear]/[semester]/pdf/route.ts"
git commit -m "feat(print): class PDF handler (headless render)"
```

### Task 9: Wire the class trigger

**Files:** Modify `src/app/(public)/_components/PrintButton.tsx`; Modify the class `page.tsx` usage

- [ ] **Step 1: Make `PrintButton` open a PDF URL**
```tsx
"use client";
export function PrintButton({ pdfUrl }: { pdfUrl: string }) {
  return (
    <button
      onClick={() => window.open(pdfUrl, "_blank", "noopener")}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      บันทึก/พิมพ์ PDF
    </button>
  );
}
```

- [ ] **Step 2: Pass the url from the class page**
In `(public)/classes/.../page.tsx`, render:
```tsx
<PrintButton pdfUrl={`/print/classes/${gradeId}/${yearStr}/${semStr}/pdf`} />
```

- [ ] **Step 3: Verify** — `browser_eval`: on `/classes/M1-1/2568/1`, click the button opens the PDF in a new tab.

- [ ] **Step 4: Commit**
```bash
git add "src/app/(public)/_components/PrintButton.tsx" "src/app/(public)/classes/[gradeId]/[academicYear]/[semester]/page.tsx"
git commit -m "feat(print): class print button opens server PDF"
```

---

## Phase 3 — Public teacher slice

### Task 10: Teacher loader + print route + PDF handler + trigger

**Files:** Create `src/features/schedule/loaders/teacher-schedule.ts`, `src/app/print/teachers/[id]/[academicYear]/[semester]/page.tsx`, `.../pdf/route.ts`; Modify `src/app/(public)/teachers/[id]/[academicYear]/[semester]/page.tsx`

- [ ] **Step 1: Extract `loadTeacherScheduleView`** — mirror Task 6 using the body of `TeacherScheduleByTermPage` (`teachers/[id]/.../page.tsx:51-110`): `publicDataRepository.findPublicTeacherById`, `findTeacherResponsibilities`, `findTimeslotsByTerm`, `findConfigByTerm`, `breakGroupRepository.findByConfigId`, `parseConfigData`, `toBreakGroups`. Build `cellsByTimeslotId` with `gradeLabel` + `roomLabel` (teacher view). Return `{ teacher, academicYear, semNum, timeslots, slots, breakGroups, cellsByTimeslotId }`. Refactor the existing page to use it.

- [ ] **Step 2: Print route** — same as Task 7 but:
```tsx
const title = `ตารางสอน ${view.teacher.name} — ภาคเรียนที่ ${view.semNum}/${view.academicYear}`;
// <TimeslotGrid ... view={{ mode: "teacher" }} show={{ grade: true, room: true }} />
```
orientation `portrait`, wrapped `print-card print-fit`.

- [ ] **Step 3: PDF handler** — same as Task 8 with `printUrl = ${origin}/print/teachers/${id}/${academicYear}/${semester}`, `landscape: false`, filename `teacher-…`.

- [ ] **Step 4: Trigger** — the teacher page currently has only a "use browser Print" note (no button). Add `<PrintButton pdfUrl={`/print/teachers/${id}/${yearStr}/${semStr}/pdf`} />` and remove the manual-print note.

- [ ] **Step 5: Verify** — `browser_eval`: `/teachers/8/2568/1` button opens teacher PDF; `/print/teachers/8/2568/1` renders grid, no nav.

- [ ] **Step 6: Commit**
```bash
git add src/features/schedule/loaders/teacher-schedule.ts "src/app/print/teachers" "src/app/(public)/teachers/[id]/[academicYear]/[semester]/page.tsx"
git commit -m "feat(print): teacher timetable print route + PDF"
```

---

## Phase 4 — Dashboard surfaces

> Dashboard pages are client components. Each print route is a NEW server component that fetches the same data the screen uses. Read the existing page first to find its data source (repository or server action) and replicate it in a loader. The PDF handler MUST forward cookies AND the print route MUST enforce admin auth (it lives outside the `/dashboard` segment).

### Task 11: Student-table print route + PDF (portrait)

**Files:** Read `src/app/dashboard/[academicYear]/[semester]/student-table/page.tsx` (find its data source). Create `src/features/schedule/loaders/student-table.ts`, `src/app/print/student-table/[academicYear]/[semester]/page.tsx`, `.../pdf/route.ts`.

- [ ] **Step 1: Loader** — replicate the student-table data query in `loadStudentTableView(ay, sem)` returning the same `{timeslots, slots, breakGroups, cellsByTimeslotId, view}` shape the screen feeds `TimeslotGrid`/`Timeslot.tsx`.
- [ ] **Step 2: Print route** — `PrintShell` (portrait) + the student grid; add `const session = await auth(); if (session?.user?.role !== "admin") notFound();` at the top (copy `auth()` import from an existing server-guarded file).
- [ ] **Step 3: PDF handler** — like Task 8 plus cookie forwarding:
```ts
import { parseCookieHeader } from "@/features/print/cookies";
const origin = new URL(req.url).origin;
const cookies = parseCookieHeader(req.headers.get("cookie"), new URL(origin).hostname);
const pdf = await renderUrlToPdf(`${origin}/print/student-table/${academicYear}/${semester}`, { landscape: false, cookies });
```
- [ ] **Step 4: Trigger** — in student-table page, replace `window.print()` with `window.open("/print/student-table/${ay}/${sem}/pdf","_blank")`.
- [ ] **Step 5: Verify** — `browser_eval` while logged in as admin: button opens PDF; print route renders grid; an unauthenticated request to the print route 404s.
- [ ] **Step 6: Commit** — `git commit -m "feat(print): student-table print route + PDF (auth-forwarded)"`.

### Task 12: All-timeslot print route + PDF (landscape) + render integration test

**Files:** Read `…/all-timeslot/AllTimeslotClient.tsx` (+ its server `page.tsx`) for the data source. Create loader, `src/app/print/all-timeslot/[academicYear]/[semester]/page.tsx`, `.../pdf/route.ts`. Test `__test__/features/print/render-pdf.int.test.ts`.

- [ ] **Step 1: Loader + print route** — landscape; wrap grid in `print-card print-fit`; admin-auth guard as Task 11.
- [ ] **Step 2: PDF handler** — cookie forwarding, `landscape: true`.
- [ ] **Step 3: Trigger** — `AllTimeslotClient` `handlePrint` → `window.open("/print/all-timeslot/${ay}/${sem}/pdf","_blank")`.
- [ ] **Step 4: Integration test for the render service**
```ts
import { describe, it, expect } from "vitest";
import { renderUrlToPdf } from "@/features/print/render-pdf";
// Requires the dev server running (pnpm dev) + CHROME_PATH set. Skipped in unit CI; run in e2e job.
describe.skipIf(!process.env.CHROME_PATH)("renderUrlToPdf", () => {
  it("returns a non-empty application/pdf buffer", async () => {
    const pdf = await renderUrlToPdf("http://localhost:3000/print/classes/M1-1/2568/1", { landscape: false });
    expect(pdf.length).toBeGreaterThan(1000);
    expect(pdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  }, 60_000);
});
```
- [ ] **Step 5: Verify + Commit** — `git commit -m "feat(print): all-timeslot landscape print route + PDF; render int test"`.

### Task 13: Teacher-table bulk print route + PDF (portrait, 2/page)

**Files:** Read `…/teacher-table/page.tsx` (bulk-print logic, `.bulk-print` in `globals.css`). Create loader `loadBulkTeacherView(ids, ay, sem)`, `src/app/print/teacher-table/[academicYear]/[semester]/page.tsx` (reads `?ids=`), `.../pdf/route.ts`.

- [ ] **Step 1: Loader** — for each id, reuse `loadTeacherScheduleView`; return an ordered array.
- [ ] **Step 2: Print route** — `PrintShell` (portrait) with `className` adding `print-bulk`; map each teacher to a `print-card` (each ≈ half page). Admin-auth guard.
- [ ] **Step 3: PDF handler** — cookie forwarding, `landscape: false`, pass `?ids=` through to the print URL.
- [ ] **Step 4: Trigger** — the bulk button → `window.open("/print/teacher-table/${ay}/${sem}/pdf?ids="+selected.join(","),"_blank")`.
- [ ] **Step 5: Verify** — `browser_eval`: select 3 teachers, bulk button opens a PDF with 2 timetables per page.
- [ ] **Step 6: Commit** — `git commit -m "feat(print): teacher-table bulk print route + PDF (2/page)"`.

---

## Phase 5 — Excel export

### Task 14: Class & student Excel builders + buttons

**Files:** Create `src/features/export/class-timetable-excel.ts`, `student-timetable-excel.ts`; Modify the class page, student-table page. Test `__test__/features/export/class-timetable-excel.test.ts`.

- [ ] **Step 1: Write the failing test** for the class row builder
```ts
import { describe, it, expect } from "vitest";
import { buildClassExcelRows } from "@/features/export/class-timetable-excel";

it("builds a day×period grid with subject codes", () => {
  const rows = buildClassExcelRows({
    gradeLabel: "ม.1/1",
    cells: [{ day: "MON", period: 1, subjectCode: "ท21101" }],
    periods: [1, 2],
  });
  expect(rows[0]).toEqual(["วัน/คาบ", "คาบ 1", "คาบ 2"]);
  expect(rows.find((r) => r[0] === "จันทร์")).toEqual(["จันทร์", "ท21101", ""]);
});
```
- [ ] **Step 2: Run, verify fail.** Run: `pnpm vitest run __test__/features/export/class-timetable-excel.test.ts` → FAIL.
- [ ] **Step 3: Implement `buildClassExcelRows`** (pure, returns `string[][]`), and a thin `exportClassTable(view)` wrapper calling `arrayToExcelHTML` + `downloadExcel` (mirror `exportTeacherTable` in `src/features/export/teacher-timetable-excel.ts`). Mirror for `student-timetable-excel.ts`.
- [ ] **Step 4: Run, verify pass.**
- [ ] **Step 5: Add "Export Excel" buttons** — client buttons on the class page and student-table page calling the wrappers. (Teacher already has `exportTeacherTable`; ensure a button is wired on the teacher page too.)
- [ ] **Step 6: Verify + Commit** — `git commit -m "feat(export): class/student Excel export + buttons"`.

---

## Phase 6 — Cleanup

### Task 15: Remove dead print code

**Files:** Modify `src/utils/export.utils.ts`, `src/app/globals.css`, dashboard pages, `SemesterExportButton.tsx`.

- [ ] **Step 1: Delete `printElementAsPDF`** from `export.utils.ts` and any imports of it.
- [ ] **Step 2: Remove now-dead `@media print` blocks** that the shared print CSS replaced (`globals.css` `.bulk-print` only if no longer used; `student-table`, `all-timeslot` inline print CSS). Keep anything still referenced.
- [ ] **Step 3: Migrate `SemesterExportButton`'s `printWindow.print()`** path to open the relevant `/print/.../pdf` URL (or leave Excel-only if it was a data export).
- [ ] **Step 4: Verify** — `pnpm typecheck` clean; `browser_eval` smoke each print button.
- [ ] **Step 5: Commit** — `git commit -m "chore(print): remove window.print + printElementAsPDF legacy paths"`.

### Task 16: E2E coverage

**Files:** Modify `e2e/export/pdf-export.spec.ts`

- [ ] **Step 1: Add cases** — for each `/print/*` route assert `[data-testid="schedule-grid"]` renders and no app nav; for each `/pdf` handler assert `response.headers()["content-type"]` includes `application/pdf` and body length > 1000; assert Excel button triggers a download event.
- [ ] **Step 2: Run** — `pnpm test:e2e` (or the targeted spec via the CI e2e job). Visual baselines updated via CI, not locally.
- [ ] **Step 3: Commit** — `git commit -m "test(e2e): cover print routes + PDF handlers + Excel"`.

---

## Self-Review (done while writing)

- **Spec coverage:** PrintShell (T4), shared CSS (T3), render service (T2), 5 print routes + 5 PDF handlers (T7–T13), portrait/landscape orientation (per route), bulk 2/page (T13), auth cookie-forwarding (T11–T13), Excel for teacher/class/student (T14), cleanup of `printElementAsPDF` + `@media print` (T15), tests (T1,T4,T12,T14,T16). All spec sections mapped.
- **Placeholders:** loader import paths are explicitly "copy from existing page" (the only deferred detail, unavoidable without the engineer reading that file); all new-code steps include full code.
- **Type consistency:** `renderUrlToPdf(url, {landscape, cookies})`, `parseCookieHeader(header, domain) → PuppeteerCookie[]`, `PrintShell({title, orientation, children})`, loaders return the `TimeslotGrid` prop shape (`timeslots/slots/breakGroups/view/cellsByTimeslotId`). Consistent across tasks.
