# Public + Dashboard Tables Redesign — Design Spec

**Date:** 2026-05-28
**Status:** Approved, awaiting implementation plan
**Scope:** Visual + interaction redesign for four table contexts shared across public and dashboard surfaces:
1. Student list table (public landing `PublicClassesTable` + dashboard `student-table`)
2. Teacher list table (public landing `PublicTeachersTable` + dashboard `teacher-table`)
3. All-program table (dashboard `all-program`; semantics preserved)
4. Weekly timeslot grid (public `/teachers/[id]/[y]/[s]`, public `/classes/[gradeId]/[y]/[s]`, dashboard `all-timeslot`)

No data model changes. No new routes. Visual + responsive + shared-component refactor only.

---

## 1. Design Direction — Modern Minimal

Flat cards, generous whitespace, neutral slate palette + one accent per page:

| Surface  | Accent          | Hex      |
|----------|-----------------|----------|
| Teacher  | Blue            | `#2563eb`|
| Student  | Emerald         | `#10b981`|
| Program  | Amber           | `#f59e0b`|
| Timeslot | (per subject — see §4.1) |  |

Existing landing hero (gradient + glassmorphism) **stays unchanged**. Hero is the brand moment; table sections sit on calm `bg-slate-50` canvas below. No glass extension into tables.

Add semantic Tailwind tokens:
```ts
// tailwind.config.ts
theme.extend.colors = {
  accent: { teacher: '#2563eb', class: '#10b981', program: '#f59e0b' }
}
```

---

## 2. Student + Teacher List Tables

Symmetric pattern; one component family, two configs.

### 2.1 Layout
- **Desktop (≥md):** two-column shell — left faceted sidebar (`240px`), right card grid (2/3/4 cols at md/lg/xl).
- **Mobile (<md):** sidebar collapses to drawer triggered by filter button in top toolbar; cards stack 1-col.

### 2.2 Card content
```
┌─────────────────────────────┐
│ [SM]  สมชาย ใจดี            │
│       คณิตศาสตร์ · 22 คาบ   │
│                  ตาราง →   │
└─────────────────────────────┘
```
- **Monogram avatar:** first Thai grapheme cluster of given name (after stripping prefixes `นาย`, `นาง`, `นางสาว`, `น.ส.`, `เด็กชาย`, `เด็กหญิง`, `ด.ช.`, `ด.ญ.`). 32×32 rounded square, gradient bg derived from hashed ID. Grade cards use `ม.{Year}` numeral as the monogram label instead of a name initial.
- **Primary line:** full name (teacher) or `ม.{Year}/{Number}` (student).
- **Secondary line:** department (teacher) or program name (student) · period count.
- **Action:** `ตาราง →` link to weekly grid for the current term.

### 2.3 Faceted sidebar
- **Teacher list:** group by `Department` (count badge per group, "ทั้งหมด" entry at top).
- **Student list:** group by `Year` (ม.1 / ม.2 / ม.3 / ม.4 / ม.5 / ม.6).
- Active filter highlighted with accent bg + text color.
- Persists in URL query (`?dept=คณิตศาสตร์` or `?year=1`).
- Search box above sidebar list filters both the cards (by name) and the sidebar (matching dept/year).
- Sort dropdown above grid: name asc/desc, period count desc, department.

### 2.4 Pagination
Reuse existing `TablePagination` component with page-N navigation. URL `?page=N` for shareability and print. Landing currently loads all rows once and filters client-side (per `src/app/(public)/page.tsx:48`) — keep that pattern; dashboard variants paginate server-side over larger sets.

### 2.5 Dashboard parity
Same layout, plus row-hover overlay with:
- Edit pencil → `/management/teacher/[id]` or `/management/gradelevel/[id]`
- Lock badge (small icon) when teacher/grade has any locked schedule entry for current term.
- No other admin chrome — keep public/dashboard visually aligned.

### 2.6 New / reused components
- `src/components/public/PersonCard.tsx` — generic card, props `{ id, name, secondary, metric, href, avatar }`
- `src/components/public/FilterSidebar.tsx` — group list + counts + drawer mode
- `src/components/public/ListToolbar.tsx` — search + sort
- `src/lib/ui/monogram.ts` — Thai grapheme-safe initial extraction + hashed gradient

---

## 3. All-Program Table

Semantics preserved. Visual layer + responsive swap added.

### 3.1 Desktop (≥md)
- Existing matrix kept: rows = subjects grouped under category headers, columns = `นก` (credits) + grade-year columns + sum row.
- **Category color bands** added:
  - Category header row gets bg tint matching its color band.
  - Member subject rows get a 3px left border in the same color.
  - Sum row keeps its existing emphasis (bold + slate bg).

| Category    | Header bg  | Header text | Stripe   |
|-------------|------------|-------------|----------|
| `CORE`      | `#eff6ff`  | `#1e40af`   | `#3b82f6`|
| `ADDITIONAL`| `#fef3c7`  | `#92400e`   | `#f59e0b`|
| `ACTIVITY`  | `#dcfce7`  | `#166534`   | `#10b981`|

- Implemented as CSS classes layered onto current `renderCategoryRow` / `renderSubjectRows` output. **No render-pipeline rewrite.**

### 3.2 Mobile (<md)
- Table-to-card swap. One card per category, accent border on left matches band color.
- Inside each card: subject rows rendered as a stacked list — each subject row shows name + credit on top line, per-year period counts as small chips on a horizontal-scroll strip (`overflow-x-auto`) below. No horizontal scroll on cards themselves.
- Sum row becomes a footer card with totals per grade-year as chips.

### 3.3 Dashboard variant
Same look as public would be — except this table is dashboard-only today (`src/app/dashboard/[academicYear]/[semester]/all-program/page.tsx`). Add inline credit-deficit warning chips on the sum row (cells where credit total < MOE minimum get amber border + tooltip). Reuses existing publish-gate logic.

---

## 4. Weekly Timeslot Grid

Shared component for the two **single-entity** contexts: public teacher page and public class page.

> **DESCOPED 2026-05-29 (Task 8):** The dashboard `all-timeslot` view is a teacher-row × period-column matrix that aggregates **every teacher at once** (rows = `TeacherList`, columns = `TableHead`/`TableBody`/`TableResult`, header "ตารางสรุปภาครวม"), with Excel/PDF export coupled to its `timeSlotData.Columns` structure. `TimeslotGrid` holds one `ScheduleCell` per `TimeslotID` and structurally cannot represent N teachers teaching in parallel during the same slot. Per user decision, the matrix stays and `all-timeslot` is **excluded** from this shared-grid migration. Wherever this spec (§4.3 "all view", §4.6, §4.7) describes `all-timeslot` as a day×period grid, that no longer applies. `buildGridRows` retains its `mode: "all"` branch as a tested utility; it is simply unused by `all-timeslot`. A follow-up issue may align only the matrix's break detection with the v2 model for consistency.

### 4.1 Cell color
Deterministic hash: `SubjectCode → HSL`.
```ts
function subjectHue(code: string): number {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) % 360;
  return h;
}
// bg:     hsl(h, 70%, 95%)
// stripe: hsl(h, 60%, 35%)
// text:   hsl(h, 55%, 20%)
```
Same subject → same color across all three grids and all terms. Zero DB change.

### 4.2 Cell content
- **Primary:** subject short name.
- **Code:** `ค31101` in muted text below.
- **Counterparty:** grade `ม.1/1` for teacher view, teacher name for class view, both for all-timeslot.
- **Room:** if present, `ห้อง 201`.
- **Empty:** centered `—` in `text-slate-300`.

Cell padding: `8px 10px`. Min width: `120px`. Wraps content; no truncation.

### 4.3 Break/lunch row
The break system was reworked in `docs/superpowers/specs/2026-05-03-break-system-rework-design.md` and is partially live. Detection and labeling MUST go through the v2 model — do not switch on legacy enum values.

**Data sources (all already present):**
- `timeslot.Breaktime` enum (`prisma/schema.prisma:284`) — used only as a coarse "is this slot a break?" flag. Legacy `BREAK_JUNIOR | BREAK_SENIOR | BREAK_BOTH` and current `BREAK` all count as breaks; `NOT_BREAK` is teaching.
- `table_config.Config.breakDefinitions: BreakDefinition[]` (`src/features/timeslot/domain/models/break.types.ts:8`) — supplies `id`, `label`, `slotNumber`, `duration`, `color`, `groups[]` (group names or `"*"`).
- Helpers `isBreakForGrade(breaktime, gradeLevel, slotNumber, breakDefinitions, gradeId)` and `isBreakForTeacher(breaktime, slotNumber, breakDefinitions)` (`src/utils/break-utils.ts`) — single source of truth for "is this cell a break?" Use them; do not write parallel logic.

**Rendering rules:**
- **Class view** (`/(public)/classes/[gradeId]/...`): for each gap between sorted teaching timeslots, find every `BreakDefinition` whose `slotNumber` matches the next teaching period and whose `groups` includes `"*"` or the grade's group name. Render a single break row per matching definition, in `slotNumber` order. Label = `def.label`, accent color = `def.color`.
- **Teacher view** (`/(public)/teachers/[id]/...`): render only definitions with `groups: ["*"]` as break rows (teachers are not in a grade group). Other definitions render as muted gap rows without label, so totals still line up.
- **All-timeslot view** (dashboard): render every distinct `BreakDefinition` as its own row in `slotNumber` order. When two definitions share a `slotNumber` (e.g., junior and senior staggered), render them as a single merged row with both labels separated by `·`. Per `break-system-rework-design.md §2 Panel C`, Junior/Senior previews already display side-by-side; for the all-timeslot grid we collapse to one row with two labels for compactness, but keep distinct colors as left stripes on the day cells beneath.
- **Period numbering skips break rows.** Users see `1, 2, 3, 4, [break row], 5, 6, 7`. Break rows get no period number; time column shows only the break label.
- Sequential period count derived by walking sorted timeslots and incrementing only on `NOT_BREAK`, not parsed from `TimeslotID` suffix.

**Backward-compat for legacy enum-only data:** when a config has no `breakDefinitions` array (pre-v2 terms), fall back to today's behavior — render a generic `— พัก —` row whenever `Breaktime != NOT_BREAK`. No new code path; the existing helpers already handle this case.

**Color:** break-row accent comes from `def.color`. This is the **one exception** to §4.1's "color = hash of SubjectCode" rule — break rows are not subjects, and admins explicitly pick their color in the wizard (`TimeslotConfigurationStep` Panel A/B).

**New utility (replaces §5.1 `break-rows.ts`):** `src/lib/ui/break-rows.ts` exposes one function:
```ts
type RenderedRow =
  | { kind: 'teaching'; period: number; slots: Timeslot[] }      // one per day at this period
  | { kind: 'break'; defs: BreakDefinition[] };                  // one or more defs sharing a slotNumber

function buildGridRows(
  timeslots: Timeslot[],
  breakDefs: BreakDefinition[],
  view: { mode: 'teacher' } | { mode: 'class'; gradeId: string; gradeLevel: number } | { mode: 'all' }
): RenderedRow[];
```
All three grid contexts call this. Period numbers, break ordering, group-tier filtering, and the legacy enum fallback are all encapsulated here.

### 4.4 Mobile (<640px)
Swap grid → **agenda list**:
- Five day cards stacked vertically.
- Each card lists its periods as chips colored with the subject hash.
- Per-day period count shown in card header.
- Break rows still inserted as labeled separators.

### 4.5 Print
```css
@media print {
  .timeslot-grid { display: table; }       /* force grid even if mobile */
  .timeslot-agenda { display: none; }
  .timeslot-cell { background: white !important; }
  .timeslot-cell { border-left: 4px solid var(--subject-stripe); }
  /* stripe survives B&W, bg tint drops */
}
```

### 4.6 Shared component
Extract `src/components/schedule/TimeslotGrid.tsx`:
```ts
type Props = {
  timeslots: Timeslot[]; // sorted, includes break flags
  schedules: ScheduleEntry[];
  mode: 'teacher' | 'class' | 'all';
  showRoom?: boolean;
  showTeacher?: boolean;
  showGrade?: boolean;
};
```
Migrate the three current consumers to use it. Preserve all existing `data-testid` attributes:
- `schedule-grid`, `schedule-empty` (cell-level)
- `teacher-name`, `class-name` (page-level) — owned by parent pages, untouched.

### 4.7 Dashboard parity
`all-timeslot` view adds:
- Lock badge in cells where `class_schedule.IsLocked = true`.
- Click cell → opens existing inspector drawer.
- Row hover shows admin actions (edit, unlock).
No layout divergence from public.

---

## 5. Cross-Cutting

### 5.1 Shared utilities
| Path | Purpose |
|------|---------|
| `src/lib/ui/subject-color.ts` | `subjectHue`, `subjectColors(code)` returning `{ bg, stripe, text }` |
| `src/lib/ui/monogram.ts` | Thai grapheme-safe initial + hashed gradient |
| `src/lib/ui/break-rows.ts` | `buildGridRows()` — merge sorted timeslots + `BreakDefinition[]` into ordered `RenderedRow[]` with teaching periods renumbered (see §4.3 signature). Delegates break detection to `isBreakForGrade` / `isBreakForTeacher` from `src/utils/break-utils.ts`. |

### 5.2 Test ID preservation
All e2e selectors stay: `schedule-grid`, `schedule-empty`, `teacher-name`, `class-name`, `sign-in-button`. New components add their own (`person-card`, `filter-sidebar`, `program-category-band`) without removing any.

### 5.3 Accessibility
- All color bands and stripes carry a non-color signal too (text label, border weight, icon).
- Cards are real `<article>` with semantic headings.
- Filter sidebar uses `<nav aria-label>`.
- Print stylesheet retains border-based subject identity.

### 5.4 Out of scope
- No schema migrations.
- No new routes.
- No changes to landing hero, sign-in flow, or charts section.
- No changes to scheduling wizard or assignment pages.
- No changes to authentication.
- **Break system v2 implementation work** — the in-progress rework specced in `docs/superpowers/specs/2026-05-03-break-system-rework-design.md` is a prerequisite, not part of this redesign. This redesign **consumes** the v2 model (already partly live: `break_group` tables exist, `BreakDefinition` types exist, helpers exist) and is robust to legacy enum-only data via the fallback path in §4.3. If v2 Phase 3 cleanup removes legacy enum values during/after this work, the fallback path becomes dead code and can be deleted in a follow-up.

### 5.5 Migration order (for plan)
1. Shared utilities (`subject-color`, `monogram`, `break-rows`).
2. `TimeslotGrid` component + migrate three consumers.
3. `PersonCard` + `FilterSidebar` + `ListToolbar` + migrate teacher list.
4. Migrate student list.
5. All-program color bands (CSS-only layer).
6. All-program mobile card swap.
7. Dashboard inline actions (edit/lock overlays).
8. Print stylesheet pass.

Each step is independently shippable behind no flag — pure refactor of presentation.

---

## 6. Open Questions Resolved During Brainstorm

| # | Question | Answer |
|---|----------|--------|
| 1 | Public-only or dashboard too? | Both — shared design language |
| 2 | All-program format kept? | Yes — layout shift permitted (card stack on mobile) |
| 3 | Subject color source? | Auto-hash `SubjectCode` |
| 4 | Dashboard parity? | Mirror public + inline row actions |
| 5 | Break row? | Yes — consume v2 `BreakDefinition[]` + `isBreakForGrade/Teacher` helpers (per `2026-05-03-break-system-rework-design.md`). No new schema. No period number on break rows. Legacy enum-only configs fall back to a generic break row. |
| 6 | Pagination? | Keep page-N navigation |

---

## 7. Risks

- **Color hash collisions:** subjects close in code (`ค31101` vs `ค31102`) get nearly identical colors. Mitigation: re-hash on bottom byte if code starts with same prefix, OR accept that adjacent codes = adjacent topics = adjacent colors is fine.
- **Thai monogram edge cases:** names starting with `น.ส.` prefix, compound names. Mitigation: strip known prefixes (`นาย`, `นาง`, `น.ส.`, `นางสาว`) before extracting initial.
- **Print stylesheet regression:** changing cell background may break existing landscape print. Mitigation: explicit `@media print` overrides; manual print-preview check on each grid context.
- **Existing tests:** any selector renames break e2e. Mitigation: preserve all existing `data-testid` values; only add new ones.
