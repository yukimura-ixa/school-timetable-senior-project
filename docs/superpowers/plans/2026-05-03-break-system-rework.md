# Break System Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded Junior/Senior break system with a customizable N-group, N-break model.

**Architecture:** Hybrid DB approach — new `break_group` + `break_group_grade` tables for group definitions (FK integrity), break timing config in `table_config.Config` JSON as `breakDefinitions[]`. Simplify `breaktime` enum to `BREAK | NOT_BREAK`. Phased migration preserving backward compat.

**Tech Stack:** Prisma (PostgreSQL), Valibot schemas, React/MUI components, Vitest

**Spec:** `docs/superpowers/specs/2026-05-03-break-system-rework-design.md`

---

### Task 1: Prisma Schema — Add New Tables and Enum Value

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add `BREAK` to enum and new models**

Add to `prisma/schema.prisma`:

```prisma
// Update enum — add BREAK before existing values
enum breaktime {
  BREAK
  BREAK_JUNIOR
  BREAK_SENIOR
  BREAK_BOTH
  NOT_BREAK
}

// Add after timeslot model
model break_group {
  BreakGroupID    Int                @id @default(autoincrement())
  Name            String
  Label           String
  Color           String             @default("#9E9E9E")
  ConfigID        String
  table_config    table_config       @relation(fields: [ConfigID], references: [ConfigID], onDelete: Cascade)
  grades          break_group_grade[]

  @@unique([ConfigID, Name], map: "break_group_config_name_unique")
  @@index([ConfigID])
}

model break_group_grade {
  BreakGroupGradeID Int          @id @default(autoincrement())
  BreakGroupID      Int
  GradeID           String
  break_group       break_group  @relation(fields: [BreakGroupID], references: [BreakGroupID], onDelete: Cascade)
  gradelevel        gradelevel   @relation(fields: [GradeID], references: [GradeID], onDelete: Cascade)

  @@unique([BreakGroupID, GradeID])
  @@index([BreakGroupID])
  @@index([GradeID])
}
```

Also add relation fields to existing models:
- `table_config`: add `break_groups break_group[]`
- `gradelevel`: add `break_group_grades break_group_grade[]`

- [ ] **Step 2: Generate migration**

Run: `pnpm prisma migrate dev --name add-break-groups`
Expected: Migration created, client regenerated.

- [ ] **Step 3: Verify generated client**

Run: `pnpm typecheck`
Expected: PASS (no type errors from new models)

- [ ] **Step 4: Commit**

```bash
git add prisma/
git commit -m "feat(schema): add break_group tables and BREAK enum value"
```

---

### Task 2: Break Definition Types and Valibot Schema

**Files:**
- Create: `src/features/timeslot/domain/models/break.types.ts`
- Modify: `src/features/timeslot/application/schemas/timeslot.schemas.ts`
- Modify: `src/features/config/domain/constants/config.constants.ts`

- [ ] **Step 1: Create break type definitions**

Create `src/features/timeslot/domain/models/break.types.ts`:

```typescript
/**
 * Domain types for the customizable break system.
 * Break definitions are stored in table_config.Config JSON.
 * Break groups are stored in the break_group DB table.
 */

/** A single break definition in the config JSON */
export type BreakDefinition = {
  id: string;
  label: string;
  slotNumber: number;
  duration: number;
  color: string;
  groups: string[]; // break_group.Name refs, or ["*"] for all
};

/** Default break groups preset */
export const DEFAULT_BREAK_GROUPS = [
  { Name: "junior", Label: "ม.ต้น (ม.1-3)", Color: "#4CAF50" },
  { Name: "senior", Label: "ม.ปลาย (ม.4-6)", Color: "#2196F3" },
] as const;

/** Default break definitions preset */
export const DEFAULT_BREAK_DEFINITIONS: BreakDefinition[] = [
  { id: "lunch-junior", label: "พักเที่ยง ม.ต้น", slotNumber: 4, duration: 50, color: "#4CAF50", groups: ["junior"] },
  { id: "lunch-senior", label: "พักเที่ยง ม.ปลาย", slotNumber: 5, duration: 50, color: "#2196F3", groups: ["senior"] },
];

/** Grade IDs for default junior group */
export const DEFAULT_JUNIOR_GRADES = [
  "M1-1", "M1-2", "M1-3", "M2-1", "M2-2", "M2-3", "M3-1", "M3-2", "M3-3",
];

/** Grade IDs for default senior group */
export const DEFAULT_SENIOR_GRADES = [
  "M4-1", "M4-2", "M4-3", "M5-1", "M5-2", "M5-3", "M6-1", "M6-2", "M6-3",
];
```

- [ ] **Step 2: Add Valibot schema for break definitions**

In `src/features/timeslot/application/schemas/timeslot.schemas.ts`, add:

```typescript
export const breakDefinitionSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1, "รหัสช่วงพักห้ามว่าง")),
  label: v.pipe(v.string(), v.minLength(1, "ชื่อช่วงพักห้ามว่าง")),
  slotNumber: v.pipe(v.number(), v.minValue(1, "หมายเลขคาบต้องมากกว่า 0")),
  duration: v.pipe(v.number(), v.minValue(5, "ระยะเวลาพักต้องไม่น้อยกว่า 5 นาที")),
  color: v.pipe(v.string(), v.minLength(1)),
  groups: v.array(v.string(), "ต้องระบุกลุ่มอย่างน้อย 1 กลุ่ม"),
});
```

Add `breakDefinitions` as an optional field to `createTimeslotsSchema` (optional for backward compat during Phase 1):

```typescript
breakDefinitions: v.optional(v.array(breakDefinitionSchema)),
```

- [ ] **Step 3: Update ConfigData type**

In `src/features/config/domain/constants/config.constants.ts`, add to the `ConfigData` type:

```typescript
breakDefinitions?: BreakDefinition[];
```

Add the import for `BreakDefinition` from the new types file.

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/timeslot/domain/models/ src/features/timeslot/application/schemas/ src/features/config/
git commit -m "feat(types): add BreakDefinition types and Valibot schema"
```

---

### Task 3: Rewrite Timeslot Generation Service (TDD)

**Files:**
- Modify: `src/features/timeslot/domain/services/timeslot.service.ts`
- Modify: `src/features/timeslot/domain/services/timeslot.service.test.ts`

- [ ] **Step 1: Write failing tests for new `generateTimeslotsV2`**

Add new describe block in `timeslot.service.test.ts`:

```typescript
describe("generateTimeslotsV2", () => {
  const baseConfig = {
    AcademicYear: 2568,
    Semester: "SEMESTER_1" as const,
    TimeslotPerDay: 4,
    Duration: 50,
    StartTime: "08:30",
    Days: ["MON" as const],
    breakDefinitions: [
      { id: "lunch", label: "พักเที่ยง", slotNumber: 3, duration: 50, color: "#4CAF50", groups: ["junior"] },
    ],
  };

  it("generates correct number of timeslots", () => {
    const result = generateTimeslotsV2(baseConfig);
    expect(result).toHaveLength(4);
  });

  it("marks timeslot before break as BREAK", () => {
    const result = generateTimeslotsV2(baseConfig);
    // Break at slot 3 means slot 2 should be BREAK (break follows it)
    expect(result[1]!.Breaktime).toBe("BREAK");
  });

  it("inserts time gap for break between periods", () => {
    const result = generateTimeslotsV2(baseConfig);
    // P2 ends at 10:10, break is 50min, P3 starts at 11:00
    expect(result[2]!.StartTime.getHours()).toBe(11);
    expect(result[2]!.StartTime.getMinutes()).toBe(0);
  });

  it("handles multiple breaks", () => {
    const config = {
      ...baseConfig,
      breakDefinitions: [
        { id: "mini", label: "พักเช้า", slotNumber: 2, duration: 10, color: "#FF9800", groups: ["*"] },
        { id: "lunch", label: "พักเที่ยง", slotNumber: 3, duration: 50, color: "#4CAF50", groups: ["junior"] },
      ],
    };
    const result = generateTimeslotsV2(config);
    // P1 ends 09:20, 10min gap, P2 starts 09:30
    expect(result[1]!.StartTime.getMinutes()).toBe(30);
  });

  it("all timeslots use simplified BREAK enum", () => {
    const result = generateTimeslotsV2(baseConfig);
    result.forEach(slot => {
      expect(["BREAK", "NOT_BREAK"]).toContain(slot.Breaktime);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- src/features/timeslot/domain/services/timeslot.service.test.ts`
Expected: FAIL — `generateTimeslotsV2` not defined

- [ ] **Step 3: Implement `generateTimeslotsV2`**

Add to `timeslot.service.ts`:

```typescript
import type { BreakDefinition } from "../models/break.types";

type TimeslotsV2Config = {
  AcademicYear: number;
  Semester: semester;
  Days: day_of_week[];
  StartTime: string;
  Duration: number;
  TimeslotPerDay: number;
  breakDefinitions: BreakDefinition[];
};

export function generateTimeslotsV2(config: TimeslotsV2Config): timeslot[] {
  const timeslots: timeslot[] = [];
  const breaksBySlot = new Map<number, BreakDefinition[]>();

  for (const brk of config.breakDefinitions) {
    const existing = breaksBySlot.get(brk.slotNumber) ?? [];
    existing.push(brk);
    breaksBySlot.set(brk.slotNumber, existing);
  }

  for (const day of config.Days) {
    let slotStart = new Date(`2024-01-01T${config.StartTime}:00`);

    for (let period = 1; period <= config.TimeslotPerDay; period++) {
      // Insert break gaps before this period
      const breaksBeforePeriod = breaksBySlot.get(period) ?? [];
      for (const brk of breaksBeforePeriod) {
        slotStart.setMinutes(slotStart.getMinutes() + brk.duration);
      }

      const endTime = new Date(slotStart);
      endTime.setMinutes(endTime.getMinutes() + config.Duration);

      // A timeslot is BREAK if any break definition targets the next slot
      const hasBreakAfter = breaksBySlot.has(period + 1);

      timeslots.push({
        TimeslotID: generateTimeslotId(config.Semester, config.AcademicYear, day, period),
        DayOfWeek: day,
        AcademicYear: config.AcademicYear,
        Semester: config.Semester,
        StartTime: slotStart,
        EndTime: endTime,
        Breaktime: hasBreakAfter ? ("BREAK" as breaktime) : breaktimeEnum.NOT_BREAK,
      });

      slotStart = new Date(endTime);
    }
  }

  return timeslots;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- src/features/timeslot/domain/services/timeslot.service.test.ts`
Expected: All tests PASS (old tests still pass too)

- [ ] **Step 5: Commit**

```bash
git add src/features/timeslot/domain/services/
git commit -m "feat(timeslot): add generateTimeslotsV2 with breakDefinitions support"
```

---

### Task 4: Rewrite Preview Service (TDD)

**Files:**
- Modify: `src/features/timeslot/domain/services/timeslot-config.service.ts`
- Create: `src/features/timeslot/domain/services/timeslot-config.service.test.ts`

- [ ] **Step 1: Write tests for new preview generation**

Create `timeslot-config.service.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { generatePreviewSlotsV2 } from "./timeslot-config.service";

describe("generatePreviewSlotsV2", () => {
  const config = {
    StartTime: "08:30",
    Duration: 50,
    TimeslotPerDay: 4,
    breakDefinitions: [
      { id: "lunch", label: "พักเที่ยง", slotNumber: 3, duration: 50, color: "#4CAF50", groups: ["junior"] },
    ],
  };

  it("returns class and break slots", () => {
    const result = generatePreviewSlotsV2(config);
    const types = result.map(s => s.type);
    expect(types).toContain("class");
    expect(types).toContain("break");
  });

  it("break slot has correct label and color", () => {
    const result = generatePreviewSlotsV2(config);
    const breakSlot = result.find(s => s.type === "break");
    expect(breakSlot?.label).toBe("พักเที่ยง");
    expect(breakSlot?.color).toBe("#4CAF50");
  });

  it("calculates correct times with break gap", () => {
    const result = generatePreviewSlotsV2(config);
    const p3 = result.find(s => s.type === "class" && s.period === 3);
    // P2 ends 10:10, break 50min, P3 starts 11:00
    expect(p3?.startTime).toBe("11:00");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- src/features/timeslot/domain/services/timeslot-config.service.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `generatePreviewSlotsV2`**

Add to `timeslot-config.service.ts`:

```typescript
import type { BreakDefinition } from "../models/break.types";

export type PreviewSlotV2 = {
  period: number;
  label: string;
  startTime: string;
  endTime: string;
  type: "class" | "break";
  duration: number;
  color?: string;
  breakId?: string;
  groups?: string[];
};

type PreviewV2Config = {
  StartTime: string;
  Duration: number;
  TimeslotPerDay: number;
  breakDefinitions: BreakDefinition[];
};

export function generatePreviewSlotsV2(config: PreviewV2Config): PreviewSlotV2[] {
  const [hours, minutes] = config.StartTime.split(":").map(Number);
  if (hours === undefined || minutes === undefined) return [];

  const slots: PreviewSlotV2[] = [];
  let currentTime = hours * 60 + minutes;
  const breaksBySlot = new Map<number, BreakDefinition[]>();
  for (const brk of config.breakDefinitions) {
    const existing = breaksBySlot.get(brk.slotNumber) ?? [];
    existing.push(brk);
    breaksBySlot.set(brk.slotNumber, existing);
  }

  for (let period = 1; period <= config.TimeslotPerDay; period++) {
    // Insert breaks before this period
    const breaksHere = breaksBySlot.get(period) ?? [];
    for (const brk of breaksHere) {
      const brkStart = formatTime(currentTime);
      currentTime += brk.duration;
      const brkEnd = formatTime(currentTime);
      slots.push({
        period: period - 1,
        label: brk.label,
        startTime: brkStart,
        endTime: brkEnd,
        type: "break",
        duration: brk.duration,
        color: brk.color,
        breakId: brk.id,
        groups: brk.groups,
      });
    }

    const classStart = formatTime(currentTime);
    currentTime += config.Duration;
    const classEnd = formatTime(currentTime);

    slots.push({
      period,
      label: `คาบที่ ${period}`,
      startTime: classStart,
      endTime: classEnd,
      type: "class",
      duration: config.Duration,
    });
  }

  return slots;
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm test -- src/features/timeslot/domain/services/timeslot-config.service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/timeslot/domain/services/
git commit -m "feat(preview): add generatePreviewSlotsV2 with break definitions"
```

---

### Task 5: Break Group Repository

**Files:**
- Create: `src/features/timeslot/infrastructure/repositories/break-group.repository.ts`

- [ ] **Step 1: Create repository**

```typescript
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@/prisma/generated/client";

export const breakGroupRepository = {
  async findByConfigId(configId: string) {
    return prisma.break_group.findMany({
      where: { ConfigID: configId },
      include: { grades: true },
      orderBy: { BreakGroupID: "asc" },
    });
  },

  async createWithGrades(
    data: { Name: string; Label: string; Color: string; ConfigID: string; gradeIds: string[] },
    tx?: PrismaClient,
  ) {
    const client = tx ?? prisma;
    return client.break_group.create({
      data: {
        Name: data.Name,
        Label: data.Label,
        Color: data.Color,
        ConfigID: data.ConfigID,
        grades: {
          create: data.gradeIds.map(gid => ({ GradeID: gid })),
        },
      },
      include: { grades: true },
    });
  },

  async deleteByConfigId(configId: string, tx?: PrismaClient) {
    const client = tx ?? prisma;
    return client.break_group.deleteMany({ where: { ConfigID: configId } });
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/features/timeslot/infrastructure/repositories/
git commit -m "feat(repo): add break_group repository"
```

---

### Task 6: Wire Into createTimeslotsAction

**Files:**
- Modify: `src/features/timeslot/application/actions/timeslot.actions.ts`

- [ ] **Step 1: Update action to use V2 when breakDefinitions present**

In `createTimeslotsAction`, after `generateTimeslots(input)` call, add fallback logic:

```typescript
const timeslots = input.breakDefinitions
  ? generateTimeslotsV2({
      ...input,
      breakDefinitions: input.breakDefinitions,
    })
  : generateTimeslots(input);
```

- [ ] **Step 2: After timeslot creation, create break groups if provided**

Inside the transaction, after `tx.timeslot.createMany`, add:

```typescript
if (input.breakGroups) {
  for (const group of input.breakGroups) {
    await breakGroupRepository.createWithGrades(
      { ...group, ConfigID: configId },
      tx,
    );
  }
}
```

- [ ] **Step 3: Run typecheck and existing tests**

Run: `pnpm typecheck && pnpm test`
Expected: PASS (backward compat — old callers don't pass breakDefinitions)

- [ ] **Step 4: Commit**

```bash
git add src/features/timeslot/application/
git commit -m "feat(action): wire generateTimeslotsV2 into createTimeslotsAction"
```

---

### Task 7: Update TimeslotConfigurationStep UI

**Files:**
- Modify: `src/app/dashboard/_components/TimeslotConfigurationStep.tsx`

This is the largest UI task. The component is rewritten to include:
- Panel A: Break Groups (card list with grade chips, add/edit/delete)
- Panel B: Break Definitions (card list with slot/duration/group fields)
- Panel C: Preview (per-group timelines)

The existing config fields (Days, StartTime, Duration, TimeslotPerDay) remain unchanged.

Replace the "Break Periods" and "Mini Break" sections with the new panels. Keep the state shape compatible with `CreateTimeslotsInput`.

- [ ] **Step 1: Add break state to component**

Add state for break groups and definitions using the defaults:

```typescript
const [breakGroups, setBreakGroups] = useState(DEFAULT_BREAK_GROUPS.map(g => ({ ...g })));
const [breakDefs, setBreakDefs] = useState<BreakDefinition[]>(DEFAULT_BREAK_DEFINITIONS.map(d => ({ ...d })));
```

- [ ] **Step 2: Replace break config panels**

Remove the old "คาบพักกลางวัน" and "พักเล็กระหว่างคาบ" Paper sections. Add new Panel A (groups) and Panel B (definitions) following the mockup layout from the spec.

- [ ] **Step 3: Update preview to use `generatePreviewSlotsV2`**

Replace `generatePreview()` local function with a call to `generatePreviewSlotsV2` and render per-group timelines.

- [ ] **Step 4: Wire breakDefinitions into config output**

In the `useEffect` that calls `setTimeslotConfig`, include `breakDefinitions` and `breakGroups` in the config object.

- [ ] **Step 5: Manual verification**

Run: `pnpm dev`, navigate to semester creation wizard, verify:
- Default Junior/Senior groups appear
- Break definitions render as cards
- Preview shows per-group timelines
- Adding/removing breaks updates preview

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/_components/TimeslotConfigurationStep.tsx
git commit -m "feat(ui): rewrite break config with groups and definitions panels"
```

---

### Task 8: Migrate Display Components (Phase 2)

**Files:**
- Modify: `src/app/dashboard/[academicYear]/[semester]/shared/timeSlot.ts`
- Modify: `src/app/dashboard/[academicYear]/[semester]/student-table/component/Timeslot.tsx`
- Modify: `src/app/dashboard/[academicYear]/[semester]/teacher-table/component/Timeslot.tsx`

- [ ] **Step 1: Update shared `BREAK_TYPES` set**

In `timeSlot.ts`, update:
```typescript
const BREAK_TYPES = new Set(["BREAK", "BREAK_BOTH", "BREAK_JUNIOR", "BREAK_SENIOR"]);
```
(Include old values for backward compat with existing data)

- [ ] **Step 2: Update student-table `shouldShowBreak`**

Replace the enum-matching logic with config-based lookup. The component needs the `breakDefinitions` and `breakGroups` from config to determine which break applies to which grade.

- [ ] **Step 3: Update teacher-table break display**

Replace hardcoded "พักกลางวัน" label with the break definition's `label` from config. Use the break's `color` for styling.

- [ ] **Step 4: Run dev and verify display**

Run: `pnpm dev`, check student and teacher table views.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/
git commit -m "feat(display): migrate timetable grid to config-based break rendering"
```

---

### Task 9: Update Seed Data

**Files:**
- Modify: `prisma/seed-2568.ts`

- [ ] **Step 1: Update config template**

Replace `BreakTimeslots`, `BreakDuration`, `HasMinibreak`, `MiniBreak` with `breakDefinitions` array in the seed config.

- [ ] **Step 2: Seed break_group records**

After creating `table_config`, insert break groups with grade assignments.

- [ ] **Step 3: Run seed and verify**

Run: `pnpm db:seed:clean`
Expected: Seed completes without errors.

- [ ] **Step 4: Commit**

```bash
git add prisma/
git commit -m "feat(seed): update seed data for new break system"
```

---

### Task 10: Full Integration Test

- [ ] **Step 1: Run all tests**

Run: `pnpm test`
Expected: All PASS

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 3: Run build**

Run: `pnpm build`
Expected: PASS

- [ ] **Step 4: Manual E2E smoke test**

Run: `pnpm dev`, create a new semester, verify break groups and definitions work end-to-end.

- [ ] **Step 5: Commit and tag**

```bash
git add -A
git commit -m "feat: break system rework Phase 1+2 complete"
```

---

### Task 11 (Future): Phase 3 Cleanup

> This task is deferred until all existing data has been migrated.

- [ ] Data migration SQL: `UPDATE timeslot SET "Breaktime" = 'BREAK' WHERE "Breaktime" IN ('BREAK_JUNIOR','BREAK_SENIOR','BREAK_BOTH')`
- [ ] Remove deprecated enum values from `schema.prisma`
- [ ] Remove old fields from `ConfigData`, `DEFAULT_CONFIG`, `CONFIG_CONSTRAINTS`
- [ ] Remove `calculateBreaktime()` function
- [ ] Run full test suite
