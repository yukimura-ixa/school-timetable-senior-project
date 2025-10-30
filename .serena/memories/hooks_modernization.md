# Hooks Modernization (Next.js 16 Patterns)

## Structure

All data fetching hooks moved from `src/app/_hooks/` to `src/hooks/` following Next.js 16 best practices.

## Naming Convention

- **Files:** kebab-case (e.g., `use-grade-levels.ts`)
- **Exports:** camelCase (e.g., `useGradeLevels`)
- **Pattern:** `use-{entity}-{action}.ts` โ†' `use{Entity}{Action}()`

## Available Hooks

### Basic (No Parameters)
- `useGradeLevels()` โ†' `gradelevel[]`
- `useSubjects()` โ†' `subject[]`
- `useTeachers()` โ†' `teacher[]`
- `useRooms()` โ†' `room[]`

### Parameterized
- `useTimeslots(academicYear, semester)` โ†' `timeslot[]`
- `useTeacherAssignments(teacherId)` โ†' `teachers_responsibility[]`
- `useLockedSchedules(academicYear, semester)` โ†' `GroupedLockedSchedule[]`
- `useClassSchedules(year, semester, teacherId?, gradeId?)` โ†' `class_schedule[]`

## Import Pattern

```typescript
// โœ… Modern (barrel export)
import { useGradeLevels, useSubjects } from "@/hooks"

// โŒ Old (deprecated)
import { useGradeLevelData } from "@/app/_hooks/gradeLevelData"
```

## Implementation Details

All hooks:
- Use `"use client"` directive
- Wrap server actions with SWR
- Return consistent interface: `{ data, isLoading, error, mutate }`
- Include JSDoc documentation
- Handle ActionResult<T> unwrapping

## Architecture

Location: `src/hooks/` (shared location)
Rationale: Cross-cutting concerns used across multiple features
Feature-specific hooks: Should go in `src/features/*/presentation/hooks/`

## Completed Migration

- โœ… 8 hooks migrated
- โœ… 12 components updated
- โœ… `src/app/_hooks/` directory removed
- โœ… TypeScript compilation passing
- โœ… Build successful (no hook-related errors)
