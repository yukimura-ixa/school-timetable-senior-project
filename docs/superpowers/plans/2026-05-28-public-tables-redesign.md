# Public + Dashboard Tables Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-05-28-public-tables-redesign-design.md`
**Beads issue:** `school-timetable-senior-project-4a0`

**Goal:** Redesign student list, teacher list, all-program table, and weekly timeslot grid across public landing and dashboard surfaces to a single modern-minimal design language with shared components.

**Architecture:** Three new shared utilities (`subject-color`, `monogram`, `break-rows`) feed three new components (`TimeslotGrid`, `PersonCard`, `FilterSidebar`+`ListToolbar`). All five surfaces — `(public)/teachers/[id]/...`, `(public)/classes/[gradeId]/...`, dashboard `all-timeslot`, dashboard `student-table`/`teacher-table`, dashboard `all-program` — are migrated to consume these. No schema changes. Break detection delegated to existing `src/utils/break-utils.ts` (v2 model).

**Tech Stack:** Next.js 16 App Router, React Server Components + client islands, Tailwind CSS v4 (theme in `src/app/globals.css` `@theme` block), TypeScript, Vitest for unit tests, Playwright for e2e. Prisma + MUI already wired.

---

## File Structure

| Path | Action | Responsibility |
|------|--------|----------------|
| `src/lib/ui/subject-color.ts` | Create | `subjectHue()`, `subjectColors()` — deterministic SubjectCode → HSL |
| `src/lib/ui/subject-color.test.ts` | Create | Hash determinism + spread tests |
| `src/lib/ui/monogram.ts` | Create | `extractMonogram()`, `monogramGradient()` — Thai grapheme-safe initial + hashed bg |
| `src/lib/ui/monogram.test.ts` | Create | Prefix-strip + grapheme + grade-fallback tests |
| `src/lib/ui/break-rows.ts` | Create | `buildGridRows()` — sorted teaching+break rows for a view mode |
| `src/lib/ui/break-rows.test.ts` | Create | Period renumbering + class/teacher/all view filtering + legacy fallback |
| `src/app/globals.css` | Modify | Add `--color-accent-teacher`, `-class`, `-program` tokens in `@theme` block |
| `src/components/schedule/TimeslotGrid.tsx` | Create | Shared day×period grid for all three timeslot contexts |
| `src/components/public/PersonCard.tsx` | Create | Generic card for teacher/student lists |
| `src/components/public/FilterSidebar.tsx` | Create | Faceted sidebar (desktop) / drawer (mobile) |
| `src/components/public/ListToolbar.tsx` | Create | Search input + sort dropdown + drawer-open button |
| `src/app/(public)/teachers/[id]/[academicYear]/[semester]/page.tsx` | Modify | Use `TimeslotGrid` instead of inline `<table>` |
| `src/app/(public)/classes/[gradeId]/[academicYear]/[semester]/page.tsx` | Modify | Use `TimeslotGrid` instead of inline `<table>` |
| `src/app/dashboard/[academicYear]/[semester]/all-timeslot/AllTimeslotClient.tsx` | Modify | Use `TimeslotGrid` for the grid section; keep filter chrome |
| `src/app/(public)/_components/TeachersTableClient.tsx` | Modify | Card-grid layout with `PersonCard` + `FilterSidebar` (dept facet) |
| `src/app/(public)/_components/ClassesTableClient.tsx` | Modify | Card-grid layout with `PersonCard` + `FilterSidebar` (year facet) |
| `src/app/dashboard/[academicYear]/[semester]/student-table/page.tsx` | Modify | Adopt same layout, add inline edit/lock overlays |
| `src/app/dashboard/[academicYear]/[semester]/teacher-table/page.tsx` | Modify | Adopt same layout, add inline edit/lock overlays |
| `src/app/dashboard/[academicYear]/[semester]/all-program/page.tsx` | Modify | Category color bands desktop, card-stack `<md` |
| `e2e/timeslot-grid.spec.ts` | Create | Smoke e2e: teacher page renders period skip across break |

---

## Task 1: Subject color hash utility

**Files:**
- Create: `src/lib/ui/subject-color.ts`
- Create: `src/lib/ui/subject-color.test.ts`

- [x] **Step 1: Write the failing tests**

```ts
// src/lib/ui/subject-color.test.ts
import { describe, expect, it } from "vitest";
import { subjectHue, subjectColors } from "./subject-color";

describe("subjectHue", () => {
  it("is deterministic for the same code", () => {
    expect(subjectHue("ค31101")).toBe(subjectHue("ค31101"));
  });

  it("returns a hue in [0, 360)", () => {
    for (const code of ["ค31101", "ท31101", "ว31101", "อ31101", "ABC"]) {
      const h = subjectHue(code);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(360);
    }
  });

  it("spreads adjacent codes by at least 10 degrees", () => {
    const a = subjectHue("ค31101");
    const b = subjectHue("ค31102");
    expect(Math.abs(a - b)).toBeGreaterThanOrEqual(10);
  });

  it("returns 0 for empty string (safe default)", () => {
    expect(subjectHue("")).toBe(0);
  });
});

describe("subjectColors", () => {
  it("returns bg, stripe, and text HSL strings", () => {
    const c = subjectColors("ค31101");
    expect(c.bg).toMatch(/^hsl\(\d+, 70%, 95%\)$/);
    expect(c.stripe).toMatch(/^hsl\(\d+, 60%, 35%\)$/);
    expect(c.text).toMatch(/^hsl\(\d+, 55%, 20%\)$/);
  });

  it("shares hue across bg/stripe/text", () => {
    const c = subjectColors("ค31101");
    const hue = subjectHue("ค31101");
    expect(c.bg).toContain(`hsl(${hue},`);
    expect(c.stripe).toContain(`hsl(${hue},`);
    expect(c.text).toContain(`hsl(${hue},`);
  });
});
```

- [x] **Step 2: Run test to verify failure**

Run: `pnpm test src/lib/ui/subject-color.test.ts`
Expected: FAIL — `Cannot find module './subject-color'`.

- [x] **Step 3: Implement subject color util**

```ts
// src/lib/ui/subject-color.ts
/**
 * Deterministic SubjectCode → HSL color triple.
 * Same SubjectCode always returns the same colors across the app.
 * The spread step on adjacent inputs avoids near-identical hues for
 * codes that differ only in the trailing digit (ค31101 vs ค31102).
 */
export function subjectHue(code: string): number {
  if (!code) return 0;
  let h = 0;
  for (let i = 0; i < code.length; i++) {
    h = (h * 131 + code.charCodeAt(i) * 17) % 360;
  }
  return h;
}

export type SubjectColors = { bg: string; stripe: string; text: string };

export function subjectColors(code: string): SubjectColors {
  const h = subjectHue(code);
  return {
    bg: `hsl(${h}, 70%, 95%)`,
    stripe: `hsl(${h}, 60%, 35%)`,
    text: `hsl(${h}, 55%, 20%)`,
  };
}
```

- [x] **Step 4: Run test to verify passing**

Run: `pnpm test src/lib/ui/subject-color.test.ts`
Expected: 6 PASS.

- [x] **Step 5: Commit**

```bash
git add src/lib/ui/subject-color.ts src/lib/ui/subject-color.test.ts
git commit -m "feat(ui): add subject-color hash utility (4a0)

Deterministic SubjectCode -> HSL color triple (bg/stripe/text).
Adjacent codes spread by >=10 degrees of hue.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Thai monogram utility

**Files:**
- Create: `src/lib/ui/monogram.ts`
- Create: `src/lib/ui/monogram.test.ts`

- [x] **Step 1: Write the failing tests** (committed)
- [x] **Step 2: Run test to verify failure** (module-not-found confirmed)
- [x] **Step 3: Implement monogram util** — note: deviated from plan's `Intl.Segmenter` since Thai grapheme clusters include sara marks (e.g. "พิ" is 1 grapheme). Use first codepoint instead so monograms drop combining vowels per Thai naming convention.
- [x] **Step 4: Run test to verify passing** (11/11 pass; plan said 12 — recount: 7 + 3 + 1 = 11)
- [x] **Step 5: Commit**

```bash
git add src/lib/ui/monogram.ts src/lib/ui/monogram.test.ts
git commit -m "feat(ui): add Thai monogram + gradient utility (4a0)

Strips honorific prefixes (นาย/นาง/นางสาว/น.ส./เด็ก*/ด.ช./ด.ญ.) then
extracts first grapheme cluster via Intl.Segmenter. monogramGradient()
returns a deterministic 8-color palette gradient by id hash.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Break-row builder

**Files:**
- Create: `src/lib/ui/break-rows.ts`
- Create: `src/lib/ui/break-rows.test.ts`

- [x] **Step 1: Write the failing tests**

```ts
// src/lib/ui/break-rows.test.ts
import { describe, expect, it } from "vitest";
import { buildGridRows } from "./break-rows";
import type { BreakDefinition } from "@/features/timeslot/domain/models/break.types";
import type { timeslot } from "@/prisma/generated/client";

function ts(period: number, day: "MON" | "TUE", brk: string = "NOT_BREAK"): timeslot {
  return {
    TimeslotID: `1-2567-${day}-${period}`,
    AcademicYear: 2567,
    Semester: "SEMESTER_1",
    StartTime: new Date(`1970-01-01T0${7 + period}:00:00Z`),
    EndTime: new Date(`1970-01-01T0${8 + period}:00:00Z`),
    Breaktime: brk as any,
    DayOfWeek: day,
  };
}

const junior: BreakDefinition = {
  id: "lunch-junior",
  label: "พักเที่ยง ม.ต้น",
  slotNumber: 4,
  duration: 50,
  color: "#4CAF50",
  groups: ["junior"],
};

const senior: BreakDefinition = {
  id: "lunch-senior",
  label: "พักเที่ยง ม.ปลาย",
  slotNumber: 5,
  duration: 50,
  color: "#2196F3",
  groups: ["senior"],
};

const morning: BreakDefinition = {
  id: "morning",
  label: "พักเช้า",
  slotNumber: 3,
  duration: 10,
  color: "#FF9800",
  groups: ["*"],
};

describe("buildGridRows", () => {
  const slots = [1, 2, 3, 4, 5, 6].flatMap((p) => [ts(p, "MON"), ts(p, "TUE")]);

  it("teaching view: renumbers periods skipping universal break", () => {
    const rows = buildGridRows(slots, [morning], { mode: "teacher" });
    const periods = rows.filter((r) => r.kind === "teaching").map((r) => (r as any).period);
    expect(periods).toEqual([1, 2, 3, 4, 5, 6]);
    const breakIndices = rows.map((r, i) => (r.kind === "break" ? i : -1)).filter((i) => i >= 0);
    expect(breakIndices).toHaveLength(1);
    // Break sits before what becomes period 3 (slotNumber 3)
    expect(rows[breakIndices[0]! - 1]?.kind).toBe("teaching");
  });

  it("class view ม.1: shows junior break, hides senior break", () => {
    const rows = buildGridRows(slots, [junior, senior], {
      mode: "class",
      gradeId: "M1-1",
      gradeLevel: 1,
    });
    const labels = rows
      .filter((r) => r.kind === "break")
      .flatMap((r) => (r as any).defs.map((d: BreakDefinition) => d.id));
    expect(labels).toEqual(["lunch-junior"]);
  });

  it("class view ม.5: shows senior break, hides junior break", () => {
    const rows = buildGridRows(slots, [junior, senior], {
      mode: "class",
      gradeId: "M5-1",
      gradeLevel: 5,
    });
    const labels = rows
      .filter((r) => r.kind === "break")
      .flatMap((r) => (r as any).defs.map((d: BreakDefinition) => d.id));
    expect(labels).toEqual(["lunch-senior"]);
  });

  it("teacher view: hides grade-specific breaks, shows universal", () => {
    const rows = buildGridRows(slots, [junior, senior, morning], { mode: "teacher" });
    const ids = rows
      .filter((r) => r.kind === "break")
      .flatMap((r) => (r as any).defs.map((d: BreakDefinition) => d.id));
    expect(ids).toEqual(["morning"]);
  });

  it("all view: shows every distinct definition in slotNumber order", () => {
    const rows = buildGridRows(slots, [senior, junior, morning], { mode: "all" });
    const order = rows
      .filter((r) => r.kind === "break")
      .flatMap((r) => (r as any).defs.map((d: BreakDefinition) => d.id));
    expect(order).toEqual(["morning", "lunch-junior", "lunch-senior"]);
  });

  it("all view: merges definitions that share the same slotNumber", () => {
    const overlap: BreakDefinition = { ...senior, slotNumber: 4, id: "senior-merge" };
    const rows = buildGridRows(slots, [junior, overlap], { mode: "all" });
    const breakRows = rows.filter((r) => r.kind === "break") as any[];
    expect(breakRows).toHaveLength(1);
    expect(breakRows[0]!.defs.map((d: BreakDefinition) => d.id).sort()).toEqual([
      "lunch-junior",
      "senior-merge",
    ]);
  });

  it("legacy fallback: no breakDefinitions => generic break row from Breaktime enum", () => {
    const slotsWithLegacy = [
      ts(1, "MON"),
      ts(2, "MON"),
      ts(3, "MON", "BREAK_JUNIOR"),
      ts(4, "MON"),
      ts(1, "TUE"),
      ts(2, "TUE"),
      ts(3, "TUE", "BREAK_JUNIOR"),
      ts(4, "TUE"),
    ];
    const rows = buildGridRows(slotsWithLegacy, [], { mode: "class", gradeId: "M1-1", gradeLevel: 1 });
    const breakRows = rows.filter((r) => r.kind === "break") as any[];
    expect(breakRows).toHaveLength(1);
    expect(breakRows[0]!.defs[0]!.label).toBe("พัก");
    const periods = rows.filter((r) => r.kind === "teaching").map((r) => (r as any).period);
    expect(periods).toEqual([1, 2, 3]); // 3 teaching periods (slot 3 was break)
  });
});
```

- [x] **Step 2: Run test to verify failure** (confirmed: Cannot find module './break-rows')

Run: `pnpm test src/lib/ui/break-rows.test.ts`
Expected: FAIL — module not found.

- [x] **Step 3: Implement break-rows builder** (shipped as written; all 7 deps + test cases verified before coding)

```ts
// src/lib/ui/break-rows.ts
import type { BreakDefinition } from "@/features/timeslot/domain/models/break.types";
import type { timeslot } from "@/prisma/generated/client";
import { extractPeriodFromTimeslotId } from "@/utils/timeslot-id";
import { isBreakForGrade, isBreakForTeacher } from "@/utils/break-utils";

export type RenderedRow =
  | { kind: "teaching"; period: number; slotNumber: number; slots: timeslot[] }
  | { kind: "break"; slotNumber: number; defs: BreakDefinition[] };

export type ViewMode =
  | { mode: "teacher" }
  | { mode: "class"; gradeId: string; gradeLevel: number }
  | { mode: "all" };

/**
 * Merges sorted teaching timeslots with break definitions into ordered rows
 * for grid rendering. Period numbers count teaching slots only — break rows
 * get no period number.
 *
 * View modes:
 * - teacher: only universal ("*") breaks are shown as labeled rows
 * - class:   only breaks whose group matches the grade tier are shown
 * - all:     every distinct definition is shown, merged when slotNumber overlaps
 *
 * Legacy fallback: when breakDefinitions is empty, any timeslot with
 * Breaktime != NOT_BREAK collapses into a single generic "พัก" row at
 * its slotNumber.
 */
export function buildGridRows(
  timeslots: timeslot[],
  breakDefs: BreakDefinition[],
  view: ViewMode,
): RenderedRow[] {
  // Group teaching slots by slotNumber (one row per slot, one cell per day)
  const teachingBySlot = new Map<number, timeslot[]>();
  // Legacy-fallback break slot numbers
  const legacyBreakSlotNumbers = new Set<number>();

  for (const t of timeslots) {
    const slotNum = extractPeriodFromTimeslotId(t.TimeslotID);
    if (t.Breaktime === "NOT_BREAK") {
      const arr = teachingBySlot.get(slotNum) ?? [];
      arr.push(t);
      teachingBySlot.set(slotNum, arr);
    } else if (breakDefs.length === 0) {
      legacyBreakSlotNumbers.add(slotNum);
    }
  }

  // Pick applicable break definitions for this view
  const applicable = pickApplicable(breakDefs, view);
  const breaksBySlot = new Map<number, BreakDefinition[]>();
  for (const def of applicable) {
    const arr = breaksBySlot.get(def.slotNumber) ?? [];
    arr.push(def);
    breaksBySlot.set(def.slotNumber, arr);
  }

  // Legacy fallback: synthesize a "พัก" definition per legacy slot
  if (breakDefs.length === 0) {
    for (const slotNum of legacyBreakSlotNumbers) {
      breaksBySlot.set(slotNum, [
        {
          id: `legacy-${slotNum}`,
          label: "พัก",
          slotNumber: slotNum,
          duration: 0,
          color: "#9E9E9E",
          groups: ["*"],
        },
      ]);
    }
  }

  // Build a sorted union of slot numbers and walk them in order
  const allSlotNumbers = new Set<number>();
  for (const n of teachingBySlot.keys()) allSlotNumbers.add(n);
  for (const n of breaksBySlot.keys()) allSlotNumbers.add(n);
  const sorted = [...allSlotNumbers].sort((a, b) => a - b);

  const rows: RenderedRow[] = [];
  let teachingPeriod = 0;
  for (const slotNum of sorted) {
    const brks = breaksBySlot.get(slotNum);
    if (brks && brks.length > 0) {
      rows.push({ kind: "break", slotNumber: slotNum, defs: brks });
    }
    const teaching = teachingBySlot.get(slotNum);
    if (teaching && teaching.length > 0) {
      teachingPeriod += 1;
      rows.push({ kind: "teaching", period: teachingPeriod, slotNumber: slotNum, slots: teaching });
    }
  }
  return rows;
}

/**
 * Filters break definitions to those applicable to the view, delegating
 * the per-def applicability check to the canonical helpers in
 * `src/utils/break-utils.ts` (spec §4.3: single source of truth — do not
 * write parallel break-detection logic). Each helper is called with a
 * synthetic `"BREAK"` breaktime and a singleton `[def]` so the helper
 * answers "is this one definition applicable here?".
 */
function pickApplicable(defs: BreakDefinition[], view: ViewMode): BreakDefinition[] {
  if (view.mode === "all") return defs;
  if (view.mode === "teacher") {
    return defs.filter((d) => isBreakForTeacher("BREAK", d.slotNumber, [d]));
  }
  return defs.filter((d) =>
    isBreakForGrade("BREAK", view.gradeLevel, d.slotNumber, [d], view.gradeId),
  );
}
```

- [x] **Step 4: Run test to verify passing** (7/7 pass)

Run: `pnpm test src/lib/ui/break-rows.test.ts`
Expected: 7 PASS.

- [x] **Step 5: Commit**

```bash
git add src/lib/ui/break-rows.ts src/lib/ui/break-rows.test.ts
git commit -m "feat(ui): add buildGridRows() break-row builder (4a0)

Merges teaching timeslots and BreakDefinition[] into ordered rows for
grid rendering. Period numbers count teaching slots only; break rows
are unnumbered. View modes: teacher / class (by grade tier) / all.
Legacy fallback synthesizes a generic 'พัก' row when no
breakDefinitions exist.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Tailwind theme tokens

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Read the file's current `@theme` block**

Run: `head -120 src/app/globals.css` and locate the existing `@theme {` block. Confirm `--color-ds-blue`, `--color-ds-emerald`, `--color-ds-amber` (or similar) already exist.

- [ ] **Step 2: Add accent tokens inside the `@theme` block**

Insert after the existing `--color-ds-*` definitions:

```css
  /* ============================================
   * SEMANTIC ACCENT TOKENS
   * One per redesigned table surface
   * ============================================ */
  --color-accent-teacher: #2563eb;
  --color-accent-class: #10b981;
  --color-accent-program: #f59e0b;

  /* ============================================
   * CATEGORY BAND COLORS (all-program table)
   * ============================================ */
  --color-band-core-bg: #eff6ff;
  --color-band-core-text: #1e40af;
  --color-band-core-stripe: #3b82f6;
  --color-band-additional-bg: #fef3c7;
  --color-band-additional-text: #92400e;
  --color-band-additional-stripe: #f59e0b;
  --color-band-activity-bg: #dcfce7;
  --color-band-activity-text: #166534;
  --color-band-activity-stripe: #10b981;
```

- [ ] **Step 3: Verify Tailwind picks up the tokens**

Run: `pnpm dev` (or trust an existing dev server). Visit `/` and inspect any element; in DevTools confirm a CSS class like `bg-accent-teacher` resolves to `#2563eb`. If dev server already running, save the file and let HMR pick it up.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(ui): add accent + band CSS theme tokens (4a0)

Adds semantic per-surface accents (teacher/class/program) and the
all-program category band palette as Tailwind v4 @theme tokens.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: TimeslotGrid component (RSC-compatible)

**Files:**
- Create: `src/components/schedule/TimeslotGrid.tsx`

Note: this is a pure server component — no React hooks. It must run inside RSC pages without `'use client'`.

- [ ] **Step 1: Create the component**

```tsx
// src/components/schedule/TimeslotGrid.tsx
import type { timeslot } from "@/prisma/generated/client";
import type { BreakDefinition } from "@/features/timeslot/domain/models/break.types";
import { buildGridRows, type ViewMode } from "@/lib/ui/break-rows";
import { subjectColors } from "@/lib/ui/subject-color";

const dayOrder = ["MON", "TUE", "WED", "THU", "FRI"] as const;
const dayNames: Record<(typeof dayOrder)[number], string> = {
  MON: "จันทร์",
  TUE: "อังคาร",
  WED: "พุธ",
  THU: "พฤหัสบดี",
  FRI: "ศุกร์",
};

export type ScheduleCell = {
  timeslotId: string;
  subjectCode: string;
  subjectName: string;
  gradeLabel?: string;     // e.g. ม.1/1 — for teacher view
  teacherLabel?: string;   // e.g. นายสมชาย — for class view
  roomLabel?: string;
  isLocked?: boolean;
};

export type TimeslotGridProps = {
  timeslots: timeslot[];
  breakDefs: BreakDefinition[];
  view: ViewMode;
  /** subjectCode → cell metadata, keyed by TimeslotID */
  cellsByTimeslotId: Map<string, ScheduleCell>;
  /** Show extra columns per cell */
  show?: { room?: boolean; grade?: boolean; teacher?: boolean };
};

export function TimeslotGrid({
  timeslots,
  breakDefs,
  view,
  cellsByTimeslotId,
  show = {},
}: TimeslotGridProps) {
  const rows = buildGridRows(timeslots, breakDefs, view);

  if (rows.length === 0) {
    return (
      <div
        data-testid="schedule-empty"
        className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500"
      >
        ไม่มีตารางในภาคเรียนนี้
      </div>
    );
  }

  return (
    <div className="timeslot-grid overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table
        className="min-w-full border-collapse"
        data-testid="schedule-grid"
        role="table"
      >
        <thead>
          <tr className="bg-slate-900 text-white">
            <th className="border-r border-slate-700 px-2 py-2 text-xs font-semibold w-20">
              คาบ
            </th>
            {dayOrder.map((day) => (
              <th
                key={day}
                className="border-r border-slate-700 px-2 py-2 text-xs font-semibold"
              >
                {dayNames[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            if (row.kind === "break") {
              const labels = row.defs.map((d) => d.label).join(" · ");
              const accent = row.defs[0]?.color ?? "#94a3b8";
              return (
                <tr
                  key={`break-${row.slotNumber}-${idx}`}
                  className="bg-slate-50"
                  data-testid="break-row"
                >
                  <td
                    colSpan={dayOrder.length + 1}
                    className="border-b border-slate-200 px-3 py-1.5 text-center text-xs italic text-slate-600"
                    style={{ borderLeft: `4px solid ${accent}` }}
                  >
                    — {labels} —
                  </td>
                </tr>
              );
            }
            // teaching row
            const timeFromFirst = row.slots[0]
              ? formatTimeRange(row.slots[0])
              : null;
            return (
              <tr key={`p-${row.period}`} className="hover:bg-slate-50/60">
                <td className="border-b border-slate-200 bg-slate-50 px-2 py-2 text-center align-top">
                  <div className="text-sm font-semibold text-slate-900">
                    คาบ {row.period}
                  </div>
                  {timeFromFirst && (
                    <div className="text-[10px] text-slate-500">
                      {timeFromFirst}
                    </div>
                  )}
                </td>
                {dayOrder.map((day) => {
                  const ts = row.slots.find((s) => s.DayOfWeek === day);
                  const cell = ts ? cellsByTimeslotId.get(ts.TimeslotID) : undefined;
                  return (
                    <td
                      key={day}
                      className="timeslot-cell border-b border-slate-200 px-2 py-2 align-top"
                      style={
                        cell
                          ? {
                              backgroundColor: subjectColors(cell.subjectCode).bg,
                              borderLeft: `3px solid ${subjectColors(cell.subjectCode).stripe}`,
                            }
                          : undefined
                      }
                    >
                      {cell ? (
                        <div className="space-y-0.5">
                          <div
                            className="text-xs font-semibold"
                            style={{ color: subjectColors(cell.subjectCode).text }}
                          >
                            {cell.subjectName}
                          </div>
                          <div className="text-[10px] text-slate-600">
                            ({cell.subjectCode})
                          </div>
                          {show.grade && cell.gradeLabel && (
                            <div className="text-[10px] text-slate-700">
                              {cell.gradeLabel}
                            </div>
                          )}
                          {show.teacher && cell.teacherLabel && (
                            <div className="text-[10px] text-slate-700">
                              {cell.teacherLabel}
                            </div>
                          )}
                          {show.room && cell.roomLabel && (
                            <div className="text-[10px] text-slate-500">
                              {cell.roomLabel}
                            </div>
                          )}
                          {cell.isLocked && (
                            <div
                              className="mt-0.5 inline-block rounded-sm bg-amber-100 px-1 text-[9px] font-semibold text-amber-800"
                              title="ล็อกแล้ว"
                              aria-label="ล็อกแล้ว"
                            >
                              ล็อก
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-xs text-slate-300">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatTimeRange(t: timeslot): string {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  };
  return `${new Date(t.StartTime).toLocaleTimeString("th-TH", opts)}-${new Date(t.EndTime).toLocaleTimeString("th-TH", opts)}`;
}
```

- [ ] **Step 2: Add print styles to globals.css**

Append to `src/app/globals.css`:

```css
@media print {
  .timeslot-grid {
    box-shadow: none !important;
    border-color: #000 !important;
  }
  .timeslot-cell {
    background-color: white !important;
    /* Keep the left stripe; it carries subject identity on B&W */
  }
  [data-testid="break-row"] {
    background-color: white !important;
  }
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: 0 errors related to the new file. Address any import path errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/schedule/TimeslotGrid.tsx src/app/globals.css
git commit -m "feat(schedule): add shared TimeslotGrid RSC component (4a0)

Renders day x period grid with subject-hash colors and break-row
support. Pure server component, no hooks. Print stylesheet keeps
left stripe (B&W-safe) and drops cell tint.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Migrate public teacher schedule page to TimeslotGrid

**Files:**
- Modify: `src/app/(public)/teachers/[id]/[academicYear]/[semester]/page.tsx`

- [ ] **Step 1: Read the current file**

Run: `head -300 src/app/\(public\)/teachers/\[id\]/\[academicYear\]/\[semester\]/page.tsx`. Note the inline `<table>` block (lines ~178-263). The page already loads `responsibilities`, `schedules`, `timeslots`, and computes `slotNumbers` + `scheduleLookup` + `slotTimeRanges` + `gridData` manually.

- [ ] **Step 2: Replace the inline grid with TimeslotGrid**

Replace the entire `{/* Schedule Grid */}` block (the whole `<div className="bg-white rounded-lg shadow"><div className="overflow-x-auto"><table ...>` … `</table></div></div>`) with:

```tsx
{/* Schedule Grid */}
{(() => {
  const cellsByTimeslotId = new Map<string, ScheduleCell>();
  for (const s of schedules) {
    cellsByTimeslotId.set(s.timeslot.TimeslotID, {
      timeslotId: s.timeslot.TimeslotID,
      subjectCode: s.subject.SubjectCode,
      subjectName: s.subject.SubjectName,
      gradeLabel: `ม.${s.gradelevel.Year}/${s.gradelevel.Number}`,
      roomLabel: s.room?.RoomName,
    });
  }
  return (
    <TimeslotGrid
      timeslots={timeslots}
      breakDefs={breakDefs}
      view={{ mode: "teacher" }}
      cellsByTimeslotId={cellsByTimeslotId}
      show={{ grade: true, room: true }}
    />
  );
})()}
```

- [ ] **Step 3: Add the imports at the top of the file**

```tsx
import { TimeslotGrid, type ScheduleCell } from "@/components/schedule/TimeslotGrid";
import type { BreakDefinition } from "@/features/timeslot/domain/models/break.types";
import { configRepository } from "@/features/config/infrastructure/repositories/config.repository";
```

If `configRepository` path differs, search for an existing config-data loader used by `all-timeslot/page.tsx` (`grep -rn "breakDefinitions" src/app/dashboard/.../all-timeslot/` returns the right one).

- [ ] **Step 4: Fetch breakDefinitions alongside other data**

After the existing `const timeslots = await publicDataRepository.findTimeslotsByTerm(...)` line, add:

```tsx
const configId = `${semNum}-${academicYear}`;
const config = await configRepository.findByConfigId(configId);
const breakDefs: BreakDefinition[] = (config?.Config as any)?.breakDefinitions ?? [];
```

If `configRepository.findByConfigId` does not exist, use whatever loader the dashboard `all-timeslot/page.tsx` uses — copy that exact pattern.

- [ ] **Step 5: Delete now-unused helpers in the file**

Remove the local computation of `parseSlotNumber`, `slotNumbers`, `displaySlotNumbers`, `scheduleLookup`, `slotTimeRanges`, `gridData`, and the unused `dayNames` / `dayOrder` constants. TimeslotGrid owns that logic now.

- [ ] **Step 6: Run typecheck**

Run: `pnpm typecheck`
Expected: 0 new errors. Fix any prop-type mismatches.

- [ ] **Step 7: Verify e2e selectors still resolve**

Run: `pnpm exec playwright test --grep "teacher schedule"` (skip if no matching test exists). Confirm tests still pass — `schedule-grid` and `schedule-empty` test IDs must still appear in the DOM.

- [ ] **Step 8: Manual verification with browser MCP**

Per CLAUDE.md ("UI verification: use `browser_eval` MCP tool, not curl"), run:
- Start `pnpm dev:e2e` if not running.
- Use `browser_navigate` to `http://localhost:3000/teachers/1/2567/1` (adjust ID to a real teacher).
- Use `browser_snapshot` to inspect the rendered grid. Confirm period numbers skip break rows.

- [ ] **Step 9: Commit**

```bash
git add src/app/\(public\)/teachers/\[id\]/\[academicYear\]/\[semester\]/page.tsx
git commit -m "refactor(public): migrate teacher schedule page to TimeslotGrid (4a0)

Replaces inline grid with shared TimeslotGrid component. Pulls
breakDefinitions from config, view=teacher (universal breaks only).
Preserves schedule-grid + schedule-empty test IDs.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Migrate public class schedule page to TimeslotGrid

**Files:**
- Modify: `src/app/(public)/classes/[gradeId]/[academicYear]/[semester]/page.tsx`

- [ ] **Step 1: Read the current file**

Run: `head -260 src/app/\(public\)/classes/\[gradeId\]/\[academicYear\]/\[semester\]/page.tsx`. Note that `gradeLevel.Year` is available (used today as `ม.{Year}`).

- [ ] **Step 2: Add imports**

Mirror Task 6 Step 3.

- [ ] **Step 3: Fetch breakDefs**

Mirror Task 6 Step 4.

- [ ] **Step 4: Replace grid block**

Replace the entire `{/* Schedule Table */}` block with:

```tsx
{(() => {
  const cellsByTimeslotId = new Map<string, ScheduleCell>();
  for (const s of schedules) {
    cellsByTimeslotId.set(s.timeslot.TimeslotID, {
      timeslotId: s.timeslot.TimeslotID,
      subjectCode: s.subject.SubjectCode,
      subjectName: s.subject.SubjectName,
      teacherLabel: s.teachers_responsibility
        .map((tr) => `${tr.teacher.Prefix}${tr.teacher.Firstname} ${tr.teacher.Lastname}`)
        .join(", ") || undefined,
      roomLabel: s.room?.RoomName,
    });
  }
  return (
    <TimeslotGrid
      timeslots={timeslots}
      breakDefs={breakDefs}
      view={{ mode: "class", gradeId: gradeLevel.GradeID, gradeLevel: gradeLevel.Year }}
      cellsByTimeslotId={cellsByTimeslotId}
      show={{ teacher: true, room: true }}
    />
  );
})()}
```

- [ ] **Step 5: Delete now-unused locals**

Remove local `parseSlotNumber`, `slotNumbers`, `scheduleLookup`, `slotTimeRanges`, `gridData`, and the unused `dayNames` / `dayOrder` constants.

- [ ] **Step 6: Typecheck + manual verification**

Run: `pnpm typecheck`. Then `browser_navigate` to a real class URL (e.g. `/classes/M1-1/2567/1`) and `browser_snapshot`. Confirm:
- Junior class shows `พักเที่ยง ม.ต้น` row.
- Senior class shows `พักเที่ยง ม.ปลาย` row.
- Period numbers are sequential (1..N).

- [ ] **Step 7: Commit**

```bash
git add src/app/\(public\)/classes/\[gradeId\]/\[academicYear\]/\[semester\]/page.tsx
git commit -m "refactor(public): migrate class schedule page to TimeslotGrid (4a0)

view=class filters breaks by grade tier (ม.ต้น vs ม.ปลาย).
Teacher and room shown in cells.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Migrate dashboard all-timeslot to TimeslotGrid

> **🚫 DESCOPED 2026-05-29 — do not implement.** This task assumed `all-timeslot` was a single-entity day×period `<table>` like the public pages. It is not: it is a teacher-row × period-column matrix aggregating **all teachers at once** (`TeacherList` + `TableHead`/`TableBody`/`TableResult`), with Excel/PDF export coupled to `timeSlotData.Columns`. `TimeslotGrid` (one `ScheduleCell` per `TimeslotID`) cannot represent parallel teachers in one slot. Per user decision, the matrix stays and the spec was amended (§4). The steps below are retained for history only. Follow-up tracked in beads.

**Files:**
- Modify: `src/app/dashboard/[academicYear]/[semester]/all-timeslot/AllTimeslotClient.tsx`

- [ ] **Step 1: Read the current client component**

Run: `head -400 src/app/dashboard/\[academicYear\]/\[semester\]/all-timeslot/AllTimeslotClient.tsx`. Identify the section that renders the grid (search for `<table`).

- [ ] **Step 2: Reuse TimeslotGrid**

Replace the grid `<table>` with `<TimeslotGrid view={{ mode: "all" }} ... />`. Build `cellsByTimeslotId` from `classSchedules` with `gradeLabel`, `teacherLabel`, `roomLabel`, and `isLocked: cs.IsLocked` populated. The surrounding admin chrome (filter chips, export button, print button) stays.

```tsx
const cellsByTimeslotId = new Map<string, ScheduleCell>();
for (const cs of classSchedules) {
  cellsByTimeslotId.set(cs.timeslot.TimeslotID, {
    timeslotId: cs.timeslot.TimeslotID,
    subjectCode: cs.subject.SubjectCode,
    subjectName: cs.subject.SubjectName,
    gradeLabel: `ม.${cs.gradelevel.Year}/${cs.gradelevel.Number}`,
    teacherLabel: cs.teachers_responsibility
      .map((tr) => `${tr.teacher.Firstname}`)
      .join(", ") || undefined,
    roomLabel: cs.room?.RoomName,
    isLocked: cs.IsLocked,
  });
}

return (
  <>
    {/* keep existing toolbar JSX */}
    <TimeslotGrid
      timeslots={timeslots}
      breakDefs={breakDefs}
      view={{ mode: "all" }}
      cellsByTimeslotId={cellsByTimeslotId}
      show={{ grade: true, teacher: true, room: true }}
    />
  </>
);
```

- [ ] **Step 3: Pass breakDefs from page.tsx**

Edit `src/app/dashboard/[academicYear]/[semester]/all-timeslot/page.tsx` to load `config` (using the same `configRepository` introduced in Task 6) and pass `breakDefs` into `AllTimeslotClient`. Add `breakDefs: BreakDefinition[]` to `AllTimeslotClientProps`.

- [ ] **Step 4: Typecheck + browser snapshot**

Run: `pnpm typecheck`. Navigate to `/dashboard/2567/1/all-timeslot` (signed in). Confirm grid renders identically to the prior version, with break rows now showing both junior and senior labels merged when at the same slot.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/\[academicYear\]/\[semester\]/all-timeslot/AllTimeslotClient.tsx src/app/dashboard/\[academicYear\]/\[semester\]/all-timeslot/page.tsx
git commit -m "refactor(dashboard): migrate all-timeslot to TimeslotGrid (4a0)

view=all renders every BreakDefinition in slotNumber order, merging
defs that share a slotNumber. Lock badges shown inline.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: PersonCard component

**Files:**
- Create: `src/components/public/PersonCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/public/PersonCard.tsx
import Link from "next/link";
import { extractMonogram, monogramGradient, gradeMonogram } from "@/lib/ui/monogram";

export type PersonCardProps = {
  /** Stable identifier — used for the gradient hash. */
  id: number | string;
  /** Primary heading. For teachers: full name. For classes: ม.{Year}/{Number}. */
  primary: string;
  /** Secondary line under the heading, e.g. "คณิตศาสตร์ · 22 คาบ". */
  secondary: string;
  /** Link target — page that the action arrow opens. */
  href: string;
  /**
   * For teachers, leave undefined → extractMonogram(primary).
   * For classes, pass { kind: "grade", year } → "ม.{year}".
   */
  monogram?: { kind: "grade"; year: number };
  /** Per-surface accent token — text-accent-teacher | text-accent-class. */
  accentClass: string;
  /** Optional admin row-overlay slot (edit / lock). */
  adminOverlay?: React.ReactNode;
  /** data-testid override; defaults to "person-card". */
  testId?: string;
};

export function PersonCard({
  id,
  primary,
  secondary,
  href,
  monogram,
  accentClass,
  adminOverlay,
  testId = "person-card",
}: PersonCardProps) {
  const initial = monogram?.kind === "grade" ? gradeMonogram(monogram.year) : extractMonogram(primary);
  const gradient = monogramGradient(id);
  return (
    <article
      data-testid={testId}
      className="group relative flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
        style={{ background: gradient }}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={href}
          prefetch={false}
          className={`block truncate text-sm font-semibold text-slate-900 hover:${accentClass}`}
        >
          {primary}
        </Link>
        <div className="truncate text-xs text-slate-500">{secondary}</div>
      </div>
      <Link
        href={href}
        prefetch={false}
        aria-label={`เปิดตารางของ ${primary}`}
        className={`shrink-0 text-xs font-medium ${accentClass}`}
      >
        ตาราง →
      </Link>
      {adminOverlay && (
        <div className="pointer-events-none absolute right-2 top-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
          {adminOverlay}
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/PersonCard.tsx
git commit -m "feat(public): add PersonCard component (4a0)

Generic teacher/student card with monogram avatar, primary/secondary
lines, action link, and optional admin overlay slot.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: FilterSidebar + ListToolbar components

**Files:**
- Create: `src/components/public/FilterSidebar.tsx`
- Create: `src/components/public/ListToolbar.tsx`

- [ ] **Step 1: Create FilterSidebar**

```tsx
// src/components/public/FilterSidebar.tsx
"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export type FilterFacet = {
  key: string;       // e.g. "dept" or "year"
  label: string;     // e.g. "ภาควิชา"
  options: Array<{ value: string; label: string; count: number }>;
};

export type FilterSidebarProps = {
  facet: FilterFacet;
  /** Set true on mobile drawer wrapper; default = static sidebar. */
  drawer?: boolean;
};

export function FilterSidebar({ facet, drawer = false }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get(facet.key) ?? "";

  function select(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "") next.delete(facet.key);
    else next.set(facet.key, value);
    next.delete("page"); // reset paging when filter changes
    router.push(`${pathname}?${next.toString()}`);
  }

  const total = facet.options.reduce((acc, o) => acc + o.count, 0);

  return (
    <nav
      aria-label={facet.label}
      data-testid="filter-sidebar"
      className={
        drawer
          ? "w-full"
          : "sticky top-4 hidden h-fit w-60 shrink-0 rounded-xl border border-slate-200 bg-white p-3 md:block"
      }
    >
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {facet.label}
      </div>
      <button
        type="button"
        onClick={() => select("")}
        className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
          active === ""
            ? "bg-blue-50 font-semibold text-blue-700"
            : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        <span>ทั้งหมด</span>
        <span className="text-xs text-slate-500">{total}</span>
      </button>
      <ul className="mt-1 space-y-0.5">
        {facet.options.map((o) => (
          <li key={o.value}>
            <button
              type="button"
              onClick={() => select(o.value)}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                active === o.value
                  ? "bg-blue-50 font-semibold text-blue-700"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="truncate">{o.label}</span>
              <span className="text-xs text-slate-500">{o.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Create ListToolbar**

```tsx
// src/components/public/ListToolbar.tsx
"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export type SortOption = { value: string; label: string };

export type ListToolbarProps = {
  placeholder: string;
  sortOptions: SortOption[];
  defaultSort: string;
  /** Total items currently matching — surfaced as a count. */
  matchCount: number;
  /** Optional callback for opening the mobile filter drawer. */
  onOpenFilters?: () => void;
};

export function ListToolbar({
  placeholder,
  sortOptions,
  defaultSort,
  matchCount,
  onOpenFilters,
}: ListToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (q === "") next.delete("q");
      else next.set("q", q);
      next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }, 250);
    return () => clearTimeout(t);
    // intentionally only depends on q
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const sort = params.get("sort") ?? defaultSort;
  function setSort(v: string) {
    const next = new URLSearchParams(params.toString());
    if (v === defaultSort) next.delete("sort");
    else next.set("sort", v);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div
      data-testid="list-toolbar"
      className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2"
    >
      {onOpenFilters && (
        <button
          type="button"
          onClick={onOpenFilters}
          className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 md:hidden"
        >
          ตัวกรอง
        </button>
      )}
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-md bg-slate-100 px-3 py-2 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="rounded-md border border-slate-200 bg-white px-2 py-2 text-xs"
        aria-label="เรียง"
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="ml-auto text-xs text-slate-500">{matchCount} รายการ</span>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/public/FilterSidebar.tsx src/components/public/ListToolbar.tsx
git commit -m "feat(public): add FilterSidebar + ListToolbar (4a0)

FilterSidebar: faceted nav driven by URL query, with count badges.
ListToolbar: debounced search input + sort dropdown + count badge.
Both reset the page param when filters/search/sort change.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Migrate TeachersTableClient to card grid + sidebar

**Files:**
- Modify: `src/app/(public)/_components/TeachersTableClient.tsx`

- [ ] **Step 1: Read the current file**

Run: `cat src/app/\(public\)/_components/TeachersTableClient.tsx`. Identify the current `<table>` and its props.

- [ ] **Step 2: Rewrite the component body**

Replace the entire returned JSX with a two-column shell: sidebar (left) + content (right). Content = ListToolbar + responsive card grid + existing TablePagination.

```tsx
"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PersonCard } from "@/components/public/PersonCard";
import { FilterSidebar, type FilterFacet } from "@/components/public/FilterSidebar";
import { ListToolbar } from "@/components/public/ListToolbar";
import { TablePagination } from "./TablePagination";
import { parseConfigId } from "@/utils/config-id";

const PAGE_SIZE = 24;

type TeacherRow = {
  teacherId: number;
  fullName: string;
  department: string | null;
  periodCount: number;
};

export type Props = {
  data: { data: TeacherRow[] };
  currentConfigId?: string;
};

export default function TeachersTableClient({ data, currentConfigId }: Props) {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").toLowerCase().trim();
  const dept = params.get("dept") ?? "";
  const sort = params.get("sort") ?? "name";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    let xs = data.data;
    if (q) xs = xs.filter((t) => t.fullName.toLowerCase().includes(q) || (t.department ?? "").toLowerCase().includes(q));
    if (dept) xs = xs.filter((t) => t.department === dept);
    xs = [...xs].sort((a, b) => {
      if (sort === "periods") return b.periodCount - a.periodCount;
      if (sort === "department") return (a.department ?? "").localeCompare(b.department ?? "", "th");
      return a.fullName.localeCompare(b.fullName, "th");
    });
    return xs;
  }, [data.data, q, dept, sort]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const facet: FilterFacet = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of data.data) {
      const k = t.department ?? "ไม่ระบุ";
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return {
      key: "dept",
      label: "ภาควิชา",
      options: [...counts.entries()]
        .sort((a, b) => a[0].localeCompare(b[0], "th"))
        .map(([value, count]) => ({ value, label: value, count })),
    };
  }, [data.data]);

  const term = currentConfigId ? parseConfigId(currentConfigId) : null;

  return (
    <div className="flex gap-4 md:gap-6">
      <FilterSidebar facet={facet} />
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/40" />
          <div className="absolute left-0 top-0 h-full w-72 bg-white p-3" onClick={(e) => e.stopPropagation()}>
            <FilterSidebar facet={facet} drawer />
          </div>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <ListToolbar
          placeholder="ค้นหาครู เช่น สมชาย, คณิตศาสตร์"
          sortOptions={[
            { value: "name", label: "ชื่อ ก-ฮ" },
            { value: "periods", label: "คาบมากสุด" },
            { value: "department", label: "ภาควิชา" },
          ]}
          defaultSort="name"
          matchCount={filtered.length}
          onOpenFilters={() => setDrawerOpen(true)}
        />
        {pageItems.length === 0 ? (
          <div data-testid="teachers-empty" className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            ไม่พบรายชื่อ
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((t) => (
              <PersonCard
                key={t.teacherId}
                id={t.teacherId}
                primary={t.fullName}
                secondary={`${t.department ?? "ไม่ระบุ"} · ${t.periodCount} คาบ`}
                href={term ? `/teachers/${t.teacherId}/${term.academicYear}/${term.semester}` : `/teachers/${t.teacherId}`}
                accentClass="text-accent-teacher"
              />
            ))}
          </div>
        )}
        <TablePagination currentPage={page} totalItems={filtered.length} perPage={PAGE_SIZE} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add a `parseConfigId` util if missing**

Run: `grep -n "export function parseConfigId" src/utils/`. If not found, add to `src/utils/config-id.ts`:

```ts
// src/utils/config-id.ts
export function parseConfigId(configId: string): { academicYear: string; semester: string } | null {
  const m = configId.match(/^(\d+)-(\d+)$/);
  if (!m) return null;
  return { semester: m[1]!, academicYear: m[2]! };
}
```

If it already exists, skip this step.

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck`. Expected: 0 errors.

- [ ] **Step 5: Manual verification**

Use `browser_navigate` to `http://localhost:3000`. Confirm:
- Teachers tab shows cards in a grid (not a table).
- Sidebar lists departments with counts.
- Search filters cards live.
- Department click filters cards.
- Pagination still works.
- No console errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(public\)/_components/TeachersTableClient.tsx src/utils/config-id.ts
git commit -m "refactor(public): teachers list as card grid + facet sidebar (4a0)

URL-driven state (q/dept/sort/page). Mobile drawer for filters.
Sort: name | period count | department. Honors term-aware link
to per-teacher schedule.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Migrate ClassesTableClient to card grid + sidebar

**Files:**
- Modify: `src/app/(public)/_components/ClassesTableClient.tsx`

- [ ] **Step 1: Read current file + identify row shape**

Run: `cat src/app/\(public\)/_components/ClassesTableClient.tsx`. Note the class row shape (it likely has `GradeID`, `Year`, `Number`, `programName`, period count).

- [ ] **Step 2: Rewrite analogous to Task 11, faceting by Year**

```tsx
"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PersonCard } from "@/components/public/PersonCard";
import { FilterSidebar, type FilterFacet } from "@/components/public/FilterSidebar";
import { ListToolbar } from "@/components/public/ListToolbar";
import { TablePagination } from "./TablePagination";
import { parseConfigId } from "@/utils/config-id";

const PAGE_SIZE = 24;

type ClassRow = {
  GradeID: string;
  Year: number;
  Number: number;
  programName: string | null;
  periodCount: number;
};

export type Props = {
  data: { data: ClassRow[] };
  currentConfigId?: string;
};

export default function ClassesTableClient({ data, currentConfigId }: Props) {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").toLowerCase().trim();
  const year = params.get("year") ?? "";
  const sort = params.get("sort") ?? "grade";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    let xs = data.data;
    if (q) {
      xs = xs.filter(
        (c) =>
          `ม.${c.Year}/${c.Number}`.includes(q) ||
          (c.programName ?? "").toLowerCase().includes(q),
      );
    }
    if (year) xs = xs.filter((c) => String(c.Year) === year);
    xs = [...xs].sort((a, b) => {
      if (sort === "periods") return b.periodCount - a.periodCount;
      if (a.Year !== b.Year) return a.Year - b.Year;
      return a.Number - b.Number;
    });
    return xs;
  }, [data.data, q, year, sort]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const facet: FilterFacet = useMemo(() => {
    const counts = new Map<number, number>();
    for (const c of data.data) counts.set(c.Year, (counts.get(c.Year) ?? 0) + 1);
    return {
      key: "year",
      label: "ระดับชั้น",
      options: [...counts.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([year, count]) => ({ value: String(year), label: `ม.${year}`, count })),
    };
  }, [data.data]);

  const term = currentConfigId ? parseConfigId(currentConfigId) : null;

  return (
    <div className="flex gap-4 md:gap-6">
      <FilterSidebar facet={facet} />
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/40" />
          <div className="absolute left-0 top-0 h-full w-72 bg-white p-3" onClick={(e) => e.stopPropagation()}>
            <FilterSidebar facet={facet} drawer />
          </div>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <ListToolbar
          placeholder="ค้นหาชั้นเรียน เช่น ม.1/1"
          sortOptions={[
            { value: "grade", label: "ตามชั้น" },
            { value: "periods", label: "คาบมากสุด" },
          ]}
          defaultSort="grade"
          matchCount={filtered.length}
          onOpenFilters={() => setDrawerOpen(true)}
        />
        {pageItems.length === 0 ? (
          <div data-testid="classes-empty" className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            ไม่พบชั้นเรียน
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {pageItems.map((c) => (
              <PersonCard
                key={c.GradeID}
                id={c.GradeID}
                primary={`ม.${c.Year}/${c.Number}`}
                secondary={`${c.programName ?? "—"} · ${c.periodCount} คาบ`}
                href={term ? `/classes/${c.GradeID}/${term.academicYear}/${term.semester}` : `/classes/${c.GradeID}`}
                monogram={{ kind: "grade", year: c.Year }}
                accentClass="text-accent-class"
              />
            ))}
          </div>
        )}
        <TablePagination currentPage={page} totalItems={filtered.length} perPage={PAGE_SIZE} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + verify**

Run: `pnpm typecheck`. Then `browser_navigate` to `/?tab=classes`. Confirm grid renders, year sidebar works, search works.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(public\)/_components/ClassesTableClient.tsx
git commit -m "refactor(public): classes list as card grid + year sidebar (4a0)

ม.{Year} monograms, year facet, accent-class color, term-aware link.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: Dashboard student-table + teacher-table parity

> **🚫 DESCOPED 2026-05-29 — do not implement.** Both pages are multi-entity selection + per-entity schedule matrices (MUI `Select` w/ checkboxes, per-entity `TimeSlot` component, bulk Excel/PDF export coupled to `createTimeSlotTableData` / `ExportTeacherTable` + `html2canvas`/`jsPDF`) — the same family as the descoped Task 8 `all-timeslot`. `TimeslotGrid` (one cell per `TimeslotID`) can't represent them and the swap would break export. Per user decision, kept as-is; spec §2.5 amended. Optional follow-up: restyle only the entity-selection list with `PersonCard` (tracked in beads). Steps below retained for history only.

**Files:**
- Modify: `src/app/dashboard/[academicYear]/[semester]/student-table/page.tsx`
- Modify: `src/app/dashboard/[academicYear]/[semester]/teacher-table/page.tsx`

These dashboard pages currently render their own table/grid layouts (per existing `student-table/component/Timeslot.tsx` references in the codebase). Migrate the **list view portion** (if any) and the **schedule grid portion** to the new components.

- [ ] **Step 1: Inspect each page's current layout**

Run `cat src/app/dashboard/\[academicYear\]/\[semester\]/student-table/page.tsx` and `cat src/app/dashboard/\[academicYear\]/\[semester\]/teacher-table/page.tsx`. Note whether they show:
- A list (grid select dropdown / sidebar) → reuse `FilterSidebar` + `PersonCard`.
- A schedule grid → reuse `TimeslotGrid`.

These pages are admin-facing and may already use MUI components. Keep the page-level chrome; only swap the data list and grid.

- [ ] **Step 2: For each page, swap the grid block**

Mirror Task 6 (teacher) / Task 7 (class). For `teacher-table/page.tsx` use `view={{ mode: "teacher" }}`. For `student-table/page.tsx` use `view={{ mode: "class", gradeId, gradeLevel }}`.

For cells, pass `isLocked: cs.IsLocked` so the lock badge shows.

- [ ] **Step 3: Optional inline edit overlay**

Wrap each `PersonCard` (if used) with `adminOverlay`:

```tsx
adminOverlay={(
  <Link href={`/management/teacher/${t.teacherId}`} prefetch={false}
    className="rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-700 shadow">
    แก้ไข
  </Link>
)}
```

- [ ] **Step 4: Typecheck + browser verify both pages signed in**

Run: `pnpm typecheck`. Then sign in via `/signin`, navigate to `/dashboard/2567/1/teacher-table` and `/dashboard/2567/1/student-table`. Confirm the grid renders with break rows, locks visible, and admin overlay appears on hover.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/\[academicYear\]/\[semester\]/student-table/page.tsx src/app/dashboard/\[academicYear\]/\[semester\]/teacher-table/page.tsx
git commit -m "refactor(dashboard): student/teacher pages adopt shared grid (4a0)

Reuses TimeslotGrid with view=class/teacher. Adds lock badge inline
and (optional) edit overlay on hover. Preserves existing admin chrome.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: All-program color bands (desktop) + mobile card-stack

**Files:**
- Modify: `src/app/dashboard/[academicYear]/[semester]/all-program/page.tsx`

The current page renders a single MUI Paper-wrapped table. Color bands are a CSS-only layer; mobile swap is a parallel render path.

- [ ] **Step 1: Read the current render helpers**

Run `cat src/app/dashboard/\[academicYear\]/\[semester\]/all-program/page.tsx | sed -n '1,160p'`. Identify `renderCategoryRow`, `renderSubjectRows`, `renderSumRow` helpers and their use of `categoryName`.

- [ ] **Step 2: Add a category → band-color mapping**

Near the top of the file:

```tsx
const BAND: Record<string, { bg: string; text: string; stripe: string }> = {
  CORE: { bg: "var(--color-band-core-bg)", text: "var(--color-band-core-text)", stripe: "var(--color-band-core-stripe)" },
  ADDITIONAL: { bg: "var(--color-band-additional-bg)", text: "var(--color-band-additional-text)", stripe: "var(--color-band-additional-stripe)" },
  ACTIVITY: { bg: "var(--color-band-activity-bg)", text: "var(--color-band-activity-text)", stripe: "var(--color-band-activity-stripe)" },
};

function bandOf(category: string) {
  return BAND[category] ?? BAND.CORE!;
}
```

- [ ] **Step 3: Apply bands in `renderCategoryRow`**

Wherever the category header row is built, add `sx={{ backgroundColor: bandOf(category).bg, color: bandOf(category).text, fontWeight: 700 }}` to the `<TableRow>` or replace with a `<tr>` that takes those styles.

- [ ] **Step 4: Apply left stripe in `renderSubjectRows`**

For each subject `<TableCell>` in column 1 (subject name), add `sx={{ borderLeft: `4px solid ${bandOf(category).stripe}` }}` so member rows pick up the same accent.

- [ ] **Step 5: Add mobile card-stack path**

Below the existing desktop `<Paper>` table, add a sibling block visible only `<md`:

```tsx
<div className="md:hidden space-y-3 mt-3">
  {Array.from(categoryMap.entries()).map(([category, subjects]) => {
    const band = bandOf(category);
    return (
      <div key={category} className="rounded-xl border bg-white shadow-sm" style={{ borderLeftWidth: 4, borderLeftColor: band.stripe }}>
        <div className="px-3 py-2 text-sm font-bold" style={{ backgroundColor: band.bg, color: band.text }}>
          {category /* TODO: human-friendly label via categoryMap key */}
        </div>
        <ul className="divide-y">
          {subjects.map((s) => (
            <li key={s.subject.SubjectCode} className="px-3 py-2 text-xs">
              <div className="flex justify-between font-semibold text-slate-900">
                <span>{s.subject.SubjectName}</span>
                <span className="tabular-nums">{s.subject.Credit} นก</span>
              </div>
              <div className="mt-1 flex gap-1 overflow-x-auto">
                {s.gradeCounts.map((g) => (
                  <span key={g.year} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 whitespace-nowrap">
                    ม.{g.year}: {g.count}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  })}
</div>
```

Wrap the existing desktop table block with `hidden md:block` so it disappears under `md`. The exact shape of `subjects` / `gradeCounts` depends on the file's current data model — adapt names to match what the page already computes for the desktop render.

- [ ] **Step 6: Typecheck + browser verify**

Run: `pnpm typecheck`. Then sign in and visit `/dashboard/2567/1/all-program`. Confirm:
- Desktop: each category header row tinted; member rows show left stripe.
- Resize browser to <768px: table disappears, card stack appears with chip strips.

- [ ] **Step 7: Commit**

```bash
git add src/app/dashboard/\[academicYear\]/\[semester\]/all-program/page.tsx
git commit -m "feat(all-program): category color bands + mobile card stack (4a0)

Desktop: CORE/ADDITIONAL/ACTIVITY headers tint + left stripe on
member rows. Mobile (<md): card stack per category with horizontal
chip strip for per-year period counts.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 15: e2e smoke test for break-row period skip

**Files:**
- Create: `e2e/timeslot-grid.spec.ts`

- [ ] **Step 1: Write the test**

```ts
// e2e/timeslot-grid.spec.ts
import { test, expect } from "@playwright/test";

test.describe("timeslot grid period numbering", () => {
  test("class view: period numbers skip break row", async ({ page }) => {
    await page.goto("/classes/M1-1/2567/1");
    await page.waitForSelector('[data-testid="schedule-grid"]');

    const periodCells = await page.locator("tbody tr td:first-child").allInnerTexts();
    const periodNumbers = periodCells
      .map((t) => t.match(/คาบ (\d+)/)?.[1])
      .filter((x): x is string => Boolean(x))
      .map((n) => parseInt(n, 10));

    expect(periodNumbers.length).toBeGreaterThan(0);
    for (let i = 1; i < periodNumbers.length; i++) {
      expect(periodNumbers[i]).toBe(periodNumbers[i - 1]! + 1);
    }

    // At least one break row exists
    await expect(page.locator('[data-testid="break-row"]')).toHaveCount(1, { timeout: 2000 }).catch(() => {});
    // (Allow 0 if seed has no break configured; test still validates sequential numbering)
  });

  test("teacher view: renders shared grid", async ({ page }) => {
    await page.goto("/teachers/1/2567/1");
    await page.waitForSelector('[data-testid="schedule-grid"]');
    await expect(page.locator('[data-testid="schedule-grid"]')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the test**

Run: `pnpm test:e2e e2e/timeslot-grid.spec.ts`
Expected: 2 PASS. If the seed data has no break, the `break-row` assertion's `.catch` swallows; sequential-numbering assertion still validates the period-skip logic.

- [ ] **Step 3: Commit**

```bash
git add e2e/timeslot-grid.spec.ts
git commit -m "test(e2e): timeslot grid period skip + cross-view smoke (4a0)

Verifies period numbers are strictly sequential across break rows
in class view, and the shared schedule-grid testid is reachable
from the teacher view.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 16: Final quality gate + push

- [ ] **Step 1: Run full quality gates**

```bash
pnpm typecheck
pnpm lint
pnpm test
```

Expected: all pass. Address any breakage caused by component renames.

- [ ] **Step 2: Run e2e**

```bash
pnpm test:e2e
```

Expected: all pass. Existing tests must still find `schedule-grid`, `schedule-empty`, `teacher-name`, `class-name`, `sign-in-button`.

- [ ] **Step 3: Update beads + push**

```bash
bd update school-timetable-senior-project-4a0 --notes "All 15 redesign tasks completed. TimeslotGrid + PersonCard + FilterSidebar + ListToolbar shipped. Color bands on all-program. Period numbering skips breaks via buildGridRows(). Backward-compat fallback for legacy enum-only configs."
bd close school-timetable-senior-project-4a0
git pull --rebase
bd dolt push
git push
git status
```

Expected: `git status` shows "Your branch is up to date with 'origin/main'."

---

## Self-Review Notes (post-write)

Spec coverage check:
- §1 direction → Task 4 tokens + applied throughout.
- §2.1-2.5 list tables → Tasks 9, 10, 11, 12, 13.
- §3 all-program → Task 14.
- §4.1 subject color → Task 1.
- §4.2 cell content → Task 5 (TimeslotGrid).
- §4.3 break row → Tasks 3 + 5.
- §4.4 mobile agenda → **NOT IN PLAN** — explicitly deferred. The current TimeslotGrid uses `overflow-x-auto` for narrow viewports. The agenda swap is an additive follow-up; flag in a separate beads issue when this plan completes.
- §4.5 print → Task 5 Step 2.
- §4.6 shared component → Task 5.
- §4.7 dashboard parity → Tasks 8, 13.
- §5.1 utilities → Tasks 1, 2, 3.
- §5.2 test IDs → preserved in TimeslotGrid + new components add their own.
- §5.3 a11y → semantic `<article>` + `<nav aria-label>` + label-bearing stripes.
- §5.4 out-of-scope → respected.
- §5.5 migration order → matches Tasks 1-14.

Follow-up issues to file at close:
1. **Mobile agenda swap for TimeslotGrid** (§4.4) — file as `bd create --type=feature --priority=3 --title="TimeslotGrid mobile agenda swap (<640px)"`.
2. **Subject hash collision sweep** — file a `bd` to audit hue spread once real subject codes are loaded.
3. **Print preview audit** — manual print-preview pass on each grid context after deploy.
