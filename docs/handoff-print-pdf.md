# Handoff — unified print→PDF + Excel (`feat/unified-print-pdf`)

> Paste the **Starting prompt** below to resume in a new session.

## Starting prompt

```
Resume work on the unified print→PDF + Excel feature. Branch: feat/unified-print-pdf
(31 commits ahead of main, NOT merged/pushed, ephemeral branch — merge to main
LOCALLY only when I say, never push). Working tree clean except untracked
.gitattributes (leave it).

WHAT'S DONE (all committed, typecheck+lint clean):
- Every timetable print is now a server-rendered /print/* route → headless-Chromium
  PDF opened in a new tab (class, teacher, student-table per-class, teacher-table
  bulk). Admin routes self-enforce auth + forward cookies; public class/teacher
  routes gated on PUBLISHED (5ka preserved, verified).
- Layout fixed: no app sidebar in PDFs (Content bare-renders /print), each single
  class/teacher/student table = ONE landscape page; teacher-table bulk = one teacher
  per page. Verified via PDF page counts.
- all-timeslot: PDF export REMOVED; uses Excel only. Master-grid Excel = the
  "สรุปสำหรับครู" button (ExportTeacherSummary); per-teacher sheets = "ส่งออก Excel".
- Excel exports kept on ExcelJS (correct lib — needs merges/styling SheetJS community
  can't do). Fixed two export bugs: malformed xlsx MIME (spreadsheet.sheet →
  spreadsheetml.sheet), and the real "Excel won't open" bug — downloads saved as a
  blob-UUID with no .xlsx extension because revokeObjectURL ran synchronously after
  click() and 3/4 exports didn't DOM-append the anchor. New shared helper
  src/utils/download-blob.ts (DOM-append + deferred cleanup) used by all 4 ExcelJS
  exports.

FIRST THING TO CHECK (my last fix is browser-UNVERIFIED — Playwright tolerated the
bug, real Chrome didn't): I re-tested both Excel exports and BOTH now download as
proper .xlsx and open / DON'T open in desktop Excel: [TELL CLAUDE THE RESULT].
- If still broken: switch the 4 export filenames from Thai (รวม.xlsx, ตารางสอน-…) to
  ASCII as the next lever, and have me send the actual downloaded file for byte
  inspection.
- Also confirm the print PDFs you were sent look right (1 landscape page each, no
  sidebar).

THEN decide: merge feat/unified-print-pdf to main (local), open a PR, or keep going.
Remaining plan tail if continuing: final code review (superpowers:requesting-code-review),
then superpowers:finishing-a-development-branch.

ENV BRING-UP: docker DB already configured (port 5433, timetable-test-db). Start dev:
`pnpm dev` (loads .env.local with CHROME_PATH for the headless PDF render). Admin login
admin@school.local / admin123. Term data: 2568/1 = PUBLISHED, 2568/2 = DRAFT.

GOTCHAS (cost me time, don't relearn):
- Playwright/headless is MORE tolerant than the real target (Chrome/Excel/print engine).
  Byte-checks (valid PDF, valid xlsx, download fires) passed on output that was visually
  broken / unopenable. Verify with real screenshots / page counts / the user's actual file.
- A long-lived `pnpm dev` degrades (Jest-worker EPIPE) and killing it leaves .next route
  registration torn → ALL /print/*/pdf routes 404 (even the public one). Fix: kill server,
  `rm -rf .next`, restart.
- notFound() renders the app's custom THAI not-found page ("ไม่พบหน้าเว็บ"); in dev it's
  HTTP 200 with that body. The reliable signal for "blocked" is absence of
  [data-testid="schedule-grid"], not the status code.
- PDF page counts: pypdf (python) works; grepping /Type/Page fails (compressed streams).
```

## Open items (priority order)

1. **Verify Excel opens** (browser-unverified — the headless harness can't reproduce the
   real-Chrome download bug). Re-test "ส่งออก Excel" / "สรุปสำหรับครู" → file lands as a
   proper `.xlsx` and opens in desktop Excel.
   - If still broken: switch export filenames to ASCII; inspect the actual downloaded bytes.
2. **Confirm print PDF layout** — single class/teacher/student = 1 landscape page, no sidebar.
3. **Integration decision** — merge to main (local), PR, or continue. Then final review +
   `superpowers:finishing-a-development-branch`.

## Key files

- `src/features/print/render-pdf.ts` — headless-Chromium URL→PDF (`CHROME_PATH` dev / `@sparticuz/chromium` prod).
- `src/features/print/cookies.ts` — cookie-header → puppeteer cookies (auth forwarding).
- `src/components/print/PrintShell.tsx`, `src/app/print.css`, `src/app/print/layout.tsx` — chrome-free print shell + `@page` orientation + fit-to-one-page CSS.
- `src/components/templates/Content.tsx` — bare-renders `/print/*` (no sidebar/shell). Also `Navbar.tsx` self-suppresses on `/print`.
- `src/app/print/{classes,teachers,student-table,teacher-table}/.../page.tsx` (+ `pdf/route.ts`) — print routes (all landscape; teacher-table bulk = one teacher/page).
- `src/features/schedule/loaders/{class-schedule,teacher-schedule,teacher-table}.ts` — shared loaders (`requirePublished` opt; default true keeps public routes gated).
- `src/utils/download-blob.ts` — robust browser download (DOM-append + deferred cleanup).
- ExcelJS exports: `src/features/export/teacher-timetable-excel.ts`,
  `…/all-timeslot/functions/ExportTeacherSummary.ts`, `…/student-table/function/ExportStudentTable.ts`,
  `…/all-program/function/ExportAllProgram.ts`.
- E2E: `e2e/export/pdf-export.spec.ts` (print-route render + access-control; PDF-handler cases gated behind `E2E_PDF_EXPORT=true` since they need a Chrome binary).
- Spec/plan: `docs/superpowers/specs/2026-06-16-unified-print-routes-design.md`,
  `docs/superpowers/plans/2026-06-16-unified-print-routes.md`.

## Notes / deferred

- `SemesterExportButton` keeps its own HTML-table summary print (a statistics report, not a
  timetable, no `/print` equivalent) — intentionally untouched.
- Pre-existing console warning on the all-timeslot dashboard screen: a `useMediaQuery`
  hydration mismatch in the toolbar `Stack` (not from this work).
- React Doctor flags "Page missing metadata" on the `/print/*` pages — false positive for
  headless-rendered print routes; left as-is.
```
