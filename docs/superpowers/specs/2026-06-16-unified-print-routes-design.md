# Unified Print → Server-Rendered PDF + Excel Export — Design

**Date:** 2026-06-16
**Status:** Approved (pending spec review)

## Context

Timetable printing is broken across the app. Two bad mechanisms are in use:

1. **`window.print()` on the live page** (public class/teacher pages via `PrintButton`;
   dashboard `all-timeslot`, `student-table`; `teacher-table` bulk). Prints the whole
   live DOM — app nav/sidebar/buttons, browser headers/footers, uncontrolled page breaks.
2. **`printElementAsPDF`** (`src/utils/export.utils.ts`): opens a new tab and writes the
   element's `innerHTML` with a tiny inline `<style>`. All Tailwind styling is lost and it
   auto-prints + auto-closes, so the user can't review.

Goal: a clean **`/print` HTML route per surface** (server-rendered, reuses `TimeslotGrid`,
chrome-free) that is then **rendered to a real PDF by headless Chromium** and opened in a
new tab. WYSIWYG with the screen (same component + recent break/slot fixes) AND a real PDF
file — no manual Ctrl+P. Each printable timetable also offers an Excel download.

## Goals

- One chrome-free `/print` HTML route per surface (reuse `TimeslotGrid`, no separate layout).
- A server PDF endpoint renders that `/print` route via headless Chromium → real PDF,
  opened inline in a new tab (user can save/print from the PDF viewer).
- **Single timetables (class, teacher, student) → portrait; all-timeslot master grid →
  landscape; teacher bulk → portrait, 2 per page (stacked).** Orientation drives both the
  print CSS and `page.pdf({ landscape })`.
- One shared print primitive (`PrintShell`) + one shared print stylesheet.
- **Each printable timetable also offers Excel export** (client download) alongside PDF.

## Non-Goals

- No **client-side** PDF library (pdfmake/@react-pdf) — it re-implements layout and drifts
  from the on-screen grid. PDF comes from rendering the real HTML.
- No user-facing print-customization UI (page size/margins). Fixed A4; orientation fixed
  per surface.

## Architecture

`/print` HTML route is the single render source. A sibling PDF route handler launches
headless Chromium, forwards the caller's session cookies, navigates to the `/print` URL,
waits for the grid, and returns `page.pdf(...)` bytes inline. Excel is a client action.

```
[PDF button] --window.open(pdfUrl,"_blank")--> [/.../print/pdf route handler (server)]
    -> launch Chromium, page.setCookie(caller cookies)
    -> page.goto(/.../print HTML route)        # same TimeslotGrid the screen uses
    -> wait for [data-testid=schedule-grid]
    -> page.pdf({ format:"A4", landscape:<surface>, printBackground:true })
    -> Response(pdf, Content-Type: application/pdf, Content-Disposition: inline)
    -> new tab shows real PDF (download/print from viewer)

[Excel button] --client--> build rows -> arrayToExcelHTML -> downloadExcel(.xls)
```

## Components

### `PrintShell` — `src/components/print/PrintShell.tsx`
Chrome-free wrapper for the `/print` HTML routes.
- **Does:** renders a title + `children` (the timetable), no app nav/sidebar; keeps global
  styles so `TimeslotGrid` matches the screen; applies shared print CSS; injects
  `@page { size: A4 <orientation> }`. No floating button needed (PDF is generated server
  side), but include a `print:hidden` "บันทึก PDF" link for direct human use of the route.
- **Props:** `title: string`, `children: ReactNode`, `orientation?: "portrait" | "landscape"`
  (default `"portrait"`).

### PDF render service — `src/features/print/render-pdf.ts`
- `renderUrlToPdf(url, { landscape, cookies }): Promise<Buffer>`.
- Launches Chromium, sets cookies, navigates, waits for `schedule-grid`, returns PDF.
- **Env split:** production/Vercel uses `puppeteer-core` + `@sparticuz/chromium`; local dev
  uses a locally installed Chrome (executable path) — selected at runtime. Fluid Compute
  tolerates the heavier function; PDF render runs within the 300s function budget.

### Shared print CSS
Single source (new `src/app/print.css` imported by `PrintShell`), replacing the scattered
`@media print` blocks (`globals.css`, `student-table`, `all-timeslot`, `SemesterExportButton`).
- `@page { size: A4 <orientation>; margin: 10mm }`; per-card `break-inside: avoid`.
- single timetable: fit-to-width for the ~11-column grid on portrait.
- bulk teacher: two cards per page (portrait, stacked).
- all-timeslot: landscape, fit-to-width.

### Excel export
Sibling "Export Excel" action on each printable table.
- Teacher: reuse `exportTeacherTable` (`src/features/export/teacher-timetable-excel.ts`).
- Class/student: add parallel row builders → `arrayToExcelHTML` + `downloadExcel`
  (`src/utils/export.utils.ts`). Pure client; no server route.

## Routes

HTML render source + PDF handler per surface (data fetched via the same repositories the
main views use, so no client-state coupling):

| Surface | HTML route | PDF handler | Orientation |
|---|---|---|---|
| Public class | `(public)/classes/[gradeId]/[ay]/[sem]/print` | `…/print/pdf/route.ts` | portrait |
| Public teacher | `(public)/teachers/[id]/[ay]/[sem]/print` | `…/print/pdf/route.ts` | portrait |
| Dashboard student-table | `dashboard/[ay]/[sem]/student-table/print` | `…/print/pdf/route.ts` | portrait |
| Dashboard all-timeslot | `dashboard/[ay]/[sem]/all-timeslot/print` | `…/print/pdf/route.ts` | landscape |
| Dashboard teacher bulk | `dashboard/[ay]/[sem]/teacher-table/print?ids=1,2,3` | `…/print/pdf/route.ts?ids=…` | portrait, 2/page |

## Triggers

- Public `PrintButton` and dashboard `handlePrint`/bulk button → `window.open(pdfUrl,"_blank")`
  (bulk passes selected ids). Each surface also gets an "Export Excel" button.

## Error handling / auth

- Public `/print` routes reuse existing guards: invalid params → `notFound()`; unpublished
  (DRAFT) term → `notFound()`.
- **Auth propagation:** the PDF route handler runs with the caller's session; it forwards
  the caller's cookies into the headless page (`page.setCookie`) before navigating, so
  protected dashboard `/print` routes authenticate as the same admin. Public routes need no
  cookies.
- PDF render failure (Chromium launch/timeout) → 500 with a clear message; button surfaces a
  toast. Navigation guard failures propagate the route's own 404.

## Cleanup

- Delete `printElementAsPDF` from `src/utils/export.utils.ts`.
- Remove dead `@media print` blocks once shared print CSS covers them.
- Reuse Excel utilities; migrate `SemesterExportButton`'s print-window path to the PDF route
  + Excel util where it overlaps.

## Testing

- Unit: `PrintShell` renders title + children, hides chrome, emits correct `@page` orientation.
- Unit: orientation map (surface → portrait/landscape); class/student Excel row builders.
- Integration: `renderUrlToPdf` returns a non-empty `application/pdf` buffer for a known
  print URL (local Chrome in CI).
- E2E: extend `e2e/export/pdf-export.spec.ts` — each `/print` HTML route renders
  `schedule-grid`; each PDF handler returns `Content-Type: application/pdf` with non-trivial
  size; Excel button triggers a download.
- Visual baselines via CI (per project rule — not run locally).

## Risks

- **Serverless weight:** Chromium increases function size/cold-start. Mitigated by
  `@sparticuz/chromium` (Vercel-tuned) + Fluid Compute. Acceptable per approval.
- **Auth propagation** is the trickiest piece — cookie forwarding must be verified for
  dashboard routes.

## Open questions

None. (Server-rendered real PDF via headless Chromium; single = portrait, all-timeslot =
landscape; Excel in scope; no client PDF lib.)
