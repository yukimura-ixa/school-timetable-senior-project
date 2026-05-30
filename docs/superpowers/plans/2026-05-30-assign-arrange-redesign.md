# Assign + Arrange Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the schedule `assign` and `arrange` features consume the existing design system, fix theme bugs, and restructure `arrange` into a sticky-palette-rail layout with a themed grid and a data-rich inspector.

**Architecture:** Pure helper modules (cell-state, period-time formatting, progress math) are extracted and unit-tested first, then wired into UI. The inspector becomes a server component that queries the required-hours total and passes it to a small client child that reads the live placed-count from the *same* SWR key the grid already uses (SWR dedupes by key — no provider needed). Auto-arrange failures are shared from the header to the inspector via a small focused Zustand store.

**Tech Stack:** Next.js 16 (parallel routes), MUI 7, dnd-kit, SWR, Zustand, Prisma, Vitest 4 + happy-dom + @testing-library/react. React Compiler is enabled (`babel-plugin-react-compiler`) — do NOT add manual `useMemo`/`useCallback` unless profiling demands it (the repo lints against redundant memoization via react-doctor).

**Conventions observed:**
- Tests: `pnpm test` runs `vitest run`. Component tests start with `// @vitest-environment happy-dom`; pure-function tests need no environment directive. Use `import { describe, it, expect, vi } from "vitest"` and `@testing-library/react`.
- Gates: `pnpm typecheck` (`tsc -p tsconfig.typecheck.json`), `pnpm lint`, `pnpm build`, `pnpm validate:tokens` (flags hardcoded hex outside the theme).
- **Do NOT run `pnpm typecheck` while `next dev` is running** (it corrupts on half-written `.next` route types — known issue).
- Two parallel feature dirs exist: `src/features/arrange/**` (auto-arrange, validate-drop actions) and `src/features/schedule-arrangement/**` (conflict models, delete action, stores). Both are in active use — do not merge them.
- Commit trailer: `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.

**Units assumption (explicit):** one filled timeslot = one คาบ = one teach-hour. So `required = Σ teachers_responsibility.TeachHour` and `placed = count(class_schedule rows)` are directly comparable.

**Out of scope:** real-time manual-drop conflict *engine* (already exists via `validateDropAction` + `ConflictDetailsModal` — leave it), mobile/tablet responsive arrange layout (desktop-only), auto-arrange solver logic, the `lock`/`config`/`generate`/`curriculum` sub-pages.

---

## File Structure

**Create:**
- `src/app/schedule/[academicYear]/[semester]/arrange/_lib/teacher-schedule.ts` — shared SWR key builder + fetcher + `Timeslot`/`ScheduleEntry` types.
- `src/app/schedule/[academicYear]/[semester]/arrange/_lib/grid-format.ts` — pure `getCellState` + `formatPeriodTime` + `DAY_FULL_LABEL`.
- `src/app/schedule/[academicYear]/[semester]/arrange/_lib/arrange-progress.ts` — pure `computeProgress` + `computeRemaining`.
- `src/app/schedule/[academicYear]/[semester]/arrange/_lib/auto-arrange-result.store.ts` — focused Zustand store for the last auto-arrange `failures`/`stats`.
- `src/app/schedule/[academicYear]/[semester]/arrange/@inspector/_components/InspectorClient.tsx` — client child rendering progress/remaining/conflicts.
- Test files colocated under `__tests__/` next to each `_lib` module.

**Modify:**
- `src/app/theme.ts` — add `lighter` to `success`/`error`.
- `arrange/@grid/page.tsx` — use shared types/fetcher + themed cells.
- `arrange/@inspector/page.tsx` — server query for required hours, render `InspectorClient`.
- `arrange/@header/_components/HeaderClient.tsx` — push auto-arrange result into the store.
- `arrange/@palette/_components/PaletteClient.tsx` — rail styling + unplaced count.
- `arrange/_components/ArrangeDndProvider.tsx` — `DragOverlay` preview.
- `arrange/layout.tsx` — two-column sticky-rail layout.
- `assign/page.tsx` — de-purple skeleton.
- `assign/component/QuickAssignmentPanel.tsx` — remove dead edit code + inline emoji.

---

## Task 1: Theme `lighter` tokens (unblocks grid tint)

**Files:**
- Modify: `src/app/theme.ts:56-70` (success + error palette blocks)
- Test: `src/app/__tests__/theme.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/app/__tests__/theme.test.ts
import { describe, it, expect } from "vitest";
import theme from "../theme";

describe("theme palette lighter tokens", () => {
  it("defines lighter on primary, success, and error", () => {
    expect(theme.palette.primary.lighter).toBe("#EFF6FF");
    expect(theme.palette.success.lighter).toBe("#ECFDF5");
    expect(theme.palette.error.lighter).toBe("#FEF2F2");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/app/__tests__/theme.test.ts`
Expected: FAIL — `success.lighter` and `error.lighter` are `undefined`.

- [ ] **Step 3: Add the tokens**

In `src/app/theme.ts`, add `lighter` to the `success` and `error` palette objects:

```ts
    success: {
      main: "#10B981", // emerald-500
      light: "#34D399",
      dark: "#047857",
      lighter: "#ECFDF5",
    },
    warning: {
      main: "#F59E0B", // amber-500
      light: "#FBBF24",
      dark: "#B45309",
    },
    error: {
      main: "#EF4444", // red-500
      light: "#F87171",
      dark: "#B91C1C",
      lighter: "#FEF2F2",
    },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/app/__tests__/theme.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/theme.ts src/app/__tests__/theme.test.ts
git commit -m "$(cat <<'EOF'
fix(theme): add lighter tokens to success and error palettes

success.lighter / error.lighter were referenced in the arrange grid but
only declared (optional) in mui.d.ts, never set — resolving to undefined
at runtime so placed-cell tint never rendered.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Shared teacher-schedule SWR helper

Extract the grid's SWR key + fetcher + row types so the inspector can subscribe to the identical key (SWR dedupes — single fetch).

**Files:**
- Create: `arrange/_lib/teacher-schedule.ts`
- Test: `arrange/_lib/__tests__/teacher-schedule.test.ts`
- Modify: `arrange/@grid/page.tsx` (import types + key/fetcher)

- [ ] **Step 1: Write the failing test**

```ts
// arrange/_lib/__tests__/teacher-schedule.test.ts
import { describe, it, expect } from "vitest";
import { teacherScheduleKey } from "../teacher-schedule";

describe("teacherScheduleKey", () => {
  it("returns null when teacher is missing or non-numeric", () => {
    expect(teacherScheduleKey(null, "2568", "1")).toBeNull();
    expect(teacherScheduleKey("abc", "2568", "1")).toBeNull();
  });

  it("builds the schedule URL for a numeric teacher id", () => {
    expect(teacherScheduleKey("12", "2568", "1")).toBe(
      "/api/schedule/teacher/12?year=2568&semester=1",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test arrange/_lib/__tests__/teacher-schedule.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the module**

```ts
// arrange/_lib/teacher-schedule.ts
export type Timeslot = {
  TimeslotID: string;
  DayOfWeek: string;
  Period: number;
  StartTime: string | Date;
  EndTime: string | Date;
  Breaktime: string;
};

export type ScheduleEntry = {
  ClassID: number;
  TimeslotID: string;
  SubjectCode: string;
  GradeID: string;
  RoomID: number;
  subject: { SubjectName: string };
  gradelevel: { GradeName: string };
  room: { RoomName: string };
};

export const jsonFetcher = (url: string) => fetch(url).then((r) => r.json());

export function timeslotsKey(year: string, semester: string): string {
  return `/api/timeslots?year=${year}&semester=${semester}`;
}

export function teacherScheduleKey(
  teacher: string | null,
  year: string,
  semester: string,
): string | null {
  if (!teacher || !/^\d+$/.test(teacher)) return null;
  return `/api/schedule/teacher/${teacher}?year=${year}&semester=${semester}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test arrange/_lib/__tests__/teacher-schedule.test.ts`
Expected: PASS

- [ ] **Step 5: Refactor GridSlot to use the helper (no behavior change)**

In `arrange/@grid/page.tsx`: delete the local `Timeslot` and `ScheduleEntry` type declarations and import them from the helper, and replace the inline SWR keys/fetcher:

```ts
import {
  type Timeslot,
  type ScheduleEntry,
  jsonFetcher,
  timeslotsKey,
  teacherScheduleKey,
} from "../_lib/teacher-schedule";
```

Replace the two `useSWR` calls' first two args:

```ts
  const {
    data: timeslotsData,
    error: timeslotsError,
    isLoading: timeslotsLoading,
  } = useSWR(timeslotsKey(academicYear, semester), jsonFetcher, {
    onError: () =>
      enqueueSnackbar("ไม่สามารถโหลดข้อมูลช่วงเวลาได้ กรุณาลองใหม่อีกครั้ง", {
        variant: "error",
      }),
  });

  const {
    data: scheduleData,
    error: scheduleError,
    isLoading: scheduleLoading,
    mutate,
  } = useSWR(
    teacherScheduleKey(teacher, academicYear, semester),
    jsonFetcher,
    {
      refreshInterval: 0,
      onError: () =>
        enqueueSnackbar("ไม่สามารถโหลดตารางสอนของครูได้ กรุณาลองใหม่อีกครั้ง", {
          variant: "error",
        }),
    },
  );
```

- [ ] **Step 6: Verify gates**

Run: `pnpm test arrange/_lib && pnpm typecheck`
Expected: PASS (no dev server running).

- [ ] **Step 7: Commit**

```bash
git add "src/app/schedule/[academicYear]/[semester]/arrange/_lib/teacher-schedule.ts" "src/app/schedule/[academicYear]/[semester]/arrange/_lib/__tests__/teacher-schedule.test.ts" "src/app/schedule/[academicYear]/[semester]/arrange/@grid/page.tsx"
git commit -m "$(cat <<'EOF'
refactor(arrange): extract shared teacher-schedule SWR key + fetcher

Lets the inspector subscribe to the identical SWR key the grid uses so
SWR dedupes to one fetch. No behavior change.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Grid presentation helpers (pure)

**Files:**
- Create: `arrange/_lib/grid-format.ts`
- Test: `arrange/_lib/__tests__/grid-format.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// arrange/_lib/__tests__/grid-format.test.ts
import { describe, it, expect } from "vitest";
import { getCellState, formatPeriodTime, DAY_FULL_LABEL } from "../grid-format";
import type { Timeslot, ScheduleEntry } from "../teacher-schedule";

const slot = (over: Partial<Timeslot> = {}): Timeslot => ({
  TimeslotID: "1-2568-MON-1",
  DayOfWeek: "MON",
  Period: 1,
  StartTime: "1970-01-01T08:30:00.000Z",
  EndTime: "1970-01-01T09:20:00.000Z",
  Breaktime: "NOT_BREAK",
  ...over,
});

describe("getCellState", () => {
  it("returns break when timeslot is a break", () => {
    expect(getCellState(slot({ Breaktime: "BREAK_JUNIOR" }), undefined, false).kind).toBe("break");
  });
  it("returns drop-target when isOver and not a break", () => {
    expect(getCellState(slot(), undefined, true).kind).toBe("drop-target");
  });
  it("returns placed when an entry exists", () => {
    const entry = { SubjectCode: "ค21101" } as ScheduleEntry;
    expect(getCellState(slot(), entry, false).kind).toBe("placed");
  });
  it("returns empty otherwise", () => {
    expect(getCellState(slot(), undefined, false).kind).toBe("empty");
  });
  it("break takes precedence over isOver", () => {
    expect(getCellState(slot({ Breaktime: "BREAK_JUNIOR" }), undefined, true).kind).toBe("break");
  });
});

describe("formatPeriodTime", () => {
  it("formats an ISO time to HH:mm in UTC", () => {
    expect(formatPeriodTime("1970-01-01T08:30:00.000Z")).toBe("08:30");
  });
  it("returns empty string for missing input", () => {
    expect(formatPeriodTime(undefined)).toBe("");
  });
});

describe("DAY_FULL_LABEL", () => {
  it("maps MON to จันทร์", () => {
    expect(DAY_FULL_LABEL.MON).toBe("จันทร์");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test arrange/_lib/__tests__/grid-format.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the module**

```ts
// arrange/_lib/grid-format.ts
import type { Timeslot, ScheduleEntry } from "./teacher-schedule";

export const DAY_FULL_LABEL: Record<string, string> = {
  MON: "จันทร์",
  TUE: "อังคาร",
  WED: "พุธ",
  THU: "พฤหัสบดี",
  FRI: "ศุกร์",
};

export type CellKind = "break" | "drop-target" | "placed" | "empty";

export type CellState = {
  kind: CellKind;
  /** non-color cue text for empty/break/drop-target */
  label: string;
};

const LABELS: Record<CellKind, string> = {
  break: "พัก",
  "drop-target": "วางที่นี่",
  placed: "",
  empty: "คาบว่าง",
};

export function getCellState(
  timeslot: Timeslot,
  entry: ScheduleEntry | undefined,
  isOver: boolean,
): CellState {
  let kind: CellKind;
  if (timeslot.Breaktime !== "NOT_BREAK") kind = "break";
  else if (isOver) kind = "drop-target";
  else if (entry) kind = "placed";
  else kind = "empty";
  return { kind, label: LABELS[kind] };
}

export function formatPeriodTime(time: string | Date | undefined): string {
  if (!time) return "";
  const d = typeof time === "string" ? new Date(time) : time;
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test arrange/_lib/__tests__/grid-format.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add "src/app/schedule/[academicYear]/[semester]/arrange/_lib/grid-format.ts" "src/app/schedule/[academicYear]/[semester]/arrange/_lib/__tests__/grid-format.test.ts"
git commit -m "$(cat <<'EOF'
feat(arrange): add pure grid cell-state and period-time helpers

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Themed grid UI

Rewrite `DroppableCell` and the header row to use `getCellState`, `formatPeriodTime`, `DAY_FULL_LABEL`, theme tokens, and a non-color cue (icon/text) per state. The placed tint now works (Task 1).

**Files:**
- Modify: `arrange/@grid/page.tsx` (`DroppableCell` + the `<thead>`/`<td>` rendering)

- [ ] **Step 1: Add imports**

At the top of `arrange/@grid/page.tsx`, add:

```ts
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getCellState, formatPeriodTime, DAY_FULL_LABEL } from "../_lib/grid-format";
```

Remove the now-unused local `DAYS`/`DAY_LABEL`? Keep `DAYS` (the column order array `["MON".."FRI"]`); delete the old `DAY_LABEL` map (replaced by `DAY_FULL_LABEL`).

- [ ] **Step 2: Replace `DroppableCell` body**

Replace the `DroppableCell` function with:

```tsx
function DroppableCell({
  timeslot,
  entry,
  onRemove,
}: {
  timeslot: Timeslot;
  entry?: ScheduleEntry;
  onRemove?: (classId: number) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: timeslot.TimeslotID,
    data: timeslot,
  });

  const state = getCellState(timeslot, entry, isOver);

  const bg = {
    break: "action.disabledBackground",
    "drop-target": "primary.lighter",
    placed: "success.lighter",
    empty: "background.paper",
  }[state.kind];

  const borderColor = {
    break: "divider",
    "drop-target": "primary.main",
    placed: "success.main",
    empty: "divider",
  }[state.kind];

  return (
    <Box
      ref={setNodeRef}
      data-testid="timeslot-card"
      data-timeslot-id={timeslot.TimeslotID}
      data-is-break={state.kind === "break"}
      data-subject-code={entry?.SubjectCode}
      sx={{
        border: state.kind === "empty" ? "1px dashed" : "1px solid",
        borderColor,
        borderRadius: 1,
        p: 1,
        minHeight: 80,
        position: "relative",
        bgcolor: bg,
        transition: "all 0.2s",
      }}
    >
      {state.kind === "placed" && entry ? (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1, minWidth: 0 }}>
              <CheckCircleIcon sx={{ fontSize: 16, color: "success.main", flexShrink: 0 }} />
              <Typography variant="body2" fontWeight="bold" noWrap>
                {entry.subject.SubjectName}
              </Typography>
            </Box>
            <IconButton
              data-testid="timeslot-remove"
              aria-label="ลบรายวิชาออกจากคาบเรียน"
              size="small"
              onClick={() => onRemove?.(entry.ClassID)}
              sx={{ p: 0.25, ml: 0.5, color: "error.main", "&:hover": { bgcolor: "error.lighter" } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
            <Chip label={entry.gradelevel.GradeName} size="small" color="primary" />
            <Chip label={entry.room.RoomName} size="small" variant="outlined" />
          </Box>
        </Box>
      ) : (
        <Typography
          variant="caption"
          color={state.kind === "drop-target" ? "primary.main" : "text.secondary"}
        >
          {state.kind === "drop-target" ? `⤓ ${state.label}` : state.label}
        </Typography>
      )}
    </Box>
  );
}
```

- [ ] **Step 3: Replace the table header + day cells**

In `GridSlot`'s returned table, replace the `<thead>` and the day `<td>` label:

```tsx
          <thead>
            <tr>
              <th style={{ minWidth: 64 }}>วัน \ คาบ</th>
              {periods.map((p) => {
                const anySlot = DAYS.map((d) => grid[d]?.[p]).find(Boolean);
                return (
                  <th key={p} style={{ minWidth: 120 }}>
                    <div style={{ fontWeight: 700 }}>{p}</div>
                    <div style={{ fontWeight: 400, fontSize: "0.7rem", color: "#94A3B8" }}>
                      {anySlot ? formatPeriodTime(anySlot.StartTime) : ""}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
```

And the day label cell:

```tsx
                <td style={{ textAlign: "center", fontWeight: "bold", whiteSpace: "nowrap" }}>
                  {DAY_FULL_LABEL[day] ?? day}
                </td>
```

- [ ] **Step 4: Verify gates**

Run: `pnpm typecheck && pnpm lint && pnpm build`
Expected: PASS.

- [ ] **Step 5: Manual UI verification**

Start the e2e dev server in one shell: `pnpm dev:e2e`. Using the `browser_eval` MCP tool (NOT curl — curl misses hydration), navigate to `/schedule/2568/1/arrange?teacher=<id>` for a teacher with placed periods. Confirm: placed cells show a green tint + ✓ + subject name; empty cells show a dashed border + "คาบว่าง"; period headers show clock times; rows show full Thai day names. Stop the dev server before running `pnpm typecheck` again.

- [ ] **Step 6: Commit**

```bash
git add "src/app/schedule/[academicYear]/[semester]/arrange/@grid/page.tsx"
git commit -m "$(cat <<'EOF'
feat(arrange): theme the timetable grid with clock times and cell-state cues

Placed cells now tint green + show a check icon, empty cells use a dashed
border, drop targets tint blue, headers show period clock times, rows use
full Thai day names. State is conveyed by icon/text + color (WCAG 1.4.1),
not color alone.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Inspector progress + remaining

`@inspector/page.tsx` becomes a server component that computes `required` (Σ TeachHour) and per-subject required hours from `teachers_responsibility`, then renders `InspectorClient`, which reads the live placed entries from the shared SWR key and shows a progress bar + remaining-per-subject list.

**Files:**
- Create: `arrange/_lib/arrange-progress.ts`
- Test: `arrange/_lib/__tests__/arrange-progress.test.ts`
- Create: `arrange/@inspector/_components/InspectorClient.tsx`
- Modify: `arrange/@inspector/page.tsx`

- [ ] **Step 1: Write the failing test for the progress math**

```ts
// arrange/_lib/__tests__/arrange-progress.test.ts
import { describe, it, expect } from "vitest";
import { computeProgress, computeRemaining } from "../arrange-progress";

describe("computeProgress", () => {
  it("computes placed/required and percent", () => {
    expect(computeProgress(18, 25)).toEqual({ placed: 18, required: 25, percent: 72 });
  });
  it("clamps percent to 100 and guards divide-by-zero", () => {
    expect(computeProgress(30, 25).percent).toBe(100);
    expect(computeProgress(0, 0)).toEqual({ placed: 0, required: 0, percent: 0 });
  });
});

describe("computeRemaining", () => {
  it("subtracts placed-per-subject from required-per-subject, floored at 0", () => {
    const required = [
      { SubjectCode: "ค21101", SubjectName: "คณิตศาสตร์", requiredHours: 3 },
      { SubjectCode: "ว21101", SubjectName: "วิทยาศาสตร์", requiredHours: 2 },
    ];
    const placedBySubject = { "ค21101": 1 };
    expect(computeRemaining(required, placedBySubject)).toEqual([
      { SubjectCode: "ค21101", SubjectName: "คณิตศาสตร์", remaining: 2 },
      { SubjectCode: "ว21101", SubjectName: "วิทยาศาสตร์", remaining: 2 },
    ]);
  });
  it("omits subjects with zero remaining", () => {
    const required = [{ SubjectCode: "ค21101", SubjectName: "คณิตศาสตร์", requiredHours: 2 }];
    expect(computeRemaining(required, { "ค21101": 2 })).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test arrange/_lib/__tests__/arrange-progress.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the module**

```ts
// arrange/_lib/arrange-progress.ts
export type RequiredSubject = {
  SubjectCode: string;
  SubjectName: string;
  requiredHours: number;
};

export type RemainingSubject = {
  SubjectCode: string;
  SubjectName: string;
  remaining: number;
};

export function computeProgress(placed: number, required: number) {
  const percent =
    required <= 0 ? 0 : Math.min(100, Math.round((placed / required) * 100));
  return { placed, required, percent };
}

export function computeRemaining(
  required: RequiredSubject[],
  placedBySubject: Record<string, number>,
): RemainingSubject[] {
  return required
    .map((r) => ({
      SubjectCode: r.SubjectCode,
      SubjectName: r.SubjectName,
      remaining: Math.max(0, r.requiredHours - (placedBySubject[r.SubjectCode] ?? 0)),
    }))
    .filter((r) => r.remaining > 0);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test arrange/_lib/__tests__/arrange-progress.test.ts`
Expected: PASS

- [ ] **Step 5: Create `InspectorClient`**

```tsx
// arrange/@inspector/_components/InspectorClient.tsx
"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Box, Stack, Typography, LinearProgress, Chip, Divider } from "@mui/material";
import {
  jsonFetcher,
  teacherScheduleKey,
  type ScheduleEntry,
} from "../../_lib/teacher-schedule";
import {
  computeProgress,
  computeRemaining,
  type RequiredSubject,
} from "../../_lib/arrange-progress";
import { useAutoArrangeResult } from "../../_lib/auto-arrange-result.store";

type Props = {
  required: RequiredSubject[];
  requiredTotal: number;
};

export default function InspectorClient({ required, requiredTotal }: Props) {
  const params = useParams();
  const searchParams = useSearchParams();
  const academicYear = params.academicYear as string;
  const semester = params.semester as string;
  const teacher = searchParams.get("teacher");

  const { data, mutate } = useSWR(
    teacherScheduleKey(teacher, academicYear, semester),
    jsonFetcher,
  );

  useEffect(() => {
    const handler = () => { void mutate(); };
    window.addEventListener("schedule-updated", handler);
    return () => window.removeEventListener("schedule-updated", handler);
  }, [mutate]);

  const entries: ScheduleEntry[] = data?.data ?? [];
  const placedBySubject = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.SubjectCode] = (acc[e.SubjectCode] ?? 0) + 1;
    return acc;
  }, {});

  const progress = computeProgress(entries.length, requiredTotal);
  const remaining = computeRemaining(required, placedBySubject);
  const failures = useAutoArrangeResult((s) => s.failures);

  return (
    <Stack spacing={2} sx={{ p: 2 }} data-testid="arrange-inspector">
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          ความคืบหน้า
        </Typography>
        <Typography variant="body2" color="text.secondary">
          จัดแล้ว {progress.placed} / {progress.required} คาบ ({progress.percent}%)
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress.percent}
          color="success"
          sx={{ mt: 1, height: 8, borderRadius: 4 }}
        />
      </Box>

      <Divider />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          ยังไม่ได้จัด
        </Typography>
        {remaining.length === 0 ? (
          <Typography variant="body2" color="success.main">
            จัดครบทุกวิชาแล้ว
          </Typography>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {remaining.map((r) => (
              <Chip
                key={r.SubjectCode}
                label={`${r.SubjectCode} · ${r.remaining} คาบ`}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        )}
      </Box>

      {failures.length > 0 && (
        <>
          <Divider />
          <Box>
            <Typography variant="subtitle2" color="warning.main" gutterBottom>
              ⚠ ข้อขัดแย้งจากการจัดอัตโนมัติ
            </Typography>
            <Stack spacing={0.5}>
              {failures.map((f, i) => (
                <Typography key={`${f.subjectCode}-${i}`} variant="caption" color="text.secondary">
                  {f.subjectCode}: {f.reason}
                </Typography>
              ))}
            </Stack>
          </Box>
        </>
      )}
    </Stack>
  );
}
```

(`useAutoArrangeResult` is created in Task 6; this task may leave the `failures` block in place — TypeScript will error until Task 6 adds the store, so **implement Task 6 before running typecheck/build on this task**, or temporarily stub. Ordering note: do Tasks 5 and 6 as a pair, committing 5 then 6, running full gates at the end of 6.)

- [ ] **Step 6: Rewrite `@inspector/page.tsx` as a server component**

```tsx
// arrange/@inspector/page.tsx
import { prisma } from "@/lib/prisma";
import { semester as semesterEnum } from "@/prisma/generated/client";
import { Alert } from "@mui/material";
import InspectorClient from "./_components/InspectorClient";
import type { RequiredSubject } from "../_lib/arrange-progress";

export default async function InspectorSlot({
  params,
  searchParams,
}: {
  params: Promise<{ academicYear: string; semester: string }>;
  searchParams: Promise<{ teacher?: string }>;
}) {
  const { academicYear, semester } = await params;
  const { teacher } = await searchParams;

  if (!teacher || !/^\d+$/.test(teacher)) {
    return (
      <Alert severity="info" variant="outlined" sx={{ m: 2 }}>
        เลือกครูเพื่อดูข้อมูล
      </Alert>
    );
  }

  const sem = semester === "2" ? semesterEnum.SEMESTER_2 : semesterEnum.SEMESTER_1;
  const responsibilities = await prisma.teachers_responsibility.findMany({
    where: {
      TeacherID: parseInt(teacher, 10),
      AcademicYear: parseInt(academicYear, 10),
      Semester: sem,
    },
    include: { subject: { select: { SubjectCode: true, SubjectName: true } } },
  });

  // Aggregate required hours per subject (a subject may span multiple grades).
  const bySubject = new Map<string, RequiredSubject>();
  let requiredTotal = 0;
  for (const r of responsibilities) {
    requiredTotal += r.TeachHour;
    const existing = bySubject.get(r.subject.SubjectCode);
    if (existing) existing.requiredHours += r.TeachHour;
    else
      bySubject.set(r.subject.SubjectCode, {
        SubjectCode: r.subject.SubjectCode,
        SubjectName: r.subject.SubjectName,
        requiredHours: r.TeachHour,
      });
  }

  return (
    <InspectorClient
      required={[...bySubject.values()]}
      requiredTotal={requiredTotal}
    />
  );
}
```

> **Verify before coding:** confirm `teachers_responsibility` has a numeric `TeachHour` scalar (it does — `QuickAssignmentPanel` reads `assignment.TeachHour` as a number and `@palette/page.tsx` uses `include` which returns it). If the field name differs in the Prisma schema, adjust.

- [ ] **Step 7: Commit (after Task 6 gates pass)**

```bash
git add "src/app/schedule/[academicYear]/[semester]/arrange/_lib/arrange-progress.ts" "src/app/schedule/[academicYear]/[semester]/arrange/_lib/__tests__/arrange-progress.test.ts" "src/app/schedule/[academicYear]/[semester]/arrange/@inspector/_components/InspectorClient.tsx" "src/app/schedule/[academicYear]/[semester]/arrange/@inspector/page.tsx"
git commit -m "$(cat <<'EOF'
feat(arrange): data-rich inspector with progress and remaining widgets

Inspector now shows placed/required progress and remaining-per-subject,
computed from teachers_responsibility (server) + live placed entries from
the shared SWR key (client).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Auto-arrange result store + conflicts wiring

Surface auto-arrange failures (reuse-only) in the inspector via a small focused Zustand store set by the header.

**Files:**
- Create: `arrange/_lib/auto-arrange-result.store.ts`
- Test: `arrange/_lib/__tests__/auto-arrange-result.store.test.ts`
- Modify: `arrange/@header/_components/HeaderClient.tsx`

- [ ] **Step 1: Write the failing test**

```ts
// arrange/_lib/__tests__/auto-arrange-result.store.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { useAutoArrangeResult } from "../auto-arrange-result.store";

describe("auto-arrange-result store", () => {
  beforeEach(() => {
    useAutoArrangeResult.getState().clear();
  });

  it("starts empty", () => {
    expect(useAutoArrangeResult.getState().failures).toEqual([]);
  });

  it("stores failures and stats", () => {
    useAutoArrangeResult.getState().setResult({
      failures: [{ subjectCode: "ค21101", reason: "ไม่มีคาบว่าง" }],
      stats: { successfullyPlaced: 5, failed: 1 },
    });
    expect(useAutoArrangeResult.getState().failures).toHaveLength(1);
    expect(useAutoArrangeResult.getState().stats?.failed).toBe(1);
  });

  it("clear resets to empty", () => {
    useAutoArrangeResult.getState().setResult({
      failures: [{ subjectCode: "x", reason: "y" }],
      stats: null,
    });
    useAutoArrangeResult.getState().clear();
    expect(useAutoArrangeResult.getState().failures).toEqual([]);
    expect(useAutoArrangeResult.getState().stats).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test arrange/_lib/__tests__/auto-arrange-result.store.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the store**

```ts
// arrange/_lib/auto-arrange-result.store.ts
import { create } from "zustand";

export type AutoArrangeFailure = { subjectCode: string; reason: string };
export type AutoArrangeStats = { successfullyPlaced: number; failed: number };

type State = {
  failures: AutoArrangeFailure[];
  stats: AutoArrangeStats | null;
  setResult: (r: { failures: AutoArrangeFailure[]; stats: AutoArrangeStats | null }) => void;
  clear: () => void;
};

export const useAutoArrangeResult = create<State>((set) => ({
  failures: [],
  stats: null,
  setResult: ({ failures, stats }) => set({ failures, stats }),
  clear: () => set({ failures: [], stats: null }),
}));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test arrange/_lib/__tests__/auto-arrange-result.store.test.ts`
Expected: PASS

- [ ] **Step 5: Wire HeaderClient to set the store**

In `arrange/@header/_components/HeaderClient.tsx`, add the import:

```ts
import { useAutoArrangeResult } from "../../_lib/auto-arrange-result.store";
```

Inside `HeaderClient`, near the top of the function body, read the setter:

```ts
  const setAutoArrangeResult = useAutoArrangeResult((s) => s.setResult);
```

In `handleAutoArrange`, after a successful `result` (in the `success` branch, right before `router.refresh()`), record it; and in the failure branch record the failures:

```ts
      // failure branch (result.success === false): after building failureMsg
      setAutoArrangeResult({ failures: result.failures ?? [], stats: null });
```

```ts
      // success branch: after `const { stats } = result;`
      setAutoArrangeResult({
        failures: result.failures,
        stats: { successfullyPlaced: stats.successfullyPlaced, failed: stats.failed },
      });
```

- [ ] **Step 6: Verify full gates (Tasks 5 + 6 together)**

Run: `pnpm test arrange/_lib && pnpm typecheck && pnpm lint && pnpm build`
Expected: PASS. `InspectorClient`'s `useAutoArrangeResult` import now resolves.

- [ ] **Step 7: Manual verification**

With `pnpm dev:e2e`, open `/schedule/2568/1/arrange?teacher=<id>`, click "จัดอัตโนมัติ", and confirm the inspector's conflicts section lists any failures and the progress bar advances. Stop the dev server afterward.

- [ ] **Step 8: Commit**

```bash
git add "src/app/schedule/[academicYear]/[semester]/arrange/_lib/auto-arrange-result.store.ts" "src/app/schedule/[academicYear]/[semester]/arrange/_lib/__tests__/auto-arrange-result.store.test.ts" "src/app/schedule/[academicYear]/[semester]/arrange/@header/_components/HeaderClient.tsx"
git commit -m "$(cat <<'EOF'
feat(arrange): surface auto-arrange failures in the inspector

Focused Zustand store carries the last auto-arrange failures/stats from
the header to the inspector conflicts widget (reuse-only; the per-drop
conflict modal flow is unchanged).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Sticky palette rail + layout + DragOverlay

**Files:**
- Modify: `arrange/layout.tsx` (two-column sticky-rail)
- Modify: `arrange/@palette/_components/PaletteClient.tsx` (rail style + unplaced count)
- Modify: `arrange/_components/ArrangeDndProvider.tsx` (DragOverlay)

- [ ] **Step 1: Layout — two-column sticky rail**

In `arrange/layout.tsx`, replace the `<ArrangeDndProvider>` block's children (the `<Stack>…</Stack>`) with a flex row: sticky palette left, grid + inspector stacked right. Keep `header` and `modal` slots as-is.

```tsx
      <ArrangeDndProvider>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <Box
            data-slot="palette"
            sx={{
              width: 320,
              flexShrink: 0,
              position: "sticky",
              top: 16,
              alignSelf: "flex-start",
            }}
          >
            {palette}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box data-slot="grid">{grid}</Box>
            <Box data-slot="inspector" sx={{ mt: 2 }}>
              {inspector}
            </Box>
          </Box>
        </Box>
      </ArrangeDndProvider>
```

Remove the now-unused `Grid` and `Stack` imports if they are no longer referenced elsewhere in the file (the empty-state branch still uses `Stack` — keep `Stack`, drop `Grid`).

- [ ] **Step 2: Palette rail styling + unplaced count**

In `PaletteClient.tsx`, the subject-list `Box` `maxHeight` assumes the old layout. Change it to a rail-friendly sticky height and add an unplaced count chip in the header. Replace the title `Typography` and the list `maxHeight`:

```tsx
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6">รายวิชาที่สอน</Typography>
        <Chip label={`${subjects.length} วิชา`} size="small" color="primary" variant="outlined" />
      </Box>
```

```tsx
      <Box
        sx={{ maxHeight: "calc(100vh - 240px)", overflow: "auto" }}
        aria-live="polite"
      >
```

(`Chip` is already imported in `PaletteClient.tsx`.)

- [ ] **Step 3: DragOverlay preview**

In `ArrangeDndProvider.tsx`, track the active drag subject and render a `DragOverlay`. Add to imports:

```ts
import { DragOverlay, type DragStartEvent } from "@dnd-kit/core";
import { Paper, Typography } from "@mui/material";
```

Add state + handler inside the component:

```ts
  const [activeSubject, setActiveSubject] = useState<{
    SubjectName?: string;
    GradeName?: string;
  } | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveSubject((event.active.data.current as { SubjectName?: string; GradeName?: string }) ?? null);
  };
```

Set `setActiveSubject(null)` at the start of `handleDragEnd`. Then wire the context:

```tsx
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeSubject ? (
          <Paper sx={{ p: 1, px: 1.5, boxShadow: 4 }}>
            <Typography variant="body2" fontWeight="bold">
              {activeSubject.SubjectName ?? "รายวิชา"}
            </Typography>
            {activeSubject.GradeName && (
              <Typography variant="caption" color="text.secondary">
                {activeSubject.GradeName}
              </Typography>
            )}
          </Paper>
        ) : null}
      </DragOverlay>
      {conflictModal && ( /* ...unchanged... */ )}
    </DndContext>
```

(Palette passes the full `subject` as drag data, so `SubjectName`/`GradeName` are present.)

- [ ] **Step 4: Verify gates**

Run: `pnpm typecheck && pnpm lint && pnpm build`
Expected: PASS.

- [ ] **Step 5: Manual verification**

With `pnpm dev:e2e`, open the arrange page with a selected teacher. Confirm: palette is a fixed-width left rail that stays in view on scroll; grid + inspector fill the right column; dragging a subject shows a floating preview card; dropping onto a slot still routes to room-select / opens the conflict modal as before. Stop the dev server afterward.

- [ ] **Step 6: Commit**

```bash
git add "src/app/schedule/[academicYear]/[semester]/arrange/layout.tsx" "src/app/schedule/[academicYear]/[semester]/arrange/@palette/_components/PaletteClient.tsx" "src/app/schedule/[academicYear]/[semester]/arrange/_components/ArrangeDndProvider.tsx"
git commit -m "$(cat <<'EOF'
feat(arrange): sticky palette rail layout with drag preview

Palette becomes a sticky left rail beside the grid (short drags); grid and
inspector stack in the right column; dnd-kit DragOverlay shows a floating
subject preview while dragging. Desktop-only.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Assign — de-purple skeleton + remove dead code

**Files:**
- Modify: `assign/page.tsx` (`AssignPageSkeleton`)
- Modify: `assign/component/QuickAssignmentPanel.tsx` (dead edit code + inline emoji)

- [ ] **Step 1: De-purple the skeleton**

In `assign/page.tsx`, replace the two `Paper` blocks in `AssignPageSkeleton` so they use neutral theme surfaces (no hardcoded gradient/hex):

```tsx
      {/* Teacher Search Section Skeleton */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: "grey.100" }}>
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="rounded" height={56} sx={{ mt: 2 }} />
      </Paper>

      {/* Content Skeleton */}
      <Paper
        elevation={0}
        sx={{ p: 6, borderRadius: 3, textAlign: "center", border: "2px dashed", borderColor: "divider" }}
      >
        <Skeleton variant="circular" width={64} height={64} sx={{ mx: "auto", mb: 2 }} />
        <Skeleton variant="text" width={200} height={32} sx={{ mx: "auto" }} />
        <Skeleton variant="text" width={300} height={20} sx={{ mx: "auto" }} />
      </Paper>
```

- [ ] **Step 2: Remove the dead edit path in `QuickAssignmentPanel`**

The edit feature is disabled. Remove: the `editingId`/`editingHours` `useState` pairs, `handleEdit`, `handleSaveEdit`, `handleCancelEdit`, and the `_onAssignmentUpdated` prop from `QuickAssignmentPanelProps` and the destructure. Remove any JSX in the assignments table that references `editingId`/`handleSaveEdit`/`handleCancelEdit`/`handleEdit` (the inline edit row and its edit/save/cancel buttons) — leave the delete action intact. After removal, the table row shows `TeachHour` as static text with only the delete button.

> Read the full table-row JSX (`QuickAssignmentPanel.tsx:576` onward) before editing so every `editingId` branch is removed cleanly. If `_onAssignmentUpdated` is part of the props type, also remove it from the call site in `ShowTeacherData.tsx` (search for `onAssignmentUpdated=`).

- [ ] **Step 3: Strip redundant inline emoji from Alerts**

In `QuickAssignmentPanel.tsx`, the Alerts already pass MUI icons. Remove the leading emoji characters from the Alert string literals (`⚠️` at `:518`, the `✓`/`•` bullets at `:535-546`), keeping the Thai text. Keep the `icon={...}` props.

- [ ] **Step 4: Verify gates**

Run: `pnpm typecheck && pnpm lint && pnpm build && pnpm validate:tokens`
Expected: PASS — `validate:tokens` should no longer flag the assign skeleton hex.

- [ ] **Step 5: Manual verification**

With `pnpm dev:e2e`, open `/schedule/2568/1/assign`, confirm the loading skeleton is neutral (no purple), add an assignment, confirm the table renders with a delete action and no edit controls, and the validation hint Alerts show MUI icons without duplicate emoji. Stop the dev server afterward.

- [ ] **Step 6: Commit**

```bash
git add "src/app/schedule/[academicYear]/[semester]/assign/page.tsx" "src/app/schedule/[academicYear]/[semester]/assign/component/QuickAssignmentPanel.tsx"
git commit -m "$(cat <<'EOF'
refactor(assign): theme-neutral skeleton, drop dead edit path and emoji

Replaces the hardcoded purple-gradient loading skeleton with neutral theme
surfaces, removes the disabled inline-edit code from QuickAssignmentPanel,
and de-duplicates emoji that doubled the MUI Alert icons.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Final verification

- [ ] Run the full unit suite: `pnpm test` → PASS.
- [ ] `pnpm typecheck && pnpm lint && pnpm build && pnpm validate:tokens` → PASS (dev server stopped).
- [ ] Manual sweep via `browser_eval`: assign page (neutral skeleton, add/delete assignment), arrange page (rail layout, themed grid, drag preview, inspector progress/remaining, auto-arrange surfaces failures).
- [ ] Note: `e2e/visual/critical-ui.spec.ts` only snapshots `header--` on arrange sub-pages — it does not cover the grid body or inspector, so these rely on the unit tests + build + manual verification above.
