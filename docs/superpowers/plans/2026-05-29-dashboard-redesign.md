# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the redundant 7-block Tailwind semester dashboard with a lean 3-block action-first MUI layout (Header → ActionCenter + QuickNav → Charts).

**Architecture:** A pure `buildActionItems` function (TDD, unit-tested) derives an ordered fix-it list from already-computed stats/conflicts/readiness. Two new MUI server components — `ActionCenter` (async, fetches + renders the list) and `QuickNav` (static nav) — replace QuickStats, SummaryInfo, ReadinessIssues, PublishReadinessCard, and HealthIndicators. The page keeps per-section `<Suspense>` streaming and reuses the existing charts unchanged. No new data queries.

**Tech Stack:** Next.js 16 (App Router, RSC), MUI v6 + `@mui/icons-material`, theme tokens from `src/app/theme.ts`, Vitest for unit tests, Playwright for e2e visual snapshots.

**Spec:** `docs/superpowers/specs/2026-05-29-dashboard-redesign-design.md`

**RSC constraint (do not violate):** All new components are server components. Use plain `href` strings on MUI `Button` / `ListItemButton` (renders an `<a>`). NEVER `component={Link}` in a server component — it crashes at runtime via RSC serialization and `pnpm build` does NOT catch it.

---

## File Structure

- Create: `src/features/dashboard/domain/services/action-items.service.ts` — pure `buildActionItems(inputs): ActionItem[]`, the only logic with branching. Lives beside `dashboard-stats.service.ts`.
- Create: `src/features/dashboard/domain/services/action-items.service.test.ts` — Vitest unit tests for ordering/severity/hrefs/empty.
- Create: `src/app/dashboard/_components/ActionCenter.tsx` — async server component; fetches data, computes stats, calls `buildActionItems`, renders worklist `Paper` + empty state.
- Create: `src/app/dashboard/_components/QuickNav.tsx` — static server component; `Paper` with a `List` of the 7 tool links and MUI icons.
- Modify: `src/app/dashboard/[academicYear]/[semester]/page.tsx` — rewrite to MUI layout B; delete cut sections and their skeletons; reshape remaining skeletons.

---

## Task 1: Pure `buildActionItems` (TDD)

**Files:**
- Create: `src/features/dashboard/domain/services/action-items.service.ts`
- Test: `src/features/dashboard/domain/services/action-items.service.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/features/dashboard/domain/services/action-items.service.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildActionItems, type ActionItemInputs } from "./action-items.service";

const baseInputs = (overrides: Partial<ActionItemInputs> = {}): ActionItemInputs => ({
  year: 2568,
  semester: 1,
  conflicts: { teacherConflicts: 0, classConflicts: 0, roomConflicts: 0 },
  completion: { full: 10, partial: 0, none: 0 },
  teachers: { withSchedules: 20, withoutSchedules: 0 },
  readiness: { status: "ready", issues: [], details: { incompleteGrades: [], moeValidationResults: [] } },
  ...overrides,
});

describe("buildActionItems", () => {
  it("returns no items when everything is healthy", () => {
    expect(buildActionItems(baseInputs())).toEqual([]);
  });

  it("emits a publish blocker (error, first) when readiness is not ready", () => {
    const items = buildActionItems(
      baseInputs({
        readiness: {
          status: "incomplete",
          issues: ["ขาดข้อมูลครูประจำชั้น 2 ห้อง"],
          details: { incompleteGrades: [], moeValidationResults: [] },
        },
      }),
    );
    expect(items[0]).toMatchObject({
      id: "publish",
      severity: "error",
      detail: "ขาดข้อมูลครูประจำชั้น 2 ห้อง",
      href: "/schedule/2568/1/lock",
    });
  });

  it("ignores readiness when status is ready or unknown", () => {
    expect(buildActionItems(baseInputs({ readiness: { status: "unknown", issues: [], details: { incompleteGrades: [], moeValidationResults: [] } } }))).toEqual([]);
  });

  it("emits a conflicts row (error) summing all conflict types", () => {
    const items = buildActionItems(baseInputs({ conflicts: { teacherConflicts: 2, classConflicts: 1, roomConflicts: 0 } }));
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: "conflicts", severity: "error", title: "พบข้อขัดแย้ง 3 รายการ", href: "/dashboard/2568/1/conflicts" });
  });

  it("emits an incomplete-classes row (warning) summing none + partial", () => {
    const items = buildActionItems(baseInputs({ completion: { full: 4, partial: 3, none: 2 } }));
    expect(items[0]).toMatchObject({ id: "classes", severity: "warning", title: "5 ชั้นเรียนตารางยังไม่ครบ", href: "/dashboard/2568/1/student-table" });
  });

  it("emits a teachers-without-schedule row (info)", () => {
    const items = buildActionItems(baseInputs({ teachers: { withSchedules: 18, withoutSchedules: 2 } }));
    expect(items[0]).toMatchObject({ id: "teachers", severity: "info", title: "ครู 2 คนยังไม่มีตารางสอน", href: "/dashboard/2568/1/teacher-table" });
  });

  it("orders items error → warning → info", () => {
    const items = buildActionItems(
      baseInputs({
        readiness: { status: "moe-failed", issues: ["x"], details: { incompleteGrades: [], moeValidationResults: [] } },
        conflicts: { teacherConflicts: 1, classConflicts: 0, roomConflicts: 0 },
        completion: { full: 1, partial: 1, none: 0 },
        teachers: { withSchedules: 1, withoutSchedules: 1 },
      }),
    );
    expect(items.map((i) => i.id)).toEqual(["publish", "conflicts", "classes", "teachers"]);
    expect(items.map((i) => i.severity)).toEqual(["error", "error", "warning", "info"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/features/dashboard/domain/services/action-items.service.test.ts`
Expected: FAIL — `Failed to resolve import "./action-items.service"`.

- [ ] **Step 3: Write minimal implementation**

Create `src/features/dashboard/domain/services/action-items.service.ts`:

```ts
/**
 * Action-first dashboard worklist builder.
 * Pure view-model: maps already-computed dashboard stats into an ordered list
 * of actionable issues. Severity order is the insertion order: error → warning → info.
 */
import type { PublishReadinessResult } from "@/features/config/domain/types/publish-readiness-types";

export type ActionSeverity = "error" | "warning" | "info";

export interface ActionItem {
  id: string;
  severity: ActionSeverity;
  title: string;
  detail: string;
  href: string;
}

export interface ActionItemInputs {
  year: number;
  semester: number;
  conflicts: { teacherConflicts: number; classConflicts: number; roomConflicts: number };
  completion: { full: number; partial: number; none: number };
  teachers: { withSchedules: number; withoutSchedules: number };
  readiness: PublishReadinessResult | null;
}

export function buildActionItems(inputs: ActionItemInputs): ActionItem[] {
  const { year, semester, conflicts, completion, teachers, readiness } = inputs;
  const base = `/dashboard/${year}/${semester}`;
  const items: ActionItem[] = [];

  if (readiness && readiness.status !== "ready" && readiness.status !== "unknown") {
    items.push({
      id: "publish",
      severity: "error",
      title: "ยังเผยแพร่ไม่ได้",
      detail: readiness.issues[0] ?? `${readiness.issues.length} ประเด็นที่ต้องแก้`,
      href: `/schedule/${year}/${semester}/lock`,
    });
  }

  const totalConflicts =
    conflicts.teacherConflicts + conflicts.classConflicts + conflicts.roomConflicts;
  if (totalConflicts > 0) {
    items.push({
      id: "conflicts",
      severity: "error",
      title: `พบข้อขัดแย้ง ${totalConflicts} รายการ`,
      detail: `ครู ${conflicts.teacherConflicts} · ชั้นเรียน ${conflicts.classConflicts} · ห้องเรียน ${conflicts.roomConflicts}`,
      href: `${base}/conflicts`,
    });
  }

  const incompleteClasses = completion.none + completion.partial;
  if (incompleteClasses > 0) {
    items.push({
      id: "classes",
      severity: "warning",
      title: `${incompleteClasses} ชั้นเรียนตารางยังไม่ครบ`,
      detail: `ยังไม่มีตารางเลย ${completion.none} · ไม่เต็ม ${completion.partial}`,
      href: `${base}/student-table`,
    });
  }

  if (teachers.withoutSchedules > 0) {
    items.push({
      id: "teachers",
      severity: "info",
      title: `ครู ${teachers.withoutSchedules} คนยังไม่มีตารางสอน`,
      detail: "ควรจัดภาระงานสอนให้ครบ",
      href: `${base}/teacher-table`,
    });
  }

  return items;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/features/dashboard/domain/services/action-items.service.test.ts`
Expected: PASS — 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/dashboard/domain/services/action-items.service.ts src/features/dashboard/domain/services/action-items.service.test.ts
git commit -m "feat(dashboard): add buildActionItems worklist builder"
```

---

## Task 2: `ActionCenter` server component

**Files:**
- Create: `src/app/dashboard/_components/ActionCenter.tsx`

- [ ] **Step 1: Create the component**

Create `src/app/dashboard/_components/ActionCenter.tsx`:

```tsx
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { SvgIconComponent } from "@mui/icons-material";
import type { semester } from "@/prisma/generated/client";
import { dashboardRepository } from "@/features/dashboard/infrastructure/repositories/dashboard.repository";
import {
  countTeachersWithSchedules,
  countClassCompletion,
  detectConflicts,
} from "@/features/dashboard/domain/services/dashboard-stats.service";
import { getPublishReadiness } from "@/features/config/application/services/publish-readiness-query.service";
import {
  buildActionItems,
  type ActionItem,
  type ActionSeverity,
} from "@/features/dashboard/domain/services/action-items.service";

const severityConfig: Record<
  ActionSeverity,
  { color: "error" | "warning" | "info"; Icon: SvgIconComponent }
> = {
  error: { color: "error", Icon: ReportProblemIcon },
  warning: { color: "warning", Icon: WarningAmberIcon },
  info: { color: "info", Icon: InfoOutlinedIcon },
};

function ActionRow({ item }: { item: ActionItem }) {
  const { color, Icon } = severityConfig[item.severity];
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.75,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        borderLeft: "4px solid",
        borderLeftColor: `${color}.main`,
        bgcolor: "background.paper",
        transition: "box-shadow .15s",
        "&:hover": { boxShadow: 2 },
      }}
    >
      <Box
        sx={{
          flex: "0 0 auto",
          width: 38,
          height: 38,
          borderRadius: 1.5,
          display: "grid",
          placeItems: "center",
          bgcolor: `${color}.light`,
          color: `${color}.dark`,
        }}
      >
        <Icon aria-hidden fontSize="small" />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap>
          {item.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap component="p">
          {item.detail}
        </Typography>
      </Box>
      <Button href={item.href} variant="contained" size="small">
        แก้
      </Button>
    </Box>
  );
}

export async function ActionCenter({
  semesterAndyear,
  year,
  semester,
  semesterEnum,
}: {
  semesterAndyear: string;
  year: number;
  semester: number;
  semesterEnum: semester;
}) {
  const [schedules, grades, quickStats, readiness] = await Promise.all([
    dashboardRepository.getScheduleStatsData(year, semesterEnum),
    dashboardRepository.getGradesBasic(),
    dashboardRepository.getQuickStats(semesterAndyear, year, semesterEnum),
    getPublishReadiness(semesterAndyear),
  ]);

  const teachers = countTeachersWithSchedules(schedules, quickStats.teacherCount);
  const completion = countClassCompletion(schedules, grades, quickStats.timeslotCount);
  const conflicts = detectConflicts(schedules);

  const items = buildActionItems({
    year,
    semester,
    conflicts,
    completion,
    teachers,
    readiness: readiness ?? null,
  });

  return (
    <Paper sx={{ p: 2.75 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <WarningAmberIcon aria-hidden sx={{ color: "warning.main" }} />
        <Typography variant="h6" fontWeight={700}>
          ต้องแก้ก่อน
          {items.length > 0 ? ` · ${items.length} รายการ` : ""}
        </Typography>
      </Box>

      {items.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 2.5,
            borderRadius: 2,
            bgcolor: "success.light",
            color: "success.dark",
          }}
        >
          <CheckCircleIcon aria-hidden />
          <Typography variant="body2" fontWeight={700}>
            ทุกอย่างเรียบร้อย
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {items.map((item) => (
            <ActionRow key={item.id} item={item} />
          ))}
        </Stack>
      )}
    </Paper>
  );
}
```

- [ ] **Step 2: Typecheck the new component**

Stop any running `next dev` first (it corrupts `.next/dev/types`), then run:
`pnpm typecheck`
Expected: PASS — no errors referencing `ActionCenter.tsx`.

> If `getQuickStats` does not expose `teacherCount`/`timeslotCount`, or `getPublishReadiness` returns a different nullable shape, fix the call sites to match the real signatures in `src/features/dashboard/infrastructure/repositories/dashboard.repository.ts` and `publish-readiness-query.service.ts` — these are the same calls the old `HealthIndicators`/`QuickStats` made, so the shapes are known-good.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/_components/ActionCenter.tsx
git commit -m "feat(dashboard): add ActionCenter worklist component"
```

---

## Task 3: `QuickNav` server component

**Files:**
- Create: `src/app/dashboard/_components/QuickNav.tsx`

- [ ] **Step 1: Create the component**

Create `src/app/dashboard/_components/QuickNav.tsx`:

```tsx
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import ScheduleIcon from "@mui/icons-material/Schedule";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LockIcon from "@mui/icons-material/Lock";
import BarChartIcon from "@mui/icons-material/BarChart";
import type { SvgIconComponent } from "@mui/icons-material";

export function QuickNav({ year, semester }: { year: number; semester: number }) {
  const base = `/dashboard/${year}/${semester}`;
  const links: { href: string; label: string; Icon: SvgIconComponent }[] = [
    { href: `${base}/teacher-table`, label: "ตารางสอนครู", Icon: PersonIcon },
    { href: `${base}/student-table`, label: "ตารางเรียนนักเรียน", Icon: GroupsIcon },
    { href: `${base}/all-timeslot`, label: "จัดการคาบเรียน", Icon: ScheduleIcon },
    { href: `${base}/all-program`, label: "หลักสูตร", Icon: MenuBookIcon },
    { href: `${base}/conflicts`, label: "ตรวจสอบความซ้ำซ้อน", Icon: WarningAmberIcon },
    { href: `/schedule/${year}/${semester}/lock`, label: "ล็อกคาบเรียน", Icon: LockIcon },
    { href: `${base}/analytics`, label: "วิเคราะห์ข้อมูล", Icon: BarChartIcon },
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ px: 1, mb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          เมนูด่วน
        </Typography>
      </Box>
      <List disablePadding>
        {links.map(({ href, label, Icon }) => (
          <ListItemButton key={href} href={href} sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 40, color: "primary.main" }}>
              <Icon aria-hidden fontSize="small" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}>
              {label}
            </ListItemText>
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

> `ListItemButton` accepts `href` and renders an `<a>` (it forwards to `ButtonBase`). Do not add `component={Link}`.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/_components/QuickNav.tsx
git commit -m "feat(dashboard): add QuickNav tool navigation component"
```

---

## Task 4: Rewrite the dashboard page to layout B

**Files:**
- Modify: `src/app/dashboard/[academicYear]/[semester]/page.tsx`

This task replaces the entire body of the file. It removes `QuickStats`, `QuickActions`, `HealthIndicators`, `SummaryInfo`, `StatCard`, `QuickActionButton`, `InfoItem`, `ReadinessSection`, the `DashboardHeader` config fetch, and the `StatsSkeleton`/`SummarySkeleton` helpers. It keeps `ChartsSection`, `TeacherWorkloadChart`, `SubjectDistributionChart`, and `ChartsSkeleton`.

- [ ] **Step 1: Replace the file contents**

Overwrite `src/app/dashboard/[academicYear]/[semester]/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { dashboardRepository } from "@/features/dashboard/infrastructure/repositories/dashboard.repository";
import {
  calculateTeacherWorkload,
  calculateSubjectDistribution,
} from "@/features/dashboard/domain/services/dashboard-stats.service";
import type { semester } from "@/prisma/generated/client";
import TeacherWorkloadChart from "../../_components/TeacherWorkloadChart";
import SubjectDistributionChart from "../../_components/SubjectDistributionChart";
import { ActionCenter } from "../../_components/ActionCenter";
import { QuickNav } from "../../_components/QuickNav";

export const metadata: Metadata = {
  title: "Dashboard - ภาพรวมภาคเรียน",
  description: "ภาพรวมข้อมูลตารางเรียนและสถิติของภาคเรียน",
};

function InvalidParam({ message }: { message: string }) {
  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3, borderColor: "error.light", borderWidth: 1, borderStyle: "solid" }}>
        <Typography color="error" fontWeight={700}>
          ข้อผิดพลาด
        </Typography>
        <Typography color="error.main">{message}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          กรุณาเลือกภาคเรียนจากหน้าหลัก
        </Typography>
      </Paper>
    </Box>
  );
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ academicYear: string; semester: string }>;
}) {
  const { academicYear: yearStr, semester: semStr } = await params;
  const year = parseInt(yearStr, 10);
  const semester = parseInt(semStr, 10) as 1 | 2;
  const semesterAndyear = `${semester}-${year}`;

  if (isNaN(year) || year < 2500 || year > 2600) {
    return <InvalidParam message={`ปีการศึกษาไม่ถูกต้อง (${yearStr})`} />;
  }
  if (semester !== 1 && semester !== 2) {
    return <InvalidParam message={`ภาคเรียนไม่ถูกต้อง (${semStr})`} />;
  }

  const semesterEnum = `SEMESTER_${semester}` as semester;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 3 }}>
      <Box>
        <Typography variant="h4" fontWeight={800}>
          ภาพรวมภาคเรียน
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ภาคเรียนที่ {semester}/{year}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
        <Box sx={{ flex: 2, minWidth: 0 }}>
          <Suspense fallback={<ActionCenterSkeleton />}>
            <ActionCenter
              semesterAndyear={semesterAndyear}
              year={year}
              semester={semester}
              semesterEnum={semesterEnum}
            />
          </Suspense>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <QuickNav year={year} semester={semester} />
        </Box>
      </Box>

      <Suspense fallback={<ChartsSkeleton />}>
        <ChartsSection year={year} semesterEnum={semesterEnum} />
      </Suspense>
    </Box>
  );
}

function ActionCenterSkeleton() {
  return (
    <Paper sx={{ p: 2.75 }}>
      <Box sx={{ height: 28, width: 180, bgcolor: "grey.200", borderRadius: 1, mb: 2 }} />
      <Stack spacing={1.25}>
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ height: 70, borderRadius: 2, bgcolor: "grey.100" }} />
        ))}
      </Stack>
    </Paper>
  );
}

function ChartsSkeleton() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
      {[1, 2].map((i) => (
        <Paper key={i} sx={{ p: 3 }}>
          <Box sx={{ height: 24, width: 160, bgcolor: "grey.200", borderRadius: 1, mb: 2 }} />
          <Stack spacing={1.5}>
            {[1, 2, 3].map((j) => (
              <Box key={j} sx={{ height: 40, bgcolor: "grey.100", borderRadius: 1 }} />
            ))}
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}

async function ChartsSection({
  year,
  semesterEnum,
}: {
  year: number;
  semesterEnum: semester;
}) {
  const [schedules, teachers, subjects] = await Promise.all([
    dashboardRepository.getScheduleStatsData(year, semesterEnum),
    dashboardRepository.getTeachersBasic(),
    dashboardRepository.getSubjectsBasic(),
  ]);
  const teacherWorkload = calculateTeacherWorkload(schedules, teachers).slice(0, 10);
  const subjectDistribution = calculateSubjectDistribution(schedules, subjects).slice(0, 10);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
      <TeacherWorkloadChart workload={teacherWorkload} />
      <SubjectDistributionChart distribution={subjectDistribution} />
    </Box>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS. If `TeacherWorkloadChart`/`SubjectDistributionChart` props differ, match the existing prop names (the old `ChartsSection` passed `workload`/`distribution` — keep those).

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: PASS — no unused-import or no-explicit-any errors in the touched files.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/[academicYear]/[semester]/page.tsx
git commit -m "feat(dashboard): rewrite semester dashboard to action-first MUI layout"
```

---

## Task 5: Verify build + refresh e2e visual snapshots

**Files:**
- Modify (regenerate): `e2e/visual/critical-ui.spec.ts-snapshots/header--dashboard-*.png`

- [ ] **Step 1: Production build**

Run: `pnpm build`
Expected: PASS. Build succeeds with no RSC serialization error for the dashboard route (`/dashboard/[academicYear]/[semester]`). This is the gate that the plain-`href` MUI buttons did not regress into `component={Link}`.

- [ ] **Step 2: Run the unit suite**

Run: `pnpm test`
Expected: PASS — including the 7 `action-items.service` tests. No previously-green test breaks (the deleted `StatCard`/`SummaryInfo` had no unit tests).

- [ ] **Step 3: Update visual snapshots for the dashboard**

The dashboard layout changed, so its visual baseline must be regenerated. Start the e2e server in one terminal:
`pnpm dev:e2e`
Then update only the dashboard snapshots:
`pnpm exec playwright test e2e/visual/critical-ui.spec.ts -g dashboard --update-snapshots`
Expected: snapshot PNGs under `e2e/visual/critical-ui.spec.ts-snapshots/header--dashboard-*` are rewritten. Visually inspect the new PNGs to confirm: header, ActionCenter + QuickNav row, charts row — and no leftover stat-card grid.

> If the e2e auth/server is flaky (known issue: `/api/health/db` 404 under dev:e2e), this step may need a running `pnpm dev:e2e` and `SKIP_WEBSERVER=1 pnpm exec playwright test ...`. The build + unit gates are the hard requirements; snapshots can be regenerated separately if the e2e harness is down.

- [ ] **Step 4: Commit**

```bash
git add e2e/visual/critical-ui.spec.ts-snapshots
git commit -m "test(dashboard): refresh visual snapshots for redesigned dashboard"
```

---

## Self-Review Notes

- **Spec coverage:** Header (Task 4), ActionCenter consolidating readiness/conflicts/health (Tasks 1–2), QuickNav with MUI icons (Task 3), Charts kept (Task 4), cut sections removed (Task 4), MUI/theme + no emoji + no Tailwind (Tasks 2–4), Suspense streaming preserved (Task 4), empty state (Task 2), build/lint/typecheck/test gates (Tasks 2–5). All spec sections map to a task.
- **Type consistency:** `ActionItem`/`ActionItemInputs`/`ActionSeverity` defined in Task 1 are imported unchanged in Task 2. `buildActionItems` input shape matches the return shapes of `detectConflicts`, `countClassCompletion`, `countTeachersWithSchedules`, and `PublishReadinessResult`.
- **Known risks:** exact prop names of the two chart components and the precise nullable return of `getPublishReadiness` are verified at typecheck time (Steps 2 of Tasks 2/4); both reuse calls the old page already made.
```
