# Break System Rework Design
**Date**: 2026-05-03  
**Author**: Napat Phobutdee  
**Status**: Draft

---

## Overview

Replace the hardcoded Junior/Senior break system with a fully customizable break model that supports:

- **N freeform break groups** with custom labels, colors, and grade assignments
- **N break definitions per day** (morning break, staggered lunches, afternoon break, etc.)
- **Per-group durations and slot positions**
- **First-class grid rendering** — breaks display with color and label like subjects, not grey placeholders

Default preset: Junior (ม.1-3) and Senior (ม.4-6) with the current timing, so existing behavior is preserved out of the box.

---

## Section 1: Data Model

### New Prisma Tables

#### `break_group`

Stores named groups of grades that share the same break schedule.

| Column | Type | Description |
|--------|------|-------------|
| `BreakGroupID` | Int (PK, autoincrement) | Primary key |
| `Name` | String | Internal key: `"junior"`, `"senior"`, `"custom-1"` |
| `Label` | String | Display label: `"ม.ต้น"`, `"กลุ่ม ก"` |
| `Color` | String | Hex color for grid display, default `"#9E9E9E"` |
| `ConfigID` | String (FK → table_config) | Scoped to a semester config |

Constraints:
- `@@unique([ConfigID, Name])` — one group name per config
- `@@index([ConfigID])`
- `onDelete: Cascade` from `table_config`

#### `break_group_grade`

Junction table linking break groups to grade levels.

| Column | Type | Description |
|--------|------|-------------|
| `BreakGroupGradeID` | Int (PK, autoincrement) | Primary key |
| `BreakGroupID` | Int (FK → break_group) | Which group |
| `GradeID` | String (FK → gradelevel) | Which grade |

Constraints:
- `@@unique([BreakGroupID, GradeID])` — a grade can only be in one group per break_group
- `@@index([BreakGroupID])`, `@@index([GradeID])`
- `onDelete: Cascade` from both `break_group` and `gradelevel`

### Enum Migration

```
// Current enum
enum breaktime {
  BREAK_JUNIOR
  BREAK_SENIOR
  BREAK_BOTH
  NOT_BREAK
}

// Target enum (after migration)
enum breaktime {
  BREAK
  NOT_BREAK
}
```

Migration strategy:
1. Add `BREAK` value to enum (Phase 1)
2. New timeslots use `BREAK` only
3. Migrate existing data: `BREAK_JUNIOR | BREAK_SENIOR | BREAK_BOTH` → `BREAK` (Phase 3)
4. Remove deprecated values from enum (Phase 3)

### Break Definitions in `table_config.Config` JSON

Break definitions are stored in the `table_config.Config` JSON field alongside existing config data.

```typescript
type BreakDefinition = {
  id: string;          // unique within config: "morning-break", "lunch-junior", "lunch-senior"
  label: string;       // display: "พักเช้า", "พักเที่ยง ม.ต้น"
  slotNumber: number;  // break is inserted BEFORE this period number
  duration: number;    // minutes
  color: string;       // hex color for grid rendering
  groups: string[];    // break_group.Name references, or ["*"] for all groups
};
```

Config JSON shape:
```json
{
  "Days": ["MON","TUE","WED","THU","FRI"],
  "StartTime": "08:30",
  "Duration": 50,
  "TimeslotPerDay": 8,
  "breakDefinitions": [
    { "id": "morning-break", "label": "พักเช้า", "slotNumber": 3, "duration": 10, "color": "#FF9800", "groups": ["*"] },
    { "id": "lunch-junior", "label": "พักเที่ยง ม.ต้น", "slotNumber": 4, "duration": 50, "color": "#4CAF50", "groups": ["junior"] },
    { "id": "lunch-senior", "label": "พักเที่ยง ม.ปลาย", "slotNumber": 5, "duration": 50, "color": "#2196F3", "groups": ["senior"] }
  ]
}
```

### Fields Replaced

| Current Field | Replaced By |
|---|---|
| `BreakTimeslots.Junior` (number) | `breakDefinitions[]` entry with `groups: ["junior"]` |
| `BreakTimeslots.Senior` (number) | `breakDefinitions[]` entry with `groups: ["senior"]` |
| `BreakDuration` (number) | Per-definition `duration` field |
| `HasMinibreak` (boolean) | Existence of a break definition with `groups: ["*"]` |
| `MiniBreak.SlotNumber` (number) | Break definition `slotNumber` |
| `MiniBreak.Duration` (number) | Break definition `duration` |

Old fields will be removed in Phase 3 after all consumers are migrated.

---

## Section 2: Break Configuration UI

The `TimeslotConfigurationStep` wizard panel is restructured into three sub-panels.

### Panel A — Break Groups

Card-based list of break groups. Each card shows:
- Color dot + editable label
- Chip list of assigned grade IDs (e.g. `M1-1`, `M1-2`, `M1-3`)
- Edit button to modify label, color, or grade assignments
- "Default" badge for the pre-filled Junior/Senior groups

Footer: `＋ เพิ่มกลุ่มพัก` button to add a custom group.

When editing a group, the admin picks from available grades (multi-select). A grade cannot belong to more than one group within the same config.

### Panel B — Break Definitions

Card-based list of break definitions. Each card shows:
- Numbered label with group color (e.g. `① พักเช้า`)
- Three fields in a grid: slot position ("หลังคาบที่"), duration (minutes), group selector
- Delete button
- Group selector options: "ทุกกลุ่ม ✱" for `["*"]`, or specific group names

Footer: `＋ เพิ่มช่วงพัก` button.

### Panel C — Schedule Preview

Side-by-side day timelines, one per break group. Each timeline shows:
- Class periods in blue with period number and time range
- Break slots rendered with the break's color and label (e.g. green "พักเที่ยง" bar)
- Universal breaks (like morning break) appear in both timelines

This replaces the current single-timeline preview.

### Validation Rules

- Every grade must belong to exactly one break group (warn if unassigned grades exist)
- Break definitions cannot have overlapping slot positions for the same group
- Duration must be ≥ 5 minutes
- Slot number must be within `1..TimeslotPerDay`
- At least one break definition must exist

---

## Section 3: Timeslot Generation Service

### New `generateTimeslots()` Logic

```typescript
function generateTimeslots(config: NewTimeslotConfig): timeslot[] {
  const breaksBySlot = groupBy(config.breakDefinitions, d => d.slotNumber);
  
  for (const day of config.Days) {
    let slotStart = parseTime(config.StartTime);
    
    for (let period = 1; period <= config.TimeslotPerDay; period++) {
      // Insert breaks BEFORE this period
      const breaksHere = breaksBySlot[period] ?? [];
      for (const brk of breaksHere) {
        slotStart = addMinutes(slotStart, brk.duration);
      }
      
      // Determine if a break follows this period
      const hasBreakAfter = breaksBySlot[period + 1]?.length > 0;
      
      // Create timeslot
      const endTime = addMinutes(slotStart, config.Duration);
      timeslots.push({
        TimeslotID: generateTimeslotId(semester, year, day, period),
        Breaktime: hasBreakAfter ? "BREAK" : "NOT_BREAK",
        StartTime: slotStart,
        EndTime: endTime,
        DayOfWeek: day,
        AcademicYear: year,
        Semester: semester,
      });
      
      slotStart = endTime;
    }
  }
  return timeslots;
}
```

Key differences from current implementation:
- No special-casing for `HasMinibreak` — mini-breaks are just break definitions with `groups: ["*"]`
- No `calculateBreaktime()` function needed — the `BREAK` vs `NOT_BREAK` decision is purely positional
- Break duration no longer affects timeslot `EndTime` — breaks are gaps *between* timeslots, not timeslots themselves

### `generatePreviewSlots()` Update

The preview service in `timeslot-config.service.ts` is updated to:
- Accept `breakDefinitions[]` instead of `BreakTimeslots` + `MiniBreak`
- Return per-group previews (one `PreviewSlot[]` per break group)
- Break slots use the definition's `label` and `color`

### `PreviewSlotType` Simplification

```typescript
// Before
type PreviewSlotType = "class" | "lunch-junior" | "lunch-senior" | "lunch-both" | "mini-break";

// After
type PreviewSlotType = "class" | "break";
```

Break identity comes from the `BreakDefinition` metadata, not the slot type enum.

---

## Section 4: Consumer Migration

### Files Requiring No Changes (~6 files)

These only check `!== "NOT_BREAK"` and continue to work:

- `src/features/arrange/application/actions/validate-drop.action.ts`
- `src/features/arrange/application/actions/auto-arrange.action.ts`
- `src/features/schedule-arrangement/domain/services/conflict-resolver.service.ts`
- `src/features/schedule-arrangement/application/actions/conflict-resolution.actions.ts`
- `src/features/lock/domain/services/lock-validation.service.ts`
- `src/app/schedule/[academicYear]/[semester]/arrange/@grid/page.tsx`

### Files Requiring Migration (~9 files)

| File | Change Required |
|------|----------------|
| `timeslot.service.ts` | Rewrite `generateTimeslots()` and `calculateBreaktime()` |
| `timeslot-config.service.ts` | Rewrite `generatePreviewSlots()` for per-group previews |
| `timeslot.schemas.ts` | New schema with `breakDefinitions[]` replacing old fields |
| `TimeslotConfigurationStep.tsx` | Full rewrite — 3-panel UI |
| `student-table/component/Timeslot.tsx` | Replace `shouldShowBreak()` with config-based lookup |
| `teacher-table/component/Timeslot.tsx` | Replace `isBreakSlot()` with config-based lookup |
| `all-timeslot/AllTimeslotClient.tsx` | Replace enum comparisons with config lookup |
| `shared/timeSlot.ts` | Update `BREAK_TYPES` set, `BreakSlot` type |
| `export/teacher-timetable-excel.ts` | Use config-based labels for break cells |

### Display Component Strategy

Components that render the timetable grid need to know *which* break applies to *which* grade. Strategy:

1. Load `table_config.Config` JSON (already available in most page contexts)
2. Extract `breakDefinitions[]`
3. For a given grade's timeslot, find matching break definitions where `groups` includes the grade's break group name (or `"*"`)
4. Render with the definition's `label` and `color`

This replaces the current pattern of switching on `BREAK_JUNIOR | BREAK_SENIOR | BREAK_BOTH` enum values.

---

## Section 5: Seed Data Updates

### Seed Config Template

```typescript
const configTemplate = {
  Days: ["MON", "TUE", "WED", "THU", "FRI"],
  StartTime: "08:30",
  Duration: 50,
  TimeslotPerDay: 8,
  breakDefinitions: [
    { id: "morning-break", label: "พักเช้า", slotNumber: 3, duration: 10, color: "#FF9800", groups: ["*"] },
    { id: "lunch-junior", label: "พักเที่ยง ม.ต้น", slotNumber: 4, duration: 50, color: "#4CAF50", groups: ["junior"] },
    { id: "lunch-senior", label: "พักเที่ยง ม.ปลาย", slotNumber: 5, duration: 50, color: "#2196F3", groups: ["senior"] },
  ],
};
```

### Break Groups Seeded

```typescript
const breakGroups = [
  { Name: "junior", Label: "ม.ต้น", Color: "#4CAF50", grades: ["M1-1","M1-2","M1-3","M2-1","M2-2","M2-3","M3-1","M3-2","M3-3"] },
  { Name: "senior", Label: "ม.ปลาย", Color: "#2196F3", grades: ["M4-1","M4-2","M4-3","M5-1","M5-2","M5-3","M6-1","M6-2","M6-3"] },
];
```

---

## Section 6: Migration Path

### Phase 1 — Additive (no breaking changes)

1. Create `break_group` and `break_group_grade` tables (Prisma migration)
2. Add `BREAK` value to `breaktime` enum
3. Add `breakDefinitions` field to `ConfigData` type (optional, for backward compat)
4. Build Break Groups management in wizard (Panel A)
5. Build Break Definitions management in wizard (Panel B)
6. Update `generateTimeslots()` to use `breakDefinitions[]`, emit `BREAK` enum value
7. Update `generatePreviewSlots()` for per-group previews (Panel C)
8. Update `createTimeslotsSchema` with new validation

### Phase 2 — Migrate consumers

9. Update `student-table/Timeslot.tsx` — config-based break display
10. Update `teacher-table/Timeslot.tsx` — config-based break display
11. Update `AllTimeslotClient.tsx` — config-based break check
12. Update `shared/timeSlot.ts` — simplify `BREAK_TYPES`, update `BreakSlot` type
13. Update `teacher-timetable-excel.ts` — config-based labels
14. Update seed data (`seed-2568.ts`, `seed-semesters` route)

### Phase 3 — Cleanup

15. Data migration: `UPDATE timeslot SET "Breaktime" = 'BREAK' WHERE "Breaktime" IN ('BREAK_JUNIOR','BREAK_SENIOR','BREAK_BOTH')`
16. Remove `BREAK_JUNIOR`, `BREAK_SENIOR`, `BREAK_BOTH` from Prisma enum
17. Remove deprecated fields from `ConfigData` type: `BreakTimeslots`, `BreakDuration`, `HasMinibreak`, `MiniBreak`
18. Remove deprecated fields from `DEFAULT_CONFIG` and `CONFIG_CONSTRAINTS`
19. Remove `calculateBreaktime()` function

---

## Section 7: Default Config Preset

To preserve backward compatibility, the wizard pre-fills with the current Junior/Senior setup:

```typescript
const DEFAULT_BREAK_GROUPS = [
  { Name: "junior", Label: "ม.ต้น (ม.1-3)", Color: "#4CAF50" },
  { Name: "senior", Label: "ม.ปลาย (ม.4-6)", Color: "#2196F3" },
];

const DEFAULT_BREAK_DEFINITIONS: BreakDefinition[] = [
  { id: "lunch-junior", label: "พักเที่ยง ม.ต้น", slotNumber: 4, duration: 50, color: "#4CAF50", groups: ["junior"] },
  { id: "lunch-senior", label: "พักเที่ยง ม.ปลาย", slotNumber: 5, duration: 50, color: "#2196F3", groups: ["senior"] },
];
```

Mini-break is **not** included in the default preset (matching current `HasMinibreak: false` default). Admin can add one via the "＋ เพิ่มช่วงพัก" button.

---

## Spec Self-Review

- ✅ No placeholders or TBDs
- ✅ Break group names are unique per ConfigID (enforced by DB constraint)
- ✅ Grade-to-group assignment is enforced by junction table FK integrity
- ✅ Backward compatibility: existing `!== "NOT_BREAK"` checks work unchanged
- ✅ Migration is phased — no big-bang breaking change
- ✅ Default preset reproduces current Junior/Senior behavior exactly
- ✅ `breakDefinitions` schema validated by Valibot at application layer
- ✅ Old enum values kept during migration, removed only in Phase 3
- ✅ Seed data updated to match new model
- ⚠️ `table_config.Config` JSON has no DB-level validation for `breakDefinitions` — application-layer Valibot schema is the enforcement mechanism (consistent with how Config JSON is already used)
